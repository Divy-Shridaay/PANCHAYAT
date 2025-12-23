import { Router } from "express";
import multer from "multer";
import path from "path";
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

const upload = multer({ storage });

/* ------------------------------------------
   BASIC PEDHINAMU
---------------------------------------------*/
router.post("/", createPedhinamu);      // create basic pedhinamu
router.get("/", getPedhinamus);         // list with pagination

/* ------------------------------------------
   UPDATE FAMILY TREE
---------------------------------------------*/
router.put("/:id", updatePedhinamuTree);
router.put("/:id/tree", updatePedhinamuTree);

/* ------------------------------------------
   FULL FORM (🔥 FINAL FIX 🔥)
   - applicantPhoto (single)
   - panchPhotos (multiple)
---------------------------------------------*/
router.post(
  "/form/:id",
  upload.fields([
    { name: "applicantPhoto", maxCount: 1 },
    { name: "panchPhotos", maxCount: 10 }
  ]),
  saveFullForm
);

/* ------------------------------------------
   GET FULL PEDHINAMU (basic + form)
---------------------------------------------*/
router.get("/:id", getFullPedhinamu);

/* ------------------------------------------
   SOFT DELETE
---------------------------------------------*/
router.delete("/:id", softDeletePedhinamu);

export default router;
