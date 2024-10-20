// import multer from "multer";
// import fs from "fs";

// const storage = multer.diskStorage({
//     destination: function(req, res, cb) {
//         const uploadFolderPath ="./public/temp";

//         if(!fs.existsSync(uploadFolderPath)) fs.mkdirSync(uploadFolderPath,{recursive:true});

//         cb(null , uploadFolderPath)
//     },
//     filename: function(res, file , cb) {
//         const uniqueSuffix = Date.now()+ "_" + Math.round(Math.random()* 1e9);

//         cb(null ,"file_" + uniqueSuffix + file.originalname.replace(" ","_"));
//     },
// });

// export const upload = multer( { 
//     storage ,
// });

import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})