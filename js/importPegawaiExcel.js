async function importPegawaiExcel(e){

    console.log("IMPORT EXCEL LOADED");
    
    const file = e.target.files[0];

    if(!file) return;

    const buffer = await file.arrayBuffer();

    const workbook = XLSX.read(buffer);

    const sheet =
        workbook.Sheets[
            workbook.SheetNames[0]
        ];

    const rows =
        XLSX.utils.sheet_to_json(sheet);

    console.log(rows);

}