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

  <div class="form-detail-pengajuan">

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

    <input
        type="text"
        id="alamatCuti"
        placeholder="Nama jalan, nomor rumah, dusun...">

</div>


<div class="form-group">

    <div class="alamat-row">

        <div class="alamat-prefix rt-rw">
            <span>RT</span>

            <input
                type="text"
                id="rtCuti"
                inputmode="numeric"
                maxlength="3"
                placeholder="00">
        </div>


        <div class="alamat-prefix rt-rw">
            <span>RW</span>

            <input
                type="text"
                id="rwCuti"
                inputmode="numeric"
                maxlength="3"
                placeholder="00">
        </div>

    </div>

</div>

<div class="wilayah-grid">

    <div class="form-group">
        <label>Provinsi</label>
        <select id="provinsiCuti" class="wilayah-select">
            <option value="">Pilih Provinsi</option>
        </select>
    </div>

    <div class="form-group">
        <label>Kabupaten/Kota</label>
        <select id="kotaCuti" class="wilayah-select" disabled>
            <option value="">Pilih Kabupaten/Kota</option>
        </select>
    </div>

    <div class="form-group">
        <label>Kecamatan</label>
        <select id="kecamatanCuti" class="wilayah-select" disabled>
            <option value="">Pilih Kecamatan</option>
        </select>
    </div>

    <div class="form-group">
        <label>Desa/Kelurahan</label>
        <select id="desaCuti" class="wilayah-select" disabled>
            <option value="">Pilih Desa/Kelurahan</option>
        </select>
    </div>

</div>

   <div class="form-group bukti-persetujuan">

    <label class="form-section-title">
        📎 Bukti Persetujuan Atasan
    </label>

    <label
        for="persetujuanAtasan"
        class="file-upload-area">

        <div class="file-upload-icon">
            ☁️
        </div>

        <div class="file-upload-content">

            <strong>
                Klik untuk memilih file
            </strong>

            <span>
                Format JPG, JPEG, PNG • Maksimal 2MB
            </span>

            <span
                id="namaFilePersetujuan"
                class="file-name">
                Belum ada file dipilih
            </span>

        </div>

    </label>

    <input
        type="file"
        id="persetujuanAtasan"
        accept=".jpg,.jpeg,.png,image/*"
        hidden>

</div>

    <div class="form-action">

        <button
            class="btn-primary"
            id="btnSimpanCutiTahunan">

            Simpan

        </button>

    </div>

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