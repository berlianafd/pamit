let currentUltahDate = new Date(); // Default ke bulan dan tahun saat ini

export async function ulangTahunBulanini() {
  const container = document.getElementById("ulangTahunBulanIni");
  if (!container) return;

  const bulanAktif = currentUltahDate.getMonth(); // 0 - 11
  const tahunAktif = currentUltahDate.getFullYear();
  const hariIni = new Date().getDate();
  const isBulanIni = (bulanAktif === new Date().getMonth() && tahunAktif === new Date().getFullYear());

  const { data, error } = await supabase
    .from("pegawai")
    .select("nama, nip")
    .eq("aktif", true);

  if (error) {
    console.error("Gagal mengambil data pegawai:", error);
    container.innerHTML = `<p class="ultah-empty">Gagal memuat data.</p>`;
    return;
  }

  const namaBulanLengkap = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const namaBulanSingkat = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

  const dataUlangTahun = data
    .filter(pegawai => pegawai.nip && String(pegawai.nip).length >= 8)
    .map(pegawai => {
      const nip = String(pegawai.nip);
      const tahunLahir = Number(nip.substring(0, 4));
      const bulanLahir = Number(nip.substring(4, 6));
      const hariLahir = Number(nip.substring(6, 8));

      return {
        nama: pegawai.nama,
        nip,
        tahunLahir,
        bulanLahir,
        hariLahir
      };
    })
    .filter(pegawai => pegawai.bulanLahir - 1 === bulanAktif)
    .map(pegawai => {
      const usia = tahunAktif - pegawai.tahunLahir;
      return {
        ...pegawai,
        usia
      };
    })
    .sort((a, b) => a.hariLahir - b.hariLahir);

  // Render HTML daftar ulang tahun
  let listHtml = "";
  if (dataUlangTahun.length === 0) {
    listHtml = `<p class="ultah-empty" style="text-align: center; padding: 15px; color: gray;">Tidak ada pegawai yang ulang tahun di bulan ini.</p>`;
  } else {
    listHtml = dataUlangTahun.map(item => {
      const singkatanBulan = namaBulanSingkat[bulanAktif];
      return `
        <div class="ultah-row">
            <div class="ultah-col-hari">
                <span class="ultah-icon">🎂</span>
                <span class="ultah-tanggal"><strong>${item.hariLahir}</strong> ${singkatanBulan}</span>
            </div>
            <div class="ultah-col-nama">
                <span class="ultah-nama-text">${item.nama}</span>
            </div>
            <div class="ultah-col-usia">
                <strong>${item.usia}</strong> <span class="ultah-unit">tahun</span>
            </div>
        </div>
      `;
    }).join("");
  }

  // Bungkus dengan Header Navigasi Bulan (Sebelumnya & Selanjutnya)
  container.innerHTML = `
    <div class="ultah-card">
        <div class="ultah-header-title" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <button id="btnPrevUltah" class="btn btn-sm btn-secondary" style="cursor: pointer; padding: 4px 10px;">◀</button>
            <h3 style="margin: 0; font-size: 16px;">🎂 Ulang Tahun ${namaBulanLengkap[bulanAktif]} ${tahunAktif}</h3>
            <button id="btnNextUltah" class="btn btn-sm btn-secondary" style="cursor: pointer; padding: 4px 10px;">▶</button>
        </div>
        <div class="ultah-table-header">
            <div class="ultah-th-hari">📅 TANGGAL</div>
            <div class="ultah-th-nama">👤 NAMA PEGAWAI</div>
            <div class="ultah-th-usia">🎖️ USIA</div>
        </div>
        <div class="ultah-list">
            ${listHtml}
        </div>
    </div>
  `;

  // Event Listener untuk Tombol Navigasi Bulan
  document.getElementById("btnPrevUltah").onclick = () => {
    currentUltahDate.setMonth(currentUltahDate.getMonth() - 1);
    loadUlangTahunBulanIni();
  };

  document.getElementById("btnNextUltah").onclick = () => {
    currentUltahDate.setMonth(currentUltahDate.getMonth() + 1);
    loadUlangTahunBulanIni();
  };
}


