/**
 * 何かしらの処理中に表示するオーバービューの表示/非表示を制御する
 */
export const WaitingScreen = {
  show: (message: string) => {
    const waitingScreenDom = document.getElementById("waitingScreen")!;
    waitingScreenDom.querySelector(".message")!.innerHTML = message;
    waitingScreenDom.classList.remove("hidden");
  },

  hide: () => {
    const waitingScreen = document.getElementById("waitingScreen")!;
    waitingScreen.classList.add("hidden");
  },
};
