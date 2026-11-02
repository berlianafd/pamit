export function presensiPage() {
  return `
  <div class="card">
      <div class="page-header">
          <div>
              <h2>Presensi Kehadiran</h2>
              <p>
                  Lakukan presensi harian dengan verifikasi lokasi dan foto geotag.
              </p>
          </div>
          <img
              src="assets/img/calendar.png"
              class="header-icon">
      </div>

      <!-- FORM PRESENSI (Tag pembuka ditambahkan di sini) -->
      <form id="attendanceForm">

          <!-- Informasi Waktu & Peta Lokasi -->
          <div class="tanggal-row" style="background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 20px;">
              <div class="tanggal-item" style="margin-bottom: 10px;">
                  <label><strong>Waktu Real-time:</strong></label>
                  <p id="liveDateTime" style="margin: 5px 0 0 0; font-size: 14px; color: #333;">Memuat waktu...</p>
              </div>
              <div class="tanggal-item">
                  <label><strong>Titik Lokasi GPS (Wajib Menyalakan GPS dan Memberi Izin Akses Lokasi):</strong></label>
                  <!-- Wadah Peta Leaflet -->
                  <div id="map" style="width: 100%; height: 200px; border-radius: 8px; margin-top: 5px; border: 1px solid #ccc; z-index: 1;"></div>
                  <p id="locationStatus" style="margin: 5px 0 0 0; font-size: 12px; color: #007bff;">Mendeteksi lokasi...</p>
              </div>
          </div>
         
          <!-- Tombol / Area Kamera Geotag -->
          <div class="form-group">
              <label>Foto Kehadiran (Geotag)</label>
              <br>
              <button
                  type="button"
                  id="openCameraBtn"
                  class="btn-primary"
                  style="margin-bottom: 10px;"
              >
                  Buka Kamera
              </button>

              <!-- Container Preview Kamera -->
              <div id="cameraPreviewContainer" style="display:none; margin-top: 10px; border: 1px solid #ddd; padding: 10px; border-radius: 8px; background: #000;">
                  <video id="video" width="100%" autoplay playsinline style="max-height: 300px; display: block; margin: 0 auto; border-radius: 5px;"></video>
                  <div style="text-align: center; margin-top: 10px;">
                      <button type="button" id="captureBtn" class="btn-primary" style="background: #28a745;">Ambil Foto</button>
                  </div>
              </div>

              <canvas id="canvas" style="display:none;"></canvas>
              
              <!-- Hasil Foto yang sudah diambil -->
              <div>
                  <img id="capturedImage" style="max-width: 100%; max-height: 250px; display:none; margin-top: 10px; border-radius: 8px; border: 1px solid #ddd;" />
              </div>
          </div>

          <!-- Hidden Input untuk dikirim ke Backend -->
          <input type="hidden" id="latitude" name="latitude">
          <input type="hidden" id="longitude" name="longitude">
          <input type="hidden" id="attendanceTime" name="attendanceTime">
          <input type="file" id="photoFile" name="photoFile" style="display:none;" required>

          <div class="form-action">
              <button
                  type="submit"
                  id="btnSimpanAbsen"
                  class="btn-primary"
              >
                  Submit Absen
              </button>
          </div>
      </form>
  </div>
  
  <br>

  <div class="card">
      <hr>
      <h3>Riwayat Presensi</h3>
      <table>
          <thead>
              <tr>
                  <th>No</th>
                  <th>Tanggal & Waktu</th>
                  <th>Koordinat</th>
                  <th>Foto</th>
                  <th>Status</th>
                  <th>Aksi</th>
              </tr>
          </thead>
          <tbody id="riwayatPresensiBody">
              <!-- Data riwayat dimuat via JS -->
          </tbody>
      </table>
  </div>
  `;
}