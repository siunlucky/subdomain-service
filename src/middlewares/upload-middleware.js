import multer from "multer";
import path from "path";
import fs from "fs";
import { __dirname, __filename } from "../utils/path.js";

export const createUploadMiddleware = (folder) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__filename, `public/images/${folder}`);

      fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) {
          return cb(err);
        }
        cb(null, dir);
      });
    },
    filename: (req, file, cb) => {
      cb(null, new Date().getTime() + "-" + file.originalname);
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png/;
      const mimetype = filetypes.test(file.mimetype);
      if (mimetype) {
        return cb(null, true);
      }
      cb(new Error("Invalid file type. Only JPEG and PNG are allowed."));
    },
  });

  return upload.single("image");
};
