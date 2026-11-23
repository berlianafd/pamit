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

<!-- Modal Detail Presensi Dinas Luar (DL) -->
<dialog id="modalDetailPresensiDL" class="modal-dialog modal-presensi">
  <div class="modal-header">
    <div class="modal-title-wrap">
      <span class="modal-icon">🧳</span>
      <h3>Detail Presensi Dinas Luar</h3>
    </div>
    <button type="button" id="btnCloseDetailDl" class="btn-close-icon" aria-label="Tutup">&times;</button>
  </div>

  <div class="modal-body">
    <div id="detailDlBody" class="detail-card"></div>

    <div class="modal-footer">
      <button type="button" id="btnTolakDl" class="btn-danger">✖ Ditolak</button>
      <button type="button" id="btnSetujuiDl" class="btn-success">✔ Sudah Ditandatangani</button>
    </div>
  </div>
</dialog>

<!-- Modal Alasan Penolakan DL -->
<dialog id="modalTolakDl" class="modal-dialog">
  <div class="modal-header">
    <div class="modal-title-wrap">
      <span class="modal-icon">⚠️</span>
      <h3>Alasan Penolakan</h3>
    </div>
    <button type="button" id="btnCloseIconTolakDl" class="btn-close-icon" aria-label="Tutup">&times;</button>
  </div>

  <form class="modal-body" onsubmit="event.preventDefault();">
    <div class="form-group">
      <label for="txtAlasanTolakDl">Tuliskan alasan penolakan</label>
      <textarea
        id="txtAlasanTolakDl"
        rows="5"
        class="form-textarea"
        placeholder="Masukkan alasan penolakan..."
      ></textarea>
    </div>

    <div class="modal-footer">
      <button type="button" id="btnBatalTolakDl" class="btn-secondary">Batal</button>
      <button type="button" id="btnSimpanTolakDl" class="btn-primary">Simpan</button>
    </div>
  </form>
</dialog>
  `;

}