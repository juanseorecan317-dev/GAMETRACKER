import express from "express";
import Game from "../models/Game.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.json(games);
  } catch (error) {
    console.error("Error al obtener juegos:", error.message);
    res.status(500).json({ message: "Error al obtener juegos" });
  }
});

router.post("/", async (req, res) => {
  try {
    const game = new Game(req.body);
    const saved = await game.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error al crear juego:", error.message);
    res.status(400).json({ message: "Error al crear juego" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Game.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Error al actualizar juego:", error.message);
    res.status(400).json({ message: "Error al actualizar juego" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Game.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }
    res.json({ message: "Juego eliminado" });
  } catch (error) {
    console.error("Error al eliminar juego:", error.message);
    res.status(400).json({ message: "Error al eliminar juego" });
  }
});

export default router;
