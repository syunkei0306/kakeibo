/**
 * フォーム送信による画面遷移のヘルパークラス
 * POSTメソッドでパラメータを送信しながら画面遷移を行う
 */
class FormNavigator {
  /**
   * POSTフォーム送信による画面遷移
   * @param url 遷移先のURL
   * @param params 送信するパラメータ（key-value形式）
   */
  static postNavigate(url: string, params?: Record<string, any>): void {
    // フォームを動的に作成
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    
    // CSRFトークンを自動的に追加
    this.addCsrfToken(form);
    
    // パラメータを隠しフィールドとして追加
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          this.addHiddenField(form, key, String(value));
        }
      });
    }
    
    // フォームをDOMに追加して送信
    document.body.appendChild(form);
    form.submit();
  }
  
  /**
   * CSRFトークンをフォームに追加
   * @param form 対象のフォーム要素
   */
  private static addCsrfToken(form: HTMLFormElement): void {
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute("content");
    
    if (csrfToken) {
      this.addHiddenField(form, '_csrf', csrfToken);
    }
  }
  
  /**
   * 隠しフィールドをフォームに追加
   * @param form 対象のフォーム要素
   * @param name フィールド名
   * @param value フィールド値
   */
  private static addHiddenField(form: HTMLFormElement, name: string, value: string): void {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  
  /**
   * GETパラメータ付きの画面遷移（通常のページ遷移）
   * @param url 遷移先のURL
   * @param params クエリパラメータ
   */
  static getNavigate(url: string, params?: Record<string, any>): void {
    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(
        Object.entries(params)
          .filter(([_, value]) => value !== null && value !== undefined)
          .map(([key, value]) => [key, String(value)])
      ).toString();
      
      window.location.href = `${url}?${queryString}`;
    } else {
      window.location.href = url;
    }
  }
}

export default FormNavigator;
