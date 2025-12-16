import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import "./raceinfo.css";

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
};

const LABELS = {
    // Flags
    display: "📺 Dısplay",
    meaning: "❓ Meanıng",
    restriction: "🚫 Restrıctıon",
    impact: "🏎️ Impact",
    penalty: "⚠️ Penalty",

    // Penalties
    reason: "Reason",
    application: "Applıcatıon",

    // Scenarios
    trigger: "Trıgger",
    pace: "Pace",
    strategy: "Strategy",
    difference: "Dıfference",
    delta: "Delta",

    // Stewards
    incident: "Incıdent Noted",
    investigation: "Under Investıgatıon",
    noAction: "No Further Actıon",
    confirmed: "Penalty Confırmed",

    // Strategy
    sc: "Safety Car",
    rf: "Red Flag",
    tp: "Tıme Penaltıes",
};

function labelFor(key) {
    return LABELS[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

function buildSectionBlocks(sectionsObj) {
    if (!sectionsObj) return [];
    return Object.entries(sectionsObj)
        .filter(([, v]) => typeof v === "string" && v.trim().length > 0)
        .map(([k, v]) => ({ key: k, label: labelFor(k), text: v }));
}

export default function RaceInfoPage() {
    const [data, setData] = useState(null);
    const [query, setQuery] = useState("");
    const [activeSection, setActiveSection] = useState(null);
    const searchWrapRef = useRef(null);

    // --- FETCH ---
    useEffect(() => {
        fetch("http://localhost:5000/api/raceinfo")
            .then((res) => res.json())
            .then(setData)
            .catch(console.error);
    }, []);

    // --- SCROLL CHECKERBOARD ANIMATION (CSS var --scroll-y kullanıyor) ---
    useEffect(() => {
        const onScroll = () => {
            document.documentElement.style.setProperty("--scroll-y", `${window.scrollY}px`);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // --- ACTIVE SECTION HIGHLIGHT (scroll ilerledikçe active/passed) ---
    useEffect(() => {
        if (!data) return;

        const getTrackables = () =>
            Array.from(document.querySelectorAll('[data-raceinfo-section="true"]'));

        const onScroll = () => {
            if (isAutoScrolling.current) return;

            const items = getTrackables();
            if (!items.length) return;

            const viewportMiddle = window.scrollY + window.innerHeight * 0.5;
            let activeId = null;

            for (const el of items) {
                const rect = el.getBoundingClientRect();
                const top = rect.top + window.scrollY;
                const bottom = top + rect.height;
                if (viewportMiddle >= top && viewportMiddle <= bottom) {
                    activeId = el.id || null;
                    break;
                }
            }

            setActiveSection(activeId);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, [data]);

    // --- SEARCH INDEX (autocomplete dropdown) ---
    const searchIndex = useMemo(() => {
        if (!data) return [];
        const add = (arr, category) =>
            (arr || []).map((item) => ({
                id: item.id,
                title: item.title,
                category,
            }));

        return [
            ...add(data.flags, "Flags"),
            ...add(data.penalties, "Penalties"),
            ...add(data.vocabulary, "Vocabulary"),
            ...add(data.scenarios, "Scenarios"),
            ...add(data.stewards, "Stewards"),
            ...add(data.strategy, "Strategy"),
        ];
    }, [data]);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return searchIndex
            .filter((i) => i.title.toLowerCase().includes(q))
            .slice(0, 10);
    }, [query, searchIndex]);

    // dropdown dışına tıklayınca kapansın
    useEffect(() => {
        const onDown = (e) => {
            if (!searchWrapRef.current) return;
            if (!searchWrapRef.current.contains(e.target)) setQuery("");
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);

    const scrollToId = (id) => {
        const el = document.getElementById(id);
        if (!el) return;

        el.scrollIntoView({ behavior: "smooth", block: "center" });

    };

    const passedClass = (list, index, id) => {
        if (!activeSection) return "";
        const activeIndex = (list || []).findIndex((x) => x.id === activeSection);
        if (activeIndex === -1) return "";
        if (id === activeSection) return "active";
        return index < activeIndex ? "passed" : "";
    };
    const isAutoScrolling = useRef(false);
    const autoTimer = useRef(null);

    const lockAutoScroll = (ms = 900) => {
        isAutoScrolling.current = true;
        clearTimeout(autoTimer.current);
        autoTimer.current = setTimeout(() => {
            isAutoScrolling.current = false;
        }, ms);
    };

    const goToId = (id) => {
        flushSync(() => {
            setQuery("");          // dropdown kapansın
            setActiveSection(id);  // hedefi direkt active yap (passed hesapları da oturur)
        });

        lockAutoScroll(900);
        requestAnimationFrame(() => scrollToId(id));
    };

    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            // 300px aşağı inince buton görünsün
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (!data) return <div className="loading-banner">Race info loading...</div>;

    return (
        <div className="raceinfo">
            <h1>RACE GLOSSARY</h1>

            {/* SEARCH */}
            <div className="search-wrapper" ref={searchWrapRef}>
                <div className="search-input-container">
                    <svg className="search-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>

                    <input
                        className="raceinfo-search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search flags, penalties, scenarios..."
                        type="text"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && results.length) {
                                goToId(results[0].id);
                            }
                        }}

                    />

                    {query && (
                        <button className="search-clear" onClick={() => setQuery("")} aria-label="Clear search">
                            ×
                        </button>
                    )}
                </div>

                {query && (
                    <div className="search-dropdown">
                        {results.length === 0 ? (
                            <div className="search-empty">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                                <span>No results found for "{query}"</span>
                            </div>
                        ) : (
                            <>
                                <div className="search-results-count">
                                    {results.length} result{results.length !== 1 ? "s" : ""} found
                                </div>
                                {results.map((r) => (
                                    <div
                                        key={r.id}
                                        className="search-item"
                                        onClick={() => goToId(r.id)}
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
                {(data.flags || []).map((flag, index) => {
                    const blocks = buildSectionBlocks(flag.sections);
                    return (
                        <div
                            key={flag.id}
                            id={flag.id}
                            data-raceinfo-section="true"
                            className={`flag-timeline-item ${passedClass(data.flags, index, flag.id)}`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className={`flag-timeline-wrapper ${index % 2 === 0 ? "left" : "right"}`}>
                                <h3 className="flag-timeline-title">{flag.title.toUpperCase()}</h3>

                                <div className="flag-timeline-circle">
                                    <div className="flag-timeline-icon">
                                        <img src={flag.image} alt={flag.title} />
                                    </div>
                                </div>

                                <div className="flag-timeline-content">
                                    <div className="flag-timeline-sections">
                                        {blocks.map((b) => (
                                            <div
                                                key={b.key}
                                                className={`flag-timeline-section ${b.key === "penalty" ? "warning-section" : ""}`}
                                            >
                                                <h4 className={`flag-section-heading ${b.key === "penalty" ? "warning-heading" : ""}`}>
                                                    {b.key === "penalty" ? "⚠️ " : ""}
                                                    {b.label}
                                                </h4>
                                                <p className={`flag-section-text ${b.key === "penalty" ? "warning-text" : ""}`}>{b.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {index < (data.flags || []).length - 1 && (
                                <svg className="flag-timeline-connector" viewBox="0 0 200 300" preserveAspectRatio="none">
                                    <path
                                        d={index % 2 === 0 ? "M 200 200 L 200 300" : "M 0 200 L 0 300"}
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

            {/* PENALTIES */}
            <h2 className="section-title">
                <span className="section-icon">⚖️</span>
                Penalties
            </h2>

            {(data.penalties || []).map((p, index) => {
                const isActive = activeSection === p.id;
                const activeIndex = (data.penalties || []).findIndex((x) => x.id === activeSection);
                const isPassed = activeSection && activeIndex !== -1 && index < activeIndex;

                return (
                    <section
                        key={p.id}
                        id={p.id}
                        data-raceinfo-section="true"
                        className={`info-section no-image ${isActive ? "active" : isPassed ? "passed" : ""}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="info-content">
                            <h3>{p.title.toUpperCase()}</h3>

                            <div className="info-details">
                                <div className="info-detail-item">
                                    <span className="detail-label">Dısplay</span>
                                    <p>{p.sections?.display}</p>
                                </div>

                                <div className="info-detail-item">
                                    <span className="detail-label">Reason</span>
                                    <p>{p.sections?.reason}</p>
                                </div>

                                <div className="info-detail-item">
                                    <span className="detail-label">Applıcatıon</span>
                                    <p>{p.sections?.application}</p>
                                </div>

                                <div className="info-detail-item">
                                    <span className="detail-label">Impact</span>
                                    <p>{p.sections?.impact}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })}
            <h2 className="section-title">
                <span className="section-icon">📚</span>
                OTHER VOCABULARY
            </h2>
            {/* SCENARIOS + STEWARDS + STRATEGY (aynı timeline tasarımı) */}
            <div className="flags-timeline">
                {(data.scenarios || []).map((s, index) => {
                    const blocks = buildSectionBlocks(s.sections);
                    return (
                        <div
                            key={s.id}
                            id={s.id}
                            data-raceinfo-section="true"
                            className={`flag-timeline-item ${passedClass(data.scenarios, index, s.id)}`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className={`flag-timeline-wrapper ${index % 2 === 0 ? "left" : "right"}`}>
                                <h3 className="flag-timeline-title">{s.title.toUpperCase()}</h3>
                                <div className="flag-timeline-content">
                                    <div className="flag-timeline-sections">
                                        {blocks.map((b) => (
                                            <div key={b.key} className="flag-timeline-section">
                                                <h4 className="flag-section-heading">{b.label}</h4>
                                                <p className="flag-section-text">{b.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {(index < (data.scenarios || []).length - 1 ||
                                (data.stewards || []).length > 0 ||
                                (data.strategy || []).length > 0) && (
                                <svg className="flag-timeline-connector" viewBox="0 0 200 300" preserveAspectRatio="none">
                                    <path
                                        d={index % 2 === 0 ? "M 200 200 L 200 300" : "M 0 200 L 0 300"}
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

                {(data.stewards || []).map((s, index) => {
                    const globalIndex = (data.scenarios || []).length + index;
                    const blocks = buildSectionBlocks(s.sections);
                    return (
                        <div
                            key={s.id}
                            id={s.id}
                            data-raceinfo-section="true"
                            className="flag-timeline-item"
                            style={{ animationDelay: `${globalIndex * 0.1}s` }}
                        >
                            <div className={`flag-timeline-wrapper ${globalIndex % 2 === 0 ? "left" : "right"}`}>
                                <h3 className="flag-timeline-title">{s.title.toUpperCase()}</h3>
                                <div className="flag-timeline-content">
                                    <div className="flag-timeline-sections">
                                        {blocks.map((b) => (
                                            <div key={b.key} className="flag-timeline-section">
                                                <h4 className="flag-section-heading">{b.label}</h4>
                                                <p className="flag-section-text">{b.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {index < (data.stewards || []).length - 1 || (data.strategy || []).length > 0 ? (
                                <svg className="flag-timeline-connector" viewBox="0 0 200 300" preserveAspectRatio="none">
                                    <path
                                        d={globalIndex % 2 === 0 ? "M 200 200 L 200 300" : "M 0 200 L 0 300"}
                                        stroke="rgba(255, 45, 45, 0.5)"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            ) : null}
                        </div>
                    );
                })}

                {(data.strategy || []).map((s, index) => {
                    const globalIndex = (data.scenarios || []).length + (data.stewards || []).length + index;
                    const blocks = buildSectionBlocks(s.sections);
                    return (
                        <div
                            key={s.id}
                            id={s.id}
                            data-raceinfo-section="true"
                            className="flag-timeline-item"
                            style={{ animationDelay: `${globalIndex * 0.1}s` }}
                        >
                            <div className={`flag-timeline-wrapper ${globalIndex % 2 === 0 ? "left" : "right"}`}>
                                <h3 className="flag-timeline-title">{s.title.toUpperCase()}</h3>
                                <div className="flag-timeline-content">
                                    <div className="flag-timeline-sections">
                                        {blocks.map((b) => (
                                            <div key={b.key} className="flag-timeline-section">
                                                <h4 className="flag-section-heading">{b.label}</h4>
                                                <p className="flag-section-text">{b.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {(data.vocabulary || []).map((v, index) => {
                    const globalIndex =
                        (data.scenarios || []).length + (data.stewards || []).length + (data.strategy || []).length + index;

                    return (
                        <div
                            key={v.id}
                            id={v.id}
                            data-raceinfo-section="true"
                            className="flag-timeline-item"
                            style={{ animationDelay: `${globalIndex * 0.1}s` }}
                        >
                            <div className={`flag-timeline-wrapper ${globalIndex % 2 === 0 ? "left" : "right"}`}>
                                <h3 className="flag-timeline-title">{v.title.toUpperCase()}</h3>

                                <div className="flag-timeline-content">
                                    <div className="flag-timeline-sections">
                                        <div className="flag-timeline-section">
                                            <p className="flag-section-text">{v.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {showScrollTop && (
                <button
                    className="scroll-to-top"
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                >
                    <span style={{ display: "inline-block", transform: "scaleX(-1)" }}>🏎️</span>Go  ️Top🏎️



                </button>
            )}
        </div>
    );

}
