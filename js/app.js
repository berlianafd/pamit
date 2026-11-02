import { supabase }
  from "./supabase.js";

import {
  renderLogin
}
  from "../views/login.js";

import {
  renderPegawai
}
  from "../views/pegawai.js";

import {
  renderAdminCuti
}
  from "../views/adminCuti.js";

import {
  renderAdminPresensi
}
  from "../views/adminPresensi.js";

import {
  renderSuperadmin
}
  from "../views/superadmin.js";

import {
  registerRoute,
  navigate
}
  from "./router.js";

import {
  dashboardPage
}
  from "../views/pages/dashboard.js";

import { presensiPage } from "../views/pages/presensi.js";

import {
  masterPegawaiPage
}
  from "../views/pages/masterPegawai.js";

import {
  pengajuanDlPage
}
  from "../views/pages/pengajuanDl.js";

import {
  pengajuanCutiTahunanPage
}
  from "../views/pages/pengajuanCutiTahunan.js";

import {
  pengajuanCutiSakitPage
}
  from "../views/pages/pengajuanCutiSakit.js";

import {
  pengajuanCutiAlasanPentingPage
}
  from "../views/pages/pengajuanCutiAlasanPenting.js";

import {
  pengajuanKendalaPresensiPage
}
  from "../views/pages/pengajuanKendalaPresensi.js";

import {
  uploadDokumen
}
  from "../utils/upload.js";

import {
  reviewPengajuanPage
}
  from "../views/pages/reviewPengajuan.js";

import {
  reviewPresensiCutiPage
}
  from "../views/pages/reviewPresensiCuti.js";

import {
  generateFormCuti
} from "../utils/generateFormCuti.js";

import { saldoCutiPage } from "../views/pages/saldoCuti.js";
import { reviewPresensiDLPage } from "../views/pages/reviewPresensiDL.js";
import { presensiTKPage } from "../views/pages/presensiTK.js";

let editId = null;
let currentPage = 1;
const pageSize = 10;
let daftarPegawai = [];
let pesertaDipilih = [];
let pegawaiLogin = null;
let tanggalCutiDipilih = [];
let calendarCuti = null;
let daftarPegawaiTK = [];
const KETERANGAN_TK = {

  TK: "Tanpa Keterangan",

  PENGAJUAN_CUTI_TAHUNAN: "Pengajuan cuti tahunan dalam proses.",

  PENGAJUAN_CUTI_SAKIT: "Pengajuan cuti sakit dalam proses.",

  PENGAJUAN_CUTI_ALASAN_PENTING: "Pengajuan cuti alasan penting dalam proses.",

  CUTISAKIT: "Cuti Sakit disetujui.",

  CUTITAHUNAN: "Cuti Tahunan disetujui.",

  CUTIALASANPENTING: "Cuti Alasan Penting disetujui.",

  PENGAJUAN_DL: "Pengajuan dinas luar dalam proses.",

  DL: "Dinas luar disetujui.",

};
window.loadRekapTK = loadRekapTK;

const app =
  document.getElementById("app");

start();

async function start() {

  try {

    const {
      data: userData
    } = await supabase.auth.getUser();

    if (!userData?.user) {

      showLogin();

      return;

    }

    const {
      data: pegawai
    } = await supabase
      .from("pegawai")
      .select("nama, jenis_pegawai")
      .eq(
        "email",
        userData.user.email
      )
      .single();


    const {
      data: role,
      error: roleError
    } = await supabase.rpc(
      "get_my_role"
    );

    if (roleError) {
      console.error(roleError);
      showLogin();
      return;
    }

    renderDashboard(
      role,
      pegawai?.nama,
      pegawai?.jenis_pegawai
    );

  }
  catch (err) {

    console.error(err);

    app.innerHTML =
      "<h2>Terjadi kesalahan</h2>";

  }

}

function renderDashboard(role, nama, jenisPegawai) {

  switch (role) {

    case "pegawai":

      app.innerHTML =
        renderPegawai(nama, jenisPegawai);
      registerPages();

      registerMenus();

      initSidebar();

      navigate(
        "dashboard"
      );

      break;

    case "admin_cuti":

      app.innerHTML =
        renderAdminCuti(nama, jenisPegawai);
      registerPages();

      registerMenus();

      initSidebar();

      window.loadDashboardAdmin = loadDashboardAdminCuti;

      navigate(
        "dashboard"
      );

      break;

    case "admin_presensi":

      app.innerHTML =
        renderAdminPresensi(nama, jenisPegawai);
      registerPages();

      registerMenus();

      initSidebar();

      window.loadDashboardAdmin = loadDashboardAdminPresensi;

      navigate(
        "dashboard"
      );

      break;

    case "superadmin":

      app.innerHTML =
        renderSuperadmin(nama, jenisPegawai);

      registerPages();

      registerMenus();

      initSidebar();

      window.loadDashboardAdmin = loadDashboardAdminPresensi;

      navigate(
        "dashboard"
      );

      break;

    default:

      app.innerHTML =
        `
        <h2>Role tidak dikenali</h2>
        <p>${role}</p>
        `;

  }

  registerLogout();

}

function showLogin() {

  app.innerHTML =
    renderLogin();

  document
    .getElementById("btnLogin")
    .addEventListener(
      "click",
      login
    );

}

async function login() {

  try {

    const nip =
      document
        .getElementById("nip")
        .value
        .trim();

    const password =
      document
        .getElementById("password")
        .value;

    const {
      data: pegawai,
      error: pegawaiError
    } = await supabase
      .from("pegawai")
      .select(`
        email,
        aktif
      `)
      .eq("nip", nip)
      .single();

    if (
      pegawaiError ||
      !pegawai
    ) {

      alert(
        "NIP tidak ditemukan"
      );

      return;

    }

    if (!pegawai.aktif) {

      alert(
        "Akun tidak aktif"
      );

      return;

    }

    const {
      error: loginError
    } =
      await supabase.auth.signInWithPassword({

        email:
          pegawai.email,

        password:
          password

      });

    if (loginError) {

      console.error(
        loginError
      );

      alert(
        "Password salah"
      );

      return;

    }

    window.location.reload();

  }
  catch (err) {

    console.error(err);

    alert(
      "Terjadi kesalahan saat login"
    );

  }

}

function registerLogout() {

  const btn =
    document.getElementById(
      "logoutBtn"
    );

  if (!btn)
    return;

  btn.addEventListener(
    "click",
    async () => {

      await supabase.auth.signOut();

      window.location.reload();

    }
  );
}

function registerMenus() {

  document
    .querySelectorAll(".menu-btn")
    .forEach(btn => {

      btn.onclick = () => {

        // hapus active semua
        document
          .querySelectorAll(".menu-btn")
          .forEach(b => b.classList.remove("active"));

        // aktifkan menu yang diklik
        btn.classList.add("active");

        navigate(btn.dataset.page);

      };

    });

}

function registerPages() {

  registerRoute(
    "dashboard",
    dashboardPage
  );

  registerRoute(
    "masterPegawai",
    masterPegawaiPage
  );

  registerRoute("presensi", presensiPage);

  registerRoute(
    "pengajuanDl",
    pengajuanDlPage
  );

  registerRoute(
    "pengajuanCutiTahunan",
    pengajuanCutiTahunanPage
  );

  registerRoute(
    "pengajuanCutiSakit",
    pengajuanCutiSakitPage
  );

  registerRoute(
    "pengajuanCutiAlasanPenting",
    pengajuanCutiAlasanPentingPage
  );

  registerRoute(
    "pengajuanKendalaPresensi",
    pengajuanKendalaPresensiPage
  );

  registerRoute(
    "reviewPengajuan",
    reviewPengajuanPage
  );

  registerRoute(
    "saldoCuti",
    saldoCutiPage
  );

  registerRoute(
    "reviewPresensiCuti",
    reviewPresensiCutiPage
  );

  registerRoute(
    "reviewPresensiDL",
    reviewPresensiDLPage
  );

  registerRoute(
    "presensiTK",
    presensiTKPage
  );

}

async function loadPegawai() {

  const tbody =
    document.getElementById(
      "pegawaiTableBody"
    );

  if (!tbody) return;

  const keyword =
    document
      .getElementById("searchPegawai")
      ?.value
      ?.trim() || "";

  let query =
    supabase
      .from("pegawai")
      .select(
        `
      *,
      users_pegawai_id_fkey (
        auth_id
      )
      `,
        {
          count: "exact"
        }
      );


  if (keyword) {

    query =
      query.or(
        `nip.ilike.%${keyword}%,nama.ilike.%${keyword}%`
      );

  }

  const from =
    (currentPage - 1) * pageSize;

  const to =
    from + pageSize - 1;

  const {
    data,
    error,
    count
  } = await query
    .order("nama")
    .range(from, to);


  if (error) {

    console.error(error);

    return;

  }

  tbody.innerHTML = "";

  data.forEach(p => {

    tbody.innerHTML += `

      <tr>

        <td>${p.nip ?? ""}</td>

        <td>${p.nama ?? ""}</td>

        <td>${p.nohp ?? ""}</td>

        <td>${p.pangkatgol ?? ""}</td>

        <td>${p.jabatan ?? ""}</td>

        <td>${p.unit_kerja ?? ""}</td>

        <td>${p.role ?? ""}</td>

        <td>
          ${p.aktif ? "Aktif" : "Nonaktif"}
        </td>

        <td>
          <button
            class="btn-edit"
            data-id="${p.id}"
            data-nama="${p.nama ?? ''}"
            data-role="${p.role ?? ''}"
            data-jabatan="${p.jabatan ?? ''}"
            data-unit-kerja="${p.unit_kerja ?? ''}"
            data-nohp="${p.nohp ?? ''}"
            data-pangkatgol="${p.pangkatgol ?? ''}"
          >
            Edit
          </button>

          <br><br>

          <button
            class="btn-reset"
            data-nip="${p.nip}"
          >
            Reset Password
          </button>

          <br><br>

          <button
            class="btn-status"
            data-id="${p.id}"
            data-aktif="${p.aktif}"
          >
           ${p.aktif
        ? '<span class="badge badge-success">Aktif</span>'
        : '<span class="badge badge-danger">Nonaktif</span>'
      }
          </button>

        </td>

      </tr>

    `;

  });

  renderPagination(count);

  document
    .querySelectorAll(".btn-edit")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          showEditModal(
            btn.dataset.id,
            btn.dataset.nama,
            btn.dataset.role,
            btn.dataset.jabatan,
            btn.dataset.unitKerja,
            btn.dataset.nohp,
            btn.dataset.pangkatgol
          );

        }
      );

    });

  document
    .querySelectorAll(".btn-reset")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          resetPassword(
            btn.dataset.nip
          );

        }
      );

    });

  document
    .querySelectorAll(".btn-status")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          togglePegawai(
            Number(
              btn.dataset.id
            ),
            btn.dataset.aktif ===
            "true"
          );

        }
      );

    });

}

async function initMasterPegawai() {

  loadPegawai();

  document
    .getElementById("searchPegawai")
    ?.addEventListener(
      "input",
      loadPegawai
    );

  document
    .getElementById("btnTambahPegawai")
    ?.addEventListener(
      "click",
      () => {

        document
          .getElementById(
            "tambahModal"
          )
          .style.display =
          "flex";

      }
    );

  document
    .getElementById("btnSimpanPegawai")
    ?.addEventListener("click", simpanPegawai);

  document
    .getElementById(
      "btnSimpanEdit"
    )
    ?.addEventListener(
      "click",
      saveEditPegawai
    );

  document
    .getElementById(
      "btnBatalTambah"
    )
    ?.addEventListener(
      "click",
      () => {

        document
          .getElementById(
            "tambahModal"
          )
          .style.display =
          "none";

      }
    );

  document
    .getElementById(
      "tambahModal"
    )
    ?.addEventListener(
      "click",
      e => {

        if (
          e.target.id ===
          "tambahModal"
        ) {

          document
            .getElementById(
              "tambahModal"
            )
            .style.display =
            "none";

        }

      }
    );

  document
    .getElementById(
      "btnBatalEdit"
    )
    ?.addEventListener(
      "click",
      () => {
        document
          .getElementById(
            "editModal"
          )
          .style.display =
          "none";

      }
    );

  document
    .getElementById(
      "editModal"
    )
    ?.addEventListener(
      "click",
      e => {

        if (
          e.target.id ===
          "editModal"
        ) {

          document
            .getElementById(
              "editModal"
            )
            .style.display =
            "none";

        }

      }
    );

  document
    .getElementById(
      "btnCloseModal"
    )
    ?.addEventListener(
      "click",
      closeModal
    );

  document
    .getElementById(
      "pegawaiModal"
    )
    ?.addEventListener(
      "click",
      e => {

        if (
          e.target.id ===
          "pegawaiModal"
        ) {

          closeModal();

        }

      }
    );

  document
    .getElementById("btnImportPegawai")
    .onclick = () => {

      document
        .getElementById("fileImportPegawai")
        .click();

    };

  document
    .getElementById("fileImportPegawai")
    .addEventListener(
      "change",
      importPegawaiExcel
    );

  document
    .getElementById("btnImportPegawai")
    .addEventListener("click", () => {

      document
        .getElementById("fileImportPegawai")
        .click();

    });

  document
    .getElementById("fileImportPegawai")
    .addEventListener("change", importPegawaiExcel);

}

async function simpanPegawai() {

  const nip =
    document
      .getElementById("nipBaru")
      .value
      .trim();

  const nama =
    document
      .getElementById("namaBaru")
      .value
      .trim();

  const jabatan =
    document
      .getElementById("jabatanBaru")
      .value
      .trim();

  const pangkatgol = document
    .getElementById("pangkatgolBaru")
    .value;

  const nohp = document
    .getElementById("nohpBaru")
    .value
    .trim();

  const unitKerja =
    document
      .getElementById("unitKerjaBaru")
      .value
      .trim();

  const role =
    document
      .getElementById("roleBaru")
      .value;

  if (!nip || !nama || !jabatan || !nohp) {

    alert("Lengkapi data");

    return;

  }

  const data = {

    nip,

    nama,

    jabatan,

    pangkatgol,

    nohp,

    unit_kerja: unitKerja,

    role,

    aktif: true

  };

  await createPegawai(data);

  // const {
  //   error
  // } = await supabase.functions.invoke(
  //   "rapid-endpoint",
  //   {
  //     body: {
  //       nip,
  //       nama,
  //       jabatan,
  //       pangkatgol,
  //       nohp,
  //       unit_kerja: unitKerja,
  //       role,
  //       aktif: true
  //     }
  //   }
  // );

  // if (error) {

  //   console.error(error);

  //   alert(error.message);

  //   return;

  // }

  alert("Pegawai Berhasil Ditambahkan");

  document
    .getElementById(
      "tambahModal"
    )
    .style.display =
    "none";

  document
    .getElementById(
      "nipBaru"
    )
    .value = "";

  document
    .getElementById(
      "namaBaru"
    )
    .value = "";

  document
    .getElementById(
      "jabatanBaru"
    )
    .value = "";

  document.getElementById("nohpBaru").value = "";

  document.getElementById("pangkatgolBaru").value = "";

  loadPegawai();

}

async function createPegawai(data) {

  const { error } =
    await supabase.functions.invoke(
      "rapid-endpoint",
      {
        body: data
      }
    );

  if (error) {

    console.error("ERROR", error);

    console.error("RESULT", result);

    throw new Error(
      result?.error ||
      result?.message ||
      error.message
    );

  }

}

async function resetPassword(
  nip
) {

  if (nip.length !== 18) {

    alert(
      "NIP harus 18 digit"
    );

    return;

  }

  const ok =
    confirm(
      `Reset password ${nip}?`
    );

  if (!ok) return;

  const {
    data,
    error
  } =
    await supabase.functions.invoke(
      "reset-password",
      {
        body: {
          nip
        }
      }
    );

  if (error) {

    console.error(error);

    alert("Gagal");

    return;

  }

  alert(
    "Password berhasil direset"
  );

}

async function togglePegawai(
  id,
  aktif
) {

  const aksi =
    aktif
      ? "nonaktifkan"
      : "aktifkan";

  const ok =
    confirm(
      `Yakin ${aksi} pegawai ini?`
    );

  if (!ok) return;

  const {
    data,
    error,
    count
  } = await supabase
    .from("pegawai")
    .update({
      aktif: !aktif
    })
    .eq("id", id)
    .select("*");

  if (error) {

    console.error(error);

    alert("Gagal mengubah status");

    return;

  }

  loadPegawai();

}

async function saveEditPegawai() {

  const nama =
    document
      .getElementById("editNama")
      .value
      .trim();

  const jabatan =
    document
      .getElementById("editJabatan")
      .value
      .trim();

  const unitKerja =
    document
      .getElementById("editUnitKerja")
      .value
      .trim();

  const role =
    document
      .getElementById("editRole")
      .value;

  const nohp = document.getElementById("editNohp").value.trim();

  const pangkatgol = document.getElementById("editPangkatgol").value;

  const {
    error
  } = await supabase
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

    alert("Gagal");

    return;

  }

  document.getElementById(
    "editModal"
  ).style.display = "none";


  loadPegawai();

}

function showEditModal(
  id,
  nama,
  role,
  jabatan,
  unitKerja,
  nohp,
  pangkatgol
) {

  editId = id;

  document
    .getElementById("editModal")
    .style.display = "flex";

  document
    .getElementById("editNama")
    .value = nama ?? "";

  document
    .getElementById("editRole")
    .value = role ?? "pegawai";

  document
    .getElementById("editJabatan")
    .value = jabatan ?? "";

  document
    .getElementById("editUnitKerja")
    .value = unitKerja ?? "";

  document.getElementById("editNohp").value = nohp ?? "";

  document.getElementById("editPangkatgol").value = pangkatgol ?? "";
}

function closeModal() {

  document
    .getElementById(
      "pegawaiModal"
    )
    .style.display = "none";

}

