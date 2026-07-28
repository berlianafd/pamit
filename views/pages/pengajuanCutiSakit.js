export function pengajuanCutiSakitPage(){

return `

<h2>

Pengajuan Cuti Sakit

</h2>

<form id="formCutiSakit">

<label>

Tanggal Mulai

</label>
<br>
<input
type="date"
id="tanggalMulai"
>
<br><br>
<label>

Tanggal Selesai

</label>
<br>
<input
type="date"
id="tanggalSelesai"
>
<br><br>

<label>Alamat Saat Cuti</label>
<br>
        <textarea
            id="alamatCutiSakit"
            rows="3"
        ></textarea>

        <br><br>
<label>

Upload Surat Sakit

</label>
<br>
<small>

PDF atau Foto.
Maksimal 2 MB.

</small>
<br>
<input
type="file"
id="suratSakit"
accept=".pdf,image/*"
capture="environment"
>
<br>
<br>
<button
type="button"
class="btn-primary"
id="btnSimpanCutiSakit"
>

Simpan

</button>
<br>

</form>

<hr>

<h3>

Riwayat Pengajuan

</h3>

<table>

<thead>

<tr>

<th>No</th>

<th>Tanggal</th>

<th>Status</th>

<th>Keterangan</th>

<th>Aksi</th>

</tr>

</thead>

<tbody id="riwayatCutiSakitBody">

</tbody>

</table>

`;

}