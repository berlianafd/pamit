import { supabase } from "../js/supabase.js";

const TEMPLATE_CUTI = "assets/template_cuti.docx";

export async function generateFormCuti(pengajuanId) {

    try {

        const { data, error } = await supabase

            .from("pengajuan")

            .select(`
                *,
                pegawai:pengajuan_pegawai_id_fkey(
                    id,
                    nama,
                    nip,
                    jabatan,
                    pangkatgol,
                    nohp,
                    unit_kerja,
                    jenis_pegawai
                ),
                cuti_tahunan_detail(*),
                cuti_tahunan_tanggal(*),
                cuti_sakit_detail(*),
                cuti_alasan_penting_detail(*)
            `)

            .eq("id", pengajuanId)

            .single();

        if (error) throw error;

        const pegawai = data.pegawai;

        const atasan = await getAtasan(pegawai);

        const tahun = new Date().getFullYear();

        const { data: saldoCuti, error: saldoError } = await supabase

            .from("saldo_cuti")

            .select("tahun,sisa")

            .eq("pegawai_id", pegawai.id)

            .in("tahun", [
                tahun,
                tahun - 1,
                tahun - 2
            ]);

        if (saldoError) throw saldoError;

        const saldoMap = {};

        saldoCuti.forEach(item => {

            saldoMap[item.tahun] = item.sisa;

        });

        let alasan = "";

        let alamat = "";

        let tglMulai = "";

        let tglSelesai = "";

        let lamaHari = 0;

        if (data.jenis_pengajuan == "CUTI_TAHUNAN") {

            const detail = data.cuti_tahunan_detail[0];

            alasan = detail.alasan;

            alamat = detail.alamat_cuti;

            const rentang =
                ambilRentangTanggal(

                    data.cuti_tahunan_tanggal

                );

            tglMulai =
                rentang.mulai;

            tglSelesai =
                rentang.selesai;

            lamaHari =
                rentang.jumlah;

        }

        else if (data.jenis_pengajuan == "CUTI_SAKIT") {

            const detail =

                data.cuti_sakit_detail[0];

            alasan = "Sakit";

            alamat =

                detail.alamat ?? "";

            tglMulai =

                detail.tanggal_mulai;

            tglSelesai =

                detail.tanggal_selesai;

            lamaHari =

                detail.jumlah_hari;

        } else if (data.jenis_pengajuan == "CUTI_ALASAN_PENTING") {
            const detail =

                data.cuti_alasan_penting_detail[0];

            alasan = detail.alasan ?? "";

            alamat =

                detail.alamat ?? "";

            tglMulai =

                detail.tanggal_mulai;

            tglSelesai =

                detail.tanggal_selesai;

            lamaHari =

                detail.jumlah_hari;
        }

        const templateData = {

            jenis_cuti_header:

                namaJenisCutiHeader(
                    data.jenis_pengajuan
                ),

            jenis_cuti:

                namaJenisCuti(
                    data.jenis_pengajuan
                ),

            cek_ct:
                data.jenis_pengajuan === "CUTI_TAHUNAN"
                    ? "✓"
                    : "",

            cek_cs:
                data.jenis_pengajuan === "CUTI_SAKIT"
                    ? "✓"
                    : "",

            cek_cap:
                data.jenis_pengajuan === "CUTI_ALASAN_PENTING"
                    ? "✓"
                    : "",

            jenis_nip:
                pegawai.jenis_pegawai === "PNS"
                    ? "NIP\t"
                    : "NIPPPK",

            tahun_sekarang:

                tahun,

            nama:

                pegawai.nama,

            NIP:

                pegawai.nip,

            jabatan:

                pegawai.jabatan,

            pangkatgol:

                pegawai.pangkatgol,

            tanggal_sekarang:

                formatTanggal(new Date()),

            masa_kerja:

                hitungMasaKerja(
                    pegawai.nip
                ),

            alasan:

                alasan,

            tgl_mulai:

                formatTanggal(
                    tglMulai
                ),

            tgl_selesai:

                formatTanggal(
                    tglSelesai
                ),

            lama_hari:

                lamaHari,

            lama_hari_terbilang:

                terbilang(
                    lamaHari
                ),

            alamat:

                alamat,

            tahun:

                tahun,

            tahun1:

                tahun - 1,

            tahun2:

                tahun - 2,

            sisa_cuti_n:

                getSaldo(saldoMap, tahun),

            sisa_cuti_n1:

                getSaldo(saldoMap, tahun - 1),

            sisa_cuti_n2:

                getSaldo(saldoMap, tahun - 2),

            nohp: pegawai.nohp ?? "",

            atasan1: atasan.atasan1,

            nip_atasan1: atasan.nip_atasan1,

            atasan2: atasan.atasan2,

            nip_atasan2: atasan.nip_atasan2,

            paraf_jabatan: atasan.jabatan_atasan1,

            jenis_pegawai:
                pegawai.jenis_pegawai === "PNS"
                    ? "Pegawai Negeri Sipil"
                    : "Pegawai Pemerintah dengan Perjanjian Kerja"


        };


        // ==============================
        // LOAD TEMPLATE WORD
        // ==============================

        await renderTemplate(

            templateData,

            `FORM ${namaJenisCuti(data.jenis_pengajuan)} - ${pegawai.nama} - ${tglMulai}.docx`

        );


        // ==============================
        // UPDATE CATATAN ADMIN
        // ==============================

        await supabase

            .from("pengajuan")

            .update({

                catatan_admin:

                    "Dokumen sedang dalam penyusunan dan diajukan untuk penandatanganan."

            })

            .eq("id", pengajuanId);

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }



}

