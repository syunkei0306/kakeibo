/**
 * 各画面共通で実行する処理化処理をまとめたもの
 */
const CommonInitializer = {
  initialize: () => {
    //ログアウト
    initializeLogout();
    //メニューボタン
    initializeMenuButton();
    //アラートのDOMにメッセージが設定されていれば表示
    viewAlertMessage();

    document.addEventListener("DOMContentLoaded", () => {
      document.querySelector("body")?.classList.add("initialized");
    });
  },
};

/**
 * ログアウト処理
 */
const initializeLogout = () => {
  const linkLogout = document.getElementById("linkLogout");
  if (!linkLogout) {
    return;
  }
  linkLogout.addEventListener("click", () => {
    //ログアウト
    if (import.meta.env.MODE === "development") {
      location.href = "/";
      return;
    }
    (document.getElementById("formLogout")! as HTMLFormElement).submit();
  });
};

/**
 * メニューボタン処理
 */
const initializeMenuButton = () => {
  const btnMenu = document.getElementById("btnMenu");
  if (!btnMenu) {
    return;
  }
  btnMenu.addEventListener("click", () => {
    //メニューへ遷移
    if (import.meta.env.MODE === "development") {
      location.href = "/menu.html";
      return;
    }
    location.href = "/menu";
  });
};

/**
 * 画面上部にアラートメッセージ表示
 */
const viewAlertMessage = () => {
  const headerAlert = document.getElementById("headerAlert");
  if (!headerAlert) {
    return;
  }
  
  const messageElement = headerAlert.querySelector(".message");
  if (!messageElement) {
    return;
  }
  
  const alertMessage = messageElement.innerHTML;
  if (alertMessage === "") {
    return;
  }
  
  headerAlert.classList.remove("hidden");
  const closeButton = headerAlert.querySelector(".btn-close");
  if (closeButton) {
    closeButton.addEventListener(
      "click",
      () => {
        headerAlert.classList.add("hidden");
      },
      false
    );
  }
};

export default CommonInitializer;
