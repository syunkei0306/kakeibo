import { addGlobalStylesToShadowRoot } from "../lib/GlobalStyles";
import flatpickr from "flatpickr";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";
import { Japanese } from "flatpickr/dist/l10n/ja.js";

import CustomElement from "./CustomElement";
import { formatToHyphenMonth, hyphenToSlash, toDate } from "../lib/Utils.ts";

/**
 * 年月入力の共通コンポーネント
 */
class CustomMonth extends CustomElement {
  value;
  placeholder;
  validationRule;
  invalidMessageDom: HTMLDivElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const template = document.getElementById("custom-month-template") as HTMLTemplateElement;
    if (!template) {
      console.error('custom-month-template not found');
      return;
    }
    const node = template.content.cloneNode(true) as HTMLElement;

    this.value = this.getAttribute("value")!;
    this.placeholder = this.getAttribute("placeholder")!;

    const required = this.getAttribute("required") !== null;
    this.validationRule = { required: required };
    this.invalidMessageDom = node.querySelector(".invalid-message") as HTMLDivElement;
    //ラベルの設定
    this.initializeLabel(node.querySelector("label")!, this.invalidMessageDom);

    //入力欄の設定
    const inputDom = node.querySelector("input") as HTMLInputElement;
    inputDom.id = this.name;
    inputDom.value = this.value;
    inputDom.placeholder = !this.placeholder ? "" : this.placeholder;
    if (this.readonly) {
      inputDom.readOnly = true;
      const calendarButton = node.querySelector("button") as HTMLButtonElement;
      calendarButton.disabled = true;
    }
    if (this.inputClass) {
      inputDom.classList.add(...this.inputClass.split(" "));
    }
    inputDom.addEventListener("focus", (event) => {
      //入力内容からスラッシュを削除
      const value = inputDom.value.replace(/\//g, "");
      inputDom.value = value;
      //選択状態にする
      (event.currentTarget as HTMLInputElement).select();
    });
    inputDom.addEventListener("blur", () => {
      //入力内容から数字以外削除
      const value = inputDom.value.replace(/[^0-9]/g, "");
      if (!value) {
        return;
      }
      if (this.validateDigit(value)) {
        if (!checkMonthOver(value)) {
          inputDom.value = "";
          this.viewErrorMessage("正しい年月を入力してください");
          return;
        }
        const year = value.slice(0, 4);
        const month = value.slice(4, 6);
        inputDom.value = `${year}/${month}`;
      }
    });
    const formatToSlashDate = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = ("00" + (date.getMonth() + 1)).slice(-2);
      return `${yyyy}/${mm}`;
    };
    /**
     * 入力された"月"が12以上じゃないかチェック
     * @param value
     * @returns
     */
    const checkMonthOver = (value: string) => {
      const month = value.slice(4, 6);
      if (month > "12") {
        return false;
      }
      return true;
    };

    //flatpickrの設定
    const option = {
      disableMobile: true,
      allowInput: true,
      clickOpens: false,
      locale: Japanese,
      defaultDate: this.value,
      dateFormat: "Y/m",
      formatDate: (value: Date) => {
        let result;
        //入力された日付がスラッシュなしの6桁文字列かチェック
        if (inputDom.value.length === 6) {
          const year = inputDom.value.slice(0, 4);
          const month = inputDom.value.slice(4, 6);
          result = `${year}/${month}`;
        } else {
          //初期表示時にカレンダーから日付を選択した場合の処理(これがないと表示されないためやむを得ず実装)
          if (inputDom.value.length === 0 && value) {
            result = formatToSlashDate(value);
            return result;
          }
          //入力された日付に、数字とスラッシュ以外が入っていないかチェック
          if (inputDom.value.match(/[^0-9/]/g)) {
            return "";
          }
          //入力された日付からスラッシュを削除した文字列が6桁かチェック
          if (inputDom.value.replace(/[^0-9]/g, "").length !== 6) {
            return "";
          } else {
            //入力された"月"が12以上じゃないかチェック
            const replacedValue = inputDom.value.replace(/[^0-9]/g, "");
            if (!checkMonthOver(replacedValue)) {
              return inputDom.value;
            }
          }
          result = formatToSlashDate(value);
        }
        return result;
      },
      plugins: [
        monthSelectPlugin({
          dateFormat: "Y/m",
        }),
      ],
    };
    const fp = flatpickr(inputDom, option);
    fp.config.onChange.push((date: Date[]) => {
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: date[0],
        })
      );
    });
    node.querySelector(".calendar")!.addEventListener("click", () => {
      fp.open();
    });

    //サーバ側バリデーション結果があれば表示する
    const errors = this.getAttribute("error");
    if (errors != null) {
      console.log(errors);
      const errorMessages = errors.slice(1).slice(0, -1).split(", ");
      errorMessages.forEach((message) => {
        this.viewErrorMessage(message);
      });
    }

    shadow.appendChild(node);

    addGlobalStylesToShadowRoot(this.shadowRoot);
  }

  /**
   * 値を設定
   * @param value 値
   */
  setValue(value: string | null) {
    const inputDom = this.shadowRoot?.querySelector("input");
    inputDom!.value = hyphenToSlash(value) ?? "";
  }

  /**
   * 値を取得
   * @returns 値
   */
  getValue() {
    const inputDom = this.shadowRoot?.querySelector("input");
    return inputDom!.value;
  }

  /**
   * 値を取得（Date を返す、日付として扱えない入力の場合は null を返す）
   * @returns 値
   */
  getDateValue(): Date | null {
    return toDate(this.getValue());
  }

  /**
   * YYYY-MMで値を取得
   */
  getIsoValue(): string | null {
    const date = toDate(this.getValue());
    if (date === null) {
      return null;
    }

    return formatToHyphenMonth(date);
  }

  /**
   * バリデーションチェックを実施
   * @returns エラーが無ければtrue
   */
  validate() {
    //現在表示中のエラーメッセージを消去
    this.resetErrorMessage();

    const inputDom = this.shadowRoot?.querySelector("input");
    const value = inputDom!.value;

    if (this.validationRule.required && !value) {
      this.viewErrorMessage("値を入力してください。");
      return false;
    }
    return true;
  }

  /**
   * 年月のバリデーションチェックを実施
   * @param month
   * @returns エラーが無ければtrue
   */
  validateDigit(month: string) {
    //現在表示中のエラーメッセージを消去
    this.resetErrorMessage();

    if (month === "") {
      //空の時はチェック不要
      return true;
    }
    const inputDom = this.shadowRoot?.querySelector("input");
    const value = month;

    if (value.length !== 6) {
      this.viewErrorMessage("YYYY/MM形式で入力してください");
      inputDom!.value = "";
      return false;
    }
    return true;
  }

  /**
   * 現在表示中のエラーメッセージを消去
   */
  removeValidationMessage() {
    while (this.invalidMessageDom.firstChild) {
      this.invalidMessageDom.removeChild(this.invalidMessageDom.firstChild);
    }
  }

  /**
   * エラーメッセージを画面に表示
   * @param {*} message メッセージ
   */
  viewErrorMessage(message: string) {
    const li = document.createElement("li");
    li.innerText = message;
    this.invalidMessageDom!.appendChild(li);
  }

  /**
   * エラーメッセージの画面表示をリセット
   */
  resetErrorMessage() {
    while (this.invalidMessageDom.firstChild) {
      this.invalidMessageDom.removeChild(this.invalidMessageDom.firstChild);
    }
  }
}

customElements.define("custom-month", CustomMonth);
export default CustomMonth;
