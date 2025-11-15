import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, HttpStatusCode } from "axios";

/**
 * 非同期でHTTPリクエストを送信する際に使用する共通オブジェクト
 */
const HttpRequest = {
  /**
   * HTTPリクエスト送信
   * @param {string} method リクエストメソッド
   * @param {string} url URL
   * @param {any} data 送信パラメータ
   * @param {object} options その他オプション
   * @returns {Promise} axiosのPromise
   */
  send: (method: string, url: string, data?: any, options?: Object) => {
    const csrfToken = document.querySelector('meta[name="_csrf"]')!.getAttribute("content");
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')!.getAttribute("content");
    const headers = {} as any;
    headers[csrfHeader!] = csrfToken;
    
    // デフォルトのContent-Typeを設定
    headers['Content-Type'] = 'application/json';
    
    // optionsのheadersがあれば、それを上書き（Content-Type含む）
    const optionsHeaders = (options as any)?.headers;
    if (optionsHeaders) {
      Object.assign(headers, optionsHeaders);
    }

    const params = {
      method: method,
      url: url,
      data: data,
      headers: headers,
      withCredentials: true,
    } as AxiosRequestConfig;
    if (method === "get") {
      // 配列をクエリパラメータとしてURLに変換するときの動作設定
      params.paramsSerializer = { indexes: null };
    }
    if (options) {
      for (const [key, value] of Object.entries(options)) {
        // headersはすでに処理済みなのでスキップ
        if (key !== 'headers') {
          (params as any)[key] = value;
        }
      }
    }
    console.log(params);
    return axios(params);
  },

  /**
   * GETメソッドでHTTPリクエスト送信
   * @param {string} url URL
   * @param {object} data 送信パラメータ
   * @param {object} options その他オプション
   * @returns {Promise} axiosのPromise
   */
  get: (url: string, data?: Object, options?: Object) => {
    return HttpRequest.send("get", url, data, options);
  },

  /**
   * POSTメソッドでHTTPリクエスト送信
   * @param {string} url URL
   * @param {any} data 送信パラメータ
   * @param {object} options その他オプション
   * @returns {Promise} axiosのPromise
   */
  post: (url: string, data?: any, options?: Object) => {
    return HttpRequest.send("post", url, data, options);
  },

  /**
   * ファイルダウンロード用のHTTPリクエスト送信
   * @param {*} method リクエストメソッド
   * @param {*} url URL
   * @param {*} data 送信パラメータ
   * @param {*} error エラー発生時の処理
   * @param {*} completed 正常終了後の処理
   */
  download: (method: string, url: string, data: Object, error: Function, completed: Function) => {
    const csrfToken = document.querySelector('meta[name="_csrf"]')!.getAttribute("content");
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')!.getAttribute("content");
    const headers = {} as any;
    headers[csrfHeader!] = csrfToken;
    const responseType = "blob";
    axios({ method, url, data, headers, responseType })
      .then((response) => {
        const fileURL = window.URL.createObjectURL(new Blob([response.data]));
        const fileName = extractFileName(response);
        download(fileURL, fileName);
      })
      .catch((e) => {
        console.error(e);
        if (!error) {
          return;
        }
        error(e);
      })
      .finally(() => {
        if (!completed) {
          return;
        }
        completed();
      });
  },

  /**
   * ファイルダウンロード用のHTTPリクエスト送信（async 版）
   * @param {*} method リクエストメソッド
   * @param {*} url URL
   * @param {*} data 送信パラメータ
   */
  downloadAsync: (method: string, url: string, data: Object): Promise<void> => {
    return new Promise((resolve, reject) => {
      HttpRequest.download(
        method,
        url,
        data,
        (e: any) => {
          reject(e);
        },
        () => {
          resolve();
        }
      );
    });
  },
};

/**
 * レスポンスヘッダのcontent-dispositionからファイル名を取り出す
 * @param {*} response レスポンス
 * @returns ファイル名
 */
const extractFileName = (response: AxiosResponse) => {
  const contentDisposition = response.headers["content-disposition"];
  // eslint-disable-next-line no-useless-escape
  const matches = contentDisposition.match(/filename\*\=UTF-8''(.+)/);
  const encodedFilename = matches[1];
  const fileName = decodeURIComponent(encodedFilename);

  return fileName;
};

/**
 * ダウンロード実行
 * @param {*} fileURL URL
 * @param {*} fileName ファイル名
 */
const download = (fileURL: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = fileURL;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/**
 * NotFoundエラー判定
 * @param err
 */
export const isNotFoundError = (err: unknown): boolean => {
  if (err instanceof AxiosError) {
    if (err.status === HttpStatusCode.NotFound) {
      return true;
    }
  }
  return false;
};

export default HttpRequest;
