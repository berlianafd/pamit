import {
  getPegawaiLogin,
  badgeStatus,
  updateTKBerdasarkanRentangTanggal,
  refreshKeteranganTKRentang,
  showToast
} from "/utils/helper.js";
import { uploadDokumen } from "/utils/upload.js";
import { KETERANGAN_TK } from "/modules/config/constants.js";

const MAX_PDF_BYTES = 2 * 1024 * 1024;

let cachedPegawai = null;
let pesertaDipilih = [];
let daftarPegawai = [];
let isSubmittingDl = false;

async function getCurrentPegawai() {
  if (cachedPegawai?.id) return cachedPegawai;
  const pegawai = await getPegawaiLogin();
  if (pegawai?.id) {
    cachedPegawai = pegawai;
  }
  return cachedPegawai;
}

function resetPesertaKePengaju(pegawai) {
  pesertaDipilih = pegawai?.id
    ? [{ id: pegawai.id, nama: pegawai.nama, isOwner: true }]
    : [];
  renderPeserta();
}

function resetFormPengajuanDl(pegawai) {
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  setVal("tglMulai", "");
  setVal("tglSelesai", "");
  setVal("keteranganDl", "");
  setVal("suratDl", "");
  setVal("cariPegawai", "");

  const hasil = document.getElementById("hasilCariPegawai");
  if (hasil) hasil.innerHTML = "";

  resetPesertaKePengaju(pegawai);
}

function renderAksiRiwayatDl(p) {
  const btnDetail = `
    <button type="button" class="btn-detail" data-id="${p.id}">Detail</button>
  `;
  const btnHapus =
    p.status === "MENUNGGU"
      ? `<button type="button" class="btn-danger btn-hapus" data-id="${p.id}">Hapus</button>`
      : "";
  return `${btnDetail}${btnHapus}`;
}

export async function initPengajuanDl() {
  const pegawai = await getCurrentPegawai();

  resetPesertaKePengaju(pegawai);
  await Promise.all([loadRiwayatDl(), loadDaftarPegawai()]);

  const bindOnce = (el, event, handler) => {
    if (!el || el.dataset[`bound_${event}`]) return;
    el.dataset[`bound_${event}`] = "1";
    el.addEventListener(event, handler);
  };

  bindOnce(document.getElementById("btnSimpanDl"), "click", simpanPengajuanDl);
  bindOnce(document.getElementById("cariPegawai"), "input", cariPegawai);

  const hasilCari = document.getElementById("hasilCariPegawai");
  bindOnce(hasilCari, "click", (e) => {
    const item = e.target.closest(".hasil-item");
    if (!item) return;
    tambahPesertaById(Number(item.dataset.id));
  });

  const pesertaContainer = document.getElementById("pesertaContainer");
  bindOnce(pesertaContainer, "click", (e) => {
    const btn = e.target.closest(".hapusPeserta");
    if (!btn) return;
    pesertaDipilih = pesertaDipilih.filter((p) => String(p.id) !== String(btn.dataset.id));
    renderPeserta();
  });

  const tbody = document.getElementById("riwayatDlBody");
  bindOnce(tbody, "click", async (e) => {
    const detail = e.target.closest(".btn-detail");
    if (detail) {
      await loadDetailDl(Number(detail.dataset.id));
      return;
    }

    const hapus = e.target.closest(".btn-hapus");
    if (hapus) {
      await hapusPengajuanDl(Number(hapus.dataset.id));
    }
  });

  bindOnce(document.getElementById("btnCloseDetailDl"), "click", () => {
    const modal = document.getElementById("detailDlModal");
    if (modal) modal.style.display = "none";
  });
}

