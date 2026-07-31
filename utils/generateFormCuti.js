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
                cuti_sakit_detail(*)
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

        else {

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

            jenis_pegawai:
                pegawai.jenis_pegawai === "PNS"
                    ? "Pegawai Negeri Sipil"
                    : "Pegawai Pemerintah dengan Perjanjian Kerja"


        };

        // console.log(

        //     templateData

        // );

        // ==============================
        // LOAD TEMPLATE WORD
        // ==============================

        await renderTemplate(

            templateData,

            `FORM ${namaJenisCuti(data.jenis_pengajuan)} - ${pegawai.nama} - ${tglMulai}.docx`

        );

        // const response = await fetch(TEMPLATE_CUTI);

        // if (!response.ok) {

        //     throw new Error("Template Word tidak ditemukan.");

        // }

        // const content = await response.arrayBuffer();

        // const zip = new PizZip(content);
        // const doc = new window.docxtemplater(zip);
        // // const doc = new window.docxtemplater(zip, {

        // //     paragraphLoop: true,

        // //     linebreaks: true

        // // });

        // doc.setData(templateData);

        // try {

        //     doc.render();

        // } catch (e) {

        //     console.error(e);

        //     throw new Error("Template gagal dirender.");

        // }

        // const blob = doc

        //     .getZip()

        //     .generate({

        //         type: "blob",

        //         mimeType:
        //             "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        //     });

        // window.saveAs(

        //     blob,

        //     `FORM ${namaJenisCuti(data.jenis_pengajuan)} - ${pegawai.nama}.docx`

        // );

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

        : "CUTI SAKIT";

}

function namaJenisCuti(jenis) {

    return jenis == "CUTI_TAHUNAN"

        ? "cuti tahunan"

        : "cuti sakit";

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

async function getAtasan(pegawai) {

    let atasan1 = null;
    let atasan2 = null;

    // ======== SEKRETARIAT ========
    if (
        pegawai.unit_kerja == "Sub Bagian Umum dan Kepegawaian" ||
        pegawai.unit_kerja == "Sub Bagian Keuangan" ||
        pegawai.unit_kerja == "Sekretariat"
    ) {
        console.log("UNIT KERJA PEGAWAI:", pegawai.unit_kerja);
        console.log("JABATAN PEGAWAI:", pegawai.jabatan);
        const { data: kasubbag, error: err1 } = await supabase
            .from("pegawai")
            .select("nama,nip")
            .eq("unit_kerja", pegawai.unit_kerja)
            .ilike("jabatan", "%Kepala Sub Bagian%")
            .single();

        if (err1) console.error(err1);

        atasan1 = kasubbag;

        const { data: sekretaris, error: err2 } = await supabase
            .from("pegawai")
            .select("nama,nip")
            .ilike("jabatan", "%Sekretaris%")
            .single();

        if (err2) console.error(err2);

        atasan2 = sekretaris;

    }

    // ======== BIDANG ========
    else {

        const { data: kabid, error: err1 } = await supabase
            .from("pegawai")
            .select("nama,nip")
            .eq("unit_kerja", pegawai.unit_kerja)
            .ilike("jabatan", "%Kepala Bidang%")
            .single();

        if (err1) console.error(err1);

        atasan1 = kabid;

        const { data: kadis, error: err2 } = await supabase
            .from("pegawai")
            .select("nama,nip")
            .ilike("jabatan", "%Kepala Dinas%")
            .single();

        if (err2) console.error(err2);

        atasan2 = kadis;

    }

    return {

        atasan1:
            atasan1?.nama ?? "",

        nip_atasan1:
            atasan1?.nip ?? "",

        atasan2:
            atasan2?.nama ?? "",

        nip_atasan2:
            atasan2?.nip ?? ""

    };

}