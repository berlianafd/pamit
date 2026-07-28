const routes = {};

let currentPage = "dashboard";

export function registerRoute(name, callback) {

  routes[name] = callback;

}

export function navigate(name) {

  currentPage = name;

  // console.log("NAVIGATE:", name);
  // console.log("ROUTE:", routes[name]);

  const content =
    document.getElementById("content");

  if (!content) return;

  if (routes[name]) {

    const result =
      routes[name]();

    content.innerHTML =
      result;

    if (name === "masterPegawai") {

      window.initMasterPegawai();

    }

    if (name === "dashboard" &&
    typeof window.loadDashboardAdmin === "function") {

      window.loadDashboardAdmin();

    }

    if (name === "pengajuanDl") {

      window.initPengajuanDl();

    }

    if (name === "pengajuanCutiTahunan") {

      window.initPengajuanCutiTahunan();

    }

    if (name === "pengajuanCutiSakit") {

      window.initPengajuanCutiSakit();

    }

    if (name === "reviewPengajuan") {

      window.initReviewPengajuan();

    }

    if (name === "saldoCuti") {

      window.initSaldoCuti();

    }

     if (name === "reviewPresensiCuti") {

      window.initReviewPresensiCuti();

    }

     if (name === "reviewPresensiDL") {

      window.initReviewPresensiDL();

    }

  }

}