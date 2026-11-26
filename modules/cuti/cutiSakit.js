import { initWilayahCuti } from "../utils/wilayahServices.js";
import {
  lihatFormCuti,
  getPegawaiLogin,
  badgeStatus,
  updateTKBerdasarkanRentangTanggal,
  refreshKeteranganTKRentang,
  showToast
} from "../utils/helper.js";
import { KETERANGAN_TK } from "../config/constants.js";
import { uploadDokumen } from "../utils/upload.js";

const ALLOWED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png"]);
const MAX_PDF_BYTES = 2 * 1024 * 1024;

let cachedPegawai = null;
let isSubmittingCutiSakit = false;

async function getCurrentPegawai() {
  if (cachedPegawai?.id) return cachedPegawai;
  const pegawai = await getPegawaiLogin();
  if (pegawai?.id) {
    cachedPegawai = pegawai;
  }
  return cachedPegawai;
}

function getSelectedOptionText(selectEl) {
  if (!selectEl || selectEl.selectedIndex < 0) return "";
  return selectEl.options[selectEl.selectedIndex]?.text?.trim() || "";
}

function resetFormCutiSakit() {
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };
  const setDisabled = (id, disabled) => {
    const el = document.getElementById(id);
    if (el) el.disabled = disabled;
  };

  setVal("tanggalMulai", "");
  setVal("tanggalSelesai", "");
  setVal("suratSakit", "");
  setVal("alasanCutiSakit", "");
  setVal("alamatCutiSakit", "");
  setVal("rtCutiSakit", "");
  setVal("rwCutiSakit", "");
  setVal("desaCuti", "");
  setDisabled("desaCuti", true);
  setVal("kecamatanCuti", "");
  setDisabled("kecamatanCuti", true);
  setVal("kotaCuti", "");
  setDisabled("kotaCuti", true);
  setVal("provinsiCuti", "");

  const namaFile = document.getElementById("namaFileSuratSakit");
  if (namaFile) namaFile.textContent = "Belum ada file dipilih";
}

function renderAksiRiwayatCutiSakit(p) {
  const btnSurat = `
    <button type="button" class="btn-lihat-surat" data-id="${p.id}">
      Lihat Surat Sakit
    </button>
  `;

  const btnHapus =
    p.status === "MENUNGGU"
      ? `<button type="button" class="btn-danger btn-hapus-cs" data-id="${p.id}">Hapus</button>`
      : "";

  const btnForm =
    p.status === "SELESAI"
      ? `<button type="button" class="btn-success btn-lihat-form-cuti" data-id="${p.id}">Lihat Form Cuti</button>`
      : "";

  return `${btnSurat}${btnHapus}${btnForm}`;
}

export async function initPengajuanCutiSakit() {
  const fileInput = document.getElementById("suratSakit");
  if (fileInput && !fileInput.dataset.bound) {
    fileInput.dataset.bound = "1";
    fileInput.addEventListener("change", function () {
      const namaFile = document.getElementById("namaFileSuratSakit");
      if (!namaFile) return;

      namaFile.textContent = this.files?.length
        ? this.files[0].name
        : "Belum ada file dipilih";
    });
  }

  const btnSimpan = document.getElementById("btnSimpanCutiSakit");
  if (btnSimpan && !btnSimpan.dataset.bound) {
    btnSimpan.dataset.bound = "1";
    btnSimpan.addEventListener("click", simpanPengajuanCutiSakit);
  }

  const tbody = document.getElementById("riwayatCutiSakitBody");
  if (tbody && !tbody.dataset.bound) {
    tbody.dataset.bound = "1";
    tbody.addEventListener("click", async (e) => {
      const lihat = e.target.closest(".btn-lihat-surat");
      if (lihat) {
        await lihatSuratCutiSakit(Number(lihat.dataset.id));
        return;
      }

      const hapus = e.target.closest(".btn-hapus-cs");
      if (hapus) {
        await hapusPengajuanCutiSakit(Number(hapus.dataset.id));
        return;
      }

      const btnLihatForm = e.target.closest(".btn-lihat-form-cuti");
      if (btnLihatForm) {
        await lihatFormCuti(Number(btnLihatForm.dataset.id));
      }
    });
  }

  initWilayahCuti();
  await loadRiwayatCutiSakit();
}

