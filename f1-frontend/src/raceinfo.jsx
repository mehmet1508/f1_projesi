import { useEffect, useMemo, useState, useRef } from "react";
import "./raceinfo.css";

export default function RaceInfo() {

    /* ---------- STATES ---------- */
    const [data, setData] = useState(null);
    const [query, setQuery] = useState("");
    const [activeSection, setActiveSection] = useState(null);
    const containerRef = useRef(null);

    /* ---------- FETCH ---------- */
    useEffect(() => {
        fetch("http://localhost:5000/api/raceinfo")
            .then(res => res.json())
            .then(setData)
            .catch(console.error);
    }, []);

    /* ---------- SCROLL ANIMATION ---------- */
    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const scrollY = window.scrollY;
            const beforeElement = containerRef.current.querySelector('.raceinfo')?.parentElement;
            if (beforeElement) {
                const before = document.querySelector('.raceinfo::before');
                const after = document.querySelector('.raceinfo::after');
                if (before && after) {
                    before.style.backgroundPosition = `0 ${scrollY * 0.5}px, 0 ${10 + scrollY * 0.5}px, 10px ${-10 + scrollY * 0.5}px, -10px ${scrollY * 0.5}px`;
                    after.style.backgroundPosition = `0 ${scrollY * 0.5}px, 0 ${10 + scrollY * 0.5}px, 10px ${-10 + scrollY * 0.5}px, -10px ${scrollY * 0.5}px`;
                }
            }
        };

        // CSS custom property ile daha iyi bir yöntem
        const updateScrollPosition = () => {
            const scrollY = window.scrollY;
            document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
        };

        window.addEventListener('scroll', updateScrollPosition, { passive: true });
        return () => window.removeEventListener('scroll', updateScrollPosition);
    }, []);

    /* ---------- ACTIVE SECTION HIGHLIGHT ---------- */
    useEffect(() => {
        const handleScroll = () => {
            // Sadece info-section'ları kontrol et (flag-timeline-item değil)
            const infoSections = document.querySelectorAll('.info-section');
            const viewportMiddle = window.innerHeight / 2;
            const scrollY = window.scrollY;
            
            let activeId = null;
            
            infoSections.forEach((item) => {
                const rect = item.getBoundingClientRect();
                const itemTop = rect.top + scrollY;
                const itemBottom = itemTop + rect.height;
                
                // Viewport'un ortası item'ın içindeyse aktif
                const viewportMiddleAbsolute = scrollY + viewportMiddle;
                
                if (viewportMiddleAbsolute >= itemTop && viewportMiddleAbsolute <= itemBottom) {
                    activeId = item.id;
                }
            });
            
            setActiveSection(activeId);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // İlk yüklemede kontrol et
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, [data]);

    /* ---------- SEARCH INDEX ---------- */
    const searchIndex = useMemo(() => {
        if (!data) return [];
        
        const allItems = [
            ...data.flags.map(item => ({ ...item, category: 'Flags', categoryId: 'flags' })),
            ...data.penalties.map(item => ({ ...item, category: 'Penalties', categoryId: 'penalties' })),
            ...data.scenarios.map(item => ({ ...item, category: 'Race Scenarios', categoryId: 'scenarios' })),
            ...(data.stewards || []).map(item => ({ ...item, category: 'Steward Decisions', categoryId: 'stewards' })),
            ...(data.strategy || []).map(item => ({ ...item, category: 'Strategy Impact', categoryId: 'strategy' }))
        ];
        
        return allItems.map(item => ({
            id: item.id,
            title: item.title,
            category: item.category,
            categoryId: item.categoryId
        }));
    }, [data]);

    const results = useMemo(() => {
        if (!query.trim()) return [];
        
        const queryLower = query.toLowerCase();
        return searchIndex.filter(item =>
            item.title.toLowerCase().includes(queryLower) ||
            item.category.toLowerCase().includes(queryLower)
        );
    }, [query, searchIndex]);

    /* ---------- LOADING ---------- */
    if (!data) {
        return <div className="loading-banner">Race info loading...</div>;
    }

    /* ---------- JSX ---------- */
    return (
        <div className="raceinfo" ref={containerRef}>
            <h1>Race Control Explained</h1>

            {/* SEARCH */}
            <div className="search-wrapper">
                <div className="search-input-container">
                    <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                        className="raceinfo-search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search flags, penalties, scenarios..."
                        type="text"
                    />
                    {query && (
                        <button 
                            className="search-clear"
                            onClick={() => setQuery("")}
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>

                {query && (
                    <div className="search-dropdown">
                        {results.length === 0 ? (
                            <div className="search-empty">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.35-4.35"></path>
                                </svg>
                                <span>No results found for "{query}"</span>
                            </div>
                        ) : (
                            <>
                                <div className="search-results-count">
                                    {results.length} result{results.length !== 1 ? 's' : ''} found
                                </div>
                                {results.map(r => (
                                    <div
                                        key={r.id}
                                        className="search-item"
                                        onClick={() => {
                                            const element = document.getElementById(r.id);
                                            if (element) {
                                                element.scrollIntoView({ behavior: "smooth", block: "center" });
                                                // Highlight effect
                                                element.classList.add('search-highlight');
                                                setTimeout(() => {
                                                    element.classList.remove('search-highlight');
                                                }, 2000);
                                            }
                                            setQuery("");
                                        }}
                                    >
                                        <div className="search-item-title">{r.title}</div>
                                        <div className="search-item-category">{r.category}</div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* FLAGS */}
            <h2 className="section-title">
                <span className="section-icon">🚩</span>
                Flags
            </h2>
            <div className="flags-timeline">
                {data.flags.map((flag, index) => (
                    <div key={flag.id} id={flag.id} className={`flag-timeline-item ${activeSection === flag.id ? 'active' : activeSection && index < data.flags.findIndex(f => f.id === activeSection) ? 'passed' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className={`flag-timeline-wrapper ${index % 2 === 0 ? 'left' : 'right'}`}>
                            <h3 className="flag-timeline-title">{flag.title}</h3>
                            <div className="flag-timeline-circle">
                                <div className="flag-timeline-icon">
                                    <img src={flag.image} alt={flag.title} />
                                </div>
                            </div>
                            <div className="flag-timeline-content">
                                <div className="flag-timeline-sections">
                                    <div className="flag-timeline-section">
                                        <h4 className="flag-section-heading">Meaning</h4>
                                        <p className="flag-section-text">{flag.sections.meaning}</p>
                                    </div>
                                    <div className="flag-timeline-section">
                                        <h4 className="flag-section-heading">Restriction</h4>
                                        <p className="flag-section-text">{flag.sections.restriction}</p>
                                    </div>
                                    {flag.sections.penalty && (
                                        <div className="flag-timeline-section warning-section">
                                            <h4 className="flag-section-heading warning-heading">⚠️ Penalty</h4>
                                            <p className="flag-section-text warning-text">{flag.sections.penalty}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {index < data.flags.length - 1 && (
                            <svg className="flag-timeline-connector" viewBox="0 0 200 300" preserveAspectRatio="none">
                                <path 
                                    d={index % 2 === 0 
                                        ? "M 200 200 L 200 300"
                                        : "M 0 200 L 0 300"
                                    }
                                    stroke="rgba(255, 45, 45, 0.5)" 
                                    strokeWidth="4" 
                                    fill="none"
                                    strokeLinecap="round"
                                />
                            </svg>
                        )}
                    </div>
                ))}
            </div>

            {/* PENALTIES */}
            <h2 className="section-title">
                <span className="section-icon">⚖️</span>
                Penalties
            </h2>
            {data.penalties.map((p, index) => {
                const isActive = activeSection === p.id;
                const isPassed = activeSection && index < data.penalties.findIndex(pen => pen.id === activeSection);
                return (
                    <section key={p.id} id={p.id} className={`info-section no-image ${isActive ? 'active' : isPassed ? 'passed' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="info-content">
                            <h3>{p.title}</h3>
                            <div className="info-details">
                                <div className="info-detail-item">
                                    <span className="detail-label">Display</span>
                                    <p>{p.sections.display}</p>
                                </div>
                                <div className="info-detail-item">
                                    <span className="detail-label">Reason</span>
                                    <p>{p.sections.reason}</p>
                                </div>
                                <div className="info-detail-item">
                                    <span className="detail-label">Application</span>
                                    <p>{p.sections.application}</p>
                                </div>
                                <div className="info-detail-item">
                                    <span className="detail-label">Impact</span>
                                    <p>{p.sections.impact}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })}

            {/* SCENARIOS, STEWARDS, STRATEGY - Combined Timeline */}
            <div className="flags-timeline">
                {data.scenarios.map((s, index) => {
                    const globalIndex = index;
                    const isActive = activeSection === s.id;
                    const isPassed = activeSection && index < data.scenarios.findIndex(sc => sc.id === activeSection);
                    return (
                        <div key={s.id} id={s.id} className={`flag-timeline-item ${isActive ? 'active' : isPassed ? 'passed' : ''}`} style={{ animationDelay: `${globalIndex * 0.1}s` }}>
                            <div className={`flag-timeline-wrapper ${globalIndex % 2 === 0 ? 'left' : 'right'}`}>
                                <h3 className="flag-timeline-title">{s.title}</h3>
                                <div className="flag-timeline-content">
                                    <div className="flag-timeline-sections">
                                        {Object.values(s.sections).map((text, i) => (
                                            <div key={i} className="flag-timeline-section">
                                                <p className="flag-section-text">{text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {(index < data.scenarios.length - 1 || (data.stewards && data.stewards.length > 0) || (data.strategy && data.strategy.length > 0)) && (
                                <svg className="flag-timeline-connector" viewBox="0 0 200 300" preserveAspectRatio="none">
                                    <path 
                                        d={globalIndex % 2 === 0 
                                            ? "M 200 200 L 200 300"
                                            : "M 0 200 L 0 300"
                                        }
                                        stroke="rgba(255, 45, 45, 0.5)" 
                                        strokeWidth="4" 
                                        fill="none"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            )}
                        </div>
                    );
                })}
                {data.stewards && data.stewards.length > 0 && data.stewards.map((s, index) => {
                    const globalIndex = data.scenarios.length + index;
                    const isActive = activeSection === s.id;
                    const allPrevious = [...data.scenarios, ...data.stewards.slice(0, index)];
                    const isPassed = activeSection && allPrevious.some(item => item.id === activeSection);
                    return (
                        <div key={s.id} id={s.id} className={`flag-timeline-item ${isActive ? 'active' : isPassed ? 'passed' : ''}`} style={{ animationDelay: `${globalIndex * 0.1}s` }}>
                            <div className={`flag-timeline-wrapper ${globalIndex % 2 === 0 ? 'left' : 'right'}`}>
                                <h3 className="flag-timeline-title">{s.title}</h3>
                                <div className="flag-timeline-content">
                                    <div className="flag-timeline-sections">
                                        {Object.values(s.sections).map((text, i) => (
                                            <div key={i} className="flag-timeline-section">
                                                <p className="flag-section-text">{text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {(index < data.stewards.length - 1 || (data.strategy && data.strategy.length > 0)) && (
                                <svg className="flag-timeline-connector" viewBox="0 0 200 300" preserveAspectRatio="none">
                                    <path 
                                        d={globalIndex % 2 === 0 
                                            ? "M 200 200 L 200 300"
                                            : "M 0 200 L 0 300"
                                        }
                                        stroke="rgba(255, 45, 45, 0.5)" 
                                        strokeWidth="4" 
                                        fill="none"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            )}
                        </div>
                    );
                })}
                {data.strategy && data.strategy.length > 0 && data.strategy.map((s, index) => {
                    const globalIndex = data.scenarios.length + (data.stewards ? data.stewards.length : 0) + index;
                    const isActive = activeSection === s.id;
                    const allPrevious = [...data.scenarios, ...(data.stewards || []), ...data.strategy.slice(0, index)];
                    const isPassed = activeSection && allPrevious.some(item => item.id === activeSection);
                    return (
                        <div key={s.id} id={s.id} className={`flag-timeline-item ${isActive ? 'active' : isPassed ? 'passed' : ''}`} style={{ animationDelay: `${globalIndex * 0.1}s` }}>
                            <div className={`flag-timeline-wrapper ${globalIndex % 2 === 0 ? 'left' : 'right'}`}>
                                <h3 className="flag-timeline-title">{s.title}</h3>
                                <div className="flag-timeline-content">
                                    <div className="flag-timeline-sections">
                                        {Object.values(s.sections).map((text, i) => (
                                            <div key={i} className="flag-timeline-section">
                                                <p className="flag-section-text">{text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {index < data.strategy.length - 1 && (
                                <svg className="flag-timeline-connector" viewBox="0 0 200 300" preserveAspectRatio="none">
                                    <path 
                                        d={globalIndex % 2 === 0 
                                            ? "M 200 200 L 200 300"
                                            : "M 0 200 L 0 300"
                                        }
                                        stroke="rgba(255, 45, 45, 0.5)" 
                                        strokeWidth="4" 
                                        fill="none"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
