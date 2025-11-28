import { useEffect, useState } from 'react';
import './App.css';
// Bileşenleri (Component) sonra oluşturacağız, şimdilik yer tutucu koyalım
import CalendarPanel from './components/CalendarPanel';
import StandingsPanel from './components/StandingsPanel';
import NewsPanel from './components/NewsPanel';

function App() {
    return (
        <div className="dashboard-container">

            {/* SOL ÜST: TAKVİM VE PİST BİLGİSİ */}
            <div className="panel calendar-section">
                <CalendarPanel />
            </div>

            {/* SAĞ TARAF (BOYDAN BOYA): PUAN DURUMU */}
            <div className="panel standings-section">
                <StandingsPanel />
            </div>

            {/* SOL ALT: HABERLER */}
            <div className="panel news-section">
                <NewsPanel />
            </div>

        </div>
    );
}

export default App;