function renderPagination(totalData) {

  const totalPages =
    Math.ceil(
      totalData / pageSize
    );

  const container =
    document.getElementById(
      "pagination"
    );

  if (!container) return;

  let html = "";

  html += `
    <button
      id="prevPage"
      ${currentPage === 1 ? "disabled" : ""}
    >
      ←
    </button>
  `;

  for (
    let i = 1;
    i <= totalPages;
    i++
  ) {

    html += `
      <button
        class="page-btn ${i === currentPage
        ? "active"
        : ""
      }"
        data-page="${i}"
      >
        ${i}
      </button>
    `;

  }

  html += `
    <button
      id="nextPage"
      ${currentPage === totalPages
      ? "disabled"
      : ""
    }
    >
      →
    </button>
  `;

  container.innerHTML = html;

  document
    .getElementById("prevPage")
    ?.addEventListener(
      "click",
      () => {

        currentPage--;

        loadPegawai();

      }
    );

  document
    .getElementById("nextPage")
    ?.addEventListener(
      "click",
      () => {

        currentPage++;

        loadPegawai();

      }
    );

  document
    .querySelectorAll(".page-btn")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          currentPage =
            Number(
              btn.dataset.page
            );

          loadPegawai();

        }
      );

    });

}

window.initReviewPengajuan =
  initReviewPengajuan;

window.loadPegawai =
  loadPegawai;

window.initMasterPegawai =
  initMasterPegawai;

