import express from "express";
import { getAllItems, createItem, deleteItem, getItemById, updateItem } from "../controller/itemController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getAllItems); // ahora soporta ?q= para búsqueda
router.get("/:id", getItemById);
router.post("/", upload.single("photo"), createItem);
router.put("/:id", upload.single("photo"), updateItem);
router.delete("/:id", deleteItem);

export default router;
