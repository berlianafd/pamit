import {
  badgeStatus,
  updateStatusPengajuan,
  updateTKBerdasarkanRentangTanggal,
  showToast
} from "../utils/helper.js";
import { KETERANGAN_TK } from "../config/constants.js";

const URUTAN_STATUS_DL = {
  MENUNGGU: 1,
  DIPROSES: 2,
  DISETUJUI: 3,
  DITOLAK: 4,
  SELESAI: 5
};

let needRefreshDlAfterClose = false;

function formatDaftarPeserta(anggotaList = []) {
  if (!Array.isArray(anggotaList) || anggotaList.length === 0) return "-";

  const sorted = [...anggotaList].sort((a, b) => Number(Boolean(b.is_pengaju)) - Number(Boolean(a.is_pengaju)));
  return sorted
    .map((x) => {
      const nama = x.pegawai?.nama ?? "-";
      return x.is_pengaju ? `👤 <b>${nama}</b>` : `• ${nama}`;
    })
    .join("<br>");
}

function formatRentangTanggalDl(dl) {
  if (!dl?.tanggal_mulai) return "-";
  return `${dl.tanggal_mulai}<br>s.d.<br>${dl.tanggal_selesai || "-"}`;
}

function renderAksiPresensiDl(item) {
  if (item.status === "MENUNGGU") {
    return `<button type="button" class="btn btn-primary btn-detail-review" data-id="${item.id}">Review</button>`;
  }
  if (item.status === "DIPROSES") {
    return `<button type="button" class="btn btn-warning btn-detail-review" data-id="${item.id}">Lanjutkan Review</button>`;
  }
  return `
    <button type="button" class="btn-lihat-surtug" data-id="${item.id}">Lihat Surat Tugas</button>
    <br>
    <button type="button" class="btn btn-success" disabled>✔ Sudah Diproses</button>
  `;
}

export async function initReviewPresensiDL() {
  await loadReviewPresensiDL();

  const tbody = document.getElementById("reviewPresensiDlBody");
  if (tbody && !tbody.dataset.bound) {
    tbody.dataset.bound = "1";
    tbody.addEventListener("click", async (e) => {
      const btnLihat = e.target.closest(".btn-lihat-surtug");
      if (btnLihat) {
        await lihatSuratTugas(btnLihat.dataset.id);
        return;
      }

      const btn = e.target.closest(".btn-detail-review");
      if (!btn) return;

      await bukaDetailPresensiDL(Number(btn.dataset.id));
    });
  }

  const modalDetail = document.getElementById("modalDetailPresensiDL");
  if (modalDetail && !modalDetail.dataset.closeBound) {
    modalDetail.dataset.closeBound = "1";
    modalDetail.addEventListener("close", async () => {
      if (needRefreshDlAfterClose) {
        needRefreshDlAfterClose = false;
        await loadReviewPresensiDL();
      }
    });
  }

  const btnSetujui = document.getElementById("btnSetujuiDl");
  if (btnSetujui) {
    btnSetujui.onclick = async () => {
      const id = window.currentPengajuanId;
      if (!id) return;
      await approvePresensiDL(id);
    };
  }

  const modalTolak = document.getElementById("modalTolakDl");
  const txtAlasan = document.getElementById("txtAlasanTolakDl");

  const btnTolak = document.getElementById("btnTolakDl");
  if (btnTolak && modalTolak) {
    btnTolak.onclick = () => {
      if (txtAlasan) txtAlasan.value = "";
      modalTolak.showModal();
    };
  }

  const btnBatalTolak = document.getElementById("btnBatalTolakDl");
  if (btnBatalTolak && modalTolak) {
    btnBatalTolak.onclick = () => modalTolak.close();
  }

  const btnSimpanTolak = document.getElementById("btnSimpanTolakDl");
  if (btnSimpanTolak) {
    btnSimpanTolak.onclick = async () => {
      const alasan = txtAlasan?.value.trim() || "";
      if (!alasan) {
        showToast("Alasan penolakan wajib diisi.", "warning");
        txtAlasan?.focus();
        return;
      }
      await tolakPresensiDL(window.currentPengajuanId, alasan);
    };
  }
}

