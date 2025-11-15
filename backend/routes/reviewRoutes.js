import express from "express";
import Review from "../models/Review.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { gameId } = req.query;
    const filter = gameId ? { game: gameId } : {};
    const reviews = await Review.find(filter)
      .populate("game", "title coverUrl")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error("Error al obtener reseñas:", error.message);
    res.status(500).json({ message: "Error al obtener reseñas" });
  }
});

router.post("/", async (req, res) => {
  try {
    const review = new Review(req.body);
    const saved = await review.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error al crear reseña:", error.message);
    res.status(400).json({ message: "Error al crear reseña" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("game", "title coverUrl");

    if (!updated) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error al actualizar reseña:", error.message);
    res.status(400).json({ message: "Error al actualizar reseña" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    res.json({ message: "Reseña eliminada" });
  } catch (error) {
    console.error("Error al eliminar reseña:", error.message);
    res.status(400).json({ message: "Error al eliminar reseña" });
  }
});

export default router;
