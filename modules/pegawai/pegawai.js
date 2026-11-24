import { supabase } from "../auth/auth.js";

let editId = null;
let currentPage = 1;
const pageSize = 10;
const pegawaiRowById = new Map();

let searchDebounceId = null;
let loadRequestSeq = 0;
let isSavingPegawai = false;
let isImportingExcel = false;

function resetFormTambahPegawai() {
  const fields = [
    "nipBaru",
    "namaBaru",
    "jabatanBaru",
    "nohpBaru",
    "pangkatgolBaru",
    "unitKerjaBaru"
  ];
  for (const id of fields) {
    const el = document.getElementById(id);
    if (el) el.value = "";
  }
}

function showEditModal(pegawai) {
  if (!pegawai) return;
  editId = pegawai.id;

  const editModal = document.getElementById("editModal");
  if (editModal) editModal.style.display = "flex";

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val ?? "";
  };

  setVal("editNama", pegawai.nama);
  setVal("editRole", pegawai.role || "pegawai");
  setVal("editJabatan", pegawai.jabatan);
  setVal("editUnitKerja", pegawai.unit_kerja);
  setVal("editNohp", pegawai.nohp);
  setVal("editPangkatgol", pegawai.pangkatgol);
}

function closeModal() {
  const modal = document.getElementById("pegawaiModal");
  if (modal) modal.style.display = "none";
}

