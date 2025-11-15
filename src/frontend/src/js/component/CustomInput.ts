import { addGlobalStylesToShadowRoot } from "../lib/GlobalStyles";
import CustomElement from "./CustomElement";
import { hyphenToSlash } from "../lib/Utils.ts";

enum Align {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
}

enum InputType {
  NUMERIC = "numeric",
  TEXT = "text",
  MONTH = "month",
  PASSWORD = "password",
  EMAIL = "email",
}

enum FormatType {
  NONE = "",
  MONTH = "month",
  DATE = "date",
}

interface ValidationRule {
  required: boolean;
  maxLength: number | null;
  minLength: number | null;
  alphanumeric: boolean;
  fullwidth: boolean;
}

/**
 * テキスト入力の共通コンポーネント
 */
class CustomInput extends CustomElement {
  value: string;
  placeholder: string;
  unit: string;
  hiddenUnit: boolean = false;
  textAlign: Align;
  inputType: InputType;
  format: FormatType;
  validationRule: ValidationRule;
  invalidMessageDom: HTMLDivElement;
  requiredMessage: string;
  alphanumericMessage: string;
  fullwidthMessage: string;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const template = document.getElementById("custom-input-template") as HTMLTemplateElement;
    const node = template.content.cloneNode(true) as Element;

    this.value = this.getAttribute("value")!;
    this.placeholder = this.getAttribute("placeholder")!;
    this.unit = this.getAttribute("unit")!;
    this.textAlign = this.getAttribute("textAlign") as Align;
    this.inputType = (this.getAttribute("inputType") || this.getAttribute("type")) as InputType;
    this.format = (this.getAttribute("format") ?? "") as FormatType;
    this.hiddenUnit = this.hasAttribute("hiddenUnit");
    const required = this.getAttribute("required") !== null;
    // maxLengthとmaxlength両方をサポート（HTMLの標準属性名に合わせる）
    const maxLength = (this.getAttribute("maxLength") || this.getAttribute("maxlength")) as number | null;
    const minLength = this.getAttribute("minLength") as number | null;
    const alphanumeric = this.getAttribute("alphanumeric") !== null;
    const fullwidth = this.getAttribute("fullwidth") !== null;
    this.validationRule = {
      required: required,
      maxLength: maxLength,
      minLength: minLength,
      alphanumeric: alphanumeric,
      fullwidth: fullwidth,
    };
    this.invalidMessageDom = node.querySelector(".invalid-message") as HTMLDivElement;
    this.requiredMessage = this.getAttribute("requiredMessage")!;
    if (!this.requiredMessage) {
      this.requiredMessage = "値を入力してください。";
    }
    this.alphanumericMessage = this.getAttribute("alphanumericMessage")!;
    if (!this.alphanumericMessage) {
      this.alphanumericMessage = "半角英数字で入力してください。";
    }
    this.fullwidthMessage = this.getAttribute("fullwidthMessage")!;
    if (!this.fullwidthMessage) {
      this.fullwidthMessage = "全角文字で入力してください。";
    }
    //ラベルの設定
    this.initializeLabel(node.querySelector("label")!, this.invalidMessageDom);

    //入力欄の設定
    const inputDom = node.querySelector("input")!;
    inputDom.id = this.name;
    inputDom.value = this.value;
    inputDom.placeholder = this.placeholder === null ? "" : this.placeholder;
    
    // maxlength属性の設定
    if (maxLength) {
      inputDom.setAttribute("maxlength", maxLength.toString());
    }
    
