import { useState, useEffect, useCallback, useRef } from 'react';
import './history.css';

// 1950'den 2024'e kadar 10'ar yıllık dönemler
const eras = [
    { startYear: 1950, endYear: 1959, title: 'Başlangıç Dönemi', description: 'F1 Dünya Şampiyonası\'nın ilk yılları' },
    { startYear: 1960, endYear: 1969, title: 'Altın Çağ', description: 'Klasik F1 dönemi' },
    { startYear: 1970, endYear: 1979, title: 'Wings & Ground Effect', description: 'Aerodinamik devrimi' },
    { startYear: 1980, endYear: 1989, title: 'Turbo Çağı', description: 'Güçlü turbo motorlar' },
    { startYear: 1990, endYear: 1999, title: 'Elektronik Devrim', description: 'Elektronik yardımlar dönemi' },
    { startYear: 2000, endYear: 2009, title: 'Schumacher Dönemi', description: 'Ferrari\'nin hakimiyeti' },
    { startYear: 2010, endYear: 2019, title: 'Hibrit Çağ', description: 'V6 Turbo Hibrit motorlar' },
    { startYear: 2020, endYear: 2024, title: 'Yeni Nesil', description: 'Ground effect\'in geri dönüşü' }
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
    const selectedEra = eras[selectedEraIndex];
    const [carIconOpacity, setCarIconOpacity] = useState(1);
    const eraBackground = getEraBackground(selectedEra.startYear);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [cursorVisible, setCursorVisible] = useState(false);
    const [cursorMode, setCursorMode] = useState('default');
    const [parallax, setParallax] = useState({
        x: 0,
        y: 0,
        rotX: 0,
        rotY: 0
    });

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
        [selectedEra.startYear]
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
        setCursorMode('default');
    }, []);

    // Arabanın timeline üzerindeki pozisyonunu hesapla
    const carPosition = (selectedEraIndex / (eras.length - 1)) * 100;
    
    // Seçili dönem için araba ikonu
    const carIcon = getCarIcon(selectedEra.startYear);

    // Araba ikonu değiştiğinde fade efekti
    useEffect(() => {
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
        [changeEra]
    );

    // Scroll ile yıllar arası geçiş
    useEffect(() => {
        let scrollTimeout;
        let isThrottled = false;
        
        const handleWheel = (event) => {
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
    }, [changeEra]);

    return (
        <section
            className="page history-page"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div className="history-content">
                {/* Ana içerik alanı */}
                <div
                    className="year-display"
                    onMouseMove={handleParallaxMove}
                    onMouseLeave={resetParallax}
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
                    </div>
                </div>
            </div>

            {/* Özel cursor */}
            {cursorVisible && (
            <div
                className={`history-cursor ${cursorVisible ? 'visible' : ''} ${
                    cursorMode === 'timeline' ? 'timeline-mode' : ''
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
