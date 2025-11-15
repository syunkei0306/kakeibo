/**
 * 登録モーダルコンポーネント
 * 登録確認ダイアログと成功メッセージを表示するモーダル
 */
export default class RegisterModal {
  private confirmModal: HTMLElement | null = null;
  private successModal: HTMLElement | null = null;
  private confirmBackdrop: HTMLElement | null = null;
  private successBackdrop: HTMLElement | null = null;
  private messageElement: HTMLElement | null = null;
  private iconElement: HTMLElement | null = null;
  private errorMessageElement: HTMLElement | null = null;
  private confirmYesButton: HTMLButtonElement | null = null;
  private confirmNoButton: HTMLButtonElement | null = null;
  private errorCloseButton: HTMLButtonElement | null = null;
  private confirmMessageElement: HTMLElement | null = null;
  private subtitleElement: HTMLElement | null = null;
  private isInitialized = false;
  private defaultMessage: string;
  private defaultSubtitle: string;
  private onConfirmCallback: (() => Promise<string>) | null = null;
  private onErrorCloseCallback: (() => void) | null = null;

  constructor(message: string = '登録が完了しました', subtitle: string = '画面を移動します...') {
    this.defaultMessage = message;
    this.defaultSubtitle = subtitle;
    this.initialize();
  }

  /**
   * モーダルの初期化
   */
  private initialize(): void {
    // モーダルのHTML構造を動的に作成
    this.createModals();
    this.isInitialized = true;
  }

  /**
   * モーダルのHTML構造を作成
   */
  private createModals(): void {
    // 確認モーダルのバックドロップ
    this.confirmBackdrop = document.createElement('div');
    this.confirmBackdrop.className = 'modal-backdrop fade';
    this.confirmBackdrop.style.display = 'none';

    // 確認モーダル本体
    this.confirmModal = document.createElement('div');
    this.confirmModal.className = 'modal fade';
    this.confirmModal.id = 'registerConfirmModal';
    this.confirmModal.setAttribute('tabindex', '-1');
    this.confirmModal.style.display = 'none';

    this.confirmModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">登録確認</h5>
          </div>
          <div class="modal-body">
            <p class="confirm-message">データを登録します。よろしいですか？</p>
            <div class="register-error-message alert alert-danger d-none" role="alert">
              <i class="bi bi-exclamation-triangle-fill"></i>
              エラー
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-confirm-no">いいえ</button>
            <button type="button" class="btn btn-primary btn-confirm-yes">はい</button>
            <button type="button" class="btn btn-secondary btn-error-close d-none">閉じる</button>
          </div>
        </div>
      </div>
    `;

    // 成功モーダルのバックドロップ
    this.successBackdrop = document.createElement('div');
    this.successBackdrop.className = 'modal-backdrop fade';
    this.successBackdrop.style.display = 'none';

    // 成功モーダル本体
    this.successModal = document.createElement('div');
    this.successModal.className = 'modal fade';
    this.successModal.id = 'registerSuccessModal';
    this.successModal.setAttribute('tabindex', '-1');
    this.successModal.style.display = 'none';

    this.successModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body text-center py-4">
            <div class="register-success-icon mb-3">
              <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
            </div>
            <h5 class="register-success-message mb-3">登録が完了しました</h5>
            <div class="text-muted">
              <small class="register-success-subtitle">画面を移動します...</small>
            </div>
          </div>
        </div>
      </div>
    `;

    // 要素の参照を保存
    this.messageElement = this.successModal.querySelector('.register-success-message');
    this.iconElement = this.successModal.querySelector('.register-success-icon');
    this.subtitleElement = this.successModal.querySelector('.register-success-subtitle');
    this.errorMessageElement = this.confirmModal.querySelector('.register-error-message');
    this.confirmMessageElement = this.confirmModal.querySelector('.confirm-message');
    this.confirmYesButton = this.confirmModal.querySelector('.btn-confirm-yes');
    this.confirmNoButton = this.confirmModal.querySelector('.btn-confirm-no');
    this.errorCloseButton = this.confirmModal.querySelector('.btn-error-close');

    // イベントリスナーの設定
    this.setupEventListeners();

    // DOMに追加
    document.body.appendChild(this.confirmBackdrop);
    document.body.appendChild(this.confirmModal);
    document.body.appendChild(this.successBackdrop);
    document.body.appendChild(this.successModal);

    // CSSアニメーションを追加
    this.addAnimationStyles();
  }
  