export async function loadUlangTahunBulanIni() {
  const container = document.getElementById("ulangTahunBulanIni");
  if (!container) return;

  const bulanAktif = currentUltahDate.getMonth(); // 0 - 11
  const tahunAktif = currentUltahDate.getFullYear();
  const hariIni = new Date().getDate();
  const isBulanIni = (bulanAktif === new Date().getMonth() && tahunAktif === new Date().getFullYear());

  const { data, error } = await supabase
    .from("pegawai")
    .select("nama, nip")
    .eq("aktif", true);

  if (error) {
    console.error("Gagal mengambil data pegawai:", error);
    container.innerHTML = `<p class="ultah-empty">Gagal memuat data.</p>`;
    return;
  }

  const namaBulanLengkap = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const namaBulanSingkat = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

  const dataUlangTahun = data
    .filter(pegawai => pegawai.nip && String(pegawai.nip).length >= 8)
    .map(pegawai => {
      const nip = String(pegawai.nip);
      const tahunLahir = Number(nip.substring(0, 4));
      const bulanLahir = Number(nip.substring(4, 6));
      const hariLahir = Number(nip.substring(6, 8));

      return {
        nama: pegawai.nama,
        nip,
        tahunLahir,
        bulanLahir,
        hariLahir
      };
    })
    .filter(pegawai => pegawai.bulanLahir - 1 === bulanAktif)
    .map(pegawai => {
      const usia = tahunAktif - pegawai.tahunLahir;

      return {
        ...pegawai,

        usia
      };
    })
    .sort((a, b) => a.hariLahir - b.hariLahir);

  // Render HTML daftar ulang tahun
  let listHtml = "";
  if (dataUlangTahun.length === 0) {
    listHtml = `<p class="ultah-empty" style="text-align: center; padding: 15px; color: gray;">Tidak ada pegawai yang ulang tahun di bulan ini.</p>`;
  } else {
    listHtml = dataUlangTahun.map(item => {
      const singkatanBulan = namaBulanSingkat[bulanAktif];
      return `
        <div class="ultah-row">
            <div class="ultah-col-hari">
                <span class="ultah-icon">🎂</span>
                <span class="ultah-tanggal"><strong>${item.hariLahir}</strong> ${singkatanBulan}</span>
            </div>
            <div class="ultah-col-nama">
                <span class="ultah-nama-text">${item.nama}</span>


            </div>
            <div class="ultah-col-usia">
                <strong>${item.usia}</strong> <span class="ultah-unit">tahun</span>
            </div>
        </div>
      `;
    }).join("");
  }

  // Bungkus dengan Header Navigasi Bulan (Sebelumnya & Selanjutnya)
  container.innerHTML = `
    <div class="ultah-card">
        <div class="ultah-header-title" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <button id="btnPrevUltah" class="btn btn-sm btn-secondary" style="cursor: pointer; padding: 4px 10px;">◀</button>
            <h3 style="margin: 0; font-size: 16px;">🎂 Ulang Tahun ${namaBulanLengkap[bulanAktif]} ${tahunAktif}</h3>
            <button id="btnNextUltah" class="btn btn-sm btn-secondary" style="cursor: pointer; padding: 4px 10px;">▶</button>
        </div>
        <div class="ultah-table-header">
            <div class="ultah-th-hari">📅 TANGGAL</div>
            <div class="ultah-th-nama">👤 NAMA PEGAWAI</div>
            <div class="ultah-th-usia">🎖️ USIA</div>
        </div>
        <div class="ultah-list">
            ${listHtml}
        </div>
    </div>
  `;

  // Event Listener untuk Tombol Navigasi Bulan
  document.getElementById("btnPrevUltah").onclick = () => {
    currentUltahDate.setMonth(currentUltahDate.getMonth() - 1);
    loadUlangTahunBulanIni();    loadUlangTahunBulanIni();
  };

  document.getElementById("btnNextUltah").onclick = () => {
    currentUltahDate.setMonth(currentUltahDate.getMonth() + 1);
    loadUlangTahunBulanIni();    loadUlangTahunBulanIni();
  };
}