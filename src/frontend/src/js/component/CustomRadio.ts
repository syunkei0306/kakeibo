import { addGlobalStylesToShadowRoot } from "../lib/GlobalStyles";
import CustomElement from "./CustomElement";
import { toNumber } from "../lib/Utils.ts";

const REQUIRED_MESSAGE = "選択してください。";

interface RadioListItem {
  name: string;
  value: string | number;
}

/**
 * ラジオボタンの共通コンポーネント
 */
class CustomRadio extends CustomElement {
  value;
  validationRule;
  invalidMessageDom: HTMLDivElement;
  isInline: boolean;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const template = document.getElementById("custom-radio-template") as HTMLTemplateElement;
    const node = template.content.cloneNode(true) as Element;

    this.value = this.getAttribute("value");
    const required = this.getAttribute("required") !== null;
    // noInline属性がない場合はtrue（デフォルトで横並び）
    this.isInline = this.getAttribute("noInline") === null;
    this.validationRule = { required: required };
    this.invalidMessageDom = node.querySelector(".invalid-message")! as HTMLDivElement;
    //ラベルの設定
    this.initializeLabel(node.querySelector("label")!, this.invalidMessageDom);

    if (this.inputClass) {
      const inputParentDom = node.querySelector(".radio-items")!;
      inputParentDom.classList.add(...this.inputClass.split(" "));
    }

    const btnCancel = node.querySelector(".btn.cancel") as HTMLButtonElement;
    if (this.getAttribute("canCancel") !== null) {
      btnCancel.addEventListener("click", () => {
        this.clearValue();
      });
    } else {
      btnCancel.classList.add("hidden");
    }

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
   * 値を設定し、ラジオボタンのチェック状態を変更する
   * (値に対応するラジオボタンが存在しない場合、チェックを外す)
   * @param {string | number | null} value 値
   */
  setValue(value: string | number | null) {
    const radios = Array.from(this.shadowRoot?.querySelectorAll("input")!);
    const targetRadio = radios.find((radio) => radio.value === String(value ?? "")) as HTMLInputElement;
    if (targetRadio) {
      targetRadio.checked = true;
      return;
    }
    this.clearValue();
  }

  /**
   * 選択項目の中から先頭のものを取り出して現在値とする
   */
  setFirstValue(): void {
    const radios = Array.from(this.shadowRoot?.querySelectorAll("input")!);
    const radio = radios[0] ?? null;
    if (radio != null) {
      radio.checked = true;
    }
  }

  /**
   * コンポーネント内に存在するすべてのラジオボタンのチェックを外す
   */
  clearValue() {
    const radios = Array.from(this.shadowRoot?.querySelectorAll("input")!);
    radios.forEach((radio) => {
      radio.checked = false;
    });
  }

  /**
   * 値を取得
   * @returns 値
   */
  getValue() {
    const radios = Array.from(this.shadowRoot?.querySelectorAll("input")!);
    const selectedRadio = radios.find((radio) => radio.checked);
    const value = selectedRadio == null ? "" : selectedRadio.value;
    return value;
  }

  /**
   * 値を数値で取得
   * @returns 値
   */
  getValueNumber(): number | null {
    return toNumber(this.getValue());
  }

  /**
   * コンポーネント内のinput要素の活性/非活性切り替え
   * @param {boolean} isEnable trueの場合活性にする
   */
  setEnable(isEnable: boolean) {
    super.setEnable(isEnable);
  }

  /**
   * バリデーションチェックを実施
   * @returns 入力エラーが無ければtrue
   */
  validate() {
    //現在表示中のエラーメッセージを消去
    this.resetErrorMessage();

    const value = this.getValue();
    if (this.validationRule.required && !value) {
      this.viewErrorMessage(REQUIRED_MESSAGE);
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
   * 選択項目リストを空にする
   */
  clearList() {
    const radioDom = this.shadowRoot?.querySelector(".radio-items")!;
    while (radioDom.firstChild) {
      radioDom.removeChild(radioDom.firstChild);
    }
  }

  /**
   * リストアイテムを設定します。
   * @param items リストアイテム
   */
  setListItems(items: Array<RadioListItem>): void {
    const readOnly = this.isReadOnly();
    this.clearList();
    const radioParentDom = this.shadowRoot?.querySelector(".radio-items") as HTMLElement;
    items.forEach((item: RadioListItem) => {
      this.addRadio(item.value, item.name, radioParentDom);
    });
    this.setReadOnly(readOnly);
  }

  /**
   * リストに項目を追加する
   * @param value 値
   * @param name ラベル
   * @param radioParentDom
   */
  addRadio(value: string | number, name: string, radioParentDom: HTMLElement) {
    const element = document.createElement("div");
    // inline属性がある場合はform-check-inlineを追加
    const isInline = this.getAttribute("inline") !== null;
    if (isInline) {
      element.classList.add("form-check", "form-check-inline");
    } else {
      element.classList.add("form-check");
    }
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = this.name!;
    const strValue = String(value);
    radio.value = strValue;
    if (this.value === strValue) {
      radio.checked = true;
    }
    radio.classList.add("form-check-input");
    const radioId = `${this.name}-${strValue}`;
    radio.id = radioId;

    radio.addEventListener("change", (event) => {
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: (event.currentTarget as HTMLInputElement).value,
        })
      );
    });

    const label = document.createElement("label");
    label.classList.add("form-check-label");
    label.setAttribute("for", radioId);
    label.innerText = name;

    element.appendChild(radio);
    element.appendChild(label);

    radioParentDom.appendChild(element);
  }

  /**
   * エラーメッセージを画面に表示
   * @param {*} message メッセージ
   */
  viewErrorMessage(message: string) {
    const li = document.createElement("li");
    li.innerText = message;
    this.invalidMessageDom.appendChild(li);
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

customElements.define("custom-radio", CustomRadio);
export default CustomRadio;
export type { RadioListItem };
