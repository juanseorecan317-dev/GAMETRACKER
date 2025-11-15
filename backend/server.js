import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db.js";
import gameRoutes from "./routes/gameRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import externalGamesRoutes from "./routes/externalGamesRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "GameTracker API with IGDB is running" });
});

app.use("/api/games", gameRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/external-games", externalGamesRoutes);

app.use((err, req, res, next) => {
  console.error("Unexpected error:", err);
  res.status(500).json({ message: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
