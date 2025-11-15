import { addGlobalStylesToShadowRoot } from "../lib/GlobalStyles";
import CustomElement from "./CustomElement";

/**
 * 年入力の共通コンポーネント
 */
class CustomYear extends CustomElement {
  value;
  placeholder;
  validationRule;
  invalidMessageDom: HTMLDivElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const template = document.getElementById("custom-year-template") as HTMLTemplateElement;
    const node = template.content.cloneNode(true) as HTMLElement;

    this.value = this.getAttribute("value")!;
    this.placeholder = this.getAttribute("placeholder")!;

    const required = this.getAttribute("required") !== null;
    this.validationRule = { required: required };
    this.invalidMessageDom = node.querySelector(".invalid-message") as HTMLDivElement;
    
    //ラベルの設定
    this.initializeLabel(node.querySelector("label")!, this.invalidMessageDom);

    //入力欄の設定
    const inputDom = node.querySelector("input") as HTMLInputElement;
    inputDom.id = this.name;
    inputDom.value = this.value || "";
    inputDom.placeholder = !this.placeholder ? "年を選択" : this.placeholder;
    
    if (this.readonly) {
      inputDom.readOnly = true;
      const calendarButton = node.querySelector("button") as HTMLButtonElement;
      calendarButton.disabled = true;
    }
    
    if (this.inputClass) {
      inputDom.classList.add(...this.inputClass.split(" "));
    }