function namaJenisCutiHeader(jenis) {

    return jenis == "CUTI_TAHUNAN"

        ? "CUTI TAHUNAN"

        : jenis == "CUTI_SAKIT"

            ? "CUTI SAKIT"

            : "CUTI ALASAN PENTING";

}

function namaJenisCuti(jenis) {

    return jenis == "CUTI_TAHUNAN"

        ? "cuti tahunan"

        : jenis == "CUTI_SAKIT"

            ? "cuti sakit"

            : "cuti alasan penting";

}

function formatTanggal(tanggal) {

    return new Date(tanggal)

        .toLocaleDateString("id-ID", {

            day: "numeric",

            month: "long",

            year: "numeric"

        });

}

function hitungMasaKerja(nip) {

    if (!nip) return "";

    const tahunPengangkatan =

        Number(

            nip.substring(8, 12)

        );

    const sekarang =

        new Date().getFullYear();

    return `${sekarang - tahunPengangkatan} Tahun`;

}

function ambilRentangTanggal(daftar) {

    const tanggal =
        daftar
            .map(x => x.tanggal)
            .sort();

    return {

        mulai:
            tanggal[0],

        selesai:
            tanggal[tanggal.length - 1],

        jumlah:
            tanggal.length

    };

}

async function renderTemplate(templateData, namaFile) {

    const response = await fetch(TEMPLATE_CUTI);

    if (!response.ok) {

        throw new Error("Template Word tidak ditemukan.");

    }

    const content = await response.arrayBuffer();

    const zip = new PizZip(content);

    const doc = new window.docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true
    });

    doc.render(templateData);

    const blob = doc

        .getZip()

        .generate({

            type: "blob",

            mimeType:
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        });

    window.saveAs(blob, namaFile);

}

function getSaldo(

    saldoMap,

    tahun

) {

    return saldoMap[tahun] ?? 0;

}

function namaFile(

    pegawai,

    jenis

) {

    return
    `${jenis} - ${pegawai.nama}.docx`;

}

function terbilang(n) {

    n = parseInt(n);

    const angka = [

        "",

        "Satu",

        "Dua",

        "Tiga",

        "Empat",

        "Lima",

        "Enam",

        "Tujuh",

        "Delapan",

        "Sembilan",

        "Sepuluh",

        "Sebelas"

    ];

    if (n < 12)

        return angka[n];

    if (n < 20)

        return terbilang(n - 10) + " Belas";

    if (n < 100)

        return (

            terbilang(Math.floor(n / 10))

            + " Puluh "

            + terbilang(n % 10)

        );

    if (n < 200)

        return "Seratus " + terbilang(n - 100);

    if (n < 1000)

        return (

            terbilang(Math.floor(n / 100))

            + " Ratus "

            + terbilang(n % 100)

        );

    if (n < 2000)

        return "Seribu " + terbilang(n - 1000);

    if (n < 1000000)

        return (

            terbilang(Math.floor(n / 1000))

            + " Ribu "

            + terbilang(n % 1000)

        );

    if (n < 1000000000)

        return (

            terbilang(Math.floor(n / 1000000))

            + " Juta "

            + terbilang(n % 1000000)

        );

    return (

        terbilang(Math.floor(n / 1000000000))

        + " Miliar "

        + terbilang(n % 1000000000)

    );

}

const SEKDA_FIXED = {
    nama: "Dr. Ir. BUDIAR, M.Si",
    nip: "197011191996031004",
    jabatan: "Sekretaris Daerah"
};

const UNIT_SEKRETARIAT = [
    "Sub Bagian Umum dan Kepegawaian",
    "Sub Bagian Keuangan",
    "Sekretariat"
];

// Isi NIP pegawai staf bidang PDIP yang menjadi Plt. Kasubbag Umpeg
// (lebih aman dibanding hanya mengandalkan teks jabatan)
const PLT_KASUBBAG_UMPEG = {
    nip: "197408132000031005",
    unitAsal: "Sub Bagian Umum dan Kepegawaian",
    jabatanPlt: "Plt. Kepala Sub Bagian Umum dan Kepegawaian"
};

