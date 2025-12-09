import express from "express";

import {
  createDocument,
  deleteDocument,
  getDocument,
  getDocuments,
  getRecent,
  getShared,
  getStarred,
  renameDocument,
  starDocument,
} from "../controller/document";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

router.post("/", authMiddleware, createDocument);
router.get("/", authMiddleware, getDocuments);
router.get("/recent", authMiddleware, getRecent);
router.get("/shared", authMiddleware, getShared);
router.get("/starred", authMiddleware, getStarred);
router.post("/star", authMiddleware, starDocument);
router.get("/:id", authMiddleware, getDocument);
router.post("/:id", authMiddleware, renameDocument);
router.delete("/:id", authMiddleware, deleteDocument);

export default router;
