// src/components/DashboardContent.jsx

import React from 'react';
import CalendarPanel from '../../../../../F1-Projesi/f1-frontend/src/components/CalendarPanel.jsx';
import StandingsPanel from '../../../../../F1-Projesi/f1-frontend/src/components/StandingsPanel.jsx';
import NewsPanel from '../../../../../F1-Projesi/f1-frontend/src/components/NewsPanel.jsx';

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