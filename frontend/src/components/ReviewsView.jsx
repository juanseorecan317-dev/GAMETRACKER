import { useEffect, useState } from "react";
import { api } from "../services/api.js";

function ReviewsView() {
  const [games, setGames] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({
    game: "",
    title: "",
    content: "",
    rating: 0,
    hoursAtReview: 0,
  });
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchGames = async () => {
    try {
      const { data } = await api.get("/games");
      setGames(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await api.get("/reviews");
      setReviews(data);
    } catch (error) {
      console.error(error);
      setErrorMsg("No se pudieron cargar las reseñas.");
    }
  };

  useEffect(() => {
    fetchGames();
    fetchReviews();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/reviews/${editingId}`, form);
      } else {
        await api.post("/reviews", form);
      }
      setForm({
        game: "",
        title: "",
        content: "",
        rating: 0,
        hoursAtReview: 0,
      });
      setEditingId(null);
      fetchReviews();
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al guardar la reseña.");
    }
  };

  const handleEdit = (review) => {
    setEditingId(review._id);
    setForm({
      game: review.game?._id || review.game,
      title: review.title,
      content: review.content,
      rating: review.rating,
      hoursAtReview: review.hoursAtReview,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta reseña?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      fetchReviews();
    } catch (error) {
      console.error(error);
      setErrorMsg("No se pudo eliminar la reseña.");
    }
  };

  return (
    <section className="view">
      <header className="view-header">
        <h2>✍️ Reseñas</h2>
        <p>Escribe reseñas detalladas de los juegos que has jugado.</p>
      </header>

      <div className="grid-two">
        <form className="card form-card" onSubmit={handleSubmit}>
          <h3>{editingId ? "Editar reseña" : "Nueva reseña"}</h3>

          <label className="field">
            <span>Juego</span>
            <select
              name="game"
              value={form.game}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona un juego...</option>
              {games.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.title}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Título de la reseña</span>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Contenido</span>
            <textarea
              name="content"
              rows="4"
              value={form.content}
              onChange={handleChange}
              required
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Rating (0-5)</span>
              <input
                type="number"
                name="rating"
                min="0"
                max="5"
                step="0.5"
                value={form.rating}
                onChange={handleChange}
              />
            </label>
            <label className="field">
              <span>Horas jugadas al momento</span>
              <input
                type="number"
                name="hoursAtReview"
                min="0"
                value={form.hoursAtReview}
                onChange={handleChange}
              />
            </label>
          </div>

          <button className="primary-btn" type="submit">
            {editingId ? "Guardar cambios" : "Publicar reseña"}
          </button>

          {editingId && (
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setEditingId(null);
                setForm({
                  game: "",
                  title: "",
                  content: "",
                  rating: 0,
                  hoursAtReview: 0,
                });
              }}
            >
              Cancelar edición
            </button>
          )}

          {errorMsg && <p className="error-text">{errorMsg}</p>}
        </form>

        <div className="card">
          <h3>Reseñas recientes</h3>
          {reviews.length === 0 && (
            <p>Aún no has escrito reseñas. ¡Comparte tu opinión!</p>
          )}

          <div className="cards-list">
            {reviews.map((review) => (
              <article key={review._id} className="review-card">
                <header className="review-header">
                  <div>
                    <h4>{review.title}</h4>
                    <p className="muted">
                      {review.game?.title || "Juego desconocido"}
                    </p>
                  </div>
                  <span className="badge">
                    ⭐ {review.rating?.toFixed(1) || "0.0"}
                  </span>
                </header>
                <p className="review-content">{review.content}</p>
                <footer className="review-footer">
                  <span>
                    ⏱ Horas jugadas:{" "}
                    {review.hoursAtReview != null
                      ? review.hoursAtReview
                      : "N/A"}
                  </span>
                  <div className="review-actions">
                    <button
                      className="small-btn"
                      onClick={() => handleEdit(review)}
                    >
                      Editar
                    </button>
                    <button
                      className="small-btn danger"
                      onClick={() => handleDelete(review._id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReviewsView;
