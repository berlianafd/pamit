export function pengajuanCutiTahunanPage() {

    return `

  <div class="card">

    <div class="page-header">

    <div>

        <h2>Pengajuan Cuti Tahunan</h2>

        <p>
            Pilih tanggal cuti dan lengkapi data pengajuan.
        </p>

    </div>

    <img
        src="assets/img/calendar.png"
        class="header-icon">

</div>

    <div class="top-grid">

    <div class="left-column">

        <div class="card info-card">

            <h3>Sisa Cuti Tahunan</h3>

            <div id="saldoCutiTahunan"></div>

        </div>

        <div class="card info-card">

            <h3>Tanggal Dipilih</h3>

            <div id="tanggalDipilih">

                Belum ada

            </div>

            <div class="total-box">

                Total :

                <span id="totalHari">

                    0

                </span>

                Hari

            </div>

        </div>

    </div>

    <div class="card calendar-card">

        <h3>Pilih Tanggal</h3>

        <div id="calendar"></div>

    </div>

</div>
    
    <br>

  <div class="card">

    <h3>Detail Pengajuan</h3>

    <div class="form-group">

        <label>📝 Alasan Cuti</label>

        <textarea
            id="alasanCuti"
            rows="4"
            placeholder="Tuliskan alasan pengajuan cuti..."></textarea>

    </div>

    <div class="form-group">

        <label>📍 Alamat Saat Cuti</label>

        <textarea
            id="alamatCuti"
            rows="4"
            placeholder="Masukkan alamat selama cuti..."></textarea>

    </div>

    <div class="form-group">

        <label>📎 Bukti Persetujuan Atasan</label>

        <input
            type="file"
            id="persetujuanAtasan"
            accept=".jpg,.jpeg,.png,image/*">

    </div>

    <div class="form-action">

        <button
            class="btn-primary"
            id="btnSimpanCutiTahunan">

            Simpan

        </button>

    </div>

</div>

<br>

<div class="card">

    <hr>

    <h3>Riwayat Pengajuan</h3>

    <table>

      <thead>

        <tr>

          <th>No Pengajuan</th>

          <th>Tanggal</th>

          <th>Jumlah Hari</th>

            <th>Status</th>

            <th>Keterangan</th>

            <th>Aksi</th>

        </tr>

      </thead>

      <tbody id="riwayatCutiTahunanBody">

      </tbody>

    </table>

  </div>
</div>
  `;

}