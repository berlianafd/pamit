export function pengajuanDlPage(){

  return `

  <div class="card">

    <h2>Pengajuan Dinas Luar</h2>

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

    <br>

    <label>Peserta Dinas Luar</label>

<div id="pesertaContainer">

</div>

 <label>Tambah Peserta Dinas Luar (jika ada)</label>
<br>
<input
  type="text"
  id="cariPegawai"
  placeholder="Cari nama pegawai..."
  autocomplete="off"
>

<div id="hasilCariPegawai">

</div>

<br>
    <label>
          Keterangan
        </label>
        <br>
    <textarea
      id="keteranganDl"
      placeholder="Keterangan"
      rows="4"
      required
    ></textarea>

    <br>
    <label>
          Upload Surat Tugas (PDF), Ukuran Maksimal 2MBs
        </label>
        <br>
    <input
      type="file"
      id="suratDl"
      accept=".pdf,.jpg,.jpeg,.png"
      required
    >

    <br><br>

    <button
      id="btnSimpanDl"
      class="btn-primary"
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

  `;

}

