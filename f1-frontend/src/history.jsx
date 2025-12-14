import { useState, useEffect, useCallback, useRef } from 'react';
import './history.css';

// Decades from 1950 to 2024 (only basic info, details will come from API)
const baseEras = [
    { startYear: 1950, endYear: 1959, title: 'The Beginning', description: 'The first years of F1 World Championship' },
    { startYear: 1960, endYear: 1969, title: 'Golden Age', description: 'Classic F1 era' },
    { startYear: 1970, endYear: 1979, title: 'Wings & Ground Effect', description: 'Aerodynamic revolution' },
    { startYear: 1980, endYear: 1989, title: 'Turbo Era', description: 'Powerful turbo engines' },
    { startYear: 1990, endYear: 1999, title: 'Electronic Revolution', description: 'Electronic aids era' },
    { startYear: 2000, endYear: 2009, title: 'Schumacher Era', description: 'Ferrari dominance' },
    { startYear: 2010, endYear: 2019, title: 'Hybrid Era', description: 'V6 Turbo Hybrid engines' },
    { startYear: 2020, endYear: 2024, title: 'New Generation', description: 'Return of ground effect' }
];

// Her dönem için araba ikonu seç
const getCarIcon = (startYear) => {
    const year = Math.floor(startYear / 10) * 10; // 1950, 1960, 1970, etc.
    return `/assets/images/history/carsIcon/car${year}.png`;
};

// Dönemlere göre arka plan görseli
const getEraBackground = (startYear) => {
    switch (startYear) {
        case 1950:
            return '/assets/images/history/years/f11950.jpg';
        case 1960:
            return '/assets/images/history/years/f11960.jpg';
        case 1970:
            return '/assets/images/history/years/f11970.jpg';
        case 1980:
            return '/assets/images/history/years/f11980.jpg';
        case 1990:
            return '/assets/images/history/years/f11990.jpg';
        case 2000:
            return '/assets/images/history/years/f12000.jpg';
        case 2010:
            return '/assets/images/history/years/f12010.jpg';
        case 2020:
            return '/assets/images/history/years/f12020.webp';
        default:
            return null;
    }
};

