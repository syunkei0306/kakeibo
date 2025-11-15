/**
 * 共通コンポーネントの基底クラス
 */
abstract class CustomElement extends HTMLElement {
  logicalName: string = "";
  name: string = "";
  inputClass: string = "";
  labelClass: string = "";
  readonly: boolean = false;
  disabled: boolean = false;

  constructor() {
    super();
    this.logicalName = this.getAttribute("logicalName")!;
    this.name = this.getAttribute("name")!;
    this.inputClass = this.getAttribute("inputClass")!;
    this.labelClass = this.getAttribute("labelClass")!;
    this.readonly = this.hasAttribute("readonly");
    this.disabled = this.hasAttribute("disabled");
  }

  abstract getValue(): any;
  abstract validate(): boolean;
  abstract viewErrorMessage(message: string): void;
  abstract resetErrorMessage(): void;

  /**
   * コンポーネントの表示/非表示の切り替え
   * @param {boolean} isVisible trueの場合表示する
   */
  setVisibility(isVisible: boolean): void {
    if (isVisible) {
      this.classList.remove("hidden");
    } else {
      this.classList.add("hidden");
    }
  }

  /**
   * コンポーネントの表示状態を取得
   * @returns {boolean} 表示されていればtrue
   */
  isVisible(): boolean {
    return !this.classList.contains("hidden");
  }

  /**
   * コンポーネント内のinput要素の活性/非活性切り替え
   * @param {boolean} isEnable trueの場合活性にする
   */
  setEnable(isEnable: boolean): void {
    const elements = this.shadowRoot!.querySelectorAll("input");
    elements.forEach((element) => {
      element.disabled = !isEnable;
    });
    const button = this.shadowRoot!.querySelector("button");
    if (button) {
      button!.disabled = !isEnable;
    }
    this.disabled = !isEnable;
  }

  /**
   * 入力項目がenableかどうかを調べる
   * @returns {boolean} enableならtrue
   */
  isEnable(): boolean {
    return !this.disabled;
  }

  /**
   * コンポーネント内のinput要素の入力可不可切り替え
   * @param {boolean} isReadOnly trueの場合入力不可とする
   */
  setReadOnly(isReadOnly: boolean): void {
    const elements = this.shadowRoot!.querySelectorAll("input");
    elements.forEach((element) => {
      element.readOnly = isReadOnly;
    });
    //値設定用のボタンがあるコンポーネントの場合、それの状態も変更する
    const button = this.shadowRoot!.querySelector("button");
    if (button) {
      button!.disabled = isReadOnly;
    }
    this.readonly = isReadOnly;
  }

  /**
   * 入力項目がreadonlyかどうかを調べる
   * @returns {boolean} readonlyならtrue
   */
  isReadOnly(): boolean {
    return this.readonly;
  }

  /**
   * ラベル要素の初期化を行う
   * @param {HTMLLabelElement} labelDom ラベル
   * @param invalidDom
   */
  protected initializeLabel(labelDom: HTMLLabelElement, invalidDom: HTMLDivElement | null = null) {
    if (this.logicalName) {
      labelDom.innerHTML = this.logicalName;
    } else {
      labelDom.remove();
    }
    labelDom.setAttribute("for", this.name);
    if (this.hasAttribute("labelWidthFixed-xsm")) {
      labelDom.classList.add("label-width-fixed-xsm");
      invalidDom !== null ? invalidDom.classList.add("invalid-message-xsm") : "";
    } else if (this.hasAttribute("labelWidthFixed-sm")) {
      labelDom.classList.add("label-width-fixed-sm");
      invalidDom !== null ? invalidDom.classList.add("invalid-message-sm") : "";
    } else if (this.hasAttribute("labelWidthFixed-md")) {
      labelDom.classList.add("label-width-fixed-md");
      invalidDom !== null ? invalidDom.classList.add("invalid-message-md") : "";
    } else if (this.hasAttribute("labelWidthFixed-lg")) {
      labelDom.classList.add("label-width-fixed-lg");
      invalidDom !== null ? invalidDom.classList.add("invalid-message-lg") : "";
    } else if (this.hasAttribute("labelWidthFixed-xlg")) {
      labelDom.classList.add("label-width-fixed-xlg");
      invalidDom !== null ? invalidDom.classList.add("invalid-message-xlg") : "";
    }
    if (this.labelClass) {
      labelDom.classList.add(...this.labelClass.split(" "));
    }
  }
}

export default CustomElement;