window.initPresensi = async function () {
  // 1. Ambil data user yang sedang login dari Supabase
  const { data: userData } = await supabase.auth.getUser();

  if (!userData || !userData.user) {
    alert("Sesi login berakhir, silakan login kembali.");
    return;
  }

  // 2. Ambil data pegawai berdasarkan email user yang login
  const { data: pegawai, error } = await supabase
    .from("pegawai")
    .select("id, nama")
    .eq("email", userData.user.email)
    .single();

  if (error || !pegawai) {
    console.error("Gagal mengambil data pegawai:", error);
  } 

  // 3. Jalankan pemuatan riwayat presensi (jika ada fungsinya)
  if (typeof loadRiwayatPresensi === "function") {
    loadRiwayatPresensi();
  }

  // 4. Inisialisasi Otomatis Tanggal, Jam Berjalan, dan Lokasi GPS
  initLiveDateTimeAndLocation();

  // 5. Setup Tombol Kamera

  const openCameraBtn = document.getElementById("openCameraBtn");
  const cameraPreviewContainer = document.getElementById("cameraPreviewContainer");
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const captureBtn = document.getElementById("captureBtn");
  const capturedImage = document.getElementById("capturedImage");

  let currentStream = null;

  if (openCameraBtn) {
    openCameraBtn.addEventListener("click", async () => {
      cameraPreviewContainer.style.display = "block";
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false
        });
        video.srcObject = currentStream;
      } catch (err) {
        alert("Tidak dapat mengakses kamera: " + err.message);
      }
    });
  }

  // 6. Setup Tombol Ambil Foto & Watermark Geotag
  if (captureBtn) {
    captureBtn.addEventListener("click", async () => {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const latVal = document.getElementById("latitude").value;
      const lngVal = document.getElementById("longitude").value;
      const timeVal = document.getElementById("liveDateTime")?.textContent || "";
      let alamatTeks = "Alamat: Memuat lokasi...";

      // Tambahkan watermark koordinat dan waktu di atas foto
      if (latVal && lngVal) {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latVal}&lon=${lngVal}&zoom=18&addressdetails=1`, {
            headers: {
              'User-Agent': 'AplikasiAbsensiGeotag/1.0'
            }
          });
          const data = await response.json();
          if (data && data.display_name) {
            alamatTeks = data.display_name;
          }
        } catch (err) {
          console.error("Gagal mengambil nama jalan:", err);
          alamatTeks = `Lat/Lng: ${Number(latVal).toFixed(5)}, ${Number(lngVal).toFixed(5)}`;
        }

        context.fillStyle = "rgba(0, 0, 0, 0.6)";
        context.fillRect(10, canvas.height - 105, canvas.width - 20, 95);
        context.fillStyle = "white";
        context.font = "11px Arial";
        context.fillText(`Waktu: ${timeVal}`, 18, canvas.height - 82);

        const maxCharsPerLine = 52;
        let yOffset = 64;
        if (alamatTeks.length > maxCharsPerLine) {
          const baris1Alamat = alamatTeks.substring(0, maxCharsPerLine);
          const baris2Alamat = alamatTeks.substring(maxCharsPerLine, maxCharsPerLine * 2);
          context.fillText(`Lokasi: ${baris1Alamat}`, 18, canvas.height - yOffset);
          yOffset -= 18;
          context.fillText(`${baris2Alamat}`, 18, canvas.height - yOffset);
        } else {
          context.fillText(`Lokasi: ${alamatTeks}`, 18, canvas.height - yOffset);
        }

        yOffset -= 18;
        const latFixed = Number(latVal).toFixed(5);
        const lngFixed = Number(lngVal).toFixed(5);
        context.fillText(`Lat: ${latFixed}, Long: ${lngFixed}`, 18, canvas.height - yOffset);
      }

      // Matikan kamera setelah foto diambil
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      cameraPreviewContainer.style.display = "none";

      // Ubah ke File Blob agar masuk ke input file form
      canvas.toBlob((blob) => {
        if (!blob) {
          alert("Gagal memproses gambar dari kamera.");
          return;
        }
        const file = new File([blob], `presensi_${Date.now()}.jpg`, { type: "image/jpeg" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        document.getElementById("photoFile").files = dataTransfer.files;

        capturedImage.src = URL.createObjectURL(blob);
        capturedImage.style.display = "block";
      }, "image/jpeg", 0.85);
    });
  }

  // 7. Event Submit Form Presensi
  document
    .getElementById("attendanceForm")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();

      const photoInput = document.getElementById("photoFile");
      if (!photoInput || photoInput.files.length === 0) {
        alert("Silakan ambil foto presensi terlebih dahulu!");
        return;
      }

      // Panggil fungsi simpan presensi (hubungkan ke tabel Supabase kamu)
      // Contoh: simpanDataPresensi();
      simpanPresensi(); // Pastikan fungsi ini sudah didefinisikan di app.js
    });
};

// Fungsi Pendukung untuk Jam Real-time & Lokasi GPS
function initLiveDateTimeAndLocation() {
  let mapInstance = null;
  const liveDateTimeSpan = document.getElementById("liveDateTime");
  const locationStatus = document.getElementById("locationStatus");

  // Jam Berjalan (Real-time)
  function updateClock() {
    const now = new Date();
    const formattedString = now.toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "medium"
    });
    if (liveDateTimeSpan) liveDateTimeSpan.textContent = formattedString;

    // Format untuk database (YYYY-MM-DD HH:MM:SS)
    const dbFormat = now.toISOString().slice(0, 19).replace("T", " ");
    const timeInput = document.getElementById("attendanceTime");
    if (timeInput) timeInput.value = dbFormat;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Ambil Lokasi GPS Otomatis
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        document.getElementById("latitude").value = lat;
        document.getElementById("longitude").value = lng;

        if (locationStatus) {
          locationStatus.textContent = "Mendeteksi nama alamat...";
          locationStatus.style.color = "#007bff";
        }

        // Ambil nama alamat jalan via Nominatim OpenStreetMap
        let alamatTeks = `Lat: ${lat.toFixed(5)}, Long: ${lng.toFixed(5)}`;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: { 'User-Agent': 'AplikasiAbsensiGeotag/1.0' }
          });
          const data = await response.json();
          if (data && data.display_name) {
            alamatTeks = data.display_name;
          }
        } catch (err) {
          console.warn("Gagal mengambil nama jalan untuk UI:", err);
        }

        // Tampilkan alamat beserta koordinat di bawah peta
        if (locationStatus) {
          locationStatus.innerHTML = `<strong>Lokasi Anda:</strong> ${alamatTeks} <br><span style="color: gray; font-size: 11px;">(Lat: ${lat.toFixed(5)}, Long: ${lng.toFixed(5)})</span>`;
          locationStatus.style.color = "green";
        }

        // --- RENDER PETA LEAFLET ---
        // Jika peta sudah pernah dibuat sebelumnya, hapus dulu agar tidak bentrok
        if (mapInstance) {
          mapInstance.remove();
        }

        // Inisialisasi peta dengan opsi interaksi dimatikan (Terkunci / Read-Only)
        mapInstance = L.map('map', {
          zoomControl: false,        // Hilangkan tombol zoom (+/-)
          dragging: false,           // Tidak bisa digeser (pan)
          scrollWheelZoom: false,    // Tidak bisa zoom pakai scroll mouse
          doubleClickZoom: false,    // Tidak bisa zoom pakai double click
          boxZoom: false,
          keyboard: false
        }).setView([lat, lng], 17); // Koordinat pusat & tingkat zoom (17 = dekat/detail)

        // Masukkanlayer peta OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(mapInstance);

        // Tambahkan pin/marker di lokasi pengguna
        L.marker([lat, lng]).addTo(mapInstance)
          .bindPopup("Lokasi Anda Saat Ini")
          .openPopup();
      },
      (error) => {
        if (locationStatus) {
          locationStatus.textContent = "Gagal mendeteksi lokasi. Pastikan GPS aktif.";
          locationStatus.style.color = "red";
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  } else {
    if (locationStatus) {
      locationStatus.textContent = "Browser tidak mendukung Geolocation.";
      locationStatus.style.color = "red";
    }
  }
}


async function simpanPresensi() {
  const latitude = document.getElementById("latitude").value;
  const longitude = document.getElementById("longitude").value;
  const attendanceTime = document.getElementById("attendanceTime").value;
  const file = document.getElementById("photoFile").files[0];

  // 1. Validasi Input
  if (!latitude || !longitude) {
    alert("Lokasi GPS belum terdeteksi. Pastikan GPS aktif dan izin lokasi diberikan.");
    return;
  }

  if (!file) {
    alert("Foto presensi (geotag) wajib diambil.");
    return;
  }

  if (file.type !== "image/jpeg" && file.type !== "image/png") {
    alert("File foto harus berformat JPG atau PNG.");
    return;
  }

  const maxSize = 2 * 1024 * 1024; // Maksimal 2 MB
  if (file.size > maxSize) {
    alert("Ukuran file foto maksimal 2 MB.");
    return;
  }

  // 2. Ambil data user aktif dari Supabase
  const { data: userData } = await supabase.auth.getUser();
  if (!userData || !userData.user) {
    alert("Sesi login berakhir, silakan login kembali.");
    return;
  }

  const { data: pegawai, error: pegawaiError } = await supabase
    .from("pegawai")
    .select("id, nama")
    .eq("email", userData.user.email)
    .single();

  if (pegawaiError || !pegawai) {
    console.error(pegawaiError);
    alert("Gagal mengambil data pegawai.");
    return;
  }

  // 3. Upload file foto ke bucket Supabase Storage ("bukti_presensi")
  let filePath;
  try {
    // Menggunakan fungsi uploadDokumen (sesuaikan path folder jika perlu, misal folder "PRESENSI")
    filePath = await uploadDokumen(
      "bukti_presensi", // Nama bucket
      "ABSEN",       // Prefix / folder di dalam bucket
      pegawai.id,       // ID Pegawai sebagai bagian nama file
      file              // File foto
    );
  } catch (err) {
    console.error(err);
    alert("Gagal mengupload foto: " + err.message);
    return;
  }

  // 4. Generate Nomor Pengajuan / Absensi Unik via RPC
  const { data: nomorPengajuan, error: nomorError } = await supabase.rpc(
    "generate_nomor_pengajuan",
    {
      p_jenis: "ABSEN" // Atau sesuaikan kode jenis presensi di database kamu
    }
  );

  if (nomorError) {
    console.error(nomorError);
    alert("Gagal membuat nomor presensi.");
    return;
  }

  // 5. Insert ke tabel utama "pengajuan"
  const { data: pengajuan, error: pengajuanError } = await supabase
    .from("pengajuan")
    .insert({
      nomor_pengajuan: nomorPengajuan,
      pegawai_id: pegawai.id,
      jenis_pengajuan: "ABSEN", // Sesuaikan dengan jenis presensi di sistemmu
      status: "MENUNGGU",          // Atau MENUNGGU / BERHASIL
      created_by: pegawai.id,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (pengajuanError) {
    console.error(pengajuanError);
    alert("Gagal menyimpan data presensi.");
    return;
  }

  // 6. Insert ke tabel detail khusus presensi ("presensi_detail")
  const { error: detailError } = await supabase
    .from("presensi_detail")
    .insert({
      pengajuan_id: pengajuan.id,
      waktu_presensi: attendanceTime || new Date().toISOString(),
      latitude: latitude,
      longitude: longitude,
      foto_url: filePath
    });

  if (detailError) {
    console.error(detailError);
    alert("Gagal menyimpan detail presensi.");
    return;
  }

  alert("Presensi berhasil disimpan!");

  // Reset form / tampilan setelah berhasil
  document.getElementById("attendanceForm").reset();
  document.getElementById("capturedImage").style.display = "none";
  document.getElementById("locationStatus").textContent = "Mendeteksi ulang lokasi...";

  // Panggil ulang fungsi load riwayat presensi jika ada
  if (typeof loadRiwayatPresensi === "function") {
    loadRiwayatPresensi();
  }
}

async function loadRiwayatPresensi() {
  const tbody = document.getElementById("riwayatPresensiBody");
  if (!tbody) return;

  const { data: userData } = await supabase.auth.getUser();
  if (!userData || !userData.user) return;

  const { data: pegawai } = await supabase
    .from("pegawai")
    .select("id")
    .eq("email", userData.user.email)
    .single();

  if (!pegawai) return;

  // Mengambil data riwayat pengajuan dengan jenis "ABSEN" (atau sesuaikan kode jenis presensimu)
  const { data, error } = await supabase
    .from("pengajuan")
    .select(`
      id,
      nomor_pengajuan,
      status,
      created_at,
      jenis_pengajuan,
      deleted_at,
      catatan_admin,
      presensi_detail(
        waktu_presensi,
        latitude,
        longitude,
        foto_url
      )
    `)
    .eq("pegawai_id", pegawai.id)
    .eq("jenis_pengajuan", "ABSEN") // Sesuaikan dengan jenis presensi di database
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  tbody.innerHTML = "";

  data.forEach((p, index) => {
    const detail = p.presensi_detail?.[0];

    // Format tanggal & waktu presensi
    let waktuFormatted = "-";
    if (detail?.waktu_presensi) {
      const dt = new Date(detail.waktu_presensi);
      waktuFormatted = dt.toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short"
      });
    }

    // MEMBUAT TOMBOL / LINK KE GOOGLE MAPS DI TAB BARU
    let lokasiButton = "-";
    if (detail?.latitude && detail?.longitude) {
      const lat = detail.latitude;
      const lng = detail.longitude;

      // Link Google Maps dengan pin titik lokasi (q=lat,lng)
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

      lokasiButton = `
        <a href="${mapsUrl}" target="_blank" class="btn-sm btn-info" style="padding: 10px 10px; background: #17a2b8; color: white; border-radius: 4px; text-decoration: none; font-size: 12px;">
          📍 Lihat Lokasi
        </a>
      `;
    }

    tbody.innerHTML += `
      <tr align="center">
        <td>${index + 1}</td>
        <td>${waktuFormatted}</td>
        <td>${lokasiButton}</td>
        <td>
          <button
                  class="btnLihatFoto"
                  data-id="${p.id}">
                  📄 Lihat Foto
          </button>

        </td>
        <td>
          ${typeof badgeStatus === "function" ? badgeStatus(p.status) : p.status}
        </td>
        <td>
          
          ${p.status === "MENUNGGU" || p.status === "HADIR" ? `
            <button class="btn-danger btn-hapus" data-id="${p.id}">Hapus</button>
          ` : ""}
        </td>
      </tr>
    `;
  });

  // Event listener untuk tombol di dalam tabel riwayat (Detail & Hapus)
  tbody.onclick = async (e) => {
    const lihat =
      e.target.closest(".btnLihatFoto");

    if (lihat) {

      await lihatFotoPresensi(

        Number(lihat.dataset.id)

      );

      return;

    }
    // const detailBtn = e.target.closest(".btn-detail");
    // if (detailBtn) {
    //   if (typeof loadDetailPresensi === "function") {
    //     await loadDetailPresensi(Number(detailBtn.dataset.id));
    //   }
    //   return;
    // }

    const hapusBtn = e.target.closest(".btn-hapus");
    if (hapusBtn) {
      if (typeof hapusPresensi === "function") {
        await hapusPresensi(Number(hapusBtn.dataset.id));
      }
      return;
    }
  };
}


window.initPengajuanDl = async function () {
  loadRiwayatDl();

  const {
    data: userData
  } =
    await supabase.auth.getUser();

  const {
    data: pegawai
  } =
    await supabase
      .from("pegawai")
      .select("id,nama")
      .eq(
        "email",
        userData.user.email
      )
      .single();

  pegawaiLogin = pegawai;

  pesertaDipilih = [

    {

      id:
        pegawai.id,

      nama:
        pegawai.nama,

      isOwner: true

    }

  ];

  await loadDaftarPegawai();

  renderPeserta();

  document
    .getElementById(
      "btnSimpanDl"
    )
    ?.addEventListener(
      "click",
      simpanPengajuanDl
    );

  document
    .getElementById("cariPegawai")
    .addEventListener(
      "input",
      cariPegawai
    );

  document
    .querySelectorAll(".btn-detail")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          loadDetailDl(
            btn.dataset.id
          );

        }
      );

    });

  document
    .querySelectorAll(".btn-hapus")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          hapusPengajuanDl(
            btn.dataset.id
          );

        }
      );

    });

  document
    .getElementById(
      "btnCloseDetailDl"
    )
    .addEventListener(
      "click",
      () => {

        document
          .getElementById(
            "detailDlModal"
          )
          .style.display = "none";

      }
    );


};

window.initPengajuanCutiSakit = async function () {

  document
    .getElementById("suratSakit")
    ?.addEventListener("change", function () {

      const namaFile =
        document.getElementById("namaFileSuratSakit");

      if (!this.files.length) {

        namaFile.textContent =
          "Belum ada file dipilih";

        return;

      }

      namaFile.textContent =
        this.files[0].name;

    });

  document
    .getElementById(
      "btnSimpanCutiSakit"
    )
    .onclick =
    simpanPengajuanCutiSakit;

  initWilayahCuti();

  await loadRiwayatCutiSakit();

}

window.initPengajuanCutiAlasanPenting = async function () {

  document
    .getElementById("suratPersetujuanAtasan")
    ?.addEventListener("change", function () {

      const namaFile =
        document.getElementById("namaFileSuratPersetujuanAtasan");

      if (!this.files.length) {

        namaFile.textContent =
          "Belum ada file dipilih";

        return;

      }

      namaFile.textContent =
        this.files[0].name;

    });

  document
    .getElementById(
      "btnSimpanCutiAlasanPenting"
    )
    .onclick =
    simpanPengajuanCutiAlasanPenting;

  initWilayahCuti();

  await loadRiwayatCutiAlasanPenting();

}

function initCalendarCutiTahunan() {
  const calendarEl =
    document.getElementById(
      "calendar"
    );

  if (!calendarEl) return;

  calendarCuti =
    new FullCalendar.Calendar(

      calendarEl,

      {

        initialView: "dayGridMonth",

        locale: "id",

        height: "auto",

        dateClick(info) {

          const tanggal =
            info.dateStr;

          const index =
            tanggalCutiDipilih.indexOf(tanggal);

          if (index >= 0) {

            tanggalCutiDipilih.splice(index, 1);

          } else {

            tanggalCutiDipilih.push(tanggal);

          }

          refreshTanggalDipilih();

        }

      }

    );

  calendarCuti.render();
}

window.initPengajuanCutiTahunan = async function () {

  document
    .getElementById("persetujuanAtasan")
    ?.addEventListener("change", function () {

      const namaFile =
        document.getElementById("namaFilePersetujuan");

      if (!this.files.length) {

        namaFile.textContent =
          "Belum ada file dipilih";

        return;

      }

      namaFile.textContent =
        this.files[0].name;

    });

  const fileInput = document.getElementById("persetujuanAtasan");

  fileInput.addEventListener("change", () => {

    const fileName = document.getElementById("uploadFileName");

    if (fileInput.files.length) {

      fileName.textContent = fileInput.files[0].name;

    } else {

      fileName.textContent = "Belum ada file dipilih";

    }

  });

  initCalendarCutiTahunan();

  initWilayahCuti();

  await loadRiwayatCutiTahunan();

  await loadSaldoCutiTahunan();

  document
    .getElementById(
      "btnSimpanCutiTahunan"
    )
    ?.addEventListener(
      "click",
      simpanPengajuanCutiTahunan
    );

};

// =====================================================
// WILAYAH ALAMAT CUTI
// Provinsi → Kabupaten/Kota → Kecamatan → Desa/Kelurahan
// =====================================================

async function initWilayahCuti() {

  const API_WILAYAH = "https://hyeemyxjcvcheytvyvss.supabase.co/functions/v1/wilayah";

  const provinsi =
    document.getElementById("provinsiCuti");

  const kota =
    document.getElementById("kotaCuti");

  const kecamatan =
    document.getElementById("kecamatanCuti");

  const desa =
    document.getElementById("desaCuti");


  // -----------------------------------------
  // CEK ELEMENT
  // -----------------------------------------

  if (!provinsi || !kota || !kecamatan || !desa) {

    console.warn(
      "Dropdown wilayah cuti belum ditemukan."
    );

    return;

  }


  // -----------------------------------------
  // RESET DROPDOWN
  // -----------------------------------------

  kota.innerHTML =
    `<option value="">Pilih Kabupaten/Kota</option>`;

  kecamatan.innerHTML =
    `<option value="">Pilih Kecamatan</option>`;

  desa.innerHTML =
    `<option value="">Pilih Desa/Kelurahan</option>`;

  kota.disabled = true;
  kecamatan.disabled = true;
  desa.disabled = true;


  // -----------------------------------------
  // LOAD PROVINSI
  // -----------------------------------------

  provinsi.innerHTML =
    `<option value="">Memuat Provinsi...</option>`;

  provinsi.disabled = true;


  try {

    const response =
      await fetch(
        `${API_WILAYAH}?path=provinces.json`
      );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const result =
      await response.json();


    provinsi.innerHTML =
      `<option value="">Pilih Provinsi</option>`;


    result.data.forEach(item => {

      const option =
        document.createElement("option");

      // VALUE = KODE API
      option.value = item.code;

      // YANG DITAMPILKAN = NAMA
      option.textContent = item.name;

      provinsi.appendChild(option);

    });


    provinsi.disabled = false;


  } catch (error) {

    console.error(
      "Gagal mengambil data provinsi:",
      error
    );

    provinsi.innerHTML =
      `<option value="">Gagal memuat provinsi</option>`;

  }


  // =====================================================
  // PROVINSI → KABUPATEN / KOTA
  // =====================================================

  provinsi.onchange = async function () {

    const provinsiCode = this.value;


    // Reset level bawah

    kota.innerHTML =
      `<option value="">Pilih Kabupaten/Kota</option>`;

    kecamatan.innerHTML =
      `<option value="">Pilih Kecamatan</option>`;

    desa.innerHTML =
      `<option value="">Pilih Desa/Kelurahan</option>`;


    kota.disabled = true;
    kecamatan.disabled = true;
    desa.disabled = true;


    if (!provinsiCode) {
      return;
    }


    kota.innerHTML =
      `<option value="">Memuat Kabupaten/Kota...</option>`;


    try {

      const response =
        await fetch(
          `${API_WILAYAH}?path=regencies/${provinsiCode}.json`
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const result =
        await response.json();


      kota.innerHTML =
        `<option value="">Pilih Kabupaten/Kota</option>`;


      result.data.forEach(item => {

        const option =
          document.createElement("option");

        // KODE HANYA UNTUK API
        option.value = item.code;

        // NAMA YANG DITAMPILKAN
        option.textContent = item.name;

        kota.appendChild(option);

      });


      kota.disabled = false;


    } catch (error) {

      console.error(
        "Gagal mengambil kabupaten/kota:",
        error
      );

      kota.innerHTML =
        `<option value="">Gagal memuat data</option>`;

    }

  };


  // =====================================================
  // KABUPATEN / KOTA → KECAMATAN
  // =====================================================

  kota.onchange = async function () {

    const kotaCode = this.value;


    // Reset desa

    kecamatan.innerHTML =
      `<option value="">Pilih Kecamatan</option>`;

    desa.innerHTML =
      `<option value="">Pilih Desa/Kelurahan</option>`;


    kecamatan.disabled = true;
    desa.disabled = true;


    if (!kotaCode) {
      return;
    }


    kecamatan.innerHTML =
      `<option value="">Memuat Kecamatan...</option>`;


    try {

      const response =
        await fetch(
          `${API_WILAYAH}?path=districts/${kotaCode}.json`
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const result =
        await response.json();


      kecamatan.innerHTML =
        `<option value="">Pilih Kecamatan</option>`;


      result.data.forEach(item => {

        const option =
          document.createElement("option");

        // KODE HANYA UNTUK API
        option.value = item.code;

        // NAMA YANG DITAMPILKAN
        option.textContent = item.name;

        kecamatan.appendChild(option);

      });


      kecamatan.disabled = false;


    } catch (error) {

      console.error(
        "Gagal mengambil kecamatan:",
        error
      );

      kecamatan.innerHTML =
        `<option value="">Gagal memuat data</option>`;

    }

  };


  // =====================================================
  // KECAMATAN → DESA / KELURAHAN
  // =====================================================

  kecamatan.onchange = async function () {

    const kecamatanCode = this.value;


    desa.innerHTML =
      `<option value="">Pilih Desa/Kelurahan</option>`;

    desa.disabled = true;


    if (!kecamatanCode) {
      return;
    }


    desa.innerHTML =
      `<option value="">Memuat Desa/Kelurahan...</option>`;


    try {

      const response =
        await fetch(
          `${API_WILAYAH}?path=villages/${kecamatanCode}.json`
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const result =
        await response.json();


      desa.innerHTML =
        `<option value="">Pilih Desa/Kelurahan</option>`;


      result.data.forEach(item => {

        const option =
          document.createElement("option");

        // KODE HANYA UNTUK API
        option.value = item.code;

        // NAMA YANG DITAMPILKAN
        option.textContent = item.name;

        desa.appendChild(option);

      });


      desa.disabled = false;


    } catch (error) {

      console.error(
        "Gagal mengambil desa/kelurahan:",
        error
      );

      desa.innerHTML =
        `<option value="">Gagal memuat data</option>`;

    }

  };

}

window.initPresensiTK = async function () {

  await loadRiwayatTK();


  document

    .getElementById("pegawaiTKSearch")

    .addEventListener("input", e => {

      cariPegawaiTK(e.target.value);

    });

  document

    .getElementById("pegawaiTKResult")

    .addEventListener("click", e => {

      const item =
        e.target.closest(".pegawai-item");

      if (!item) return;

      tambahPegawaiTK({

        id: Number(item.dataset.id),

        nama: item.dataset.nama

      });

    });

  document

    .getElementById("pegawaiTKContainer")

    .addEventListener("click", e => {

      const btn =
        e.target.closest(".btnRemovePegawai");

      if (!btn) return;

      daftarPegawaiTK.splice(

        btn.dataset.index,

        1

      );

      renderDaftarPegawaiTK();

    });

  document
    .getElementById("btnSimpanTK")
    .onclick = simpanTK;

  document
    .getElementById("riwayatTKBody")
    .addEventListener("click", async (e) => {

      const btn = e.target.closest(".btnDeleteTK");

      if (!btn) return;

      if (!confirm("Yakin ingin menghapus data TK ini?")) {
        return;
      }

      const { error } = await supabase
        .from("tk_bulanan")
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", btn.dataset.id);

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      await loadRiwayatTK();

    });

};

async function simpanTK() {

  const tanggal =
    document
      .getElementById("tanggalTK")
      .value;

  if (!tanggal) {

    alert("Pilih tanggal terlebih dahulu.");

    return;

  }

  if (daftarPegawaiTK.length == 0) {

    alert("Pilih minimal 1 pegawai.");

    return;

  }

  const rows = [];

  for (const p of daftarPegawaiTK) {

    const keterangan =
      await cekKeteranganTK(
        p.id,
        tanggal
      );

    rows.push({

      pegawai_id: p.id,

      tanggal: tanggal,

      keterangan: keterangan,

      created_at: new Date(),

      updated_at: new Date()

    });

  }

  const { error } =
    await supabase

      .from("tk_bulanan")

      .insert(rows);

  if (error) {

    if (error.code === "23505") {

      alert("Ada pegawai yang sudah tercatat TK pada tanggal tersebut.");

      return;

    }

    alert(error.message);

    return;

  }




  alert("Data TK berhasil disimpan.");



  daftarPegawaiTK = [];

  renderDaftarPegawaiTK();

  document.getElementById("pegawaiTKSearch").value = "";

  await loadRiwayatTK();

}

async function loadRiwayatTK() {

  const { data, error } = await supabase

    .from("tk_bulanan")

    .select(`
            *,
            pegawai (
                nama
            )
        `)

    .is("deleted_at", null)

    .order("tanggal", {
      ascending: false
    })

    .order("created_at", {
      ascending: false
    });

  if (error) {

    console.error(error);

    return;

  }

  const body =
    document.getElementById("riwayatTKBody");

  if (data.length == 0) {

    body.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center">
                    Belum ada data.
                </td>
            </tr>
        `;

    return;

  }

  body.innerHTML = data.map(x => `

        <tr align="center">

            <td>
                ${formatTanggal(x.tanggal)}
            </td>

            <td>
                ${x.pegawai.nama}
            </td>

            <td>
                ${x.keterangan ?? "-"}
            </td>

            <td>

                <button
                    class="btnDeleteTK"
                    data-id="${x.id}">

                    🗑️ Hapus

                </button>

            </td>

        </tr>

    `).join("");

}

function tambahPegawaiTK(pegawai) {

  if (

    daftarPegawaiTK.some(

      x => x.id === pegawai.id

    )

  ) {

    alert("Pegawai sudah dipilih.");

    return;

  }

  daftarPegawaiTK.push(pegawai);

  renderDaftarPegawaiTK();

  document.getElementById("pegawaiTKSearch").value = "";

  document.getElementById("pegawaiTKResult").innerHTML = "";

}

function renderDaftarPegawaiTK() {

  const box =
    document.getElementById("pegawaiTKContainer");

  box.innerHTML = daftarPegawaiTK.map((p, i) => `

        <div class="pegawai-selected">

            <span>

                ${p.nama}

            </span>

            <button
                class="btnRemovePegawai"
                data-index="${i}">

                ✕

            </button>

        </div>

    `).join("");

}

async function cariPegawaiTK(keyword) {

  if (keyword.length < 2) {

    document.getElementById("pegawaiTKResult").innerHTML = "";

    return;

  }

  const { data, error } = await supabase

    .from("pegawai")

    .select("id,nama")

    .ilike("nama", `%${keyword}%`)

    .eq("aktif", true)

    .order("nama");

  if (error) {

    console.error(error);

    return;

  }

  const result =
    document.getElementById("pegawaiTKResult");

  result.innerHTML = data.map(p => `

        <div
            class="pegawai-item"
            data-id="${p.id}"
            data-nama="${p.nama}">

            ${p.nama}

        </div>

    `).join("");

}

async function simpanPengajuanDl() {

  const tglMulai =
    document
      .getElementById(
        "tglMulai"
      )
      .value;

  const tglSelesai =
    document
      .getElementById(
        "tglSelesai"
      )
      .value;

  const keterangan =
    document
      .getElementById(
        "keteranganDl"
      )
      .value;

  const file =
    document
      .getElementById(
        "suratDl"
      )
      .files[0];

  if (!tglMulai) {

    alert("Tanggal mulai wajib diisi.");
    return;

  }

  if (!tglSelesai) {

    alert("Tanggal selesai wajib diisi.");
    return;

  }

  if (new Date(tglSelesai) < new Date(tglMulai)) {

    alert("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");

    return;

  }

  if (!keterangan) {

    alert("Keterangan wajib diisi.");
    return;

  }

  if (!file) {

    alert("Surat tugas wajib diupload.");

    return;

  }

  if (file.type !== "application/pdf") {

    alert("File surat tugas harus berformat PDF.");

    return;

  }

  const maxSize =
    2 * 1024 * 1024; // 2 MB

  if (file.size > maxSize) {

    alert("Ukuran file maksimal 2 MB.");

    return;

  }

  const {
    data: userData
  } = await supabase.auth.getUser();

  const {
    data: pegawai,
    error: pegawaiError
  } = await supabase
    .from("pegawai")
    .select("id,nama")
    .eq(
      "email",
      userData.user.email
    )
    .single();

  let filePath;

  try {

    filePath =
      await uploadDokumen(

        "surat_dl",

        "DL",

        pegawai.id,

        file

      );

  } catch (err) {

    console.error(err);

    alert(err.message);

    return;

  }

  const {
    data: nomorPengajuan,
    error: nomorError
  } = await supabase.rpc(
    "generate_nomor_pengajuan",
    {
      p_jenis: "DL"
    }
  );

  if (nomorError) {

    console.error(nomorError);

    alert("Gagal membuat nomor pengajuan");

    return;

  }

  const {
    data: pengajuan,
    error: pengajuanError
  } = await supabase
    .from("pengajuan")
    .insert({

      nomor_pengajuan: nomorPengajuan,

      pegawai_id: pegawai.id,

      jenis_pengajuan: "DL",

      status: "MENUNGGU",

      created_by: pegawai.id,

      created_at:
        new Date()
          .toISOString()

    })
    .select()
    .single();

  if (pengajuanError) {

    console.error(pengajuanError);

    alert("Gagal menyimpan pengajuan");

    return;

  }

  const anggota = pesertaDipilih.map(p => ({

    pengajuan_id:
      pengajuan.id,

    pegawai_id:
      p.id,

    is_pengaju:
      p.isOwner

  }));

  const {
    error: anggotaError
  } = await supabase

    .from("pengajuan_anggota")

    .insert(
      anggota
    );

  if (anggotaError) {

    console.error(anggotaError);

    alert(
      "Gagal menyimpan peserta"
    );

    return;

  }

  const mulai =
    new Date(tglMulai);

  const selesai =
    new Date(tglSelesai);

  const jumlahHari =
    Math.floor(
      (
        selesai -
        mulai
      ) /
      86400000
    ) + 1;

  await supabase
    .from("dl_detail")
    .insert({

      pengajuan_id:
        pengajuan.id,

      tanggal_mulai:
        tglMulai,

      tanggal_selesai:
        tglSelesai,

      jumlah_hari:
        jumlahHari

    });


  await supabase
    .from("dokumen")
    .insert({

      pengajuan_id:
        pengajuan.id,

      jenis_dokumen:
        "SURAT_TUGAS",

      file_url:
        filePath,

      status_verifikasi:
        "MENUNGGU",

      uploaded_at:
        new Date()
          .toISOString()

    });

  const pegawaiIds =
    pesertaDipilih.map(x => x.id);

  await updateTKBerdasarkanRentangTanggal(

    pegawaiIds,

    tglMulai,

    tglSelesai,

    KETERANGAN_TK.PENGAJUAN_DL

  );

  alert(
    "Pengajuan berhasil disimpan"
  );

  document
    .getElementById("tglMulai")
    .value = "";

  document
    .getElementById("tglSelesai")
    .value = "";

  document
    .getElementById("keteranganDl")
    .value = "";

  document
    .getElementById("suratDl")
    .value = "";

  loadRiwayatDl();
}

async function simpanPengajuanCutiSakit() {

  const tanggalMulai =
    document
      .getElementById("tanggalMulai")
      .value;

  const tanggalSelesai =
    document
      .getElementById("tanggalSelesai")
      .value;

  const alamat =
    document.getElementById("alamatCutiSakit").value.trim();

  const rt =
    document.getElementById("rtCutiSakit").value.trim();

  const rw =
    document.getElementById("rwCutiSakit").value.trim();

  const desa =
    document.getElementById("desaCuti").value.trim();

  const kecamatan =
    document.getElementById("kecamatanCuti").value.trim();

  const kota =
    document.getElementById("kotaCuti").value.trim();

  const namaKota =
    kotaCuti?.options[
      kotaCuti.selectedIndex
    ]?.text || "";

  const namaKecamatan =
    kecamatanCuti?.options[
      kecamatanCuti.selectedIndex
    ]?.text || "";

  const namaDesa =
    desaCuti?.options[
      desaCuti.selectedIndex
    ]?.text || "";

  const alamatLengkap = [
    alamat,
    rt || rw
      ? `RT ${rt || "-"} RW ${rw || "-"}`
      : "",
    desa
      ? `${namaDesa}`
      : "",
    kecamatan
      ? `Kecamatan ${namaKecamatan}`
      : "",
    kota
      ? `${namaKota}`
      : ""
  ].filter(Boolean).join(", ");

  const file =
    document
      .getElementById("suratSakit")
      .files[0];


  if (!tanggalMulai) {

    alert("Tanggal mulai wajib diisi.");

    return;

  }

  if (!tanggalSelesai) {

    alert("Tanggal selesai wajib diisi.");

    return;

  }

  if (new Date(tanggalSelesai) < new Date(tanggalMulai)) {

    alert("Tanggal selesai tidak boleh lebih kecil dari tanggal mulai.");

    return;

  }

  if (!file) {

    alert("Surat sakit wajib diupload.");

    return;

  }

  (!alamat || !rt || !rw || !desa || !kecamatan || !kota) && alert("Alamat lengkap wajib diisi.");

  const ext =
    file.name
      .split(".")
      .pop()
      .toLowerCase();

  const allowed =
    [
      "pdf",
      "jpg",
      "jpeg",
      "png"
    ];

  if (!allowed.includes(ext)) {

    alert(
      "File harus PDF/JPG/JPEG/PNG."
    );

    return;

  }

  if (

    ext === "pdf"

    &&

    file.size >
    2 * 1024 * 1024

  ) {

    alert(
      "PDF maksimal 2 MB."
    );

    return;

  }

  let fileUrl;

  try {

    fileUrl =
      await uploadDokumen(

        "surat_sakit",

        "CS",

        pegawaiLogin.id,

        file

      );

  } catch (err) {

    console.error(err);

    alert(err.message);

    return;

  }

  const {
    data: nomorPengajuan,
    error: nomorError
  } = await supabase.rpc(
    "generate_nomor_pengajuan",
    {
      p_jenis: "CS"
    }
  );

  if (nomorError) {

    console.error(nomorError);

    alert("Gagal membuat nomor pengajuan.");

    return;

  }

  const {
    data: pengajuan,
    error: pengajuanError
  } = await supabase
    .from("pengajuan")
    .insert({

      nomor_pengajuan: nomorPengajuan,

      pegawai_id: pegawaiLogin.id,

      jenis_pengajuan: "CUTI_SAKIT",

      status: "MENUNGGU",

      created_by: pegawaiLogin.id,

      created_at: new Date().toISOString()

    })
    .select()
    .single();



  if (pengajuanError) {

    console.error(pengajuanError);

    alert("Gagal menyimpan pengajuan.");

    return;

  }

  const { error: anggotaError } = await supabase
    .from("pengajuan_anggota")
    .insert({

      pengajuan_id: pengajuan.id,

      pegawai_id: pegawaiLogin.id,

      is_pengaju: true

    });

  if (anggotaError) {

    console.error(anggotaError);

    alert("Gagal menyimpan pengaju.");

    return;

  }

  const mulai =
    new Date(tanggalMulai);

  const selesai =
    new Date(tanggalSelesai);

  const jumlahHari =
    Math.floor(
      (selesai - mulai) / 86400000
    ) + 1;


  const {
    error: detailError
  } = await supabase
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

    alert("Gagal menyimpan detail.");

    return;

  }

  const {
    error: dokumenError
  } = await supabase
    .from("dokumen")
    .insert({

      pengajuan_id: pengajuan.id,

      jenis_dokumen: "SURAT_SAKIT",

      file_url: fileUrl,

      status_verifikasi: "MENUNGGU",

      uploaded_at: new Date().toISOString()

    });

  if (dokumenError) {

    console.error(dokumenError);

    alert("Gagal menyimpan dokumen.");

    return;

  }

  await updateTKBerdasarkanRentangTanggal(

    [pegawaiLogin.id],

    tanggalMulai,

    tanggalSelesai,

    KETERANGAN_TK.PENGAJUAN_CUTI_SAKIT

  );

  document.getElementById("tanggalMulai").value = "";
  document.getElementById("tanggalSelesai").value = "";
  document.getElementById("suratSakit").value = "";
  document.getElementById("alasanCutiSakit").value = "";
  document.getElementById("alamatCutiSakit").value = "";
  document
    .getElementById(
      "rtCutiSakit"
    ).value = "";

  document
    .getElementById(
      "rwCutiSakit"
    ).value = "";

  document
    .getElementById(
      "desaCuti"
    ).value = "";

  document
    .getElementById(
      "desaCuti"
    ).disabled = true;

  document
    .getElementById(
      "kecamatanCuti"
    ).value = "";

  document
    .getElementById(
      "kecamatanCuti"
    ).disabled = true;

  document
    .getElementById(
      "kotaCuti"
    ).value = "";

  document
    .getElementById(
      "kotaCuti"
    ).disabled = true;

  document
    .getElementById(
      "provinsiCuti"
    ).value = "";


  await loadRiwayatCutiSakit();

  alert("Pengajuan berhasil disimpan.");

}

