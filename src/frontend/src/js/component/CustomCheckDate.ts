import { addGlobalStylesToShadowRoot } from "../lib/GlobalStyles.ts";
import flatpickr from "flatpickr";
import { Japanese } from "flatpickr/dist/l10n/ja.js";
import CustomElement from "./CustomElement.ts";
import { formatToHyphenDate, hyphenToSlash, toDate } from "../lib/Utils.ts";

/**
 * 日付入力の共通コンポーネント
 */
class CustomCheckDate extends CustomElement {
  value;
  placeholder;
  validationRule;
  invalidMessageDom: HTMLDivElement;
  checked;

  constructor() {
    super();
    this.checked = this.hasAttribute("checked");
    const shadow = this.attachShadow({ mode: "open" });

    const template = document.getElementById("custom-check-date-template") as HTMLTemplateElement;
    const node = template.content.cloneNode(true) as HTMLElement;

    this.value = this.getAttribute("value")!;
    this.placeholder = this.getAttribute("placeholder")!;

    const required = this.getAttribute("required") !== null;
    this.validationRule = { required: required };
    this.invalidMessageDom = node.querySelector(".invalid-message") as HTMLDivElement;
    //ラベルの設定
    this.initializeLabel(node.querySelector("label")!, this.invalidMessageDom);
    node.querySelector("label")?.classList.remove(...node.querySelector("label")!.classList);
    node.querySelector("label")!.style = "line-height: 1.2rem;";

    //チェックボックスの設定
    const inputChkDom = node.querySelector("input[type='checkbox']") as HTMLInputElement;
    inputChkDom.id = this.name;
    if (this.readonly) {
      inputChkDom.disabled = true;
    }
    if (this.checked) {
      inputChkDom.checked = true;
    }

    //入力欄の設定
    const inputDom = node.querySelector("input[type='tel']") as HTMLInputElement;
    inputDom.style.width = "0";
    inputDom.id = this.name + "Date";
    inputDom.value = this.value;
    inputDom.placeholder = !this.placeholder ? "" : this.placeholder;
    const calendarButton = node.querySelector("button") as HTMLButtonElement;
    if (this.readonly) {
      inputDom.readOnly = true;
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
      //入力内容にスラッシュを追加
      const value = inputDom.value.replace(/[^0-9]/g, "");
      if (!value) {
        return;
      }
      if (this.validateDigit(value)) {
        if (!this.checkMonthOver(value)) {
          inputDom.value = "";
          this.viewErrorMessage("正しい年月を入力してください");
          return;
        } else if (!this.checkDateOver(value)) {
          inputDom.value = "";
          this.viewErrorMessage("正しい日にちを入力してください");
          return;
        }
        const year = value.slice(0, 4);
        const month = value.slice(4, 6);
        const day = value.slice(6, 8);
        inputDom.value = `${year}/${month}/${day}`;
      }
    });

