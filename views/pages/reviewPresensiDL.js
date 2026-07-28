export function reviewPresensiDLPage() {

    return `

  <div class="page-card">

    <h2>Review Pengajuan Presensi Dinas Luar</h2>

    <table class="table">

      <thead>

        <tr>

          <th>Nomor</th>

          <th>Pegawai</th>

          <th>Jenis</th>

          <th>Tanggal Dinas Luar</th>

          <th>Status</th>

          <th>Catatan Admin</th>

          <th>Aksi</th>

        </tr>

      </thead>

      <tbody id="reviewPresensiDlBody">

      </tbody>

    </table>

  </div>

<dialog id="modalDetailPresensiDL" class="modal-detail">

    <div id="detailDlBody"></div>

    <div class="action-row">

        <button
            id="btnSetujuiDl"
            class="btn btn-success">
            ✔ Sudah Ditandatangani
        </button>

        <button
            id="btnTolakDl"
            class="btn btn-danger">
            ✖ Ditolak
        </button>

    </div>

</dialog>

<dialog id="modalTolakDl">

    <h3>Alasan Penolakan</h3>

    <textarea
        id="txtAlasanTolakDl"
        rows="5"
        style="width:100%;"></textarea>

    <div class="action-row">

        <button id="btnBatalTolakDl">
            Batal
        </button>

        <button id="btnSimpanTolakDl">
            Simpan
        </button>

    </div>

</dialog>
  `;

}