async function simpanPengajuanCutiAlasanPenting() {

  const tanggalMulai =
    document
      .getElementById("tanggalMulai")
      .value;

  const tanggalSelesai =
    document
      .getElementById("tanggalSelesai")
      .value;

  const alasan =
    document.getElementById("alasanCutiAlasanPenting").value.trim();

  const alamat =
    document.getElementById("alamatCutiAlasanPenting").value.trim();

  const rt =
    document.getElementById("rtCutiAlasanPenting").value.trim();

  const rw =
    document.getElementById("rwCutiAlasanPenting").value.trim();

  const desa =
    document.getElementById("desaCuti").value.trim();

  const kecamatan =
    document.getElementById("kecamatanCuti").value.trim();

  const kota =
    document.getElementById("kotaCuti").value.trim();

  const namaKota =
    kotaCuti?.options[
      kotaCuti.selectedIndex
    ]?.text || "";

  const namaKecamatan =
    kecamatanCuti?.options[
      kecamatanCuti.selectedIndex
    ]?.text || "";

  const namaDesa =
    desaCuti?.options[
      desaCuti.selectedIndex
    ]?.text || "";

  const alamatLengkap = [
    alamat,
    rt || rw
      ? `RT ${rt || "-"} RW ${rw || "-"}`
      : "",
    desa
      ? `${namaDesa}`
      : "",
    kecamatan
      ? `Kecamatan ${namaKecamatan}`
      : "",
    kota
      ? `${namaKota}`
      : ""
  ].filter(Boolean).join(", ");

  const file =
    document
      .getElementById("suratPersetujuanAtasan")
      .files[0];


  if (!tanggalMulai) {

    alert("Tanggal mulai wajib diisi.");

    return;

  }

  if (!tanggalSelesai) {

    alert("Tanggal selesai wajib diisi.");

    return;

  }

  if (!alasan) {

    alert("Alasan cuti wajib diisi.");

    return;

  }

  if (new Date(tanggalSelesai) < new Date(tanggalMulai)) {

    alert("Tanggal selesai tidak boleh lebih kecil dari tanggal mulai.");

    return;

  }

  if (!file) {

    alert("Bukti persetujuan atasan wajib diupload.");

    return;

  }

  (!alamat || !rt || !rw || !desa || !kecamatan || !kota) && alert("Alamat lengkap wajib diisi.");

  const ext =
    file.name
      .split(".")
      .pop()
      .toLowerCase();

  const allowed =
    [
      "pdf",
      "jpg",
      "jpeg",
      "png"
    ];

  if (!allowed.includes(ext)) {

    alert(
      "File harus PDF/JPG/JPEG/PNG."
    );

    return;

  }

  if (

    ext === "pdf"

    &&

    file.size >
    2 * 1024 * 1024

  ) {

    alert(
      "PDF maksimal 2 MB."
    );

    return;

  }

  let fileUrl;

  try {

    fileUrl =
      await uploadDokumen(

        "persetujuan_atasan",

        "CAP",

        pegawaiLogin.id,

        file

      );

  } catch (err) {

    console.error(err);

    alert(err.message);

    return;

  }

  const {
    data: nomorPengajuan,
    error: nomorError
  } = await supabase.rpc(
    "generate_nomor_pengajuan",
    {
      p_jenis: "CAP"
    }
  );

  if (nomorError) {

    console.error(nomorError);

    alert("Gagal membuat nomor pengajuan.");

    return;

  }

  const {
    data: pengajuan,
    error: pengajuanError
  } = await supabase
    .from("pengajuan")
    .insert({

      nomor_pengajuan: nomorPengajuan,

      pegawai_id: pegawaiLogin.id,

      jenis_pengajuan: "CUTI_ALASAN_PENTING",

      status: "MENUNGGU",

      created_by: pegawaiLogin.id,

      created_at: new Date().toISOString()

    })
    .select()
    .single();



  if (pengajuanError) {

    console.error(pengajuanError);

    alert("Gagal menyimpan pengajuan.");

    return;

  }

  const { error: anggotaError } = await supabase
    .from("pengajuan_anggota")
    .insert({

      pengajuan_id: pengajuan.id,

      pegawai_id: pegawaiLogin.id,

      is_pengaju: true

    });

  if (anggotaError) {

    console.error(anggotaError);

    alert("Gagal menyimpan pengaju.");

    return;

  }

  const mulai =
    new Date(tanggalMulai);

  const selesai =
    new Date(tanggalSelesai);

  const jumlahHari =
    Math.floor(
      (selesai - mulai) / 86400000
    ) + 1;


  const {
    error: detailError
  } = await supabase
    .from("cuti_alasan_penting_detail")
    .insert({

      pengajuan_id: pengajuan.id,

      tanggal_mulai: tanggalMulai,

      tanggal_selesai: tanggalSelesai,

      jumlah_hari: jumlahHari,

      alamat: alamatLengkap,

      alasan: alasan

    });

  if (detailError) {

    console.error(detailError);

    alert("Gagal menyimpan detail.");

    return;

  }

  const {
    error: dokumenError
  } = await supabase
    .from("dokumen")
    .insert({

      pengajuan_id: pengajuan.id,

      jenis_dokumen: "PERSETUJUAN_ATASAN",

      file_url: fileUrl,

      status_verifikasi: "MENUNGGU",

      uploaded_at: new Date().toISOString()

    });

  if (dokumenError) {

    console.error(dokumenError);

    alert("Gagal menyimpan dokumen.");

    return;

  }

  await updateTKBerdasarkanRentangTanggal(

    [pegawaiLogin.id],

    tanggalMulai,

    tanggalSelesai,

    KETERANGAN_TK.PENGAJUAN_CUTI_ALASAN_PENTING

  );

  document.getElementById("tanggalMulai").value = "";
  document.getElementById("tanggalSelesai").value = "";
  document.getElementById("suratPersetujuanAtasan").value = "";
  document.getElementById("alasanCutiAlasanPenting").value = "";
  document.getElementById("alamatCutiAlasanPenting").value = "";
  document
    .getElementById(
      "rtCutiAlasanPenting"
    ).value = "";

  document
    .getElementById(
      "rwCutiAlasanPenting"
    ).value = "";

  document
    .getElementById(
      "desaCuti"
    ).value = "";

  document
    .getElementById(
      "desaCuti"
    ).disabled = true;

  document
    .getElementById(
      "kecamatanCuti"
    ).value = "";

  document
    .getElementById(
      "kecamatanCuti"
    ).disabled = true;

  document
    .getElementById(
      "kotaCuti"
    ).value = "";

  document
    .getElementById(
      "kotaCuti"
    ).disabled = true;

  document
    .getElementById(
      "provinsiCuti"
    ).value = "";


  await loadRiwayatCutiAlasanPenting();

  alert("Pengajuan berhasil disimpan.");

}

async function simpanPengajuanCutiTahunan() {

  const alasan =
    document
      .getElementById("alasanCuti")
      .value
      .trim();

  const alamat =
    document.getElementById("alamatCuti").value.trim();

  const rt =
    document.getElementById("rtCuti").value.trim();

  const rw =
    document.getElementById("rwCuti").value.trim();

  const desa =
    document.getElementById("desaCuti").value.trim();

  const kecamatan =
    document.getElementById("kecamatanCuti").value.trim();

  const kota =
    document.getElementById("kotaCuti").value.trim();

  const namaKota =
    kotaCuti?.options[
      kotaCuti.selectedIndex
    ]?.text || "";

  const namaKecamatan =
    kecamatanCuti?.options[
      kecamatanCuti.selectedIndex
    ]?.text || "";

  const namaDesa =
    desaCuti?.options[
      desaCuti.selectedIndex
    ]?.text || "";

  const alamatLengkap = [
    alamat,
    rt || rw ? `RT ${rt || "-"} RW ${rw || "-"}` : "",
    desa ? `${namaDesa}` : "",
    kecamatan ? `Kecamatan ${namaKecamatan}` : "",
    kota ? `${namaKota}` : ""
  ].filter(Boolean).join(", ");

  const file =
    document
      .getElementById("persetujuanAtasan")
      .files[0];

  if (tanggalCutiDipilih.length === 0) {

    alert("Pilih minimal 1 tanggal cuti.");

    return;

  }

  if (!alasan) {

    alert("Alasan cuti wajib diisi.");

    return;

  }

  if (!alamat) {

    alert("Alamat saat cuti wajib diisi.");

    return;

  }

  if (!rt && !rw && !desa && !kecamatan && !kota) {

    alert("Alamat saat cuti wajib diisi.");

    return;

  }

  if (!file) {

    alert("Persetujuan atasan wajib diupload.");

    return;

  }

  const ext =
    file.name
      .split(".")
      .pop()
      .toLowerCase();

  if (
    ![
      "jpg",
      "jpeg",
      "png"
    ].includes(ext)
  ) {

    alert("File harus berupa foto.");

    return;

  }

  const jumlahHari = tanggalDipilih.length;

  if (jumlahHari === 0) {

    alert("Pilih minimal satu hari cuti.");

    return;

  }

  if (jumlahHari > window.totalSaldoCuti) {

    alert(
      `Sisa cuti tidak mencukupi.\n\n` +
      `Sisa: ${window.totalSaldoCuti} hari\n` +
      `Pengajuan: ${jumlahHari} hari`
    );

    return;

  }

  const { data: userData } =
    await supabase.auth.getUser();

  const { data: pegawai } =
    await supabase
      .from("pegawai")
      .select("id,nama")
      .eq(
        "email",
        userData.user.email
      )
      .single();

  pegawaiLogin = pegawai;

  const fileUrl =
    await uploadDokumen(

      "persetujuan_atasan",

      "CT",

      pegawaiLogin.id,

      file

    );

  const {
    data: nomorPengajuan
  } =
    await supabase.rpc(
      "generate_nomor_pengajuan",
      {
        p_jenis: "CT"
      });


  const {
    data: pengajuan,
    error: pengajuanError
  } = await supabase
    .from("pengajuan")
    .insert({

      nomor_pengajuan: nomorPengajuan,

      pegawai_id: pegawai.id,

      jenis_pengajuan: "CUTI_TAHUNAN",

      status: "MENUNGGU",

      created_by: pegawai.id,

      created_at:
        new Date()
          .toISOString()

    })
    .select()
    .single();

  if (pengajuanError) {

    console.error(pengajuanError);

    alert("Gagal menyimpan pengajuan");

    return;

  }

  await supabase
    .from("pengajuan_anggota")
    .insert({

      pengajuan_id:
        pengajuan.id,

      pegawai_id:
        pegawaiLogin.id,

      is_pengaju: true

    });

  await supabase
    .from("cuti_tahunan_detail")
    .insert({

      pengajuan_id:
        pengajuan.id,

      alasan,

      alamat_cuti:
        alamatLengkap

    });

  const daftarTanggal =
    tanggalCutiDipilih.map(

      tanggal => ({

        pengajuan_id:
          pengajuan.id,

        tanggal

      })

    );

  await supabase
    .from(
      "cuti_tahunan_tanggal"
    )
    .insert(
      daftarTanggal
    );

  await supabase
    .from("dokumen")
    .insert({

      pengajuan_id:
        pengajuan.id,

      jenis_dokumen:
        "PERSETUJUAN_ATASAN",

      file_url:
        fileUrl,

      status_verifikasi:
        "MENUNGGU"

    });

  await updateTKKarenaCutiTahunan(
    pegawai.id,
    tanggalCutiDipilih,
    KETERANGAN_TK.PENGAJUAN_CUTI_TAHUNAN
  );

  tanggalCutiDipilih = [];

  refreshTanggalDipilih();

  document
    .getElementById(
      "alasanCuti"
    ).value = "";

  document
    .getElementById(
      "alamatCuti"
    ).value = "";

  document
    .getElementById(
      "rtCuti"
    ).value = "";

  document
    .getElementById(
      "rwCuti"
    ).value = "";

  document
    .getElementById(
      "desaCuti"
    ).value = "";

  document
    .getElementById(
      "desaCuti"
    ).disabled = true;

  document
    .getElementById(
      "kecamatanCuti"
    ).value = "";

  document
    .getElementById(
      "kecamatanCuti"
    ).disabled = true;

  document
    .getElementById(
      "kotaCuti"
    ).value = "";

  document
    .getElementById(
      "kotaCuti"
    ).disabled = true;

  document
    .getElementById(
      "provinsiCuti"
    ).value = "";

  document
    .getElementById(
      "persetujuanAtasan"
    ).value = "";

  await loadRiwayatCutiTahunan();

  alert(
    "Pengajuan berhasil disimpan."
  );

}

