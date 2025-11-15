document.addEventListener('DOMContentLoaded', () => {
  // メニューの展開/格納処理
  const menuHeaders = document.querySelectorAll('.menu-group-header');
  menuHeaders.forEach(header => {
    header.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const icon = target.querySelector('i');
      const targetId = target.getAttribute('data-bs-target');
      const isExpanded = target.getAttribute('aria-expanded') === 'true';
      
      // アイコンの切り替え
      if (icon) {
        if (isExpanded) {
          icon.className = 'bi bi-chevron-right';
        } else {
          icon.className = 'bi bi-chevron-down';
        }
      }
    });
  });
  
  // アラート概要カードのクリック処理
  const alertCards = document.querySelectorAll('.alert-card');
  alertCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const alertType = card.getAttribute('data-alert-type');
      showAlertDetail(alertType);
    });
  });

  // 修理登録リンクのクリック処理
  const repairRegisterLink = document.getElementById('repairRegisterLink');
  if (repairRegisterLink) {
    repairRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/repair-register.html';
        } else {
          window.location.href = '/repair-register';
        }
      }, 150);
    });
  }

  // 修理検索（支払一覧）リンクのクリック処理
  const repairSearchLink = document.getElementById('repairSearchLink');
  if (repairSearchLink) {
    repairSearchLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/repair-search.html';
        } else {
          window.location.href = '/repair-search';
        }
      }, 150);
    });
  }

  // 修理費リンクのクリック処理
  const repairCostLink = document.getElementById('repairCostLink');
  if (repairCostLink) {
    repairCostLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/repair-cost.html';
        } else {
          window.location.href = '/repair-cost';
        }
      }, 150);
    });
  }

  // 修理履歴リンクのクリック処理
  const repairHistoryLink = document.getElementById('repairHistoryLink');
  if (repairHistoryLink) {
    repairHistoryLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/repair-history.html';
        } else {
          window.location.href = '/repair-history';
        }
      }, 150);
    });
  }

  // 事故登録リンクのクリック処理
  const accidentRegisterLink = document.getElementById('accidentRegisterLink');
  if (accidentRegisterLink) {
    accidentRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/accident-register.html';
        } else {
          window.location.href = '/accident-register';
        }
      }, 150);
    });
  }

  // 事故検索リンクのクリック処理
  const accidentSearchLink = document.getElementById('accidentSearchLink');
  if (accidentSearchLink) {
    accidentSearchLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/accident-search.html';
        } else {
          window.location.href = '/accident-search';
        }
      }, 150);
    });
  }

  // 車両登録リンクのクリック処理
  const vehicleRegisterLink = document.getElementById('vehicleRegisterLink');
  if (vehicleRegisterLink) {
    vehicleRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/vehicle-register.html';
        } else {
          window.location.href = '/vehicle-register';
        }
      }, 150);
    });
  }


  // 重機登録リンクのクリック処理
  const heavyMachineRegisterLink = document.getElementById('heavyMachineRegisterLink');
  if (heavyMachineRegisterLink) {
    heavyMachineRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/heavy-machine-register.html';
        } else {
          window.location.href = '/heavy-machine-register';
        }
      }, 150);
    });
  }


  // 社員検索リンクのクリック処理
  const employeeSearchLink = document.getElementById('employeeSearchLink');
  if (employeeSearchLink) {
    employeeSearchLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/employee-search.html';
        } else {
          window.location.href = '/employee-search';
        }
      }, 150);
    });
  }

  // 資産リストリンクのクリック処理
  const assetListLink = document.getElementById('assetListLink');
  if (assetListLink) {
    assetListLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/asset-list.html';
        } else {
          window.location.href = '/asset-list';
        }
      }, 150);
    });
  }

  // 部門メンテナンスリンクのクリック処理
  const departmentMasterLink = document.getElementById('departmentMasterLink');
  if (departmentMasterLink) {
    departmentMasterLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/department-master.html';
        } else {
          window.location.href = '/department-master';
        }
      }, 150);
    });
  }

  // 所属メンテナンスリンクのクリック処理
  const officeMasterLink = document.getElementById('officeMasterLink');
  if (officeMasterLink) {
    officeMasterLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/office-master.html';
        } else {
          window.location.href = '/office-master';
        }
      }, 150);
    });
  }

  // 修理仕入先メンテナンスリンクのクリック処理
  const repairSupplierMasterLink = document.getElementById('repairSupplierMasterLink');
  if (repairSupplierMasterLink) {
    repairSupplierMasterLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/repair-vendor-master.html';
        } else {
          window.location.href = '/repair-vendor-master';
        }
      }, 150);
    });
  }

  // 修理項目メンテナンスリンクのクリック処理
  const repairItemMasterLink = document.getElementById('repairItemMasterLink');
  if (repairItemMasterLink) {
    repairItemMasterLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/repair-item-master.html';
        } else {
          window.location.href = '/repair-item-master';
        }
      }, 150);
    });
  }

  // 勘定科目メンテナンスリンクのクリック処理
  const accountItemMasterLink = document.getElementById('accountItemMasterLink');
  if (accountItemMasterLink) {
    accountItemMasterLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/account-title-master.html';
        } else {
          window.location.href = '/account-title-master';
        }
      }, 150);
    });
  }

  // メーカーメンテナンスリンクのクリック処理
  const makerMasterLink = document.getElementById('makerMasterLink');
  if (makerMasterLink) {
    makerMasterLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/maker-master.html';
        } else {
          window.location.href = '/maker-master';
        }
      }, 150);
    });
  }

  // 車両運行区分メンテナンスリンクのクリック処理
  const vehicleOperationMasterLink = document.getElementById('vehicleOperationMasterLink');
  if (vehicleOperationMasterLink) {
    vehicleOperationMasterLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/vehicle-operation-kbn-master.html';
        } else {
          window.location.href = '/vehicle-operation-kbn-master';
        }
      }, 150);
    });
  }

  // 事故情報通知先メンテナンスリンクのクリック処理
  const accidentNotificationMasterLink = document.getElementById('accidentNotificationMasterLink');
  if (accidentNotificationMasterLink) {
    accidentNotificationMasterLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/accident-destination-master.html';
        } else {
          window.location.href = '/accident-destination-master';
        }
      }, 150);
    });
  }

  // 会社資格・免許メンテナンスリンクのクリック処理
  const companyLicenceMasterLink = document.getElementById('companyLicenceMasterLink');
  if (companyLicenceMasterLink) {
    companyLicenceMasterLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/company-licence-master.html';
        } else {
          window.location.href = '/company-licence-master';
        }
      }, 150);
    });
  }

  // ユーザメンテナンスリンクのクリック処理
  const userMasterLink = document.getElementById('userMasterLink');
  if (userMasterLink) {
    userMasterLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/user-master.html';
        } else {
          window.location.href = '/user-master';
        }
      }, 150);
    });
  }

  // 権限メンテナンスリンクのクリック処理
  const permissionMasterLink = document.getElementById('permissionMasterLink');
  if (permissionMasterLink) {
    permissionMasterLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/permission-master.html';
        } else {
          window.location.href = '/permission-master';
        }
      }, 150);
    });
  }

  // 設備メンテナンスリンクのクリック処理
  const equipmentMasterLink = document.getElementById('equipmentMasterLink');
  if (equipmentMasterLink) {
    equipmentMasterLink.addEventListener('click', (e) => {
      e.preventDefault();

      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';

      setTimeout(() => {
        link.style.transform = 'scale(1)';

        if (import.meta.env.MODE === "development") {
          window.location.href = '/equipment-master.html';
        } else {
          window.location.href = '/equipment-master';
        }
      }, 150);
    });
  }

  // 車体形状メンテナンスリンクのクリック処理
  const vehicleBodyShapeMasterLink = document.getElementById('vehicleBodyShapeMasterLink');
  if (vehicleBodyShapeMasterLink) {
    vehicleBodyShapeMasterLink.addEventListener('click', (e) => {
      e.preventDefault();

      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';

      setTimeout(() => {
        link.style.transform = 'scale(1)';

        if (import.meta.env.MODE === "development") {
          window.location.href = '/vehicle-shape-master.html';
        } else {
          window.location.href = '/vehicle-shape-master';
        }
      }, 150);
    });
  }

  // 会社メンテナンスリンクのクリック処理
  const companyMasterLink = document.getElementById('companyMasterLink');
  if (companyMasterLink) {
    companyMasterLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ボタンクリックアニメーション
      const link = e.target as HTMLElement;
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = 'scale(1)';
        
        if (import.meta.env.MODE === "development") {
          window.location.href = '/company-master.html';
        } else {
          window.location.href = '/company-master';
        }
      }, 150);
    });
  }
});

