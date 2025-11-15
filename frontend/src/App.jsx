import { useEffect, useState } from "react";
import LibraryView from "./components/LibraryView.jsx";
import ReviewsView from "./components/ReviewsView.jsx";
import ExploreView from "./components/ExploreView.jsx";
import StatsView from "./components/StatsView.jsx";

function App() {
  const [currentView, setCurrentView] = useState("library");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className="app">
      <button className="theme-toggle-floating" onClick={toggleTheme}>
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <aside className="sidebar">
        <div>
          <h1 className="logo">GameTracker</h1>
          <p className="subtitle">Tu biblioteca gamer de confianza</p>
        </div>
        <nav className="nav">
          <button
            className={currentView === "library" ? "nav-btn active" : "nav-btn"}
            onClick={() => setCurrentView("library")}
          >
            🎮 Biblioteca
          </button>
          <button
            className={currentView === "reviews" ? "nav-btn active" : "nav-btn"}
            onClick={() => setCurrentView("reviews")}
          >
            ✍️ Reseñas
          </button>
          <button
            className={currentView === "explore" ? "nav-btn active" : "nav-btn"}
            onClick={() => setCurrentView("explore")}
          >
            🌐 Explorar juegos 
          </button>
          <button
            className={currentView === "stats" ? "nav-btn active" : "nav-btn"}
            onClick={() => setCurrentView("stats")}
          >
            📊 Estadísticas
          </button>
        </nav>
        <footer className="sidebar-footer">
          <span>Proyecto final GameTracker</span>
        </footer>
      </aside>

      <main className="main">
        {currentView === "library" && <LibraryView />}
        {currentView === "reviews" && <ReviewsView />}
        {currentView === "explore" && <ExploreView />}
        {currentView === "stats" && <StatsView />}
      </main>
    </div>
  );
}

export default App;
