// src/BreakingNewsPage.jsx

import React from 'react';
import GPHeroSection from '../../../3.sınıf/F1-Projesi-Yeni/f1-frontend/src/components/GPHeroSection.jsx';
import DashboardContent from '../../../3.sınıf/F1-Projesi-Yeni/f1-frontend/src/components/DashboardContent.jsx';
import './news.css'; // Global stilleriniz

// Örnek veri (Gerçek uygulamada API'den çekilir)
const mockGPData = {
    name: "AZERBAIJAN GRAND PRIX",
    date: "29 KASIM - 1 ARALIK 2025",
    // Yüklediğiniz pist görselinin yolu buraya gelecek
    trackImage: "/path/to/your/track/image.png",
    kalanSure: "3 Gün 05 Saat"
};

export default function BreakingNewsPage() {
    return (
        <section className="page news-page">

            {/* 1. Tam Ekran GP Odak Alanı */}
            <GPHeroSection upcomingGP={mockGPData} />

            {/* 2. Hemen altında başlayan Ana İçerik */}
            <DashboardContent />

        </section>
    );
}