    const formatToSlashDate = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = ("00" + (date.getMonth() + 1)).slice(-2);
      const dd = ("00" + date.getDate()).slice(-2);
      return `${yyyy}/${mm}/${dd}`;
    };

    inputChkDom.addEventListener("change", () => {
      inputDom.readOnly = !inputChkDom.checked;
      calendarButton.disabled = !inputChkDom.checked;
      if(!inputChkDom.checked){
        inputDom.value = "";
      }
    });

    //flatpickrの設定
    const option = {
      disableMobile: true,
      allowInput: true,
      clickOpens: false,
      locale: Japanese,
      defaultDate: this.value,
      dateFormat: "Y/m/d",
      formatDate: (value: Date) => {
        let result;
        //入力された日付が8桁文字列かチェック
        if (inputDom.value.length === 8) {
          const year = inputDom.value.slice(0, 4);
          const month = inputDom.value.slice(4, 6);
          const day = inputDom.value.slice(6, 8);
          result = `${year}/${month}/${day}`;
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
          //入力された日付からスラッシュを削除した文字列が8桁かチェック
          if (inputDom.value.replace(/[^0-9]/g, "").length !== 8) {
            return "";
          } else {
            //入力された"月"が12以上じゃないか、入力された"日にち"が入力された"年・月"の日数以上じゃないかチェック
            const replacedValue = inputDom.value.replace(/[^0-9]/g, "");
            if (!this.checkMonthOver(replacedValue) || !this.checkDateOver(replacedValue)) {
              return inputDom.value;
            }
          }
          result = formatToSlashDate(value);
        }
        return result;
      },
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
    const inputDom = this.shadowRoot?.querySelector(".input-group input") as HTMLInputElement;
    if (inputDom) {
      inputDom.value = hyphenToSlash(value) ?? "";
    }
  }

  /**
   * 値を取得（日付に変換可能な入力の場合は YYYY/MM/DD で値を返す、日付に変換不可の場合は空文字を返す）
   * @returns 値
   */
  getValue() {
    const inputDom = this.shadowRoot?.querySelector(".input-group input") as HTMLInputElement;

    if (!inputDom) {
      return "";
    }

    //入力内容にスラッシュを追加
    const value = inputDom.value.replace(/[^0-9]/g, "");
    if (!value) {
      return "";
    }
    // 年月日のバリデーションチェックを実施
    if (!this.validateDigit(value)) {
      return "";
    }
    // 月入力チェック
    if (!this.checkMonthOver(value)) {
      return "";
    }
    // 日にち入力チェック
    if (!this.checkDateOver(value)) {
      return "";
    }
    const year = value.slice(0, 4);
    const month = value.slice(4, 6);
    const day = value.slice(6, 8);

    return `${year}/${month}/${day}`;
  }

  /**
   * 値を取得（Date を返す、日付として扱えない入力の場合は null を返す）
   * @returns 値
   */
  getDateValue(): Date | null {
    return toDate(this.getValue());
  }

  /**
   * YYYY-MM-DDで値を取得
   */
  getIsoValue(): string | null {
    const value = this.getValue();
    const date = new Date(value);

    if (isNaN(date.getDate())) {
      return null;
    }

    return formatToHyphenDate(date);
  }

  /**
   * バリデーションチェックを実施
   * @returns エラーが無ければtrue
   */
  validate() {
    //現在表示中のエラーメッセージを消去
    this.resetErrorMessage();

    const inputChkDom = this.shadowRoot?.querySelector("input[type='checkbox']") as HTMLInputElement;
    const inputDom = this.shadowRoot?.querySelector(".input-group input") as HTMLInputElement;
    const value = inputDom?.value || "";

    // チェックがONなのに日付が未入力の場合
    if (inputChkDom?.checked && !value) {
      this.viewErrorMessage("値を入力してください。");
      return false;
    }

    if (this.validationRule.required && !value) {
      this.viewErrorMessage("値を入力してください。");
      return false;
    }
    return true;
  }

  /**
   * 年月日のバリデーションチェックを実施
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

    if (value.length !== 8) {
      this.viewErrorMessage("YYYY/MM/dd形式で入力してください");
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

  /**
   * 年と月から日数を取得
   * @param year
   * @param month
   * @returns
   */
  private getDays = (year: string, month: string) => {
    return new Date(Number(year), Number(month), 0).getDate();
  };

  /**
   * 入力された"月"が12以上じゃないかチェック
   * @param value
   * @returns
   */
  private checkMonthOver = (value: string) => {
    const month = value.slice(4, 6);
    if (month > "12") {
      return false;
    }
    return true;
  };

  /**
   * 入力された"日にち"が入力された"年・月"の日数以上じゃないかチェック
   * @param value
   * @returns
   */
  private checkDateOver = (value: string) => {
    const year = value.slice(0, 4);
    const month = value.slice(4, 6);
    const day = value.slice(6, 8);
    if (Number(day) > this.getDays(year, month)) {
      return false;
    }
    return true;
  };
}

customElements.define("custom-check-date", CustomCheckDate);
export default CustomCheckDate;
