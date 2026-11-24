import {
  updateTKBerdasarkanRentangTanggal,
  updateTKKarenaCutiTahunan,
  badgeStatus,
  updateStatusPengajuan
} from "/utils/helper.js";
import { KETERANGAN_TK } from "../config/constants.js";
import { generateFormCuti } from "/utils/generateFormCuti.js";

const JENIS_LABEL = {
  CUTI_TAHUNAN: "Cuti Tahunan",
  CUTI_SAKIT: "Cuti Sakit",
  CUTI_ALASAN_PENTING: "Cuti Alasan Penting"
};

const URUTAN_STATUS = {
  MENUNGGU: 1,
  DIPROSES: 2,
  DISETUJUI: 3,
  DITOLAK: 4,
  SELESAI: 5
};

const CATATAN_SIAP_TTD = new Set([
  "Dokumen disetujui",
  "Dokumen sedang dalam penyusunan dan diajukan untuk penandatanganan.",
  "Proses perubahan status presensi."
]);

let applySearchFilterFn = null;

function formatRentangTanggal(item) {
  if (item.jenis_pengajuan === "CUTI_TAHUNAN") {
    const list = item.cuti_tahunan_tanggal ?? [];
    if (list.length === 0) return "-";
    return `${list[0].tanggal}<br>s.d.<br>${list[list.length - 1].tanggal}`;
  }

  const detail =
    item.jenis_pengajuan === "CUTI_SAKIT"
      ? item.cuti_sakit_detail?.[0]
      : item.cuti_alasan_penting_detail?.[0];

  if (!detail) return "-";
  return `${detail.tanggal_mulai}<br>s.d.<br>${detail.tanggal_selesai}`;
}

export async function initReviewPengajuan() {
  applySearchFilterFn = initSearchReviewPengajuan();
  await loadReviewPengajuan();

  const tbody = document.getElementById("reviewPengajuanBody");
  if (tbody && !tbody.dataset.bound) {
    tbody.dataset.bound = "1";
    tbody.addEventListener("click", async (e) => {
      const btnReview = e.target.closest(".btn-detail-review");
      if (btnReview) {
        await bukaDetailPengajuan(Number(btnReview.dataset.id));
        return;
      }

      const btnHapus = e.target.closest(".btn-hapus-pengajuan");
      if (btnHapus) {
        await hapusPengajuan(Number(btnHapus.dataset.id));
      }
    });
  }

  const modalDetail = document.getElementById("modalDetailPengajuan");
  const btnCloseModal = document.getElementById("btnCloseModal");
  if (btnCloseModal && modalDetail) {
    btnCloseModal.onclick = () => modalDetail.close();
  }
  if (modalDetail && !modalDetail.dataset.cancelBound) {
    modalDetail.dataset.cancelBound = "1";
    modalDetail.addEventListener("cancel", (e) => {
      e.preventDefault();
      modalDetail.close();
    });
  }

  const btnDisetujui = document.getElementById("btnDisetujui");
  if (btnDisetujui) {
    btnDisetujui.onclick = async () => {
      if (!window.currentPengajuanId) return;
      await approvePengajuan(window.currentPengajuanId);
    };
  }

  const modalTolak = document.getElementById("modalTolak");
  const txtAlasanTolak = document.getElementById("txtAlasanTolak");

  const btnTolak = document.getElementById("btnTolak");
  if (btnTolak && modalTolak) {
    btnTolak.onclick = () => {
      if (txtAlasanTolak) txtAlasanTolak.value = "";
      modalTolak.showModal();
    };
  }

  const btnBatalTolak = document.getElementById("btnBatalTolak");
  if (btnBatalTolak && modalTolak) {
    btnBatalTolak.onclick = () => modalTolak.close();
  }

  const btnSimpanTolak = document.getElementById("btnSimpanTolak");
  if (btnSimpanTolak) {
    btnSimpanTolak.onclick = async () => {
      const alasan = txtAlasanTolak?.value.trim() || "";
      if (!alasan) {
        alert("Alasan penolakan wajib diisi.");
        txtAlasanTolak?.focus();
        return;
      }
      await tolakPengajuan(window.currentPengajuanId, alasan);
    };
  }

  const btnDownloadForm = document.getElementById("btnDownloadForm");
  if (btnDownloadForm) {
    btnDownloadForm.onclick = async () => {
      const id = window.currentPengajuanId;
      if (!id) return;
      try {
        await generateFormCuti(id);
        await Promise.all([loadReviewPengajuan(), isiModalDetail(id)]);
      } catch (err) {
        console.error(err);
        alert("Gagal membuat dokumen.");
      }
    };
  }

  const btnSudahDitandatangani = document.getElementById("btnSudahDitandatangani");
  const modalUploadTTD = document.getElementById("modalUploadTTD");
  if (btnSudahDitandatangani && modalUploadTTD) {
    btnSudahDitandatangani.onclick = () => {
      window.currentPengajuanIdTTD = window.currentPengajuanId;
      modalUploadTTD.showModal();
    };
  }

  const btnUploadTTD = document.getElementById("btnUploadTTD");
  if (btnUploadTTD) {
    btnUploadTTD.onclick = uploadFormTTD;
  }
}

