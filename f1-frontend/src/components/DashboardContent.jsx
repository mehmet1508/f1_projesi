// src/components/DashboardContent.jsx

import React from 'react';
import CalendarPanel from './CalendarPanel.jsx';
import StandingsPanel from './StandingsPanel.jsx';
import NewsPanel from './NewsPanel.jsx';

export default function DashboardContent() {
    return (
        // Bu bölüm GPHeroSection biter bitmez ekranda görünmeye başlar.
        <section className="dashboard-content-wrapper">
            <header className="page-header">
                <p>Takvim, puan durumu ve bülten.</p>
            </header>
            <div className="dashboard-grid">
                <div className="panel calendar-section">
                    <CalendarPanel />
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