import CalendarPanel from './components/CalendarPanel.jsx';
import StandingsPanel from './components/StandingsPanel.jsx';
import NewsPanel from './components/NewsPanel.jsx';
import './news.css';

export default function BreakingNewsPage() {
    return (
        <section className="page news-page">
            <header className="page-header">
                <p>Tüm hafta sonu tek ekranda: takvim, puan durumu ve bülten.</p>
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