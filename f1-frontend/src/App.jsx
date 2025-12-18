import { useCallback, useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ModelViewerCanvas from "./components/ModelViewerCanvas.jsx";
import { useModelConfigs } from "./hooks/useModelConfigs.js";
import TeamsPage from "./teams.jsx";
import TracksPage from "./tracks.jsx";
import RecordsBookPage from "./recordsBook.jsx";
import HowItWorksPage from "./howItWorks.jsx";
import HistoryPage from "./history.jsx";
import BreakingNewsPage from "./news.jsx";
import MapPage from "./MapPage.jsx";
import RaceInfo from "./raceinfo";

const navItems = [
  { text: "F1-Fever", slug: "main" },
  { text: "Teams", slug: "teams" },
  { text: "Tracks", slug: "tracks" },
  { text: "Records Book", slug: "records" },
  { text: "How it works", slug: "how-it-works" },
  { text: "History", slug: "history" },
  { text: "Breaking News", slug: "breaking-news" },
  { text: "Information of Race ", slug: "raceinfo" },
];

const slugToPath = (slug) => (slug === "main" ? "/" : `/${slug}`);

const normalizePath = (path) => {
  if (!path) return "/";
  if (path === "/") return "/";
  return path.replace(/\/+$/, "");
};

function App() {
  const { models, loading, error } = useModelConfigs();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModelIndex, setActiveModelIndex] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  const normalizedPath = useMemo(
    () => normalizePath(location.pathname),
    [location.pathname]
  );

  const activeNavIndex = useMemo(() => {
    const foundIndex = navItems.findIndex(
      (item) => slugToPath(item.slug) === normalizedPath
    );
    return foundIndex >= 0 ? foundIndex : 0;
  }, [normalizedPath]);

  useEffect(() => {
    const slug = navItems[activeNavIndex]?.slug;
    if (!slug || !models.length) {
      return;
    }
    const modelIndex = models.findIndex((model) => model.slug === slug);
    if (modelIndex >= 0) {
      setActiveModelIndex(modelIndex);
    }
  }, [activeNavIndex, models]);

  const handleNavClick = useCallback(
    (slug) => {
      navigate(slugToPath(slug));
      setSidebarOpen(false);
    },
    [navigate]
  );
  useEffect(() => {
    // SADECE anasayfaya girildiğinde çalışsın
    if (location.pathname === "/") {
      // loading'i resetle
      setModelReady(false);
      setMinTimeElapsed(false);

      // süreyi tekrar başlat
      const timer = setTimeout(() => {
        setMinTimeElapsed(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const viewerContent = useMemo(() => {
    if (error) {
      return (
        <div className="loading-banner">
          Model listesi alınırken hata oluştu.
        </div>
      );
    }

    const isLoading = loading || !minTimeElapsed || !modelReady;

    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {/* 🔴 LOADING PERDESİ */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="loading-container"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 50,
                background: "#0b0b0e",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div className="loading-content loading-car-stage">
                <img src="/images/car.png" className="loading-f1-car" />
                <img
                  src="/images/redtyre.png"
                  className="real-wheel-spin wheel-left"
                />
                <img
                  src="/images/redtyre.png"
                  className="real-wheel-spin wheel-right"
                />

                <div className="loading-text">
                  <style>{`
                     .loading-text {
                     margin-top: 24px;
                     font-size: 0.9rem;
                     letter-spacing: 2px;
                     text-align: center;
                     text-transform: uppercase;
                     color: rgba(255, 255, 255, 0.7);
                     font-family: 'Titillium Web', sans-serif;
                     animation: loadingPulse 1.6s ease-in-out infinite;
                     }

                     @keyframes loadingPulse {
                     0%   { opacity: 0.4; }
                     50%  { opacity: 1; }
                     100% { opacity: 0.4; }
                } 
                `}</style>
                  3D Model ıs loadıng…
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🟢 CANVAS – ARKADA HEP ÇALIŞIR */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          {!loading && models.length > 0 && (
            <ModelViewerCanvas
              models={models}
              activeIndex={activeModelIndex}
              onModelLoaded={() => setModelReady(true)}
            />
          )}
        </div>
      </div>
    );
  }, [loading, error, minTimeElapsed, modelReady, models, activeModelIndex]);

  return (
    <div className="layout">
      <motion.aside
        className={`sidebar ${sidebarOpen ? "" : "collapsed"} ${
          normalizedPath === "/" ? "sidebar--overlay" : ""
        }`}
        id="sidebar"
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        <motion.div
          className="sidebar-content"
          initial={{ opacity: 0 }}
          animate={{
            opacity: sidebarOpen ? 1 : 0,
            pointerEvents: sidebarOpen ? "auto" : "none",
          }}
          transition={{
            duration: 0.3,
            delay: sidebarOpen ? 0.4 : 0,
            ease: "easeOut",
          }}
        >
          {navItems.map((item, index) => (
            <motion.button
              key={item.slug}
              type="button"
              className={`menu-item nav-link ${
                activeNavIndex === index ? "active" : ""
              }`}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleNavClick(item.slug)}
            >
              {item.text.toUpperCase()}
            </motion.button>
          ))}
        </motion.div>
      </motion.aside>

      <main
        className={`viewer ${
          normalizedPath === "/" ? "viewer--no-scroll" : "viewer--scroll"
        }`}
        id="viewer"
      >
        <Routes>
          <Route path="/" element={viewerContent} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/map/:id" element={<MapPage />} />
          <Route path="/tracks" element={<TracksPage />} />
          <Route path="/records" element={<RecordsBookPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/breaking-news" element={<BreakingNewsPage />} />
          <Route path="/raceinfo" element={<RaceInfo />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <motion.button
        className="menu-toggle"
        id="menuToggle"
        onClick={() => setSidebarOpen((prev) => !prev)}
        animate={{ rotate: sidebarOpen ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="hamburger-lines">
          <span />
          <span />
          <span />
        </div>
      </motion.button>
    </div>
  );
}

export default App;

function NotFound() {
  return (
    <div className="page not-found">
      <h1>Sayfa bulunamadı</h1>
      <p>Sol menüden mevcut bölümlerden birini seçebilirsiniz.</p>
    </div>
  );
}
