import { supabase } from "/modules/auth/auth.js";
import {KETERANGAN_TK} from "/modules/config/constants.js";

let cachedPegawaiLogin = null;

export async function getPegawaiLogin(forceRefresh = false) {
  if (cachedPegawaiLogin && !forceRefresh) {
    return cachedPegawaiLogin;
  }

  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData?.user?.email) {
    return null;
  }

  const { data: pegawai, error: pegawaiError } = await supabase
    .from("pegawai")
    .select("id, nama") // tambahkan kolom lain jika butuh
    .eq("email", userData.user.email)
    .single();

  if (pegawaiError) {
    console.error("Gagal mengambil data pegawai login:", pegawaiError);
    return null;
  }

  cachedPegawaiLogin = pegawai;
  return cachedPegawaiLogin;
}

export function clearPegawaiLogin() {
  cachedPegawaiLogin = null;
}

export async function importPegawaiExcel(e){

    console.log("IMPORT EXCEL LOADED");
    
    const file = e.target.files[0];

    if(!file) return;

    const buffer = await file.arrayBuffer();

    const workbook = XLSX.read(buffer);

    const sheet =
        workbook.Sheets[
            workbook.SheetNames[0]
        ];

    const rows =
        XLSX.utils.sheet_to_json(sheet);

    console.log(rows);

}

export function badgeStatus(status) {

  switch (status) {

    case "MENUNGGU":

      return `
      <span class="badge badge-warning">
        Menunggu
      </span>
      `;

    case "DIPROSES":

      return `
      <span class="badge badge-primary">
        Diproses
      </span>
      `;

    case "DISETUJUI":

      return `
      <span class="badge badge-primary">
        Disetujui
      </span>
      `;

    case "SELESAI":

      return `
      <span class="badge badge-success">
        Selesai
      </span>
      `;

    case "DITOLAK":

      return `
      <span class="badge badge-danger">
        Ditolak
      </span>
      `;

    default:

      return status;

  }

}

export async function updateTKBerdasarkanRentangTanggal(
  pegawaiIds,
  tanggalMulai,
  tanggalSelesai,
  keterangan
) {
  const { error } = await supabase

    .from("tk_bulanan")

    .update({

      keterangan,

      updated_at:
        new Date().toISOString()

    })

    .in("pegawai_id", pegawaiIds)

    .gte("tanggal", tanggalMulai)

    .lte("tanggal", tanggalSelesai)

    .is("deleted_at", null);

  if (error) {

    console.error(error);

  }

}


export async function updateTKKarenaCutiTahunan(
  pegawaiId,
  daftarTanggal,
  keterangan
) {

  const { error } = await supabase

    .from("tk_bulanan")

    .update({

      keterangan: keterangan,

      updated_at:
        new Date().toISOString()

    })

    .eq("pegawai_id", pegawaiId)

    .in("tanggal", daftarTanggal)

    .is("deleted_at", null);

  if (error) {

    console.error(error);

  }

}

export async function refreshKeteranganTKRentang(
  pegawaiId,
  tanggalMulai,
  tanggalSelesai
) {

  let t = new Date(tanggalMulai);
  const akhir = new Date(tanggalSelesai);

  while (t <= akhir) {

    const tanggal = [
      t.getFullYear(),
      String(t.getMonth() + 1).padStart(2, "0"),
      String(t.getDate()).padStart(2, "0")
    ].join("-");

    const keterangan =
      await cekKeteranganTK(
        pegawaiId,
        tanggal
      );

    const { error } = await supabase

      .from("tk_bulanan")

      .update({

        keterangan,

        updated_at: new Date()

      })

      .eq("pegawai_id", pegawaiId)

      .eq("tanggal", tanggal)

      .is("deleted_at", null);

    if (error) {

      console.error(error);

    }

    t.setDate(t.getDate() + 1);

  }

}

export async function refreshKeteranganTKTanggal(
  pegawaiId,
  daftarTanggal
) {

  for (const tanggal of daftarTanggal) {

    const keterangan =
      await cekKeteranganTK(
        pegawaiId,
        tanggal
      );

    const { error } = await supabase

      .from("tk_bulanan")

      .update({

        keterangan,

        updated_at: new Date()

      })

      .eq("pegawai_id", pegawaiId)

      .eq("tanggal", tanggal)

      .is("deleted_at", null);

    if (error) {

      console.error(error);

    }

  }

}

