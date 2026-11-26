import { supabase } from "../auth/auth.js";

import { registerRoute, navigate } from "./router.js";

import { renderLogin } from "../views/login.js";
import { renderPegawai } from "../views/pegawai.js";
import { renderAdminCuti } from "../views/adminCuti.js";
import { renderAdminPresensi } from "../views/adminPresensi.js";
import { renderSuperadmin } from "../views/superadmin.js";

import { dashboardPage } from "../views/pages/dashboard.js";
import { presensiPage } from "../views/pages/presensi.js";
import { masterPegawaiPage } from "../views/pages/masterPegawai.js";
import { pengajuanDlPage } from "../views/pages/pengajuanDl.js";
import { pengajuanAbsensiPage } from "../views/pages/pengajuanAbsensi.js";
import { pengajuanCutiTahunanPage } from "../views/pages/pengajuanCutiTahunan.js";
import { pengajuanCutiSakitPage } from "../views/pages/pengajuanCutiSakit.js";
import { pengajuanCutiAlasanPentingPage } from "../views/pages/pengajuanCutiAlasanPenting.js";
import { pengajuanKendalaPresensiPage } from "../views/pages/pengajuanKendalaPresensi.js";
import { reviewPengajuanPage } from "../views/pages/reviewPengajuan.js";
import { reviewPresensiCutiPage } from "../views/pages/reviewPresensiCuti.js";
import { saldoCutiPage } from "../views/pages/saldoCuti.js";
import { reviewPresensiDLPage } from "../views/pages/reviewPresensiDL.js";
import { presensiTKPage } from "../views/pages/presensiTK.js";

import {ulangTahunBulanini, loadUlangTahunBulanIni} from "../utils/birthday.js";
import {formatTanggal, showToast} from "../utils/helper.js";

import { loadPegawai, initMasterPegawai } from "../pegawai/pegawai.js";
import { initPresensiTK } from "../pegawai/pegawaiTK.js";
import { initSaldoCuti } from "../pegawai/saldoCuti.js";

import { initPresensi } from "../presensi/presensi.js";
import { initPengajuanDl } from "../dinasLuar/dinasLuar.js";

import { initPengajuanCutiTahunan } from "../cuti/cutiTahunan.js";
import { initPengajuanCutiSakit } from "../cuti/cutiSakit.js";
import { initPengajuanCutiAlasanPenting } from "../cuti/cutiAlasanPenting.js";

