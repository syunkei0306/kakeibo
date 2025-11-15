import"./CommonImport-6ediMovF.js";document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll(".menu-group-header").forEach(t=>{t.addEventListener("click",e=>{const r=e.currentTarget,s=r.querySelector("i");r.getAttribute("data-bs-target");const x=r.getAttribute("aria-expanded")==="true";s&&(x?s.className="bi bi-chevron-right":s.className="bi bi-chevron-down")})}),document.querySelectorAll(".alert-card").forEach(t=>{t.addEventListener("click",e=>{const r=t.getAttribute("data-alert-type");R(r)})});const n=document.getElementById("repairRegisterLink");n&&n.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/repair-register"},150)});const c=document.getElementById("repairSearchLink");c&&c.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/repair-search"},150)});const o=document.getElementById("repairCostLink");o&&o.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/repair-cost"},150)});const l=document.getElementById("repairHistoryLink");l&&l.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/repair-history"},150)});const d=document.getElementById("accidentRegisterLink");d&&d.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/accident-register"},150)});const m=document.getElementById("accidentSearchLink");m&&m.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/accident-search"},150)});const f=document.getElementById("vehicleRegisterLink");f&&f.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/vehicle-register"},150)});const h=document.getElementById("heavyMachineRegisterLink");h&&h.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/heavy-machine-register"},150)});const k=document.getElementById("employeeSearchLink");k&&k.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/employee-search"},150)});const y=document.getElementById("assetListLink");y&&y.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/asset-list"},150)});const u=document.getElementById("departmentMasterLink");u&&u.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/department-master"},150)});const p=document.getElementById("officeMasterLink");p&&p.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/office-master"},150)});const L=document.getElementById("repairSupplierMasterLink");L&&L.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/repair-vendor-master"},150)});const g=document.getElementById("repairItemMasterLink");g&&g.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/repair-item-master"},150)});const v=document.getElementById("accountItemMasterLink");v&&v.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/account-title-master"},150)});const E=document.getElementById("makerMasterLink");E&&E.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/maker-master"},150)});const w=document.getElementById("vehicleOperationMasterLink");w&&w.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/vehicle-operation-kbn-master"},150)});const b=document.getElementById("accidentNotificationMasterLink");b&&b.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/accident-destination-master"},150)});const M=document.getElementById("companyLicenceMasterLink");M&&M.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/company-licence-master"},150)});const I=document.getElementById("userMasterLink");I&&I.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/user-master"},150)});const T=document.getElementById("permissionMasterLink");T&&T.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/permission-master"},150)});const B=document.getElementById("equipmentMasterLink");B&&B.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/equipment-master"},150)});const D=document.getElementById("vehicleBodyShapeMasterLink");D&&D.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/vehicle-shape-master"},150)});const S=document.getElementById("companyMasterLink");S&&S.addEventListener("click",t=>{t.preventDefault();const e=t.target;e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)",window.location.href="/company-master"},150)})});const R=i=>{const a=document.querySelector(".alert-detail-content");if(!a)return;let n="";switch(i){case"vehicle":n=`
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
      `;break;case"inspection":n=`
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
      `;break;case"license":n=`
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
      `;break;case"company":n=`
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
      `;break;default:n='<p class="text-muted">アラート概要をクリックして詳細情報を表示してください。</p>'}a.innerHTML=n};
//# sourceMappingURL=menu-BqB662IF.js.map