export async function cekKeteranganTK(pegawaiId, tanggal) {

  const { data, error } = await supabase
    .from("pengajuan")
    .select(`
      jenis_pengajuan,
      status,

      pengajuan_anggota!inner(
        pegawai_id
      ),

      cuti_sakit_detail(
        tanggal_mulai,
        tanggal_selesai
      ),

      cuti_tahunan_tanggal(
        tanggal
      ),

      dl_detail(
        tanggal_mulai,
        tanggal_selesai
      )
    `)
    .eq("pengajuan_anggota.pegawai_id", pegawaiId)
    .in("jenis_pengajuan", [
      "CUTI_SAKIT",
      "CUTI_TAHUNAN",
      "DL"
    ])
    .is("deleted_at", null);

  if (error) {

    console.error(error);

    return KETERANGAN_TK.TK;

  }



  for (const p of data) {
    const sudahDisetujui =
      p.status === "DISETUJUI" ||
      p.status === "SELESAI";

    // ==========================
    // CUTI SAKIT
    // ==========================

    if (p.jenis_pengajuan === "CUTI_SAKIT") {

      const d = p.cuti_sakit_detail?.[0];

      if (
        d &&
        tanggal >= d.tanggal_mulai &&
        tanggal <= d.tanggal_selesai
      ) {

        return sudahDisetujui
          ? KETERANGAN_TK.CUTISAKIT
          : KETERANGAN_TK.PENGAJUAN_CUTI_SAKIT;
      }

    }

    // ==========================
    // CUTI ALASAN PENTING
    // ==========================

    if (p.jenis_pengajuan === "CUTI_ALASAN_PENTING") {

      const d = p.cuti_alasan_penting_detail?.[0];

      if (
        d &&
        tanggal >= d.tanggal_mulai &&
        tanggal <= d.tanggal_selesai
      ) {

        return sudahDisetujui
          ? KETERANGAN_TK.CUTIALASANPENTING
          : KETERANGAN_TK.PENGAJUAN_CUTI_ALASAN_PENTING;
      }

    }

    // ==========================
    // CUTI TAHUNAN
    // ==========================

    if (p.jenis_pengajuan === "CUTI_TAHUNAN") {

      const ada =
        p.cuti_tahunan_tanggal?.some(
          x => x.tanggal === tanggal
        );

      if (ada) {

        return sudahDisetujui
          ? KETERANGAN_TK.CUTITAHUNAN
          : KETERANGAN_TK.PENGAJUAN_CUTI_TAHUNAN;

      }

    }

    // ==========================
    // DL
    // ==========================

    if (p.jenis_pengajuan === "DL") {

      const d = p.dl_detail?.[0];

      if (
        d &&
        tanggal >= d.tanggal_mulai &&
        tanggal <= d.tanggal_selesai
      ) {

        return sudahDisetujui
          ? KETERANGAN_TK.DL
          : KETERANGAN_TK.PENGAJUAN_DL;
      }

    }

  }

  return KETERANGAN_TK.TK;

}

export async function lihatFormCuti(id) {

  const { data, error } =
    await supabase
      .from("dokumen")
      .select("file_url")
      .eq("pengajuan_id", id)
      .eq("jenis_dokumen", "FORM_CUTI_TTD")
      .single();

  if (error) {

    console.error(error);

    alert("Form cuti tidak ditemukan.");

    return;

  }

  const {
    data: urlData,
    error: urlError
  } =
    await supabase
      .storage
      .from("form_cuti_ttd")
      .createSignedUrl(
        data.file_url,
        60
      );

  if (urlError) {

    console.error(urlError);

    alert("Gagal membuka form cuti.");

    return;

  }

  window.open(
    urlData.signedUrl,
    "_blank"
  );

}

export function formatTanggal(tanggal) {

  return new Date(tanggal)
    .toLocaleDateString("id-ID", {

      day: "numeric",

      month: "long",

      year: "numeric"

    });

}

export async function updateStatusPengajuan(

  id,

  status,

  catatan

) {

  return await supabase

    .from("pengajuan")

    .update({

      status,

      catatan_admin: catatan

    })

    .eq("id", id);

}

const TOAST_ICONS = {
  success: "✓",
  error: "✕",
  info: "i"
};

export function showToast(pesan, type = "info", duration = 2600) {
  const container = document.getElementById("toastContainer");
  if (!container) {
    alert(pesan);
    return;
  }

  const variant = ["success", "error", "info"].includes(type) ? type : "info";

  const toast = document.createElement("div");
  toast.className = `toast-item is-${variant}`;

  const iconSpan = document.createElement("span");
  iconSpan.className = "toast-icon";
  iconSpan.setAttribute("aria-hidden", "true");
  iconSpan.textContent = TOAST_ICONS[variant];

  const textSpan = document.createElement("span");
  textSpan.className = "toast-text";
  textSpan.textContent = pesan;

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "toast-close";
  closeBtn.setAttribute("aria-label", "Tutup");
  closeBtn.textContent = "⊗";

  const removeToast = () => {
    toast.classList.remove("is-show");
    setTimeout(() => toast.remove(), 200);
  };

  closeBtn.addEventListener("click", removeToast);
  toast.append(iconSpan, textSpan, closeBtn);
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("is-show");
  });

  if (duration > 0) {
    setTimeout(removeToast, duration);
  }
}