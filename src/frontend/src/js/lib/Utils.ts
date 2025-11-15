import { AxiosError, HttpStatusCode } from "axios";

export const getCSRFToken = () => {
  if (import.meta.env.MODE === "development") {
    return { csrfHeader: "csrf", csrfToken: "development" };
  }
  const csrfToken = document.querySelector('meta[name="_csrf"]')!.getAttribute("content");
  const csrfHeader = document.querySelector('meta[name="_csrf_header"]')!.getAttribute("content");
  return { csrfHeader, csrfToken };
};

export const createCSRFTokenElement = () => {
  const csrf = getCSRFToken();
  const element = document.createElement("input");
  element.setAttribute("type", "hidden");
  element.setAttribute("name", "_csrf");
  element.setAttribute("value", csrf.csrfToken!);
  return element;
};

/**
 * パラメータで渡された文字列を number に変換（変換できない場合は null を返却）
 * @param {string | null} value 文字列
 * @returns {number | null} 数値
 */
export const toNumber = (value: string | null): number | null => {
  if (value === "" || value === null) return null;

  const intVal = Number(value);
  if (!Number.isFinite(intVal)) return null;

  return intVal;
};

/**
 * パラメータで渡された文字列を Date に変換（変換できない場合は null を返却）
 * @param {string | null} value 文字列
 * @returns {Date | null} 日時
 */
export const toDate = (value?: string | Date | null): Date | null => {
  if (value === "" || value === null || value === undefined) return null;
  // パラメータが Date の場合はそのまま返却
  if (value instanceof Date) {
    return value;
  }

  const match_YYYY_MM_DD = value.match(/^\d{4}[-\/]\d{2}[-\/]\d{2}$/);
  const match_YYYY_MM_D = value.match(/^\d{4}[-\/]\d{2}[-\/]\d$/);
  const match_YYYY_MM = value.match(/^\d{4}[-\/]\d{2}$/);
  const match_YYYY_M_DD = value.match(/^\d{4}[-\/]\d[-\/]\d{2}$/);
  const match_YYYY_M_D = value.match(/^\d{4}[-\/]\d[-\/]\d$/);
  const match_YYYY_M = value.match(/^\d{4}[-\/]\d$/);
  const match_YYYY = value.match(/^\d{4}$/);

  // 日付のみの文字列で new Date() を実施した場合、時間が UTC として扱われてしまうため、日本時間の0時として扱われるように設定して返す
  const isDateOnly =
    match_YYYY_MM_DD ||
    match_YYYY_MM_D ||
    match_YYYY_MM ||
    match_YYYY_M_DD ||
    match_YYYY_M_D ||
    match_YYYY_M ||
    match_YYYY;
  if (isDateOnly) {
    const year = Number(value.slice(0, 4));
    let month = 1;
    let day = 1;

    if (match_YYYY_MM_DD || match_YYYY_MM_D || match_YYYY_MM) {
      // 月2桁パターン
      month = Number(value.slice(5, 7));
      if (match_YYYY_MM_DD) {
        // 日2桁パターン
        day = Number(value.slice(8, 10));
      } else if (match_YYYY_MM_D) {
        // 日1桁パターン
        day = Number(value.slice(8, 9));
      }
    } else if (match_YYYY_M_DD || match_YYYY_M_D || match_YYYY_M) {
      // 月1桁パターン
      month = Number(value.slice(5, 6));
      if (match_YYYY_M_DD) {
        // 日2桁パターン
        day = Number(value.slice(7, 9));
      } else if (match_YYYY_M_D) {
        // 日1桁パターン
        day = Number(value.slice(7, 8));
      }
    }

    const dateVal = new Date(year, month - 1, day);
    if (isNaN(dateVal.getDate())) {
      return null;
    }
    return dateVal;
  } else {
    const dateVal = new Date(value);
    if (isNaN(dateVal.getDate())) {
      return null;
    }
    return dateVal;
  }
};

/**
 * Date を YYYY/MM/DD の文字列に変換
 * @param {Date} date 日付
 * @returns {string} YYYY/MM/DD形式の日付文字列
 */
export const formatToSlashDate = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = ("00" + (date.getMonth() + 1)).slice(-2);
  const dd = ("00" + date.getDate()).slice(-2);
  return `${yyyy}/${mm}/${dd}`;
};

/**
 * Date を YYYY/MM の文字列に変換
 * @param {Date} date 日付
 * @returns {string} YYYY/MM形式の日付文字列
 */
export const formatToSlashMonth = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = ("00" + (date.getMonth() + 1)).slice(-2);
  return `${yyyy}/${mm}`;
};

/**
 * Date を YYYY-MM-DD の文字列に変換
 * @param {Date} date 日付
 * @returns {string} YYYY-MM-DD形式の日付文字列
 */
