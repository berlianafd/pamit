export function pengajuanAbsensiPage() {
    return `
  <div class="page-card">
      <h2>Review Pengajuan Presensi Harian</h2>
      <table class="table">
          <thead>
              <tr>
                  <th>No</th>
                  <th>Nomor</th>
                  <th>Pegawai</th>
                  <th>ID Fingerprint</th>
                  <th>Waktu Presensi</th>
                  <th>Status</th>
                  <th>Catatan Admin</th>
                  <th>Aksi</th>
              </tr>
          </thead>
          <tbody id="reviewPresensiAbsenBody">
              <!-- Data review dimuat via JS -->
          </tbody>
      </table>
  </div>
<!-- Modal Detail Presensi -->
<dialog id="modalDetailPresensiAbsen" class="modal-dialog modal-presensi">
  <div class="modal-header">
    <div class="modal-title-wrap">
      <span class="modal-icon">🕒</span>
      <h3>Detail Presensi</h3>
    </div>
    <button type="button" id="btnCloseDetailAbsen" class="btn-close-icon" aria-label="Tutup">&times;</button>
  </div>

  <div class="modal-body">
    <div id="detailAbsenBody" class="detail-card"></div>

    <div class="modal-footer">
      <button type="button" id="btnTolakAbsen" class="btn-danger">✖ Tolak</button>
      <button type="button" id="btnSetujuiAbsen" class="btn-success">✔ Setujui Presensi</button>
    </div>
  </div>
</dialog>

<!-- Modal Alasan Penolakan Presensi -->
<dialog id="modalTolakAbsen" class="modal-dialog">
  <div class="modal-header">
    <div class="modal-title-wrap">
      <span class="modal-icon">⚠️</span>
      <h3>Alasan Penolakan Presensi</h3>
    </div>
    <button type="button" id="btnCloseIconTolakAbsen" class="btn-close-icon" aria-label="Tutup">&times;</button>
  </div>

  <form class="modal-body" onsubmit="event.preventDefault();">
    <div class="form-group">
      <label for="txtAlasanTolakAbsen">Tuliskan alasan penolakan di sini</label>
      <textarea
        id="txtAlasanTolakAbsen"
        rows="4"
        class="form-textarea"
        placeholder="Tuliskan alasan penolakan di sini..."
      ></textarea>
    </div>

    <div class="modal-footer">
      <button type="button" id="btnBatalTolakAbsen" class="btn-secondary">Batal</button>
      <button type="button" id="btnSimpanTolakAbsen" class="btn-danger">Simpan &amp; Tolak</button>
    </div>
  </form>
</dialog>
  `;
}