import { initReviewPresensiDL } from "../review/presensiDL.js";
import { initReviewPengajuanAbsensi } from "../review/pengajuanAbsensi.js";   
import {initReviewPengajuan} from "../review/pengajuanCuti.js";
import { initReviewPresensiCuti } from "../review/presensiCuti.js";


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
      app.innerHTML = renderPegawai(nama, jenisPegawai);
      break;
    case "admin_cuti":
      app.innerHTML = renderAdminCuti(nama, jenisPegawai);
      window.loadDashboardAdmin = loadDashboardAdminCuti;
      break;
    case "admin_presensi":
      app.innerHTML = renderAdminPresensi(nama, jenisPegawai);
      window.loadDashboardAdmin = loadDashboardAdminPresensi;
      break;
    case "superadmin":
      app.innerHTML = renderSuperadmin(nama, jenisPegawai);
      window.loadDashboardAdmin = loadDashboardAdminPresensi;
      break;
    default:
      app.innerHTML = `<h2>Role tidak dikenali</h2><p>${role}</p>`;
      return;
  }
  registerPages();
  registerMenus();
  initSidebar();
  navigate("dashboard");
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

      showToast(
        "NIP tidak ditemukan","error"
      );

      return;

    }

    if (!pegawai.aktif) {

      showToast(
        "Akun tidak aktif","error"
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

      showToast(
        "Password salah",
        "error"
      );

      return;

    }

    window.location.reload();

  }
  catch (err) {

    console.error(err);

    showToast(
      "Terjadi kesalahan saat login",
      "error"
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

  registerRoute(
    "presensi", 
    presensiPage);

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
    "pengajuanAbsensi",
    pengajuanAbsensiPage
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

window.initReviewPengajuan = initReviewPengajuan;

window.loadPegawai = loadPegawai;

window.initMasterPegawai = initMasterPegawai;

window.initPresensi = initPresensi;

window.initPengajuanDl = initPengajuanDl;

window.initPengajuanCutiSakit = initPengajuanCutiSakit;

window.initPengajuanCutiAlasanPenting = initPengajuanCutiAlasanPenting;

window.initPengajuanCutiTahunan = initPengajuanCutiTahunan;

window.initPresensiTK = initPresensiTK;

window.initSaldoCuti = initSaldoCuti;

window.initReviewPresensiCuti = initReviewPresensiCuti;

window.initReviewPresensiDL = initReviewPresensiDL;

window.initReviewPengajuanAbsensi =  initReviewPengajuanAbsensi;

window.ulangTahunBulanini = ulangTahunBulanini;

function hitungMasaKerja(nip) {

  const tahunPengangkatan =
    Number(nip.substring(8, 12));

  const sekarang =
    new Date().getFullYear();

  return `${sekarang - tahunPengangkatan} Tahun`;

}

window.loadDashboardPassword = async function () {
  // Tambahkan listener ini di dalam fungsi loadDashboardPassword()

// 1. Tombol Silang (X) di header modal
document.getElementById("btnCloseIconPassword")?.addEventListener("click", () => {
  const modal = document.getElementById("modalUbahPassword");
  modal?.close ? modal.close() : (modal.style.display = "none");
});

// 2. Fitur Toggle Show/Hide Password
document.querySelectorAll(".toggle-password").forEach((btn) => {
  btn.onclick = () => {
    const inputId = btn.dataset.target;
    const input = document.getElementById(inputId);
    if (input) {
      if (input.type === "password") {
        input.type = "text";
        btn.textContent = "🙈";
      } else {
        input.type = "password";
        btn.textContent = "👁️";
      }
    }
  };
});

  // Gunakan Event Delegation agar aman meskipun elemen dimuat secara dinamis
  document.addEventListener("click", async (e) => {
    const btnUbah = e.target.closest("#btnUbahPassword");
    const modal = document.getElementById("modalUbahPassword");
    const btnBatal = e.target.closest("#btnBatalPassword");
    const btnSubmit = e.target.closest("#btnSubmitPassword");

    // 1. Jika tombol "Ubah Password" (pemicu) diklik
    if (btnUbah && modal) {
      document.getElementById("currentPassword").value = "";
      document.getElementById("newPassword").value = "";
      document.getElementById("confirmPassword").value = "";

      if (typeof modal.showModal === "function") {
        modal.showModal();
      } else {
        modal.style.display = "block";
      }
      return;
    }

    // 2. Jika tombol "Batal" diklik
    if (btnBatal && modal) {
      if (typeof modal.close === "function") {
        modal.close();
      } else {
        modal.style.display = "none";
      }
      return;
    }

    // 3. Jika tombol submit di dalam modal diklik
    if (btnSubmit) {
      const currentPassword = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (!currentPassword || !newPassword || !confirmPassword) {
        showToast("Semua kolom wajib diisi!", "error");
        return;
      }

      if (newPassword !== confirmPassword) {
        showToast("Password baru dan konfirmasi password tidak cocok!", "error");
        return;
      }

      if (newPassword.length < 6) {
        showToast("Password baru minimal harus 6 karakter.", "error");
        return;
      }

      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user?.email) {
          showToast("Sesi login berakhir. Silakan login kembali.", "error");
          return;
        }

        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: userData.user.email,
          password: currentPassword
        });

        if (loginError) {
          showToast("Password lama salah!", "error");
          return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (updateError) throw updateError;

        showToast("Password berhasil diubah!", "success");
        const modalEl = document.getElementById("modalUbahPassword");
        if (modalEl) modalEl.close ? modalEl.close() : (modalEl.style.display = "none");
        await supabase.auth.signOut();
        window.location.reload();

      } catch (err) {
        console.error(err);
        showToast("Terjadi kesalahan: " + err.message, "error");
      }
    }
  });
};

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