export const formatToHyphenDate = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = ("00" + (date.getMonth() + 1)).slice(-2);
  const dd = ("00" + date.getDate()).slice(-2);
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Date を YYYY-MM の文字列に変換
 * @param {Date} date 日付
 * @returns {string} YYYY-MM形式の日付文字列
 */
export const formatToHyphenMonth = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = ("00" + (date.getMonth() + 1)).slice(-2);
  return `${yyyy}-${mm}`;
};

/**
 * Date または日時文字列を YYYY/MM/DD HH:mm:ss の文字列に変換
 * @param {string | Date | null | undefined} dateString 日時文字列またはDateオブジェクト
 * @returns {string} YYYY/MM/DD HH:mm:ss形式の日時文字列、変換できない場合は'-'
 */
export const formatDateTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return '-';
  }
};

/**
 * 半角ハイフンを半角スラッシュに変換
 * @param value
 * @returns {string | null} 半角スラッシュに変換された文字列、またはnull
 */
export const hyphenToSlash = (value: string | null): string | null => {
  return value?.replace(/-/g, "/") ?? null;
};

/**
 * 半角スラッシュを半角ハイフンに変換
 * @param value
 * @returns {string | null} 半角ハイフンに変換された文字列、またはnull
 */
export const slashToHyphen = (value: string | null): string | null => {
  return value?.replace(/\//g, "-") ?? null;
};

/**
 * 文字列がnullやundefinedの時、空文字に変換する
 * @param {*} value 文字列
 * @returns {string} 空文字またはvalueをそのまま返す
 */
export const nullToEmpty = (value: string): string => {
  if (value === null || value === undefined) {
    return "";
  }
  return value;
};

/**
 * 画面上部にアラートメッセージを表示
 * @param {string} message メッセージ
 * @param {"info"|"success"|"danger"} alertType アラートの種類
 */
export const viewAlertMessage = (message: string, alertType: "info" | "success" | "danger") => {
  const headerAlert = document.getElementById("headerAlert")!;
  headerAlert.querySelector(".message")!.innerHTML = message;
  headerAlert.classList.remove("alert-info", "alert-success", "alert-danger");
  headerAlert.classList.add(`alert-${alertType}`);
  headerAlert.classList.remove("hidden");
  headerAlert.querySelector(".btn-close")!.addEventListener(
    "click",
    () => {
      headerAlert.classList.add("hidden");
    },
    false
  );
};

/**
 * エラーに応じたメッセージを表示
 * @param err エラー
 * @param customMessages カスタムメッセージ配列（HTTPステータスコードとメッセージのペア、同じHTTPステータスコードを何度も使用しないこと）
 */
export const viewHttpRequestErrorMessage = (
  err: unknown,
  customMessages?: readonly [HttpStatusCode | "otherError", string][]
) => {
  console.trace(err);
  getHttpRequestErrorMessage(err, customMessages).then((message) => {
    console.error(message);
    viewAlertMessage(message, "danger");
  });
};

/**
 * エラーに応じたブラウザ標準のアラートを表示
 * @param err エラー
 * @param customMessages カスタムメッセージ配列（HTTPステータスコードとメッセージのペア、同じHTTPステータスコードを何度も使用しないこと）
 */
export const alertHttpRequestErrorMessage = (
  err: unknown,
  customMessages?: readonly [HttpStatusCode | "otherError", string][]
) => {
  console.trace(err);
  getHttpRequestErrorMessage(err, customMessages).then((message) => {
    console.error(message);
    alert(message);
  });
};

/**
 * エラーに応じたメッセージを取得
 * @param err {*} エラー
 * @param customMessages {*} カスタムメッセージ配列（HTTPステータスコードとメッセージのペア、同じHTTPステータスコードを何度も使用しないこと）
 * @returns {Promise<string>} エラーメッセージ
 */
const getHttpRequestErrorMessage = async (
  err: unknown,
  customMessages?: readonly [HttpStatusCode | "otherError", string][]
) => {
  if (err instanceof AxiosError) {
    // カスタムメッセージが渡されている場合は該当する HTTP ステータスコードの場合に表示
    const message = customMessages?.find((message) => message[0] === err.status);
    if (message) {
      return message[1];
    }

    // Not Found
    if (err.status === HttpStatusCode.NotFound) {
      return "対象のデータがありません。";
    }
    // Forbidden
    if (err.status === HttpStatusCode.Forbidden) {
      return "権限エラーが発生しました。許可されていない操作が実施されたか、タイムアウトによりログアウトされました。";
    }
    // Bad Request
    if (err.status === HttpStatusCode.BadRequest) {
      const isDownloadError = err.request.responseType === "blob";
      const response = err.response ?? null;
      if (response !== null) {
        // ファイルダウンロード時のエラー
        const responseData = isDownloadError ? await blobToJson(response.data) : response.data;
        // バリデーションエラー用
        const errorMessages = responseData.errors;
        if (errorMessages) {
          return errorMessages;
        }
        // その他クライアントエラー用
        const message = responseData.error;
        if (message) {
          return message;
        }
      }
    }
  }

  // キャッチしきれない例外発生時のメッセージ
  const message = customMessages?.find((message) => message[0] === "otherError");
  if (message) {
    return message[1];
  } else {
    return "エラーが発生しました。";
  }
};

/**
 * BlobをJSONオブジェクトに変換
 * @param data
 * @returns {Promise<any>} JSONオブジェクト
 */
const blobToJson = (data: Blob): Promise<any> => {
  const fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onerror = () => {
      fileReader.abort();
      reject();
    };

    fileReader.onload = () => {
      const text = fileReader.result as string;
      const jsonObject = JSON.parse(text);
      resolve(jsonObject);
    };

    fileReader.readAsText(data);
  });
};

