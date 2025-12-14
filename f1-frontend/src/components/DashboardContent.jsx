// src/components/DashboardContent.jsx

import React from 'react';
import CalendarPanel from './CalendarPanel.jsx';
import StandingsPanel from './StandingsPanel.jsx';
import NewsPanel from './NewsPanel.jsx';

// onRaceSelect prop'unu aldık
export default function DashboardContent({ onRaceSelect }) {
    return (
        <section className="dashboard-content-wrapper">
            <header className="page-header">
                <p>Takvim, puan durumu ve bülten.</p>
            </header>
            <div className="dashboard-grid">
                <div className="panel calendar-section">
                    {/* Fonksiyonu CalendarPanel'e iletiyoruz */}
                    <CalendarPanel onRaceSelect={onRaceSelect} />
                </div>
                <div className="panel standings-section">
                    <StandingsPanel />
                </div>
                <div className="panel news-section">
                    <NewsPanel />
                </div>
            </div>
        </section>
    );
}