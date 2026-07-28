export function pengajuanCutiTahunanPage() {

    return `

  <div class="card">

    <h2>Pengajuan Cuti Tahunan</h2>

    <div class="saldo-cuti-card">

    <h3>Sisa Cuti Tahunan</h3>

    <div id="saldoCutiTahunan">

        Loading...

    </div>
</div>
</div>
<br>

<div class="card">

    <h3>Pilih Tanggal Cuti</h3>

    <div id="calendar"></div>

</div>

<br>

<div class="card">

    <h3>Tanggal Dipilih</h3>

    <div id="tanggalDipilih">

        Belum ada

    </div>

    <h4>

        Total :
        <span id="totalHari">

            0

        </span>
        Hari

    </h4>
    
    <br>

    <div class="form-group">

        <label>Alasan Cuti</label>
<br>
        <textarea
            id="alasanCuti"
            rows="3"
        ></textarea>

    </div>

    <div class="form-group">

        <label>Alamat Saat Cuti</label>
<br>
        <textarea
            id="alamatCuti"
            rows="3"
        ></textarea>

    </div>

    <div class="form-group">

        <label>Bukti Persetujuan Atasan</label>
<br>
        <input
            type="file"
            id="persetujuanAtasan"
            accept=".jpg,.jpeg,.png,image/*"
            
        >
    </div>

    <br>
    <button
        class="btn-primary"
        id="btnSimpanCutiTahunan"
    >

        Simpan

    </button>


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

  `;

}