import { TomOption, TomOptions } from "tom-select/dist/types/types";
import { addGlobalStylesToShadowRoot } from "../lib/GlobalStyles";
import TomSelect from "tom-select";
import CustomElement from "./CustomElement";
import { toNumber } from "../lib/Utils.ts";

enum Align {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
}

enum InputType {
  NUMERIC = "numeric",
  TEXT = "text",
}

interface ValidationRule {
  required: boolean;
}

interface ListItem {
  name: string;
  value: string | number;
  parentValue?: string;
}

const EMPTY_MESSAGE = "ここをタップして選択";

/**
 * セレクトボックスの共通コンポーネント
 */
class CustomSelect extends CustomElement {
  value: string;
  width: string;
  placeholder: string;
  textAlign: Align;
  inputType: InputType;
  multiple: boolean;
  maxItems: string;
  validationRule: ValidationRule;
  invalidMessageDom: HTMLDivElement;
  tomSelect: TomSelect | undefined;
  canFiltering: boolean;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const template: HTMLTemplateElement = document.getElementById("custom-select-template") as HTMLTemplateElement;
    const node: Element = template.content.cloneNode(true) as Element;

    this.width = this.getAttribute("width")!;
    this.value = this.getAttribute("value")!;
    this.placeholder = this.getAttribute("placeholder")!;
    this.textAlign = this.getAttribute("textAlign")! as Align;
    this.inputType = this.getAttribute("inputType") as InputType;
    this.multiple = this.hasAttribute("multiple");
    this.maxItems = this.getAttribute("maxItems") ? this.getAttribute("maxItems")! : "1";

    const required = this.getAttribute("required") !== null;
    this.canFiltering = this.getAttribute("canFiltering") !== null;
    this.validationRule = { required: required };
    this.invalidMessageDom = node.querySelector(".invalid-message") as HTMLDivElement;
    //ラベルの設定
    this.initializeLabel(node.querySelector("label")!, this.invalidMessageDom);

    //入力欄の設定
    const selectDom = node.querySelector("select")! as HTMLSelectElement;
    (async () => {
      addOption("", EMPTY_MESSAGE, selectDom);
      selectDom.addEventListener("change", (e) => {
        this.dispatchEvent(
          new CustomEvent("change", {
            detail: (e.currentTarget as HTMLSelectElement).value,
          })
        );
      });
    })();

    if (this.readonly) {
      selectDom.disabled = true;
    }
    if (this.multiple) {
      selectDom.multiple = true;
    }
    shadow.appendChild(node);
    const tomSelectOption: any = {
      plugins: ["remove_button"],
      create: false,
      maxItems: Number(this.maxItems),
      maxOptions: 999999,
      placeholder: !this.placeholder ? "" : this.placeholder,
      render: {},
    };
    this.tomSelect = new TomSelect(selectDom, tomSelectOption);
    if (this.width) {
      this.tomSelect.control.style.setProperty("width", `${this.width}px`);
    } else {
      // 幅が指定されていない場合は100%で親要素に合わせる
      this.tomSelect.control.style.setProperty("width", "100%");
    }
    if (!this.canFiltering) {
      this.tomSelect.control_input.readOnly = true;
    }
    addGlobalStylesToShadowRoot(this.shadowRoot);
    
