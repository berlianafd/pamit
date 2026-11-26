export function pengajuanDlPage() {

  return `

  <div class="card">

     <div class="page-header">

        <div>

            <h2>Pengajuan Dinas Luar</h2>

            <p>
                Pilih tanggal dinas luar dan lengkapi data pengajuan.
            </p>

        </div>

        <img
            src="assets/img/calendar.png"
            class="header-icon">
    </div>

    <div class="tanggal-row">

      <div class="tanggal-item">
          <label>Tanggal Mulai</label>
          <input type="date" id="tglMulai">
      </div>

      <div class="tanggal-item">
          <label>Tanggal Selesai</label>
          <input type="date" id="tglSelesai">
      </div>

    </div>

    <div class="form-group">

        <label>Peserta Dinas Luar</label>

        <div id="pesertaContainer">

    </div>  

    <div class="form-group">
      <label>Tambah Peserta Dinas Luar (jika ada)</label>
      <input
        type="text"
        id="cariPegawai"
        placeholder="Cari nama pegawai..."
        autocomplete="off"
      >
      <div id="hasilCariPegawai">
    </div>
  </div>

  <div class="form-group">
    <label>
      Keterangan
    </label>
    <textarea
      id="keteranganDl"
      placeholder="Keterangan"
      rows="4"
      required
    ></textarea>
  </div>

  <div class="form-group">
    <label>
       Upload Surat Tugas (PDF), Ukuran Maksimal 2MBs
    </label>
    <input
      type="file"
      id="suratDl"
      accept=".pdf,.jpg,.jpeg,.png"
      required
    >
  </div>

  <div class="form-action">
    <button
      id="btnSimpanDl"
      class="btn-primary"
    >
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

<th>Peserta</th>

<th>Status</th>

<th>Keterangan</th>

<th>Aksi</th>

</tr>

</thead>

<tbody id="riwayatDlBody">

</tbody>

</table>
  </div>

  <div id="detailDlModal" class="modal-overlay">

  <div class="modal">

    <div class="modal-header">

      <h3>Detail Pengajuan DL</h3>

      <button id="btnCloseDetailDl">✕</button>

    </div>

    <div id="detailDlBody">

    </div>

  </div>

</div>
</div>

  `;

}

