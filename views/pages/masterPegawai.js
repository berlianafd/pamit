export function masterPegawaiPage(){

  return `
  <div class="card">
    <h2>Master Pegawai</h2>

   <div class="toolbar">

  <input
    type="text"
    id="searchPegawai"
    placeholder="🔍 Cari NIP atau Nama"
  >

  <button id="btnTambahPegawai">
    + Tambah Pegawai
  </button>

  <button id="btnImportPegawai" class="btn btn-success">
    📥 Import Excel
</button>

<input
    type="file"
    id="fileImportPegawai"
    accept=".xlsx,.xls"
    hidden>

</div>

    <div
      id="tambahModal"
      class="modal-overlay"
    >

      <div class="modal">

    <h3>Tambah Pegawai</h3>
      <input
        id="nipBaru"
        placeholder="NIP">

      <br><br>

      <input
        id="namaBaru"
        placeholder="Nama">
      
      <br><br>

      <input
        id="nohpBaru"
        placeholder="Nomor HP">

      <br><br>

      <input
        id="jabatanBaru"
        placeholder="Jabatan">

      <br><br>

      <select id="pangkatgolBaru">
        <option value="Pengatur (II/c)">
          Pengatur (II/c)
        </option>

        <option value="Pengatur Tingkat I (II/d)">
          Pengatur Tingkat I (II/d)
        </option>

        <option value="Penata Muda (III/a)">
          Penata Muda (III/a)
        </option>

        <option value="Penata Muda Tingkat I (III/b)">
          Penata Muda Tingkat I (III/b)
        </option>

        <option value="Penata (III/c)">
          Penata (III/c)
        </option>

        <option value="Penata Tingkat I (III/d)">
          Penata Tingkat I (III/d)
        </option>

        <option value="Pembina (IV/a)">
          Pembina (IV/a)
        </option>

        <option value="Pembina Tingkat I (IV/b)">
          Pembina Tingkat I (IV/b)
        </option>

        <option value="Pembina Utama Muda (IV/c)">
          Pembina Utama Muda (IV/c)
        </option>

        <option value="I">
          I
        </option>

        <option value="V">
          V
        </option>

        <option value="IX">
          IX
        </option>

      </select>

      <br><br>

      <select id="unitKerjaBaru">
        <option value="Sekretariat">
          Sekretariat
        </option>

        <option value="Subbag Umum dan Kepegawaian">
          Subbag Umum dan Kepegawaian
        </option>

        <option value="Subbag Keuangan">
          Subbag Keuangan
        </option>

        <option value="Bidang Pelayanan Pendaftaran Penduduk">
          Bidang Pelayanan Pendaftaran Penduduk
        </option>

        <option value="Bidang Pelayanan Pencatatan Sipil">
          Bidang Pelayanan Pencatatan Sipil
        </option>

        <option value="Bidang Pemanfaatan Data dan Inovasi Pelayanan">
          Bidang Pemanfaatan Data dan Inovasi Pelayanan
        </option>

        <option value="Bidang Pengelolaan Informasi Administrasi Kependudukan">
          Bidang Pengelolaan Informasi Administrasi Kependudukan
        </option>

      </select>

      <br><br>

      <select id="roleBaru">

        <option value="pegawai">
          Pegawai
        </option>

        <option value="admin_cuti">
          Admin Cuti
        </option>

        <option value="admin_presensi">
          Admin Presensi
        </option>

        <option value="superadmin">
          Superadmin
        </option>

      </select>

      <br><br>

      <button id="btnSimpanPegawai">
        Simpan
      </button>
      
      <button
        type="button"
        id="btnBatalTambah"
      >

  Batal

</button>
 </div>
    </div>

    <hr>

    <table border="1" width="100%">
      <thead>
        <tr>
          <th>NIP</th>
          <th>Nama</th>
          <th>No HP</th>
          <th>Pangkat/Gol</th>
          <th>Jabatan</th>
          <th>Unit Kerja</th>
          <th>Role</th>
          <th>Status</th>
          <th>Aksi</th>
        </tr>
      </thead>

      <tbody id="pegawaiTableBody"></tbody>

    </table>
<div id="pagination"></div>
    
    <div
  id="editModal"
  class="modal-overlay"
>
  <div class="modal">

  <h3>Edit Pegawai</h3>

  <input
    id="editNama"
    placeholder="Nama"
  >

  <br><br>

  <input
    id="editNohp"
    placeholder="Nomor HP"
  >

  <br><br>

  <input
    id="editJabatan"
    placeholder="Jabatan"
  >

  <br><br>

  <select id="editPangkatgol">
        <option value="Pengatur (II/c)">
          Pengatur (II/c)
        </option>

        <option value="Pengatur Tingkat I (II/d)">
          Pengatur Tingkat I (II/d)
        </option>

        <option value="Penata Muda (III/a)">
          Penata Muda (III/a)
        </option>

        <option value="Penata Muda Tingkat I (III/b)">
          Penata Muda Tingkat I (III/b)
        </option>

        <option value="Penata (III/c)">
          Penata (III/c)
        </option>

        <option value="Penata Tingkat I (III/d)">
          Penata Tingkat I (III/d)
        </option>

        <option value="Pembina (IV/a)">
          Pembina (IV/a)
        </option>

        <option value="Pembina Tingkat I (IV/b)">
          Pembina Tingkat I (IV/b)
        </option>

        <option value="Pembina Utama Muda (IV/c)">
          Pembina Utama Muda (IV/c)
        </option>

        <option value="I">
          I
        </option>

        <option value="V">
          V
        </option>

        <option value="IX">
          IX
        </option>

      </select>

      <br><br>

  <select id="editUnitKerja">
        <option value="Sekretariat">
          Sekretariat
        </option>

        <option value="Sub Bagian Umum dan Kepegawaian">
          Sub Bagian Umum dan Kepegawaian
        </option>

        <option value="Sub Bagian Keuangan">
          Sub Bagian Keuangan
        </option>

        <option value="Bidang Pelayanan Pendaftaran Penduduk">
          Bidang Pelayanan Pendaftaran Penduduk
        </option>

        <option value="Bidang Pelayanan Pencatatan Sipil">
          Bidang Pelayanan Pencatatan Sipil
        </option>

        <option value="Bidang Pemanfaatan Data dan Inovasi Pelayanan">
          Bidang Pemanfaatan Data dan Inovasi Pelayanan
        </option>

        <option value="Bidang Pengelolaan Informasi Administrasi Kependudukan">
          Bidang Pengelolaan Informasi Administrasi Kependudukan
        </option>

      </select>

      <br><br>

  <select id="editRole">

    <option value="pegawai">
      Pegawai
    </option>

    <option value="admin_cuti">
      Admin Cuti
    </option>

    <option value="admin_presensi">
      Admin Presensi
    </option>

    <option value="superadmin">
      Superadmin
    </option>

  </select>

  <br><br>

  <button id="btnSimpanEdit">
    Simpan
  </button>

  <button
  type="button"
  id="btnBatalEdit"
>

  Batal

</button>
</div>
</div>
</div>

  `;
}