import './teams.css';
import React, { useState, useEffect, useRef } from 'react';

const TeamsPage = () => {
    // State Tanımları
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [flippedCards, setFlippedCards] = useState({});

    // Ref Tanımları
    const containerRef = useRef(null);
    const isScrolling = useRef(false);

    // --- 1. VERİ ÇEKME ---
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/teams');

                if (!response.ok) {
                    throw new Error(`HTTP Hatası! Durum: ${response.status}`);
                }

                const rawData = await response.json();

                if (!rawData || rawData.length === 0) {
                    throw new Error("Veritabanı boş veya veri gelmedi.");
                }

                const formattedData = rawData.map(team => ({
                    id: team._id,
                    name: team.name,
                    base_country: team.base_country,
                    color: team.color || "#333",
                    logo: team.logo_url || "https://placehold.co/100x100?text=Logo+Yok",
                    info: {
                        founded: team.founded || "-",
                        base: team.base || "-",
                        boss: team.principal || "-",
                        engine: team.engine || "-",
                        titles: team.championships || "0"
                    },
                    drivers: team.drivers
                        ? team.drivers.map(d => ({
                            name: d.name || "Sürücü",
                            country: d.nationality || "-",
                            number: d.number || 0,
                            titles: d.world_titles || 0,
                            img: d.image || "https://placehold.co/100x100?text=Pilot",
                            helmet: d.helmet
                        }))
                        : []
                }));

                setTeams(formattedData);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    // --- 2. SCROLL ---
    useEffect(() => {
        const handleWheel = (e) => {
            e.preventDefault();
            if (isScrolling.current) return;

            isScrolling.current = true;
            setTimeout(() => (isScrolling.current = false), 800);

            if (e.deltaY > 0) {
                setCurrentIndex(prev => Math.min(prev + 1, teams.length - 1));
            } else {
                setCurrentIndex(prev => Math.max(prev - 1, 0));
            }
        };

        const el = containerRef.current;
        if (el && !loading && teams.length > 0) {
            el.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (el) el.removeEventListener('wheel', handleWheel);
        };
    }, [loading, teams.length]);

    // --- 3. KART TIKLAMA ---
    const handleCardClick = (index) => {
        if (index === currentIndex) {
            setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }));
        } else {
            setCurrentIndex(index);
        }
    };

    // --- LOADING ---
    if (loading) {
        return (
            <div className="loading-screen">
                <h2>🏎 Veriler Yükleniyor...</h2>
            </div>
        );
    }

    // --- ERROR ---
    if (error) {
        return (
            <div className="error-screen">
                <h2>❌ Bir Sorun Oluştu</h2>
                <p>{error}</p>
            </div>
        );
    }

    // --- HESAPLAMA ---
    const cardWidth = 450;
    const cardGap = 50;
    const totalCardWidth = cardWidth + cardGap;

    const translateX = `calc(50vw - ${cardWidth / 2}px - ${
        currentIndex * totalCardWidth
    }px)`;

    // --- RENDER ---
    return (
        <div id="teams-page-container" ref={containerRef}>
            <div
                className="teams-grid"
                style={{ transform: `translateX(${translateX})` }}
            >
                {teams.map((team, index) => {
                    const isFlipped = flippedCards[index];
                    const isActiveCard = index === currentIndex;

                    return (
                        <div
                            key={team.id}
                            className={`team-card-container ${
                                !isActiveCard ? 'inactive' : ''
                            }`}
                            onClick={() => handleCardClick(index)}
                        >
                            <div
                                className={`team-card ${
                                    isFlipped ? 'is-flipped' : ''
                                }`}
                            >
                                {/* ÖN YÜZ */}
                                <div className="card-face card-front">
                                    <div
                                        className="card-header"
                                        style={{ backgroundColor: team.color }}
                                    >
                                        <img
                                            src={team.logo}
                                            alt={`${team.name} Logo`}
                                            className="team-logo"
                                        />
                                        <h3>{team.name.toUpperCase()}</h3>

                                    </div>

                                    <div className="card-body">
                                        <p><strong>Founded:</strong> {team.info.founded}</p>
                                        <p className="base-line"><strong>Base:</strong> {team.info.base}{team.base_country && (<img
                                                    src={`/images/flags/${team.base_country}.svg`}
                                                    alt={team.base_country}
                                                    className="base-flag-icon"
                                                />
                                            )}
                                        </p>
                                        <p><strong>Principal:</strong> {team.info.boss}</p>
                                        <p><strong>Engine:</strong> {team.info.engine}</p>
                                        <p><strong>Championships:</strong> {team.info.titles}</p>

                                        <ul>
                                            {team.drivers.map(d => (
                                                <li key={d.name}>
                                                    <img
                                                        src={d.helmet}
                                                        className="helmet-icon"
                                                        alt=""
                                                    />
                                                    {d.name}
                                                </li>
                                            ))}
                                        </ul>

                                        <p className="scroll-hint">
                                            (Tap the card to view details of pilots)
                                        </p>
                                    </div>
                                </div>

                                {/* ARKA YÜZ */}
                                <div className="card-face card-back">
                                    <div
                                        className="card-header"
                                        style={{ backgroundColor: team.color }}
                                    >
                                        <h3>PILOTS</h3>
                                    </div>

                                    <div className="driver-profiles-container">
                                        {team.drivers.map(driver => (
                                            <div
                                                className="driver-profile"
                                                key={driver.name}
                                            >
                                                <img
                                                    src={driver.img}
                                                    alt={driver.name}
                                                />
                                                <div>
                                                    <h4>{driver.name}</h4>
                                                    <p><strong>Country:</strong> {driver.country}</p>
                                                    <p><strong>Number:</strong> {driver.number}</p>
                                                    <p><strong>Championships:</strong> {driver.titles}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TeamsPage;