async function loadRiwayatCutiSakit() {
  const tbody =
    document.getElementById(
      "riwayatCutiSakitBody"
    );

  if (!tbody) return;

  const {
    data: userData
  } = await supabase.auth.getUser();

  const {
    data: pegawai
  } = await supabase
    .from("pegawai")
    .select("id")
    .eq(
      "email",
      userData.user.email
    )
    .single();

  pegawaiLogin = pegawai;

  const {
    data,
    error
  } = await supabase
    .from("pengajuan")
    .select(`

    id,
    nomor_pengajuan,
    status,
    deleted_at,
    catatan_admin,

    cuti_sakit_detail(

      tanggal_mulai,
      tanggal_selesai,
      jumlah_hari
    )

  `)
    .eq(
      "pegawai_id",
      pegawai.id
    )
    .eq(
      "jenis_pengajuan",
      "CUTI_SAKIT"
    )
    .is(
      "deleted_at",
      null
    )
    .order(
      "created_at",
      {
        ascending: false
      }
    );

  if (error) {

    console.error(error);

    return;

  }

  tbody.innerHTML = "";

  data.forEach(p => {

    const detail =
      p.cuti_sakit_detail?.[0];

    tbody.innerHTML += `

<tr align="center">

<td>

${p.nomor_pengajuan}

</td>

<td>

${detail?.tanggal_mulai ?? "-"}

${detail?.tanggal_selesai ?

        ` s/d ${detail.tanggal_selesai}`

        : ""}

</td>

<td>

${badgeStatus(
          p.status
        )}

</td>

<td>

${p?.catatan_admin ?? "-"} </td>

<td>

<button
class="btn-lihat-surat"
data-id="${p.id}"
>

Lihat Surat Sakit

</button>

${p.status === "MENUNGGU"

        ?

        `

<button
class="btn-danger btn-hapus-cs"
data-id="${p.id}"
>

Hapus

</button>

`

        :

        ""

      }

${p.status === "SELESAI"

        ?

        `

<button
class="btn-success btn-lihat-form-cuti"
data-id="${p.id}">

Lihat Form Cuti

</button>

`

        :

        ""

      }

</td>

</tr>

`;

  });

  tbody.onclick = async (e) => {

    const lihat =
      e.target.closest(".btn-lihat-surat");

    if (lihat) {

      await lihatSuratCutiSakit(

        Number(lihat.dataset.id)

      );

      return;

    }

    const hapus =
      e.target.closest(
        ".btn-hapus-cs"
      );

    if (hapus) {

      await hapusPengajuanCutiSakit(

        Number(
          hapus.dataset.id
        )

      );

      return;

    }

    const btnLihatForm =
      e.target.closest(".btn-lihat-form-cuti");

    if (btnLihatForm) {

      await lihatFormCuti(
        Number(btnLihatForm.dataset.id)
      );

      return;

    }

  };
}

async function loadRiwayatCutiAlasanPenting() {
  const tbody =
    document.getElementById(
      "riwayatCutiAlasanPentingBody"
    );

  if (!tbody) return;

  const {
    data: userData
  } = await supabase.auth.getUser();

  const {
    data: pegawai
  } = await supabase
    .from("pegawai")
    .select("id")
    .eq(
      "email",
      userData.user.email
    )
    .single();

  pegawaiLogin = pegawai;

  const {
    data,
    error
  } = await supabase
    .from("pengajuan")
    .select(`

    id,
    nomor_pengajuan,
    status,
    deleted_at,
    catatan_admin,

    cuti_alasan_penting_detail(

      tanggal_mulai,
      tanggal_selesai,
      jumlah_hari
    )

  `)
    .eq(
      "pegawai_id",
      pegawai.id
    )
    .eq(
      "jenis_pengajuan",
      "CUTI_ALASAN_PENTING"
    )
    .is(
      "deleted_at",
      null
    )
    .order(
      "created_at",
      {
        ascending: false
      }
    );

  if (error) {

    console.error(error);

    return;

  }

  tbody.innerHTML = "";

  data.forEach(p => {

    const detail =
      p.cuti_alasan_penting_detail?.[0];

    tbody.innerHTML += `

<tr align="center">

<td>

${p.nomor_pengajuan}

</td>

<td>

${detail?.tanggal_mulai ?? "-"}

${detail?.tanggal_selesai ?

        ` s/d ${detail.tanggal_selesai}`

        : ""}

</td>

<td>

${badgeStatus(
          p.status
        )}

</td>

<td>

${p?.catatan_admin ?? "-"} </td>

<td>

<button
class="btn-lihat-surat"
data-id="${p.id}"
>

Lihat Bukti Persetujuan Atasan

</button>

${p.status === "MENUNGGU"

        ?

        `

<button
class="btn-danger btn-hapus-cs"
data-id="${p.id}"
>

Hapus

</button>

`

        :

        ""

      }

${p.status === "SELESAI"

        ?

        `

<button
class="btn-success btn-lihat-form-cuti"
data-id="${p.id}">

Lihat Form Cuti

</button>

`

        :

        ""

      }

</td>

</tr>

`;

  });

  tbody.onclick = async (e) => {

    const lihat =
      e.target.closest(".btn-lihat-surat");

    if (lihat) {

      await lihatSuratCutiAlasanPenting(

        Number(lihat.dataset.id)

      );

      return;

    }

    const hapus =
      e.target.closest(
        ".btn-hapus-cs"
      );

    if (hapus) {

      await hapusPengajuanCutiAlasanPenting(

        Number(
          hapus.dataset.id
        )

      );

      return;

    }

    const btnLihatForm =
      e.target.closest(".btn-lihat-form-cuti");

    if (btnLihatForm) {

      await lihatFormCuti(
        Number(btnLihatForm.dataset.id)
      );

      return;

    }

  };
}

async function loadRiwayatDl() {

  const tbody =
    document.getElementById(
      "riwayatDlBody"
    );

  if (!tbody) return;

  const {
    data: userData
  } = await supabase.auth.getUser();

  const {
    data: pegawai
  } = await supabase
    .from("pegawai")
    .select("id")
    .eq(
      "email",
      userData.user.email
    )
    .single();

  pegawaiLogin = pegawai;

  const {
    data,
    error
  } = await supabase
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

      pengajuan_anggota(
        id
      )
    )
  `)
    .eq(
      "pegawai_id",
      pegawai.id
    )
    .eq(
      "pengajuan.jenis_pengajuan",
      "DL"
    )
    .is(
      "pengajuan.deleted_at",
      null
    )
    .order(
      "created_at",
      {
        ascending: false
      }
    );

  if (error) {

    console.error(error);

    return;

  }

  tbody.innerHTML = "";

  data.forEach(item => {

    const p =
      item.pengajuan;

    const detail =
      p.dl_detail?.[0];

    const jumlahPeserta =
      p.pengajuan_anggota.length;

    tbody.innerHTML += `

<tr align="center">

<td>

${p.nomor_pengajuan}

</td>

<td>

${detail?.tanggal_mulai ?? "-"}

${detail?.tanggal_selesai
        ?
        ` s/d ${detail.tanggal_selesai}`
        :
        ""
      }

</td>

<td>

${jumlahPeserta} Orang

</td>

<td>

${badgeStatus(
        p.status
      )}

</td>

<td>

${p?.catatan_admin ?? "-"} </td>

<td>

<button
class="btn-detail"
data-id="${p.id}"
>

Detail

</button>

${p.status === "MENUNGGU"
        ? `
      <button
        class="btn-danger btn-hapus"
        data-id="${p.id}"
      >
        Hapus
      </button>
    `
        : ""
      }

</td>

</tr>

`;

  });

  tbody.onclick = async (e) => {

    const detail = e.target.closest(".btn-detail");

    if (detail) {

      await loadDetailDl(
        Number(detail.dataset.id)
      );

      return;

    }

    const hapus = e.target.closest(".btn-hapus");

    if (hapus) {

      await hapusPengajuanDl(
        Number(hapus.dataset.id)
      );

      return;

    }

  };

}

async function loadRiwayatCutiTahunan() {
  const tbody =
    document.getElementById(
      "riwayatCutiTahunanBody"
    );

  if (!tbody) return;

  const {
    data: userData
  } = await supabase.auth.getUser();

  const {
    data: pegawai
  } = await supabase
    .from("pegawai")
    .select("id")
    .eq(
      "email",
      userData.user.email
    )
    .single();

  pegawaiLogin = pegawai;

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

        cuti_tahunan_detail(
            alasan,
            alamat_cuti
        ),

        cuti_tahunan_tanggal(
            tanggal
        ),

        pengajuan_anggota(
            id
        ),

        dokumen(
            file_url
        )

    )
`)
    .eq("pegawai_id", pegawai.id)
    .eq("pengajuan.jenis_pengajuan", "CUTI_TAHUNAN")
    .is("pengajuan.deleted_at", null)
    .order("created_at", { ascending: false });

  tbody.innerHTML = "";

  data.forEach(item => {

    const p = item.pengajuan;

    if (!p) return;

    const jumlahHari =
      p.cuti_tahunan_tanggal.length;

    const tanggal =
      p.cuti_tahunan_tanggal
        .map(t => t.tanggal)
        .join("<br>");

    tbody.innerHTML += `
<tr align="center">

<td>${p.nomor_pengajuan}</td>

<td>${tanggal}</td>

<td>${jumlahHari} Hari</td>

<td>${badgeStatus(p.status)}</td>

<td>${p?.catatan_admin ?? "-"}</td>

<td>

<button
class="btn-lihat-surat"
data-file="${p.dokumen?.[0]?.file_url}"
>

Bukti Persetujuan Atasan

</button>

${p.status === "MENUNGGU"

        ?

        `
<button
class="btn-danger btn-hapus-cuti"
data-id="${p.id}"
>

Hapus

</button>
`

        : ""

      }
${p.status === "SELESAI"

        ?

        `

<button
class="btn-success btn-lihat-form-cuti-tahunan"
data-id="${p.id}">

Lihat Form Cuti

</button>

`

        :

        ""

      }

</td>

</tr>
`;

  });

  tbody.onclick = async (e) => {

    const lihat =
      e.target.closest(".btn-lihat-surat");

    if (lihat) {

      lihatDokumen(

        lihat.dataset.file,

        "persetujuan_atasan"

      );

      return;

    }

    const hapus =
      e.target.closest(
        ".btn-hapus-cuti"
      );

    if (hapus) {

      await hapusPengajuanCutiTahunan(

        Number(
          hapus.dataset.id
        )

      );

      return;

    }

    const btnLihatForm =
      e.target.closest(".btn-lihat-form-cuti-tahunan");

    if (btnLihatForm) {

      await lihatFormCuti(
        Number(btnLihatForm.dataset.id)
      );

      return;

    }

  };
}

function badgeStatus(status) {

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

async function
  loadPegawaiDL() {

  const {

    data,

    error

  } = await supabase

    .from("pegawai")

    .select("id,nama")

    .eq("aktif", true)

    .order("nama");

  if (error) {

    console.log(error);

    return;

  }

  daftarPegawai = data;

}

async function loadDaftarPegawai() {

  const {
    data,
    error
  } = await supabase
    .from("pegawai")
    .select("id,nama")
    .eq("aktif", true)
    .order("nama");

  if (error) {

    console.error(error);

    return;

  }

  daftarPegawai = data;

}

function renderPeserta() {

  const container =
    document.getElementById(
      "pesertaContainer"
    );

  container.className =
    "peserta-container";

  container.innerHTML = "";

  pesertaDipilih.forEach(p => {

    container.innerHTML += `

      <div class="
        peserta-chip
        ${p.isOwner ? "pengaju" : ""}
      ">

        ${p.nama}

        ${p.isOwner
        ?
        `<span>
            (Pengaju)
          </span>`
        :
        `<button
            class="hapusPeserta"
            data-id="${p.id}"
          >

            ✕

          </button>`
      }

      </div>

    `;

  });

  document
    .querySelectorAll(".hapusPeserta")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          pesertaDipilih =
            pesertaDipilih.filter(
              p => p.id != btn.dataset.id
            );

          renderPeserta();

        }
      );

    });

}

function cariPegawai() {

  const keyword =
    document
      .getElementById("cariPegawai")
      .value
      .trim()
      .toLowerCase();

  const hasil =
    document.getElementById(
      "hasilCariPegawai"
    );

  hasil.innerHTML = "";

  if (keyword === "") {

    return;

  }

  const list =
    daftarPegawai.filter(p =>

      p.nama
        .toLowerCase()
        .includes(keyword)

      &&

      !pesertaDipilih.some(x => x.id === p.id)

    );

  list.forEach(p => {

    hasil.innerHTML += `

      <div
        class="hasil-item"
        data-id="${p.id}"
      >

        ${p.nama}

      </div>

    `;

  });

  document
    .querySelectorAll(".hasil-item")
    .forEach(item => {

      item.addEventListener(
        "click",
        tambahPeserta
      );

    });

}

function tambahPeserta(e) {

  const id =
    Number(
      e.target.dataset.id
    );

  const pegawai =
    daftarPegawai.find(
      p => p.id === id
    );

  pesertaDipilih.push({

    id: pegawai.id,

    nama: pegawai.nama,

    isOwner: false

  });

  renderPeserta();

  document
    .getElementById("hasilCariPegawai")
    .innerHTML = "";

  document
    .getElementById("cariPegawai")
    .value = "";

}

async function loadDetailDl(id) {

  const {
    data,
    error
  } = await supabase

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
        pegawai(
          nama
        )
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

  if (dokumen) {

    const { data: signedData, error } = await supabase
      .storage
      .from("surat_dl")
      .createSignedUrl(
        dokumen.file_url,
        60 * 5 // berlaku 5 menit
      );

    if (error) {

      console.error(error);

    } else {

      fileUrl = signedData.signedUrl;

    }

  }

  renderDetailDl(data, fileUrl);

}

function renderDetailDl(data, fileUrl) {

  const detail =
    data.dl_detail[0];

  const dokumen =
    data.dokumen[0];

  const body =
    document.getElementById(
      "detailDlBody"
    );

  body.innerHTML = `

<b>Nomor Pengajuan</b>

<p>

${data.nomor_pengajuan}

</p>

<b>Tanggal DL</b>

<p>

${detail.tanggal_mulai}

${detail.tanggal_selesai
      ? ` s/d ${detail.tanggal_selesai}`
      : ""}

</p>

<b>Status</b>

<p>

${data.status}

</p>

<b>Peserta</b>

<ul>

${data.pengajuan_anggota.map(p => `

<li>

${p.pegawai.nama}

${p.is_pengaju
          ? " (Pengaju)"
          : ""}

</li>

`).join("")}

</ul>

<b>Surat Tugas</b>

<div class="pdf-preview">

<iframe
  src="${fileUrl}"
  width="100%"
  height="500"
  frameborder="0"
>

</iframe>

</div>

`;

  document
    .getElementById(
      "detailDlModal"
    )
    .style.display = "flex";

}

async function hapusPresensi(id) {
  if (!confirm("Yakin ingin menghapus presensi ini?")) {
    return;
  }

  // 1. Cek status presensi terlebih dahulu
  const { data, error } = await supabase
    .from("pengajuan")
    .select("status")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    alert("Gagal memuat data presensi.");
    return;
  }

  // Batasi hanya status tertentu yang boleh dihapus (misal "MENUNGGU" atau "HADIR")
  if (data.status !== "MENUNGGU" && data.status !== "HADIR") {
    alert("Presensi yang sudah divalidasi/diproses tidak dapat dihapus.");
    return;
  }

  // Pastikan variabel pegawaiLogin tersedia, atau ambil ulang jika belum ada
  if (typeof pegawaiLogin === 'undefined' || !pegawaiLogin) {
    const { data: userData } = await supabase.auth.getUser();
    const { data: pegawai } = await supabase
      .from("pegawai")
      .select("id")
      .eq("email", userData.user.email)
      .single();
    pegawaiLogin = pegawai;
  }

  // 2. Lakukan Soft Delete pada tabel "pengajuan"
  const { data: updateData, error: updateError } = await supabase
    .from("pengajuan")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: pegawaiLogin?.id || null,
      delete_reason: "Dihapus oleh pegawai"
    })
    .eq("id", id)
    .select();

  if (updateError) {
    console.error(updateError);
    alert("Gagal menghapus presensi.");
    return;
  }

  if (!updateData || updateData.length === 0) {
    alert("Presensi gagal dihapus (tidak memiliki izin update).");
    return;
  }

  alert("Presensi berhasil dihapus.");

  // 3. Muat ulang tabel riwayat presensi
  if (typeof loadRiwayatPresensi === "function") {
    loadRiwayatPresensi();
  }
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

    alert("Pengajuan tidak dapat dihapus.");

    return;

  }

  const {
    data: updateData,
    error: updateError
  } = await supabase
    .from("pengajuan")
    .update({

      deleted_at: new Date().toISOString(),
      deleted_by: pegawaiLogin.id,
      delete_reason: "Dihapus oleh pengaju"

    })
    .eq("id", id)
    .select();

  if (updateError) {

    console.error(updateError);
    alert("Gagal menghapus.");
    return;

  }

  if (updateData.length === 0) {

    alert("Pengajuan gagal dihapus (tidak memiliki izin update).");

    return;

  }

  const { data: detail } = await supabase

    .from("pengajuan")

    .select(`
      pengajuan_anggota(
          pegawai_id
      ),
      dl_detail(
          tanggal_mulai,
          tanggal_selesai
      )
  `)

    .eq("id", id)

    .single();

  const pegawaiIds =
    detail.pengajuan_anggota.map(
      x => x.pegawai_id
    );

  for (const pegawaiId of pegawaiIds) {

    await refreshKeteranganTKRentang(

      pegawaiId,

      detail.dl_detail[0].tanggal_mulai,

      detail.dl_detail[0].tanggal_selesai

    );

  }

  alert("Pengajuan berhasil dihapus.");

  loadRiwayatDl();

}