async function loadReviewPresensiDL() {
  const tbody = document.getElementById("reviewPresensiDlBody");
  if (!tbody) return;

  const { data, error } = await supabase
    .from("pengajuan")
    .select(`
      id,
      nomor_pengajuan,
      jenis_pengajuan,
      status,
      catatan_admin,
      pengajuan_anggota(
        is_pengaju,
        pegawai(nama)
      ),
      dl_detail(
        tanggal_mulai,
        tanggal_selesai,
        jumlah_hari
      )
    `)
    .eq("jenis_pengajuan", "DL")
    .is("deleted_at", null);

  if (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="7">Gagal memuat data</td></tr>`;
    return;
  }

  const sortedRows = [...(data || [])].sort((a, b) => {
    const statusA = URUTAN_STATUS_DL[a.status] ?? 99;
    const statusB = URUTAN_STATUS_DL[b.status] ?? 99;
    if (statusA !== statusB) return statusA - statusB;

    const tglA = a.dl_detail?.[0]?.tanggal_mulai ?? "";
    const tglB = b.dl_detail?.[0]?.tanggal_mulai ?? "";
    return tglB.localeCompare(tglA);
  });

  const fragment = document.createDocumentFragment();

  for (const item of sortedRows) {
    const tr = document.createElement("tr");
    tr.align = "center";

    const daftarNama = formatDaftarPeserta(item.pengajuan_anggota);
    const tanggal = formatRentangTanggalDl(item.dl_detail?.[0]);
    const statusHtml = typeof badgeStatus === "function" ? badgeStatus(item.status) : item.status;

    tr.innerHTML = `
      <td>${item.nomor_pengajuan}</td>
      <td>${daftarNama}</td>
      <td>${item.jenis_pengajuan}</td>
      <td>${tanggal}</td>
      <td>${statusHtml}</td>
      <td>${item.catatan_admin ?? "-"}</td>
      <td>${renderAksiPresensiDl(item)}</td>
    `;

    fragment.appendChild(tr);
  }

  tbody.replaceChildren(fragment);
}

async function bukaDetailPresensiDL(id) {
  window.currentPengajuanId = id;

  const { data, error } = await supabase
    .from("pengajuan")
    .select("id, status")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  if (data.status === "MENUNGGU" && typeof updateStatusPengajuan === "function") {
    await updateStatusPengajuan(id, "DIPROSES", "Dokumen sedang diverifikasi.");
    needRefreshDlAfterClose = true;
  }

  await isiModalDetailPresensiDL(id);
}

async function approvePresensiDL(id) {
  const { data, error } = await supabase
    .from("pengajuan")
    .select(`
      pengajuan_anggota(pegawai_id),
      dl_detail(tanggal_mulai, tanggal_selesai)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    showToast("Gagal memuat detail DL untuk pembaruan TK.", "error");
    return;
  }

  if (typeof updateStatusPengajuan === "function") {
    await updateStatusPengajuan(id, "SELESAI", "Perubahan status presensi selesai.");
  }

  const pegawaiIds = (data?.pengajuan_anggota || [])
    .map((x) => x.pegawai_id)
    .filter(Boolean);
  const dl = data?.dl_detail?.[0];

  if (pegawaiIds.length > 0 && dl?.tanggal_mulai && dl?.tanggal_selesai) {
    await updateTKBerdasarkanRentangTanggal(
      pegawaiIds,
      dl.tanggal_mulai,
      dl.tanggal_selesai,
      KETERANGAN_TK.DL
    );
  }

  needRefreshDlAfterClose = false;
  document.getElementById("modalDetailPresensiDL")?.close();
  await loadReviewPresensiDL();
}

async function tolakPresensiDL(id, alasan) {
  if (typeof updateStatusPengajuan === "function") {
    await updateStatusPengajuan(id, "DITOLAK", alasan);
  }

  needRefreshDlAfterClose = false;
  document.getElementById("modalTolakDl")?.close();
  document.getElementById("modalDetailPresensiDL")?.close();

  const txtAlasan = document.getElementById("txtAlasanTolakDl");
  if (txtAlasan) txtAlasan.value = "";

  await loadReviewPresensiDL();
}

async function isiModalDetailPresensiDL(id) {
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

  renderModalDetailPresensiDL(data, fileUrl);
}

function renderModalDetailPresensiDL(data, fileUrl) {
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

  document.getElementById("modalDetailPresensiDL")?.showModal();
}

async function lihatSuratTugas(pengajuanId) {
  const { data, error } = await supabase
    .from("dokumen")
    .select("file_url")
    .eq("pengajuan_id", pengajuanId)
    .eq("jenis_dokumen", "SURAT_TUGAS")
    .single();

  if (error || !data?.file_url) {
    showToast("Dokumen tidak ditemukan.", "error");
    return;
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from("surat_dl")
    .createSignedUrl(data.file_url, 600);

  if (signedError || !signed?.signedUrl) {
    showToast("Gagal membuka dokumen.", "error");
    return;
  }

  window.open(signed.signedUrl, "_blank");
}