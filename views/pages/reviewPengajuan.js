import { generateFormCuti } from "../../utils/generateFormCuti.js";

export function reviewPengajuanPage() {

    return `

  <div class="page-card">
    <div class="page-header-flex">
      <h2>Review Pengajuan</h2>

      <div class="search-box-wrapper">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          id="searchNamaPengajuan"
          class="search-input"
          placeholder="Cari nama pegawai..."
          autocomplete="off"
        />
        <button
          type="button"
          id="btnResetSearchNama"
          class="btn-clear-search"
          title="Hapus pencarian"
          aria-label="Hapus pencarian"
          style="display: none;"
        >&times;</button>
      </div>
    </div>

    <table class="table">

      <thead>

        <tr>

          <th>Nomor</th>

          <th>Pegawai</th>

          <th>Jenis</th>

          <th>Tanggal Cuti</th>

          <th>Status</th>

          <th>Catatan Admin</th>

          <th>Aksi</th>

        </tr>

      </thead>

      <tbody id="reviewPengajuanBody">

      </tbody>

    </table>

  </div>

 <!-- Modal Detail Pengajuan Cuti -->
<dialog id="modalDetailPengajuan" class="modal-dialog modal-detail-wide">
  <div class="modal-header">
    <div class="modal-title-wrap">
      <span class="modal-icon">📄</span>
      <h3>Detail Pengajuan Cuti</h3>
    </div>
    <button type="button" id="btnCloseModal" class="btn-close-icon" aria-label="Tutup">
      <span class="material-symbols-outlined">close</span>
    </button>
  </div>

  <div class="modal-body">
    <div class="detail-card">
      <div class="card-title">📋 Informasi Pengajuan</div>
      <table class="table-detail">
        <tr>
          <td>Nomor Pengajuan</td>
          <td id="detailNomor"></td>
        </tr>
        <tr>
          <td>Nama Pegawai</td>
          <td id="detailNama"></td>
        </tr>
        <tr>
          <td>Jenis Pengajuan</td>
          <td id="detailJenis"></td>
        </tr>
        <tr>
          <td>Status</td>
          <td id="detailStatus"></td>
        </tr>
        <tr>
          <td>Catatan Admin</td>
          <td id="detailCatatan"></td>
        </tr>
      </table>
    </div>

    <div class="detail-card" id="cardDataCuti"></div>

    <div class="detail-card">
      <div class="card-title">📎 Dokumen Pendukung</div>
      <div id="previewDokumen"></div>
    </div>

    <div class="detail-card">
      <div class="action-row">
        <button type="button" id="btnDisetujui" class="btn-success">✔ Disetujui</button>
        <button type="button" id="btnTolak" class="btn-danger">✖ Ditolak</button>
      </div>

      <div class="download-wrapper">
        <button type="button" id="btnDownloadForm" class="btn-download">⬇ Download Form Cuti</button>
      </div>

      <div class="download-wrapper">
        <button type="button" id="btnSudahDitandatangani" class="btn-success">
          Tandai Sudah Ditandatangani
        </button>
      </div>

      <div class="detail-card" id="card-preview-ttd">
        <div class="card-title">📎 Dokumen Cuti Tertandatangani</div>
        <div id="previewFormTTD" style="display:none;"></div>
      </div>
    </div>
  </div>
</dialog>

<!-- Modal Alasan Penolakan -->
<dialog id="modalTolak" class="modal-dialog">
  <div class="modal-header">
    <div class="modal-title-wrap">
      <span class="modal-icon">⚠️</span>
      <h3>Alasan Penolakan</h3>
    </div>
  </div>

  <div class="modal-body">
    <div class="form-group">
      <label for="txtAlasanTolak">Tuliskan alasan penolakan pengajuan</label>
      <textarea id="txtAlasanTolak" rows="5" class="form-textarea" placeholder="Masukkan alasan penolakan..."></textarea>
    </div>

    <div class="modal-footer">
      <button type="button" id="btnBatalTolak" class="btn-secondary">Batal</button>
      <button type="button" id="btnSimpanTolak" class="btn-primary">Simpan</button>
    </div>
  </div>
</dialog>

<!-- Modal Upload Form Cuti Bertanda Tangan -->
<dialog id="modalUploadTTD" class="modal-dialog">
  <div class="modal-header">
    <div class="modal-title-wrap">
      <span class="modal-icon">✍️</span>
      <h3>Upload Form Cuti yang Sudah Ditandatangani</h3>
    </div>
  </div>

  <div class="modal-body">
    <div class="form-group">
      <label for="fileTTD">Pilih berkas PDF</label>
      <input type="file" id="fileTTD" accept=".pdf" class="form-file">
    </div>

    <div class="modal-footer">
      <button type="button" id="btnBatalUploadTTD" class="btn-secondary">Batal</button>
      <button type="button" id="btnUploadTTD" class="btn-primary">Upload</button>
    </div>
  </div>
</dialog>
  `;

}