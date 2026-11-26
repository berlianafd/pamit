import { uploadDokumen } from "../utils/upload.js";
import { getPegawaiLogin, badgeStatus, showToast} from "../utils/helper.js";

let cachedPegawai = null;
let clockIntervalId = null;
let mapInstance = null;
let isSubmittingPresensi = false;

async function getCurrentPegawai(forceRefresh = false) {
  if (cachedPegawai && !forceRefresh) {
    return cachedPegawai;
  }

  if (typeof getPegawaiLogin === "function") {
    const helperPegawai = await getPegawaiLogin();
    if (helperPegawai?.id) {
      cachedPegawai = helperPegawai;
      return cachedPegawai;
    }
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user?.email) {
    return null;
  }

  const { data: pegawai, error } = await supabase
    .from("pegawai")
    .select("id, nama")
    .eq("email", userData.user.email)
    .single();

  if (error || !pegawai) {
    console.error("Gagal mengambil data pegawai:", error);
    return null;
  }

  cachedPegawai = pegawai;
  return cachedPegawai;
}

async function fetchAlamatNominatim(lat, lng) {
  const fallback = `Lat: ${Number(lat).toFixed(5)}, Long: ${Number(lng).toFixed(5)}`;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { "User-Agent": "AplikasiAbsensiGeotag/1.0" } }
    );
    const data = await response.json();
    return data?.display_name || fallback;
  } catch (err) {
    console.warn("Gagal mengambil nama jalan:", err);
    return fallback;
  }
}

export async function initPresensi() {
  await loadRiwayatPresensi();
  initLiveDateTimeAndLocation();

  const openCameraBtn = document.getElementById("openCameraBtn");
  const cameraPreviewContainer = document.getElementById("cameraPreviewContainer");
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const captureBtn = document.getElementById("captureBtn");
  const capturedImage = document.getElementById("capturedImage");

  let currentStream = null;

  if (openCameraBtn && !openCameraBtn.dataset.bound) {
    openCameraBtn.dataset.bound = "1";
    openCameraBtn.addEventListener("click", async () => {
      if (cameraPreviewContainer) cameraPreviewContainer.style.display = "block";
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false
        });
        if (video) video.srcObject = currentStream;
      } catch (err) {
        showToast("Tidak dapat mengakses kamera: " + err.message, "error");
      }
    });
  }

  if (captureBtn && !captureBtn.dataset.bound) {
    captureBtn.dataset.bound = "1";
    captureBtn.addEventListener("click", async () => {
      if (!video || !canvas) return;

      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const latVal = document.getElementById("latitude")?.value;
      const lngVal = document.getElementById("longitude")?.value;
      const timeVal = document.getElementById("liveDateTime")?.textContent || "";

      if (latVal && lngVal) {
        const alamatTeks = await fetchAlamatNominatim(latVal, lngVal);

        context.fillStyle = "rgba(0, 0, 0, 0.6)";
        context.fillRect(10, canvas.height - 105, canvas.width - 20, 95);
        context.fillStyle = "white";
        context.font = "11px Arial";
        context.fillText(`Waktu: ${timeVal}`, 18, canvas.height - 82);

        const maxCharsPerLine = 52;
        let yOffset = 64;
        if (alamatTeks.length > maxCharsPerLine) {
          const baris1 = alamatTeks.substring(0, maxCharsPerLine);
          const baris2 = alamatTeks.substring(maxCharsPerLine, maxCharsPerLine * 2);
          context.fillText(`Lokasi: ${baris1}`, 18, canvas.height - yOffset);
          yOffset -= 18;
          context.fillText(baris2, 18, canvas.height - yOffset);
        } else {
          context.fillText(`Lokasi: ${alamatTeks}`, 18, canvas.height - yOffset);
        }

        yOffset -= 18;
        context.fillText(
          `Lat: ${Number(latVal).toFixed(5)}, Long: ${Number(lngVal).toFixed(5)}`,
          18,
          canvas.height - yOffset
        );
      }

      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
        currentStream = null;
      }
      if (cameraPreviewContainer) cameraPreviewContainer.style.display = "none";

      canvas.toBlob((blob) => {
        if (!blob) {
          showToast("Gagal memproses gambar dari kamera.", "error");
          return;
        }
        const file = new File([blob], `presensi_${Date.now()}.jpg`, { type: "image/jpeg" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        const photoInput = document.getElementById("photoFile");
        if (photoInput) photoInput.files = dataTransfer.files;

        if (capturedImage) {
          capturedImage.src = URL.createObjectURL(blob);
          capturedImage.style.display = "block";
        }
      }, "image/jpeg", 0.85);
    });
  }

  const attendanceForm = document.getElementById("attendanceForm");
  if (attendanceForm && !attendanceForm.dataset.bound) {
    attendanceForm.dataset.bound = "1";
    attendanceForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (isSubmittingPresensi) return;

      const photoInput = document.getElementById("photoFile");
      if (!photoInput || photoInput.files.length === 0) {
        showToast("Silakan ambil foto presensi terlebih dahulu!", "error");
        return;
      }

      await simpanPresensi();
    });
  }

  const tbody = document.getElementById("riwayatPresensiBody");
  if (tbody && !tbody.dataset.bound) {
    tbody.dataset.bound = "1";
    tbody.addEventListener("click", async (e) => {
      const lihat = e.target.closest(".btnLihatFoto");
      if (lihat) {
        await lihatFotoPresensi(Number(lihat.dataset.id));
        return;
      }

      const hapusBtn = e.target.closest(".btn-hapus");
      if (hapusBtn) {
        await hapusPresensi(Number(hapusBtn.dataset.id));
      }
    });
  }
}