function initSearchReviewPengajuan() {
  const inputSearch = document.getElementById("searchNamaPengajuan");
  const btnClear = document.getElementById("btnResetSearchNama");
  const tbody = document.getElementById("reviewPengajuanBody");

  if (!inputSearch || !tbody) return () => {};

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m]));
  }

  function applyFilter() {
    const keyword = inputSearch.value.trim().toLowerCase();
    if (btnClear) {
      btnClear.style.display = keyword ? "inline-flex" : "none";
    }

    const rows = Array.from(tbody.querySelectorAll("tr:not(.empty-search-row)"));
    let visibleCount = 0;

    for (const row of rows) {
      const namaPegawai = (row.cells[1]?.textContent || "").toLowerCase();
      const isMatch = !keyword || namaPegawai.includes(keyword);
      row.style.display = isMatch ? "" : "none";
      if (isMatch) visibleCount++;
    }

    let emptyRow = tbody.querySelector("tr.empty-search-row");
    if (rows.length > 0 && visibleCount === 0) {
      const pesan = `Tidak ada pengajuan atas nama "<strong>${escapeHtml(inputSearch.value.trim())}</strong>".`;
      if (!emptyRow) {
        emptyRow = document.createElement("tr");
        emptyRow.className = "empty-search-row";
        emptyRow.innerHTML = `<td colspan="7">${pesan}</td>`;
        tbody.appendChild(emptyRow);
      } else {
        emptyRow.innerHTML = `<td colspan="7">${pesan}</td>`;
        emptyRow.style.display = "";
      }
    } else if (emptyRow) {
      emptyRow.style.display = "none";
    }
  }

  if (!inputSearch.dataset.searchBound) {
    inputSearch.dataset.searchBound = "1";
    inputSearch.addEventListener("input", applyFilter);
    btnClear?.addEventListener("click", () => {
      inputSearch.value = "";
      applyFilter();
      inputSearch.focus();
    });
  }

  return applyFilter;
}

