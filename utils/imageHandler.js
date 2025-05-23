const multer = require("multer");
const path = require("path");

let validImageCount = 0;


const storage = multer.diskStorage({
    destination: function(req,file,callback){
        callback(null, path.join(__dirname,"../public/uploaded-images"));
    },
    filename: function(req,file,callback){
        const name = Date.now()+'-'+ file.originalname;
        console.log("📸 Saving file as:", name);

        callback(null,name);
    }
})

const validMimeTypes = ['image/png','image/jpeg','image/webp', 'image/avif'];


const fileFilter = (req,file,callback) =>{
    console.log("🚀 File is reaching multer fileFilter:", file.originalname, file.mimetype);

    if(validMimeTypes.includes(file.mimetype)){
        callback(null,true)
    }else{
        callback(null,false)
    }
};

const upload = multer({storage: storage,fileFilter: fileFilter});

module.exports = {upload};