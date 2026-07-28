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

    <div id="modalSaldo" class="modal-overlay">

    <div class="modal">

        <h3>Edit Saldo Cuti</h3>

<p style="
margin-top:-8px;
margin-bottom:18px;
font-size:13px;
color:#666;
line-height:1.5;
">
<b>Catatan:</b><br>
• Saldo tahun berjalan maksimal <b>12 hari</b>.<br>
• Saldo dua tahun sebelumnya masing-masing maksimal <b>6 hari</b>.<br>
• Saldo tidak boleh bernilai negatif.
</p>

        <input type="hidden" id="pegawaiIdSaldo">

        <label>Nama Pegawai</label>
        <input id="namaSaldo" disabled>

        <br><br>

        <label id="labelSaldoN"></label>
        <input type="number" id="saldoN">

        <br><br>

        <label id="labelSaldoN1"></label>
        <input type="number" id="saldoN1">

        <br><br>

        <label id="labelSaldoN2"></label>
        <input type="number" id="saldoN2">

        <br><br>

        <button id="btnSimpanSaldo">
            Simpan
        </button>

        <button id="btnBatalSaldo">
            Batal
        </button>

    </div>

</div>

  `;

}