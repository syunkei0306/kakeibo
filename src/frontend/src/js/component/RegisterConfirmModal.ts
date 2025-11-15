/**
 * 登録確認モーダルコンポーネント
 * 登録成功時にメッセージを表示し、自動的に画面遷移するモーダル
 */
export default class RegisterConfirmModal {
  private modal: HTMLElement | null = null;
  private backdrop: HTMLElement | null = null;
  private messageElement: HTMLElement | null = null;
  private iconElement: HTMLElement | null = null;
  private additionalContentElement: HTMLElement | null = null;
  private closeButton: HTMLElement | null = null;
  private isInitialized = false;
  private defaultMessage: string;
  private autoCloseTimeout: number | null = null;
  private onCompleteCallback: (() => void) | null = null;

  constructor(message: string = '登録が完了しました') {
    this.defaultMessage = message;
    this.initialize();
  }
  
  /**
   * モーダルの初期化
   */
  private initialize(): void {
    // 既存のモーダルをチェック
    const existingModal = document.getElementById('registerSuccessModal');
    if (existingModal) {
      this.modal = existingModal;
      this.messageElement = this.modal.querySelector('.register-success-message');
      this.iconElement = this.modal.querySelector('.register-success-icon');
      this.isInitialized = true;
      return;
    }
    
    // モーダルのHTML構造を動的に作成
    this.createModal();
    this.isInitialized = true;
  }
  
  /**
   * モーダルのHTML構造を作成
   */
  private createModal(): void {
    // バックドロップの作成
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop fade';
    this.backdrop.style.display = 'none';
    
    // モーダル本体の作成
    this.modal = document.createElement('div');
    this.modal.className = 'modal fade';
    this.modal.id = 'registerSuccessModal';
    this.modal.setAttribute('tabindex', '-1');
    this.modal.style.display = 'none';
    
    this.modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body text-center py-4">
            <div class="register-success-icon mb-3">
              <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
            </div>
            <h5 class="register-success-message mb-3">登録が完了しました</h5>
            <div class="register-additional-content mb-3" style="display: none;"></div>
            <div class="text-muted register-auto-close-message">
              <small>画面を移動します...</small>
            </div>
            <button type="button" class="btn btn-primary register-close-button mt-3" style="display: none;">
              閉じる
            </button>
          </div>
        </div>
      </div>
    `;

    // 要素の参照を保存
    this.messageElement = this.modal.querySelector('.register-success-message');
    this.iconElement = this.modal.querySelector('.register-success-icon');
    this.additionalContentElement = this.modal.querySelector('.register-additional-content');
    this.closeButton = this.modal.querySelector('.register-close-button');
    
    // DOMに追加
    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.modal);

    // 閉じるボタンのイベントリスナーを追加
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => {
        this.hide();
        // onCompleteコールバックを実行
        if (this.onCompleteCallback) {
          this.onCompleteCallback();
          this.onCompleteCallback = null;
        }
      });
    }

    // CSSアニメーションを追加
    this.addAnimationStyles();
  }
  
  /**
   * アニメーション用のスタイルを追加
   */
  private addAnimationStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes checkmark {
        0% {
          transform: scale(0) rotate(0deg);
          opacity: 0;
        }
        50% {
          transform: scale(1.2) rotate(360deg);
        }
        100% {
          transform: scale(1) rotate(360deg);
          opacity: 1;
        }
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .register-success-icon.show {
        animation: checkmark 0.6s ease-out;
      }
      
      .register-success-message.show {
        animation: fadeInUp 0.4s ease-out 0.3s both;
      }
      
      .modal.show .modal-dialog {
        transform: translate(0, 0);
        transition: transform 0.3s ease-out;
      }
      
      .modal.fade .modal-dialog {
        transform: translate(0, -50px);
        transition: transform 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * 登録成功モーダルを表示
   * @param options 表示オプション
   */
  public show(options?: {
    message?: string;
    additionalContent?: string;
    autoClose?: boolean;
    onComplete?: () => void;
  }): void {
    if (!this.isInitialized || !this.modal || !this.backdrop) {
      console.error('RegisterConfirmModal is not initialized');
      return;
    }

    // オプションのデフォルト値
    const {
      message = this.defaultMessage,
      additionalContent = '',
      autoClose = true,
      onComplete
    } = options || {};

    // onCompleteコールバックを保存
    this.onCompleteCallback = onComplete || null;

    // メッセージを設定
    if (this.messageElement) {
      this.messageElement.textContent = message;
    }

    // 追加コンテンツを設定
    if (this.additionalContentElement) {
      if (additionalContent) {
        this.additionalContentElement.innerHTML = additionalContent;
        this.additionalContentElement.style.display = 'block';
      } else {
        this.additionalContentElement.style.display = 'none';
      }
    }

    // 自動クローズメッセージと閉じるボタンの表示制御
    const autoCloseMessage = this.modal.querySelector('.register-auto-close-message') as HTMLElement;
    if (autoCloseMessage) {
      autoCloseMessage.style.display = autoClose ? 'block' : 'none';
    }
    if (this.closeButton) {
      this.closeButton.style.display = autoClose ? 'none' : 'block';
    }

    // モーダルを表示
    this.backdrop.style.display = 'block';
    this.modal.style.display = 'block';

    // アニメーションクラスを追加
    setTimeout(() => {
      this.backdrop?.classList.add('show');
      this.modal?.classList.add('show');
      this.iconElement?.classList.add('show');
      this.messageElement?.classList.add('show');
    }, 10);

    // 既存のタイムアウトをクリア
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
      this.autoCloseTimeout = null;
    }

    // 自動的に閉じて画面遷移
    if (autoClose) {
      this.autoCloseTimeout = window.setTimeout(() => {
        this.hide();
        if (this.onCompleteCallback) {
          this.onCompleteCallback();
          this.onCompleteCallback = null;
        }
      }, 2000); // 2秒後に自動で閉じる
    }
  }
  
  /**
   * モーダルを閉じる
   */
  public hide(): void {
    if (!this.modal || !this.backdrop) return;

    // 既存のタイムアウトをクリア
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
      this.autoCloseTimeout = null;
    }

    // アニメーションクラスを削除
    this.modal.classList.remove('show');
    this.backdrop.classList.remove('show');
    this.iconElement?.classList.remove('show');
    this.messageElement?.classList.remove('show');

    // 完全に非表示にする
    setTimeout(() => {
      if (this.modal) this.modal.style.display = 'none';
      if (this.backdrop) this.backdrop.style.display = 'none';
    }, 300);
  }
  
}