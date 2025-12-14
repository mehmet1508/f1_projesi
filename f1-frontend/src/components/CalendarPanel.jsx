import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CalendarPanel.css';

const sessionTranslations = {
    fp1: "1. Antrenman", fp2: "2. Antrenman", fp3: "3. Antrenman",
    sprint_quali: "Sprint Sıralama", sprint: "Sprint Yarışı",
    qualifying: "Sıralama Turları", race: "YARIŞ"
};

export default function CalendarPanel({ onRaceSelect }) {
    const [races, setRaces] = useState([]);
    const [selectedRace, setSelectedRace] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:5000/api/calendar').then(res => {
            setRaces(res.data);
            if (res.data.length > 0) {
                const today = new Date().toISOString().split('T')[0];
                const next = res.data.find(r => r.date >= today) || res.data[0];
                setSelectedRace(next);
                if(onRaceSelect) onRaceSelect(next);
            }
        }).catch(err => console.error(err));
    }, [onRaceSelect]);

    const renderSessions = () => {
        const order = ['fp1', 'sprint_quali', 'sprint', 'fp2', 'fp3', 'qualifying', 'race'];
        return order.map(key => {
            const timeStr = selectedRace.sessions[key]; // Mongoose Map'ten geliyorsa .sessions[key] veya .sessions.get(key)
            if (!timeStr) return null;
            const [dPart, tPart] = timeStr.split(' ');
            const dayName = new Date(dPart).toLocaleDateString('tr-TR', { weekday: 'long' });
            return (
                <div key={key} className={`session-row ${key === 'race' ? 'highlight-race' : ''} ${key === 'sprint' ? 'highlight-sprint' : ''}`}>
                    <div className="session-name">{sessionTranslations[key]}<span className="session-day">{dayName}</span></div>
                    <span className="session-time">{tPart}</span>
                </div>
            );
        });
    };

    if (!selectedRace) return <div className="loading">Yükleniyor...</div>;

    return (
        <div className="calendar-container">
            <div className="race-list-sidebar">
                <h3>2025 TAKVİMİ</h3>
                <div className="race-list-scroll">
                    {races.map(r => (
                        <div key={r.round} className={`race-item-box ${selectedRace._id === r._id ? 'active' : ''}`} onClick={() => {setSelectedRace(r); if(onRaceSelect) onRaceSelect(r);}}>
                            <span className="round-num">R{r.round}</span>
                            <div className="race-info-mini"><span className="race-date-mini">{r.date}</span><span className="race-country">{r.country}</span></div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="race-details-panel">
                <div className="detail-header"><h2>{selectedRace.name}</h2><span className="location-badge">{selectedRace.location}</span></div>
                <div className="stats-grid">
                    <div className="stat-card winner-card"><h4>SON KAZANAN</h4><div className="winner-name">🏆 {selectedRace.stats.last_winner}</div></div>
                    <div className="stat-card lap-card">
                        <h4>EN HIZLI TUR (2024)</h4>
                        <div className="fastest-driver">{selectedRace.stats.fastest_lap.driver || "-"}</div>
                        <div className="lap-time">{selectedRace.stats.fastest_lap.time || "-"}</div>
                        <div className="sectors-display">
                            <div className="sector"><span>S1</span><span>{selectedRace.stats.fastest_lap.s1}</span></div>
                            <div className="sector"><span>S2</span><span>{selectedRace.stats.fastest_lap.s2}</span></div>
                            <div className="sector"><span>S3</span><span>{selectedRace.stats.fastest_lap.s3}</span></div>
                        </div>
                    </div>
                </div>
                <div className="sessions-table"><h4>HAFTA SONU PROGRAMI</h4>{renderSessions()}</div>
            </div>
        </div>
    );
}