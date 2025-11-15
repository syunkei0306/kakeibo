let globalSheets: CSSStyleSheet[] | null = null;

/**
 * 各種コンポーネントクラスにBootstrapなどで定義されたグローバルなスタイルをあてるための共通部品
 * @returns グローバルに定義されたスタイル
 */
export function getGlobalStyleSheets() {
  if (globalSheets === null) {
    globalSheets = Array.from(document.styleSheets).map((x) => {
      const sheet = new CSSStyleSheet();
      const css = Array.from(x.cssRules)
        .map((rule) => rule.cssText)
        .join(" ");
      sheet.replaceSync(css);
      return sheet;
    });
  }

  return globalSheets;
}

/**
 * シャドウDOMにスタイルを追加
 * @param {*} shadowRoot シャドウDOM
 */
export function addGlobalStylesToShadowRoot(shadowRoot: ShadowRoot | null) {
  shadowRoot!.adoptedStyleSheets.push(...getGlobalStyleSheets());
}
