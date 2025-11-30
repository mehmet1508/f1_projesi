import { useState, useEffect } from 'react';
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

export default function HistoryPage() {
    const [selectedEraIndex, setSelectedEraIndex] = useState(0);
    const selectedEra = eras[selectedEraIndex];
    const [carIconOpacity, setCarIconOpacity] = useState(1);

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

    // Scroll ile yıllar arası geçiş
    useEffect(() => {
        let scrollTimeout;
        let isThrottled = false;
        
        const handleWheel = (event) => {
            event.preventDefault();
            
            if (isThrottled) return;
            
            const direction = event.deltaY > 0 ? -1 : 1;
            
            setSelectedEraIndex((prevIndex) => {
                const newIndex = prevIndex + direction;
                if (newIndex < 0) return 0;
                if (newIndex >= eras.length) return eras.length - 1;
                return newIndex;
            });
            
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
    }, []);

    return (
        <section className="page history-page">
            <div className="history-content">
                {/* Ana içerik alanı */}
                <div className="year-display">
                    <div className="year-background">
                        {/* Resim buraya gelecek - şimdilik placeholder */}
                        <div className="year-image-placeholder">
                            <span>{selectedEra.startYear}-{selectedEra.endYear}</span>
                        </div>
                    </div>
                    <div className="year-info">
                        <h1 className="year-range">{selectedEra.startYear}-{selectedEra.endYear}</h1>
                        <h2 className="era-title">{selectedEra.title}</h2>
                        <p className="era-description">{selectedEra.description}</p>
                    </div>
                </div>

                {/* Timeline */}
                <div className="history-timeline">
                    <div className="timeline-line">
                        {/* Timeline noktaları */}
                        {eras.map((era, index) => (
                            <button
                                key={`${era.startYear}-${era.endYear}`}
                                className={`timeline-dot ${index === selectedEraIndex ? 'active' : ''}`}
                                style={{ left: `${(index / (eras.length - 1)) * 100}%` }}
                                onClick={() => setSelectedEraIndex(index)}
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
        </section>
    );
}
