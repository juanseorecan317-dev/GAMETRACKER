import { useState } from "react";
import { api } from "../services/api.js";

function ExploreView() {
  const [search, setSearch] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [filterMinRating, setFilterMinRating] = useState(0);
  const [filterYearFrom, setFilterYearFrom] = useState("");
  const [openReviewFor, setOpenReviewFor] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    title: "",
    content: "",
    rating: 5,
    hoursAtReview: 0,
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    setErrorMsg("");
    try {
      const { data } = await api.get("/external-games", {
        params: { search },
      });
      setGames(data.results || []);
    } catch (error) {
      console.error(error);
      setErrorMsg("No se pudieron cargar los juegos desde la API externa.");
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter((game) => {
    if (filterMinRating > 0 && (game.rating || 0) < filterMinRating) {
      return false;
    }
    if (filterYearFrom) {
      if (!game.releaseYear || game.releaseYear < Number(filterYearFrom)) {
        return false;
      }
    }
    return true;
  });

  const addToLibrary = async (game) => {
    try {
      await api.post("/games", {
        title: game.name,
        platform: "Desconocido",
        genre: "",
        coverUrl: game.coverImage || "",
        status: "pendiente",
        rating: 0,
        hoursPlayed: 0,
        favorite: false,
        notes: "",
      });
      alert("Juego agregado a tu biblioteca");
    } catch (error) {
      console.error(error);
      alert("Error al agregar juego (revisa consola del backend)");
    }
  };

  const startReview = (game) => {
    setOpenReviewFor(game.id);
    setReviewForm({
      title: game.name,
      content: "",
      rating: 5,
      hoursAtReview: 0,
    });
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({
      ...prev,
      [name]:
        name === "rating" || name === "hoursAtReview"
          ? value === ""
            ? ""
            : parseFloat(value)
          : value,
    }));
  };

  const submitReview = async (game) => {
    try {
      const { data: savedGame } = await api.post("/games", {
        title: game.name,
        platform: "Desconocido",
        genre: "",
        coverUrl: game.coverImage || "",
        status: "completado",
        rating: reviewForm.rating || 0,
        hoursPlayed: reviewForm.hoursAtReview || 0,
        favorite: false,
        notes: "",
      });

      await api.post("/reviews", {
        game: savedGame._id,
        title: reviewForm.title,
        content: reviewForm.content,
        rating: reviewForm.rating || 0,
        hoursAtReview: reviewForm.hoursAtReview || 0,
      });

      alert("Reseña guardada y juego agregado a tu biblioteca");
      setOpenReviewFor(null);
      setReviewForm({
        title: "",
        content: "",
        rating: 5,
        hoursAtReview: 0,
      });
    } catch (error) {
      console.error(error);
      alert("Error al guardar la reseña (revisa consola del backend)");
    }
  };

  return (
    <section className="view">
      <header className="view-header">
        <h2>🌐 Explorar juegos</h2>
        <p>
          Busca cualquier juego usando la API externa. Puedes agregarlo a tu
          biblioteca o escribir una reseña directamente.
        </p>
      </header>

      <form className="search-bar card" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Busca por nombre: Hollow Knight, Celeste, Minecraft..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="search-filters">
          <div className="field">
            <span>Rating mínimo (externo)</span>
            <select
              value={filterMinRating}
              onChange={(e) => setFilterMinRating(Number(e.target.value))}
            >
              <option value={0}>Todos</option>
              <option value={40}>40+</option>
              <option value={60}>60+</option>
              <option value={75}>75+</option>
              <option value={85}>85+</option>
            </select>
          </div>
          <div className="field">
            <span>Año desde</span>
            <input
              type="number"
              placeholder="Ej. 2015"
              value={filterYearFrom}
              onChange={(e) => setFilterYearFrom(e.target.value)}
            />
          </div>
        </div>
        <button className="primary-btn" type="submit">
          Buscar
        </button>
      </form>

      {loading && <p>Cargando resultados...</p>}
      {errorMsg && <p className="error-text">{errorMsg}</p>}

      <div className="cards-grid">
        {filteredGames.map((game) => (
          <article key={game.id} className="game-card">
            <div className="game-cover-wrapper">
              {game.coverImage ? (
                <img
                  src={game.coverImage}
                  alt={game.name}
                  className="game-cover"
                />
              ) : (
                <div className="game-cover placeholder">Sin imagen</div>
              )}
            </div>
            <div className="game-info">
              <h4>{game.name}</h4>
              <p className="muted">
                {game.releaseYear ? `Año: ${game.releaseYear}` : "Año: N/D"}
              </p>
              <p>
                <strong>Rating externo:</strong>{" "}
                {game.rating ? game.rating.toFixed(1) : "0.0"} / 100
              </p>
            </div>

            <div className="game-actions">
              <button
                className="small-btn"
                type="button"
                onClick={() => addToLibrary(game)}
              >
                ➕ Añadir a biblioteca
              </button>
              <button
                className="small-btn"
                type="button"
                onClick={() => startReview(game)}
              >
                ✍️ Reseñar
              </button>
            </div>

            {openReviewFor === game.id && (
              <div className="review-inline-form">
                <label className="field">
                  <span>Título de la reseña</span>
                  <input
                    type="text"
                    name="title"
                    value={reviewForm.title}
                    onChange={handleReviewChange}
                  />
                </label>
                <label className="field">
                  <span>Contenido</span>
                  <textarea
                    name="content"
                    rows="3"
                    value={reviewForm.content}
                    onChange={handleReviewChange}
                  />
                </label>
                <div className="field-row">
                  <label className="field">
                    <span>Rating (0 - 5, decimales)</span>
                    <input
                      type="number"
                      name="rating"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={reviewForm.rating}
                      onChange={handleReviewChange}
                    />
                  </label>
                  <label className="field">
                    <span>Horas jugadas (decimales)</span>
                    <input
                      type="number"
                      name="hoursAtReview"
                      min="0"
                      step="0.1"
                      value={reviewForm.hoursAtReview}
                      onChange={handleReviewChange}
                    />
                  </label>
                </div>
                <div className="game-actions">
                  <button
                    className="small-btn"
                    type="button"
                    onClick={() => submitReview(game)}
                  >
                    Guardar reseña
                  </button>
                  <button
                    className="small-btn danger"
                    type="button"
                    onClick={() => setOpenReviewFor(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default ExploreView;