  /**
   * イベントリスナーの設定
   */
  private setupEventListeners(): void {
    // 「はい」ボタンのクリックイベント
    this.confirmYesButton?.addEventListener('click', async () => {
      if (this.onConfirmCallback) {
        // ボタンを無効化
        if (this.confirmYesButton) this.confirmYesButton.disabled = true;
        if (this.confirmNoButton) this.confirmNoButton.disabled = true;

        // 「はい」ボタンを「登録中...」に変更
        const originalButtonHTML = this.confirmYesButton ? this.confirmYesButton.innerHTML : '';
        if (this.confirmYesButton) {
          this.confirmYesButton.innerHTML = '<i class="bi bi-arrow-repeat" style="animation: spin 1s linear infinite;"></i> 登録中...';
        }

        // コールバックを実行（バリデーション＆サーバー処理）
        const errorMessage = await this.onConfirmCallback();

        // ボタンを元に戻す
        if (this.confirmYesButton && originalButtonHTML) {
          this.confirmYesButton.innerHTML = originalButtonHTML;
        }

        if (errorMessage === '') {
          // 空文字列の場合は成功、確認モーダルを閉じる
          this.hideConfirm();
          // 成功メッセージは呼び出し元が必要に応じて表示
        } else {
          // エラーメッセージを表示
          this.showCustomError(errorMessage);
          // ボタンを再度有効化
          if (this.confirmYesButton) this.confirmYesButton.disabled = false;
          if (this.confirmNoButton) this.confirmNoButton.disabled = false;
        }
      }
    });

    // 「いいえ」ボタンのクリックイベント
    this.confirmNoButton?.addEventListener('click', () => {
      this.hideConfirm();
    });

    // 「閉じる」ボタンのクリックイベント（エラー時）
    this.errorCloseButton?.addEventListener('click', () => {
      this.hideConfirm();
      // コールバックがある場合は実行
      if (this.onErrorCloseCallback) {
        this.onErrorCloseCallback();
        this.onErrorCloseCallback = null; // コールバックをクリア
      }
    });
  }