function initLiveDateTimeAndLocation() {
  const liveDateTimeSpan = document.getElementById("liveDateTime");
  const locationStatus = document.getElementById("locationStatus");

  function updateClock() {
    const now = new Date();
    if (liveDateTimeSpan) {
      liveDateTimeSpan.textContent = now.toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "medium"
      });
    }

    const timeInput = document.getElementById("attendanceTime");
    if (timeInput) {
      timeInput.value = now.toISOString().slice(0, 19).replace("T", " ");
    }
  }

  updateClock();
  if (clockIntervalId) clearInterval(clockIntervalId);
  clockIntervalId = setInterval(updateClock, 1000);

  if (!navigator.geolocation) {
    if (locationStatus) {
      locationStatus.textContent = "Browser tidak mendukung Geolocation.";
      locationStatus.style.color = "red";
    }
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const latInput = document.getElementById("latitude");
      const lngInput = document.getElementById("longitude");
      if (latInput) latInput.value = lat;
      if (lngInput) lngInput.value = lng;

      if (locationStatus) {
        locationStatus.textContent = "Mendeteksi nama alamat...";
        locationStatus.style.color = "#007bff";
      }

      const alamatTeks = await fetchAlamatNominatim(lat, lng);

      if (locationStatus) {
        locationStatus.innerHTML = `<strong>Lokasi Anda:</strong> ${alamatTeks} <br><span style="color: gray; font-size: 11px;">(Lat: ${lat.toFixed(5)}, Long: ${lng.toFixed(5)})</span>`;
        locationStatus.style.color = "green";
      }

      const mapEl = document.getElementById("map");
      if (mapEl && typeof L !== "undefined") {
        if (mapInstance) {
          mapInstance.remove();
          mapInstance = null;
        }

        mapInstance = L.map("map", {
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
        }).addTo(mapInstance);

        L.marker([lat, lng])
          .addTo(mapInstance)
          .bindPopup("Lokasi Anda Saat Ini")
          .openPopup();
      }
    },
    () => {
      if (locationStatus) {
        locationStatus.textContent = "Gagal mendeteksi lokasi. Pastikan GPS aktif.";
        locationStatus.style.color = "red";
      }
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

async function simpanPresensi() {
  if (isSubmittingPresensi) return;
  isSubmittingPresensi = true;

  try {
    const latitude = document.getElementById("latitude")?.value;
    const longitude = document.getElementById("longitude")?.value;
    const attendanceTime = document.getElementById("attendanceTime")?.value;
    const file = document.getElementById("photoFile")?.files?.[0];

    if (!latitude || !longitude) {
      showToast("Lokasi GPS belum terdeteksi. Pastikan GPS aktif dan izin lokasi diberikan.", "error");
      return;
    }

    if (!file) {
      showToast("Foto presensi (geotag) wajib diambil.", "error");
      return;
    }

    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      showToast("File foto harus berformat JPG atau PNG.", "error");
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast("Ukuran file foto maksimal 2 MB.", "error");
      return;
    }

    const pegawai = await getCurrentPegawai();
    if (!pegawai?.id) {
      showToast("Sesi login berakhir atau data pegawai tidak ditemukan.", "error");
      return;
    }

    let filePath;
    try {
      filePath = await uploadDokumen("bukti_presensi", "ABSEN", pegawai.id, file);
    } catch (err) {
      console.error(err);
      showToast("Gagal mengupload foto: " + err.message, "error");
      return;
    }

    const { data: nomorPengajuan, error: nomorError } = await supabase.rpc(
      "generate_nomor_pengajuan",
      { p_jenis: "ABSEN" }
    );

    if (nomorError) {
      console.error(nomorError);
      showToast("Gagal membuat nomor presensi.", "error");
      return;
    }

    const { data: pengajuan, error: pengajuanError } = await supabase
      .from("pengajuan")
      .insert({
        nomor_pengajuan: nomorPengajuan,
        pegawai_id: pegawai.id,
        jenis_pengajuan: "ABSEN",
        status: "MENUNGGU",
        created_by: pegawai.id,
        created_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (pengajuanError) {
      console.error(pengajuanError);
      showToast("Gagal menyimpan data presensi.", "error");
      return;
    }

    const { error: detailError } = await supabase
      .from("presensi_detail")
      .insert({
        pengajuan_id: pengajuan.id,
        waktu_presensi: attendanceTime || new Date().toISOString(),
        latitude,
        longitude,
        foto_url: filePath
      });

    if (detailError) {
      console.error(detailError);
      showToast("Gagal menyimpan detail presensi.", "error");
      return;
    }

    showToast("Presensi berhasil disimpan!", "success");

    document.getElementById("attendanceForm")?.reset();
    const capturedImage = document.getElementById("capturedImage");
    if (capturedImage) capturedImage.style.display = "none";
    const locationStatus = document.getElementById("locationStatus");
    if (locationStatus) locationStatus.textContent = "Mendeteksi ulang lokasi...";

    await loadRiwayatPresensi();
  } finally {
    isSubmittingPresensi = false;
  }
}

async function loadRiwayatPresensi() {
  const tbody = document.getElementById("riwayatPresensiBody");
  if (!tbody) return;

  const pegawai = await getCurrentPegawai();
  if (!pegawai?.id) return;

  const { data, error } = await supabase
    .from("pengajuan")
    .select(`
      id,
      status,
      created_at,
      presensi_detail(
        waktu_presensi,
        latitude,
        longitude
      )
    `)
    .eq("pegawai_id", pegawai.id)
    .eq("jenis_pengajuan", "ABSEN")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const fragment = document.createDocumentFragment();

  (data || []).forEach((p, index) => {
    const tr = document.createElement("tr");
    tr.align = "center";

    const detail = p.presensi_detail?.[0];
    let waktuFormatted = "-";
    if (detail?.waktu_presensi) {
      const dt = new Date(detail.waktu_presensi);
      waktuFormatted = dt.toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short"
      });
    }

    let lokasiButton = "-";
    if (detail?.latitude && detail?.longitude) {
      const mapsUrl = `https://www.google.com/maps?q=${detail.latitude},${detail.longitude}`;
      lokasiButton = `
        <a href="${mapsUrl}" target="_blank" class="btn-sm btn-info" style="padding: 10px 10px; background: #17a2b8; color: white; border-radius: 4px; text-decoration: none; font-size: 12px;">
          📍 Lihat Lokasi
        </a>
      `;
    }

    const statusHtml = typeof badgeStatus === "function" ? badgeStatus(p.status) : p.status;
    const hapusHtml =
      p.status === "MENUNGGU" || p.status === "HADIR"
        ? `<button type="button" class="btn-danger btn-hapus" data-id="${p.id}">Hapus</button>`
        : "";

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${waktuFormatted}</td>
      <td>${lokasiButton}</td>
      <td>
        <button type="button" class="btnLihatFoto" data-id="${p.id}">📄 Lihat Foto</button>
      </td>
      <td>${statusHtml}</td>
      <td>${hapusHtml}</td>
    `;

    fragment.appendChild(tr);
  });

  tbody.replaceChildren(fragment);
}

async function hapusPresensi(id) {
  if (!confirm("Yakin ingin menghapus presensi ini?")) {
    return;
  }

  const { data, error } = await supabase
    .from("pengajuan")
    .select("status")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    showToast("Gagal memuat data presensi.", "error");
    return;
  }

  if (data.status !== "MENUNGGU" && data.status !== "HADIR") {
    showToast("Presensi yang sudah diproses tidak dapat dihapus.", "error");
    return;
  }

  const pegawai = await getCurrentPegawai();

  const { data: updateData, error: updateError } = await supabase
    .from("pengajuan")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: pegawai?.id || null,
      delete_reason: "Dihapus oleh pegawai"
    })
    .eq("id", id)
    .select("id");

  if (updateError) {
    console.error(updateError);
    showToast("Gagal menghapus presensi.", "error");
    return;
  }

  if (!updateData || updateData.length === 0) {
    showToast("Presensi gagal dihapus (tidak memiliki izin update).", "error");
    return;
  }

  showToast("Presensi berhasil dihapus.", "success");
  await loadRiwayatPresensi();
}

async function lihatFotoPresensi(id) {
  const { data, error } = await supabase
    .from("presensi_detail")
    .select("foto_url")
    .eq("pengajuan_id", id)
    .single();

  if (error || !data?.foto_url) {
    console.error(error);
    return;
  }

  const { data: urlData, error: urlError } = await supabase
    .storage
    .from("bukti_presensi")
    .createSignedUrl(data.foto_url, 60);

  if (urlError || !urlData?.signedUrl) {
    console.error(urlError);
    return;
  }

  window.open(urlData.signedUrl, "_blank");
}