async function loadReviewPengajuan() {
  const tbody = document.getElementById("reviewPengajuanBody");
  if (!tbody) return;

  const { data, error } = await supabase
    .from("pengajuan")
    .select(`
      id,
      nomor_pengajuan,
      jenis_pengajuan,
      status,
      catatan_admin,
      created_at,
      pengajuan_anggota!inner(
        is_pengaju,
        pegawai(nama)
      ),
      cuti_tahunan_tanggal(tanggal),
      cuti_sakit_detail(tanggal_mulai, tanggal_selesai),
      cuti_alasan_penting_detail(tanggal_mulai, tanggal_selesai)
    `)
    .eq("pengajuan_anggota.is_pengaju", true)
    .in("jenis_pengajuan", ["CUTI_TAHUNAN", "CUTI_SAKIT", "CUTI_ALASAN_PENTING"])
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="7">Gagal memuat data</td></tr>`;
    return;
  }

  const rowsList = [...(data || [])].sort((a, b) => {
    const sA = URUTAN_STATUS[a.status] ?? 99;
    const sB = URUTAN_STATUS[b.status] ?? 99;
    return sA - sB;
  });

  const fragment = document.createDocumentFragment();

  for (const item of rowsList) {
    const tr = document.createElement("tr");
    tr.align = "center";

    const pegawai = item.pengajuan_anggota?.[0]?.pegawai?.nama ?? "-";
    const jenis = JENIS_LABEL[item.jenis_pengajuan] ?? "Cuti Alasan Penting";
    const tanggal = formatRentangTanggal(item);
    const statusHtml = typeof badgeStatus === "function" ? badgeStatus(item.status) : item.status;

    tr.innerHTML = `
      <td>${item.nomor_pengajuan}</td>
      <td>${pegawai}</td>
      <td>${jenis}</td>
      <td>${tanggal}</td>
      <td>${statusHtml}</td>
      <td>${item.catatan_admin ?? "-"}</td>
      <td>
        <button type="button" class="btn-detail-review" data-id="${item.id}">Detail</button>
        <button type="button" class="btn-hapus-pengajuan" data-id="${item.id}">Hapus</button>
      </td>
    `;

    fragment.appendChild(tr);
  }

  tbody.replaceChildren(fragment);
  applySearchFilterFn?.();
}

async function bukaDetailPengajuan(id) {
  window.currentPengajuanId = id;

  const { data, error } = await supabase
    .from("pengajuan")
    .select("id, status, jenis_pengajuan")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  let statusChanged = false;
  if (data.status === "MENUNGGU") {
    await updateStatusPengajuan(id, "DIPROSES", "Dokumen sedang diverifikasi.");
    statusChanged = true;
  }

  await isiModalDetail(id);

  const modal = document.getElementById("modalDetailPengajuan");
  modal?.showModal();

  if (statusChanged) {
    await loadReviewPengajuan();
  }
}

async function hapusPengajuan(id) {
  window.currentPengajuanId = id;

  if (!confirm("Yakin ingin menghapus pengajuan ini?")) {
    return;
  }

  const { error } = await supabase
    .from("pengajuan")
    .update({
      deleted_at: new Date().toISOString(),
      delete_reason: "Dihapus oleh admin"
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Gagal menghapus pengajuan.");
    return;
  }

  alert("Pengajuan berhasil dihapus.");
  await loadReviewPengajuan();
}

function renderCardDataCuti(data) {
  if (data.jenis_pengajuan === "CUTI_TAHUNAN") {
    const detail = data.cuti_tahunan_detail?.[0];
    const tanggal = (data.cuti_tahunan_tanggal || []).map((x) => x.tanggal).join("<br>");
    return `
      <div class="card-title">📅 Data Cuti Tahunan</div>
      <table class="table-detail">
        <tr><td>Alasan</td><td>${detail?.alasan ?? "-"}</td></tr>
        <tr><td>Alamat Selama Cuti</td><td>${detail?.alamat_cuti ?? "-"}</td></tr>
        <tr><td>Tanggal Cuti</td><td>${tanggal || "-"}</td></tr>
      </table>
    `;
  }

  if (data.jenis_pengajuan === "CUTI_SAKIT") {
    const detail = data.cuti_sakit_detail?.[0];
    return `
      <div class="card-title">🩺 Data Cuti Sakit</div>
      <table class="table-detail">
        <tr><td>Tanggal Mulai</td><td>${detail?.tanggal_mulai ?? "-"}</td></tr>
        <tr><td>Tanggal Selesai</td><td>${detail?.tanggal_selesai ?? "-"}</td></tr>
        <tr><td>Jumlah Hari</td><td>${detail?.jumlah_hari ?? 0} Hari</td></tr>
      </table>
    `;
  }

  const detail = data.cuti_alasan_penting_detail?.[0];
  return `
    <div class="card-title">Data Cuti Alasan Penting</div>
    <table class="table-detail">
      <tr><td>Tanggal Mulai</td><td>${detail?.tanggal_mulai ?? "-"}</td></tr>
      <tr><td>Tanggal Selesai</td><td>${detail?.tanggal_selesai ?? "-"}</td></tr>
      <tr><td>Jumlah Hari</td><td>${detail?.jumlah_hari ?? 0} Hari</td></tr>
    </table>
  `;
}

async function isiModalDetail(id) {
  const { data, error } = await supabase
    .from("pengajuan")
    .select(`
      id,
      nomor_pengajuan,
      jenis_pengajuan,
      status,
      catatan_admin,
      pengajuan_anggota!inner(pegawai(nama)),
      cuti_tahunan_detail(alasan, alamat_cuti),
      cuti_tahunan_tanggal(tanggal),
      cuti_sakit_detail(tanggal_mulai, tanggal_selesai, jumlah_hari),
      cuti_alasan_penting_detail(tanggal_mulai, tanggal_selesai, jumlah_hari),
      dokumen(jenis_dokumen, file_url)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  const docs = data.dokumen || [];
  window.currentNamaPegawai = data.pengajuan_anggota?.[0]?.pegawai?.nama ?? "";

  const formTTD = docs.find((d) => d.jenis_dokumen === "FORM_CUTI_TTD");
  const previewFormTTD = document.getElementById("previewFormTTD");
  const cardPreviewFormTTD = document.getElementById("card-preview-ttd");
  const btnDownload = document.getElementById("btnDownloadForm");
  const btnTTD = document.getElementById("btnSudahDitandatangani");
  const btnSetujui = document.getElementById("btnDisetujui");
  const btnTolak = document.getElementById("btnTolak");

  if (formTTD) {
    if (btnDownload) btnDownload.style.display = "none";
    if (btnTTD) btnTTD.style.display = "none";
    if (btnSetujui) btnSetujui.style.display = "none";
    if (btnTolak) btnTolak.style.display = "none";
    if (cardPreviewFormTTD) cardPreviewFormTTD.style.display = "block";
    if (previewFormTTD) previewFormTTD.style.display = "block";
  } else {
    if (cardPreviewFormTTD) cardPreviewFormTTD.style.display = "none";
    const siapTTD = CATATAN_SIAP_TTD.has(data.catatan_admin);
    if (btnDownload) btnDownload.style.display = siapTTD ? "inline-block" : "none";
    if (btnTTD) btnTTD.style.display = siapTTD ? "inline-block" : "none";
    if (btnSetujui) btnSetujui.style.display = siapTTD ? "none" : "inline-block";
    if (btnTolak) btnTolak.style.display = siapTTD ? "none" : "inline-block";
  }

  if (data.status === "SELESAI") {
    if (btnDownload) btnDownload.style.display = "none";
    if (btnTTD) btnTTD.style.display = "none";
    if (btnTolak) btnTolak.style.display = "none";
    if (btnSetujui) btnSetujui.style.display = "none";
  }

  document.getElementById("detailNomor").textContent = data.nomor_pengajuan ?? "-";
  document.getElementById("detailNama").textContent = window.currentNamaPegawai || "-";
  document.getElementById("detailJenis").textContent = (data.jenis_pengajuan || "").replaceAll("_", " ");
  document.getElementById("detailStatus").textContent = data.status ?? "-";
  document.getElementById("detailCatatan").textContent = data.catatan_admin ?? "-";

  const card = document.getElementById("cardDataCuti");
  if (card) {
    card.innerHTML = renderCardDataCuti(data);
  }

  const preview = document.getElementById("previewDokumen");
  if (!preview) return;

  if (docs.length === 0) {
    preview.innerHTML = `<center>Belum ada dokumen.</center>`;
    return;
  }

  const dokumen = docs[0];
  const bucket = data.jenis_pengajuan === "CUTI_SAKIT" ? "surat_sakit" : "persetujuan_atasan";

  const { data: signed, error: signedError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(dokumen.file_url, 600);

  if (signedError || !signed?.signedUrl) {
    console.error(signedError);
    preview.innerHTML = `<center>Gagal memuat dokumen.</center>`;
    return;
  }

  const ext = dokumen.file_url.split(".").pop().toLowerCase();

  if (ext === "pdf") {
    preview.innerHTML = `<iframe src="${signed.signedUrl}" class="preview-file"></iframe>`;
  } else {
    let rotate = 0;
    preview.innerHTML = `
      <div class="preview-toolbar">
        <button type="button" id="btnRotateLeft">↺ Putar Kiri</button>
        <button type="button" id="btnRotateRight">Putar Kanan ↻</button>
      </div>
      <div class="preview-wrapper">
        <img id="previewImg" src="${signed.signedUrl}" class="preview-image" alt="Dokumen Pendukung">
      </div>
    `;

    const img = document.getElementById("previewImg");
    document.getElementById("btnRotateLeft").onclick = () => {
      rotate -= 90;
      img.style.transform = `rotate(${rotate}deg)`;
    };
    document.getElementById("btnRotateRight").onclick = () => {
      rotate += 90;
      img.style.transform = `rotate(${rotate}deg)`;
    };
  }

  if (formTTD && previewFormTTD) {
    const { data: signedTTD } = await supabase.storage
      .from("form_cuti_ttd")
      .createSignedUrl(formTTD.file_url, 600);

    if (signedTTD?.signedUrl) {
      previewFormTTD.innerHTML = `<iframe src="${signedTTD.signedUrl}" class="preview-file"></iframe>`;
    }
  }
}

async function uploadFormTTD() {
  const fileInput = document.getElementById("fileTTD");
  const file = fileInput?.files?.[0];

  if (!file) {
    alert("Pilih file terlebih dahulu.");
    return;
  }

  const now = new Date();
  const stamp =
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    "_" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  const uuid = crypto.randomUUID().split("-")[0];
  const nama = (window.currentNamaPegawai || "PEGAWAI")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_]/g, "");

  const fileName = `CUTI_${nama}_${stamp}_${uuid}.pdf`;

  const { error } = await supabase.storage
    .from("form_cuti_ttd")
    .upload(fileName, file, { upsert: true });

  if (error) {
    alert(error.message);
    console.error(error);
    return;
  }

  const { error: docError } = await supabase
    .from("dokumen")
    .insert({
      pengajuan_id: window.currentPengajuanIdTTD,
      jenis_dokumen: "FORM_CUTI_TTD",
      file_url: fileName
    });

  if (docError) {
    alert(docError.message);
    console.error(docError);
    return;
  }

  await sudahDitandatangani(window.currentPengajuanIdTTD);
}

