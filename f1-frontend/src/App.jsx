import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ModelViewerCanvas from './components/ModelViewerCanvas.jsx';
import { useModelConfigs } from './hooks/useModelConfigs.js';

const navItems = [
    { text: 'F1-Fever', slug: 'main' },
    { text: 'Teams', slug: 'teams' },
    { text: 'Tracks', slug: 'tracks' },
    { text: 'Records Book', slug: 'records' },
    { text: 'How it works', slug: 'how-it-works' },
    { text: 'History', slug: 'history' },
    { text: 'Breaking News', slug: 'breaking-news' }
];

function App() {
    const { models, loading, error } = useModelConfigs();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeNavIndex, setActiveNavIndex] = useState(0);
    const [activeModelIndex, setActiveModelIndex] = useState(0);

    const handleNavClick = useCallback(
        (index) => {
            setActiveNavIndex(index);
            const slug = navItems[index]?.slug;
            const modelIndex = models.findIndex((model) => model.slug === slug);
            if (modelIndex >= 0) {
                setActiveModelIndex(modelIndex);
            }
            setSidebarOpen(false);
        },
        [models]
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
                            onClick={() => handleNavClick(index)}
                        >
                            {item.text}
                        </motion.button>
                    ))}
                </div>
            </motion.aside>

            <main className="viewer" id="viewer">
                {viewerContent}
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