    // グローバルスタイルの後にカスタムスタイルを追加して、TomSelectのinput-groupスタイルを上書き
    const customStyle = document.createElement('style');
    customStyle.textContent = `
      .input-group .ts-wrapper {
        border-radius: 0.375rem !important;
        border-top-left-radius: 0.375rem !important;
        border-bottom-left-radius: 0.375rem !important;
        border-top-right-radius: 0.375rem !important;
        border-bottom-right-radius: 0.375rem !important;
      }
    `;
    this.shadowRoot?.appendChild(customStyle);
  }

  /**
   * コンポーネントがDOMに接続された時に呼ばれる
   */
  connectedCallback() {
    // options属性から選択肢を読み込む
    const optionsAttr = this.getAttribute('options');
    if (optionsAttr) {
      try {
        const options = JSON.parse(optionsAttr);
        if (Array.isArray(options)) {
          const items: ListItem[] = options.map(opt => ({
            name: opt.label || opt.name,
            value: opt.value
          }));
          this.setListItems(items);
        }
      } catch (e) {
        console.error('Failed to parse options:', e);
      }
    }
    
    // 初期値を設定
    if (this.value) {
      this.setValue(this.value);
    }
  }

  /**
   * 値を設定
   * @param value 値
   */
  setValue(value: string | number | null): void {
    this.tomSelect?.setValue(value as string);
  }

  /**
   * 選択項目の中から先頭のものを取り出して現在値とする
   */
  setFirstValue(): void {
    const options = Object.values(this.tomSelect!.options);
    const minOrderOption: TomOption = options.reduce((minItem: TomOption, currentItem: TomOption) => {
      return currentItem.order < minItem.order ? currentItem : minItem;
    }, options[0]);
    if (minOrderOption) {
      this.tomSelect?.setValue(minOrderOption.value);
    }
  }

  /**
   * 値を取得
   * @returns 値
   */
  getValue(): string {
    return this.tomSelect?.getValue() as string;
  }

  /**
   * 値を数値で取得
   * @returns 値
   */
  getValueNumber(): number | null {
    return toNumber(this.getValue());
  }

  /**
   * コンポーネント内のinput要素の入力可不可切り替え
   * @param {boolean} isReadOnly trueの場合入力不可とする
   */
  setReadOnly(isReadOnly: boolean): void {
    this.tomSelect?.setDisabled(isReadOnly);
  }

  /**
   * コンポーネント内のinput要素の活性/非活性切り替え
   * @param {boolean} isEnable trueの場合活性にする
   */
  setEnable(isEnable: boolean): void {
    this.tomSelect?.setDisabled(!isEnable);
  }

  /**
   * 名称で選択項目を設定
   * @param label 表示名
   */
  setValueByLabel(label: string): void {
    const options: TomOptions = this.tomSelect?.options!;
    const target = Object.values(options).find((option) => option.text === label);
    if (!target) {
      return;
    }
    this.setValue(target.value);
  }

  /**
   * 選択中の項目の名称を取得
   * @returns 名称
   */
  getText(): string {
    const value = this.tomSelect?.getValue() as string;
    return this.tomSelect?.getItem(value)?.textContent as string;
  }

  /**
   * バリデーションチェックを実施
   * @returns 入力エラーが無ければtrue
   */
  validate(): boolean {
    const value = this.tomSelect?.getValue();

    if (this.validationRule.required && (!value || value?.length == 0)) {
      this.invalidMessageDom.innerText = "必須項目です";
      return false;
    }

    this.invalidMessageDom.innerText = "";
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
   * リストをクリア
   */
  clearList(): void {
    this.tomSelect?.clearOptions();
    this.tomSelect?.clear();
    const selectDom = this.shadowRoot?.querySelector("select") as HTMLSelectElement;
    while (selectDom.firstChild) {
      selectDom.removeChild(selectDom.firstChild);
    }
  }

  /**
   * リストが空かどうかチェック
   * @returns 空ならtrue
   */
  isListEmpty(): boolean {
    const selectDom = this.shadowRoot?.querySelector("select") as HTMLSelectElement;
    return (
      selectDom.children.length === 0 ||
      (selectDom.children.length === 1 && selectDom.children[0].textContent === EMPTY_MESSAGE)
    );
  }

  /**
   * リストアイテムを設定
   * @param items リストアイテム
   */
  setListItems(items: Array<ListItem>): void {
    this.clearList();
    const selectDom = this.shadowRoot?.querySelector("select") as HTMLSelectElement;
    addOption("", EMPTY_MESSAGE, selectDom);
    items.forEach((item: ListItem) => {
      addOption(item.value, item.name, selectDom);
    });
    this.tomSelect?.sync();

    // 幅の設定を統一（動的計算を削除）
    if (this.width) {
      this.tomSelect?.control.style.setProperty("width", `${this.width}px`);
    } else {
      this.tomSelect?.control.style.setProperty("width", "100%");
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

// 動的幅計算関数は削除（使用しないため）

/**
 * リストに項目を追加
 * @param value 値
 * @param name ラベル
 * @param selectDom 追加対象のDOM
 */
const addOption = (value: string | number, name: string, selectDom: HTMLSelectElement) => {
  const optionElement = document.createElement("option");
  optionElement.value = String(value);
  optionElement.text = name;

  selectDom.appendChild(optionElement);
};

customElements.define("custom-select", CustomSelect);

export default CustomSelect;
export type { ListItem };