    // 数字のみ入力可能にする
    inputDom.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement;
      // 数字以外を削除
      target.value = target.value.replace(/[^0-9]/g, "");
      // 4桁まで制限
      if (target.value.length > 4) {
        target.value = target.value.slice(0, 4);
      }
    });

    inputDom.addEventListener("blur", (event) => {
      const target = event.target as HTMLInputElement;
      // 4桁の数字の場合のみ値を保持
      if (target.value.length === 4) {
        this.value = target.value;
        // changeイベントを発火
        this.dispatchEvent(new CustomEvent("change", { detail: this.value }));
      } else if (target.value.length > 0) {
        // 4桁未満の場合はクリア
        target.value = "";
        this.value = "";
      }
    });

    // 年選択用のドロップダウンを作成
    const createYearDropdown = () => {
      const currentYear = new Date().getFullYear();
      const yearRange = { min: 1900, max: 2100 };
      
      // 現在の表示範囲を管理する変数
      let displayStartYear = currentYear - 10;
      let displayEndYear = currentYear + 10;
      
      // flatpickr風のドロップダウンコンテナを作成
      const dropdownContainer = document.createElement("div");
      dropdownContainer.className = "flatpickr-calendar arrowTop animate open";
      dropdownContainer.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #e6e6e6;
        border-radius: 5px;
        box-shadow: 0 2px 3px rgba(0,0,0,0.05);
        z-index: 9999;
        display: none;
        width: min(278px, 90vw);
        box-sizing: border-box;
      `;
      
      // 年選択グリッドを作成
      const yearGrid = document.createElement("div");
      yearGrid.className = "flatpickr-yearGrid";
      yearGrid.style.cssText = `
        padding: 10px;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 5px;
        height: 150px;
        overflow-y: auto;
      `;
      
      // 年グリッドを更新する関数
      const updateYearGrid = (startYear: number, endYear: number) => {
        yearGrid.innerHTML = "";
        
        for (let year = startYear; year <= endYear; year++) {
          if (year >= yearRange.min && year <= yearRange.max) {
            const yearButton = document.createElement("span");
            yearButton.className = "flatpickr-year-item";
            yearButton.textContent = year.toString();
            yearButton.dataset.year = year.toString();
            yearButton.style.cssText = `
              display: flex;
              align-items: center;
              justify-content: center;
              height: 35px;
              cursor: pointer;
              border-radius: 4px;
              transition: background-color 0.15s;
              font-size: inherit;
              user-select: none;
            `;
            
            // 現在選択されている年をハイライト
            if (this.value === year.toString()) {
              yearButton.style.backgroundColor = "#569ff7";
              yearButton.style.color = "white";
            }
            
            // ホバー効果
            yearButton.addEventListener("mouseenter", () => {
              if (this.value !== year.toString()) {
                yearButton.style.backgroundColor = "#e6e6e6";
              }
            });
            
            yearButton.addEventListener("mouseleave", () => {
              if (this.value !== year.toString()) {
                yearButton.style.backgroundColor = "transparent";
              }
            });
            
            // クリック時の処理
            yearButton.addEventListener("click", (e) => {
              e.stopPropagation();
              inputDom.value = year.toString();
              this.value = year.toString();
              this.dispatchEvent(new CustomEvent("change", { detail: this.value }));
              dropdownContainer.style.display = "none";
              
              // 選択状態を更新
              yearGrid.querySelectorAll(".flatpickr-year-item").forEach(item => {
                const itemElement = item as HTMLElement;
                if (itemElement.dataset.year === year.toString()) {
                  itemElement.style.backgroundColor = "#569ff7";
                  itemElement.style.color = "white";
                } else {
                  itemElement.style.backgroundColor = "transparent";
                  itemElement.style.color = "";
                }
              });
            });
            
            yearGrid.appendChild(yearButton);
          }
        }
      };
      
      // 初期表示の年を設定
      updateYearGrid(displayStartYear, displayEndYear);
      
      // 「もっと見る」リンク
      const moreYearsContainer = document.createElement("div");
      moreYearsContainer.style.cssText = `
        padding: 10px;
        border-top: 1px solid #e6e6e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: white;
        position: relative;
      `;
      
      const prevYearsBtn = document.createElement("span");
      prevYearsBtn.textContent = "← 過去";
      prevYearsBtn.style.cssText = `
        color: #569ff7;
        cursor: pointer;
        font-size: inherit;
        padding: 5px;
        user-select: none;
      `;
      prevYearsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        // 10年前にシフト
        displayStartYear -= 10;
        displayEndYear -= 10;
        
        // 範囲チェック
        if (displayStartYear < yearRange.min) {
          displayStartYear = yearRange.min;
          displayEndYear = Math.min(displayStartYear + 20, yearRange.max);
        }
        
        // グリッドを更新
        updateYearGrid(displayStartYear, displayEndYear);
      });
      
      const futureYearsBtn = document.createElement("span");
      futureYearsBtn.textContent = "未来 →";
      futureYearsBtn.style.cssText = `
        color: #569ff7;
        cursor: pointer;
        font-size: inherit;
        padding: 5px;
        user-select: none;
      `;
      futureYearsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        // 10年後にシフト
        displayStartYear += 10;
        displayEndYear += 10;
        
        // 範囲チェック
        if (displayEndYear > yearRange.max) {
          displayEndYear = yearRange.max;
          displayStartYear = Math.max(displayEndYear - 20, yearRange.min);
        }
        
        // グリッドを更新
        updateYearGrid(displayStartYear, displayEndYear);
      });
      
      moreYearsContainer.appendChild(prevYearsBtn);
      moreYearsContainer.appendChild(futureYearsBtn);
      
      dropdownContainer.appendChild(yearGrid);
      dropdownContainer.appendChild(moreYearsContainer);
      
      // 外側クリックで閉じる
      const closeHandler = (e: MouseEvent) => {
        const target = e.target as Node;
        // inputGroupとドロップダウン自体の外側をクリックした場合のみ閉じる
        if (!inputGroup.contains(target) && !dropdownContainer.contains(target)) {
          dropdownContainer.style.display = "none";
        }
      };
      
      // Shadow DOM外のクリックイベントを処理
      this.addEventListener("click", (e) => {
        e.stopPropagation();
      });
      
      document.addEventListener("click", closeHandler);
      
      return dropdownContainer;
    };
    
    // ドロップダウンを作成して配置（document.bodyに配置）
    const yearDropdown = createYearDropdown();
    const inputGroup = node.querySelector(".input-group") as HTMLElement;
    inputGroup.style.position = "relative";
    
    // ドロップダウンをdocument.bodyに追加（Shadow DOMの外側）
    document.body.appendChild(yearDropdown);

    // カレンダーボタンのクリックイベント
    const calendarButton = node.querySelector("button.calendar") as HTMLButtonElement;
    calendarButton.style.borderRadius = "0 0.375rem 0.375rem 0"; // 角を丸くする
    calendarButton.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!this.readonly) {
        // ドロップダウンの表示/非表示を切り替え
        const isVisible = yearDropdown.style.display === "block";
        
        if (!isVisible) {
          // ボタンの位置を取得してドロップダウンの位置を設定
          const rect = calendarButton.getBoundingClientRect();
          const inputGroupRect = inputGroup.getBoundingClientRect();
          
          // position: fixedを使用しているので、画面座標で位置を設定
          yearDropdown.style.top = `${rect.bottom + 2}px`;
          yearDropdown.style.left = `${inputGroupRect.left}px`;
          yearDropdown.style.display = "block";
          
          // 現在の値にスクロール
          if (this.value) {
            const selectedItem = yearDropdown.querySelector(`[data-year="${this.value}"]`) as HTMLElement;
            if (selectedItem) {
              selectedItem.scrollIntoView({ block: "center" });
            }
          }
        } else {
          yearDropdown.style.display = "none";
        }
      }
    });

    // Bootstrap のスタイルを Shadow DOM に追加
    addGlobalStylesToShadowRoot(shadow);
    shadow.appendChild(node);
    
    // フレックスレイアウト用のスタイルを追加
    const flexStyle = document.createElement("style");
    flexStyle.textContent = `
      :host {
        display: block;
      }
      
      .custom-year.d-flex {
        display: flex;
        align-items: center;
        margin-bottom: 0;
      }
      
      .form-label {
        margin-bottom: 0 !important;
        white-space: nowrap;
        flex-shrink: 0;
      }
      
      .form-label:not(:empty) {
        margin-right: 1rem;
      }
      
      /* ラベル幅固定クラスの定義 */
      .label-width-fixed-xsm {
        min-width: 60px;
        max-width: 60px;
      }
      
      .label-width-fixed-sm {
        min-width: 90px;
        max-width: 90px;
      }
      
      .label-width-fixed-md {
        min-width: 120px;
        max-width: 120px;
      }
      
      .label-width-fixed-lg {
        min-width: 150px;
        max-width: 150px;
      }
      
      .label-width-fixed-xlg {
        min-width: 200px;
        max-width: 200px;
      }
      
      .input-group {
        flex: 1;
      }
      
      input.form-control {
        border-radius: 0.375rem 0 0 0.375rem;
      }
      
      button.calendar {
        border-radius: 0 0.375rem 0.375rem 0;
      }
      
      .invalid-message {
        padding-left: 0;
        margin-top: 0.25rem;
      }
      
      /* エラーメッセージのマージン調整 */
      .invalid-message-xsm {
        margin-left: calc(60px + 20px);
      }
      
      .invalid-message-sm {
        margin-left: calc(90px + 20px);
      }
      
      .invalid-message-md {
        margin-left: calc(120px + 20px);
      }
      
      .invalid-message-lg {
        margin-left: calc(150px + 20px);
      }
      
      .invalid-message-xlg {
        margin-left: calc(200px + 20px);
      }
      
      /* レスポンシブ対応 - 他のコンポーネントと同じ動作 */
      @media (max-width: 768px) {
        /* 768px以下でも横並びを維持 */
        .custom-year.d-flex {
          display: flex !important;
          flex-direction: row !important;
        }
        
        .custom-year .input-group {
          flex: 1;
        }
      }
      
      /* より小さい画面でのみ縦並びに */
      @media (max-width: 576px) {
        .custom-year.d-flex {
          flex-direction: column !important;
          align-items: flex-start !important;
        }
        
        .custom-year .form-label:not(:empty) {
          margin-bottom: 0.5rem !important;
          margin-right: 0 !important;
        }
        
        .custom-year .input-group {
          width: 100%;
        }
      }
    `;
    shadow.appendChild(flexStyle);
    
    // flatpickr風のカスタムスタイルを追加
    const customStyle = document.createElement("style");
    customStyle.textContent = `
      /* flatpickr風のカレンダースタイル */
      .flatpickr-calendar {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 14px;
        line-height: 24px;
        color: #3c3f40;
      }
      
      .flatpickr-yearGrid::-webkit-scrollbar {
        width: 5px;
        height: 5px;
      }
      
      .flatpickr-yearGrid::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .flatpickr-yearGrid::-webkit-scrollbar-thumb {
        background: #c0c0c0;
        border-radius: 5px;
      }
      
      .flatpickr-yearGrid::-webkit-scrollbar-thumb:hover {
        background: #a0a0a0;
      }
      
      /* アニメーション */
      .flatpickr-calendar.animate {
        animation: fpFadeInDown 300ms cubic-bezier(0.23, 1, 0.32, 1);
      }
      
      @keyframes fpFadeInDown {
        from {
          opacity: 0;
          transform: translate3d(0, -20px, 0);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
      }
      
      /* レスポンシブ対応 */
      @media (max-width: 576px) {
        .flatpickr-calendar {
          font-size: 12px;
          line-height: 20px;
        }
        
        .flatpickr-yearGrid {
          grid-template-columns: repeat(3, 1fr) !important;
        }
      }
      
      @media (max-width: 400px) {
        .flatpickr-yearGrid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
      }
    `;
    shadow.appendChild(customStyle);
    
    // スクロール時にドロップダウンを閉じる（カレンダー内部のスクロールは除外）
    const handleScroll = (e: Event) => {
      // スクロールイベントのターゲットがドロップダウン内部でない場合のみ閉じる
      if (yearDropdown.style.display === "block" && 
          !yearDropdown.contains(e.target as Node)) {
        yearDropdown.style.display = "none";
      }
    };
    
    window.addEventListener("scroll", handleScroll, true);
    
    // ウィンドウリサイズ時にドロップダウンを閉じる
    const handleResize = () => {
      if (yearDropdown.style.display === "block") {
        yearDropdown.style.display = "none";
      }
    };
    
    window.addEventListener("resize", handleResize);
    
    // コンポーネントが削除されたときのクリーンアップ
    this.disconnectedCallback = () => {
      if (yearDropdown && yearDropdown.parentNode) {
        yearDropdown.parentNode.removeChild(yearDropdown);
      }
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }

  /**
   * 値を設定する
   * @param value 年（4桁の文字列）
   */
  setValue(value: string) {
    const input = this.shadowRoot?.querySelector("input");
    if (input) {
      if (value && value.length === 4 && /^\d{4}$/.test(value)) {
        input.value = value;
        this.value = value;
      } else {
        input.value = "";
        this.value = "";
      }
    }
  }

  /**
   * 値を取得する
   * @returns 年（4桁の文字列）
   */
  getValue(): string {
    const input = this.shadowRoot?.querySelector("input");
    return input?.value || "";
  }

  /**
   * 読み取り専用を設定する
   * @param readonly 読み取り専用
   */
  setReadOnly(readonly: boolean) {
    const input = this.shadowRoot?.querySelector("input");
    const button = this.shadowRoot?.querySelector("button");
    if (input) {
      input.readOnly = readonly;
    }
    if (button) {
      (button as HTMLButtonElement).disabled = readonly;
    }
    this.readonly = readonly;
  }

  /**
   * 必須を設定する
   * @param required 必須
   */
  setRequired(required: boolean) {
    this.validationRule.required = required;
    const label = this.shadowRoot?.querySelector("label");
    if (label) {
      if (required) {
        label.classList.add("required");
      } else {
        label.classList.remove("required");
      }
    }
  }

  /**
   * バリデーションを実行する
   * @returns バリデーション結果
   */
  validate(): boolean {
    const input = this.shadowRoot?.querySelector("input") as HTMLInputElement;
    const value = input?.value || "";
    const messages: string[] = [];

    // 必須チェック
    if (this.validationRule.required && !value) {
      messages.push(`${this.logicalName}は必須項目です`);
    }

    // 年形式チェック（4桁の数字）
    if (value && !/^\d{4}$/.test(value)) {
      messages.push(`${this.logicalName}は4桁の数字で入力してください`);
    }

    // 年の範囲チェック（1900-2100）
    if (value && /^\d{4}$/.test(value)) {
      const year = parseInt(value);
      if (year < 1900 || year > 2100) {
        messages.push(`${this.logicalName}は1900年から2100年の間で入力してください`);
      }
    }

    // エラーメッセージの表示
    this.showInvalidMessage(messages);

    return messages.length === 0;
  }

  /**
   * エラーメッセージを表示する
   * @param messages エラーメッセージ
   */
  private showInvalidMessage(messages: string[]) {
    if (this.invalidMessageDom) {
      this.invalidMessageDom.innerHTML = "";
      messages.forEach((message) => {
        const li = document.createElement("li");
        li.textContent = message;
        this.invalidMessageDom.appendChild(li);
      });
    }
  }
}

// カスタム要素として登録
if (!customElements.get("custom-year")) {
  customElements.define("custom-year", CustomYear);
}

export default CustomYear;