import { renderLayout }
from "./layout.js";

export function renderPegawai(nama){

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

<button
id="logoutBtn">

<span class="material-symbols-rounded">logout</span>

<span class="menu-text">
Logout
</span>

</button>

    `
  );

}