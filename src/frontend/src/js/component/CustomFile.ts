import { addGlobalStylesToShadowRoot } from "../lib/GlobalStyles";
import CustomElement from "./CustomElement";

const REQUIRED_MESSAGE = "ファイルを指定してください。";

/**
 * ファイル選択の共通コンポーネント
 */
class CustomFile extends CustomElement {
  validationRule;
  invalidMessageDom: HTMLDivElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const template = document.getElementById("custom-file-template") as HTMLTemplateElement;
    const node = template.content.cloneNode(true) as HTMLElement;

    const required = this.getAttribute("required") !== null;
    this.validationRule = { required: required };
    this.invalidMessageDom = node.querySelector(".invalid-message") as HTMLDivElement;
    //ラベルの設定
    this.initializeLabel(node.querySelector("label")!, this.invalidMessageDom);

    //入力欄の設定
    const inputDom = node.querySelector("input") as HTMLInputElement;
    inputDom.id = this.name!;
    if (this.inputClass) {
      inputDom.classList.add(...this.inputClass.split(" "));
    }

    inputDom.addEventListener("change", (event) => {
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: (event.currentTarget as HTMLInputElement).value,
        })
      );
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
   * 値を取得
   * @returns 値
   */
  getValue() {
    const inputDom = this.shadowRoot?.querySelector("input")!;
    return inputDom.value;
  }

  /**
   * バリデーションチェックを実施
   * @returns エラーが無ければtrue
   */
  validate() {
    //現在表示中のエラーメッセージを消去
    this.resetErrorMessage();

    const inputDom = this.shadowRoot?.querySelector("input")!;
    const value = inputDom.value;

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

customElements.define("custom-file", CustomFile);
export default CustomFile;
