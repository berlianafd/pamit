export function dashboardPage(){

  return `
  <div id="dashboardAdminCuti" hidden>

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
<div class="dashboard-card">
    <div class="dashboard-slide" style="display: flex; justify-content: center;">
    <iframe src="https://scribehow.com/embed/Panduan_Penggunaan_Website__DPD0KXCaTHuCAv01R-aQuA" width="800" height="679" allow="fullscreen" style="aspect-ratio: 1 / 1; border: 0; min-height: 480px"></iframe>
    </div>
</div>
  `;

}