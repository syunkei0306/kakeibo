import { addGlobalStylesToShadowRoot } from "../lib/GlobalStyles";
import CustomElement from "./CustomElement";

/**
 * ラベル表示用カスタムコンポーネント
 */
class CustomLabel extends CustomElement {
  value: string;
  textAlign: string;
  bold: boolean;
  color: string;
  unit: string;
  labelDom: HTMLLabelElement;
  valueDom: HTMLSpanElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const template = document.getElementById("custom-label-template") as HTMLTemplateElement;
    const node = template.content.cloneNode(true) as Element;

    // 属性の取得
    this.value = this.getAttribute("value") || "";
    this.textAlign = this.getAttribute("textAlign") || "left";
    this.bold = this.hasAttribute("bold");
    this.color = this.getAttribute("color") || "";
    this.unit = this.getAttribute("unit") || "";

    // ラベル要素の参照を取得
    this.labelDom = node.querySelector("label") as HTMLLabelElement;
    this.valueDom = node.querySelector(".label-value") as HTMLSpanElement;

    // ラベルの設定
    this.initializeLabel(this.labelDom, null as any);

    // 値の表示設定
    if (this.value) {
      this.valueDom.textContent = this.value;
      if (this.unit) {
        this.valueDom.textContent += " " + this.unit;
      }
    }

    // テキスト配置
    if (this.textAlign) {
      const container = node.querySelector(".custom-label") as HTMLDivElement;
      if (this.textAlign === "center") {
        container.classList.remove("justify-content-start");
        container.classList.add("justify-content-center");
      } else if (this.textAlign === "right") {
        container.classList.remove("justify-content-start");
        container.classList.add("justify-content-end");
      }
    }

    // 太字設定
    if (this.bold) {
      this.labelDom.classList.add("fw-bold");
      if (this.valueDom) {
        this.valueDom.classList.add("fw-bold");
      }
    }

    // 色設定
    if (this.color) {
      this.labelDom.classList.add(this.color);
      if (this.valueDom) {
        this.valueDom.classList.add(this.color);
      }
    }

    // クラス設定
    if (this.labelClass) {
      this.labelDom.classList.add(...this.labelClass.split(" "));
    }

    // グローバルスタイルを追加
    addGlobalStylesToShadowRoot(shadow);

    shadow.appendChild(node);
  }

  /**
   * 表示テキストを取得
   * @returns {string} ラベルのテキストと値
   */
  getValue(): string {
    let result = this.logicalName || "";
    if (this.value) {
      result += ": " + this.value;
      if (this.unit) {
        result += " " + this.unit;
      }
    }
    return result;
  }

  /**
   * 値を設定
   * @param {string} value 表示する値
   */
  setValue(value: string): void {
    this.value = value;
    if (this.valueDom) {
      this.valueDom.textContent = value;
      if (this.unit) {
        this.valueDom.textContent += " " + this.unit;
      }
    } else {
      // 値表示要素がない場合は作成
      this.valueDom = document.createElement("span");
      this.valueDom.className = "label-value";
      this.valueDom.textContent = value;
      if (this.unit) {
        this.valueDom.textContent += " " + this.unit;
      }
      if (this.bold) {
        this.valueDom.classList.add("fw-bold");
      }
      if (this.color) {
        this.valueDom.classList.add(this.color);
      }
      const container = this.shadowRoot!.querySelector(".custom-label");
      if (container) {
        container.appendChild(this.valueDom);
      }
    }
  }

  /**
   * ラベルテキストを設定
   * @param {string} text ラベルテキスト
   */
  setLabel(text: string): void {
    this.logicalName = text;
    if (this.labelDom) {
      this.labelDom.textContent = text;
    }
  }

  /**
   * 表示テキストを取得（getValue()のエイリアス）
   * @returns {string} 表示テキスト
   */
  getText(): string {
    return this.getValue();
  }

  /**
   * バリデーション（常にtrueを返す）
   * @returns {boolean} 常にtrue
   */
  validate(): boolean {
    return true;
  }

  /**
   * エラーメッセージ表示（ラベルには不要）
   * @param {string} message エラーメッセージ
   */
  viewErrorMessage(message: string): void {
    // ラベルコンポーネントではエラー表示は不要
  }

  /**
   * エラーメッセージリセット（ラベルには不要）
   */
  resetErrorMessage(): void {
    // ラベルコンポーネントではエラーリセットは不要
  }

  /**
   * コンポーネントの表示状態を更新
   * @param {boolean} visible 表示/非表示
   */
  setVisible(visible: boolean): void {
    this.setVisibility(visible);
  }

  /**
   * 色クラスを変更
   * @param {string} colorClass Bootstrapの色クラス（例: text-primary, text-danger）
   */
  setColor(colorClass: string): void {
    // 既存の色クラスを削除
    if (this.color) {
      this.labelDom.classList.remove(this.color);
      if (this.valueDom) {
        this.valueDom.classList.remove(this.color);
      }
    }
    
    // 新しい色クラスを追加
    this.color = colorClass;
    if (this.color) {
      this.labelDom.classList.add(this.color);
      if (this.valueDom) {
        this.valueDom.classList.add(this.color);
      }
    }
  }

  /**
   * 太字設定を変更
   * @param {boolean} bold 太字にするかどうか
   */
  setBold(bold: boolean): void {
    this.bold = bold;
    if (bold) {
      this.labelDom.classList.add("fw-bold");
      if (this.valueDom) {
        this.valueDom.classList.add("fw-bold");
      }
    } else {
      this.labelDom.classList.remove("fw-bold");
      if (this.valueDom) {
        this.valueDom.classList.remove("fw-bold");
      }
    }
  }
}

// カスタム要素を定義
customElements.define("custom-label", CustomLabel);

export default CustomLabel;