/**
 * 課税区分フラグをフォーマット
 * @param {number | null | undefined} taxFlg 課税区分フラグ（0: 不課税、1: 課税）
 * @returns {string} フォーマット済みの課税区分文字列
 */
export const formatTaxFlag = (taxFlg: number | null | undefined): string => {
  if (taxFlg === null || taxFlg === undefined) {
    return '-';
  }
  return taxFlg === 0 ? '不課税' : '課税';
};

/**
 * マスタデータ型定義（統一形式）
 */
export interface MasterItem {
  id: number;
  code: string;
  name: string;
}

/**
 * 社員データ型定義（統一形式）
 */
export interface EmployeeItem {
  id: number;
  employeeNo: string;
  name: string;
}

/**
 * サーバーから受け取ったマスタデータを統一形式に変換
 * @param item サーバーから受け取った生データ
 * @param idKey IDのキー名
 * @param codeKey コードのキー名
 * @param nameKey 名称のキー名
 * @returns {MasterItem} 統一形式のマスタデータ
 */
export const convertMasterItem = (
  item: any,
  idKey: string,
  codeKey: string,
  nameKey: string
): MasterItem => ({
  id: item[idKey],
  code: item[codeKey],
  name: item[nameKey]
});

/**
 * サーバーから受け取った社員データを統一形式に変換
 * @param item サーバーから受け取った社員データ
 * @returns {EmployeeItem} 統一形式の社員データ
 */
export const convertEmployeeItem = (item: any): EmployeeItem => ({
  id: item.employeeId,
  employeeNo: item.employeeNo,
  name: item.employeeName
});

/**
 * Tabulator用のカスタム日付エディタを作成
 *
 * @description
 * Tabulatorテーブルで使用する日付編集エディタ。
 * input[type="date"]を使用し、YYYY/MM/DD形式で保存。
 *
 * @returns {Function} Tabulator Editor関数
 *
 * @example
 * import { createDateEditor } from './lib/Utils';
 *
 * const table = new Tabulator('#table', {
 *   columns: [
 *     {
 *       title: '日付',
 *       field: 'date',
 *       editor: createDateEditor()
 *     }
 *   ]
 * });
 */
export const createDateEditor = () => {
  return function(cell: any, onRendered: (callback: () => void) => void, success: (value: any) => void, cancel: (value: any) => void) {
    // 元の値を取得（YYYY/MM/DD形式またはYYYY-MM-DD形式）
    const originalValue = cell.getValue() || '';
    let cellValue = '';

    if (originalValue) {
      // スラッシュをハイフンに変換してinput[type=date]用の形式にする
      cellValue = originalValue.toString().replace(/\//g, '-');
    }

    // 日付入力要素を作成
    const input = document.createElement('input');
    input.setAttribute('type', 'date');
    input.setAttribute('max', '2099-12-31'); // 最大日付
    input.setAttribute('min', '1900-01-01'); // 最小日付
    input.style.padding = '4px';
    input.style.width = '100%';
    input.style.boxSizing = 'border-box';
    input.value = cellValue;

    onRendered(function() {
      input.focus();
      input.style.height = '100%';
    });

    // 値が変更されたかチェックして処理
    function onChange() {
      if (input.value !== cellValue) {
        // 値が変更された場合、ハイフンをスラッシュに変換して保存
        const newValue = input.value ? input.value.replace(/-/g, '/') : '';
        success(newValue);
      } else {
        // 値が変更されていない場合、元の値を保持
        cancel(originalValue);
      }
    }

    // 入力値の長さ制限（YYYY-MM-DD = 10文字）
    input.addEventListener('input', function() {
      if (input.value.length > 10) {
        input.value = input.value.substring(0, 10);
      }
    });

    // イベントリスナー設定
    input.addEventListener('blur', onChange);
    input.addEventListener('change', onChange);

    // キーボードイベント処理
    input.addEventListener('keydown', function(e) {
      if (e.keyCode === 13) { // Enterキー
        onChange();
      }
      if (e.keyCode === 27) { // Escapeキー
        cancel(originalValue); // 元の値を保持してキャンセル
      }
    });

    return input;
  };
};
