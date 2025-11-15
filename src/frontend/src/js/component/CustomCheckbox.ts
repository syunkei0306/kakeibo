import { addGlobalStylesToShadowRoot } from "../lib/GlobalStyles";
import CustomElement from "./CustomElement";

const REQUIRED_MESSAGE = "チェックをつけてください。";

/**
 * チェックボックスの共通コンポーネント
 */
class CustomCheckbox extends CustomElement {
  value;
  validationRule;
  hideInvalidMessage: boolean = false;
  invalidMessageDom: HTMLDivElement;
  checkboxLabelName;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const template = document.getElementById("custom-checkbox-template") as HTMLTemplateElement;
    const node = template.content.cloneNode(true) as Element;

    this.value = this.getAttribute("value");
    this.checkboxLabelName = this.getAttribute("checkboxLabelName");
    this.hideInvalidMessage = this.hasAttribute("hideInvalidMessage");

    const required = this.getAttribute("required") !== null;
    this.validationRule = { required: required };
    this.invalidMessageDom = node.querySelector(".invalid-message") as HTMLDivElement;
    //ラベルの設定
    this.initializeLabel(node.querySelector("label")!, this.invalidMessageDom);

    // バリデーションメッセージ表示領域のdivを非表示（チェックボックスはほぼバリデーションエラーが発生しないが、メッセージ表示用のスペースがチェックボックス下部に生まれるためその隙間を消すために実施　※レイアウト用途）
    if (this.hideInvalidMessage) {
      const parentElement = this.invalidMessageDom.parentElement;
      if (parentElement) {
        parentElement.hidden = true;
      }
    }

    //入力欄の設定
    const inputDom = node.querySelector("input") as HTMLInputElement;
    inputDom.id = this.name!;
    if (!this.value || this.value === "false") {
      inputDom.checked = false;
    } else {
      inputDom.checked = true;
    }
    if (this.inputClass) {
      inputDom.classList.add(...this.inputClass.split(" "));
    }

    //チェックボックスの右側に表示するラベルの設定
    const checkboxLabelDom = node.querySelector(".form-check-label") as HTMLLabelElement;
    if (this.checkboxLabelName) {
      checkboxLabelDom.innerText = this.checkboxLabelName;
    } else {
      checkboxLabelDom.remove();
    }
    checkboxLabelDom.setAttribute("for", this.name!);

    //サーバ側バリデーション結果があれば表示する
    const errors = this.getAttribute("error");
    if (errors != null) {
      console.log(errors);
      const errorMessages = errors.slice(1).slice(0, -1).split(", ");
      errorMessages.forEach((message) => {
        this.viewErrorMessage(message);
      });
    }

    inputDom.addEventListener("change", (event) => {
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: (event.currentTarget as HTMLInputElement).value,
        })
      );
    });
    shadow.appendChild(node);
    addGlobalStylesToShadowRoot(this.shadowRoot);
  }

  /**
   * 値を設定
   * @param value 値
   */
  setValue(value: boolean) {
    const inputDom = this.shadowRoot?.querySelector("input") as HTMLInputElement;
    inputDom.checked = value;
    inputDom.dispatchEvent(new Event("change"));
  }

  /**
   * 値を取得
   * @returns 値
   */
  getValue() {
    const inputDom = this.shadowRoot?.querySelector("input") as HTMLInputElement;
    return inputDom.checked;
  }

  /**
   * バリデーションチェックを実施
   * @returns エラーが無ければtrue
   */
  validate() {
    //現在表示中のエラーメッセージを消去
    this.resetErrorMessage();

    const inputDom = this.shadowRoot?.querySelector("input") as HTMLInputElement;
    const isChecked = inputDom.checked;

    if (this.validationRule.required && !isChecked) {
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

customElements.define("custom-checkbox", CustomCheckbox);
export default CustomCheckbox;
