// import imageCompression
// from "browser-image-compression";

import { supabase } from "../js/supabase.js";


export async function compressImage(file){

  return new Promise(resolve=>{

    const img = new Image();
    const reader = new FileReader();

    reader.onload = e=>{

      img.src = e.target.result;

    };

    img.onload = ()=>{

      const canvas =
        document.createElement("canvas");

      let width = img.width;
      let height = img.height;

      const maxWidth = 1600;

      if(width > maxWidth){

        height =
          height * (maxWidth/width);

        width =
          maxWidth;

      }

      canvas.width = width;
      canvas.height = height;

      const ctx =
        canvas.getContext("2d");

      ctx.drawImage(
        img,
        0,
        0,
        width,
        height
      );

      canvas.toBlob(

        blob=>{

          resolve(

            new File(

              [blob],

              file.name,

              {
                type:"image/jpeg"
              }

            )

          );

        },

        "image/jpeg",

        0.7

      );

    };

    reader.readAsDataURL(file);

  });

}

export async function uploadDokumen(

  bucket,
  prefix,
  pegawaiId,
  file

){

  const ext =
    file.name
      .split(".")
      .pop()
      .toLowerCase();

  let uploadFile = file;

  if(ext !== "pdf"){

    uploadFile =
      await compressImage(file);

  }

  if(uploadFile.size > 2*1024*1024){

    throw new Error(
      "Ukuran file maksimal 2 MB."
    );

  }

  const fileName =
`${prefix}_${pegawaiId}_${Date.now()}.${ext}`;

  const {
    data,
    error
  } =
  await supabase
    .storage
    .from(bucket)
    .upload(
      fileName,
      uploadFile
    );

  if(error){

    throw error;

  }

  return data.path;

}