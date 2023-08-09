const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../public/product-images"));
    },
    filename: function (req, file, cb) {
      const fileName = Date.now() + path.extname(file.originalname);
      cb(null, fileName);
    }
  });

  const addBanner = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "../public/banner-images"));
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

  const editBanner = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "../public/uploads"));
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  
  module.exports = {
    upload: multer({ storage: storage }).array("file"),
    update: multer({ storage: storage }).array("images"),

    addBannerupload: multer({ storage: addBanner }).single("image"),
    editBannerupload: multer({ storage: editBanner }).single("image"),
  }