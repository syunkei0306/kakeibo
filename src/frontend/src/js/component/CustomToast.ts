import { Toast } from "bootstrap";

/**
 * CustomToast クラス
 *
 * TODO: 複数のToastをまとめて表示しようとすると、上に重なって表示されてしまう。並べて表示するようにしたい。
 */
class CustomToast {
  /**
   * Displays a custom toast message with the specified type.
   * @param {string} message 表示するメッセージ
   * @param {string} messageType "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark"
   */
  public static showCustomToast(message: string, messageType: string): void {
    const template = document.getElementById("custom-toast-template") as HTMLTemplateElement;
    const node = template.content.cloneNode(true) as Element;
    const domId = self.crypto.randomUUID();
    node.querySelector(".toast")!.id = domId;
    node.querySelector(".toast-body")!.textContent = message;
    node.querySelector(".toast")!.classList.add(`text-bg-${messageType}`);
    document.body.appendChild(node);

    const toastElement = document.getElementById(domId) as HTMLElement;
    const bootstrapToast = new Toast(toastElement, { autohide: true, delay: 3000 });
    bootstrapToast.show();

    toastElement.addEventListener("hidden.bs.toast", () => {
      toastElement.parentElement!.remove();
    });
  }
}

export default CustomToast;