function renderPagination(totalData) {
  const container = document.getElementById("pagination");
  if (!container) return;

  const totalPages = Math.max(1, Math.ceil((totalData || 0) / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;

  if (!totalData || totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  const parts = [
    `<button type="button" id="prevPage" ${currentPage === 1 ? "disabled" : ""}>←</button>`
  ];

  for (let i = 1; i <= totalPages; i++) {
    parts.push(
      `<button type="button" class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`
    );
  }

  parts.push(
    `<button type="button" id="nextPage" ${currentPage === totalPages ? "disabled" : ""}>→</button>`
  );

  container.innerHTML = parts.join("");
}

export async function loadPegawai() {
  const tbody = document.getElementById("pegawaiTableBody");
  if (!tbody) return;

  const reqId = ++loadRequestSeq;
  const keyword = document.getElementById("searchPegawai")?.value?.trim() || "";

  let query = supabase
    .from("pegawai")
    .select(
      "id, nip, id_fingerprint, nama, nohp, pangkatgol, jabatan, unit_kerja, role, aktif",
      { count: "exact" }
    );

  if (keyword) {
    query = query.or(`nip.ilike.%${keyword}%,nama.ilike.%${keyword}%`);
  }

  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order("nama", { ascending: true })
    .range(from, to);

  if (reqId !== loadRequestSeq) return;

  if (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="10" align="center">Gagal memuat data pegawai</td></tr>`;
    return;
  }

  const rows = data || [];
  pegawaiRowById.clear();

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" align="center">Data pegawai tidak ditemukan</td></tr>`;
    renderPagination(0);
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const p of rows) {
    pegawaiRowById.set(String(p.id), p);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nip ?? ""}</td>
      <td>${p.id_fingerprint ?? ""}</td>
      <td>${p.nama ?? ""}</td>
      <td>${p.nohp ?? ""}</td>
      <td>${p.pangkatgol ?? ""}</td>
      <td>${p.jabatan ?? ""}</td>
      <td>${p.unit_kerja ?? ""}</td>
      <td>${p.role ?? ""}</td>
      <td>${p.aktif ? "Aktif" : "Nonaktif"}</td>
      <td>
        <button type="button" class="btn-edit" data-id="${p.id}">Edit</button>
        <br><br>
        <button type="button" class="btn-reset" data-nip="${p.nip ?? ""}">Reset Password</button>
        <br><br>
        <button type="button" class="btn-status" data-id="${p.id}" data-aktif="${Boolean(p.aktif)}">
          ${p.aktif
            ? '<span class="badge badge-success">Aktif</span>'
            : '<span class="badge badge-danger">Nonaktif</span>'}
        </button>
      </td>
    `;
    fragment.appendChild(tr);
  }

  tbody.replaceChildren(fragment);
  renderPagination(count ?? 0);
}

export async function initMasterPegawai() {
  currentPage = 1;
  await loadPegawai();

  const searchInput = document.getElementById("searchPegawai");
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = "1";
    searchInput.addEventListener("input", () => {
      if (searchDebounceId) clearTimeout(searchDebounceId);
      searchDebounceId = setTimeout(() => {
        currentPage = 1;
        loadPegawai();
      }, 250);
    });
  }

  const tbody = document.getElementById("pegawaiTableBody");
  if (tbody && !tbody.dataset.bound) {
    tbody.dataset.bound = "1";
    tbody.addEventListener("click", async (e) => {
      const btnEdit = e.target.closest(".btn-edit");
      if (btnEdit) {
        showEditModal(pegawaiRowById.get(String(btnEdit.dataset.id)));
        return;
      }

      const btnReset = e.target.closest(".btn-reset");
      if (btnReset) {
        await resetPassword(btnReset.dataset.nip);
        return;
      }

      const btnStatus = e.target.closest(".btn-status");
      if (btnStatus) {
        await togglePegawai(Number(btnStatus.dataset.id), btnStatus.dataset.aktif === "true");
      }
    });
  }

  const pagination = document.getElementById("pagination");
  if (pagination && !pagination.dataset.bound) {
    pagination.dataset.bound = "1";
    pagination.addEventListener("click", (e) => {
      if (e.target.closest("#prevPage") && currentPage > 1) {
        currentPage--;
        loadPegawai();
        return;
      }
      if (e.target.closest("#nextPage")) {
        currentPage++;
        loadPegawai();
        return;
      }
      const pageBtn = e.target.closest(".page-btn");
      if (pageBtn) {
        currentPage = Number(pageBtn.dataset.page);
        loadPegawai();
      }
    });
  }

  const tambahModal = document.getElementById("tambahModal");
  const editModal = document.getElementById("editModal");
  const pegawaiModal = document.getElementById("pegawaiModal");

  const bindOnce = (el, event, handler) => {
    if (!el || el.dataset[`bound_${event}`]) return;
    el.dataset[`bound_${event}`] = "1";
    el.addEventListener(event, handler);
  };

  bindOnce(document.getElementById("btnTambahPegawai"), "click", () => {
    if (tambahModal) tambahModal.style.display = "flex";
  });

  bindOnce(document.getElementById("btnSimpanPegawai"), "click", simpanPegawai);
  bindOnce(document.getElementById("btnSimpanEdit"), "click", saveEditPegawai);

  bindOnce(document.getElementById("btnBatalTambah"), "click", () => {
    if (tambahModal) tambahModal.style.display = "none";
  });

  bindOnce(tambahModal, "click", (e) => {
    if (e.target.id === "tambahModal") tambahModal.style.display = "none";
  });

  bindOnce(document.getElementById("btnBatalEdit"), "click", () => {
    if (editModal) editModal.style.display = "none";
  });

  bindOnce(editModal, "click", (e) => {
    if (e.target.id === "editModal") editModal.style.display = "none";
  });

  bindOnce(document.getElementById("btnCloseModal"), "click", closeModal);

  bindOnce(pegawaiModal, "click", (e) => {
    if (e.target.id === "pegawaiModal") closeModal();
  });

  const fileImport = document.getElementById("fileImportPegawai");
  bindOnce(document.getElementById("btnImportPegawai"), "click", () => {
    fileImport?.click();
  });
  bindOnce(fileImport, "change", importPegawaiExcel);
}

async function simpanPegawai() {
  if (isSavingPegawai) return;

  const nip = document.getElementById("nipBaru")?.value.trim() || "";
  const nama = document.getElementById("namaBaru")?.value.trim() || "";
  const jabatan = document.getElementById("jabatanBaru")?.value.trim() || "";
  const pangkatgol = document.getElementById("pangkatgolBaru")?.value || "";
  const nohp = document.getElementById("nohpBaru")?.value.trim() || "";
  const unitKerja = document.getElementById("unitKerjaBaru")?.value.trim() || "";
  const role = document.getElementById("roleBaru")?.value || "pegawai";

  if (!nip || !nama || !jabatan || !nohp) {
    alert("Lengkapi data");
    return;
  }

  isSavingPegawai = true;
  try {
    await createPegawai({
      nip,
      nama,
      jabatan,
      pangkatgol,
      nohp,
      unit_kerja: unitKerja,
      role,
      aktif: true
    });

    alert("Pegawai Berhasil Ditambahkan");
    const tambahModal = document.getElementById("tambahModal");
    if (tambahModal) tambahModal.style.display = "none";
    resetFormTambahPegawai();
    await loadPegawai();
  } catch (err) {
    console.error(err);
    alert(err.message || "Gagal menambahkan pegawai");
  } finally {
    isSavingPegawai = false;
  }
}

async function createPegawai(payload) {
  const { data, error } = await supabase.functions.invoke("rapid-endpoint", {
    body: payload
  });

  if (error) {
    console.error("ERROR", error, "DATA", data);
    throw new Error(data?.error || data?.message || error.message);
  }
}

async function resetPassword(nip) {
  if (!nip || nip.length !== 18) {
    alert("NIP harus 18 digit");
    return;
  }

  if (!confirm(`Reset password ${nip}?`)) return;

  const { error } = await supabase.functions.invoke("reset-password", {
    body: { nip }
  });

  if (error) {
    console.error(error);
    alert("Gagal mereset password");
    return;
  }

  alert("Password berhasil direset");
}

async function togglePegawai(id, aktif) {
  const aksi = aktif ? "nonaktifkan" : "aktifkan";
  if (!confirm(`Yakin ${aksi} pegawai ini?`)) return;

  const { error } = await supabase
    .from("pegawai")
    .update({ aktif: !aktif })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Gagal mengubah status");
    return;
  }

  await loadPegawai();
}

async function saveEditPegawai() {
  if (!editId || isSavingPegawai) return;

  const nama = document.getElementById("editNama")?.value.trim() || "";
  const jabatan = document.getElementById("editJabatan")?.value.trim() || "";
  const unitKerja = document.getElementById("editUnitKerja")?.value.trim() || "";
  const role = document.getElementById("editRole")?.value || "pegawai";
  const nohp = document.getElementById("editNohp")?.value.trim() || "";
  const pangkatgol = document.getElementById("editPangkatgol")?.value || "";

  isSavingPegawai = true;
  try {
    const { error } = await supabase
      .from("pegawai")
      .update({
        nama,
        role,
        jabatan,
        unit_kerja: unitKerja,
        nohp,
        pangkatgol
      })
      .eq("id", editId);

    if (error) {
      console.error(error);
      alert("Gagal menyimpan perubahan");
      return;
    }

    const editModal = document.getElementById("editModal");
    if (editModal) editModal.style.display = "none";
    await loadPegawai();
  } finally {
    isSavingPegawai = false;
  }
}

async function importPegawaiExcel(e) {
  const file = e.target.files?.[0];
  if (!file || isImportingExcel) return;

  isImportingExcel = true;
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    let berhasil = 0;
    let gagal = 0;
    const daftarError = [];
    const batchSize = 5;

    for (let i = 0; i < rows.length; i += batchSize) {
      const chunk = rows.slice(i, i + batchSize);
      await Promise.all(
        chunk.map(async (row) => {
          try {
            await createPegawai({
              nip: row.nip?.toString().trim(),
              nama: row.nama?.toString().trim(),
              jabatan: row.jabatan?.toString().trim(),
              pangkatgol: row.pangkatgol?.toString().trim(),
              nohp: row.nohp?.toString().trim(),
              unit_kerja: row.unit_kerja?.toString().trim(),
              role: row.role?.toString().trim(),
              aktif: true
            });
            berhasil++;
          } catch (err) {
            gagal++;
            daftarError.push({
              nip: row.nip,
              nama: row.nama,
              error: err.message
            });
          }
        })
      );
    }

    if (daftarError.length > 0) console.table(daftarError);
    alert(`Import selesai\n\nBerhasil : ${berhasil}\nGagal : ${gagal}`);
    currentPage = 1;
    await loadPegawai();
  } finally {
    isImportingExcel = false;
    e.target.value = "";
  }
}