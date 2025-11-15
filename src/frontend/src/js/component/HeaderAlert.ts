export interface HeaderAlert {
  // eslint-disable-next-line no-unused-vars
  show(message: string, alertType: "info" | "success" | "danger"): void;
  hide(): void;
}

export const headerAlert = {
  show: (message: string, alertType: "info" | "success" | "danger") => {
    const headerAlertDom = document.getElementById("headerAlert")!;
    headerAlertDom.querySelector(".message")!.innerHTML = message;
    headerAlertDom.classList.remove("alert-info", "alert-success", "alert-danger");
    headerAlertDom.classList.add(`alert-${alertType}`);
    headerAlertDom.classList.remove("hidden");

    const closeAlert = () => {
      headerAlert.hide();
    };
    headerAlertDom.querySelector(".btn-close")!.removeEventListener("click", closeAlert, false);
    headerAlertDom.querySelector(".btn-close")!.addEventListener("click", closeAlert, false);
  },
  hide: () => {
    const headerAlertDom = document.getElementById("headerAlert")!;
    headerAlertDom.classList.add("hidden");
  },
};
