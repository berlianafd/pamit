import {
  lihatFormCuti,
  updateTKKarenaCutiTahunan,
  refreshKeteranganTKTanggal,
  badgeStatus,
  getPegawaiLogin,
  showToast
} from "/utils/helper.js";
import { initWilayahCuti } from "/utils/wilayahServices.js";
import { uploadDokumen } from "/utils/upload.js";
import { KETERANGAN_TK } from "../config/constants.js";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);
const ALLOWED_IMAGE_EXTS = new Set(["jpg", "jpeg", "png"]);
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

let cachedPegawai = null;
let tanggalCutiDipilih = [];
let calendarCuti = null;
let isSubmittingCutiTahunan = false;

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

function refreshTanggalDipilih() {
  const sortedDates = [...tanggalCutiDipilih].sort();

  if (calendarCuti) {
    const events = sortedDates.map((tanggal) => ({
      id: tanggal,
      start: tanggal,
      allDay: true,
      display: "background",
      color: "#2563eb"
    }));
    calendarCuti.removeAllEvents();
    calendarCuti.addEventSource(events);
  }

  const totalHariEl = document.getElementById("totalHari");
  if (totalHariEl) totalHariEl.textContent = String(sortedDates.length);

  const tanggalDipilihEl = document.getElementById("tanggalDipilih");
  if (tanggalDipilihEl) tanggalDipilihEl.innerHTML = sortedDates.join("<br>");
}

function resetFormCutiTahunan() {
  tanggalCutiDipilih = [];
  refreshTanggalDipilih();

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };
  const setDisabled = (id, disabled) => {
    const el = document.getElementById(id);
    if (el) el.disabled = disabled;
  };

  setVal("alasanCuti", "");
  setVal("alamatCuti", "");
  setVal("rtCuti", "");
  setVal("rwCuti", "");
  setVal("desaCuti", "");
  setDisabled("desaCuti", true);
  setVal("kecamatanCuti", "");
  setDisabled("kecamatanCuti", true);
  setVal("kotaCuti", "");
  setDisabled("kotaCuti", true);
  setVal("provinsiCuti", "");
  setVal("persetujuanAtasan", "");

  const namaFile = document.getElementById("namaFilePersetujuan");
  if (namaFile) namaFile.textContent = "Belum ada file dipilih";
}

function renderAksiRiwayatCutiTahunan(p) {
  const fileUrl = p.dokumen?.[0]?.file_url ?? "";
  const btnSurat = `
    <button type="button" class="btn-lihat-surat" data-file="${fileUrl}">
      Bukti Persetujuan Atasan
    </button>
  `;

  const btnHapus =
    p.status === "MENUNGGU"
      ? `<button type="button" class="btn-danger btn-hapus-cuti" data-id="${p.id}">Hapus</button>`
      : "";

  const btnForm =
    p.status === "SELESAI"
      ? `<button type="button" class="btn-success btn-lihat-form-cuti-tahunan" data-id="${p.id}">Lihat Form Cuti</button>`
      : "";

  return `${btnSurat}${btnHapus}${btnForm}`;
}

export async function initPengajuanCutiTahunan() {
  const fileInput = document.getElementById("persetujuanAtasan");
  const namaFile = document.getElementById("namaFilePersetujuan");

  if (fileInput && !fileInput.dataset.bound) {
    fileInput.dataset.bound = "1";
    fileInput.addEventListener("change", () => {
      if (!namaFile) return;

      const file = fileInput.files?.[0];
      if (!file) {
        namaFile.textContent = "Belum ada file dipilih";
        return;
      }

      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        showToast("Format file harus JPG, JPEG, atau PNG.", "warning");
        fileInput.value = "";
        namaFile.textContent = "Belum ada file dipilih";
        return;
      }

      if (file.size > MAX_IMAGE_BYTES) {
        showToast("Ukuran file maksimal 2 MB.", "error");
        fileInput.value = "";
        namaFile.textContent = "Belum ada file dipilih";
        return;
      }

      namaFile.textContent = file.name;
    });
  }

  const btnSimpan = document.getElementById("btnSimpanCutiTahunan");
  if (btnSimpan && !btnSimpan.dataset.bound) {
    btnSimpan.dataset.bound = "1";
    btnSimpan.addEventListener("click", simpanPengajuanCutiTahunan);
  }

  const tbody = document.getElementById("riwayatCutiTahunanBody");
  if (tbody && !tbody.dataset.bound) {
    tbody.dataset.bound = "1";
    tbody.addEventListener("click", async (e) => {
      const lihat = e.target.closest(".btn-lihat-surat");
      if (lihat) {
        await lihatDokumen(lihat.dataset.file, "persetujuan_atasan");
        return;
      }

      const hapus = e.target.closest(".btn-hapus-cuti");
      if (hapus) {
        await hapusPengajuanCutiTahunan(Number(hapus.dataset.id));
        return;
      }

      const btnLihatForm = e.target.closest(".btn-lihat-form-cuti-tahunan");
      if (btnLihatForm) {
        await lihatFormCuti(Number(btnLihatForm.dataset.id));
      }
    });
  }

  initCalendarCutiTahunan();
  initWilayahCuti();
  await Promise.all([loadRiwayatCutiTahunan(), loadSaldoCutiTahunan()]);
}

