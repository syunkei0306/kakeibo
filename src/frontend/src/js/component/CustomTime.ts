import { addGlobalStylesToShadowRoot } from "../lib/GlobalStyles";
import CustomElement from "./CustomElement";

/**
 * 時刻入力の共通コンポーネント
 */
class CustomTime extends CustomElement {
  value: string;
  placeholder: string;
  validationRule: { required: boolean };
  invalidMessageDom: HTMLDivElement;
  private timeDropdown: HTMLDivElement | null = null;
  private closeHandler: ((e: MouseEvent) => void) | null = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const template = document.getElementById("custom-time-template") as HTMLTemplateElement;
    const node = template.content.cloneNode(true) as HTMLElement;

    this.value = this.getAttribute("value") || "";
    this.placeholder = this.getAttribute("placeholder") || "";

    const required = this.getAttribute("required") !== null;
    this.validationRule = { required: required };
    this.invalidMessageDom = node.querySelector(".invalid-message") as HTMLDivElement;
    
    // ラベルの設定
    this.initializeLabel(node.querySelector("label")!, this.invalidMessageDom);

    // 入力欄の設定
    const inputDom = node.querySelector("input") as HTMLInputElement;
    inputDom.id = this.name;
    inputDom.value = this.value;
    inputDom.placeholder = !this.placeholder ? "" : this.placeholder;
    
    // ボタンの設定
    const clockButton = node.querySelector(".clock") as HTMLButtonElement;
    
    if (this.readonly) {
      inputDom.readOnly = true;
      clockButton.disabled = true;
    }
    
    if (this.disabled) {
      inputDom.disabled = true;
      clockButton.disabled = true;
    }
    
    if (this.inputClass) {
      inputDom.classList.add(...this.inputClass.split(" "));
    }
    
    // フォーカスアウト時のバリデーション
    inputDom.addEventListener("blur", () => {
      this.validate();
    });
    
    // 手動入力時の処理
    inputDom.addEventListener("change", () => {
      this.value = inputDom.value;
      this.dispatchEvent(new CustomEvent("change", { detail: this.value }));
    });
    
