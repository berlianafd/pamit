export function pengajuanCutiSakitPage() {

    return `
<div class="card">
    <div class="page-header">

        <div>

            <h2>Pengajuan Cuti Sakit</h2>

            <p>
                Pilih tanggal cuti dan lengkapi data pengajuan.
            </p>

        </div>

        <img
            src="assets/img/calendar.png"
            class="header-icon">
    </div>

    <div class="tanggal-row">

    <div class="tanggal-item">
        <label>Tanggal Mulai</label>
        <input type="date" id="tanggalMulai">
    </div>

    <div class="tanggal-item">
        <label>Tanggal Selesai</label>
        <input type="date" id="tanggalSelesai">
    </div>

</div>
     
    <div class="form-group">

        <label>📝 Alasan Cuti</label>

        <textarea
            id="alasanCutiSakit"
            rows="4"
            placeholder="Tuliskan alasan pengajuan cuti..."></textarea>

    </div>

    <div class="form-group">

        <label>📍 Alamat Saat Cuti</label>

        <textarea
            id="alamatCutiSakit"
            rows="4"
            placeholder="Masukkan alamat selama cuti..."></textarea>

    </div>

    <div class="form-group">

        <label>📎 Upload Surat Sakit</label>

        <input
            type="file"
            id="suratSakit"
            accept=".pdf,image/*"
            capture="environment">

    </div>

    <div class="form-action">

        <button
            class="btn-primary"
            id="btnSimpanCutiSakit">

            Simpan

        </button>

    </div>

</div>

<br>

<div class="card">

    <hr>

    <h3>Riwayat Pengajuan Cuti Sakit</h3>

    <table>

      <thead>

        <tr>

          <th>No Pengajuan</th>

          <th>Tanggal</th>

            <th>Status</th>

            <th>Keterangan</th>

            <th>Aksi</th>

        </tr>

      </thead>

      <tbody id="riwayatCutiSakitBody">

      </tbody>

    </table>

  </div>
</div>
`;

}