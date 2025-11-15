import { TabulatorFull as Tabulator, Editor } from 'tabulator-tables';
import TabulatorUtil from './TabulatorUtil';
import RowDeleteModal from '../component/RowDeleteModal';

/**
 * 補助金テーブルの共通ユーティリティ
 * 車両登録・重機登録で使用する補助金一覧の共通処理
 */
export default class SubsidyTableUtil {
  private static rowDeleteModal: RowDeleteModal | null = null;

  /**
   * 補助金テーブルを初期化
   * @param tableElementId テーブル要素のID
   * @param countElementId 件数表示要素のID
   * @param addBtnId 行追加ボタンのID
   * @param deleteBtnId 行削除ボタンのID
   * @param dateEditor カスタム日付エディター関数
   * @param initialData 初期データ（編集モード時）
   * @param deletedSubsidies 削除済み補助金IDの配列（編集モード時）
   * @returns 初期化されたTabulatorインスタンス
   */
  static initializeTable(
    tableElementId: string,
    countElementId: string,
    addBtnId: string,
    deleteBtnId: string,
    dateEditor: Editor,
    initialData: any[] = [],
    deletedSubsidies: number[] = []
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
          title: '名称 *',
          field: 'name',
          width: 120,
          headerSort: false,
          editor: 'input'
        },
        {
          title: '制約期間(開始) *',
          field: 'periodStart',
          width: 150,
          formatter: TabulatorUtil.dateFormatter(),
          headerSort: false,
          editor: dateEditor
        },
        {
          title: '制約期間(終了) *',
          field: 'periodEnd',
          width: 150,
          formatter: TabulatorUtil.dateFormatter(),
          headerSort: false,
          editor: dateEditor
        },
        {
          title: '金額(非課税) *',
          field: 'amount',
          width: 100,
          hozAlign: 'right',
          formatter: function(cell) {
            const value = cell.getValue();
            if (value) {
              return `¥${parseInt(value).toLocaleString()}`;
            }
            return '';
          },
          formatterParams: { precision: 0 },
          headerSort: false,
          editor: 'number'
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

    // ボタン初期化
    this.initializeButtons(table, countElementId, addBtnId, deleteBtnId, deletedSubsidies);

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
    deletedSubsidies: number[] = []
  ): void {
    // 行追加ボタン
    const btnAdd = document.getElementById(addBtnId) as HTMLButtonElement;
    if (btnAdd) {
      btnAdd.style.transition = 'transform 0.15s ease';
      btnAdd.addEventListener('click', () => {
        btnAdd.style.transform = 'scale(0.95)';
        setTimeout(() => {
          btnAdd.style.transform = 'scale(1)';
          table.addRow({ historyId: null, name: '', periodStart: '', periodEnd: '', amount: '' });
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
            this.rowDeleteModal?.show('選択した補助金を削除します。よろしいですか？', () => {
              const rowData = selectedRows[0].getData();

              // historyIdが存在する場合、削除済み配列に追加
              if (rowData.historyId) {
                deletedSubsidies.push(rowData.historyId);
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
