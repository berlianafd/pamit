import { formatTanggal, cekKeteranganTK, showToast} from "../utils/helper.js";

let daftarPegawaiTK = [];
let isSavingTK = false;
let searchDebounceId = null;
let searchRequestSeq = 0;

function renderDaftarPegawaiTK() {
  const box = document.getElementById("pegawaiTKContainer");
  if (!box) return;

  box.innerHTML = daftarPegawaiTK
    .map(
      (p, i) => `
      <div class="pegawai-selected">
        <span>${p.nama}</span>
        <button type="button" class="btnRemovePegawai" data-index="${i}">✕</button>
      </div>
    `
    )
    .join("");
}

function tambahPegawaiTK(pegawai) {
  if (daftarPegawaiTK.some((x) => x.id === pegawai.id)) {
    showToast("Pegawai sudah dipilih.", "warning");
    return;
  }

  daftarPegawaiTK.push(pegawai);
  renderDaftarPegawaiTK();

  const searchInput = document.getElementById("pegawaiTKSearch");
  const resultBox = document.getElementById("pegawaiTKResult");
  if (searchInput) searchInput.value = "";
  if (resultBox) resultBox.innerHTML = "";
}

async function cariPegawaiTK(keyword) {
  const result = document.getElementById("pegawaiTKResult");
  if (!result) return;

  const trimmed = keyword.trim();
  if (trimmed.length < 2) {
    searchRequestSeq++;
    result.innerHTML = "";
    return;
  }

  const reqId = ++searchRequestSeq;
  const { data, error } = await supabase
    .from("pegawai")
    .select("id, nama")
    .ilike("nama", `%${trimmed}%`)
    .eq("aktif", true)
    .order("nama");

  if (reqId !== searchRequestSeq) return;

  if (error) {
    console.error(error);
    return;
  }

  result.innerHTML = (data || [])
    .map(
      (p) => `
      <div
        class="pegawai-item"
        data-id="${p.id}"
        data-nama="${p.nama}">
        ${p.nama}
      </div>
    `
    )
    .join("");
}

function scheduleCariPegawaiTK(keyword) {
  if (searchDebounceId) {
    clearTimeout(searchDebounceId);
  }
  searchDebounceId = setTimeout(() => {
    cariPegawaiTK(keyword);
  }, 200);
}

async function simpanTK() {
  if (isSavingTK) return;

  const tanggal = document.getElementById("tanggalTK")?.value;
  if (!tanggal) {
    showToast("Pilih tanggal terlebih dahulu.", "error");
    return;
  }

  if (daftarPegawaiTK.length === 0) {
    showToast("Pilih minimal 1 pegawai.", "warning");
    return;
  }

  isSavingTK = true;
  try {
    const nowIso = new Date().toISOString();

    const rows = await Promise.all(
      daftarPegawaiTK.map(async (p) => {
        const keterangan = await cekKeteranganTK(p.id, tanggal);
        return {
          pegawai_id: p.id,
          tanggal,
          keterangan,
          created_at: nowIso,
          updated_at: nowIso
        };
      })
    );

    const { error } = await supabase.from("tk_bulanan").insert(rows);

    if (error) {
      if (error.code === "23505") {
        showToast("Ada pegawai yang sudah tercatat TK pada tanggal tersebut.", "error");
        return;
      }
      showToast("Gagal menyimpan data TK.", "error");
      return;
    }

    showToast("Data Pegawai Tanpa Keterangan berhasil disimpan.", "success");

    daftarPegawaiTK = [];
    renderDaftarPegawaiTK();

    const searchInput = document.getElementById("pegawaiTKSearch");
    if (searchInput) searchInput.value = "";

    await loadRiwayatTK();
  } finally {
    isSavingTK = false;
  }
}

export async function loadRiwayatTK() {
  const body = document.getElementById("riwayatTKBody");
  if (!body) return;

  const { data, error } = await supabase
    .from("tk_bulanan")
    .select(`
      id,
      tanggal,
      keterangan,
      created_at,
      pegawai (
        nama
      )
    `)
    .is("deleted_at", null)
    .order("tanggal", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    body.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center">Belum ada data.</td>
      </tr>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const x of data) {
    const tr = document.createElement("tr");
    tr.align = "center";
    tr.innerHTML = `
      <td>${formatTanggal(x.tanggal)}</td>
      <td>${x.pegawai?.nama ?? "-"}</td>
      <td>${x.keterangan ?? "-"}</td>
      <td>
        <button type="button" class="btnDeleteTK" data-id="${x.id}">🗑️ Hapus</button>
      </td>
    `;
    fragment.appendChild(tr);
  }

  body.replaceChildren(fragment);
}

export async function initPresensiTK() {
  await loadRiwayatTK();

  const searchInput = document.getElementById("pegawaiTKSearch");
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = "1";
    searchInput.addEventListener("input", (e) => {
      scheduleCariPegawaiTK(e.target.value);
    });
  }

  const resultBox = document.getElementById("pegawaiTKResult");
  if (resultBox && !resultBox.dataset.bound) {
    resultBox.dataset.bound = "1";
    resultBox.addEventListener("click", (e) => {
      const item = e.target.closest(".pegawai-item");
      if (!item) return;
      tambahPegawaiTK({
        id: Number(item.dataset.id),
        nama: item.dataset.nama
      });
    });
  }

  const containerBox = document.getElementById("pegawaiTKContainer");
  if (containerBox && !containerBox.dataset.bound) {
    containerBox.dataset.bound = "1";
    containerBox.addEventListener("click", (e) => {
      const btn = e.target.closest(".btnRemovePegawai");
      if (!btn) return;
      daftarPegawaiTK.splice(Number(btn.dataset.index), 1);
      renderDaftarPegawaiTK();
    });
  }

  const btnSimpan = document.getElementById("btnSimpanTK");
  if (btnSimpan && !btnSimpan.dataset.bound) {
    btnSimpan.dataset.bound = "1";
    btnSimpan.addEventListener("click", simpanTK);
  }

  const riwayatBody = document.getElementById("riwayatTKBody");
  if (riwayatBody && !riwayatBody.dataset.bound) {
    riwayatBody.dataset.bound = "1";
    riwayatBody.addEventListener("click", async (e) => {
      const btn = e.target.closest(".btnDeleteTK");
      if (!btn) return;

      if (!confirm("Yakin ingin menghapus data TK ini?")) {
        return;
      }

      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from("tk_bulanan")
        .update({
          deleted_at: nowIso,
          updated_at: nowIso
        })
        .eq("id", btn.dataset.id);

      if (error) {
        console.error(error);
        showToast("Gagal menghapus data TK.", "error");
        return;
      }

      await loadRiwayatTK();
    });
  }
}