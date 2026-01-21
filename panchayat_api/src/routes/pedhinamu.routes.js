import { Router } from "express";
import multer from "multer";
import path from "path";
import auth from "../middleware/auth.js";
import {
  createPedhinamu,
  getPedhinamus,
  saveFullForm,
  getFullPedhinamu,
  updatePedhinamuTree,
  softDeletePedhinamu
} from "../controllers/pedhinamu.controller.js";

const router = Router();

/* ------------------------------------------
   MULTER CONFIG (FIXED)
---------------------------------------------*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      file.fieldname +
      "-" +
      uniqueSuffix +
      path.extname(file.originalname)
    );
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

/* ------------------------------------------
   BASIC PEDHINAMU
---------------------------------------------*/
router.post("/", auth, createPedhinamu);      // create basic pedhinamu
router.get("/", auth, getPedhinamus);         // list with pagination

/* ------------------------------------------
   UPDATE FAMILY TREE
---------------------------------------------*/
router.put("/:id", auth, updatePedhinamuTree);
router.put("/:id/tree", auth, updatePedhinamuTree);

/* ------------------------------------------
   FULL FORM (🔥 FINAL FIX 🔥)
   - applicantPhoto (single)
   - panchPhotos (multiple)
---------------------------------------------*/
router.post(
  "/form/:id",
  auth,
  upload.fields([
    { name: "applicantPhoto", maxCount: 1 },
    { name: "panchPhotos", maxCount: 10 }
  ]),
  saveFullForm
);

/* ------------------------------------------
   GET FULL PEDHINAMU (basic + form)
---------------------------------------------*/
router.get("/:id", auth, getFullPedhinamu);

/* ------------------------------------------
   SOFT DELETE
---------------------------------------------*/
router.delete("/:id", auth, softDeletePedhinamu);

export default router;
