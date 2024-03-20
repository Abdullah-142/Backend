import multer from "multer";


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
export const upload = multer(
  {
    storage: storage,
  }
);
