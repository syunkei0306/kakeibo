import { TabulatorFull as Tabulator } from 'tabulator-tables';

/**
 * エラーサマリーを表示
 * @param errors エラーメッセージの配列
 */
export const showErrorSummary = (errors: string[]): void => {
  const errorSummary = document.getElementById('errorSummary');
  const errorList = document.getElementById('errorList');

  if (!errorSummary || !errorList || errors.length === 0) {
    return;
  }

  // エラーリストをクリア
  errorList.innerHTML = '';

  // エラーメッセージを追加
  errors.forEach(error => {
    const li = document.createElement('li');
    li.textContent = error;
    errorList.appendChild(li);
  });

  // エラーサマリーを表示
  errorSummary.style.display = 'block';
  errorSummary.classList.add('show'); // fade効果用にshowクラスを追加

  // エラーサマリーの位置までスクロール
  errorSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/**
 * エラーサマリーを非表示
 */
export const hideErrorSummary = (): void => {
  const errorSummary = document.getElementById('errorSummary');
  if (errorSummary) {
    errorSummary.style.display = 'none';
  }
};

/**
 * 旧部門履歴の相関チェック
 * @param table Tabulatorテーブルインスタンス
 * @param tableName テーブル名（エラーメッセージ用）
 * @returns エラーメッセージの配列
 */
export const validateDepartmentHistoryTable = (table: Tabulator, tableName: string = '旧部門履歴'): string[] => {
  const errors: string[] = [];
  const data = table.getData();

  // 各行の必須チェック
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row.startDate || !row.endDate || !row.department) {
      errors.push(`${tableName}${i + 1}行目：必須項目を入力してください。`);
    }
  }

  // 各行の開始日≦終了日チェック
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row.startDate && row.endDate) {
      const startDate = new Date(row.startDate);
      const endDate = new Date(row.endDate);
      if (startDate > endDate) {
        errors.push(`${tableName}${i + 1}行目：開始日が終了日より後になっています。`);
      }
    }
  }

  // 時系列チェック: n行の終了日 >= n+1行の開始日
  for (let i = 0; i < data.length - 1; i++) {
    const currentEndDate = new Date(data[i].endDate);
    const nextStartDate = new Date(data[i + 1].startDate);

    if (currentEndDate >= nextStartDate) {
      errors.push(`${tableName}${i + 1}行目と${i + 2}行目：開始日と終了日が時系列で入力されていません。`);
    }
  }

  return errors;
};

/**
 * 補助金テーブルのバリデーション
 * @param table Tabulatorテーブルインスタンス
 * @returns エラーメッセージの配列
 */
export const validateSubsidyTable = (table: Tabulator): string[] => {
  const errors: string[] = [];
  const data = table.getData();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row.name) {
      errors.push(`補助金${i + 1}行目：名称を入力してください。`);
    }
    if (!row.periodStart) {
      errors.push(`補助金${i + 1}行目：制約期間（開始）を入力してください。`);
    }
    if (!row.periodEnd) {
      errors.push(`補助金${i + 1}行目：制約期間（終了）を入力してください。`);
    }
    if (row.amount === null || row.amount === undefined || row.amount === '') {
      errors.push(`補助金${i + 1}行目：金額を入力してください。`);
    }
  }

  // 各行の制約期間（開始）≦制約期間（終了）チェック
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row.periodStart && row.periodEnd) {
      const startDate = new Date(row.periodStart);
      const endDate = new Date(row.periodEnd);
      if (startDate > endDate) {
        errors.push(`補助金${i + 1}行目：制約期間（開始）が制約期間（終了）より後になっています。`);
      }
    }
  }

  return errors;
};

/**
 * 添付ファイルテーブルのバリデーション
 * @param table Tabulatorテーブルインスタンス
 * @returns エラーメッセージの配列
 */
export const validateAttachmentTable = (table: Tabulator): string[] => {
  const errors: string[] = [];
  const data = table.getData();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row.category) {
      errors.push(`添付ファイル${i + 1}行目：分類を選択してください。`);
    }
  }

  return errors;
};
