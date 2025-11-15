import { TabulatorFull as Tabulator, CellComponent, RowComponent } from 'tabulator-tables';

/**
 * 添付ファイルテーブルの共通ユーティリティ
 * 車両登録・重機登録で使用する添付ファイル一覧の共通処理
 */
export default class AttachmentTableUtil {

  /**
   * 添付ファイルテーブルを初期化
   * @param tableElementId テーブル要素のID
   * @param countElementId 件数表示要素のID
   * @param addBtnId 行追加ボタンのID
   * @param deleteBtnId 行削除ボタンのID
   * @param initialData 初期データ（編集モード時）
   * @returns 初期化されたTabulatorインスタンス
   */
  static initializeTable(
    tableElementId: string,
    countElementId: string,
    addBtnId: string,
    deleteBtnId: string,
    initialData: any[] = []
  ): Tabulator {
    const table = new Tabulator(tableElementId, {
      height: '200px',
      layout: 'fitData',
      responsiveLayout: false,
      selectableRows: false,
      selectable: false,
      rowFormatter: (row) => this.rowFormatter(row),
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
          title: '分類 *',
          field: 'category',
          width: 120,
          headerSort: false,
          editor: "list",
          editorParams: {
            values: {
              "車検証": "車検証",
              "購入情報": "購入情報",
              "自賠責": "自賠責",
              "任意保険": "任意保険",
              "その他帳票": "その他帳票"
            }
          }
        },
        {
          title: 'ファイル名',
          field: 'filename',
          width: 200,
          headerSort: false,
          editor: 'input'
        },
        {
          title: 'ファイル選択',
          field: 'fileAction',
          width: 120,
          hozAlign: 'center',
          formatter: (cell) => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline-primary file-select-btn';
            btn.innerHTML = '<i class="bi bi-folder-plus"></i>';
            btn.title = 'ファイルを選択';
            return btn;
          },
          cellClick: (e, cell) => this.handleFileSelect(e, cell, table, countElementId),
          headerSort: false
        },
        {
          title: 'ダウンロード',
          field: 'downloadAction',
          width: 120,
          hozAlign: 'center',
          formatter: (cell) => {
            const rowData = cell.getRow().getData() as any;
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline-primary file-download-btn';

            if (rowData.fileData) {
              btn.innerHTML = '<i class="bi bi-download"></i>';
              btn.title = 'ファイルをダウンロード';
            } else {
              btn.innerHTML = '<i class="bi bi-download"></i>';
              btn.title = 'ダウンロード可能なファイルがありません';
              btn.disabled = true;
              btn.style.opacity = '0.5';
            }

            return btn;
          },
          cellClick: (e, cell) => this.handleFileDownload(e, cell),
          headerSort: false
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
    this.initializeButtons(table, countElementId, addBtnId, deleteBtnId);

    // テーブルのドラッグ&ドロップ設定
    const tableElement = document.querySelector(tableElementId);
    if (tableElement) {
      this.setupTableDragDrop(tableElement as HTMLElement, table, countElementId);
    }

    return table;
  }

  /**
   * テーブル全体のドラッグ&ドロップを設定
   */
  private static setupTableDragDrop(
    tableElement: HTMLElement,
    table: Tabulator,
    countElementId: string
  ): void {
    // ドラッグオーバー時の処理（テーブル全体）
    tableElement.addEventListener('dragover', (e) => {
      e.preventDefault();
      // 行上でない場合のみテーブル全体をハイライト
      const targetElement = e.target as HTMLElement;
      if (!targetElement.closest('.tabulator-row')) {
        tableElement.classList.add('drag-over');
      }
    });

    // ドラッグリーブ時の処理
    tableElement.addEventListener('dragleave', (e) => {
      e.preventDefault();
      // テーブル要素から完全に離れた場合のみクラスを削除
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (!tableElement.contains(relatedTarget)) {
        tableElement.classList.remove('drag-over');
        // すべての行のハイライトも削除
        const rows = tableElement.querySelectorAll('.drag-over-row');
        rows.forEach(row => row.classList.remove('drag-over-row'));
      }
    });

    // ドロップ時の処理（新規行追加）
    tableElement.addEventListener('drop', (e) => {
      // 行でハンドリングされた場合は何もしない
      const targetElement = e.target as HTMLElement;
      if (targetElement.closest('.tabulator-row')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      tableElement.classList.remove('drag-over');

      const files = e.dataTransfer?.files;
      if (files) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const newRow = {
            category: '',
            filename: file.name,
            fileData: file
          };
          table.addRow(newRow);
          this.updateCount(countElementId, table);
        }
      }
    });
  }

