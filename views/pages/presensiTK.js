export function presensiTKPage() {

    return `

    <div class="card">

        <h2>Monitoring Pegawai Tidak Hadir</h2>

        <p>

            Input pegawai yang berstatus Tanpa Keterangan (TK).

        </p>

        <div class="form-group">

            <label>Tanggal</label>

            <br>

            <input
                type="date"
                id="tanggalTK">

        </div>

        <br>

        <div class="form-group">

            <label>Nama Pegawai Tidak Hadir</label>

            <br>

            <div id="pegawaiTKContainer"></div>

            <input
                type="text"
                id="pegawaiTKSearch"
                placeholder="Cari nama pegawai...">

            <div id="pegawaiTKResult"></div>

        </div>

        <br>

        <button
            class="btn-primary"
            id="btnSimpanTK">

            Simpan

        </button>

    </div>

    <br>

    <div class="card">

        <h3>Riwayat Pegawai Tidak Hadir</h3>

        <table>

            <thead>

                <tr>

                    <th>Tanggal</th>

                    <th>Pegawai</th>

                    <th>Keterangan</th>

                    <th>Aksi</th>

                </tr>

            </thead>

            <tbody id="riwayatTKBody">

            </tbody>

        </table>

    </div>

    `;

}