    if (this.textAlign) {
      inputDom.style.textAlign = this.textAlign;
    }
    if (this.inputType === "numeric") {
      inputDom.type = "numeric";
      inputDom.pattern = "\\d*";
    }
    if (this.inputType === "month") {
      inputDom.type = "month";
    }
    if (this.inputType === "password") {
      inputDom.type = "password";

      //「目」アイコンボタン生成
      const buttonDom = document.createElement("button");
      buttonDom.id = "eyeBtn";
      buttonDom.className = "btn btn-primary eyeBtn";
      const iconDom = document.createElement("i");
      iconDom.id = "eye";
      iconDom.className = "bi bi-eye eye";
      buttonDom.appendChild(iconDom);
      node.querySelector(".input-group")?.appendChild(buttonDom);

      //クリックしたときにマスクの表示・非表示を切り替える
      buttonDom.addEventListener("click", () => {
        const iconDom = buttonDom.childNodes[1] as HTMLElement;
        if (inputDom.type === "password") {
          inputDom.type = "text";
          iconDom!.className = "bi bi-eye-slash";
        } else {
          inputDom.type = "password";
          iconDom!.className = "bi bi-eye";
        }
      });
    }
    if (this.inputType === "email") {
      inputDom.type = "email";
    }
    if (this.readonly) {
      inputDom.readOnly = true;
    }
    if (this.disabled) {
      inputDom.disabled = true;
    }
    if (this.inputClass) {
      inputDom.classList.add(...this.inputClass.split(" "));
    }
    inputDom.addEventListener("focus", (event) => {
      (event.currentTarget as HTMLInputElement).select();
    });
    
    // 入力時の文字数制限（リアルタイム制限）
    if (maxLength) {
      inputDom.addEventListener("input", (event) => {
        const target = event.currentTarget as HTMLInputElement;
        if (target.value.length > maxLength) {
          target.value = target.value.substring(0, maxLength);
        }
      });
    }
    //単位の設定
    const unitDom = node.querySelector(".unit")!;
    if (this.unit) {
      unitDom.innerHTML = this.unit;
      if (this.hiddenUnit) {
        unitDom.classList.add("invisible");
      }
    } else {
      unitDom.remove();
    }

    //サーバ側バリデーション結果があれば表示する
    const errors = this.getAttribute("error");
    if (errors != null) {
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

    // Shadow DOMにautofill対策のスタイルを追加
    const autofillStyle = document.createElement('style');
    autofillStyle.textContent = `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px white inset !important;
        box-shadow: 0 0 0 30px white inset !important;
        -webkit-text-fill-color: #000 !important;
        transition: background-color 5000s ease-in-out 0s;
      }
    `;
    shadow.appendChild(autofillStyle);
  }

  /**
   * 値を設定
   * @param value 値
   */
  setValue(value: string | number | null) {
    const inputDom = this.shadowRoot?.querySelector("input")!;
    const strValue = value == null ? "" : String(value);

    if (this.format === FormatType.MONTH || this.format === FormatType.DATE) {
      // 書式が年月 、日付の場合はハイフンをスラッシュに変換
      inputDom.value = hyphenToSlash(strValue) ?? "";
    } else if (this.inputType === InputType.MONTH) {
      // 入力種別が年月の場合はハイフンをスラッシュに変換
      inputDom.value = hyphenToSlash(strValue) ?? "";
    } else {
      inputDom.value = strValue;
    }
    inputDom.dispatchEvent(new Event("change"));
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
      this.viewErrorMessage(this.requiredMessage);
      return false;
    }

    if (this.validationRule.maxLength && value.length > this.validationRule.maxLength) {
      this.viewErrorMessage(`${this.validationRule.maxLength}文字以内で入力してください`);
      return false;
    }

    if (this.validationRule.minLength && value.length < this.validationRule.minLength) {
      this.viewErrorMessage(`${this.validationRule.minLength}文字以上で入力してください`);
      return false;
    }

    if (this.validationRule.alphanumeric && !value.match(/^[A-Za-z0-9]*$/)) {
      this.viewErrorMessage(this.alphanumericMessage);
      return false;
    }

    if (this.validationRule.fullwidth && value) {
      // 全角文字チェック（半角文字が含まれていないか）
      const halfwidthRegex = /[\x20-\x7E\uFF61-\uFF9F]/;
      if (halfwidthRegex.test(value)) {
        this.viewErrorMessage(this.fullwidthMessage);
        return false;
      }
    }

    // メールアドレス形式のバリデーション
    if (this.inputType === "email" && value) {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(value)) {
        this.viewErrorMessage("正しいメールアドレス形式で入力してください。");
        return false;
      }
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

customElements.define("custom-input", CustomInput);
export default CustomInput;
