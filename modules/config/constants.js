export const SUPABASE_URL =
  "https://hyeemyxjcvcheytvyvss.supabase.co";

export const SUPABASE_KEY =
  "sb_publishable_BPm-9ENLAyLMLcmH9MHXtA_yi9MtUkA";

let pegawaiLoginState = null;

export function getPegawaiLogin() {
  return pegawaiLoginState;
}

export function setPegawaiLogin(pegawai) {
  pegawaiLoginState = pegawai;
}

export const KETERANGAN_TK = {
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