async function simpanPengajuanDl() {
  if (isSubmittingDl) return;

  const tglMulai = document.getElementById("tglMulai")?.value || "";
  const tglSelesai = document.getElementById("tglSelesai")?.value || "";
  const keterangan = document.getElementById("keteranganDl")?.value.trim() || "";
  const file = document.getElementById("suratDl")?.files?.[0];

  if (!tglMulai) {
    showToast("Tanggal mulai wajib diisi.", "error");
    return;
  }

  if (!tglSelesai) {
    showToast("Tanggal selesai wajib diisi.", "error");
    return;
  }

  if (new Date(tglSelesai) < new Date(tglMulai)) {
    showToast("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.", "error");
    return;
  }

  if (!keterangan) {
    showToast("Keterangan wajib diisi.", "error");
    return;
  }

  if (!file) {
    showToast("Surat tugas wajib diupload.", "error");
    return;
  }

  if (file.type !== "application/pdf") {
    showToast("File surat tugas harus berformat PDF.", "warning");
    return;
  }

  if (file.size > MAX_PDF_BYTES) {
    showToast("Ukuran file maksimal 2 MB.", "error");
    return;
  }

  const pegawai = await getCurrentPegawai();
  if (!pegawai?.id) {
    showToast("Data pegawai login tidak ditemukan.", "error");
    return;
  }

  isSubmittingDl = true;
  try {
    let filePath;
    try {
      filePath = await uploadDokumen("surat_dl", "DL", pegawai.id, file);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Gagal mengupload surat tugas.", "error");
      return;
    }

    const { data: nomorPengajuan, error: nomorError } = await supabase.rpc(
      "generate_nomor_pengajuan",
      { p_jenis: "DL" }
    );

    if (nomorError || !nomorPengajuan) {
      console.error(nomorError);
      showToast("Gagal membuat nomor pengajuan.", "error");
      return;
    }

    const nowIso = new Date().toISOString();

    const { data: pengajuan, error: pengajuanError } = await supabase
      .from("pengajuan")
      .insert({
        nomor_pengajuan: nomorPengajuan,
        pegawai_id: pegawai.id,
        jenis_pengajuan: "DL",
        status: "MENUNGGU",
        created_by: pegawai.id,
        created_at: nowIso
      })
      .select("id")
      .single();

    if (pengajuanError || !pengajuan?.id) {
      console.error(pengajuanError);
      showToast("Gagal menyimpan pengajuan.", "error");
      return;
    }

    const anggotaPayload = pesertaDipilih.map((p) => ({
      pengajuan_id: pengajuan.id,
      pegawai_id: p.id,
      is_pengaju: Boolean(p.isOwner)
    }));

    const { error: anggotaError } = await supabase
      .from("pengajuan_anggota")
      .insert(anggotaPayload);

    if (anggotaError) {
      console.error(anggotaError);
      showToast("Gagal menyimpan peserta.", "error");
      return;
    }

    const mulai = new Date(tglMulai);
    const selesai = new Date(tglSelesai);
    const jumlahHari = Math.floor((selesai - mulai) / 86400000) + 1;

    const { error: detailError } = await supabase
      .from("dl_detail")
      .insert({
        pengajuan_id: pengajuan.id,
        tanggal_mulai: tglMulai,
        tanggal_selesai: tglSelesai,
        jumlah_hari: jumlahHari
      });

    if (detailError) {
      console.error(detailError);
      showToast("Gagal menyimpan detail DL.", "error");
      return;
    }

    const { error: dokumenError } = await supabase
      .from("dokumen")
      .insert({
        pengajuan_id: pengajuan.id,
        jenis_dokumen: "SURAT_TUGAS",
        file_url: filePath,
        status_verifikasi: "MENUNGGU",
        uploaded_at: nowIso
      });

    if (dokumenError) {
      console.error(dokumenError);
      showToast("Gagal menyimpan dokumen surat tugas.", "error");
      return;
    }

    const pegawaiIds = pesertaDipilih.map((x) => x.id);
    await updateTKBerdasarkanRentangTanggal(
      pegawaiIds,
      tglMulai,
      tglSelesai,
      KETERANGAN_TK.PENGAJUAN_DL
    );

    resetFormPengajuanDl(pegawai);
    await loadRiwayatDl();
    showToast("Pengajuan berhasil disimpan.", "success");
  } finally {
    isSubmittingDl = false;
  }
}

