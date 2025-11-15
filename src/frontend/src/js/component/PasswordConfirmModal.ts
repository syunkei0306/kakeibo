import { Modal } from 'bootstrap';

/**
 * パスワード再設定確認モーダルクラス
 * 各画面から共通で使用できるパスワード再設定確認モーダルを提供
 */
export default class PasswordConfirmModal {
  private modal: Modal | null = null;
  private modalElement: HTMLElement | null = null;
  private messageElement: HTMLElement | null = null;
  private confirmButton: HTMLElement | null = null;
  private cancelButton: HTMLElement | null = null;
  private onConfirmCallback: (() => string | Promise<string>) | null = null;

  /**
   * コンストラクタ
   */
  constructor() {
    this.initialize();
  }

  /**
   * モーダルの初期化
   */
  private initialize(): void {
    this.modalElement = document.getElementById('passwordConfirmModal');
    if (this.modalElement) {
      this.modal = new Modal(this.modalElement);
      this.messageElement = document.getElementById('passwordConfirmMessage');
      this.confirmButton = document.getElementById('btnConfirmPassword');
      this.cancelButton = document.getElementById('btnCancelPassword');

      // 再設定ボタンのイベントリスナーを設定
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
   * モーダルを表示
   * @param message 表示するメッセージ
   * @param onConfirm パスワード再設定確認時のコールバック関数（ランダムコードを返す）
   */
  public show(message: string, onConfirm: () => string | Promise<string>): void {
    if (!this.modal || !this.messageElement) {
      console.error('パスワード再設定確認モーダルが初期化されていません');
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
   * パスワード再設定確認時の処理
   */
  private async handleConfirm(): Promise<void> {
    // モーダル内の再設定ボタンを無効化
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
        console.error('パスワード再設定処理でエラーが発生しました:', error);
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