async function hapusPengajuanCutiSakit(id) {

  if (!confirm("Yakin ingin menghapus pengajuan ini?")) {

    return;

  }

  const {
    data,
    error
  } = await supabase
    .from("pengajuan")
    .select("status")
    .eq("id", id)
    .single();

  if (error) {

    console.error(error);

    return;

  }

  if (data.status !== "MENUNGGU") {

    alert("Pengajuan tidak dapat dihapus.");

    return;

  }

  const {
    data: updateData,
    error: updateError
  } = await supabase
    .from("pengajuan")
    .update({

      deleted_at: new Date().toISOString(),
      deleted_by: pegawaiLogin.id,
      delete_reason: "Dihapus oleh pengaju"

    })
    .eq("id", id)
    .select();

  if (updateError) {

    console.error(updateError);

    alert("Gagal menghapus.");

    return;

  }

  const {
    data: detail
  } = await supabase

    .from("cuti_sakit_detail")

    .select(`
    tanggal_mulai,
    tanggal_selesai
  `)

    .eq("pengajuan_id", id)

    .single();

  await refreshKeteranganTKRentang(

    pegawaiLogin.id,

    detail.tanggal_mulai,

    detail.tanggal_selesai

  );

  alert("Pengajuan berhasil dihapus.");

  await loadRiwayatCutiSakit();

}

async function hapusPengajuanCutiAlasanPenting(id) {

  if (!confirm("Yakin ingin menghapus pengajuan ini?")) {

    return;

  }

  const {
    data,
    error
  } = await supabase
    .from("pengajuan")
    .select("status")
    .eq("id", id)
    .single();

  if (error) {

    console.error(error);

    return;

  }

  if (data.status !== "MENUNGGU") {

    alert("Pengajuan tidak dapat dihapus.");

    return;

  }

  const {
    data: updateData,
    error: updateError
  } = await supabase
    .from("pengajuan")
    .update({

      deleted_at: new Date().toISOString(),
      deleted_by: pegawaiLogin.id,
      delete_reason: "Dihapus oleh pengaju"

    })
    .eq("id", id)
    .select();

  if (updateError) {

    console.error(updateError);

    alert("Gagal menghapus.");

    return;

  }

  const {
    data: detail
  } = await supabase

    .from("cuti_alasan_penting_detail")

    .select(`
    tanggal_mulai,
    tanggal_selesai
  `)

    .eq("pengajuan_id", id)

    .single();

  await refreshKeteranganTKRentang(

    pegawaiLogin.id,

    detail.tanggal_mulai,

    detail.tanggal_selesai

  );

  alert("Pengajuan berhasil dihapus.");

  await loadRiwayatCutiAlasanPenting();

}

async function hapusPengajuanCutiTahunan(id) {

  if (!confirm("Yakin ingin menghapus pengajuan ini?")) {

    return;

  }

  const {
    data,
    error
  } = await supabase
    .from("pengajuan")
    .select("status")
    .eq("id", id)
    .single();

  if (error) {

    console.error(error);

    return;

  }

  if (data.status !== "MENUNGGU") {

    alert("Pengajuan tidak dapat dihapus.");

    return;

  }

  const {
    data: updateData,
    error: updateError
  } = await supabase
    .from("pengajuan")
    .update({

      deleted_at: new Date().toISOString(),
      deleted_by: pegawaiLogin.id,
      delete_reason: "Dihapus oleh pengaju"

    })
    .eq("id", id)
    .select();

  if (updateError) {

    console.error(updateError);

    alert("Gagal menghapus.");

    return;

  }

  const { data: tanggalCuti } = await supabase

    .from("cuti_tahunan_tanggal")

    .select("tanggal")

    .eq("pengajuan_id", id);

  await refreshKeteranganTKTanggal(

    pegawaiLogin.id,

    tanggalCuti.map(x => x.tanggal)

  );

  alert("Pengajuan berhasil dihapus.");

  await loadRiwayatCutiTahunan();

}

async function lihatFotoPresensi(id) {
  const {
    data,
    error
  } =
    await supabase
      .from("presensi_detail")
      .select("foto_url")
      .eq(
        "pengajuan_id",
        id
      )
      .single();

  if (error) {

    console.error(error);

    return;

  }

  const {
    data: urlData,
    error: urlError
  }
    =
    await supabase
      .storage
      .from("bukti_presensi")
      .createSignedUrl(

        data.foto_url,

        60

      );

  const ext =
    data.foto_url
      .split(".")
      .pop()
      .toLowerCase();

  if (ext === "pdf") {

    window.open(

      urlData.signedUrl,

      "_blank"

    );

    return;

  }

  window.open(

    urlData.signedUrl,

    "_blank"

  );

}

async function lihatSuratCutiSakit(id) {
  const {
    data,
    error
  } =
    await supabase
      .from("dokumen")
      .select("file_url")
      .eq(
        "pengajuan_id",
        id
      )
      .eq("jenis_dokumen", "SURAT_SAKIT")
      .single();

  if (error) {

    console.error(error);

    return;

  }

  const {
    data: urlData,
    error: urlError
  }
    =
    await supabase
      .storage
      .from("surat_sakit")
      .createSignedUrl(

        data.file_url,

        60

      );

  const ext =
    data.file_url
      .split(".")
      .pop()
      .toLowerCase();

  if (ext === "pdf") {

    window.open(

      urlData.signedUrl,

      "_blank"

    );

    return;

  }

  window.open(

    urlData.signedUrl,

    "_blank"

  );

}

async function lihatSuratCutiAlasanPenting(id) {
  const {
    data,
    error
  } =
    await supabase
      .from("dokumen")
      .select("file_url")
      .eq(
        "pengajuan_id",
        id
      )
      .eq("jenis_dokumen", "PERSETUJUAN_ATASAN")
      .single();

  if (error) {

    console.error(error);

    return;

  }

  const {
    data: urlData,
    error: urlError
  }
    =
    await supabase
      .storage
      .from("persetujuan_atasan")
      .createSignedUrl(

        data.file_url,

        60

      );

  const ext =
    data.file_url
      .split(".")
      .pop()
      .toLowerCase();

  if (ext === "pdf") {

    window.open(

      urlData.signedUrl,

      "_blank"

    );

    return;

  }

  window.open(

    urlData.signedUrl,

    "_blank"

  );

}

function refreshTanggalDipilih() {

  const events =
    tanggalCutiDipilih.map(tanggal => ({

      id: tanggal,

      start: tanggal,

      allDay: true,

      display: "background",

      color: "#2563eb"

    }));

  calendarCuti.removeAllEvents();

  calendarCuti.addEventSource(events);

  document.getElementById(
    "totalHari"
  ).textContent =
    tanggalCutiDipilih.length;

  document.getElementById(
    "tanggalDipilih"
  ).innerHTML =
    tanggalCutiDipilih
      .sort()
      .join("<br>");

}

async function lihatDokumen(filePath, bucket) {

  const { data, error } = await supabase
    .storage
    .from(bucket)
    .createSignedUrl(filePath, 60);

  if (error) {
    console.error(error);
    alert("Gagal membuka dokumen.");
    return;
  }

  window.open(data.signedUrl, "_blank");

}

async function loadSaldoCutiTahunan() {

  await supabase.rpc(

    "rollover_saldo_cuti",

    {

      p_pegawai_id:

        pegawaiLogin.id

    }

  );

  const {

    data,

    error

  } = await supabase.rpc(

    "get_saldo_cuti",

    {

      p_pegawai_id:

        pegawaiLogin.id

    }

  );

  if (error) {

    console.error(error);

    return;

  }

  const tahunSekarang =
    new Date().getFullYear();

  const n =
    data.find(
      x => x.tahun === tahunSekarang
    )?.sisa ?? 0;

  const n1 =
    data.find(
      x => x.tahun === tahunSekarang - 1
    )?.sisa ?? 0;

  const n2 =
    data.find(
      x => x.tahun === tahunSekarang - 2
    )?.sisa ?? 0;

  const total =
    n + n1 + n2;

  window.totalSaldoCuti = total;

  document
    .getElementById(
      "saldoCutiTahunan"
    ).innerHTML = `

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

function initSidebar() {

  const layout =
    document.querySelector(".layout");

  const btn =
    document.getElementById("toggleSidebar");

  if (!layout || !btn) {

    return;

  }

  // Restore status sebelumnya
  if (localStorage.getItem("sidebar") === "collapsed") {

    layout.classList.add("collapsed");

  }

  btn.onclick = () => {

    layout.classList.toggle("collapsed");

    localStorage.setItem(

      "sidebar",

      layout.classList.contains("collapsed")

        ? "collapsed"

        : "expanded"

    );

  };

}

async function initReviewPengajuan() {

  await loadReviewPengajuan();

  document
    .getElementById("reviewPengajuanBody")
    .onclick = async (e) => {

      // ================================ // TOMBOL REVIEW // ================================ 
      const btnReview = e.target.closest(".btn-detail-review");
      if (btnReview) {
        await bukaDetailPengajuan(
          Number(btnReview.dataset.id)
        );
        return;
      }

      // ================================ // TOMBOL HAPUS // ================================ 
      const btnHapus = e.target.closest(".btn-hapus-pengajuan");
      if (btnHapus) {
        await hapusPengajuan(
          Number(btnHapus.dataset.id)
        );
        return;
      }
    };

  document
    .getElementById("btnDisetujui")
    .onclick = async () => {

      await approvePengajuan(
        window.currentPengajuanId
      );

    };

  document
    .getElementById("btnTolak")
    .onclick = () => {

      document
        .getElementById("modalTolak")
        .showModal();

    };

  document

    .getElementById("btnBatalTolak")

    .onclick = () => {

      document

        .getElementById("modalTolak")

        .close();

    };

  document

    .getElementById("btnSimpanTolak")

    .onclick = async () => {

      const alasan =

        document

          .getElementById("txtAlasanTolak")

          .value.trim();

      if (!alasan) {

        alert("Alasan penolakan wajib diisi.");

        return;

      }

      await tolakPengajuan(

        window.currentPengajuanId,

        alasan

      );

    };

}

async function loadReviewPengajuan() {

  const tbody = document.getElementById(
    "reviewPengajuanBody"
  );

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
        pegawai(
          nama
        )
      ),

      cuti_tahunan_tanggal(
        tanggal
      ),

      cuti_sakit_detail(
      tanggal_mulai,
      tanggal_selesai,
      jumlah_hari
      ),

      cuti_alasan_penting_detail(
      tanggal_mulai,
      tanggal_selesai,
      jumlah_hari
      )
    `)
    .eq("pengajuan_anggota.is_pengaju", true)
    .in("jenis_pengajuan", ["CUTI_TAHUNAN", "CUTI_SAKIT", "CUTI_ALASAN_PENTING"])
    .is("deleted_at", null)
    .order("created_at", {
      ascending: false
    });


  if (error) {

    console.error(error);

    tbody.innerHTML = `
      <tr>

        <td colspan="7">

          Gagal memuat data

        </td>

      </tr>
    `;

    return;

  }

  const urutanStatus = {
    "MENUNGGU": 1,
    "DIPROSES": 2,
    "DISETUJUI": 3,
    "DITOLAK": 4,
    "SELESAI": 5
  };

  data.sort((a, b) => {

    const statusA = urutanStatus[a.status] ?? 99;
    const statusB = urutanStatus[b.status] ?? 99;

    if (statusA !== statusB) {
      return statusA - statusB;
    }

    // Status sama → gunakan urutan created_at dari Supabase
    return 0;
  });
  tbody.innerHTML = "";

  data.forEach(item => {

    const pegawai =
      item.pengajuan_anggota?.[0]?.pegawai?.nama ?? "-";

    const jenis =
      item.jenis_pengajuan === "CUTI_TAHUNAN"

        ? "Cuti Tahunan"

        : item.jenis_pengajuan === "CUTI_SAKIT"

          ? "Cuti Sakit"

          : "Cuti Alasan Penting";

    let tanggal = "-";

    if (item.jenis_pengajuan == "CUTI_TAHUNAN") {
      const list = item.cuti_tahunan_tanggal ?? [];

      if (list.length > 0) {

        const awal = list[0].tanggal;
        const akhir = list[list.length - 1].tanggal;

        tanggal = `${awal}<br>s.d.<br>${akhir}`;

      }

    } else if (item.jenis_pengajuan == "CUTI_SAKIT") {

      const cs =
        item.cuti_sakit_detail?.[0];

      if (cs) {

        tanggal =
          `${cs.tanggal_mulai}
        <br>
        s.d.
        <br>
        ${cs.tanggal_selesai}`;

      }

    } else if (item.jenis_pengajuan == "CUTI_ALASAN_PENTING") {
      const cap =
        item.cuti_alasan_penting_detail?.[0];

      if (cap) {

        tanggal =
          `${cap.tanggal_mulai}
            <br>
            s.d.
            <br>
            ${cap.tanggal_selesai}`;

      }
    }

    tbody.innerHTML += `

<tr align="center">

<td>${item.nomor_pengajuan}</td>

<td>${pegawai}</td>

<td>${jenis}</td>

<td>${tanggal}</td>

<td>${badgeStatus(item.status)}</td>

<td>${item.catatan_admin ?? "-"}</td>

<td>

<button
class="btn-detail-review"
data-id="${item.id}">

Detail

</button>

<button
class="btn-hapus-pengajuan"
data-id="${item.id}">

Hapus

</button>

</td>

</tr>

`;

  });

}

async function bukaDetailPengajuan(id) {

  window.currentPengajuanId = id;

  const { data, error } =
    await supabase

      .from("pengajuan")

      .select(`
        id,
        status,
        jenis_pengajuan
    `)

      .eq("id", id)

      .single();

  if (error) {

    console.error(error);

    return;

  }

  if (data.status == "MENUNGGU") {

    await updateStatusPengajuan(id, "DIPROSES", "Dokumen sedang diverifikasi.");

  }

  await loadReviewPengajuan();

  await isiModalDetail(id);

  const modal = document.getElementById("modalDetailPengajuan");

  document.getElementById("btnCloseModal").onclick = () => {
    modal.close();
  };

  document
    .getElementById("modalDetailPengajuan")
    .addEventListener("cancel", (e) => {

      e.preventDefault();

      document
        .getElementById("modalDetailPengajuan")
        .close();

    });

  document
    .getElementById("modalDetailPengajuan")
    .showModal();

}

