import { badgeStatus, updateStatusPengajuan } from "/utils/helper.js";

const URUTAN_STATUS_ABSEN = {
  MENUNGGU: 1,
  DIPROSES: 2,
  HADIR: 3,
  DISETUJUI: 3,
  DITOLAK: 4,
  SELESAI: 5
};

let modalMapInstance = null;
let needRefreshAfterModalClose = false;
let zoomMapInstance = null;
let currentFotoScale = 1;
let activeCoords = null;
let activeFotoUrl = "";

function setFotoZoom(nextScale) {
  currentFotoScale = Math.min(3, Math.max(0.5, Number(nextScale.toFixed(2))));
  const zoomFotoImg = document.getElementById("zoomFotoImg");
  const labelZoomFoto = document.getElementById("labelZoomFoto");

  if (zoomFotoImg) {
    zoomFotoImg.style.transform = `scale(${currentFotoScale})`;
  }
  if (labelZoomFoto) {
    labelZoomFoto.textContent = `${Math.round(currentFotoScale * 100)}%`;
  }
}

function formatWaktuPresensi(isoString, style = { dateStyle: "medium", timeStyle: "short" }) {
  if (!isoString) return "-";
  const dt = new Date(isoString);
  return Number.isNaN(dt.getTime()) ? "-" : dt.toLocaleString("id-ID", style);
}

function renderTombolAksiAbsen(status, id) {
  if (status === "MENUNGGU") {
    return `<button type="button" class="btn btn-primary btn-detail-review" data-id="${id}">Review</button>`;
  }
  if (status === "DIPROSES") {
    return `<button type="button" class="btn btn-warning btn-detail-review" data-id="${id}">Lanjutkan Review</button>`;
  }
  return `<button type="button" class="btn btn-success" disabled>✔ Selesai</button>`;
}

export async function initReviewPengajuanAbsensi() {
  await loadReviewPresensiAbsen();

  const tbody = document.getElementById("reviewPresensiAbsenBody");
  if (tbody && !tbody.dataset.bound) {
    tbody.dataset.bound = "1";
    tbody.addEventListener("click", async (e) => {
      const btnLihatFoto = e.target.closest(".btn-lihat-foto");
      if (btnLihatFoto) {
        window.open(btnLihatFoto.dataset.url, "_blank");
        return;
      }

      const btn = e.target.closest(".btn-detail-review");
      if (!btn) return;

      await bukaDetailPresensiAbsen(Number(btn.dataset.id));
    });
  }

  const modalDetail = document.getElementById("modalDetailPresensiAbsen");
  const btnCloseDetail = document.getElementById("btnCloseDetailAbsen");
  if (btnCloseDetail && modalDetail) {
    btnCloseDetail.onclick = () => modalDetail.close();
  }
  if (modalDetail && !modalDetail.dataset.closeBound) {
    modalDetail.dataset.closeBound = "1";
    modalDetail.addEventListener("close", async () => {
      if (modalMapInstance) {
        modalMapInstance.remove();
        modalMapInstance = null;
      }
      if (needRefreshAfterModalClose) {
        needRefreshAfterModalClose = false;
        await loadReviewPresensiAbsen();
      }
    });
  }

  const btnSetujui = document.getElementById("btnSetujuiAbsen");
  if (btnSetujui) {
    btnSetujui.onclick = async () => {
      if (!window.currentPengajuanId) return;
      await approvePresensiAbsen(window.currentPengajuanId);
    };
  }

  const modalTolak = document.getElementById("modalTolakAbsen");
  const txtAlasan = document.getElementById("txtAlasanTolakAbsen");

  const btnTolak = document.getElementById("btnTolakAbsen");
  if (btnTolak && modalTolak) {
    btnTolak.onclick = () => {
      if (txtAlasan) txtAlasan.value = "";
      modalTolak.showModal();
    };
  }

  const btnBatalTolak = document.getElementById("btnBatalTolakAbsen");
  if (btnBatalTolak && modalTolak) {
    btnBatalTolak.onclick = () => modalTolak.close();
  }

  const btnSimpanTolak = document.getElementById("btnSimpanTolakAbsen");
  if (btnSimpanTolak) {
    btnSimpanTolak.onclick = async () => {
      const alasan = txtAlasan?.value.trim() || "";
      if (!alasan) {
        alert("Alasan penolakan wajib diisi.");
        txtAlasan?.focus();
        return;
      }
      await tolakPresensiAbsen(window.currentPengajuanId, alasan);
    };
  }

  const modalZoomMap = document.getElementById("modalZoomMap");
  const btnCloseZoomMap = document.getElementById("btnCloseZoomMap");
  if (btnCloseZoomMap && modalZoomMap) {
    btnCloseZoomMap.onclick = () => modalZoomMap.close();
  }
  if (modalZoomMap && !modalZoomMap.dataset.closeBound) {
    modalZoomMap.dataset.closeBound = "1";
    modalZoomMap.addEventListener("close", () => {
      if (zoomMapInstance) {
        zoomMapInstance.remove();
        zoomMapInstance = null;
      }
    });
  }

  const modalZoomFoto = document.getElementById("modalZoomFoto");
 
  document.getElementById("btnZoomInFoto")?.addEventListener("click", () => {
    setFotoZoom(currentFotoScale + 0.25);
  });

  document.getElementById("btnZoomOutFoto")?.addEventListener("click", () => {
    setFotoZoom(currentFotoScale - 0.25);
  });

  document.getElementById("btnResetZoomFoto")?.addEventListener("click", () => {
    setFotoZoom(1);
  });

  document.getElementById("btnCloseZoomFoto")?.addEventListener("click", () => {
    modalZoomFoto?.close();
  });

  modalZoomFoto?.addEventListener("close", () => {
    setFotoZoom(1);
  });
}

