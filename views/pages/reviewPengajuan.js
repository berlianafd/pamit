import { generateFormCuti } from "../../utils/generateFormCuti.js";

export function reviewPengajuanPage() {

    return `

  <div class="page-card">

    <h2>Review Pengajuan</h2>

    <table class="table">

      <thead>

        <tr>

          <th>Nomor</th>

          <th>Pegawai</th>

          <th>Jenis</th>

          <th>Tanggal Cuti</th>

          <th>Status</th>

          <th>Catatan Admin</th>

          <th>Aksi</th>

        </tr>

      </thead>

      <tbody id="reviewPengajuanBody">

      </tbody>

    </table>

  </div>

  <!-- Modal -->

 <dialog id="modalDetailPengajuan" class="modal-detail">

  <div class="detail-container">

 <div class="modal-header">

    <h2>Detail Pengajuan Cuti</h2>

    <button
        id="btnCloseModal"
        class="btn-close-modal">

        <span class="material-symbols-outlined">
            close
        </span>

    </button>

</div>
  
    <div class="detail-card">

        <div class="card-title">
            📋 Informasi Pengajuan
        </div>

        <table class="table-detail">

            <tr>
                <td>Nomor Pengajuan</td>
                <td id="detailNomor"></td>
            </tr>

            <tr>
                <td>Nama Pegawai</td>
                <td id="detailNama"></td>
            </tr>

            <tr>
                <td>Jenis Pengajuan</td>
                <td id="detailJenis"></td>
            </tr>

            <tr>
                <td>Status</td>
                <td id="detailStatus"></td>
            </tr>

            <tr>
                <td>Catatan Admin</td>
                <td id="detailCatatan"></td>
            </tr>

        </table>

    </div>


    <div
        class="detail-card"
        id="cardDataCuti">

    </div>


    <div class="detail-card">

        <div class="card-title">

            📎 Dokumen Pendukung

        </div>

        <div id="previewDokumen"></div>

    </div>


    <div class="detail-card">
               <div class="action-row">

            <button
                id="btnDisetujui"
                class="btn-success">

                ✔ Disetujui

            </button>

            <button
                id="btnTolak"
                class="btn-danger">

                ✖ Ditolak

            </button>

        </div>

          <div class="download-wrapper">

        <button
            id="btnDownloadForm"
            class="btn-download">

            ⬇ Download Form Cuti

        </button>

    </div>
<div class="download-wrapper">
    <button
    id="btnSudahDitandatangani"
    class="btn-success">
    Tandai Sudah Ditandatangani
</button>
</div>

    </div>

</div>

</dialog>

<dialog id="modalTolak">

    <h3>Alasan Penolakan</h3>

    <textarea
        id="txtAlasanTolak"
        rows="5"
        style="width:100%;"></textarea>

    <div class="action-row">

        <button id="btnBatalTolak">
            Batal
        </button>

        <button id="btnSimpanTolak">
            Simpan
        </button>

    </div>

</dialog>
  `;

}