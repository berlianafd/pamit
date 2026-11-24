export function saldoCutiPage() {

    return `
    <div class="page-header">
      <h2>Saldo Cuti</h2>
    </div>

    <div class="toolbar">
      <input
        type="text"
        id="searchSaldo"
        placeholder="Cari NIP atan Nama Pegawai..."
      />
    </div>

    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>NIP</th>
            <th>Nama</th>
            <th><label id="tabelSaldoN2"></label></th>
            <th><label id="tabelSaldoN1"></label></th>
            <th><label id="tabelSaldoN"></label></th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody id="tbodySaldoCuti">
          <tr>
            <td colspan="7">Memuat data...</td>
          </tr>
        </tbody>
      </table>
    </div>

    <dialog id="modalSaldo" class="modal-dialog saldo-modal">
  <div class="modal-header">
    <div>
      <h3>Edit Saldo Cuti</h3>
      <p class="modal-subtitle">Perbarui saldo cuti tahunan pegawai</p>
    </div>
    <button type="button" id="btnTutupSaldo" class="modal-close" aria-label="Tutup">✕</button>
  </div>

  <div class="modal-body">
    <div class="saldo-info-box">
      <strong>Catatan Aturan Saldo:</strong>
      <ul>
        <li>Saldo tahun berjalan maksimal <strong>12 hari</strong>.</li>
        <li>Saldo dua tahun sebelumnya masing-masing maksimal <strong>6 hari</strong>.</li>
        <li>Saldo tidak boleh bernilai negatif (minimal <strong>0</strong>).</li>
      </ul>
    </div>

    <input type="hidden" id="pegawaiIdSaldo">

    <div class="form-group">
      <label for="namaSaldo">Nama Pegawai</label>
      <input type="text" id="namaSaldo" class="form-control" disabled>
    </div>

    <div class="saldo-grid">
      <div class="form-group">
        <label id="labelSaldoN" for="saldoN"></label>
        <input type="number" id="saldoN" class="form-control" min="0" max="12" step="1">
      </div>

      <div class="form-group">
        <label id="labelSaldoN1" for="saldoN1"></label>
        <input type="number" id="saldoN1" class="form-control" min="0" max="6" step="1">
      </div>

      <div class="form-group">
        <label id="labelSaldoN2" for="saldoN2"></label>
        <input type="number" id="saldoN2" class="form-control" min="0" max="6" step="1">
      </div>
    </div>
  </div>

  <div class="modal-footer">
    <button type="button" id="btnBatalSaldo" class="btn-secondary">Batal</button>
    <button type="button" id="btnSimpanSaldo" class="btn-primary">Simpan</button>
  </div>
</dialog>
  `;

}