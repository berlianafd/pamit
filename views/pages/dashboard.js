export function dashboardPage() {

    return `

    <div id="dashboardPassword" class="dashboard-card">

        <div class="dashboard-info">

            <div class="dashboard-info-icon">

                🔑

            </div>

            <div>

                <strong>Ubah Kata Sandi</strong>

                <p>

                    Dimohon untuk pegawai merubah kata sandi secara berkala untuk menjaga keamanan akun.

                </p>

                <br>

                <button
                        id="btnUbahPassword"
                        class="btn-primary">

                        Ubah Kata Sandi

                    </button>

            </div>

        </div>
    </div>

</div>

  <div id="dashboardAdminCuti" hidden>
<br>
  <div class="dashboard-section">

    <div class="dashboard-card">

        <h3>📥 Menunggu Review</h3>

        <table class="table-dashboard">

            <thead>

                <tr>

                    <th>Nomor</th>

                    <th>Nama</th>

                    <th>Jenis</th>

                    <th>Tanggal Pengajuan</th>

                </tr>

            </thead>

            <tbody id="dashboardMenungguBody">

            </tbody>

        </table>

        <br>

        <div class="dashboard-footer">

            <button
                id="btnReviewSemua1"
                class="btn-primary">

                Review Semua

            </button>

        </div>

    </div>

</div>

<br>

<div class="dashboard-section">

    <div class="dashboard-card">

        <h3>📝 Sedang Diproses</h3>

        <table class="table-dashboard">

            <thead>

                <tr>

                    <th>Nomor</th>

                    <th>Nama</th>

                    <th>Jenis</th>

                    <th>Tanggal</th>

                </tr>

            </thead>

            <tbody id="dashboardDiprosesBody">

            </tbody>

        </table>
        <br>

        <div class="dashboard-footer">

            <button
                id="btnReviewSemua2"
                class="btn-primary">

                Review Semua

            </button>

        </div>

    </div>

</div>
</div>

<div id="dashboardAdminPresensi" hidden>
<br>
  <div class="dashboard-section">

    <div class="dashboard-card">

        <h3>📥 Menunggu Review Pengajuan Dinas Luar</h3>

        <table class="table-dashboard">

            <thead>

                <tr>

                    <th>Nomor</th>

                    <th>Nama</th>

                    <th>Jenis</th>

                    <th>Tanggal</th>

                </tr>

            </thead>

            <tbody id="dashboardMenungguPresensiBody">

            </tbody>

        </table>

        <br>

        <div class="dashboard-footer">

            <button
                id="btnReviewSemua3"
                class="btn-primary">

                Review Semua

            </button>

        </div>

    </div>

</div>

<br>

<div class="dashboard-section">

    <div class="dashboard-card">

        <h3>Menunggu Perubahan Presensi Cuti</h3>

        <table class="table-dashboard">

            <thead>

                <tr>

                    <th>Nomor</th>

                    <th>Nama</th>

                    <th>Jenis</th>

                    <th>Tanggal</th>

                </tr>

            </thead>

            <tbody id="dashboardDiprosesPresensiBody">

            </tbody>

        </table>
        <br>

        <div class="dashboard-footer">

            <button
                id="btnReviewSemua4"
                class="btn-primary">

                Review Semua

            </button>

        </div>

    </div>

</div>
<br>

<div class="card">
        <div class="dashboard-title">
            Daftar Pegawai Tanpa Keterangan Tahun Ini
        </div>

        <div
            id="rekapTKContainer"
            class="rekap-tk-container">
        </div>
    </div>

</div>

</div>

<br>

<br>

    <div id="ulangTahunBulanIni">
        Memuat...
    </div>

<br>

<br>
  
    <div class="dashboard-card">

    <div class="dashboard-title">

        Alur Proses Pengajuan

    </div>

    <div class="dashboard-info">

    <div class="dashboard-info-icon">

        ℹ️

    </div>

    <div>

        <strong>Informasi</strong>

        <p>

            Seluruh pengajuan akan diproses sesuai tahapan yang berlaku.
            Pegawai dapat memantau perkembangan status pengajuan melalui
            menu <b>Riwayat Pengajuan</b>.

        </p>

    </div>

</div>

    <div class="timeline">

        <div class="timeline-item">

            <div class="timeline-icon">
                📝
            </div>

            <div class="timeline-content">

                <h4>Pengajuan oleh Pegawai</h4>

                <p>
                    Pegawai mengajukan permohonan Cuti Tahunan,
                    Cuti Sakit, Dinas Luar, atau Kendala Presensi
                    beserta dokumen persyaratan.
                </p>

            </div>

        </div>

        <div class="timeline-item">

            <div class="timeline-icon">
                📑
            </div>

            <div class="timeline-content">

                <h4>Verifikasi Dokumen Persyaratan</h4>

                <p>
                    Admin melakukan pemeriksaan kelengkapan
                    Surat Tugas, Surat Keterangan Dokter,
                    atau Bukti Persetujuan Atasan.
                </p>

            </div>

        </div>

        <div class="timeline-item">

            <div class="timeline-icon">
                📄
            </div>

            <div class="timeline-content">

                <h4>Penyusunan Dokumen Administrasi</h4>

                <p>
                    Dokumen administrasi disusun berdasarkan
                    hasil verifikasi pengajuan.
                </p>

            </div>

        </div>

        <div class="timeline-item">

            <div class="timeline-icon">
                ✍️
            </div>

            <div class="timeline-content">

                <h4>Persetujuan dan Penandatanganan</h4>

                <p>
                    Dokumen diajukan kepada pejabat
                    berwenang untuk memperoleh
                    persetujuan dan penandatanganan.
                </p>

            </div>

        </div>

        <div class="timeline-item">

            <div class="timeline-icon">
                🕒
            </div>

            <div class="timeline-content">

                <h4>Penyesuaian Status Presensi</h4>

                <p>
                    Admin melakukan perubahan status
                    presensi sesuai pengajuan yang telah
                    disetujui.
                </p>

            </div>

        </div>

        <div class="timeline-item">

            <div class="timeline-icon success">
                ✅
            </div>

            <div class="timeline-content">

                <h4>Pengajuan Selesai</h4>

                <p>
                    Seluruh proses administrasi telah selesai
                    dan hasil pengajuan dapat dilihat pada
                    menu Riwayat Pengajuan.
                </p>

            </div>

        </div>

    </div>

</div>

<br>

<!-- Modal Ganti Password -->
<dialog id="modalUbahPassword" class="modal-dialog">
  <div class="modal-header">
    <div class="modal-title-wrap">
      <span class="modal-icon">🔒</span>
      <h3>Ubah Password</h3>
    </div>
    <button type="button" class="btn-close-icon" id="btnCloseIconPassword">&times;</button>
  </div>

  <form id="formUbahPassword" class="modal-body" onsubmit="event.preventDefault();">
    <p class="modal-subtitle">Masukkan password lama Anda untuk memverifikasi identitas, lalu buat password baru.</p>

    <div class="form-group">
      <label for="currentPassword">Password Lama</label>
      <div class="input-password-wrapper">
        <input type="password" id="currentPassword" class="form-input" placeholder="Masukkan password lama" required>
        <button type="button" class="toggle-password" data-target="currentPassword">👁️</button>
      </div>
    </div>

    <div class="form-group">
      <label for="newPassword">Password Baru</label>
      <div class="input-password-wrapper">
        <input type="password" id="newPassword" class="form-input" placeholder="Minimal 6 karakter" required minlength="6">
        <button type="button" class="toggle-password" data-target="newPassword">👁️</button>
      </div>
    </div>

    <div class="form-group">
      <label for="confirmPassword">Ulangi Password Baru</label>
      <div class="input-password-wrapper">
        <input type="password" id="confirmPassword" class="form-input" placeholder="Ulangi password baru" required minlength="6">
        <button type="button" class="toggle-password" data-target="confirmPassword">👁️</button>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" id="btnBatalPassword" class="btn-secondary">Batal</button>
      <button type="button" id="btnSubmitPassword" class="btn-primary">
        <span>Ubah Password</span>
      </button>
    </div>
  </form>
</dialog>

  `;

}