  /**
   * 行追加・削除ボタンの初期化
   */
  private static initializeButtons(
    table: Tabulator,
    countElementId: string,
    addBtnId: string,
    deleteBtnId: string
  ): void {
    // 行追加ボタン
    const btnAdd = document.getElementById(addBtnId) as HTMLButtonElement;
    if (btnAdd) {
      btnAdd.style.transition = 'transform 0.15s ease';
      btnAdd.addEventListener('click', () => {
        btnAdd.style.transform = 'scale(0.95)';
        setTimeout(() => {
          btnAdd.style.transform = 'scale(1)';
          table.addRow({ category: '', filename: '' });
          this.updateCount(countElementId, table);
        }, 150);
      });
    }

    // 行削除ボタン
    const btnDelete = document.getElementById(deleteBtnId) as HTMLButtonElement;
    if (btnDelete) {
      btnDelete.style.transition = 'transform 0.15s ease';
      btnDelete.addEventListener('click', () => {
        btnDelete.style.transform = 'scale(0.95)';
        setTimeout(() => {
          btnDelete.style.transform = 'scale(1)';
          const selectedRows = table.getSelectedRows();
          if (selectedRows.length > 0) {
            if (confirm('選択した添付ファイルを削除します。よろしいですか？')) {
              selectedRows[0].delete();
              this.updateCount(countElementId, table);
              table.deselectRow();
              btnDelete.disabled = true;
            }
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

  /**
   * ファイル選択処理（セル内ボタンクリック時）
   */
  private static handleFileSelect(
    e: UIEvent,
    cell: CellComponent,
    table: Tabulator,
    countElementId: string
  ): void {
    // クリックされた要素がボタンまたはその子要素かチェック
    const target = e.target as HTMLElement;
    const isButton = target.classList.contains('file-select-btn');
    const isIcon = target.closest('.file-select-btn') !== null;

    // ボタン以外のクリックは無視
    if (!isButton && !isIcon) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // 処理中フラグをチェック
    const cellElement = cell.getElement();
    if (cellElement.dataset.processing === 'true') {
      console.log('File selection already in progress');
      return;
    }

    // 処理中フラグを設定
    cellElement.dataset.processing = 'true';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    // ファイル選択またはキャンセル時の処理
    const handleFileSelection = function(event: Event) {
      const target = event.target as HTMLInputElement;

      // ファイルが選択された場合のみ処理
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        console.log('File selected:', file.name);

        // 現在の行データを取得
        const row = cell.getRow();
        const rowData = row.getData() as any;
        console.log('Current row data:', rowData);

        // ファイル名とファイルデータを更新
        row.update({
          ...rowData,
          filename: file.name,
          fileData: file
        }).then(() => {
          console.log('Row data after update:', row.getData());
          row.reformat();
          AttachmentTableUtil.updateCount(countElementId, table);
        }).catch((error) => {
          console.error('Error updating row:', error);
        });
      } else {
        console.log('File selection cancelled');
      }

      // 使用後にinputを削除（存在確認付き）
      if (document.body.contains(fileInput)) {
        document.body.removeChild(fileInput);
      }

      // 処理中フラグをリセット
      cellElement.dataset.processing = 'false';
    };

    // changeイベントとcancelイベントの両方を処理
    fileInput.onchange = handleFileSelection;
    fileInput.addEventListener('cancel', handleFileSelection);

    // 即座にファイルダイアログを開く
    try {
      fileInput.click();
    } catch (error) {
      console.error('Error opening file dialog:', error);
      if (document.body.contains(fileInput)) {
        document.body.removeChild(fileInput);
      }
      cellElement.dataset.processing = 'false';
    }
  }

  /**
   * ファイルダウンロード処理（セル内ボタンクリック時）
   */
  private static handleFileDownload(e: UIEvent, cell: CellComponent): void {
    // クリックされた要素がダウンロードボタンまたはその子要素かチェック
    const target = e.target as HTMLElement;
    const isButton = target.classList.contains('file-download-btn');
    const isIcon = target.closest('.file-download-btn') !== null;

    // ボタン以外のクリックは無視
    if (!isButton && !isIcon) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const rowData = cell.getRow().getData() as any;

    // fileDataが存在する場合のみダウンロード処理を実行
    if (rowData.fileData) {
      const blob = rowData.fileData as Blob;
      const url = URL.createObjectURL(blob);

      // ダウンロードリンクを作成
      const a = document.createElement('a');
      a.href = url;
      a.download = rowData.filename || 'download';
      a.style.display = 'none';
      document.body.appendChild(a);

      // ダウンロードを実行
      a.click();

      // クリーンアップ
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    }
  }

  /**
   * 行フォーマッタ（ドラッグ&ドロップ対応）
   */
  private static rowFormatter(row: RowComponent): void {
    const element = row.getElement();

    // 各行にドラッグオーバーイベントを設定
    element.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      element.classList.add('drag-over-row');
      // テーブル全体のハイライトを除去
      const tableElement = element.closest('.tabulator');
      if (tableElement) {
        tableElement.classList.remove('drag-over');
      }
    });

    // ドラッグリーブイベント
    element.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      element.classList.remove('drag-over-row');
    });

    // ドロップイベント
    element.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      element.classList.remove('drag-over-row');

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];

        // 行のデータを更新
        const rowData = row.getData() as any;
        row.update({
          ...rowData,
          filename: file.name,
          fileData: file
        });
        row.reformat();
      }
    });
  }
}
