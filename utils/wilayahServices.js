// =====================================================
// WILAYAH ALAMAT CUTI
// Provinsi → Kabupaten/Kota → Kecamatan → Desa/Kelurahan
// =====================================================

export async function initWilayahCuti() {

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