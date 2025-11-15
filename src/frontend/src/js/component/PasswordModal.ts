import { Modal } from 'bootstrap';

export default class PasswordModal {
  private modal: HTMLElement | null = null;
  private confirmButton: HTMLButtonElement | null = null;
  private messageElement: HTMLElement | null = null;

  constructor() {
    this.initializeModal();
  }

  private initializeModal(): void {
    // モーダル要素を作成
    const modalHtml = `
      <div class="modal fade" id="passwordConfirmModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">パスワード再設定</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p id="passwordConfirmMessage">パスワードを再設定してもよろしいですか？</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
              <button type="button" id="btnPasswordConfirm" class="btn btn-primary">確認</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // モーダルをDOMに追加
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer.firstElementChild!);

    this.modal = document.getElementById('passwordConfirmModal');
    this.confirmButton = document.getElementById('btnPasswordConfirm') as HTMLButtonElement;
    this.messageElement = document.getElementById('passwordConfirmMessage');
  }

  showConfirm(callback: () => Promise<string>): void {
    if (!this.modal || !this.confirmButton) return;

    const modalInstance = new Modal(this.modal);
    modalInstance.show();

    // 確認ボタンのクリックイベント
    this.confirmButton.onclick = async () => {
      const result = await callback();
      if (result === '') {
        // 成功時はモーダルを閉じる
        modalInstance.hide();
      } else {
        // エラーメッセージがある場合は表示
        alert(result);
        modalInstance.hide();
      }
    };
  }

  hideConfirm(): void {
    if (this.modal) {
      const modalInstance = Modal.getInstance(this.modal);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

  showCustomError(message: string, callback?: () => void): void {
    alert(message);
    if (callback) {
      callback();
    }
  }
}