function initCalendarCutiTahunan() {
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl || typeof FullCalendar === "undefined") return;

  if (calendarCuti) {
    calendarCuti.destroy();
    calendarCuti = null;
  }

  calendarCuti = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "id",
    height: "auto",
    dateClick(info) {
      const tanggal = info.dateStr;
      const index = tanggalCutiDipilih.indexOf(tanggal);

      if (index >= 0) {
        tanggalCutiDipilih.splice(index, 1);
      } else {
        tanggalCutiDipilih.push(tanggal);
      }

      refreshTanggalDipilih();
    }
  });

  calendarCuti.render();
}

async function simpanPengajuanCutiTahunan() {
  if (isSubmittingCutiTahunan) return;

  const alasan = document.getElementById("alasanCuti")?.value.trim() || "";
  const alamat = document.getElementById("alamatCuti")?.value.trim() || "";
  const rt = document.getElementById("rtCuti")?.value.trim() || "";
  const rw = document.getElementById("rwCuti")?.value.trim() || "";

  const desaSelect = document.getElementById("desaCuti");
  const kecamatanSelect = document.getElementById("kecamatanCuti");
  const kotaSelect = document.getElementById("kotaCuti");

  const desa = desaSelect?.value.trim() || "";
  const kecamatan = kecamatanSelect?.value.trim() || "";
  const kota = kotaSelect?.value.trim() || "";

  const namaKota = getSelectedOptionText(kotaSelect);
  const namaKecamatan = getSelectedOptionText(kecamatanSelect);
  const namaDesa = getSelectedOptionText(desaSelect);

  const file = document.getElementById("persetujuanAtasan")?.files?.[0];

  if (tanggalCutiDipilih.length === 0) {
    showToast("Pilih minimal 1 tanggal cuti.", "error");
    return;
  }

  if (!alasan) {
    showToast("Alasan cuti wajib diisi.", "error");
    return;
  }

  if (!alamat) {
    showToast("Alamat saat cuti wajib diisi.", "error");
    return;
  }

  if (!rt && !rw && !desa && !kecamatan && !kota) {
    showToast("Alamat saat cuti wajib diisi.", "error");
    return;
  }

  if (!file) {
    showToast("Persetujuan atasan wajib diupload.", "error");
    return;
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_IMAGE_EXTS.has(ext)) {
    showToast("File harus berupa foto (JPG/JPEG/PNG).", "warning");
    return;
  }

  const jumlahHari = tanggalCutiDipilih.length;
  const sisaSaldo = Number(window.totalSaldoCuti ?? 0);

  if (jumlahHari > sisaSaldo) {
    showToast(
      `Sisa cuti tidak mencukupi (Sisa: ${sisaSaldo} hari, Pengajuan: ${jumlahHari} hari).`,
      "error"
    );
    return;
  }

  const pegawai = await getCurrentPegawai();
  if (!pegawai?.id) {
    showToast("Data pegawai login tidak ditemukan.", "error");
    return;
  }

  isSubmittingCutiTahunan = true;
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
      fileUrl = await uploadDokumen("persetujuan_atasan", "CT", pegawai.id, file);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Gagal mengupload bukti persetujuan.", "error");
      return;
    }

    const { data: nomorPengajuan, error: nomorError } = await supabase.rpc(
      "generate_nomor_pengajuan",
      { p_jenis: "CT" }
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
        jenis_pengajuan: "CUTI_TAHUNAN",
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
      showToast("Gagal menyimpan data pengaju.", "error");
      return;
    }

    const { error: detailError } = await supabase
      .from("cuti_tahunan_detail")
      .insert({
        pengajuan_id: pengajuan.id,
        alasan,
        alamat_cuti: alamatLengkap
      });

    if (detailError) {
      console.error(detailError);
      showToast("Gagal menyimpan detail cuti.", "error");
      return;
    }

    const daftarTanggal = tanggalCutiDipilih.map((tanggal) => ({
      pengajuan_id: pengajuan.id,
      tanggal
    }));

    const { error: tanggalError } = await supabase
      .from("cuti_tahunan_tanggal")
      .insert(daftarTanggal);

    if (tanggalError) {
      console.error(tanggalError);
      showToast("Gagal menyimpan tanggal cuti.", "error");
      return;
    }

    const { error: dokumenError } = await supabase
      .from("dokumen")
      .insert({
        pengajuan_id: pengajuan.id,
        jenis_dokumen: "PERSETUJUAN_ATASAN",
        file_url: fileUrl,
        status_verifikasi: "MENUNGGU"
      });

    if (dokumenError) {
      console.error(dokumenError);
      showToast("Gagal menyimpan dokumen.", "error");
      return;
    }

    await updateTKKarenaCutiTahunan(
      pegawai.id,
      tanggalCutiDipilih,
      KETERANGAN_TK.PENGAJUAN_CUTI_TAHUNAN
    );

    resetFormCutiTahunan();
    await loadRiwayatCutiTahunan();
    showToast("Pengajuan berhasil disimpan.", "success");
  } finally {
    isSubmittingCutiTahunan = false;
  }
}

