const multer = require("multer");

// const path = require("path");
 const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const uniqueName = 
            Date.now() + "-";
        cd(
            null, 
            uniqueName + file.originalname
        );
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;

    const validMineType = allowedTypes.test(file.mimetype);
    const validateExension = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );

    if( validateExension && validMineType ){
        cb(null, true);
    }else{
        cb( new Error('image only'))
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    }
})

module.exports = upload;