async function simpanPengajuanCutiSakit() {
  if (isSubmittingCutiSakit) return;

  const tanggalMulai = document.getElementById("tanggalMulai")?.value || "";
  const tanggalSelesai = document.getElementById("tanggalSelesai")?.value || "";
  const alamat = document.getElementById("alamatCutiSakit")?.value.trim() || "";
  const rt = document.getElementById("rtCutiSakit")?.value.trim() || "";
  const rw = document.getElementById("rwCutiSakit")?.value.trim() || "";

  const desaSelect = document.getElementById("desaCuti");
  const kecamatanSelect = document.getElementById("kecamatanCuti");
  const kotaSelect = document.getElementById("kotaCuti");

  const desa = desaSelect?.value.trim() || "";
  const kecamatan = kecamatanSelect?.value.trim() || "";
  const kota = kotaSelect?.value.trim() || "";

  const namaKota = getSelectedOptionText(kotaSelect);
  const namaKecamatan = getSelectedOptionText(kecamatanSelect);
  const namaDesa = getSelectedOptionText(desaSelect);

  const file = document.getElementById("suratSakit")?.files?.[0];

  if (!tanggalMulai) {
    showToast("Tanggal mulai wajib diisi.", "error");
    return;
  }

  if (!tanggalSelesai) {
    showToast("Tanggal selesai wajib diisi.", "error");
    return;
  }

  if (new Date(tanggalSelesai) < new Date(tanggalMulai)) {
    showToast("Tanggal selesai tidak boleh lebih kecil dari tanggal mulai.", "error");
    return;
  }

  if (!file) {
    showToast("Surat sakit wajib diupload.", "error");
    return;
  }

  if (!alamat || !rt || !rw || !desa || !kecamatan || !kota) {
    showToast("Alamat lengkap wajib diisi.", "error");
    return;
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    showToast("File harus PDF/JPG/JPEG/PNG.", "warning");
    return;
  }

  if (ext === "pdf" && file.size > MAX_PDF_BYTES) {
    showToast("PDF maksimal 2 MB.", "error");
    return;
  }

  const pegawai = await getCurrentPegawai();
  if (!pegawai?.id) {
    showToast("Data pegawai login tidak ditemukan.", "error");
    return;
  }

  isSubmittingCutiSakit = true;
  try {
    const alamatLengkap = [
      alamat,
      rt || rw ? `RT ${rt || "-"} RW ${rw || "-"}` : "",
      desa ? namaDesa : "",
      kecamatan ? `Kecamatan ${namaKecamatan}` : "",
      kota ? namaKota : ""
    ]
      .filter(Boolean)
      .join(", ");

    let fileUrl;
    try {
      fileUrl = await uploadDokumen("surat_sakit", "CS", pegawai.id, file);
    } catch (err) {
      console.error(err);
      showToast(err.message, "error");
      return;
    }

    const { data: nomorPengajuan, error: nomorError } = await supabase.rpc(
      "generate_nomor_pengajuan",
      { p_jenis: "CS" }
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
        jenis_pengajuan: "CUTI_SAKIT",
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

    const { error: anggotaError } = await supabase
      .from("pengajuan_anggota")
      .insert({
        pengajuan_id: pengajuan.id,
        pegawai_id: pegawai.id,
        is_pengaju: true
      });

    if (anggotaError) {
      console.error(anggotaError);
      showToast("Gagal menyimpan pengaju.", "error");
      return;
    }

    const mulai = new Date(tanggalMulai);
    const selesai = new Date(tanggalSelesai);
    const jumlahHari = Math.floor((selesai - mulai) / 86400000) + 1;

    const { error: detailError } = await supabase
      .from("cuti_sakit_detail")
      .insert({
        pengajuan_id: pengajuan.id,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        jumlah_hari: jumlahHari,
        alamat: alamatLengkap
      });

    if (detailError) {
      console.error(detailError);
      showToast("Gagal menyimpan detail.", "error");
      return;
    }

    const { error: dokumenError } = await supabase
      .from("dokumen")
      .insert({
        pengajuan_id: pengajuan.id,
        jenis_dokumen: "SURAT_SAKIT",
        file_url: fileUrl,
        status_verifikasi: "MENUNGGU",
        uploaded_at: nowIso
      });

    if (dokumenError) {
      console.error(dokumenError);
      showToast("Gagal menyimpan dokumen.", "error");
      return;
    }

    await updateTKBerdasarkanRentangTanggal(
      [pegawai.id],
      tanggalMulai,
      tanggalSelesai,
      KETERANGAN_TK.PENGAJUAN_CUTI_SAKIT
    );

    resetFormCutiSakit();
    await loadRiwayatCutiSakit();
    showToast("Pengajuan berhasil disimpan.", "success");
  } finally {
    isSubmittingCutiSakit = false;
  }
}

async function loadRiwayatCutiSakit() {
  const tbody = document.getElementById("riwayatCutiSakitBody");
  if (!tbody) return;

  const pegawai = await getCurrentPegawai();
  if (!pegawai?.id) return;

  const { data, error } = await supabase
    .from("pengajuan")
    .select(`
      id,
      nomor_pengajuan,
      status,
      catatan_admin,
      cuti_sakit_detail(
        tanggal_mulai,
        tanggal_selesai,
        jumlah_hari
      )
    `)
    .eq("pegawai_id", pegawai.id)
    .eq("jenis_pengajuan", "CUTI_SAKIT")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const p of data || []) {
    const detail = p.cuti_sakit_detail?.[0];
    const tanggalTeks = detail?.tanggal_mulai
      ? `${detail.tanggal_mulai}${detail.tanggal_selesai ? ` s/d ${detail.tanggal_selesai}` : ""}`
      : "-";
    const statusHtml = typeof badgeStatus === "function" ? badgeStatus(p.status) : p.status;

    const tr = document.createElement("tr");
    tr.align = "center";
    tr.innerHTML = `
      <td>${p.nomor_pengajuan}</td>
      <td>${tanggalTeks}</td>
      <td>${statusHtml}</td>
      <td>${p.catatan_admin ?? "-"}</td>
      <td>${renderAksiRiwayatCutiSakit(p)}</td>
    `;
    fragment.appendChild(tr);
  }

  tbody.replaceChildren(fragment);
}