    // タイムピッカーダイアログを作成
    const createTimeDropdown = () => {
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
        width: 200px;
        padding: 10px;
        box-sizing: border-box;
      `;
      
      // コンテナ（時間と分を横並び）
      const timeContainer = document.createElement("div");
      timeContainer.style.cssText = `
        display: flex;
        gap: 10px;
      `;
      
      // 時間列のラベル
      const hourLabel = document.createElement("div");
      hourLabel.textContent = "時";
      hourLabel.style.cssText = `
        text-align: center;
        font-weight: 600;
        margin-bottom: 8px;
        color: #3c3f40;
        font-size: 13px;
        letter-spacing: 0.5px;
      `;
      
      // 分列のラベル
      const minuteLabel = document.createElement("div");
      minuteLabel.textContent = "分";
      minuteLabel.style.cssText = `
        text-align: center;
        font-weight: 600;
        margin-bottom: 8px;
        color: #3c3f40;
        font-size: 13px;
        letter-spacing: 0.5px;
      `;
      
      // 時間列
      const hourColumn = document.createElement("div");
      hourColumn.style.cssText = `
        flex: 1;
      `;
      
      const hourScroll = document.createElement("div");
      hourScroll.className = "flatpickr-time-scroll";
      hourScroll.style.cssText = `
        height: 180px;
        overflow-y: auto;
        border: 1px solid #e6e6e6;
        border-radius: 4px;
        padding: 3px;
        background: #fafafa;
      `;
      
      // 分列
      const minuteColumn = document.createElement("div");
      minuteColumn.style.cssText = `
        flex: 1;
      `;
      
      const minuteScroll = document.createElement("div");
      minuteScroll.className = "flatpickr-time-scroll";
      minuteScroll.style.cssText = `
        height: 180px;
        overflow-y: auto;
        border: 1px solid #e6e6e6;
        border-radius: 4px;
        padding: 3px;
        background: #fafafa;
      `;
      
      // 現在の時刻を解析
      let currentHour = "";
      let currentMinute = "";
      if (this.value && this.value.includes(":")) {
        const parts = this.value.split(":");
        currentHour = parts[0].padStart(2, "0");
        currentMinute = parts[1].padStart(2, "0");
      }
      
      // 時間アイテムを生成（00〜23）
      for (let h = 0; h < 24; h++) {
        const hourStr = h.toString().padStart(2, "0");
        const hourItem = document.createElement("div");
        hourItem.textContent = hourStr;
        hourItem.dataset.hour = hourStr;
        hourItem.style.cssText = `
          padding: 6px 8px;
          text-align: center;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.15s ease;
          user-select: none;
          font-size: 14px;
          ${currentHour === hourStr ? 'background-color: #569ff7; color: white; font-weight: 600;' : 'color: #3c3f40; font-weight: normal;'}
        `;
        
        hourItem.addEventListener("mouseenter", () => {
          if (currentHour !== hourStr) {
            hourItem.style.backgroundColor = "#e6e6e6";
          }
        });
        
        hourItem.addEventListener("mouseleave", () => {
          if (currentHour !== hourStr) {
            hourItem.style.backgroundColor = "transparent";
          }
        });
        
        hourItem.addEventListener("click", (e) => {
          e.stopPropagation();
          // 以前の選択をクリア
          hourScroll.querySelectorAll("div").forEach(item => {
            const itemElement = item as HTMLElement;
            itemElement.style.backgroundColor = "transparent";
            itemElement.style.color = "#3c3f40";
            itemElement.style.fontWeight = "normal";
          });
          // 新しい選択を設定
          currentHour = hourStr;
          hourItem.style.backgroundColor = "#569ff7";
          hourItem.style.color = "white";
          hourItem.style.fontWeight = "600";
          updateSelection();
        });
        
        hourScroll.appendChild(hourItem);
      }
      
      // 分アイテムを生成（00〜59）
      for (let m = 0; m < 60; m++) {
        const minuteStr = m.toString().padStart(2, "0");
        const minuteItem = document.createElement("div");
        minuteItem.textContent = minuteStr;
        minuteItem.dataset.minute = minuteStr;
        minuteItem.style.cssText = `
          padding: 6px 8px;
          text-align: center;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.15s ease;
          user-select: none;
          font-size: 14px;
          ${currentMinute === minuteStr ? 'background-color: #569ff7; color: white; font-weight: 600;' : 'color: #3c3f40; font-weight: normal;'}
        `;
        
        minuteItem.addEventListener("mouseenter", () => {
          if (currentMinute !== minuteStr) {
            minuteItem.style.backgroundColor = "#e6e6e6";
          }
        });
        
        minuteItem.addEventListener("mouseleave", () => {
          if (currentMinute !== minuteStr) {
            minuteItem.style.backgroundColor = "transparent";
          }
        });
        
        minuteItem.addEventListener("click", (e) => {
          e.stopPropagation();
          // 以前の選択をクリア
          minuteScroll.querySelectorAll("div").forEach(item => {
            const itemElement = item as HTMLElement;
            itemElement.style.backgroundColor = "transparent";
            itemElement.style.color = "#3c3f40";
            itemElement.style.fontWeight = "normal";
          });
          // 新しい選択を設定
          currentMinute = minuteStr;
          minuteItem.style.backgroundColor = "#569ff7";
          minuteItem.style.color = "white";
          minuteItem.style.fontWeight = "600";
          updateSelection();
        });
        
        minuteScroll.appendChild(minuteItem);
      }
      
      // 選択を更新
      const updateSelection = () => {
        if (currentHour && currentMinute) {
          const newValue = `${currentHour}:${currentMinute}`;
          inputDom.value = newValue;
          this.value = newValue;
          this.dispatchEvent(new CustomEvent("change", { detail: this.value }));
          
          // 選択状態を更新
          hourScroll.querySelectorAll("div").forEach(item => {
            const itemElement = item as HTMLElement;
            if (itemElement.dataset.hour === currentHour) {
              itemElement.style.backgroundColor = "#569ff7";
              itemElement.style.color = "white";
              itemElement.style.fontWeight = "600";
            } else {
              itemElement.style.backgroundColor = "transparent";
              itemElement.style.color = "#3c3f40";
              itemElement.style.fontWeight = "normal";
            }
          });
          
          minuteScroll.querySelectorAll("div").forEach(item => {
            const itemElement = item as HTMLElement;
            if (itemElement.dataset.minute === currentMinute) {
              itemElement.style.backgroundColor = "#569ff7";
              itemElement.style.color = "white";
              itemElement.style.fontWeight = "600";
            } else {
              itemElement.style.backgroundColor = "transparent";
              itemElement.style.color = "#3c3f40";
              itemElement.style.fontWeight = "normal";
            }
          });
        }
      };
      
      // 構造を組み立て
      hourColumn.appendChild(hourLabel);
      hourColumn.appendChild(hourScroll);
      minuteColumn.appendChild(minuteLabel);
      minuteColumn.appendChild(minuteScroll);
      timeContainer.appendChild(hourColumn);
      timeContainer.appendChild(minuteColumn);
      dropdownContainer.appendChild(timeContainer);
      
      return dropdownContainer;
    };
    
    // ドロップダウンを作成してdocument.bodyに配置
    this.timeDropdown = createTimeDropdown();
    const inputGroup = node.querySelector(".input-group") as HTMLElement;
    document.body.appendChild(this.timeDropdown);
    
    // グローバルにflatpickr風のスタイルを追加（document.bodyに配置されるドロップダウン用）
    if (!document.getElementById('custom-time-flatpickr-styles')) {
      const globalStyle = document.createElement('style');
      globalStyle.id = 'custom-time-flatpickr-styles';
      globalStyle.textContent = `
        .flatpickr-calendar.arrowTop::before,
        .flatpickr-calendar.arrowTop::after {
          position: absolute;
          display: block;
          pointer-events: none;
          border: solid transparent;
          content: '';
          height: 0;
          width: 0;
          left: 22px;
        }
        
        .flatpickr-calendar.arrowTop::before {
          border-width: 0 9px 9px 9px;
          border-bottom-color: #e6e6e6;
          top: -9px;
        }
        
        .flatpickr-calendar.arrowTop::after {
          border-width: 0 8px 8px 8px;
          border-bottom-color: white;
          top: -8px;
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
        
        .flatpickr-time-scroll::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        
        .flatpickr-time-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .flatpickr-time-scroll::-webkit-scrollbar-thumb {
          background: #c0c0c0;
          border-radius: 5px;
        }
        
        .flatpickr-time-scroll::-webkit-scrollbar-thumb:hover {
          background: #a0a0a0;
        }
      `;
      document.head.appendChild(globalStyle);
    }
    
    // 時計ボタンクリック時の処理
    clockButton.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!this.readonly && !this.disabled && this.timeDropdown) {
        const isVisible = this.timeDropdown.style.display === "block";
        
        if (!isVisible) {
          // ボタンの位置を取得してドロップダウンの位置を設定
          const rect = clockButton.getBoundingClientRect();
          const inputGroupRect = inputGroup.getBoundingClientRect();
          
          this.timeDropdown.style.top = `${rect.bottom + 2}px`;
          this.timeDropdown.style.left = `${inputGroupRect.left}px`;
          this.timeDropdown.style.display = "block";
          
          // 現在の値にスクロール
          if (this.value && this.value.includes(":")) {
            const parts = this.value.split(":");
            const hourItem = this.timeDropdown.querySelector(`[data-hour="${parts[0].padStart(2, "0")}"]`) as HTMLElement;
            const minuteItem = this.timeDropdown.querySelector(`[data-minute="${parts[1].padStart(2, "0")}"]`) as HTMLElement;
            
            if (hourItem) {
              hourItem.scrollIntoView({ block: "center" });
            }
            if (minuteItem) {
              minuteItem.scrollIntoView({ block: "center" });
            }
          }
          
          // 外側クリックで閉じるイベントリスナーを追加
          if (!this.closeHandler) {
            this.closeHandler = (e: MouseEvent) => {
              const target = e.target as Node;
              if (this.timeDropdown && 
                  !inputGroup.contains(target) && 
                  !this.timeDropdown.contains(target)) {
                this.hideTimeDropdown();
              }
            };
          }
          // setTimeoutを使って、現在のクリックイベントが完了してから登録
          setTimeout(() => {
            document.addEventListener("click", this.closeHandler!);
          }, 0);
        } else {
          this.hideTimeDropdown();
        }
      }
    });

    // サーバ側バリデーション結果があれば表示する
    const errors = this.getAttribute("error");
    if (errors != null) {
      const errorMessages = errors.slice(1).slice(0, -1).split(", ");
      errorMessages.forEach((message) => {
        this.viewErrorMessage(message);
      });
    }

    shadow.appendChild(node);

    addGlobalStylesToShadowRoot(this.shadowRoot);
    
    // フレックスレイアウト用のスタイルを追加
    const flexStyle = document.createElement("style");
    flexStyle.textContent = `
      :host {
        display: block;
      }
      
      .custom-time.d-flex {
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
      
      button.clock {
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
        .custom-time.d-flex {
          display: flex !important;
          flex-direction: row !important;
        }
        
        .custom-time .input-group {
          flex: 1;
        }
      }
      
      /* より小さい画面でのみ縦並びに */
      @media (max-width: 576px) {
        .custom-time.d-flex {
          flex-direction: column !important;
          align-items: flex-start !important;
        }
        
        .custom-time .form-label:not(:empty) {
          margin-bottom: 0.5rem !important;
          margin-right: 0 !important;
        }
        
        .custom-time .input-group {
          width: 100%;
        }
      }
    `;
    shadow.appendChild(flexStyle);
    
    // input[type="time"]のネイティブアイコンを非表示にするスタイルを追加
    const style = document.createElement('style');
    style.textContent = `
      /* Chrome, Safari, Edge, Opera */
      input[type="time"]::-webkit-calendar-picker-indicator {
        display: none;
        -webkit-appearance: none;
      }
      
      /* Firefox */
      input[type="time"]::-moz-calendar-picker-indicator {
        display: none;
        appearance: none;
      }
      
      /* IE */
      input[type="time"]::-ms-clear {
        display: none;
      }
      
      /* flatpickr風のスタイル */
      .flatpickr-calendar {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 14px;
        line-height: 24px;
        color: #3c3f40;
      }
      
      .flatpickr-calendar.arrowTop:before,
      .flatpickr-calendar.arrowTop:after {
        position: absolute;
        display: block;
        pointer-events: none;
        border: transparent;
        content: '';
        height: 0;
        width: 0;
        left: 22px;
      }
      
      .flatpickr-calendar.arrowTop:before {
        border-width: 0 9px 9px 9px;
        border-bottom-color: #e6e6e6;
        top: -9px;
      }
      
      .flatpickr-calendar.arrowTop:after {
        border-width: 0 8px 8px 8px;
        border-bottom-color: white;
        top: -8px;
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
      
      /* スクロールバーのスタイル */
      .flatpickr-time-scroll::-webkit-scrollbar {
        width: 5px;
        height: 5px;
      }
      
      .flatpickr-time-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .flatpickr-time-scroll::-webkit-scrollbar-thumb {
        background: #c0c0c0;
        border-radius: 5px;
      }
      
      .flatpickr-time-scroll::-webkit-scrollbar-thumb:hover {
        background: #a0a0a0;
      }
    `;
    shadow.appendChild(style);
  }

  /**
   * ドロップダウンを非表示にする
   */
  private hideTimeDropdown(): void {
    if (this.timeDropdown) {
      this.timeDropdown.style.display = "none";
    }
    // イベントリスナーを削除
    if (this.closeHandler) {
      document.removeEventListener("click", this.closeHandler);
    }
  }

  /**
   * 値を設定
   * @param value 値（HH:mm形式）
   */
  setValue(value: string | null) {
    const inputDom = this.shadowRoot?.querySelector("input");
    if (inputDom) {
      inputDom.value = value || "";
      this.value = value || "";
    }
  }

  /**
   * 値を取得（HH:mm形式）
   * @returns 値
   */
  getValue(): string {
    const inputDom = this.shadowRoot?.querySelector("input");
    return inputDom ? inputDom.value : "";
  }

  /**
   * 値を秒数で取得
   * @returns 0:00からの秒数、または時刻として扱えない場合はnull
   */
  getSecondsValue(): number | null {
    const value = this.getValue();
    if (!value) {
      return null;
    }
    
    const timeParts = value.split(":");
    if (timeParts.length !== 2) {
      return null;
    }
    
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return null;
    }
    
    return hours * 3600 + minutes * 60;
  }

  /**
   * バリデーションチェックを実施
   * @returns エラーが無ければtrue
   */
  validate(): boolean {
    // 現在表示中のエラーメッセージを消去
    this.resetErrorMessage();

    const inputDom = this.shadowRoot?.querySelector("input");
    const value = inputDom!.value;

    if (this.validationRule.required && !value) {
      this.viewErrorMessage("値を入力してください。");
      return false;
    }
    
    // 時刻形式のチェック（HH:mm形式）
    if (value && !this.isValidTimeFormat(value)) {
      this.viewErrorMessage("正しい時刻形式（HH:mm）で入力してください。");
      return false;
    }
    
    return true;
  }

  /**
   * 時刻形式が正しいかチェック
   * @param value 時刻文字列
   * @returns 正しい形式ならtrue
   */
  private isValidTimeFormat(value: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(value);
  }

  /**
   * エラーメッセージを画面に表示
   * @param message メッセージ
   */
  viewErrorMessage(message: string): void {
    const li = document.createElement("li");
    li.innerText = message;
    this.invalidMessageDom!.appendChild(li);
  }

  /**
   * エラーメッセージの画面表示をリセット
   */
  resetErrorMessage(): void {
    while (this.invalidMessageDom.firstChild) {
      this.invalidMessageDom.removeChild(this.invalidMessageDom.firstChild);
    }
  }

  /**
   * 読み取り専用の設定を上書き
   * @param isReadOnly trueの場合入力不可とする
   */
  override setReadOnly(isReadOnly: boolean): void {
    const inputDom = this.shadowRoot?.querySelector("input");
    const clockButton = this.shadowRoot?.querySelector(".clock") as HTMLButtonElement;
    if (inputDom) {
      inputDom.readOnly = isReadOnly;
    }
    if (clockButton) {
      clockButton.disabled = isReadOnly;
    }
    this.readonly = isReadOnly;
  }

  /**
   * 活性/非活性の設定を上書き
   * @param isEnable trueの場合活性にする
   */
  override setEnable(isEnable: boolean): void {
    const inputDom = this.shadowRoot?.querySelector("input");
    const clockButton = this.shadowRoot?.querySelector(".clock") as HTMLButtonElement;
    if (inputDom) {
      inputDom.disabled = !isEnable;
    }
    if (clockButton) {
      clockButton.disabled = !isEnable;
    }
    this.disabled = !isEnable;
  }

  /**
   * コンポーネントがDOMから削除された時の処理
   */
  disconnectedCallback(): void {
    // クリーンアップ：イベントリスナーを削除
    if (this.closeHandler) {
      document.removeEventListener("click", this.closeHandler);
    }
    // ドロップダウンを削除
    if (this.timeDropdown && this.timeDropdown.parentNode) {
      this.timeDropdown.parentNode.removeChild(this.timeDropdown);
    }
  }
}

customElements.define("custom-time", CustomTime);
export default CustomTime;