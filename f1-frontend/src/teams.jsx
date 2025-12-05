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

    // --- 1. VERİ ÇEKME (API REQUEST) ---
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                console.log("Veri çekiliyor...");
                // Backend portunun 5000 olduğundan emin ol
                const response = await fetch('http://localhost:5000/api/teams');

                if (!response.ok) {
                    // HATA DÜZELTME 1: Template literal (ters tırnak) kullanıldı
                    throw new Error(`HTTP Hatası! Durum: ${response.status}`);
                }

                const rawData = await response.json();
                console.log("Gelen Veri:", rawData);

                if (!rawData || rawData.length === 0) {
                    throw new Error("Veritabanı boş veya veri gelmedi.");
                }

                // Veriyi Frontend formatına uydurma
                const formattedData = rawData.map(team => ({
                    id: team._id, 
                    name: team.name,
                    color: team.color || "#333",
                    logo: team.logo_url || "https://placehold.co/100x100?text=Logo+Yok",
                    info: {
                        founded: team.founded || "-",
                        base: team.base || "-",
                        boss: team.principal || "-", 
                        engine: team.engine || "-",
                        titles: team.championships || "0"
                    },
                    drivers: team.drivers ? team.drivers.map(d => ({
                        name: d.name || "Sürücü",
                        country: d.nationality || d.country || "-",
                        number: d.number || 0,
                        titles: d.world_titles || d.titles || 0,
                        img: d.image || d.img || "https://placehold.co/100x100?text=Pilot"
                    })) : []
                }));

                setTeams(formattedData);
            } catch (err) {
                console.error("Hata:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    // --- 2. SCROLL EFFEKTİ ---
    useEffect(() => {
        const handleWheel = (e) => {
            e.preventDefault();
            if (isScrolling.current) return;

            isScrolling.current = true;
            setTimeout(() => { isScrolling.current = false; }, 800);

            if (e.deltaY > 0) {
                // Sonraki
                setCurrentIndex((prev) => Math.min(prev + 1, teams.length - 1));
            } else {
                // Önceki
                setCurrentIndex((prev) => Math.max(prev - 1, 0));
            }
        };

        const el = containerRef.current;
        // Sadece yükleme bittiyse ve takımlar geldiyse event ekle
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

    // --- 4. RENDER (GÖRÜNÜM) ---

    // Yükleniyor Ekranı
    if (loading) return (
        <div style={{
            height: '100vh', display: 'flex', justifyContent: 'center',
            alignItems: 'center', color: 'white', background: '#1a1a1a'
        }}>
            <h2>🏎 Veriler Yükleniyor...</h2>
        </div>
    );

    // Hata Ekranı
    if (error) return (
        <div style={{
            height: '100vh', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', color: '#ff4444', background: '#1a1a1a'
        }}>
            <h2>❌ Bir Sorun Oluştu</h2>
            <p>{error}</p>
            <p style={{color: '#ccc', fontSize: '0.8rem', marginTop: '10px'}}>
                Backend sunucusunun (port 5000) açık olduğundan emin ol.
            </p>
        </div>
    );

    // Hesaplamalar
    const cardWidth = 450;
    const cardGap = 50;
    const totalCardWidth = cardWidth + cardGap;
    
    // HATA DÜZELTME 2 & 3: Template literal (ters tırnak) kullanılarak doğru CSS dizesi oluşturuldu
    const translateX = `calc(50vw - ${cardWidth / 2}px - ${currentIndex * totalCardWidth}px)`;

    // Ana Ekran
    return (
        <div id="teams-page-container" ref={containerRef}>
            <div
                className="teams-grid"
                // Stil ataması düzeltildi
                style={{ transform: `translateX(${translateX})` }}
            >
                {teams.map((team, index) => {
                    const isFlipped = flippedCards[index];
                    const isActiveCard = index === currentIndex;

                    return (
                        <div
                            key={team.id}
                            className={`team-card-container ${!isActiveCard ? 'inactive' : ''}`}
                            onClick={() => handleCardClick(index)}
                        >
                            <div className={`team-card ${isFlipped ? 'is-flipped' : ''}`}>

                                {/* ÖN YÜZ */}
                                <div className="card-face card-front">
                                    <div className="card-header" style={{ backgroundColor: team.color }}>
                                        <img src={team.logo} alt={`${team.name} Logo`} className="team-logo" />
                                        <h3>{team.name}</h3>
                                    </div>
                                    <div className="card-body">
                                        <p><strong>Kuruluş:</strong> {team.info.founded}</p>
                                        <p><strong>Merkez:</strong> {team.info.base}</p>
                                        <p><strong>Patron:</strong> {team.info.boss}</p>
                                        <p><strong>Motor:</strong> {team.info.engine}</p>
                                        <p><strong>Şampiyonluk:</strong> {team.info.titles}</p>
                                        <ul>
                                            {team.drivers.map(d => <li key={d.name}>{d.name}</li>)}
                                        </ul>
                                        <p className="scroll-hint">(Detaylar için karta tıklayın)</p>
                                    </div>
                                </div>

                                {/* ARKA YÜZ */}
                                <div className="card-face card-back">
                                    <div className="card-header" style={{ backgroundColor: team.color }}>
                                        <h3>Pilotlar</h3>
                                    </div>
                                    <div className="driver-profiles-container">
                                        {team.drivers.map((driver) => (
                                            <div className="driver-profile" key={driver.name}>
                                                <img src={driver.img} alt={driver.name} />
                                                <div>
                                                    <h4>{driver.name}</h4>
                                                    <p><strong>Ülke:</strong> {driver.country}</p>
                                                    <p><strong>No:</strong> {driver.number}</p>
                                                    <p><strong>Şampiyonluk:</strong> {driver.titles}</p>
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