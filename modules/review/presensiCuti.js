import { badgeStatus, showToast } from "/utils/helper.js";

const JENIS_CUTI_LABEL = {
  CUTI_TAHUNAN: "Cuti Tahunan",
  CUTI_SAKIT: "Cuti Sakit",
  CUTI_ALASAN_PENTING: "Cuti Alasan Penting"
};

const URUTAN_STATUS_CUTI = {
  MENUNGGU: 1,
  DIPROSES: 2,
  DISETUJUI: 3,
  DITOLAK: 4,
  SELESAI: 5
};

function ambilTanggalAwal(item) {
  if (item.jenis_pengajuan === "CUTI_SAKIT") {
    return item.cuti_sakit_detail?.[0]?.tanggal_mulai ?? "";
  }
  if (item.jenis_pengajuan === "CUTI_ALASAN_PENTING") {
    return item.cuti_alasan_penting_detail?.[0]?.tanggal_mulai ?? "";
  }
  if (item.jenis_pengajuan === "CUTI_TAHUNAN") {
    const sorted = [...(item.cuti_tahunan_tanggal || [])]
      .map((x) => x.tanggal)
      .filter(Boolean)
      .sort();
    return sorted[0] ?? "";
  }
  return "";
}

function formatRentangTanggalCuti(item) {
  if (item.jenis_pengajuan === "CUTI_TAHUNAN") {
    const sorted = [...(item.cuti_tahunan_tanggal || [])]
      .map((x) => x.tanggal)
      .filter(Boolean)
      .sort();
    if (sorted.length === 0) return "-";
    return `${sorted[0]}<br>s.d.<br>${sorted[sorted.length - 1]}`;
  }

  const detail =
    item.jenis_pengajuan === "CUTI_SAKIT"
      ? item.cuti_sakit_detail?.[0]
      : item.cuti_alasan_penting_detail?.[0];

  if (!detail?.tanggal_mulai) return "-";
  return `${detail.tanggal_mulai}<br>s.d.<br>${detail.tanggal_selesai || "-"}`;
}

function renderAksiPresensiCuti(item) {
  const btnSurat = `
    <button type="button" class="btnLihatSurat" data-id="${item.id}">
      📄 Lihat Surat
    </button>
  `;

  const btnStatus =
    item.status === "SELESAI"
      ? `<button type="button" class="btn btn-success" disabled>✔ Sudah Diproses</button>`
      : `<button type="button" class="btn btn-primary btnSelesai" data-id="${item.id}">Tandai Selesai</button>`;

  return `${btnSurat}${btnStatus}`;
}

export async function initReviewPresensiCuti() {
  await loadReviewPresensiCuti();

  const tbody = document.getElementById("reviewPengajuanBody");
  if (!tbody || tbody.dataset.bound) return;
  tbody.dataset.bound = "1";

  tbody.addEventListener("click", async (e) => {
    const btnLihat = e.target.closest(".btnLihatSurat");
    if (btnLihat) {
      await lihatSuratTTD(btnLihat.dataset.id);
      return;
    }

    const btn = e.target.closest(".btnSelesai");
    if (!btn) return;

    if (!confirm("Perubahan status presensi sudah selesai dilakukan?")) {
      return;
    }

    const { error } = await supabase
      .from("pengajuan")
      .update({
        status: "SELESAI",
        catatan_admin: "Perubahan status presensi selesai."
      })
      .eq("id", btn.dataset.id);

    if (error) {
      showToast("Gagal memperbarui status pengajuan.", "error");
      return;
    }

    await loadReviewPresensiCuti();
  });
}

export async function loadReviewPresensiCuti() {
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
      pengajuan_anggota!inner(
        is_pengaju,
        pegawai(nama)
      ),
      cuti_tahunan_tanggal(tanggal),
      cuti_sakit_detail(tanggal_mulai, tanggal_selesai),
      cuti_alasan_penting_detail(tanggal_mulai, tanggal_selesai)
    `)
    .eq("pengajuan_anggota.is_pengaju", true)
    .in("status", ["DISETUJUI", "SELESAI"])
    .in("jenis_pengajuan", ["CUTI_TAHUNAN", "CUTI_SAKIT", "CUTI_ALASAN_PENTING"])
    .is("deleted_at", null);

  if (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="7">Gagal memuat data</td></tr>`;
    return;
  }

  const sortedRows = [...(data || [])].sort((a, b) => {
    const statusA = URUTAN_STATUS_CUTI[a.status] ?? 99;
    const statusB = URUTAN_STATUS_CUTI[b.status] ?? 99;
    if (statusA !== statusB) return statusA - statusB;

    const tglA = ambilTanggalAwal(a);
    const tglB = ambilTanggalAwal(b);
    return tglB.localeCompare(tglA);
  });

  const fragment = document.createDocumentFragment();

  for (const item of sortedRows) {
    const tr = document.createElement("tr");
    tr.align = "center";

    const pegawai = item.pengajuan_anggota?.[0]?.pegawai?.nama ?? "-";
    const jenis = JENIS_CUTI_LABEL[item.jenis_pengajuan] ?? "Cuti Alasan Penting";
    const tanggal = formatRentangTanggalCuti(item);
    const statusHtml = typeof badgeStatus === "function" ? badgeStatus(item.status) : item.status;

    tr.innerHTML = `
      <td>${item.nomor_pengajuan}</td>
      <td>${pegawai}</td>
      <td>${jenis}</td>
      <td>${tanggal}</td>
      <td>${statusHtml}</td>
      <td>${item.catatan_admin ?? "-"}</td>
      <td>${renderAksiPresensiCuti(item)}</td>
    `;

    fragment.appendChild(tr);
  }

  tbody.replaceChildren(fragment);
}

async function lihatSuratTTD(pengajuanId) {
  const { data, error } = await supabase
    .from("dokumen")
    .select("file_url")
    .eq("pengajuan_id", pengajuanId)
    .eq("jenis_dokumen", "FORM_CUTI_TTD")
    .single();

  if (error || !data?.file_url) {
    showToast("Dokumen tidak ditemukan.", "error");
    return;
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from("form_cuti_ttd")
    .createSignedUrl(data.file_url, 600);

  if (signedError || !signed?.signedUrl) {
    showToast("Gagal membuka dokumen.", "error");
    return;
  }

  window.open(signed.signedUrl, "_blank");
}