async function loadReviewPresensiAbsen() {
  const tbody = document.getElementById("reviewPresensiAbsenBody");
  if (!tbody) return;

  const { data, error } = await supabase
    .from("pengajuan")
    .select(`
      id,
      nomor_pengajuan,
      status,
      catatan_admin,
      created_at,
      pegawai!pengajuan_pegawai_id_fkey(
        nama,
        id_fingerprint
      ),
      presensi_detail(
        waktu_presensi
      )
    `)
    .eq("jenis_pengajuan", "ABSEN")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="8" align="center">Gagal memuat data presensi</td></tr>`;
    return;
  }

  const sortedData = [...(data || [])].sort((a, b) => {
    const sA = URUTAN_STATUS_ABSEN[a.status] ?? 99;
    const sB = URUTAN_STATUS_ABSEN[b.status] ?? 99;
    if (sA !== sB) return sA - sB;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const fragment = document.createDocumentFragment();

  sortedData.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.align = "center";

    const namaPegawai = item.pegawai?.nama ? `👤 <b>${item.pegawai.nama}</b>` : "-";
    const waktuFormatted = formatWaktuPresensi(item.presensi_detail?.[0]?.waktu_presensi);
    const statusHtml = typeof badgeStatus === "function" ? badgeStatus(item.status) : item.status;

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.nomor_pengajuan}</td>
      <td>${namaPegawai}</td>
      <td>${item.pegawai?.id_fingerprint ?? "-"}</td>
      <td>${waktuFormatted}</td>
      <td>${statusHtml}</td>
      <td>${item.catatan_admin ?? "-"}</td>
      <td>${renderTombolAksiAbsen(item.status, item.id)}</td>
    `;

    fragment.appendChild(tr);
  });

  tbody.replaceChildren(fragment);
}

async function bukaDetailPresensiAbsen(id) {
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
    await updateStatusPengajuan(id, "DIPROSES", "Presensi sedang diverifikasi oleh admin.");
    needRefreshAfterModalClose = true;
  }

  await isiModalDetailPresensiAbsen(id);
}

async function approvePresensiAbsen(id) {
  if (typeof updateStatusPengajuan === "function") {
    await updateStatusPengajuan(id, "SELESAI", "Presensi divalidasi dan disetujui.");
  }

  needRefreshAfterModalClose = false;
  document.getElementById("modalDetailPresensiAbsen")?.close();
  await loadReviewPresensiAbsen();
}

async function tolakPresensiAbsen(id, alasan) {
  if (typeof updateStatusPengajuan === "function") {
    await updateStatusPengajuan(id, "DITOLAK", alasan);
  }

  needRefreshAfterModalClose = false;
  document.getElementById("modalTolakAbsen")?.close();
  document.getElementById("modalDetailPresensiAbsen")?.close();

  const txtAlasan = document.getElementById("txtAlasanTolakAbsen");
  if (txtAlasan) txtAlasan.value = "";

  await loadReviewPresensiAbsen();
}