  /**
   * アニメーション用のスタイルを追加
   */
  private addAnimationStyles(): void {
    // 既存のスタイルタグがあるか確認
    if (document.getElementById('register-modal-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'register-modal-styles';
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
   * 確認ダイアログを表示
   * @param onConfirm 「はい」ボタン押下時のコールバック（バリデーション処理）
   *                  空文字列を返すと成功、エラーメッセージ文字列を返すとエラー表示
   */
  public showConfirm(onConfirm: () => Promise<string>): void {
    if (!this.isInitialized || !this.confirmModal || !this.confirmBackdrop) {
      console.error('RegisterModal is not initialized');
      return;
    }

    // コールバックを保存
    this.onConfirmCallback = onConfirm;

    // エラーメッセージを非表示にリセット
    this.hideError();

    // ボタンを有効化
    if (this.confirmYesButton) this.confirmYesButton.disabled = false;
    if (this.confirmNoButton) this.confirmNoButton.disabled = false;

    // モーダルを表示
    this.confirmBackdrop.style.display = 'block';
    this.confirmModal.style.display = 'block';

    // アニメーションクラスを追加
    setTimeout(() => {
      this.confirmBackdrop?.classList.add('show');
      this.confirmModal?.classList.add('show');
    }, 10);
  }

  /**
   * 登録成功モーダルを表示（呼び出し元から直接呼ばれる）
   * @param onComplete 完了時のコールバック（画面遷移など）
   */
  public showSuccess(onComplete?: () => void): void {
    if (!this.isInitialized || !this.successModal || !this.successBackdrop) {
      console.error('RegisterModal is not initialized');
      return;
    }

    // デフォルトメッセージを設定
    if (this.messageElement) {
      this.messageElement.textContent = this.defaultMessage;
    }

    // デフォルトサブタイトルを設定
    if (this.subtitleElement) {
      this.subtitleElement.textContent = this.defaultSubtitle;
    }

    // モーダルを表示
    this.successBackdrop.style.display = 'block';
    this.successModal.style.display = 'block';

    // アニメーションクラスを追加
    setTimeout(() => {
      this.successBackdrop?.classList.add('show');
      this.successModal?.classList.add('show');
      this.iconElement?.classList.add('show');
      this.messageElement?.classList.add('show');
    }, 10);

    // 自動的に閉じて画面遷移
    setTimeout(() => {
      this.hideSuccess();
      if (onComplete) {
        onComplete();
      }
    }, 2000); // 2秒後に自動で閉じる
  }

  /**
   * 確認モーダルを閉じる
   */
  public hideConfirm(): void {
    if (!this.confirmModal || !this.confirmBackdrop) return;

    // アニメーションクラスを削除
    this.confirmModal.classList.remove('show');
    this.confirmBackdrop.classList.remove('show');

    // 完全に非表示にする
    setTimeout(() => {
      if (this.confirmModal) this.confirmModal.style.display = 'none';
      if (this.confirmBackdrop) this.confirmBackdrop.style.display = 'none';
    }, 300);
  }

  /**
   * 成功モーダルを閉じる
   */
  private hideSuccess(): void {
    if (!this.successModal || !this.successBackdrop) return;

    // アニメーションクラスを削除
    this.successModal.classList.remove('show');
    this.successBackdrop.classList.remove('show');
    this.iconElement?.classList.remove('show');
    this.messageElement?.classList.remove('show');

    // 完全に非表示にする
    setTimeout(() => {
      if (this.successModal) this.successModal.style.display = 'none';
      if (this.successBackdrop) this.successBackdrop.style.display = 'none';
    }, 300);
  }

  /**
   * エラーメッセージを表示
   */
  private showError(): void {
    if (this.errorMessageElement) {
      // デフォルトのエラーメッセージに戻す
      this.errorMessageElement.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> エラー';
      this.errorMessageElement.classList.remove('d-none');
    }
    // 確認メッセージを非表示
    if (this.confirmMessageElement) {
      this.confirmMessageElement.classList.add('d-none');
    }
    // 「はい」「いいえ」ボタンを非表示
    if (this.confirmYesButton) {
      this.confirmYesButton.classList.add('d-none');
    }
    if (this.confirmNoButton) {
      this.confirmNoButton.classList.add('d-none');
    }
    // 「閉じる」ボタンを表示
    if (this.errorCloseButton) {
      this.errorCloseButton.classList.remove('d-none');
    }
  }

  /**
   * エラーメッセージを非表示
   */
  private hideError(): void {
    if (this.errorMessageElement) {
      this.errorMessageElement.classList.add('d-none');
    }
    // 確認メッセージを表示
    if (this.confirmMessageElement) {
      this.confirmMessageElement.classList.remove('d-none');
    }
    // 「はい」「いいえ」ボタンを表示
    if (this.confirmYesButton) {
      this.confirmYesButton.classList.remove('d-none');
    }
    if (this.confirmNoButton) {
      this.confirmNoButton.classList.remove('d-none');
    }
    // 「閉じる」ボタンを非表示
    if (this.errorCloseButton) {
      this.errorCloseButton.classList.add('d-none');
    }
  }

  /**
   * カスタムエラーメッセージを表示
   * @param message 表示するエラーメッセージ
   * @param onClose 閉じるボタンクリック時のコールバック（オプション）
   */
  public showCustomError(message: string, onClose?: () => void): void {
    if (!this.isInitialized || !this.confirmModal || !this.confirmBackdrop) {
      console.error('RegisterModal is not initialized');
      return;
    }

    // コールバックを保存
    this.onErrorCloseCallback = onClose || null;

    // エラーメッセージをカスタムメッセージに変更
    if (this.errorMessageElement) {
      this.errorMessageElement.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> ${message}`;
      this.errorMessageElement.classList.remove('d-none');
    }

    // 確認メッセージを非表示
    if (this.confirmMessageElement) {
      this.confirmMessageElement.classList.add('d-none');
    }

    // 「はい」「いいえ」ボタンを非表示
    if (this.confirmYesButton) {
      this.confirmYesButton.classList.add('d-none');
    }
    if (this.confirmNoButton) {
      this.confirmNoButton.classList.add('d-none');
    }

    // 「閉じる」ボタンを表示
    if (this.errorCloseButton) {
      this.errorCloseButton.classList.remove('d-none');
    }

    // ボタンを元に戻す処理
    const btnRegister = document.getElementById('btnRegister') as HTMLButtonElement;
    if (btnRegister) {
      btnRegister.innerHTML = '<i class="bi bi-save"></i> 登録';
      btnRegister.disabled = false;
    }

    // モーダルを表示
    this.confirmBackdrop.style.display = 'block';
    this.confirmModal.style.display = 'block';

    // アニメーションクラスを追加
    setTimeout(() => {
      this.confirmBackdrop?.classList.add('show');
      this.confirmModal?.classList.add('show');
    }, 10);
  }
}
