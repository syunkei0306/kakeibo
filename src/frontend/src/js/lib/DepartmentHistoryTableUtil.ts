import { TabulatorFull as Tabulator, Editor } from 'tabulator-tables';
import TabulatorUtil from './TabulatorUtil';
import RowDeleteModal from '../component/RowDeleteModal';

/**
 * 旧部門履歴テーブルの共通ユーティリティ
 * 車両登録・重機登録で使用する旧部門履歴一覧の共通処理
 */
export default class DepartmentHistoryTableUtil {
  private static rowDeleteModal: RowDeleteModal | null = null;

  /**
   * 旧部門履歴テーブルを初期化
   * @param tableElementId テーブル要素のID
   * @param countElementId 件数表示要素のID
   * @param addBtnId 行追加ボタンのID
   * @param deleteBtnId 行削除ボタンのID
   * @param dateEditor カスタム日付エディター関数
   * @param departmentList 部門名リスト（セレクトボックス用）
   * @param initialData 初期データ（編集モード時）
   * @param deletedHistories 削除済み履歴IDの配列（編集モード時）
   * @returns 初期化されたTabulatorインスタンス
   */
  static initializeTable(
    tableElementId: string,
    countElementId: string,
    addBtnId: string,
    deleteBtnId: string,
    dateEditor: Editor,
    departmentList: string[] = [],
    initialData: any[] = [],
    deletedHistories: number[] = []
  ): Tabulator {
    const table = new Tabulator(tableElementId, {
      height: '200px',
      layout: 'fitData',
      responsiveLayout: false,
      selectableRows: false,
      selectable: false,
      columns: [
        {
          title: "選択",
          field: "selected",
          width: 40,
          formatter: "rowSelection",
          hozAlign: "center",
          headerSort: false,
        },
        {
          title: '開始日 *',
          field: 'startDate',
          width: 120,
          formatter: TabulatorUtil.dateFormatter(),
          headerSort: false,
          editor: dateEditor
        },
        {
          title: '終了日 *',
          field: 'endDate',
          width: 120,
          formatter: TabulatorUtil.dateFormatter(),
          headerSort: false,
          editor: dateEditor
        },
        {
          title: '部門 *',
          field: 'department',
          width: 100,
          headerSort: false,
          editor: 'input'
        }
      ],
      data: initialData
    });

    // 行選択時のイベント
    table.on('rowSelected', () => {
      const deleteBtn = document.getElementById(deleteBtnId) as HTMLButtonElement;
      if (deleteBtn) deleteBtn.disabled = false;
    });

    table.on('rowDeselected', () => {
      const deleteBtn = document.getElementById(deleteBtnId) as HTMLButtonElement;
      if (deleteBtn) deleteBtn.disabled = true;
    });

    // 行追加・削除イベントでの件数更新
    table.on('rowAdded', () => this.updateCount(countElementId, table));
    table.on('rowDeleted', () => this.updateCount(countElementId, table));

    // 行選択時のボタン状態更新（編集ボタンがある場合の対応）
    table.on('rowSelectionChanged', (data, rows) => {
      const btnEdit = document.getElementById('btnEditDepartmentHistory') as HTMLButtonElement;
      const btnDelete = document.getElementById(deleteBtnId) as HTMLButtonElement;
      const hasSelection = rows.length > 0;
      if (btnEdit) btnEdit.disabled = !hasSelection;
      if (btnDelete) btnDelete.disabled = !hasSelection;
    });

    // ボタン初期化
    this.initializeButtons(table, countElementId, addBtnId, deleteBtnId, deletedHistories);

    return table;
  }

  /**
   * 行追加・削除ボタンの初期化
   */
  private static initializeButtons(
    table: Tabulator,
    countElementId: string,
    addBtnId: string,
    deleteBtnId: string,
    deletedHistories: number[] = []
  ): void {
    // 行追加ボタン
    const btnAdd = document.getElementById(addBtnId) as HTMLButtonElement;
    if (btnAdd) {
      btnAdd.style.transition = 'transform 0.15s ease';
      btnAdd.addEventListener('click', () => {
        btnAdd.style.transform = 'scale(0.95)';
        setTimeout(() => {
          btnAdd.style.transform = 'scale(1)';
          table.addRow({ historyId: null, startDate: '', endDate: '', department: '' });
          this.updateCount(countElementId, table);
        }, 150);
      });
    }

    // 行削除ボタン
    const btnDelete = document.getElementById(deleteBtnId) as HTMLButtonElement;
    if (btnDelete) {
      // モーダルの初期化（初回のみ）
      if (!this.rowDeleteModal) {
        this.rowDeleteModal = new RowDeleteModal();
      }

      btnDelete.style.transition = 'transform 0.15s ease';
      btnDelete.addEventListener('click', () => {
        btnDelete.style.transform = 'scale(0.95)';
        setTimeout(() => {
          btnDelete.style.transform = 'scale(1)';
          const selectedRows = table.getSelectedRows();
          if (selectedRows.length > 0) {
            // モーダルで確認
            this.rowDeleteModal?.show('選択した旧部門履歴を削除します。よろしいですか？', () => {
              const rowData = selectedRows[0].getData();

              // historyIdが存在する場合、削除済み配列に追加
              if (rowData.historyId) {
                deletedHistories.push(rowData.historyId);
              }

              selectedRows[0].delete();
              this.updateCount(countElementId, table);
              table.deselectRow();
              btnDelete.disabled = true;
            });
          }
        }, 150);
      });
    }
  }

  /**
   * 件数表示を更新
   */
  private static updateCount(elementId: string, table: Tabulator): void {
    if (table) {
      const count = table.getData().length;
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = `${count}件`;
      }
    }
  }
}
