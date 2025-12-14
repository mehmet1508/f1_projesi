// src/BreakingNewsPage.jsx

import React, { useState } from 'react'; // useState eklendi
import GPHeroSection from './components/GPHeroSection.jsx';
import DashboardContent from './components/DashboardContent.jsx';
import './news.css';

export default function BreakingNewsPage() {
    // Başlangıçta null olabilir veya bir "Yükleniyor" placeholder'ı koyabilirsin
    const [heroGP, setHeroGP] = useState(null);

    return (
        <section className="page news-page">

            {/* 1. Tam Ekran GP Odak Alanı */}
            {/* Eğer veri henüz gelmediyse varsayılan veya loading göster */}
            {heroGP ? (
                <GPHeroSection upcomingGP={heroGP} />
            ) : (
                <div className="gp-hero-loading">Yarış Verileri Yükleniyor...</div>
            )}

            {/* 2. Ana İçerik */}
            {/* setHeroGP fonksiyonunu aşağıya gönderiyoruz ki CalendarPanel bunu kullanabilsin */}
            <DashboardContent onRaceSelect={setHeroGP} />

        </section>
    );
}