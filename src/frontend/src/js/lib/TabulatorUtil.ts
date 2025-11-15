import {
  CellComponent,
  ColumnComponent,
  ColumnDefinition,
  Formatter,
  RowComponent,
  ScrollToRowPosition,
  TabulatorFull as Tabulator,
} from "tabulator-tables";
import { formatToSlashDate, formatToSlashMonth, hyphenToSlash, toNumber } from "./Utils.ts";
import { RadioListItem } from "../component/CustomRadio.ts";
import { ListItem } from "../component/CustomSelect.ts";

/**
 * チェックボックス付き一覧のデータ定義に使用（継承して使用すること）
 */
export interface CheckboxTableRow {
  checked: boolean;
}

/**
 * Tabulator で作成されたすべてのテーブルが初期化されるまで await で待機（初期化済みの場合は待機せず終了）
 * @param tables
 */
const waitAllTableBuilt = (...tables: Tabulator[]): Promise<void> => {
  const promiseList: Promise<void>[] = tables.map((table) => {
    return new Promise((resolve) => {
      // tableBuilt のイベントが既に発火済みである場合、テーブル初期化の判定ができない。
      // 外部公開されているプロパティが存在しないため、代わりに tabulator の class が取得できた場合は Tabulator 初期化済みとして扱う。
      const initialized = table.element.classList.contains("tabulator");
      if (initialized) {
        resolve();
        return;
      }

      // テーブルが初期化した場合にPromiseを解決
      table.on("tableBuilt", () => {
        resolve();
      });
    });
  });

  return new Promise((resolve) => {
    Promise.all(promiseList).then(() => resolve());
  });
};

/**
 * Tabulator操作用の汎用ロジックをまとめたもの
 */
