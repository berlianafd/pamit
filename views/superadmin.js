import { renderLayout }
  from "./layout.js";

export function renderSuperadmin(nama, jenisPegawai) {

  const menuPns = jenisPegawai === "PNS"
    ? `
      <button
        class="menu-btn"
        data-page="pengajuanCutiAlasanPenting">

        <span class="material-symbols-rounded">trending_up</span>

        <span class="menu-text">
          Pengajuan Cuti Alasan Penting
        </span>

      </button>
    `
    : "";

  return renderLayout(

    nama,

    `

    <button
  class="menu-btn"
  data-page="dashboard">
  
  <span class="material-symbols-rounded">dashboard</span>
  
  <span class="menu-text">
  Dashboard
  </span>
  
  </button>

  <button
      class="menu-btn"
      data-page="presensi">

      <span class="material-symbols-rounded">calendar_today</span>

      <span class="menu-text">
        Presensi
      </span>

    </button>
  
  <button
  class="menu-btn"
  data-page="pengajuanCutiTahunan">
  
  <span class="material-symbols-rounded">calendar_today</span>
  
  <span class="menu-text">
  Pengajuan Cuti Tahunan
  </span>
  
  </button>
  
  <button
  class="menu-btn"
  data-page="pengajuanCutiSakit">
  
  <span class="material-symbols-rounded">medical_services</span>
  
  <span class="menu-text">
  Pengajuan Cuti Sakit
  </span>
  
  </button>
  
  <button
  class="menu-btn"
  data-page="pengajuanDl">
  
  <span class="material-symbols-rounded">directions_car</span>
  
  <span class="menu-text">
  Pengajuan Dinas Luar
  </span>
  
  </button>  


  ${menuPns}

    <button
      class="menu-btn"
      data-page="masterPegawai">

      <span class="material-symbols-rounded">person</span>
  
  <span class="menu-text">
  Data Pegawai
  </span>

    </button>

    <button
class="menu-btn"
data-page="saldoCuti">

<span class="material-symbols-rounded">

account_balance_wallet

</span>

<span class="menu-text">

Saldo Cuti
</span>

</button>

<button
class="menu-btn"
data-page="reviewPengajuan">

<span class="material-symbols-rounded">

fact_check

</span>

<span class="menu-text">

Review Pengajuan Cuti

</span>

</button>


      <button
  class="menu-btn"
  data-page="reviewPresensiCuti">
  
  <span class="material-symbols-rounded">fact_check</span>
  
  <span class="menu-text">
  Review Presensi Cuti
  </span>
  
  </button>

    <button
  class="menu-btn"
  data-page="reviewPresensiDL">
  
  <span class="material-symbols-rounded">fact_check</span>
  
  <span class="menu-text">
  Review Presensi DL
  </span>
  
  </button>

  <button
  class="menu-btn"
  data-page="presensiTK">
  
  <span class="material-symbols-rounded">error</span>
  
  <span class="menu-text">
  Presensi Tidak Hadir
  </span>
  
  </button>
  
  <button
  id="logoutBtn">
  
  <span class="material-symbols-rounded">logout</span>
  
  <span class="menu-text">
  Logout
  </span>
  
  

    `
  );

}