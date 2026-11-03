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
  <dialog id="modalDetailPresensiAbsen" class="modal-detail" style="padding: 20px; border-radius: 8px; border: 1px solid #ccc; max-width: 500px; width: 100%;">
      <div id="detailAbsenBody"></div>
      
      <div class="action-row" style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
          <button
              id="btnSetujuiAbsen"
              class="btn btn-success"
              style="background: #28a745; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
              ✔ Setujui Presensi
          </button>

          <button
              id="btnTolakAbsen"
              class="btn btn-danger"
              style="background: #dc3545; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
              ✖ Tolak
          </button>
      </div>
  </dialog>

  <!-- Modal Alasan Penolakan -->
  <dialog id="modalTolakAbsen" style="padding: 20px; border-radius: 8px; border: 1px solid #ccc; max-width: 400px; width: 100%;">
      <h3>Alasan Penolakan Presensi</h3>
      <textarea
          id="txtAlasanTolakAbsen"
          rows="4"
          placeholder="Tuliskan alasan penolakan di sini..."
          style="width: 100%; margin-top: 10px; padding: 8px; border-radius: 4px; border: 1px solid #ccc;"></textarea>

      <div class="action-row" style="margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end;">
          <button id="btnBatalTolakAbsen" class="btn" style="padding: 6px 12px; cursor: pointer;">
              Batal
          </button>
          <button id="btnSimpanTolakAbsen" class="btn btn-danger" style="background: #dc3545; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer;">
              Simpan & Tolak
          </button>
      </div>
  </dialog>
  `;
}