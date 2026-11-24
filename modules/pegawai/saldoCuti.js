import { showToast } from "/utils/helper.js";

let cachedSaldoRows = [];
const saldoRowById = new Map();
let isSavingSaldo = false;

function setHeaderTahunSaldo() {
  const tahun = new Date().getFullYear();

  const tN = document.getElementById("tabelSaldoN");
  const tN1 = document.getElementById("tabelSaldoN1");
  const tN2 = document.getElementById("tabelSaldoN2");

  if (tN) tN.textContent = `Tahun ${tahun}`;
  if (tN1) tN1.textContent = `Tahun ${tahun - 1}`;
  if (tN2) tN2.textContent = `Tahun ${tahun - 2}`;
}

function bukaModalEditSaldo(rowData) {
  if (!rowData) return;

  const tahun = new Date().getFullYear();
  const labelN = document.getElementById("labelSaldoN");
  const labelN1 = document.getElementById("labelSaldoN1");
  const labelN2 = document.getElementById("labelSaldoN2");

  if (labelN) labelN.textContent = `Saldo Tahun ${tahun}`;
  if (labelN1) labelN1.textContent = `Saldo Tahun ${tahun - 1}`;
  if (labelN2) labelN2.textContent = `Saldo Tahun ${tahun - 2}`;

  const inputId = document.getElementById("pegawaiIdSaldo");
  const inputNama = document.getElementById("namaSaldo");
  const inputN = document.getElementById("saldoN");
  const inputN1 = document.getElementById("saldoN1");
  const inputN2 = document.getElementById("saldoN2");
  const modalSaldo = document.getElementById("modalSaldo");

  if (inputId) inputId.value = rowData.pegawai_id ?? "";
  if (inputNama) inputNama.value = rowData.nama ?? "";
  if (inputN) inputN.value = rowData.n ?? 0;
  if (inputN1) inputN1.value = rowData.n1 ?? 0;
  if (inputN2) inputN2.value = rowData.n2 ?? 0;
 if (modalSaldo) modalSaldo.showModal();
}

function renderTabelSaldoCuti() {
  const tbody = document.getElementById("tbodySaldoCuti");
  if (!tbody) return;

  const keyword =
    document.getElementById("searchSaldo")?.value?.trim().toLowerCase() || "";

  const filtered = keyword
    ? cachedSaldoRows.filter((p) => {
        const namaMatch = (p.nama || "").toLowerCase().includes(keyword);
        const nipMatch = String(p.nip || "").toLowerCase().includes(keyword);
        return namaMatch || nipMatch;
      })
    : cachedSaldoRows;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;">Data tidak ditemukan</td>
      </tr>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const p of filtered) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td align="center">${p.nip ?? "-"}</td>
      <td>${p.nama ?? "-"}</td>
      <td align="center">${p.n2 ?? 0}</td>
      <td align="center">${p.n1 ?? 0}</td>
      <td align="center">${p.n ?? 0}</td>
      <td>
        <button
          type="button"
          class="btn btn-sm btn-primary btnEditSaldo"
          data-id="${p.pegawai_id}">
          Edit
        </button>
      </td>
    `;
    fragment.appendChild(tr);
  }

  tbody.replaceChildren(fragment);
}

export async function initSaldoCuti() {
  setHeaderTahunSaldo();
  await loadSaldoCuti();

  const tbody = document.getElementById("tbodySaldoCuti");
  if (tbody && !tbody.dataset.bound) {
    tbody.dataset.bound = "1";
    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest(".btnEditSaldo");
      if (!btn) return;
      const rowData = saldoRowById.get(String(btn.dataset.id));
      bukaModalEditSaldo(rowData);
    });
  }

  const modalSaldo = document.getElementById("modalSaldo");

  // 1. Tambahan tombol close (✕) di header modal
  const btnTutup = document.getElementById("btnTutupSaldo");
  if (btnTutup && modalSaldo && !btnTutup.dataset.bound) {
    btnTutup.dataset.bound = "1";
    btnTutup.addEventListener("click", () => {
      modalSaldo.close();
    });
  }

  // 2. Ubah modalSaldo.style.display = "none" -> modalSaldo.close()
  const btnBatal = document.getElementById("btnBatalSaldo");
  if (btnBatal && modalSaldo && !btnBatal.dataset.bound) {
    btnBatal.dataset.bound = "1";
    btnBatal.addEventListener("click", () => {
      modalSaldo.close();
    });
  }

  const btnSimpan = document.getElementById("btnSimpanSaldo");
  if (btnSimpan && !btnSimpan.dataset.bound) {
    btnSimpan.dataset.bound = "1";
    btnSimpan.addEventListener("click", async () => {
      if (isSavingSaldo) return;

      const id = Number(document.getElementById("pegawaiIdSaldo")?.value);
      const saldoN = Number(document.getElementById("saldoN")?.value);
      const saldoN1 = Number(document.getElementById("saldoN1")?.value);
      const saldoN2 = Number(document.getElementById("saldoN2")?.value);

      // 3. Validasi batas maksimal & nilai negatif sebelum RPC
      if (
        Number.isNaN(saldoN) || saldoN < 0 || saldoN > 12 ||
        Number.isNaN(saldoN1) || saldoN1 < 0 || saldoN1 > 6 ||
        Number.isNaN(saldoN2) || saldoN2 < 0 || saldoN2 > 6
      ) {
        await showToast("Periksa kembali batas saldo cuti (tahun berjalan maks. 12 hari, 2 tahun sebelumnya maks. 6 hari, tidak boleh negatif).", "error");
        return;
      }

      isSavingSaldo = true;

      try {
        const { error } = await supabase.rpc("save_saldo_cuti", {
          p_pegawai_id: id,
          p_saldo_n: saldoN,
          p_saldo_n1: saldoN1,
          p_saldo_n2: saldoN2
        });

        if (error) {
          await showToast(error.message, "error");
          return;
        }

        await showToast("Saldo cuti berhasil diperbarui.", "success");
        modalSaldo?.close(); // <-- 2. Ganti dari modalSaldo.style.display = "none"
        await loadSaldoCuti();
      } finally {
        isSavingSaldo = false;
      }
    });
  }

  const searchInput = document.getElementById("searchSaldo");
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = "1";
    searchInput.addEventListener("input", renderTabelSaldoCuti);
  }
}

async function loadSaldoCuti() {
  setHeaderTahunSaldo();

  const tbody = document.getElementById("tbodySaldoCuti");
  const { data, error } = await supabase.rpc("get_saldo_cuti");

  if (error) {
    console.error(error);
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;">Gagal memuat saldo cuti</td>
        </tr>
      `;
    }
    return;
  }

  cachedSaldoRows = Array.isArray(data) ? data : [];
  saldoRowById.clear();
  for (const row of cachedSaldoRows) {
    if (row?.pegawai_id != null) {
      saldoRowById.set(String(row.pegawai_id), row);
    }
  }

  renderTabelSaldoCuti();
}

export async function updateSaldoCuti(pegawaiId, jumlahHari) {
  const { error } = await supabase.rpc("kurangi_saldo_cuti", {
    p_pegawai_id: pegawaiId,
    p_jumlah_hari: jumlahHari
  });

  if (error) {
    throw error;
  }
}