/**
 * アラート詳細表示
 * @param alertType アラートの種類
 */
const showAlertDetail = (alertType: string | null) => {
  const detailContent = document.querySelector('.alert-detail-content');
  if (!detailContent) return;
  
  let content = '';
  
  switch (alertType) {
    case 'vehicle':
      content = `
        <h5>車検アラート詳細</h5>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>車番</th>
              <th>所有部門</th>
              <th>有効期限</th>
              <th>ステータス</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>東京 100 あ 1234</td><td>総務部</td><td>2024/08/01</td><td class="text-danger">期限切れ</td></tr>
            <tr><td>東京 200 う 5678</td><td>工事部</td><td>2024/08/15</td><td class="text-info">10日前</td></tr>
            <tr><td>東京 300 か 9012</td><td>総務部</td><td>2024/09/05</td><td class="">1ヶ月前</td></tr>
          </tbody>
        </table>
      `;
      break;
    case 'inspection':
      content = `
        <h5>点検アラート詳細</h5>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>車番</th>
              <th>所有部門</th>
              <th>有効期限</th>
              <th>ステータス</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>重機001</td><td>工事部</td><td>2024/08/05</td><td class="text-danger">期限切れ</td></tr>
            <tr><td>重機002</td><td>総務部</td><td>2024/08/25</td><td class="text-info">10日前</td></tr>
            <tr><td>重機003</td><td>工事部</td><td>2024/09/10</td><td class="">1ヶ月前</td></tr>
          </tbody>
        </table>
      `;
      break;
    case 'license':
      content = `
        <h5>資格・免許アラート詳細</h5>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>部門</th>
              <th>社員名</th>
              <th>資格・免許名</th>
              <th>有効期限</th>
              <th>ステータス</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>工事部</td><td>山田 次郎</td><td>クレーン運転士</td><td>2024/08/01</td><td class="text-danger">期限切れ</td></tr>
            <tr><td>工事部</td><td>田中 太郎</td><td>大型免許</td><td>2024/08/20</td><td class="text-info">10日前</td></tr>
            <tr><td>総務部</td><td>佐藤 花子</td><td>フォークリフト技能講習</td><td>2024/09/10</td><td class="">1ヶ月前</td></tr>
          </tbody>
        </table>
      `;
      break;
    case 'company':
      content = `
        <h5>会社資格・免許アラート詳細</h5>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>資格・免許名</th>
              <th>有効期限</th>
              <th>ステータス</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>建設業許可</td><td>2024/12/31</td><td class="">1ヶ月前</td></tr>
            <tr><td>産廃物処理業許可</td><td>2024/11/15</td><td class="">1ヶ月前</td></tr>
            <tr><td>運送業許可</td><td>2024/08/25</td><td class="text-info">10日前</td></tr>
          </tbody>
        </table>
      `;
      break;
    default:
      content = '<p class="text-muted">アラート概要をクリックして詳細情報を表示してください。</p>';
  }
  
  detailContent.innerHTML = content;
};
