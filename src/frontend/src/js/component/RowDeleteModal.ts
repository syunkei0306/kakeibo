/**
 * 行削除モーダルコンポーネント
 * テーブル行削除用の軽量な確認ダイアログ
 */
export default class RowDeleteModal {
  private confirmModal: HTMLElement | null = null;
  private confirmBackdrop: HTMLElement | null = null;
  private confirmYesButton: HTMLButtonElement | null = null;
  private confirmNoButton: HTMLButtonElement | null = null;
  private confirmMessageElement: HTMLElement | null = null;
  private isInitialized = false;
  private onConfirmCallback: (() => void) | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * モーダルの初期化
   */
  private initialize(): void {
    // モーダルのHTML構造を動的に作成
    this.createModal();
    this.isInitialized = true;
  }

  /**
   * モーダルのHTML構造を作成
   */
  private createModal(): void {
    // 確認モーダルのバックドロップ
    this.confirmBackdrop = document.createElement('div');
    this.confirmBackdrop.className = 'modal-backdrop fade';
    this.confirmBackdrop.style.display = 'none';

    // 確認モーダル本体
    this.confirmModal = document.createElement('div');
    this.confirmModal.className = 'modal fade';
    this.confirmModal.id = 'rowDeleteConfirmModal';
    this.confirmModal.setAttribute('tabindex', '-1');
    this.confirmModal.style.display = 'none';

    this.confirmModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">削除確認</h5>
          </div>
          <div class="modal-body">
            <p class="confirm-message mb-0">選択した行を削除します。よろしいですか？</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-confirm-no">いいえ</button>
            <button type="button" class="btn btn-danger btn-confirm-yes">はい</button>
          </div>
        </div>
      </div>
    `;

    // 要素の参照を保存
    this.confirmMessageElement = this.confirmModal.querySelector('.confirm-message');
    this.confirmYesButton = this.confirmModal.querySelector('.btn-confirm-yes');
    this.confirmNoButton = this.confirmModal.querySelector('.btn-confirm-no');

    // イベントリスナーの設定
    this.setupEventListeners();

    // DOMに追加
    document.body.appendChild(this.confirmBackdrop);
    document.body.appendChild(this.confirmModal);

    // CSSアニメーションを追加
    this.addAnimationStyles();
  }

  /**
   * イベントリスナーの設定
   */
  private setupEventListeners(): void {
    // 「はい」ボタンのクリックイベント
    this.confirmYesButton?.addEventListener('click', () => {
      if (this.onConfirmCallback) {
        // コールバックを実行（同期的な削除処理）
        this.onConfirmCallback();
        this.onConfirmCallback = null;
      }
      // モーダルを閉じる
      this.hide();
    });

    // 「いいえ」ボタンのクリックイベント
    this.confirmNoButton?.addEventListener('click', () => {
      this.hide();
    });
  }

  /**
   * アニメーション用のスタイルを追加
   */
  private addAnimationStyles(): void {
    // 既存のスタイルタグがあるか確認
    if (document.getElementById('row-delete-modal-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'row-delete-modal-styles';
    style.textContent = `
      #rowDeleteConfirmModal .modal-dialog {
        transition: transform 0.15s ease-out;
      }

      #rowDeleteConfirmModal.show .modal-dialog {
        transform: translate(0, 0);
      }

      #rowDeleteConfirmModal.fade .modal-dialog {
        transform: translate(0, -30px);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 確認ダイアログを表示
   * @param message 確認メッセージ
   * @param onConfirm 「はい」ボタン押下時のコールバック
   */
  public show(message: string, onConfirm: () => void): void {
    if (!this.isInitialized || !this.confirmModal || !this.confirmBackdrop) {
      console.error('RowDeleteModal is not initialized');
      return;
    }

    // メッセージを設定
    if (this.confirmMessageElement) {
      this.confirmMessageElement.textContent = message;
    }

    // コールバックを保存
    this.onConfirmCallback = onConfirm;

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
   * 確認モーダルを閉じる
   */
  public hide(): void {
    if (!this.confirmModal || !this.confirmBackdrop) return;

    // アニメーションクラスを削除
    this.confirmModal.classList.remove('show');
    this.confirmBackdrop.classList.remove('show');

    // 完全に非表示にする
    setTimeout(() => {
      if (this.confirmModal) this.confirmModal.style.display = 'none';
      if (this.confirmBackdrop) this.confirmBackdrop.style.display = 'none';
    }, 150);
  }
}
