// frontend/src/components/LibraryView.jsx
import { useEffect, useState } from "react";
import { api } from "../services/api.js";

const emptyGame = {
  title: "",
  platform: "PC",
  genre: "",
  coverUrl: "",
  status: "pendiente",
  rating: 0,
  hoursPlayed: 0,
  favorite: false,
  notes: "",
};

function LibraryView() {
  const [games, setGames] = useState([]);
  const [form, setForm] = useState(emptyGame);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [filterMinRating, setFilterMinRating] = useState(0);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/games");
      setGames(data);
    } catch (error) {
      console.error(error);
      setErrorMsg("No se pudieron cargar los juegos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/games/${editingId}`, form);
      } else {
        await api.post("/games", form);
      }
      setForm(emptyGame);
      setEditingId(null);
      fetchGames();
    } catch (error) {
      console.error(error);
      setErrorMsg("Ocurrió un error al guardar el juego.");
    }
  };

  const handleEdit = (game) => {
    setEditingId(game._id);
    setForm({
      title: game.title,
      platform: game.platform,
      genre: game.genre,
      coverUrl: game.coverUrl,
      status: game.status,
      rating: game.rating,
      hoursPlayed: game.hoursPlayed,
      favorite: game.favorite,
      notes: game.notes,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este juego?")) return;
    try {
      await api.delete(`/games/${id}`);
      fetchGames();
    } catch (error) {
      console.error(error);
      setErrorMsg("No se pudo eliminar el juego.");
    }
  };

  const filteredGames = games.filter((game) => {
    if (filterStatus !== "todos" && game.status !== filterStatus) return false;
    if (filterFavorites && !game.favorite) return false;
    if (filterMinRating > 0 && (game.rating || 0) < filterMinRating)
      return false;

    const text = filterText.toLowerCase();
    if (text) {
      const combined =
        (game.title || "") +
        " " +
        (game.platform || "") +
        " " +
        (game.genre || "");
      if (!combined.toLowerCase().includes(text)) return false;
    }

    return true;
  });

  return (
    <section className="view">
      <header className="view-header">
        <h2>🎮 Biblioteca de juegos</h2>
        <p>Gestiona los juegos que has jugado, estás jugando o quieres jugar.</p>
      </header>

      <div className="grid-two">
        <form className="card form-card" onSubmit={handleSubmit}>
          <h3>{editingId ? "Editar juego" : "Agregar nuevo juego"}</h3>

          <label className="field">
            <span>Título</span>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Plataforma</span>
              <input
                type="text"
                name="platform"
                value={form.platform}
                onChange={handleChange}
              />
            </label>
            <label className="field">
              <span>Género</span>
              <input
                type="text"
                name="genre"
                value={form.genre}
                onChange={handleChange}
              />
            </label>
          </div>

          <label className="field">
            <span>URL de portada</span>
            <input
              type="url"
              name="coverUrl"
              value={form.coverUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Estado</span>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="pendiente">Pendiente</option>
                <option value="jugando">Jugando</option>
                <option value="completado">Completado</option>
              </select>
            </label>

            <label className="field">
              <span>Rating (0 - 5)</span>
              <input
                type="number"
                name="rating"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    rating:
                      e.target.value === ""
                        ? ""
                        : parseFloat(e.target.value),
                  }))
                }
              />
            </label>

            <label className="field">
              <span>Horas jugadas</span>
              <input
                type="number"
                name="hoursPlayed"
                min="0"
                step="0.1"
                value={form.hoursPlayed}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    hoursPlayed:
                      e.target.value === ""
                        ? ""
                        : parseFloat(e.target.value),
                  }))
                }
              />
            </label>
          </div>

          <label className="field checkbox-field">
            <input
              type="checkbox"
              name="favorite"
              checked={form.favorite}
              onChange={handleChange}
            />
            <span>Marcar como favorito ⭐</span>
          </label>

          <label className="field">
            <span>Notas</span>
            <textarea
              name="notes"
              rows="3"
              value={form.notes}
              onChange={handleChange}
            />
          </label>

          <button className="primary-btn" type="submit">
            {editingId ? "Guardar cambios" : "Agregar juego"}
          </button>
          {editingId && (
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setEditingId(null);
                setForm(emptyGame);
              }}
            >
              Cancelar edición
            </button>
          )}
          {errorMsg && <p className="error-text">{errorMsg}</p>}
        </form>

        <div className="card">
          <h3>Mis juegos</h3>
          <div className="filters-row">
            <div className="field">
              <span>Estado</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendientes</option>
                <option value="jugando">Jugando</option>
                <option value="completado">Completados</option>
              </select>
            </div>
            <div className="field">
              <span>Búsqueda</span>
              <input
                type="text"
                placeholder="Filtrar por título, plataforma o género..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
            <div className="field">
              <span>Rating mínimo</span>
              <select
                value={filterMinRating}
                onChange={(e) => setFilterMinRating(Number(e.target.value))}
              >
                <option value={0}>Todos</option>
                <option value={1}>1+</option>
                <option value={2}>2+</option>
                <option value={3}>3+</option>
                <option value={4}>4+</option>
              </select>
            </div>
            <label className="field checkbox-field">
              <input
                type="checkbox"
                checked={filterFavorites}
                onChange={(e) => setFilterFavorites(e.target.checked)}
              />
              <span>Solo favoritos</span>
            </label>
          </div>

          {loading && <p>Cargando juegos...</p>}
          {!loading && games.length === 0 && (
            <p>Aún no has agregado juegos. ¡Empieza con tu favorito!</p>
          )}

          <div className="cards-grid">
            {filteredGames.map((game) => (
              <article key={game._id} className="game-card">
                <div className="game-cover-wrapper">
                  {game.coverUrl ? (
                    <img
                      src={game.coverUrl}
                      alt={game.title}
                      className="game-cover"
                    />
                  ) : (
                    <div className="game-cover placeholder">Sin imagen</div>
                  )}
                  {game.favorite && <span className="badge">⭐ Favorito</span>}
                </div>
                <div className="game-info">
                  <h4>{game.title}</h4>
                  <p className="muted">
                    {game.platform} • {game.genre || "Sin género"}
                  </p>
                  <p>
                    <strong>Estado:</strong> {game.status}
                  </p>
                  <p>
                    <strong>Horas:</strong> {game.hoursPlayed}
                  </p>
                  <p>
                    <strong>Rating:</strong> {game.rating} / 5
                  </p>
                </div>
                <div className="game-actions">
                  <button
                    className="small-btn"
                    onClick={() => handleEdit(game)}
                  >
                    Editar
                  </button>
                  <button
                    className="small-btn danger"
                    onClick={() => handleDelete(game._id)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LibraryView;