const TabulatorUtil = {
  /**
   * 左右キーで隣のセルに移動する処理をテーブルに追加する
   * @param {Tabulator} table Tabulatorのオブジェクト
   */
  initializeMovingNextOrPrevCellEvent: (table: Tabulator) => {
    table.on("cellEditing", function (cell) {
      const editorElement = cell.getElement();
      if (!editorElement) {
        return;
      }
      /**
       * 左右どちらかのセルに移動する
       * @param {KeyboardEvent} event キーボードイベント
       */
      const moveNextOrPrevCell = (event: KeyboardEvent) => {
        if (event.key === "ArrowLeft") {
          if (cell.navigateLeft()) {
            editorElement.removeEventListener("keydown", moveNextOrPrevCell);
          }
        } else if (event.key === "ArrowRight") {
          if (cell.navigateRight()) {
            editorElement.removeEventListener("keydown", moveNextOrPrevCell);
          }
        }
      };
      //セル編集開始時にキー入力イベントを設定し、セル移動後にイベントを解除する
      editorElement.addEventListener("keydown", moveNextOrPrevCell);
    });
  },
  /**
   * チェックボックス付き一覧の設定
   * @param table
   * @param {string} headerText ヘッダのテキスト（省略時はチェックボックスのみ表示）
   *                            ※ チェックボックスのみの場合は、ヘッダクリックで全選択が可能
   * @remarks 必ず一覧行のデータには CheckboxTableRow を継承した型を使用すること
   * @privateRemarks 実施内容
   *  - チェックボックス列を１番左に表示固定列として追加（この列のセルのみクリックイベントが無効化される）
   */
  initializeCheckboxColumn: async (table: Tabulator, headerText?: string) => {
    const fieldName = "checked";

    // テーブルの初期化が完了するまで待機
    await waitAllTableBuilt(table);

    // classを設定（スタイルシートで表示設定するため）
    table.element.classList.add("tabulator-custom-checkbox-table", "main");

    const chkHeader = document.createElement("input");
    // チェックボックス（ヘッダ）用の表示更新
    const updateChkHeader = () => {
      const rows = table.getRows() as RowComponent[];
      const rowCount = rows.length;

      // データが0件
      if (rowCount === 0) {
        // 未選択
        chkHeader.indeterminate = false;
        chkHeader.checked = false;
        return;
      }

      const checkedCount = rows.filter((row) => (row.getData() as CheckboxTableRow).checked).length;
      if (checkedCount === rowCount) {
        // 全選択
        chkHeader.indeterminate = false;
        chkHeader.checked = true;
      } else if (checkedCount === 0) {
        // 未選択
        chkHeader.indeterminate = false;
        chkHeader.checked = false;
      } else {
        // 中間値（一部選択）
        chkHeader.indeterminate = true;
        chkHeader.checked = false;
      }
    };

    // チェックボックスのフォーマッタ
    const checkBoxFormatter: Formatter = (cell: CellComponent) => {
      const dto = cell.getRow().getData() as CheckboxTableRow;

      const chkRow = document.createElement("input");
      chkRow.type = "checkbox";
      chkRow.checked = dto.checked;

      // チェックボックス変更で値を反転させる
      chkRow.addEventListener("change", () => {
        dto.checked = !dto.checked;

        updateChkHeader();
      });

      // チェックボックス列のクリックイベントを無効化する（誤クリックを避けるため）
      const cellElement = cell.getElement();
      cellElement.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      return chkRow;
    };

    // チェックボックス（ヘッダ）のフォーマッタ
    const checkboxTitleFormatter: Formatter = () => {
      chkHeader.type = "checkbox";
      chkHeader.checked = false;
      // チェックボックスクリックで全チェックボックスをチェック済みにする
      chkHeader.addEventListener("change", () => {
        const rows = table.getRows() as RowComponent[];
        const checkedCount = rows.filter((row) => (row.getData() as CheckboxTableRow).checked).length;
        const isNotChecked = checkedCount === 0;

        // 全チェックボックスに値を反映
        const value = isNotChecked;
        rows.forEach((row) => row.getCell(fieldName).setValue(value));
        if (rows.length === 0) {
          chkHeader.checked = false;
        } else {
          chkHeader.checked = value;
        }
      });

      return chkHeader;
    };

    // 列定義
    const colDefinition: ColumnDefinition = {
      title: headerText!,
      field: fieldName,
      width: !headerText ? 30 : 60,
      formatter: checkBoxFormatter,
      headerSort: false,
      frozen: true,
      resizable: false,
      titleFormatter: !headerText ? checkboxTitleFormatter : undefined,
    };
    await table.addColumn(colDefinition, true);

    // 一覧行の描画が終わった後、チェックボックス（ヘッダ）の状態を更新
    table.on("renderComplete", () => {
      updateChkHeader();
    });
  },
  /**
   * 合計テーブルのスタイル設定
   * @param mainTable
   * @param totalTable
   * @remarks パラメータの mainTable と totalTable で列数、列幅、列の固定表示などは合わせること
   * @privateRemarks 実施内容
   * - スクロールと列幅連動の変更
   * - HTML の class 設定（スタイル設定用途）
   */
  initializeTotalTableStyle: async (mainTable: Tabulator, totalTable: Tabulator) => {
    // テーブルの初期化を待機
    await waitAllTableBuilt(mainTable, totalTable);

    const elemMainTable = mainTable.element;
    const elemTotalTable = totalTable.element;

    // classを設定（スタイルシートで表示設定するため）
    elemMainTable.classList.add("tabulator-custom-total-table", "main");
    elemTotalTable.classList.add("tabulator-custom-total-table", "total");

    // mainTable の列幅に totalTable の列を合わせる
    mainTable.getColumns().forEach((col, index) => {
      const totalCol = totalTable.getColumns()[index];
      if (totalCol) {
        totalCol.getDefinition().width = col.getWidth();
        totalCol.setWidth(col.getWidth());
      }
    });
    totalTable.redraw();

    // スクロールバーの連動
    const mainTableBody = elemMainTable.querySelector(".tabulator-tableholder") as HTMLElement;
    totalTable.on("scrollHorizontal", (left: number) => {
      mainTableBody.scrollLeft = left;
    });

    // 列幅変更のイベントが連鎖しないようにするためのフラグ（mainTable の列幅変更 ⇒ totalTable の列幅変更 ⇒ mainTable の列幅変更...と連鎖的にイベントが発生することを防ぐ）
    let colChanging = false;

    // 列幅変更の連動
    mainTable.on("columnWidth", (column: ColumnComponent) => {
      if (colChanging) return;
      colChanging = true;

      try {
        const colIndex = mainTable.getColumns().findIndex((col) => col.getField() === column.getField());
        totalTable.getColumns()[colIndex].setWidth(column.getWidth());
      } finally {
        colChanging = false;
      }
    });

    totalTable.on("columnWidth", (column: ColumnComponent) => {
      if (colChanging) return;
      colChanging = true;

      try {
        const colIndex = totalTable.getColumns().findIndex((col) => col.getField() === column.getField());
        mainTable.getColumns()[colIndex].setWidth(column.getWidth());
      } finally {
        colChanging = false;
      }
    });

    // 列幅変更終了時に全項目の幅を揃える
    mainTable.on("columnResized", () => {
      mainTable.getColumns().forEach((col, index) => {
        totalTable.getColumns()[index].setWidth(col.getWidth());
      });
    });
    totalTable.on("columnResized", () => {
      totalTable.getColumns().forEach((col, index) => {
        mainTable.getColumns()[index].setWidth(col.getWidth());
      });
    });
  },

  /**
   * 自動行スクロール設定
   * 指定された行が見切れていた場合自動でスクロールする
   * @param table
   * @param targetRow
   * @param position
   * @param scrollToRowIfVisible
   */
  automaticScroll: (
    table: Tabulator,
    targetRow: RowComponent,
    position: ScrollToRowPosition,
    scrollToRowIfVisible: boolean
  ) => {
    table.scrollToRow(targetRow.getIndex(), position, scrollToRowIfVisible);
  },

  /**
   * 小数表示用フォーマッタ
   * @param places 小数点の位置（2で小数第2位まで表示）
   * @remarks 指定より下位の小数部は、四捨五入せず切り捨て
   */
  decimalFormatter: (places: number): Formatter => {
    console.assert(0 <= places, `places には0以上の数を指定してください。（places : ${places}）`);

    return (cell: CellComponent) => {
      const anyValue = cell.getValue();
      const value = toNumber(anyValue);
      if (value === null) {
        return "";
      }

      const pow = Math.pow(10, places);
      return (Math.trunc(value * pow) / pow).toFixed(places);
    };
  },
  /**
   * セレクトボックス、またはラジオボタンの項目を使用したフォーマッタ
   * @param items セレクトボックス、またはラジオボタンの項目配列
   */
  listFormatter: (items: RadioListItem[] | ListItem[]): Formatter => {
    return (cell: CellComponent) => {
      const val = cell.getValue();
      const item = items.find((item) => item.value === val);
      return item?.name ?? "";
    };
  },
  /**
   * 年月用のフォーマッタ
   */
  monthFormatter: (): Formatter => {
    return (cell: CellComponent) => {
      const val = cell.getValue();
      if (val instanceof Date) {
        return formatToSlashMonth(val);
      }
      return hyphenToSlash(val?.toString() ?? null) ?? "";
    };
  },
  /**
   * 日付用のフォーマッタ
   */
  dateFormatter: (): Formatter => {
    return (cell: CellComponent) => {
      const val = cell.getValue();
      if (val instanceof Date) {
        return formatToSlashDate(val);
      }
      return hyphenToSlash(val?.toString() ?? null) ?? "";
    };
  },
  waitAllTableBuilt,
};

export default TabulatorUtil;