async function hapusPengajuan(id) {
  window.currentPengajuanId = id;

  if (!confirm("Yakin ingin menghapus pengajuan ini?")) {
    return;
  }

  const { error } = await supabase
    .from("pengajuan")
    .update({
      deleted_at: new Date(),
      delete_reason: "Dihapus oleh admin"
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Gagal menghapus pengajuan.");
    return;
  }

  alert("Pengajuan berhasil dihapus.");
  await loadReviewPengajuan(); // Reload the list of applications
}

async function updateStatusPengajuan(

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

async function isiModalDetail(id) {

  const { data, error } = await supabase

    .from("pengajuan")

    .select(`

        *,

        pengajuan_anggota!inner(

            pegawai(

                nama

            )

        ),

        cuti_tahunan_detail(*),

        cuti_tahunan_tanggal(*),

        cuti_sakit_detail(*),

        cuti_alasan_penting_detail(*),

        dokumen(*)

    `)

    .eq("id", id)

    .single();

  if (error) {

    console.error(error);

    return;

  }
  window.currentNamaPegawai = data.pengajuan_anggota[0].pegawai.nama;

  const formTTD =
    data.dokumen.find(
      d => d.jenis_dokumen === "FORM_CUTI_TTD"
    );

  const previewFormTTD =
    document.getElementById("previewFormTTD");

  const cardpreviewFormTTD =
    document.getElementById("card-preview-ttd");

  const btnDownload =
    document.getElementById("btnDownloadForm");

  const btnTTD =
    document.getElementById("btnSudahDitandatangani");

  const btnSetujui =
    document.getElementById("btnDisetujui");

  const btnTolak =
    document.getElementById("btnTolak");

  if (formTTD) {

    btnDownload.style.display = "none";
    btnTTD.style.display = "none";

    btnSetujui.style.display = "none";
    btnTolak.style.display = "none";

    cardpreviewFormTTD.style.display = "block";
    previewFormTTD.style.display = "block"

  } else {

    cardpreviewFormTTD.style.display = "none";

    if (
      data.catatan_admin === "Dokumen disetujui" ||
      data.catatan_admin === "Dokumen sedang dalam penyusunan dan diajukan untuk penandatanganan." ||
      data.catatan_admin === "Proses perubahan status presensi."
    ) {

      btnDownload.style.display = "inline-block";
      btnTTD.style.display = "inline-block";

      btnSetujui.style.display = "none";
      btnTolak.style.display = "none";

    } else {

      btnDownload.style.display = "none";
      btnTTD.style.display = "none";

      btnSetujui.style.display = "inline-block";
      btnTolak.style.display = "inline-block";
    }

  }

  if (data.status === "SELESAI") {
    btnDownload.style.display = "none";
    btnTTD.style.display = "none";

    btnTolak.style.display = "none";
    btnSetujui.style.display = "none";
  }

  document.getElementById("detailNomor").textContent =
    data.nomor_pengajuan;

  document.getElementById("detailNama").textContent =
    data.pengajuan_anggota[0].pegawai.nama;

  document.getElementById("detailJenis").textContent =
    data.jenis_pengajuan.replaceAll("_", " ");

  document.getElementById("detailStatus").textContent =
    data.status;

  document.getElementById("detailCatatan").textContent =
    data.catatan_admin ?? "-";


  const card =
    document.getElementById("cardDataCuti");

  if (data.jenis_pengajuan == "CUTI_TAHUNAN") {

    const detail =
      data.cuti_tahunan_detail[0];

    const tanggal =
      data.cuti_tahunan_tanggal
        .map(x => x.tanggal)
        .join("<br>");

    card.innerHTML = `

        <div class="card-title">

            📅 Data Cuti Tahunan

        </div>

        <table class="table-detail">

            <tr>

                <td>Alasan</td>

                <td>${detail.alasan}</td>

            </tr>

            <tr>

                <td>Alamat Selama Cuti</td>

                <td>${detail.alamat_cuti}</td>

            </tr>

            <tr>

                <td>Tanggal Cuti</td>

                <td>${tanggal}</td>

            </tr>

        </table>

        `;

  } else if (data.jenis_pengajuan == "CUTI_SAKIT") {

    const detail =
      data.cuti_sakit_detail[0];

    card.innerHTML = `

        <div class="card-title">

            🩺 Data Cuti Sakit

        </div>

        <table class="table-detail">

            <tr>

                <td>Tanggal Mulai</td>

                <td>${detail.tanggal_mulai}</td>

            </tr>

            <tr>

                <td>Tanggal Selesai</td>

                <td>${detail.tanggal_selesai}</td>

            </tr>

            <tr>

                <td>Jumlah Hari</td>

                <td>${detail.jumlah_hari} Hari</td>

            </tr>

        </table>

        `;

  } else if (data.jenis_pengajuan == "CUTI_ALASAN_PENTING") {
    const detail =
      data.cuti_alasan_penting_detail[0];

    card.innerHTML = `

        <div class="card-title">

            Data Cuti Alasan Penting

        </div>

        <table class="table-detail">

            <tr>

                <td>Tanggal Mulai</td>

                <td>${detail.tanggal_mulai}</td>

            </tr>

            <tr>

                <td>Tanggal Selesai</td>

                <td>${detail.tanggal_selesai}</td>

            </tr>

            <tr>

                <td>Jumlah Hari</td>

                <td>${detail.jumlah_hari} Hari</td>

            </tr>

        </table>

        `;
  }


  const preview =
    document.getElementById("previewDokumen");

  // Tidak ada dokumen
  if (!data.dokumen || data.dokumen.length === 0) {

    preview.innerHTML = `
        <center>Belum ada dokumen.</center>
    `;

    return;
  }

  const dokumen = data.dokumen[0];

  const bucket =
    data.jenis_pengajuan == "CUTI_SAKIT"
      ? "surat_sakit"
      : "persetujuan_atasan";

  // Membuat signed URL (berlaku 10 menit)
  const { data: signed, error: signedError } =
    await supabase.storage
      .from(bucket)
      .createSignedUrl(
        dokumen.file_url,
        600
      );

  if (signedError) {

    console.error(signedError);

    preview.innerHTML = `
        <center>Gagal memuat dokumen.</center>
    `;

    return;
  }

  const fileUrl = signed.signedUrl;

  const ext =
    dokumen.file_url
      .split(".")
      .pop()
      .toLowerCase();

  if (ext == "pdf") {

    preview.innerHTML = `
        <iframe
            src="${fileUrl}"
            class="preview-file">
        </iframe>
    `;

  } else {

    let rotate = 0;

    preview.innerHTML = `
    <div class="preview-toolbar">

        <button id="btnRotateLeft">
            ↺ Putar Kiri
        </button>

        <button id="btnRotateRight">
            Putar Kanan ↻
        </button>

    </div>

    <div class="preview-wrapper">

        <img
            id="previewImg"
            src="${fileUrl}"
            class="preview-image"
            alt="Dokumen Pendukung">

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

  if (formTTD) {
    const { data: signedTTD } =
      await supabase.storage
        .from("form_cuti_ttd")
        .createSignedUrl(formTTD.file_url, 600);

    previewFormTTD.innerHTML = `
<iframe
    src="${signedTTD.signedUrl}"
    class="preview-file">
</iframe>
`;
  }

  document
    .getElementById("btnDownloadForm")
    .onclick = async () => {

      try {

        await generateFormCuti(id);

        await loadReviewPengajuan();

        await isiModalDetail(id);

      } catch (err) {

        console.error(err);

        alert("Gagal membuat dokumen.");

      }

    };

  document
    .getElementById("btnSudahDitandatangani")
    .onclick = () => {

      window.currentPengajuanIdTTD =
        window.currentPengajuanId;

      document
        .getElementById("modalUploadTTD")
        .showModal();

    };

  document
    .getElementById("btnUploadTTD")
    .onclick = uploadFormTTD;

}

async function uploadFormTTD() {

  const file =
    document
      .getElementById("fileTTD")
      .files[0];

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

  const uuid =
    crypto.randomUUID().split("-")[0]; // 8 karakter

  const nama =
    window.currentNamaPegawai
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^A-Za-z0-9_]/g, "");

  const fileName =
    `CUTI_${nama}_${stamp}_${uuid}.pdf`;

  const { error } =
    await supabase.storage

      .from("form_cuti_ttd")

      .upload(fileName, file, {

        upsert: true

      });

  if (error) {

    alert(error.message);

    console.error(error);

    return;

  }

  const payload = {
    pengajuan_id: window.currentPengajuanIdTTD,
    jenis_dokumen: "FORM_CUTI_TTD",
    file_url: fileName
  };

  const { data, errorpayload } = await supabase
    .from("dokumen")
    .insert(payload)
    .select();

  // 3. Update pengajuan
  await sudahDitandatangani(window.currentPengajuanIdTTD);

}

async function sudahDitandatangani(id) {

  const { error } = await supabase

    .from("pengajuan")

    .update({

      status: "DISETUJUI",

      catatan_admin:
        "Proses perubahan status presensi."

    })

    .eq("id", id);

  if (error) {

    alert(error.message);

    console.error(error);

    return;

  }

  // ===== UPDATE TK =====

  const { data, error: detailError } = await supabase

    .from("pengajuan")

    .select(`
      jenis_pengajuan,

      pengajuan_anggota(
        pegawai_id,
        is_pengaju
      ),

      cuti_sakit_detail(
        tanggal_mulai,
        tanggal_selesai
      ),

      cuti_tahunan_tanggal(
        tanggal
      )
    `)

    .eq("id", id)

    .single();

  if (!detailError) {

    const pegawaiId =
      data.pengajuan_anggota.find(x => x.is_pengaju).pegawai_id;

    if (data.jenis_pengajuan === "CUTI_SAKIT") {

      await updateTKBerdasarkanRentangTanggal(

        [pegawaiId],

        data.cuti_sakit_detail[0].tanggal_mulai,

        data.cuti_sakit_detail[0].tanggal_selesai,

        KETERANGAN_TK.CUTISAKIT

      );

    } else if (data.jenis_pengajuan === "CUTI_TAHUNAN") {

      await updateTKKarenaCutiTahunan(

        [pegawaiId],

        data.cuti_tahunan_tanggal.map(x => x.tanggal),

        KETERANGAN_TK.CUTITAHUNAN

      );

    }

  }

  // =====================

  document
    .getElementById("modalUploadTTD")
    .close();

  await loadReviewPengajuan();

  await isiModalDetail(id);

}

function hitungMasaKerja(nip) {

  const tahunPengangkatan =
    Number(nip.substring(8, 12));

  const sekarang =
    new Date().getFullYear();

  return `${sekarang - tahunPengangkatan} Tahun`;

}

function formatTanggal(tanggal) {

  return new Date(tanggal)
    .toLocaleDateString("id-ID", {

      day: "numeric",

      month: "long",

      year: "numeric"

    });

}

function namaJenisCuti(jenis) {

  return jenis == "CUTI_TAHUNAN"
    ? "CUTI TAHUNAN"
    : "CUTI SAKIT";

}

async function approvePengajuan(id) {

  const { error } = await supabase.rpc(

    "approve_pengajuan",

    {

      p_pengajuan_id: id

    }

  );

  if (error) {

    alert(error.message);

    console.error(error);

    return;

  }

  document
    .getElementById("modalDetailPengajuan")
    .close();

  await loadReviewPengajuan();

  // Muat ulang isi modal
  await isiModalDetail(id);

}

async function tolakPengajuan(id, alasan) {

  const { error } =

    await supabase

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

  document
    .getElementById("modalTolak")
    .close();

  document
    .getElementById("modalDetailPengajuan")
    .close();

  document
    .getElementById("txtAlasanTolak")
    .value = "";

  await loadReviewPengajuan();

}

async function updateSaldoCuti(pegawaiId, jumlahHari) {

  const { error } = await supabase.rpc(

    "kurangi_saldo_cuti",

    {

      p_pegawai_id: pegawaiId,

      p_jumlah_hari: jumlahHari

    }

  );

  if (error) {

    throw error;

  }

}

window.loadDashboardAdminCuti = async function () {


  const div = document.getElementById("dashboardAdminCuti");

  if (div) {

    div.hidden = false;

  }

  const { data: menunggu } =
    await supabase

      .from("pengajuan")

      .select(`
    nomor_pengajuan,
    created_at,
    jenis_pengajuan,
    pengajuan_anggota!inner(
        pegawai(
            nama
        )
    )
`)
      .eq("status", "MENUNGGU")
      .in("jenis_pengajuan", [
        "CUTI_TAHUNAN",
        "CUTI_SAKIT"
      ])
      .is("deleted_at", null)
      .order("created_at", { ascending: true })

      .limit(5);

  const { data: diproses } =
    await supabase

      .from("pengajuan")

      .select(`
    nomor_pengajuan,
    created_at,
    jenis_pengajuan,
    pengajuan_anggota!inner(
        pegawai(
            nama
        )
    )
`)
      .eq(
        "catatan_admin",
        ["Dokumen sedang dalam penyusunan dan diajukan untuk penandatanganan.", "Dokumen disetujui"]
      )
      .in("jenis_pengajuan", [
        "CUTI_TAHUNAN",
        "CUTI_SAKIT"
      ])

      .order("created_at", { ascending: true })

      .limit(5);

  renderDashboardTable(
    menunggu,
    "dashboardMenungguBody"
  );

  renderDashboardTable(
    diproses,
    "dashboardDiprosesBody"
  );

  await loadUlangTahunBulanIni();

  document
    .getElementById("btnReviewSemua1")
    .onclick = () => {

      navigate("reviewPengajuan");

    };

  document
    .getElementById("btnReviewSemua2")
    .onclick = () => {

      navigate("reviewPengajuan");

    };
}

window.loadDashboardAdminPresensi = async function () {

  const div = document.getElementById("dashboardAdminPresensi");

  if (div) {
    div.hidden = false;
  }

  const { data: menunggu } =
    await supabase

      .from("pengajuan")

      .select(`
    nomor_pengajuan,
    created_at,
    jenis_pengajuan,
    pengajuan_anggota!inner(
        pegawai(
            nama
        )
    )
`)
      .in("status", ["MENUNGGU", "DIPROSES"])
      .in("jenis_pengajuan", [
        "DL"
      ])
      .is("deleted_at", null)
      .order("created_at", { ascending: true })

      .limit(5);

  const { data: diproses } =
    await supabase

      .from("pengajuan")

      .select(`
    nomor_pengajuan,
    created_at,
    jenis_pengajuan,
    pengajuan_anggota!inner(
        pegawai(
            nama
        )
    )
`)
      .eq("status", "DISETUJUI")
      .in("jenis_pengajuan", [
        "CUTI_TAHUNAN",
        "CUTI_SAKIT"
      ])
      .is("deleted_at", null)
      .order("created_at", { ascending: true })

      .limit(5);

  renderDashboardTable(
    menunggu,
    "dashboardMenungguPresensiBody"
  );

  renderDashboardTable(
    diproses,
    "dashboardDiprosesPresensiBody"
  );

  await loadUlangTahunBulanIni();

  document
    .getElementById("btnReviewSemua3")
    .onclick = () => {

      navigate("reviewPresensiDL");

    };

  document
    .getElementById("btnReviewSemua4")
    .onclick = () => {

      navigate("reviewPresensiCuti");

    };
}

function renderDashboardTable(data, tbodyId) {

  const tbody =
    document.getElementById(tbodyId);

  if (data.length == 0) {

    tbody.innerHTML = `

        <tr>

            <td colspan="4">

                Tidak ada data.

            </td>

        </tr>

        `;

    return;

  }

  tbody.innerHTML = data.map(x => `

    <tr align="center">

        <td>${x.nomor_pengajuan}</td>

        <td>${x.pengajuan_anggota[0].pegawai.nama}</td>

        <td>${x.jenis_pengajuan.replaceAll("_", " ")}</td>

        <td>${new Date(x.created_at).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  })}</td>

    </tr>

    `).join("");

}

async function importPegawaiExcel(e) {

  const file = e.target.files[0];

  if (!file) return;

  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer);

  const sheet =
    workbook.Sheets[
    workbook.SheetNames[0]
    ];

  const rows =
    XLSX.utils.sheet_to_json(sheet);

  let berhasil = 0;
  let gagal = 0;

  const daftarError = [];

  for (const row of rows) {

    try {

      await createPegawai({

        nip: row.nip?.toString().trim(),
        nama: row.nama?.trim(),
        jabatan: row.jabatan?.trim(),
        pangkatgol: row.pangkatgol?.trim(),
        nohp: row.nohp?.toString().trim(),
        unit_kerja: row.unit_kerja?.trim(),
        role: row.role?.trim(),
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

  }

  console.table(daftarError);

  alert(
    `Import selesai

Berhasil : ${berhasil}

Gagal : ${gagal}`
  );

  loadPegawai();

}

window.initSaldoCuti = async function () {

  await loadSaldoCuti();

  document
    .querySelectorAll(".btnEditSaldo")
    .forEach(btn => {

      btn.onclick = () => {

        const tahun = new Date().getFullYear();

        document.getElementById("labelSaldoN").textContent =
          `Saldo Tahun ${tahun}`;

        document.getElementById("labelSaldoN1").textContent =
          `Saldo Tahun ${tahun - 1}`;

        document.getElementById("labelSaldoN2").textContent =
          `Saldo Tahun ${tahun - 2}`;

        document.getElementById("pegawaiIdSaldo").value =
          btn.dataset.id;

        document.getElementById("namaSaldo").value =
          btn.dataset.nama;

        document.getElementById("saldoN").value =
          btn.dataset.n;

        document.getElementById("saldoN1").value =
          btn.dataset.n1;

        document.getElementById("saldoN2").value =
          btn.dataset.n2;

        document.getElementById("modalSaldo").style.display = "flex";

      };

    });

  document.getElementById("btnBatalSaldo").onclick = () => {

    document.getElementById("modalSaldo").style.display = "none";

  };

  document.getElementById("btnSimpanSaldo").onclick = async () => {

    const id = Number(document.getElementById("pegawaiIdSaldo").value);

    const saldoN = Number(document.getElementById("saldoN").value);

    const saldoN1 = Number(document.getElementById("saldoN1").value);

    const saldoN2 = Number(document.getElementById("saldoN2").value);

    const { error } = await supabase.rpc("save_saldo_cuti", {
      p_pegawai_id: id,
      p_saldo_n: saldoN,
      p_saldo_n1: saldoN1,
      p_saldo_n2: saldoN2
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Saldo cuti berhasil diperbarui.");

    document.getElementById("modalSaldo").style.display = "none";

    loadSaldoCuti();

  };

  document
    .getElementById("searchSaldo")
    .addEventListener("input", () => {

      loadSaldoCuti();

    });
}

async function loadSaldoCuti() {
  const tahun = new Date().getFullYear();

  document.getElementById("tabelSaldoN").textContent =
    `Tahun ${tahun}`;

  document.getElementById("tabelSaldoN1").textContent =
    `Tahun ${tahun - 1}`;

  document.getElementById("tabelSaldoN2").textContent =
    `Tahun ${tahun - 2}`;

  const { data, error } =
    await supabase.rpc("get_saldo_cuti");

  const keyword =
    document
      .getElementById("searchSaldo")
      ?.value
      ?.trim()
      ?.toLowerCase() || "";

  if (error) {

    console.error(error);
    return;

  }

  const tbody =
    document.getElementById("tbodySaldoCuti");

  tbody.innerHTML = "";

  const filtered = data.filter(p => {

    return (

      p.nama
        ?.toLowerCase()
        .includes(keyword)

      ||

      p.nip
        ?.includes(keyword)

    );

  });

  if (filtered.length === 0) {

    tbody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;">
                Data tidak ditemukan
            </td>
        </tr>
    `;

    return;

  }

  filtered.forEach(p => {

    tbody.innerHTML += `
    <tr>
        <td align="center">${p.nip}</td>
        <td>${p.nama}</td>
        <td align="center">${p.n2}</td>
        <td align="center">${p.n1}</td>
        <td align="center">${p.n}</td>
        <td>
            <button
                class="btn btn-sm btn-primary btnEditSaldo"
                data-id="${p.pegawai_id}"
                data-nama="${p.nama}"
                data-n="${p.n}"
                data-n1="${p.n1}"
                data-n2="${p.n2}">
                Edit
            </button>
        </td>
    </tr>
    `;

  });

  document
    .querySelectorAll(".btnEditSaldo")
    .forEach(btn => {

      btn.onclick = () => {

        const tahun = new Date().getFullYear();

        document.getElementById("labelSaldoN").textContent =
          `Saldo Tahun ${tahun}`;

        document.getElementById("labelSaldoN1").textContent =
          `Saldo Tahun ${tahun - 1}`;

        document.getElementById("labelSaldoN2").textContent =
          `Saldo Tahun ${tahun - 2}`;

        document.getElementById("pegawaiIdSaldo").value =
          btn.dataset.id;

        document.getElementById("namaSaldo").value =
          btn.dataset.nama;

        document.getElementById("saldoN").value =
          btn.dataset.n;

        document.getElementById("saldoN1").value =
          btn.dataset.n1;

        document.getElementById("saldoN2").value =
          btn.dataset.n2;

        document.getElementById("modalSaldo").style.display = "flex";

      };

    });

}

window.initReviewPresensiCuti = async function () {

  await loadReviewPresensiCuti();

  document
    .getElementById("reviewPengajuanBody")
    .onclick = async (e) => {

      const btnLihat =
        e.target.closest(".btnLihatSurat");

      if (btnLihat) {

        await lihatSuratTTD(
          btnLihat.dataset.id
        );

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
        alert(error.message);
        return;
      }

      await loadReviewPresensiCuti();

    };

}

async function lihatSuratTTD(pengajuanId) {

  const { data, error } = await supabase

    .from("dokumen")

    .select("file_url")

    .eq("pengajuan_id", pengajuanId)

    .eq("jenis_dokumen", "FORM_CUTI_TTD")

    .single();

  if (error) {

    alert("Dokumen tidak ditemukan.");

    return;

  }

  const { data: signed, error: signedError } =
    await supabase.storage

      .from("form_cuti_ttd")

      .createSignedUrl(
        data.file_url,
        600
      );

  if (signedError) {

    alert("Gagal membuka dokumen.");

    return;

  }

  window.open(
    signed.signedUrl,
    "_blank"
  );

}

