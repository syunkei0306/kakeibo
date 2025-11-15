import { Modal } from 'bootstrap';

/**
 * 削除確認モーダルクラス
 * 各画面から共通で使用できる削除確認モーダルを提供
 */
export default class DeleteConfirmModal {
  private modal: Modal | null = null;
  private modalElement: HTMLElement | null = null;
  private messageElement: HTMLElement | null = null;
  private confirmButton: HTMLElement | null = null;
  private cancelButton: HTMLElement | null = null;
  private closeButton: HTMLElement | null = null;
  private successMessageDiv: HTMLElement | null = null;
  private successTextElement: HTMLElement | null = null;
  private onConfirmCallback: (() => void | Promise<void>) | null = null;
  private triggerButton: HTMLButtonElement | null = null;
  private triggerButtonOriginalContent: string = '';

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
    this.modalElement = document.getElementById('deleteConfirmModal');
    if (this.modalElement) {
      this.modal = new Modal(this.modalElement);
      this.messageElement = document.getElementById('deleteConfirmMessage');
      this.confirmButton = document.getElementById('btnConfirmDelete');
      this.cancelButton = document.getElementById('btnCancelDelete');
      this.closeButton = document.getElementById('btnCloseDelete');
      this.successMessageDiv = document.getElementById('deleteSuccessMessage');
      this.successTextElement = document.getElementById('deleteSuccessText');
      
      // 削除ボタンのイベントリスナーを設定
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
   * @param onConfirm 削除確認時のコールバック関数
   * @param successMessage 削除完了時のメッセージ（オプション）
   * @param triggerButton 呼び出し元の削除ボタン（オプション）
   */
  public show(message: string, onConfirm: () => void | Promise<void>, successMessage?: string, triggerButton?: HTMLButtonElement): void {
    if (!this.modal || !this.messageElement) {
      console.error('削除確認モーダルが初期化されていません');
      return;
    }

    // メッセージを設定
    this.messageElement.textContent = message;
    
    // 成功メッセージを設定
    if (this.successTextElement && successMessage) {
      this.successTextElement.textContent = successMessage;
    }
    
    // コールバックを保存
    this.onConfirmCallback = onConfirm;
    
    // 呼び出し元ボタンを保存
    if (triggerButton) {
      this.triggerButton = triggerButton;
      this.triggerButtonOriginalContent = triggerButton.innerHTML;
    }
    
    // UIを初期状態にリセット
    this.resetModalState();
    
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
   * 削除確認時の処理
   */
  private async handleConfirm(): Promise<void> {
    // モーダル内の削除ボタンを無効化
    if (this.confirmButton) {
      this.confirmButton.disabled = true;
    }
    
    // 呼び出し元の削除ボタンを「削除中...」に変更（button-rules.mdに準拠）
    if (this.triggerButton) {
      this.triggerButton.innerHTML = '<i class="bi bi-arrow-repeat" style="animation: spin 1s linear infinite;"></i> 削除中...';
      this.triggerButton.disabled = true;
      
      // スピンアニメーション用のスタイルを追加
      this.addSpinAnimation();
    }
    
    // キャンセルボタンも無効化
    if (this.cancelButton) {
      this.cancelButton.disabled = true;
    }
    
    // コールバックを実行
    if (this.onConfirmCallback) {
      try {
        await this.onConfirmCallback();
        
        // 成功メッセージを表示
        this.showSuccessMessage();
      } catch (error) {
        console.error('削除処理でエラーが発生しました:', error);
        // エラーの場合はモーダルを閉じる
        this.hide();
      } finally {
        // モーダル内のボタンを元に戻す（エラー時のため）
        if (this.confirmButton) {
          this.confirmButton.disabled = false;
        }
        if (this.cancelButton) {
          this.cancelButton.disabled = false;
        }
        
        // 呼び出し元ボタンを元に戻す（エラー時のため）
        if (this.triggerButton && this.triggerButtonOriginalContent) {
          this.triggerButton.innerHTML = this.triggerButtonOriginalContent;
          this.triggerButton.disabled = false;
        }
      }
      
      // コールバックをクリア
      this.onConfirmCallback = null;
    }
  }

  /**
   * スピンアニメーション用のスタイルを追加
   */
  private addSpinAnimation(): void {
    // すでにスタイルが存在する場合は追加しない
    if (document.getElementById('deleteModalSpinStyle')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'deleteModalSpinStyle';
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 成功メッセージを表示してUIを更新
   */
  private showSuccessMessage(): void {
    // 呼び出し元ボタンを元に戻す
    if (this.triggerButton && this.triggerButtonOriginalContent) {
      this.triggerButton.innerHTML = this.triggerButtonOriginalContent;
      this.triggerButton.disabled = false;
    }
    
    // 確認メッセージを非表示
    if (this.messageElement) {
      this.messageElement.classList.add('d-none');
    }
    
    // 成功メッセージを表示
    if (this.successMessageDiv) {
      this.successMessageDiv.classList.remove('d-none');
    }
    
    // ボタンの表示を切り替え
    if (this.confirmButton) {
      this.confirmButton.classList.add('d-none');
    }
    if (this.cancelButton) {
      this.cancelButton.classList.add('d-none');
    }
    if (this.closeButton) {
      this.closeButton.classList.remove('d-none');
    }
    
    // 1.5秒後に自動的にモーダルを閉じる
    setTimeout(() => {
      this.hide();
    }, 1500);
  }

  /**
   * モーダルのUI状態をリセット
   */
  private resetModalState(): void {
    // 確認メッセージを表示
    if (this.messageElement) {
      this.messageElement.classList.remove('d-none');
    }
    
    // 成功メッセージを非表示
    if (this.successMessageDiv) {
      this.successMessageDiv.classList.add('d-none');
    }
    
    // ボタンの表示をリセット
    if (this.confirmButton) {
      this.confirmButton.classList.remove('d-none');
    }
    if (this.cancelButton) {
      this.cancelButton.classList.remove('d-none');
    }
    if (this.closeButton) {
      this.closeButton.classList.add('d-none');
    }
  }

  /**
   * クリーンアップ処理
   */
  public dispose(): void {
    if (this.confirmButton) {
      // イベントリスナーは自動的にガベージコレクションされるため、
      // 明示的な削除は不要（ボタン要素が削除されれば自動的に削除される）
    }
    
    if (this.modal) {
      this.modal.dispose();
    }
    
    this.modal = null;
    this.modalElement = null;
    this.messageElement = null;
    this.confirmButton = null;
    this.onConfirmCallback = null;
    this.triggerButton = null;
    this.triggerButtonOriginalContent = '';
  }
}