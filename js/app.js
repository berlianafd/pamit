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

let editId = null;
let currentPage = 1;
const pageSize = 10;
let daftarPegawai = [];
let pesertaDipilih = [];
let pegawaiLogin = null;
let tanggalCutiDipilih = [];
let calendarCuti = null;

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
      .select("nama")
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
      pegawai?.nama
    );

  }
  catch (err) {

    console.error(err);

    app.innerHTML =
      "<h2>Terjadi kesalahan</h2>";

  }

}

function renderDashboard(role, nama) {

  switch (role) {

    case "pegawai":

      app.innerHTML =
        renderPegawai(nama);
      registerPages();

      registerMenus();

      initSidebar();

      navigate(
        "dashboard"
      );

      break;

    case "admin_cuti":

      app.innerHTML =
        renderAdminCuti(nama);
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
        renderAdminPresensi(nama);
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
        renderSuperadmin(nama);

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
    .getElementById(
      "btnSimpanCutiSakit"
    )
    .onclick =
    simpanPengajuanCutiSakit;

  await loadRiwayatCutiSakit();

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

  const alamatCS =
    document
      .getElementById("alamatCutiSakit")
      .value;

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

      alamat: alamatCS

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

  document.getElementById("tanggalMulai").value = "";
  document.getElementById("tanggalSelesai").value = "";
  document.getElementById("suratSakit").value = "";
  document.getElementById("alamatCutiSakit").value = "";


  await loadRiwayatCutiSakit();

  alert("Pengajuan berhasil disimpan.");

}

async function simpanPengajuanCutiTahunan() {

  const alasan =
    document
      .getElementById("alasanCuti")
      .value
      .trim();

  const alamat =
    document
      .getElementById("alamatCuti")
      .value
      .trim();

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
        alamat

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

Lihat Surat

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

async function loadPegawaiDL() {

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

  alert("Pengajuan berhasil dihapus.");

  loadRiwayatDl();

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

  alert("Pengajuan berhasil dihapus.");

  await loadRiwayatCutiSakit();

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

  alert("Pengajuan berhasil dihapus.");

  await loadRiwayatCutiTahunan();

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

      const btn =
        e.target.closest(".btn-detail-review");

      if (!btn) return;

      await bukaDetailPengajuan(

        Number(btn.dataset.id)

      );

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
)
    `)
    .eq("pengajuan_anggota.is_pengaju", true)
    .in("jenis_pengajuan", ["CUTI_TAHUNAN", "CUTI_SAKIT"])
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

  tbody.innerHTML = "";

  data.forEach(item => {

    const pegawai =
      item.pengajuan_anggota?.[0]?.pegawai?.nama ?? "-";

    const jenis =
      item.jenis_pengajuan === "CUTI_TAHUNAN"

        ? "Cuti Tahunan"

        : "Cuti Sakit";

    let tanggal = "-";

    if (item.jenis_pengajuan == "CUTI_TAHUNAN") {
      const list = item.cuti_tahunan_tanggal ?? [];

      if (list.length > 0) {

        const awal = list[0].tanggal;
        const akhir = list[list.length - 1].tanggal;

        tanggal = `${awal}<br>s.d.<br>${akhir}`;

      }

    } else {

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

        dokumen(*)

    `)

    .eq("id", id)

    .single();

  if (error) {

    console.error(error);

    return;

  }

  const btnDownload =
    document.getElementById("btnDownloadForm");

  const btnTTD =
    document.getElementById("btnSudahDitandatangani");

  const btnSetujui =
    document.getElementById("btnDisetujui");

  const btnTolak =
    document.getElementById("btnTolak");

  if (data.catatan_admin === "Dokumen disetujui" ||
    data.catatan_admin === "Dokumen sedang dalam penyusunan dan diajukan untuk penandatanganan." ||
    data.catatan_admin === "Proses perubahan status presensi.") {

    btnDownload.style.display = "inline-block";
    btnTTD.style.display = "inline-block";
    btnSetujui.style.display = "none"
    btnTolak.style.display = "none";

  } else {

    btnDownload.style.display = "none";
    btnTTD.style.display = "none";
    btnTolak.style.display = "inline-block";
    btnSetujui.style.display = "inline-block";
  }

  if (
    data.catatan_admin ===
    "Proses perubahan status presensi."
  ) {

    btnTTD.disabled = true;

    btnTTD.innerHTML =
      "✔ Sudah Ditandatangani";

  } else {

    btnTTD.disabled = false;

    btnTTD.innerHTML =
      "Tandai Sudah Ditandatangani";

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

  } else {

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
    .onclick = async () => {

      await sudahDitandatangani(
        window.currentPengajuanId
      );

    };

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

    <tr>

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
)
    `)
    .in("status", ["DISETUJUI", "SELESAI"])
    .in("jenis_pengajuan", ["CUTI_TAHUNAN", "CUTI_SAKIT"])
    .is("deleted_at", null);

  data.forEach(p => {

    if (p.jenis_pengajuan === "CUTI_TAHUNAN") {

      p.tanggal_awal =
        p.cuti_tahunan_tanggal
          ?.map(x => x.tanggal)
          ?.sort()[0];

    } else {

      p.tanggal_awal =
        p.cuti_sakit_detail?.tanggal_mulai;

    }

  });

  data.sort((a, b) =>
    new Date(a.tanggal_awal) - new Date(b.tanggal_awal)
  );


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

        : "Cuti Sakit";

    let tanggal = "-";

    if (item.jenis_pengajuan == "CUTI_TAHUNAN") {
      const list = item.cuti_tahunan_tanggal ?? [];

      if (list.length > 0) {

        const awal = list[0].tanggal;
        const akhir = list[list.length - 1].tanggal;

        tanggal = `${awal}<br>s.d.<br>${akhir}`;

      }

    } else {

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
    .eq("pengajuan_anggota.is_pengaju", true)
    .eq("jenis_pengajuan", "DL")
    .is("deleted_at", null)

  data.sort((a, b) =>
    new Date(a.tanggal_awal) - new Date(b.tanggal_awal)
  );


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

<td>${pegawai}</td>

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