async function sudahDitandatangani(id) {
  const { data, error } = await supabase
    .from("pengajuan")
    .update({
      status: "DISETUJUI",
      catatan_admin: "Proses perubahan status presensi."
    })
    .eq("id", id)
    .select(`
      jenis_pengajuan,
      pengajuan_anggota(pegawai_id, is_pengaju),
      cuti_sakit_detail(tanggal_mulai, tanggal_selesai),
      cuti_tahunan_tanggal(tanggal)
    `)
    .single();

  if (error) {
    alert(error.message);
    console.error(error);
    return;
  }

  const pengaju = data?.pengajuan_anggota?.find((x) => x.is_pengaju);
  if (pengaju?.pegawai_id) {
    if (data.jenis_pengajuan === "CUTI_SAKIT" && data.cuti_sakit_detail?.[0]) {
      await updateTKBerdasarkanRentangTanggal(
        [pengaju.pegawai_id],
        data.cuti_sakit_detail[0].tanggal_mulai,
        data.cuti_sakit_detail[0].tanggal_selesai,
        KETERANGAN_TK.CUTISAKIT
      );
    } else if (data.jenis_pengajuan === "CUTI_TAHUNAN") {
      await updateTKKarenaCutiTahunan(
        [pengaju.pegawai_id],
        (data.cuti_tahunan_tanggal || []).map((x) => x.tanggal),
        KETERANGAN_TK.CUTITAHUNAN
      );
    }
  }

  document.getElementById("modalUploadTTD")?.close();
  await Promise.all([loadReviewPengajuan(), isiModalDetail(id)]);
}

async function approvePengajuan(id) {
  const { error } = await supabase.rpc("approve_pengajuan", {
    p_pengajuan_id: id
  });

  if (error) {
    alert(error.message);
    console.error(error);
    return;
  }

  document.getElementById("modalDetailPengajuan")?.close();
  await loadReviewPengajuan();
}

async function tolakPengajuan(id, alasan) {
  const { error } = await supabase
    .from("pengajuan")
    .update({
      status: "DITOLAK",
      catatan_admin: alasan
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  document.getElementById("modalTolak")?.close();
  document.getElementById("modalDetailPengajuan")?.close();

  const txtAlasan = document.getElementById("txtAlasanTolak");
  if (txtAlasan) txtAlasan.value = "";

  await loadReviewPengajuan();
}