export default function HistoryPage() {
    const [selectedEraIndex, setSelectedEraIndex] = useState(0);
    const [prevEraIndex, setPrevEraIndex] = useState(0);
    const [transitionDirection, setTransitionDirection] = useState('none');
    const selectedEraIndexRef = useRef(0);
    const [erasDetails, setErasDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Base eras ile API'den gelen detayları birleştir
    const eras = baseEras.map((baseEra, index) => {
        const details = erasDetails.find(d => d.startYear === baseEra.startYear);
        // Eğer details bulunamazsa, tüm baseEra'yı details olarak kullan
        const eraDetails = details || { ...baseEra };
        // Base era'daki alanları details'ten çıkar (çünkü zaten baseEra'da var)
        const { startYear, endYear, title, description, ...cleanDetails } = eraDetails;
        return {
            ...baseEra,
            details: cleanDetails
        };
    });
    
    const selectedEra = eras[selectedEraIndex];
    const [carIconOpacity, setCarIconOpacity] = useState(1);
    const eraBackground = selectedEra ? getEraBackground(selectedEra.startYear) : null;
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [cursorVisible, setCursorVisible] = useState(false);
    const [cursorMode, setCursorMode] = useState('default');
    const [isExploreOpen, setIsExploreOpen] = useState(false);
    const [parallax, setParallax] = useState({
        x: 0,
        y: 0,
        rotX: 0,
        rotY: 0
    });
    
    // API'den history eras detaylarını çek
    useEffect(() => {
        const fetchErasDetails = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/history-eras');
                if (response.ok) {
                    const data = await response.json();
                    setErasDetails(data);
                } else {
                    console.error('History eras API hatası:', response.status);
                    // API hatası durumunda boş array kullan (fallback)
                    setErasDetails([]);
                }
            } catch (error) {
                console.error('History eras fetch hatası:', error);
                // Network hatası durumunda boş array kullan (fallback)
                setErasDetails([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchErasDetails();
    }, []);

    const handleParallaxMove = useCallback(
        (event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            const moveIntensity = 15;
            const rotateMax = 10; // maksimum 6 derece eğim

            setParallax({
                x: -x * moveIntensity,
                y: -y * moveIntensity,
                rotY: x * rotateMax,
                rotX: -y * rotateMax
            });
        },
        [selectedEra?.startYear]
    );

    const resetParallax = useCallback(() => {
        setParallax({
            x: 0,
            y: 0,
            rotX: 0,
            rotY: 0
        });
    }, []);

    // Özel history cursor hareketi

    const handleMouseMove = useCallback((event) => {
        setCursorVisible(true);
        setCursorPos({
            x: event.clientX,
            y: event.clientY
        });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setCursorVisible(false);
        // Timeline üzerindeyken cursor mode'u koru
        if (cursorMode !== 'timeline') {
            setCursorMode('default');
        }
    }, [cursorMode]);

    // Arabanın timeline üzerindeki pozisyonunu hesapla
    const carPosition = eras.length > 0 ? (selectedEraIndex / (eras.length - 1)) * 100 : 0;
    
    // Seçili dönem için araba ikonu
    const carIcon = selectedEra ? getCarIcon(selectedEra.startYear) : null;

    // Araba ikonu değiştiğinde fade efekti
    useEffect(() => {
        if (!carIcon) return;
        setCarIconOpacity(0);
        const timer = setTimeout(() => {
            setCarIconOpacity(1);
        }, 150);
        return () => clearTimeout(timer);
    }, [carIcon]);

    // Seçili index değiştiğinde referansı güncelle
    useEffect(() => {
        selectedEraIndexRef.current = selectedEraIndex;
    }, [selectedEraIndex]);

    // Dönem değişimini yön bilgisi ile yönet
    const changeEra = useCallback((newIndex) => {
        setPrevEraIndex((prev) => {
            const direction = newIndex > prev ? 'forward' : 'backward';
            setTransitionDirection(direction);
            return newIndex;
        });
        setSelectedEraIndex(newIndex);
        // Dönem değiştiğinde explore panelini kapat
        setIsExploreOpen(false);
    }, []);

    // Explore butonuna tıklama
    const handleExploreClick = useCallback(() => {
        setIsExploreOpen(prev => {
            const newState = !prev;
            console.log('Explore panel açık:', newState, 'Selected era:', selectedEra?.title, 'Details:', selectedEra?.details);
            return newState;
        });
    }, [selectedEra]);

    // Panel backdrop'ına tıklama (panel dışına tıklayınca kapat)
    const handlePanelBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget) {
            setIsExploreOpen(false);
        }
    }, []);

    // Timeline çizgisine tıklayınca en yakın dönemi seç
    const handleTimelineClick = useCallback(
        (event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const relativeX = (event.clientX - rect.left) / rect.width; // 0..1
            const clamped = Math.min(Math.max(relativeX, 0), 1);
            const index = Math.round(clamped * (eras.length - 1));
            changeEra(index);
        },
        [changeEra, eras.length]
    );

    // Panel açık/kapalı durumuna göre body scroll'u kontrol et
    useEffect(() => {
        if (isExploreOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isExploreOpen]);

    // Scroll ile yıllar arası geçiş (sadece panel kapalıyken)
    useEffect(() => {
        let scrollTimeout;
        let isThrottled = false;
        
        const handleWheel = (event) => {
            // Panel açıksa scroll'u engelleme, normal scroll yapsın
            if (isExploreOpen) return;
            
            event.preventDefault();
            
            if (isThrottled) return;
            
            const direction = event.deltaY > 0 ? -1 : 1;
            const prevIndex = selectedEraIndexRef.current;
            let newIndex = prevIndex + direction;
            if (newIndex < 0) newIndex = 0;
            if (newIndex >= eras.length) newIndex = eras.length - 1;

            if (newIndex !== prevIndex) {
                changeEra(newIndex);
            }
            
            isThrottled = true;
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isThrottled = false;
            }, 600);
        };

        const container = document.querySelector('.history-page');
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
            return () => {
                container.removeEventListener('wheel', handleWheel);
                clearTimeout(scrollTimeout);
            };
        }
    }, [changeEra, isExploreOpen, eras.length]);

    if (loading || !selectedEra) {
        return (
            <section className="page history-page">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#fff' }}>
                    Loading...
                </div>
            </section>
        );
    }

    return (
        <section
            className="page history-page"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div className="history-content">
                {/* Ana içerik alanı */}
                <div
                    className="year-display clickable-area"
                    onMouseMove={(e) => {
                        handleParallaxMove(e);
                        // Panel açıkken explore moduna geçme
                        if (!isExploreOpen) {
                            setCursorMode('explore');
                        }
                    }}
                    onMouseLeave={() => {
                        resetParallax();
                        setCursorMode('default');
                    }}
                    onClick={handleExploreClick}
                >
                    <div
                        key={selectedEra.startYear}
                        className={`year-transition-wrapper ${
                            transitionDirection === 'forward'
                                ? 'slide-from-right'
                                : transitionDirection === 'backward'
                                ? 'slide-from-left'
                                : ''
                        }`}
                    >
                        <div className="year-background">
                            <div
                                className="year-image-placeholder"
                                style={{
                                    transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0) rotateX(${parallax.rotX}deg) rotateY(${parallax.rotY}deg)`
                                }}
                            >
                                {eraBackground && (
                                    <img
                                        src={eraBackground}
                                        alt={`${selectedEra.startYear} dönemi arka planı`}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="year-info">
                            <h1 className="year-range">
                                {selectedEra.startYear}-{selectedEra.endYear}
                            </h1>
                            <h2 className="era-title">{selectedEra.title}</h2>
                            <p className="era-description">{selectedEra.description}</p>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div
                    className="history-timeline"
                    onMouseEnter={() => setCursorMode('timeline')}
                    onMouseLeave={() => setCursorMode('default')}
                >
                    <div className="timeline-line" onClick={handleTimelineClick}>
                        {/* Timeline noktaları */}
                        {eras.map((era, index) => (
                            <button
                                key={`${era.startYear}-${era.endYear}`}
                                className={`timeline-dot ${index === selectedEraIndex ? 'active' : ''}`}
                                style={{ left: `${(index / (eras.length - 1)) * 100}%` }}
                                onClick={() => changeEra(index)}
                                aria-label={`${era.startYear}-${era.endYear}`}
                            />
                        ))}
                        
                        {/* Minik araba ikonu */}
                        {carIcon && (
                            <div
                                className="timeline-car"
                                style={{ left: `${carPosition}%` }}
                            >
                                <img
                                    src={carIcon}
                                    alt={`Car ${selectedEra.startYear}`}
                                    className="car-icon-image"
                                    style={{ opacity: carIconOpacity }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Explore Detay Paneli */}
            {selectedEra && (
                <div 
                    className={`era-details-panel ${isExploreOpen ? 'open' : ''}`}
                    onClick={handlePanelBackdropClick}
                >
                    <div 
                        className="era-details-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            className="close-details-button"
                            onClick={handleExploreClick}
                            aria-label="Close"
                        >
                            ×
                        </button>
                        <div className="era-details-header">
                            <h2>{selectedEra.title}</h2>
                            <span className="era-years">{selectedEra.startYear}-{selectedEra.endYear}</span>
                        </div>
                        
                        {selectedEra.details && Object.keys(selectedEra.details).length > 0 ? (
                        <div className="era-details-sections">
                            {selectedEra.details.champions && selectedEra.details.champions.length > 0 && (
                                <div className="details-section">
                                    <h3>Champions</h3>
                                    <div className="champions-list">
                                        {selectedEra.details.champions.map((champion, idx) => (
                                            <span key={idx} className="champion-tag">{champion}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedEra.details.highlights && selectedEra.details.highlights.length > 0 && (
                                <div className="details-section">
                                    <h3>Key Highlights</h3>
                                    <ul className="highlights-list">
                                        {selectedEra.details.highlights.map((highlight, idx) => (
                                            <li key={idx}>{highlight}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedEra.details.keyDrivers && selectedEra.details.keyDrivers.length > 0 && (
                                <div className="details-section">
                                    <h3>Key Drivers</h3>
                                    <div className="key-drivers-list">
                                        {selectedEra.details.keyDrivers.map((driver, idx) => (
                                            <div key={idx} className="driver-item">
                                                <span className="driver-name">{driver.name}</span>
                                                <span className="driver-achievements">{driver.achievements}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedEra.details.dominantTeams && selectedEra.details.dominantTeams.length > 0 && (
                                <div className="details-section">
                                    <h3>Dominant Teams</h3>
                                    <div className="teams-list">
                                        {selectedEra.details.dominantTeams.map((team, idx) => (
                                            <span key={idx} className="team-tag">{team}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedEra.details.technicalInnovations && selectedEra.details.technicalInnovations.length > 0 && (
                                <div className="details-section">
                                    <h3>Technical Innovations</h3>
                                    <ul className="innovations-list">
                                        {selectedEra.details.technicalInnovations.map((innovation, idx) => (
                                            <li key={idx}>{innovation}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedEra.details.engineSpecs && (
                                <div className="details-section">
                                    <h3>Engine Specifications</h3>
                                    <p className="engine-specs">{selectedEra.details.engineSpecs}</p>
                                </div>
                            )}

                            {selectedEra.details.racesPerSeason && (
                                <div className="details-section">
                                    <h3>Season Statistics</h3>
                                    <p className="season-stats">Races per Season: {selectedEra.details.racesPerSeason}</p>
                                </div>
                            )}

                            {selectedEra.details.safety && (
                                <div className="details-section">
                                    <h3>Safety</h3>
                                    <p className="safety-text">{selectedEra.details.safety}</p>
                                </div>
                            )}

                            {selectedEra.details.interestingFacts && selectedEra.details.interestingFacts.length > 0 && (
                                <div className="details-section">
                                    <h3>Interesting Facts</h3>
                                    <ul className="facts-list">
                                        {selectedEra.details.interestingFacts.map((fact, idx) => (
                                            <li key={idx}>{fact}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedEra.details.iconicMoments && selectedEra.details.iconicMoments.length > 0 && (
                                <div className="details-section full-width">
                                    <h3>Iconic Moments</h3>
                                    <div className="iconic-moments-list">
                                        {selectedEra.details.iconicMoments.map((moment, idx) => {
                                            // Hem string hem de obje formatını destekle
                                            const momentText = typeof moment === 'string' ? moment : moment.text || moment;
                                            const videoUrl = typeof moment === 'object' ? moment.videoUrl : null;
                                            
                                            return (
                                                <div key={idx} className="iconic-moment-item">
                                                    <span className="moment-number">{idx + 1}</span>
                                                    {videoUrl ? (
                                                        <a 
                                                            href={videoUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="iconic-moment-link"
                                                        >
                                                            <p className="iconic-moment">{momentText}</p>
                                                            <span className="video-icon">▶</span>
                                                        </a>
                                                    ) : (
                                                        <p className="iconic-moment">{momentText}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                        ) : (
                            <div className="era-details-sections">
                                <div className="details-section">
                                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', padding: '40px' }}>
                                        Detaylar yükleniyor...
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Özel cursor */}
            {cursorVisible && (
            <div
                className={`history-cursor ${cursorVisible ? 'visible' : ''} ${
                    cursorMode === 'timeline' ? 'timeline-mode' : ''
                } ${cursorMode === 'explore' && !isExploreOpen ? 'explore-mode' : ''} ${
                    isExploreOpen ? 'timeline-mode' : ''
                }`}
                style={{
                    left: `${cursorPos.x}px`,
                    top: `${cursorPos.y}px`
                }}
            />
            )}
        </section>
    );
}