async function loadRiwayatDl() {
  const tbody = document.getElementById("riwayatDlBody");
  if (!tbody) return;

  const pegawai = await getCurrentPegawai();
  if (!pegawai?.id) return;

  const { data, error } = await supabase
    .from("pengajuan_anggota")
    .select(`
      is_pengaju,
      pengajuan!inner(
        id,
        nomor_pengajuan,
        status,
        created_at,
        jenis_pengajuan,
        deleted_at,
        catatan_admin,
        dl_detail(
          tanggal_mulai,
          tanggal_selesai,
          jumlah_hari
        ),
        pengajuan_anggota(id)
      )
    `)
    .eq("pegawai_id", pegawai.id)
    .eq("pengajuan.jenis_pengajuan", "DL")
    .is("pengajuan.deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const item of data || []) {
    const p = item.pengajuan;
    if (!p) continue;

    const detail = p.dl_detail?.[0];
    const jumlahPeserta = p.pengajuan_anggota?.length ?? 0;
    const tanggalTeks = detail?.tanggal_mulai
      ? `${detail.tanggal_mulai}${detail.tanggal_selesai ? ` s/d ${detail.tanggal_selesai}` : ""}`
      : "-";
    const statusHtml = typeof badgeStatus === "function" ? badgeStatus(p.status) : p.status;

    const tr = document.createElement("tr");
    tr.align = "center";
    tr.innerHTML = `
      <td>${p.nomor_pengajuan}</td>
      <td>${tanggalTeks}</td>
      <td>${jumlahPeserta} Orang</td>
      <td>${statusHtml}</td>
      <td>${p.catatan_admin ?? "-"}</td>
      <td>${renderAksiRiwayatDl(p)}</td>
    `;
    fragment.appendChild(tr);
  }

  tbody.replaceChildren(fragment);
}

async function loadDaftarPegawai() {
  const { data, error } = await supabase
    .from("pegawai")
    .select("id, nama")
    .eq("aktif", true)
    .order("nama");

  if (error) {
    console.error(error);
    return;
  }

  daftarPegawai = Array.isArray(data) ? data : [];
}