const PLT_KABID_MAP = {
    "Bidang Pengelolaan Informasi Administrasi Kependudukan": {
        targetUnit: "Bidang Pemanfaatan Data dan Inovasi Pelayanan",
        jabatanPlt: "Plt. Kepala Bidang Pengelolaan Informasi Administrasi Kependudukan"
    }
};

async function cariPejabat({ jabatanPattern, unitKerja = null, nip = null, labelError }) {
    let query = supabase
        .from("pegawai")
        .select("nama,nip,jabatan,unit_kerja")
        .eq("aktif", true);

    if (nip) {
        query = query.eq("nip", nip);
    } else {
        query = query.ilike("jabatan", jabatanPattern);
        if (unitKerja) {
            query = query.eq("unit_kerja", unitKerja);
        }
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
        console.error(`ERROR ${labelError}:`, error);
    }

    return data ?? null;
}

function formatHasil(atasan1, atasan2) {
    return {
        atasan1: atasan1?.nama ?? "",
        nip_atasan1: atasan1?.nip ?? "",
        jabatan_atasan1: atasan1?.jabatan ?? "",
        atasan2: atasan2?.nama ?? "",
        nip_atasan2: atasan2?.nip ?? "",
        jabatan_atasan2: atasan2?.jabatan ?? ""
    };
}

async function getAtasan(pegawai) {
    const jabatanLower = (pegawai?.jabatan || "").toLowerCase();
    const unitKerja = pegawai?.unit_kerja || "";
    const isPltKasubbagUmpeg = Boolean(pegawai?.nip && pegawai.nip === PLT_KASUBBAG_UMPEG.nip);

    // 1. Kabid, Sekretaris, atau Plt. Kasubbag Umpeg sendiri
    //    -> Atasan 1: Sekretaris (jika Plt. Kasubbag Umpeg) atau Kepala Dinas
    if (isPltKasubbagUmpeg) {
        const [sekretaris, kadis] = await Promise.all([
            cariPejabat({ jabatanPattern: "%Sekretaris%", labelError: "SEKRETARIS" }),
            cariPejabat({ jabatanPattern: "%Kepala Dinas%", labelError: "KADIS" })
        ]);
        return formatHasil(sekretaris, kadis);
    }

    if (jabatanLower.includes("kepala bidang") || jabatanLower.includes("sekretaris")) {
        const kadis = await cariPejabat({
            jabatanPattern: "%Kepala Dinas%",
            labelError: "KADIS"
        });
        return formatHasil(kadis, SEKDA_FIXED);
    }

    // 2. Unit Sekretariat & Sub Bagian
    if (UNIT_SEKRETARIAT.includes(unitKerja)) {
        if (jabatanLower.includes("kepala sub bagian")) {
            const [sekretaris, kadis] = await Promise.all([
                cariPejabat({ jabatanPattern: "%Sekretaris%", labelError: "SEKRETARIS" }),
                cariPejabat({ jabatanPattern: "%Kepala Dinas%", labelError: "KADIS" })
            ]);
            return formatHasil(sekretaris, kadis);
        }

        const [kasubbag, sekretaris] = await Promise.all([
            unitKerja === PLT_KASUBBAG_UMPEG.unitAsal
                ? cariPejabat({ nip: PLT_KASUBBAG_UMPEG.nip, labelError: "PLT_KASUBBAG_UMPEG" })
                : cariPejabat({
                    jabatanPattern: "%Kepala Sub Bagian%",
                    unitKerja,
                    labelError: "KASUBBAG"
                }),
            cariPejabat({
                jabatanPattern: "%Sekretaris%",
                labelError: "SEKRETARIS"
            })
        ]);

        const atasan1 = kasubbag && unitKerja === PLT_KASUBBAG_UMPEG.unitAsal
            ? { ...kasubbag, jabatan: PLT_KASUBBAG_UMPEG.jabatanPlt }
            : kasubbag;

        return formatHasil(atasan1, sekretaris);
    }

    // 3. Staf Bidang (termasuk staf bidang PDIP yang merangkap Plt. Kasubbag Umpeg)
    const pltConfig = PLT_KABID_MAP[unitKerja];
    const targetUnit = pltConfig ? pltConfig.targetUnit : unitKerja;

    const [kabid, kadis] = await Promise.all([
        cariPejabat({
            jabatanPattern: "%Kepala Bidang%",
            unitKerja: targetUnit,
            labelError: "KABID"
        }),
        cariPejabat({
            jabatanPattern: "%Kepala Dinas%",
            labelError: "KADIS"
        })
    ]);

    const atasan1 = kabid && pltConfig
        ? { ...kabid, jabatan: pltConfig.jabatanPlt }
        : kabid;

    return formatHasil(atasan1, kadis);
}