async function loadRiwayatCutiTahunan() {
  const tbody = document.getElementById("riwayatCutiTahunanBody");
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
        cuti_tahunan_tanggal(tanggal),
        dokumen(file_url)
      )
    `)
    .eq("pegawai_id", pegawai.id)
    .eq("pengajuan.jenis_pengajuan", "CUTI_TAHUNAN")
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

    const tanggalList = p.cuti_tahunan_tanggal || [];
    const jumlahHari = tanggalList.length;
    const tanggalHtml = tanggalList.map((t) => t.tanggal).join("<br>");
    const statusHtml = typeof badgeStatus === "function" ? badgeStatus(p.status) : p.status;

    const tr = document.createElement("tr");
    tr.align = "center";
    tr.innerHTML = `
      <td>${p.nomor_pengajuan}</td>
      <td>${tanggalHtml}</td>
      <td>${jumlahHari} Hari</td>
      <td>${statusHtml}</td>
      <td>${p.catatan_admin ?? "-"}</td>
      <td>${renderAksiRiwayatCutiTahunan(p)}</td>
    `;
    fragment.appendChild(tr);
  }

  tbody.replaceChildren(fragment);
}

async function hapusPengajuanCutiTahunan(id) {
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

  const { data: tanggalCuti } = await supabase
    .from("cuti_tahunan_tanggal")
    .select("tanggal")
    .eq("pengajuan_id", id);

  if (pegawai?.id && tanggalCuti?.length) {
    await refreshKeteranganTKTanggal(
      pegawai.id,
      tanggalCuti.map((x) => x.tanggal)
    );
  }

  showToast("Pengajuan berhasil dihapus.", "success");
  await loadRiwayatCutiTahunan();
}

async function lihatDokumen(filePath, bucket) {
  if (!filePath) {
    showToast("File dokumen tidak tersedia.", "warning");
    return;
  }

  const { data, error } = await supabase
    .storage
    .from(bucket)
    .createSignedUrl(filePath, 60);

  if (error || !data?.signedUrl) {
    console.error(error);
    showToast("Gagal membuka dokumen.", "error");
    return;
  }

  window.open(data.signedUrl, "_blank");
}

async function loadSaldoCutiTahunan() {
  const pegawai = await getCurrentPegawai();
  if (!pegawai?.id) return;

  await supabase.rpc("rollover_saldo_cuti", {
    p_pegawai_id: pegawai.id
  });

  const { data, error } = await supabase.rpc("get_saldo_cuti", {
    p_pegawai_id: pegawai.id
  });

  if (error) {
    console.error(error);
    return;
  }

  const rows = Array.isArray(data) ? data : [];
  const tahunSekarang = new Date().getFullYear();

  const n = rows.find((x) => x.tahun === tahunSekarang)?.sisa ?? 0;
  const n1 = rows.find((x) => x.tahun === tahunSekarang - 1)?.sisa ?? 0;
  const n2 = rows.find((x) => x.tahun === tahunSekarang - 2)?.sisa ?? 0;
  const total = n + n1 + n2;

  window.totalSaldoCuti = total;

  const saldoEl = document.getElementById("saldoCutiTahunan");
  if (!saldoEl) return;

  saldoEl.innerHTML = `
    <div class="saldo-cuti-grid">
      <div class="saldo-item">
        <h4>${tahunSekarang - 2}</h4>
        <p>${n2} Hari</p>
      </div>
      <div class="saldo-item">
        <h4>${tahunSekarang - 1}</h4>
        <p>${n1} Hari</p>
      </div>
      <div class="saldo-item">
        <h4>${tahunSekarang}</h4>
        <p>${n} Hari</p>
      </div>
      <div class="saldo-item">
        <h4>Total</h4>
        <p>${total} Hari</p>
      </div>
    </div>
  `;
}