import "dotenv/config";

import express from "express";

import cors from "cors";

import analysisRoutes from "./routes/analysisRoutes.js";

import {
  errorHandler,
} from "./middleware/errorHandler.js";

const app = express();

const PORT =
  process.env.PORT || 4000;

const CLIENT_URL =
  process.env.CLIENT_URL ||
  "http://localhost:3000";

app.use(
  cors({
    origin: CLIENT_URL,
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message:
      "Audio Word Cloud API is running.",
  });
});

app.use(
  "/api",
  analysisRoutes,
);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT}`,
  );
});