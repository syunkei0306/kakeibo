import { Modal } from 'bootstrap';

/**
 * 登録確認ダイアログコンポーネント
 * 登録・更新時に確認ダイアログを表示するモーダル
 */
export default class RegisterConfirmDialog {
  private modal: Modal | null = null;
  private modalElement: HTMLElement | null = null;
  private messageElement: HTMLElement | null = null;
  private confirmButton: HTMLElement | null = null;
  private cancelButton: HTMLElement | null = null;
  private onConfirmCallback: (() => void | Promise<void>) | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * モーダルの初期化
   */
  private initialize(): void {
    this.modalElement = document.getElementById('registerConfirmDialog');
    if (this.modalElement) {
      this.modal = new Modal(this.modalElement);
      this.messageElement = document.getElementById('registerConfirmMessage');
      this.confirmButton = document.getElementById('btnConfirmRegister');
      this.cancelButton = document.getElementById('btnCancelRegister');

      // 確認ボタンのイベントリスナーを設定
      this.confirmButton?.addEventListener('click', async (e) => {
        const button = e.currentTarget as HTMLButtonElement;
        button.style.transform = 'scale(0.95)';

        setTimeout(async () => {
          button.style.transform = 'scale(1)';
          await this.handleConfirm();
        }, 150);
      });
    }
  }

  /**
   * 確認ダイアログを表示
   * @param message 表示するメッセージ
   * @param onConfirm 確認時のコールバック関数
   */
  public show(message: string, onConfirm: () => void | Promise<void>): void {
    if (!this.modal || !this.messageElement) {
      console.error('登録確認ダイアログが初期化されていません');
      return;
    }

    // メッセージを設定
    this.messageElement.textContent = message;

    // コールバックを保存
    this.onConfirmCallback = onConfirm;

    // モーダルを表示
    this.modal.show();
  }

  /**
   * モーダルを非表示
   */
  public hide(): void {
    if (this.modal) {
      this.modal.hide();
    }
  }

  /**
   * 確認時の処理
   */
  private async handleConfirm(): Promise<void> {
    // モーダル内の確認ボタンを無効化
    if (this.confirmButton) {
      this.confirmButton.disabled = true;
    }

    // キャンセルボタンも無効化
    if (this.cancelButton) {
      this.cancelButton.disabled = true;
    }

    // コールバックを実行
    if (this.onConfirmCallback) {
      try {
        // モーダルを閉じる
        this.hide();

        // コールバックを実行（RegisterConfirmModalが完了メッセージを担当）
        await this.onConfirmCallback();
      } catch (error) {
        console.error('登録処理でエラーが発生しました:', error);
      } finally {
        // モーダル内のボタンを元に戻す（エラー時のため）
        if (this.confirmButton) {
          this.confirmButton.disabled = false;
        }
        if (this.cancelButton) {
          this.cancelButton.disabled = false;
        }
      }

      // コールバックをクリア
      this.onConfirmCallback = null;
    }
  }


  /**
   * クリーンアップ処理
   */
  public dispose(): void {
    if (this.modal) {
      this.modal.dispose();
    }

    this.modal = null;
    this.modalElement = null;
    this.messageElement = null;
    this.confirmButton = null;
    this.cancelButton = null;
    this.onConfirmCallback = null;
  }
}