import express from "express";

import { analyseAudio } from "../controllers/analysisController.js";
import { uploadAudio } from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/analyse",
  uploadAudio.single("audio"),
  analyseAudio,
);

export default router;