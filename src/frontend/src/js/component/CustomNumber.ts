import { addGlobalStylesToShadowRoot } from "../lib/GlobalStyles";
import { nullToEmpty, toNumber } from "../lib/Utils";
import CustomElement from "./CustomElement";
import Decimal from "decimal.js";

interface ValidationRule {
  required: boolean;
  max: number | null;
  min: number | null;
}

/**
 * テキスト入力の共通コンポーネント
 */
class CustomNumber extends CustomElement {
  value: number | null;
  stringValue: string | null;  // 0埋めされた文字列値を保持
  decimalPoint: number;
  step: string;
  placeholder: string;
  prefix: string;
  unit: string;
  hiddenUnit: boolean = false;
  disableFormatComma: boolean;
  keepLeadingZeros: boolean;
  validationRule: ValidationRule;
  invalidMessageDom: HTMLDivElement;
  requiredMessage: string;
  maxLength: number | null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const template = document.getElementById("custom-number-template") as HTMLTemplateElement;
    const node = template.content.cloneNode(true) as Element;

    this.value = toNumber(this.getAttribute("value"));
    this.stringValue = this.getAttribute("value");
    this.decimalPoint = !this.getAttribute("decimalPoint") ? 0 : toNumber(this.getAttribute("decimalPoint"))!;
    this.step = this.getAttribute("step")!;
    this.placeholder = this.getAttribute("placeholder")!;
    this.prefix = this.getAttribute("prefix")!;
    this.unit = this.getAttribute("unit")!;
    this.disableFormatComma = this.hasAttribute("disableFormatComma");
    this.keepLeadingZeros = this.hasAttribute("keepLeadingZeros");
    this.hiddenUnit = this.hasAttribute("hiddenUnit");
    const required = this.getAttribute("required") !== null;
    const max = this.getAttribute("max") as number | null;
    const min = this.getAttribute("min") as number | null;
    this.validationRule = {
      required: required,
      max: max,
      min: min,
    };
    this.invalidMessageDom = node.querySelector(".invalid-message") as HTMLDivElement;
    this.requiredMessage = this.getAttribute("requiredMessage")!;
    if (!this.requiredMessage) {
      this.requiredMessage = "値を入力してください。";
    }
    // maxlength属性の取得
    this.maxLength = this.getAttribute("maxlength") ? parseInt(this.getAttribute("maxlength")!) : null;

    //ラベルの設定
    this.initializeLabel(node.querySelector("label")!, this.invalidMessageDom);

    //入力欄の設定
    const inputDom = node.querySelector("input")!;
    inputDom.id = this.name;
    if (this.keepLeadingZeros && this.stringValue) {
      inputDom.value = this.stringValue;
    } else {
      inputDom.value = this.numberToFomattedValue(this.value);
    }
    inputDom.step = this.step;
    inputDom.placeholder = this.placeholder === null ? "" : this.placeholder;
    
