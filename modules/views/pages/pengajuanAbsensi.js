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
<!-- Modal Map Besar -->
<dialog id="modalZoomMap" class="modal-dialog modal-zoom">
  <div class="modal-header">
    <h3>📍 Lokasi Presensi</h3>
    <button type="button" id="btnCloseZoomMap" class="btn-close">✕</button>
  </div>
  <div class="modal-body">
    <div id="zoomMapContainer" style="width: 100%; height: 65dvh; min-height: 320px; border-radius: 8px;"></div>
    <p id="zoomMapCoords" style="font-size: 12px; color: #64748b; margin-top: 8px;"></p>
  </div>
</dialog>

<!-- Modal Foto Besar + Zoom -->
<dialog id="modalZoomFoto" class="modal-dialog modal-zoom">
  <div class="modal-header">
    <h3>🖼️ Foto Bukti Kehadiran</h3>
    <div style="display: flex; gap: 6px; align-items: center;">
      <button type="button" id="btnZoomOutFoto" class="btn btn-sm">-</button>
      <span id="labelZoomFoto" style="font-size: 12px; min-width: 44px; text-align: center;">100%</span>
      <button type="button" id="btnZoomInFoto" class="btn btn-sm">+</button>
      <button type="button" id="btnResetZoomFoto" class="btn btn-sm">Reset</button>
      <button type="button" id="btnCloseZoomFoto" class="btn-close">✕</button>
    </div>
  </div>
  <div class="modal-body" style="overflow: auto; max-height: 75dvh; text-align: center; background: #0f172a; border-radius: 8px; padding: 12px;">
    <img
      id="zoomFotoImg"
      alt="Foto Presensi Ukuran Penuh"
      style="max-width: 100%; max-height: 68dvh; transform-origin: center center; transition: transform 0.15s ease; border-radius: 6px;"
    />
  </div>
</dialog>
  `;
}