async function isiModalDetailPresensiAbsen(id) {
  const { data, error } = await supabase
    .from("pengajuan")
    .select(`
      nomor_pengajuan,
      status,
      pegawai!pengajuan_pegawai_id_fkey(
        nama,
        email
      ),
      presensi_detail(
        waktu_presensi,
        latitude,
        longitude,
        foto_url
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  const detail = data.presensi_detail?.[0];
  let fotoUrl = "";

  if (detail?.foto_url) {
    try {
      const { data: signedData, error: signError } = await supabase
        .storage
        .from("bukti_presensi")
        .createSignedUrl(detail.foto_url, 60 * 5);

      if (!signError && signedData?.signedUrl) {
        fotoUrl = signedData.signedUrl;
      }
    } catch (err) {
      console.error("Gagal memuat URL foto:", err);
    }
  }

  renderModalDetailPresensiAbsen(data, fotoUrl);
}

function renderModalDetailPresensiAbsen(data, fotoUrl) {
  const detail = data.presensi_detail?.[0];
  const pegawai = data.pegawai;
  const body = document.getElementById("detailAbsenBody");

  if (!body) return;

  const waktuFormatted = formatWaktuPresensi(detail?.waktu_presensi, {
    dateStyle: "full",
    timeStyle: "medium"
  });

  const lat = Number(detail?.latitude);
  const lng = Number(detail?.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && detail?.latitude != null && detail?.longitude != null;

  activeCoords = hasCoords ? { lat, lng } : null;
  activeFotoUrl = detail?.foto_url && fotoUrl ? fotoUrl : "";

  body.innerHTML = `
    <div style="font-size: 14px; line-height: 1.6;">
      <p style="margin: 0 0 8px 0;"><strong>Nomor Presensi:</strong> ${data.nomor_pengajuan}</p>
      <p style="margin: 0 0 8px 0;"><strong>Pegawai:</strong> ${pegawai?.nama ?? "-"} (${pegawai?.email ?? "-"})</p>
      <p style="margin: 0 0 8px 0;"><strong>Waktu:</strong> ${waktuFormatted}</p>
      <p style="margin: 0 0 12px 0;"><strong>Status:</strong> ${data.status}</p>

      <div style="margin-bottom: 12px;">
        <strong>Titik Lokasi Peta <span style="font-size: 11px; color: #0284c7;">(klik peta untuk memperbesar)</span>:</strong>
        ${hasCoords ? `
          <div id="modalMap" title="Klik untuk memperbesar peta" style="width: 100%; height: 160px; border-radius: 6px; margin-top: 5px; border: 1px solid #ccc; cursor: zoom-in;"></div>
          <p style="font-size: 11px; color: gray; margin: 4px 0 0 0;">Lat: ${lat}, Long: ${lng}</p>
        ` : "<p>-</p>"}
      </div>

      <div>
        <strong>Foto Bukti Kehadiran (Geotag) ${activeFotoUrl ? `<span style="font-size: 11px; color: #0284c7;">(klik foto untuk zoom)</span>` : ""}:</strong>
        <div style="margin-top: 5px; text-align: center; background: #000; border-radius: 6px; padding: 5px;">
          ${activeFotoUrl ? `
            <img
              id="previewFotoAbsen"
              src="${activeFotoUrl}"
              alt="Preview Foto Presensi"
              title="Klik untuk memperbesar foto"
              style="max-width: 100%; max-height: 220px; border-radius: 4px; display: block; margin: 0 auto; cursor: zoom-in;"
            />
          ` : "<p style='color:white;'>Tidak ada foto</p>"}
        </div>
      </div>
    </div>
  `;

  const modal = document.getElementById("modalDetailPresensiAbsen");
  if (!modal) return;

  modal.showModal();

  if (modalMapInstance) {
    modalMapInstance.remove();
    modalMapInstance = null;
  }

  const mapContainer = document.getElementById("modalMap");
  if (hasCoords && typeof L !== "undefined" && mapContainer) {
    requestAnimationFrame(() => {
      modalMapInstance = L.map("modalMap", {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false
      }).setView([lat, lng], 17);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap"
      }).addTo(modalMapInstance);

      L.marker([lat, lng]).addTo(modalMapInstance);

      // Klik map kecil -> buka modal map besar
      mapContainer.onclick = () => {
        if (!activeCoords) return;
        const zModal = document.getElementById("modalZoomMap");
        const zCoords = document.getElementById("zoomMapCoords");
        if (zCoords) {
          zCoords.textContent = `Lat: ${activeCoords.lat}, Long: ${activeCoords.lng}`;
        }
        zModal?.showModal();

        if (zoomMapInstance) {
          zoomMapInstance.remove();
          zoomMapInstance = null;
        }

        requestAnimationFrame(() => {
          zoomMapInstance = L.map("zoomMapContainer", {
            zoomControl: true,
            dragging: true,
            scrollWheelZoom: true,
            doubleClickZoom: true
          }).setView([activeCoords.lat, activeCoords.lng], 17);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap"
          }).addTo(zoomMapInstance);

          L.marker([activeCoords.lat, activeCoords.lng]).addTo(zoomMapInstance);
          zoomMapInstance.invalidateSize();
        });
      };
    });
  }

  // Klik foto kecil -> buka modal zoom foto
  const previewFoto = document.getElementById("previewFotoAbsen");
  if (previewFoto && activeFotoUrl) {
    previewFoto.onclick = () => {
      const zModal = document.getElementById("modalZoomFoto");
      const zImg = document.getElementById("zoomFotoImg");
      if (zImg) zImg.src = activeFotoUrl;
      setFotoZoom(1);
      zModal?.showModal();
    };
  }
}