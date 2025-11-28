import express from "express";

import { createDocument, getDocument } from "../controller/document";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

router.post("/", authMiddleware, createDocument);
router.get("/:id", authMiddleware, getDocument);

export default router;
