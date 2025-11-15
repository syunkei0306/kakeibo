/**
 * 検索ボタンにローディングアニメーションを適用して非同期処理を実行
 * @param button - 対象のボタン要素
 * @param searchAction - 実行する検索処理（Promise）
 * @param loadingText - ローディング中のテキスト（デフォルト: '検索中...'）
 */
export const performSearchWithAnimation = async (
  button: HTMLButtonElement,
  searchAction: () => Promise<void>,
  loadingText: string = '検索中...'
): Promise<void> => {
  button.style.transform = 'scale(0.95)';

  setTimeout(async () => {
    button.style.transform = 'scale(1)';

    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<i class="bi bi-arrow-repeat me-2" style="animation: spin 1s linear infinite;"></i>${loadingText}`;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    try {
      await searchAction();
    } finally {
      button.disabled = false;
      button.innerHTML = originalText;
      document.head.removeChild(style);
    }
  }, 150);
};

/**
 * 汎用的なボタンクリックアニメーション
 * @param button - 対象のボタン要素
 * @param action - 実行する処理
 */
export const performButtonClickAnimation = (
  button: HTMLButtonElement,
  action: () => void
): void => {
  button.style.transform = 'scale(0.95)';
  setTimeout(() => {
    button.style.transform = 'scale(1)';
    action();
  }, 150);
};