    // maxlength属性の設定
    if (this.maxLength) {
      inputDom.setAttribute("maxlength", this.maxLength.toString());
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
      const value = (event.currentTarget as HTMLInputElement).value;
      if (this.keepLeadingZeros) {
        // 数字のみかチェック
        if (value === "" || /^\d+$/.test(value)) {
          this.stringValue = value;
          this.value = value !== "" ? toNumber(value) : null;
        } else {
          // 数字以外が含まれる場合は変更を無視
          (event.currentTarget as HTMLInputElement).value = this.stringValue || "";
          return;
        }
      } else {
        this.value = value !== "" ? this.roundNumber(value) : null;
      }
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: value,
        })
      );
    });
    // 入力時の処理（数字のみ許可とmaxlength制限）
    inputDom.addEventListener("input", (event) => {
      const target = event.currentTarget as HTMLInputElement;
      let value = target.value;

      // keepLeadingZerosの場合、数字のみを許可
      if (this.keepLeadingZeros) {
        // 数字以外の文字を削除
        value = value.replace(/[^\d]/g, '');

        // maxlength制限
        if (this.maxLength && value.length > this.maxLength) {
          value = value.substring(0, this.maxLength);
        }

        if (target.value !== value) {
          target.value = value;
        }
      } else {
        // 通常の数値入力の場合、カンマ・通貨記号等を除去（数字、ドット、マイナスのみ許可）
        const originalValue = value;
        value = value.replace(/[^\d.-]/g, '');

        // カンマが含まれていた場合（サジェスト選択など）、カンマ区切りで再表示
        if (!this.disableFormatComma && originalValue.includes(',')) {
          const numValue = this.roundNumber(value);
          if (numValue !== null) {
            this.value = numValue;
            // type="number"だとカンマを設定できないため、一時的にtextに変更
            target.type = "text";
            target.value = this.numberToFomattedValue(numValue);
            return;
          }
        }

        // maxlength制限
        if (this.maxLength && value.length > this.maxLength) {
          value = value.substring(0, this.maxLength);
        }

        if (target.value !== value) {
          target.value = value;
        }
      }
    });
    
    // 数値入力時のキーボード表示のため、inputmode属性を設定
    if (!this.keepLeadingZeros) {
      inputDom.setAttribute("inputmode", "decimal");
    } else {
      inputDom.setAttribute("inputmode", "numeric");
    }

    inputDom.addEventListener("focus", () => {
      // type="number"だとサジェストのカンマ付き値でエラーが出るため、常にtextを使用
      inputDom.type = "text";
      if (this.keepLeadingZeros && this.stringValue !== null) {
        inputDom.value = this.stringValue;
      } else {
        inputDom.value = this.value === null ? "" : String(this.value);
      }
      inputDom.select();
    });
    inputDom.addEventListener("blur", () => {
      inputDom.type = "text";
      if (inputDom.value === "") {
        this.value = null;
        this.stringValue = null;
        return;
      }
      if (this.keepLeadingZeros) {
        // 数字のみかチェック（0埋めを許可）
        if (/^\d+$/.test(inputDom.value)) {
          this.stringValue = inputDom.value;
          this.value = toNumber(inputDom.value);
          inputDom.value = this.stringValue;
        } else {
          // 数字以外が含まれる場合は元の値に戻す
          inputDom.value = this.stringValue || "";
        }
      } else {
        const roundedValue = this.roundNumber(inputDom.value);
        this.value = roundedValue;
        inputDom.value = this.numberToFomattedValue(this.value);
      }
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
   * 入力値の四捨五入を行う
   * @param {number | string | null} value 値
   * @returns {number} 四捨五入後の数値
   */
  roundNumber(value: number | string | null): number | null {
    if (value === null) {
      return null;
    }
    // 数字、ドット、マイナス以外を除去（カンマ、通貨記号等を除去）
    const cleanedValue = typeof value === 'string' ? value.replace(/[^\d.-]/g, '') : value;
    const roundedValue = new Decimal(cleanedValue).toDecimalPlaces(this.decimalPoint, Decimal.ROUND_HALF_UP);
    return roundedValue.toNumber();
  }

  /**
   * 数値をカンマ区切り&プレフィックス付きの文字列にフォーマット
   * @param {number | null} value 数値
   * @returns {string} フォーマット後の文字列
   */
  numberToFomattedValue(value: number | null) {
    if (value === null) {
      return "";
    }
    const prefix = nullToEmpty(this.prefix);
    if (this.disableFormatComma) {
      return prefix + value.toString();
    }
    return (
      prefix +
      value.toLocaleString("ja-JP", {
        maximumFractionDigits: this.decimalPoint,
      })!
    );
  }

  /**
   * 値を設定
   * @param {number | string | null} value 値（keepLeadingZerosの場合は文字列も可）
   */
  setValue(value: number | string | null) {
    const inputDom = this.shadowRoot?.querySelector("input")!;
    if (this.keepLeadingZeros && typeof value === 'string') {
      this.stringValue = value;
      this.value = toNumber(value);
      inputDom.value = value;
    } else {
      const numberValue = this.roundNumber(value as number);
      this.value = numberValue;
      this.stringValue = numberValue?.toString() || null;
      inputDom.value = this.numberToFomattedValue(numberValue);
    }
    inputDom.dispatchEvent(new Event("change"));
  }

  /**
   * 値を取得
   * @returns {number | null} 値
   */
  getValue(): number | null {
    return this.value;
  }

  /**
   * 加工された数値文字列を取得
   * @returns {string} 文字列
   */
  getFormattedValue(): string {
    const inputDom = this.shadowRoot?.querySelector("input")!;
    return inputDom.value;
  }

  /**
   * 文字列値を取得（0埋めを保持）
   * @returns {string | null} 0埋めされた文字列値
   */
  getStringValue(): string | null {
    if (this.keepLeadingZeros) {
      return this.stringValue;
    }
    return this.value?.toString() || null;
  }

  /**
   * バリデーションチェックを実施
   * @returns {boolean} エラーが無ければtrue
   */
  validate(): boolean {
    //現在表示中のエラーメッセージを消去
    this.resetErrorMessage();

    const value = this.value;

    if (this.validationRule.required && !value) {
      this.viewErrorMessage(this.requiredMessage);
      return false;
    }

    if (value !== null) {
      if (this.validationRule.max && value > this.validationRule.max) {
        this.viewErrorMessage(`${this.validationRule.max}以下の数値を入力してください`);
        return false;
      }

      if (this.validationRule.min && value < this.validationRule.min) {
        this.viewErrorMessage(`${this.validationRule.min}以上の数値を入力してください`);
        return false;
      }
    }
    
    // maxlengthチェック（文字数制限）
    if (this.maxLength && this.stringValue && this.stringValue.length > this.maxLength) {
      this.viewErrorMessage(`${this.maxLength}文字以内で入力してください`);
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

customElements.define("custom-number", CustomNumber);
export default CustomNumber;