async function hapusPengajuanCutiSakit(id) {
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

  if (updateError || !updateData?.length) {
    console.error(updateError);
    showToast("Gagal menghapus.", "error");
    return;
  }

  const { data: detail } = await supabase
    .from("cuti_sakit_detail")
    .select("tanggal_mulai, tanggal_selesai")
    .eq("pengajuan_id", id)
    .single();

  if (pegawai?.id && detail?.tanggal_mulai && detail?.tanggal_selesai) {
    await refreshKeteranganTKRentang(pegawai.id, detail.tanggal_mulai, detail.tanggal_selesai);
  }

  showToast("Pengajuan berhasil dihapus.", "success");
  await loadRiwayatCutiSakit();
}

async function lihatSuratCutiSakit(id) {
  const { data, error } = await supabase
    .from("dokumen")
    .select("file_url")
    .eq("pengajuan_id", id)
    .eq("jenis_dokumen", "SURAT_SAKIT")
    .single();

  if (error || !data?.file_url) {
    console.error(error);
    return;
  }

  const { data: urlData, error: urlError } = await supabase
    .storage
    .from("surat_sakit")
    .createSignedUrl(data.file_url, 60);

  if (urlError || !urlData?.signedUrl) {
    console.error(urlError);
    return;
  }

  window.open(urlData.signedUrl, "_blank");
}