import express from "express";

import {
  createDocument,
  deleteDocument,
  getDocument,
  getDocuments,
  getRecent,
  getShared,
  getStarred,
  getTrash,
  permanentDeleteDocument,
  renameDocument,
  restoreDocument,
  starDocument,
  updateDocument,
} from "../controller/document";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

router.post("/", authMiddleware, createDocument);
router.get("/", authMiddleware, getDocuments);
router.get("/recent", authMiddleware, getRecent);
router.get("/shared", authMiddleware, getShared);
router.get("/starred", authMiddleware, getStarred);
router.get("/trash", authMiddleware, getTrash);
router.post("/star", authMiddleware, starDocument);
router.get("/:id", authMiddleware, getDocument);
router.put("/:id", authMiddleware, updateDocument);
router.post("/rename/:id", authMiddleware, renameDocument);
router.post("/restore/:id", authMiddleware, restoreDocument);
router.delete("/permanent/:id", authMiddleware, permanentDeleteDocument);
router.delete("/:id", authMiddleware, deleteDocument);

export default router;
