import express from "express";
import auth from "../middleware/auth.js";
import {
  createCategory,
  getCategories,
  updateCategory,
  softDeleteCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", auth, getCategories);
router.post("/", auth, createCategory);
router.put("/:id", auth, updateCategory);
router.delete("/:id", auth, softDeleteCategory);

export default router;