async function lihatSuratTugas(pengajuanId) {

  const { data, error } = await supabase

    .from("dokumen")

    .select("file_url")

    .eq("pengajuan_id", pengajuanId)

    .eq("jenis_dokumen", "SURAT_TUGAS")

    .single();

  if (error) {

    alert("Dokumen tidak ditemukan.");

    return;

  }

  const { data: signed, error: signedError } =
    await supabase.storage

      .from("surat_dl")

      .createSignedUrl(
        data.file_url,
        600
      );

  if (signedError) {

    alert("Gagal membuka dokumen.");

    return;

  }

  window.open(
    signed.signedUrl,
    "_blank"
  );

}

async function loadReviewPresensiCuti() {

  const tbody = document.getElementById(
    "reviewPengajuanBody"
  );

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
        pegawai(
          nama
        )
      ),

      cuti_tahunan_tanggal(
        tanggal
      ),

      cuti_sakit_detail(
          tanggal_mulai,
          tanggal_selesai,
          jumlah_hari
      ),

      cuti_alasan_penting_detail(
          tanggal_mulai,
          tanggal_selesai,
          jumlah_hari
      )
    `)
    .in("status", ["DISETUJUI", "SELESAI"])
    .in("jenis_pengajuan", ["CUTI_TAHUNAN", "CUTI_SAKIT", "CUTI_ALASAN_PENTING"])
    .is("deleted_at", null);

  data.forEach(p => {

    if (p.jenis_pengajuan === "CUTI_TAHUNAN") {

      p.tanggal_awal =
        p.cuti_tahunan_tanggal
          ?.map(x => x.tanggal)
          ?.sort()[0];

    } else if (p.jenis_pengajuan === "CUTI_SAKIT") {

      p.tanggal_awal =
        p.cuti_sakit_detail?.tanggal_mulai;

    } else if (p.jenis_pengajuan === "CUTI_ALASAN_PENTING") {

      p.tanggal_awal =
        p.cuti_alasan_penting_detail?.tanggal_mulai;

    }

  });

  const urutanStatus = {
    "MENUNGGU": 1,
    "DIPROSES": 2,
    "DISETUJUI": 3,
    "DITOLAK": 4,
    "SELESAI": 5
  };

  data.sort((a, b) => {

    const statusA =
      urutanStatus[a.status] ?? 99;

    const statusB =
      urutanStatus[b.status] ?? 99;

    if (statusA !== statusB) {
      return statusA - statusB;
    }

    const tglA = ambilTanggalPengajuan(a);
    const tglB = ambilTanggalPengajuan(b);

    return new Date(tglB) - new Date(tglA);

  });

  if (error) {

    console.error(error);

    tbody.innerHTML = `
      <tr>

        <td colspan="7">

          Gagal memuat data

        </td>

      </tr>
    `;

    return;

  }

  tbody.innerHTML = "";

  data.forEach(item => {

    const pegawai =
      item.pengajuan_anggota?.[0]?.pegawai?.nama ?? "-";

    const jenis =
      item.jenis_pengajuan === "CUTI_TAHUNAN"

        ? "Cuti Tahunan"

        : item.jenis_pengajuan === "CUTI_SAKIT"

          ? "Cuti Sakit"

          : "Cuti Alasan Penting";

    let tanggal = "-";

    if (item.jenis_pengajuan == "CUTI_TAHUNAN") {
      const list = item.cuti_tahunan_tanggal ?? [];

      if (list.length > 0) {

        const awal = list[0].tanggal;
        const akhir = list[list.length - 1].tanggal;

        tanggal = `${awal}<br>s.d.<br>${akhir}`;

      }

    } else if (item.jenis_pengajuan === "CUTI_SAKIT") {

      const cs =
        item.cuti_sakit_detail?.[0];

      if (cs) {

        tanggal =
          `${cs.tanggal_mulai}
        <br>
        s.d.
        <br>
        ${cs.tanggal_selesai}`;

      }

    } else if (item.jenis_pengajuan === "CUTI_ALASAN_PENTING") {

      const cap =
        item.cuti_alasan_penting_detail?.[0];

      if (cap) {

        tanggal =
          `${cap.tanggal_mulai}
        <br>
        s.d.
        <br>
        ${cap.tanggal_selesai}`;

      }

    }

    tbody.innerHTML += `

<tr align="center">

<td>${item.nomor_pengajuan}</td>

<td>${pegawai}</td>

<td>${jenis}</td>

<td>${tanggal}</td>

<td>${badgeStatus(item.status)}</td>

<td>${item.catatan_admin ?? "-"}</td>

<td>

    <button
        class="btnLihatSurat"
        data-id="${item.id}">

        📄 Lihat Surat

    </button>

${item.status === "SELESAI"

        ? `
<button
class="btn btn-success"
disabled>
✔ Sudah Diproses
</button>
`

        : `
<button
class="btn btn-primary btnSelesai"
data-id="${item.id}">
Tandai Selesai
</button>
`
      }

</td>

</tr>

`;

  });

}

window.initReviewPresensiDL = async function () {

  await loadReviewPresensiDL();

  document
    .getElementById("reviewPresensiDlBody")
    .onclick = async (e) => {

      const btnLihat =
        e.target.closest(".btn-lihat-surtug");

      if (btnLihat) {

        await lihatSuratTugas(
          btnLihat.dataset.id
        );

        return;

      }

      const btn =
        e.target.closest(".btn-detail-review");

      if (!btn) return;

      await bukaDetailPresensiDL(

        Number(btn.dataset.id)

      );

    };

  document
    .getElementById("btnSetujuiDl")
    .onclick = async () => {

      await approvePresensiDL(
        window.currentPengajuanId
      );

      const { data, error } = await supabase
        .from("pengajuan")
        .select(`
      pengajuan_anggota(
          pegawai_id
      ),
      dl_detail(
          tanggal_mulai,
          tanggal_selesai
      )
         `)
        .eq("id", window.currentPengajuanId)
        .single();

      if (error) {
        console.error(error);
      }

      const pegawaiIds =
        data.pengajuan_anggota.map(x => x.pegawai_id);

      const tanggalMulai =
        data.dl_detail[0].tanggal_mulai;

      const tanggalSelesai =
        data.dl_detail[0].tanggal_selesai;

      await updateTKBerdasarkanRentangTanggal(

        pegawaiIds,

        tanggalMulai,

        tanggalSelesai,

        KETERANGAN_TK.DL

      );
    };

  document
    .getElementById("btnTolakDl")
    .onclick = () => {

      document
        .getElementById("modalTolakDl")
        .showModal();

    };

  document
    .getElementById("btnBatalTolakDl")
    .onclick = () => {

      document
        .getElementById("modalTolakDl")
        .close();

    };

  document
    .getElementById("btnSimpanTolakDl")
    .onclick = async () => {

      const alasan =
        document
          .getElementById("txtAlasanTolakDl")
          .value
          .trim();

      if (!alasan) {

        alert("Alasan penolakan wajib diisi.");

        return;

      }

      await tolakPresensiDL(

        window.currentPengajuanId,

        alasan

      );

    };

}

async function loadReviewPresensiDL() {

  const tbody = document.getElementById(
    "reviewPresensiDlBody"
  );

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
        pegawai(
          nama
        )
      ),

      dl_detail(
    tanggal_mulai,
    tanggal_selesai,
    jumlah_hari
)
    `)
    .eq("jenis_pengajuan", "DL")
    .is("deleted_at", null)

  const urutanStatus = {
    "MENUNGGU": 1,
    "DIPROSES": 2,
    "DISETUJUI": 3,
    "DITOLAK": 4,
    "SELESAI": 5
  };

  data.sort((a, b) => {

    const statusA =
      urutanStatus[a.status] ?? 99;

    const statusB =
      urutanStatus[b.status] ?? 99;

    if (statusA !== statusB) {
      return statusA - statusB;
    }

    // Jika status sama, urutkan berdasarkan tanggal mulai
    const tglA = a.dl_detail?.[0]?.tanggal_mulai ?? "";
    const tglB = b.dl_detail?.[0]?.tanggal_mulai ?? "";

    return new Date(tglB) - new Date(tglA);

  });


  if (error) {

    console.error(error);

    tbody.innerHTML = `
      <tr>

        <td colspan="7">

          Gagal memuat data

        </td>

      </tr>
    `;

    return;

  }

  tbody.innerHTML = "";

  data.forEach(item => {

    const daftarNama =
      item.pengajuan_anggota
        ?.map(x =>
          x.is_pengaju
            ? `👤 <b>${x.pegawai.nama}</b>`
            : `• ${x.pegawai.nama}`
        )
        .join("<br>") ?? "-";

    const jenis = item.jenis_pengajuan;

    let tanggal = "-";

    const dl =
      item.dl_detail?.[0];

    if (dl) {

      tanggal =
        `${dl.tanggal_mulai}
        <br>
        s.d.
        <br>
        ${dl.tanggal_selesai}`;

    }

    tbody.innerHTML += `

<tr align="center">

<td>${item.nomor_pengajuan}</td>

<td>${daftarNama}</td>

<td>${jenis}</td>

<td>${tanggal}</td>

<td>${badgeStatus(item.status)}</td>

<td>${item.catatan_admin ?? "-"}</td>

<td>

${item.status === "MENUNGGU"

        ? `

<button
class="btn btn-primary btn-detail-review"
data-id="${item.id}">

Review

</button>

`

        : item.status === "DIPROSES"

          ? `

<button
class="btn btn-warning btn-detail-review"
data-id="${item.id}">

Lanjutkan Review

</button>

`

          : `

<button
class="btn-lihat-surtug"
data-id="${item.id}">
Lihat Surat Tugas
</button>
         <br>
<button
class="btn btn-success"
disabled>
✔ Sudah Diproses

</button>

`

      }

</td>
</tr>

`;

  });

}

async function bukaDetailPresensiDL(id) {

  window.currentPengajuanId = id;

  const { data, error } =
    await supabase
      .from("pengajuan")
      .select(`
          id,
          status
      `)
      .eq("id", id)
      .single();

  if (error) {

    console.error(error);

    return;

  }

  if (data.status === "MENUNGGU") {

    await updateStatusPengajuan(
      id,
      "DIPROSES",
      "Dokumen sedang diverifikasi."
    );

  }

  await loadReviewPresensiDL();

  await isiModalDetailPresensiDL(id);

}

async function approvePresensiDL(id) {

  await updateStatusPengajuan(

    id,

    "SELESAI",

    "Perubahan status presensi selesai."

  );


  document
    .getElementById("modalDetailPresensiDL")
    .close();

  await loadReviewPresensiDL();

}

async function tolakPresensiDL(id, alasan) {

  await updateStatusPengajuan(

    id,

    "DITOLAK",

    alasan

  );

  document
    .getElementById("modalTolakDl")
    .close();

  document
    .getElementById("modalDetailPresensiDL")
    .close();

  document
    .getElementById("txtAlasanTolakDl")
    .value = "";

  await loadReviewPresensiDL();

}

async function isiModalDetailPresensiDL(id) {

  const {
    data,
    error
  } = await supabase

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
        pegawai(
          nama
        )
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

  if (dokumen) {

    const { data: signedData, error } = await supabase
      .storage
      .from("surat_dl")
      .createSignedUrl(
        dokumen.file_url,
        60 * 5 // berlaku 5 menit
      );

    if (error) {

      console.error(error);

    } else {

      fileUrl = signedData.signedUrl;

    }

  }


  renderModalDetailPresensiDL(data, fileUrl);

}

function renderModalDetailPresensiDL(data, fileUrl) {

  const detail =
    data.dl_detail[0];

  const dokumen =
    data.dokumen[0];

  const body =
    document.getElementById(
      "detailDlBody"
    );

  body.innerHTML = `

<b>Nomor Pengajuan</b>

<p>

${data.nomor_pengajuan}

</p>

<b>Tanggal DL</b>

<p>

${detail.tanggal_mulai}

${detail.tanggal_selesai
      ? ` s/d ${detail.tanggal_selesai}`
      : ""}

</p>

<b>Status</b>

<p>

${data.status}

</p>

<b>Peserta</b>

<ul>

${data.pengajuan_anggota.map(p => `

<li>

${p.pegawai.nama}

${p.is_pengaju
          ? " (Pengaju)"
          : ""}

</li>

`).join("")}

</ul>

<b>Surat Tugas</b>

<div class="pdf-preview">

<iframe
  src="${fileUrl}"
  width="100%"
  height="500"
  frameborder="0"
>

</iframe>

</div>

`;

  document
    .getElementById(
      "modalDetailPresensiDL"
    )
    .showModal();

}

async function updateTKBerdasarkanRentangTanggal(
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

async function updateTKKarenaCutiTahunan(
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

async function updateTKKarenaPengajuanDL(
  daftarPegawai,
  tanggal
) {

  const pegawaiIds = daftarPegawai.map(x => x.id);

  const { error } = await supabase

    .from("tk_bulanan")

    .update({

      keterangan: KETERANGAN_TK.PENGAJUAN_DL,

      updated_at: new Date().toISOString()

    })

    .in("pegawai_id", pegawaiIds)

    .eq("tanggal", tanggal)

    .is("deleted_at", null);

  if (error) {

    console.error(error);

  }

}

async function cekKeteranganTK(pegawaiId, tanggal) {

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

async function refreshKeteranganTKRentang(
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

async function refreshKeteranganTKTanggal(
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

async function loadRekapTK() {

  const { data, error } =
    await supabase.rpc(
      "get_rekap_tk_tahun_ini"
    );

  if (error) {

    console.error(error);

    return;

  }

  const container =
    document.getElementById(
      "rekapTKContainer"
    );

  container.innerHTML = "";

  data.forEach(item => {

    container.innerHTML += `

      <div class="rekap-item">

        <div
          class="rekap-header"
          onclick="toggleRekapTK(this)">

          <span>

            ▶ ${item.nama}

          </span>

          <span>

            ${item.jumlah} Hari

          </span>

        </div>

        <div class="rekap-detail">

          ${item.tanggal.map(t => `

            <div>

              • ${formatTanggal(t)}

            </div>

          `).join("")}

        </div>

      </div>

    `;

  });

}

window.toggleRekapTK = function (header) {

  const detail =
    header.nextElementSibling;

  const icon =
    header.querySelector("span");

  if (detail.classList.contains("show")) {

    detail.classList.remove("show");

    icon.innerHTML =
      icon.innerHTML.replace("▼", "▶");

  } else {

    detail.classList.add("show");

    icon.innerHTML =
      icon.innerHTML.replace("▶", "▼");

  }

}

async function lihatFormCuti(id) {

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

function ambilTanggalPengajuan(item) {

  if (item.jenis_pengajuan === "CUTI_SAKIT") {

    return item.cuti_sakit_detail?.[0]?.tanggal_mulai ?? "";

  }

  if (item.jenis_pengajuan === "CUTI_ALASAN_PENTING") {

    return item.cuti_alasan_penting_detail?.[0]?.tanggal_mulai ?? "";

  }


  if (item.jenis_pengajuan === "CUTI_TAHUNAN") {

    return item.cuti_tahunan_tanggal?.[0]?.tanggal ?? "";

  }

  return "";

}

async function loadUlangTahunBulanIni() {
  const container = document.getElementById("ulangTahunBulanIni");
  if (!container) return;

  const sekarang = new Date();
  const bulanIni = sekarang.getMonth();
  const tahunIni = sekarang.getFullYear();
  const hariIni = sekarang.getDate();

  const { data, error } = await supabase
    .from("pegawai")
    .select("nama, nip");

  if (error) {
    console.error("Gagal mengambil data pegawai:", error);
    container.innerHTML = `<p class="ultah-empty">Gagal memuat data.</p>`;
    return;
  }

  const namaBulanSingkat = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

  const dataUlangTahun = data
    .filter(pegawai => pegawai.nip && String(pegawai.nip).length >= 8)
    .map(pegawai => {
      const nip = String(pegawai.nip);
      const tahunLahir = Number(nip.substring(0, 4));
      const bulanLahir = Number(nip.substring(4, 6));
      const hariLahir = Number(nip.substring(6, 8));

      return {
        nama: pegawai.nama,
        nip,
        tahunLahir,
        bulanLahir,
        hariLahir
      };
    })
    .filter(pegawai => pegawai.bulanLahir - 1 === bulanIni)
    .map(pegawai => {
      let jarak = pegawai.hariLahir - hariIni;
      const jumlahHariBulanIni = new Date(tahunIni, bulanIni + 1, 0).getDate();

      if (jarak < 0) {
        jarak += jumlahHariBulanIni;
      }

      const usia = tahunIni - pegawai.tahunLahir;

      return {
        ...pegawai,
        jarak,
        usia
      };
    })
    .sort((a, b) => a.hariLahir - b.hariLahir); // Urutkan berdasarkan tanggal hari (1..31)

  if (!dataUlangTahun.length) {
    container.innerHTML = `<p class="ultah-empty">Tidak ada pegawai yang ulang tahun bulan ini.</p>`;
    return;
  }

  // Render HTML dengan struktur Card & Table seperti desain
  const listHtml = dataUlangTahun.map(item => {
    // Ambil inisial nama untuk Avatar jika tidak ada foto

    const singkatanBulan = namaBulanSingkat[bulanIni];

    return `
            <div class="ultah-row">
                <div class="ultah-col-hari">
                    <span class="ultah-icon">🎂</span>
                    <span class="ultah-tanggal"><strong>${item.hariLahir}</strong> ${singkatanBulan}</span>
                </div>
                <div class="ultah-col-nama">
                   
                    <span class="ultah-nama-text">${item.nama}</span>
                </div>
                <div class="ultah-col-usia">
                    <strong>${item.usia}</strong> <span class="ultah-unit">tahun</span>
                </div>
            </div>
        `;
  }).join("");

  container.innerHTML = `
        <div class="ultah-card">
            <div class="ultah-header-title">
                <span>🎂</span>
                <h3>Ulang Tahun Bulan Ini</h3>
            </div>
            <div class="ultah-table-header">
                <div class="ultah-th-hari">📅 TANGGAL</div>
                <div class="ultah-th-nama">👤 NAMA PEGAWAI</div>
                <div class="ultah-th-usia">🎖️ USIA</div>
            </div>
            <div class="ultah-list">
                ${listHtml}
            </div>
        </div>
    `;
}