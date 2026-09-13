import express from "express";

const router = express.Router();

router.get("/test", (_req, res) => {
  res.json({
    success: true,
    message: "Analysis route is working.",
  });
});

export default router;