async function loadDetailDl(id) {
  const { data, error } = await supabase
    .from("pengajuan")
    .select(`
      nomor_pengajuan,
      status,
      dl_detail(
        tanggal_mulai,
        tanggal_selesai,
        jumlah_hari
      ),
      dokumen(
        file_url
      ),
      pengajuan_anggota(
        is_pengaju,
        pegawai(nama)
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  const dokumen = data.dokumen?.[0];
  let fileUrl = "";

  if (dokumen?.file_url) {
    const { data: signedData, error: signError } = await supabase
      .storage
      .from("surat_dl")
      .createSignedUrl(dokumen.file_url, 60 * 5);

    if (signError) {
      console.error(signError);
    } else if (signedData?.signedUrl) {
      fileUrl = signedData.signedUrl;
    }
  }

  renderDetailDl(data, fileUrl);
}

function renderDetailDl(data, fileUrl) {
  const detail = data.dl_detail?.[0];
  const body = document.getElementById("detailDlBody");
  if (!body) return;

  const pesertaHtml = (data.pengajuan_anggota || [])
    .map((p) => `<li>${p.pegawai?.nama ?? "-"}${p.is_pengaju ? " (Pengaju)" : ""}</li>`)
    .join("");

  const previewHtml = fileUrl
    ? `<div class="pdf-preview"><iframe src="${fileUrl}" width="100%" height="500" frameborder="0"></iframe></div>`
    : `<p>-</p>`;

  body.innerHTML = `
    <b>Nomor Pengajuan</b>
    <p>${data.nomor_pengajuan}</p>

    <b>Tanggal DL</b>
    <p>${detail?.tanggal_mulai ?? "-"}${detail?.tanggal_selesai ? ` s/d ${detail.tanggal_selesai}` : ""}</p>

    <b>Status</b>
    <p>${data.status}</p>

    <b>Peserta</b>
    <ul>${pesertaHtml}</ul>

    <b>Surat Tugas</b>
    ${previewHtml}
  `;

  const modal = document.getElementById("detailDlModal");
  if (modal) modal.style.display = "flex";
}

async function hapusPengajuanDl(id) {
  if (!confirm("Yakin ingin menghapus pengajuan ini?")) {
    return;
  }

  const { data, error } = await supabase
    .from("pengajuan")
    .select("status")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  if (data.status !== "MENUNGGU") {
    showToast("Pengajuan tidak dapat dihapus.", "warning");
    return;
  }

  const pegawai = await getCurrentPegawai();
  const nowIso = new Date().toISOString();

  const { data: updateData, error: updateError } = await supabase
    .from("pengajuan")
    .update({
      deleted_at: nowIso,
      deleted_by: pegawai?.id || null,
      delete_reason: "Dihapus oleh pengaju"
    })
    .eq("id", id)
    .select("id");

  if (updateError) {
    console.error(updateError);
    showToast("Gagal menghapus.", "error");
    return;
  }

  if (!updateData || updateData.length === 0) {
    showToast("Pengajuan gagal dihapus (tidak memiliki izin update).", "error");
    return;
  }

  const { data: detail } = await supabase
    .from("pengajuan")
    .select(`
      pengajuan_anggota(pegawai_id),
      dl_detail(tanggal_mulai, tanggal_selesai)
    `)
    .eq("id", id)
    .single();

  const pegawaiIds = (detail?.pengajuan_anggota || []).map((x) => x.pegawai_id).filter(Boolean);
  const dl = detail?.dl_detail?.[0];

  if (pegawaiIds.length > 0 && dl?.tanggal_mulai && dl?.tanggal_selesai) {
    await Promise.all(
      pegawaiIds.map((pegawaiId) =>
        refreshKeteranganTKRentang(pegawaiId, dl.tanggal_mulai, dl.tanggal_selesai)
      )
    );
  }

  showToast("Pengajuan berhasil dihapus.", "success");
  await loadRiwayatDl();
}

function cariPegawai() {
  const keyword = document.getElementById("cariPegawai")?.value.trim().toLowerCase() || "";
  const hasil = document.getElementById("hasilCariPegawai");
  if (!hasil) return;

  if (!keyword) {
    hasil.innerHTML = "";
    return;
  }

  const selectedIds = new Set(pesertaDipilih.map((x) => x.id));
  const list = daftarPegawai.filter(
    (p) => (p.nama || "").toLowerCase().includes(keyword) && !selectedIds.has(p.id)
  );

  hasil.innerHTML = list
    .map((p) => `<div class="hasil-item" data-id="${p.id}">${p.nama}</div>`)
    .join("");
}

function tambahPesertaById(id) {
  const pegawai = daftarPegawai.find((p) => p.id === id);
  if (!pegawai) return;
  if (pesertaDipilih.some((p) => p.id === pegawai.id)) return;

  pesertaDipilih.push({
    id: pegawai.id,
    nama: pegawai.nama,
    isOwner: false
  });

  renderPeserta();

  const hasil = document.getElementById("hasilCariPegawai");
  const cariInput = document.getElementById("cariPegawai");
  if (hasil) hasil.innerHTML = "";
  if (cariInput) cariInput.value = "";
}

function renderPeserta() {
  const container = document.getElementById("pesertaContainer");
  if (!container) return;

  container.className = "peserta-container";
  container.innerHTML = pesertaDipilih
    .map(
      (p) => `
      <div class="peserta-chip ${p.isOwner ? "pengaju" : ""}">
        ${p.nama}
        ${
          p.isOwner
            ? `<span>(Pengaju)</span>`
            : `<button type="button" class="hapusPeserta" data-id="${p.id}">✕</button>`
        }
      </div>
    `
    )
    .join("");
}