import { addGlobalStylesToShadowRoot } from "../lib/GlobalStyles";
import CustomElement from "./CustomElement";
import Toggle from "bootstrap5-toggle";

/**
 * チェックボックスの共通コンポーネント
 */
class CustomToggle extends CustomElement {
  value;
  toggleLabelName;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const template = document.getElementById("custom-toggle-template") as HTMLTemplateElement;
    const node = template.content.cloneNode(true) as Element;

    this.value = this.getAttribute("value");
    this.toggleLabelName = this.getAttribute("toggleLabelName");
    const onLabel = this.getAttribute("onLabel") as String | null;
    const offLabel = this.getAttribute("offLabel") as String | null;
    const onStyle = this.getAttribute("onStyle") as String | null;
    const offStyle = this.getAttribute("offStyle") as String | null;
    const size = this.getAttribute("size") as String | null;
    //ラベルの設定
    this.initializeLabel(node.querySelector("label")!);

    //入力欄の設定
    const toggleDom = node.querySelector("input") as HTMLInputElement;
    toggleDom.id = this.name!;
    if (!this.value || this.value === "false") {
      toggleDom.checked = false;
    } else {
      toggleDom.checked = true;
    }
    if (this.inputClass) {
      toggleDom.classList.add(...this.inputClass.split(" "));
    }

    //トグルボタンの右側に表示するラベルの設定
    const toggleLabelDom = node.querySelector(".form-check-label") as HTMLLabelElement;
    if (this.toggleLabelName) {
      toggleLabelDom.innerText = this.toggleLabelName;
    } else {
      toggleLabelDom.remove();
    }
    toggleLabelDom.setAttribute("for", this.name!);
    //トグルボタンの設定
    const toggleOption: any = {
      onlabel: onLabel !== null ? onLabel : null,
      onstyle: onStyle !== null ? onStyle : null,
      offlabel: offLabel !== null ? offLabel : null,
      offstyle: offStyle !== null ? offStyle : null,
      size: size !== null ? size : null,
      width: 1,
      height: 1,
    };
    //トグルボタン生成
    new Toggle(toggleDom, toggleOption);

    toggleDom.addEventListener("change", (event) => {
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
    const toggleDom = this.shadowRoot?.querySelector("input") as HTMLInputElement;
    toggleDom.checked = value;

    if (value) {
      (toggleDom as any).bootstrapToggle("on");
    } else {
      (toggleDom as any).bootstrapToggle("off");
    }
  }

  /**
   * コンポーネント内のinput要素の活性/非活性切り替え
   * @param {boolean} isEnable trueの場合活性にする
   */
  setEnable(isEnable: boolean): void {
    const toggleDom = this.shadowRoot?.querySelector("input") as HTMLInputElement;

    if (!isEnable) {
      (toggleDom as any).bootstrapToggle("disable");
    } else {
      (toggleDom as any).bootstrapToggle("enable");
    }
  }

  /**
   * コンポーネント内のinput要素の入力可不可切り替え
   * @param {boolean} isReadOnly trueの場合入力不可とする
   */
  setReadOnly(isReadOnly: boolean): void {
    const toggleDom = this.shadowRoot?.querySelector("input") as HTMLInputElement;
    if (isReadOnly) {
      (toggleDom as any).bootstrapToggle("readonly");
    } else {
      (toggleDom as any).bootstrapToggle("enable");
    }
  }

  /**
   * コンポーネント内のinput要素の活性/非活性の状態を取得する
   * @returns 値
   */
  isEnable(): boolean {
    const toggleDom = this.shadowRoot?.querySelector("input") as HTMLInputElement;
    return !toggleDom.disabled;
  }

  /**
   * コンポーネント内のinput要素の入力可不可の状態を取得する
   * @returns 値
   */
  isReadonly(): boolean {
    const toggleDom = this.shadowRoot?.querySelector("input") as HTMLInputElement;
    return toggleDom.readOnly;
  }

  /**
   * 値を取得
   * @returns 値
   */
  getValue() {
    const inputDom = this.shadowRoot?.querySelector("input") as HTMLInputElement;
    return inputDom.checked;
  }

  //バリデーションメソッドはいらないとのことだったが、抽象メソッドのため最小限にして残している
  validate() {
    return true;
  }

  /**
   * エラーメッセージを画面に表示（本コンポーネントではバリデーションの概念がないため何もしない）
   */
  viewErrorMessage(_: string) {
    // console.warn(`CustomToggle の viewErrorMessage は未実装です。 - message - ${message}`);
  }

  /**
   * エラーメッセージの画面表示をリセット（本コンポーネントではバリデーションの概念がないため何もしない）
   */
  resetErrorMessage() {
    // console.warn(`CustomToggle の resetErrorMessage は未実装です。`);
  }
}

customElements.define("custom-toggle", CustomToggle);
export default CustomToggle;
