import { useEffect, useState } from "react";
import { api } from "../services/api.js";

function StatsView() {
  const [games, setGames] = useState([]);
  const [reviews, setReviews] = useState([]);

  const fetchAll = async () => {
    try {
      const [gamesRes, reviewsRes] = await Promise.all([
        api.get("/games"),
        api.get("/reviews"),
      ]);
      setGames(gamesRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const totalGames = games.length;
  const completed = games.filter((g) => g.status === "completado").length;
  const playing = games.filter((g) => g.status === "jugando").length;
  const pending = games.filter((g) => g.status === "pendiente").length;
  const totalHours = games.reduce((sum, g) => sum + (g.hoursPlayed || 0), 0);
  const averageRating =
    games.length > 0
      ? games.reduce((sum, g) => sum + (g.rating || 0), 0) / games.length
      : 0;

  const topFavorites = games
    .filter((g) => g.favorite)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  return (
    <section className="view">
      <header className="view-header">
        <h2>📊 Estadísticas personales</h2>
        <p>
          Un resumen visual de tu progreso como gamer basado en tu biblioteca y
          reseñas.
        </p>
      </header>

      <div className="stats-grid">
        <div className="card stat-card">
          <h3>Total de juegos</h3>
          <p className="stat-number">{totalGames}</p>
          <p className="muted">En tu biblioteca</p>
        </div>

        <div className="card stat-card">
          <h3>Estado de juegos</h3>
          <ul className="status-list">
            <li>
              <span className="dot dot-green" /> Completados: {completed}
            </li>
            <li>
              <span className="dot dot-yellow" /> Jugando: {playing}
            </li>
            <li>
              <span className="dot dot-gray" /> Pendientes: {pending}
            </li>
          </ul>
        </div>

        <div className="card stat-card">
          <h3>Horas jugadas</h3>
          <p className="stat-number">{totalHours}</p>
          <p className="muted">Horas totales registradas</p>
        </div>

        <div className="card stat-card">
          <h3>Rating promedio</h3>
          <p className="stat-number">
            {averageRating ? averageRating.toFixed(1) : "0.0"} / 5
          </p>
          <p className="muted">De todos tus juegos</p>
        </div>
      </div>

      <div className="grid-two margin-top">
        <div className="card">
          <h3>⭐ Favoritos destacados</h3>
          {topFavorites.length === 0 && (
            <p className="muted">
              Marca juegos como favoritos en la biblioteca para verlos aquí.
            </p>
          )}
          <div className="cards-list">
            {topFavorites.map((g) => (
              <article key={g._id} className="mini-card">
                <div className="mini-cover">
                  {g.coverUrl ? (
                    <img src={g.coverUrl} alt={g.title} />
                  ) : (
                    <div className="mini-placeholder" />
                  )}
                </div>
                <div>
                  <h4>{g.title}</h4>
                  <p className="muted">
                    {g.platform} • Rating: {g.rating}/5
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Últimas reseñas</h3>
          {reviews.length === 0 && (
            <p className="muted">
              Cuando escribas reseñas, aparecerán aquí las más recientes.
            </p>
          )}
          <ul className="reviews-mini-list">
            {reviews.slice(0, 5).map((r) => (
              <li key={r._id}>
                <strong>{r.title}</strong>{" "}
                <span className="muted">
                  ({r.game?.title || "Juego desconocido"}) - ⭐{" "}
                  {r.rating?.toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default StatsView;
