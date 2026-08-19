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

    <div class="form-detail-pengajuan">

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

    <input
        type="text"
        id="alamatCutiSakit"
        placeholder="Nama jalan, nomor rumah, dusun, dll.">

</div>


<div class="form-group">

    <label>RT / RW</label>

    <div class="alamat-row">

        <div class="alamat-prefix rt-rw">

            <span>RT</span>

            <input
                type="text"
                id="rtCutiSakit"
                inputmode="numeric"
                maxlength="3"
                placeholder="00">

        </div>


        <div class="alamat-prefix rt-rw">

            <span>RW</span>

            <input
                type="text"
                id="rwCutiSakit"
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


<div class="form-group bukti-surat-sakit">

    <label class="form-section-title">
        📎 Surat Sakit
    </label>

    <label
        for="suratSakit"
        class="file-upload-area">

        <div class="file-upload-icon">
            ☁️
        </div>

        <div class="file-upload-content">

            <strong>
                Klik untuk memilih file
            </strong>

            <span>
                Format PDF, JPG, JPEG, PNG • Maksimal 2MB
            </span>

            <span
                id="namaFileSuratSakit"
                class="file-name">

                Belum ada file dipilih

            </span>

        </div>

    </label>

    <input
        type="file"
        id="suratSakit"
        accept=".pdf,image/*"
        capture="environment"
        hidden>

</div>

    <div class="form-action">

        <button
            class="btn-primary"
            id="btnSimpanCutiSakit">

            Simpan

        </button>

    </div>

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