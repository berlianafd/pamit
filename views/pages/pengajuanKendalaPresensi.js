export function pengajuanKendalaPresensiPage(){

  return `

  <div class="card">

    <h2>Pengajuan Kendala Presensi</h2>

    <div class="form-grid">

      <div>

        <label>
          Tanggal Mulai
        </label>

        <input
          type="date"
          id="tglMulai"
        >

      </div>

      <div>

        <label>
          Tanggal Selesai
        </label>

        <input
          type="date"
          id="tglSelesai"
        >

      </div>

    </div>

    <br>

    <textarea
      id="keteranganKendalaPresensi"
      placeholder="Keterangan"
      rows="4"
    ></textarea>

    <br><br>

    <input
      type="file"
      id="suratKendalaPresensi"
      accept=".pdf,.jpg,.jpeg,.png"
    >

    <br><br>

    <button
      id="btnSimpanKendalaPresensi"
      class="btn-primary"
    >
      Simpan
    </button>

    <hr>

    <h3>Riwayat Pengajuan</h3>

    <table>

      <thead>

        <tr>

          <th>No</th>

          <th>Tanggal</th>

          <th>Status</th>

        </tr>

      </thead>

      <tbody id="riwayatKendalaPresensiBody">

      </tbody>

    </table>

  </div>

  `;

}