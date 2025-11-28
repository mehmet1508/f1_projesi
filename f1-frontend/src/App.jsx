import { useCallback, useEffect, useMemo, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ModelViewerCanvas from './components/ModelViewerCanvas.jsx';
import { useModelConfigs } from './hooks/useModelConfigs.js';
import TeamsPage from './teams.jsx';
import TracksPage from './tracks.jsx';
import RecordsBookPage from './recordsBook.jsx';
import HowItWorksPage from './howItWorks.jsx';
import HistoryPage from './history.jsx';
import BreakingNewsPage from './news.jsx';

const navItems = [
    { text: 'F1-Fever', slug: 'main' },
    { text: 'Teams', slug: 'teams' },
    { text: 'Tracks', slug: 'tracks' },
    { text: 'Records Book', slug: 'records' },
    { text: 'How ıt works', slug: 'how-it-works' },
    { text: 'Hıstory', slug: 'history' },
    { text: 'Breakıng News', slug: 'breaking-news' }
];

const slugToPath = (slug) => (slug === 'main' ? '/' : `/${slug}`);

const normalizePath = (path) => {
    if (!path) return '/';
    if (path === '/') return '/';
    return path.replace(/\/+$/, '');
};

function App() {
    const { models, loading, error } = useModelConfigs();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeModelIndex, setActiveModelIndex] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();

    const normalizedPath = useMemo(() => normalizePath(location.pathname), [location.pathname]);

    const activeNavIndex = useMemo(() => {
        const foundIndex = navItems.findIndex((item) => slugToPath(item.slug) === normalizedPath);
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

    const viewerContent = useMemo(() => {
        if (loading) {
            return <div className="loading-banner">Model listesi yükleniyor...</div>;
        }
        if (error) {
            return <div className="loading-banner">Model listesi alınırken hata oluştu.</div>;
        }
        return <ModelViewerCanvas models={models} activeIndex={activeModelIndex} />;
    }, [activeModelIndex, models, loading, error]);

    return (
        <div className="layout">
            <motion.aside
                className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}
                id="sidebar"
                initial={false}
                animate={{ width: sidebarOpen ? 280 : 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
                <div className="sidebar-content">
                    {navItems.map((item, index) => (
                        <motion.button
                            key={item.slug}
                            type="button"
                            className={`menu-item nav-link ${activeNavIndex === index ? 'active' : ''}`}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleNavClick(item.slug)}
                        >
                            {item.text}
                        </motion.button>
                    ))}
                </div>
            </motion.aside>

            <main className="viewer" id="viewer">
                <Routes>
                    <Route path="/" element={viewerContent} />
                    <Route path="/teams" element={<TeamsPage />} />
                    <Route path="/tracks" element={<TracksPage />} />
                    <Route path="/records" element={<RecordsBookPage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/breaking-news" element={<BreakingNewsPage />} />
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