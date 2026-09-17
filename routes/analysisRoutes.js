import express from "express";
import upload from "../middleware/upload.js";
import { analyseAudio } from "../controllers/analysisController.js";

const router = express.Router();

router.post("/analyse", upload.single("audio"), analyseAudio);

export default router;