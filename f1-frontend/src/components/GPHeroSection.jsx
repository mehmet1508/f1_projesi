// src/components/GPHeroSection.jsx

import React from 'react';
import './GPHeroSection.css';

export default function GPHeroSection({ upcomingGP }) {
    return (
        <div className="gp-hero-section">
            <div
                className="hero-background"
                // Yüklediğiniz pist haritası görselini buraya stil olarak ekleriz
                style={{ backgroundImage: `url(${upcomingGP.trackImage})` }}
            >
                {/* Bu div arka planı yönetir */}
            </div>

            <div className="hero-content">
                <p className="hero-title-small">Sıradaki Yarış</p>
                <h1>{upcomingGP.name}</h1>
                <h2>{upcomingGP.date}</h2>
                <p className="countdown">Yarışa Kalan Süre: {upcomingGP.kalanSure}</p>

                {/* Kaydırma ipucu (isteğe bağlı) */}
                <div className="scroll-down-text">
                    Puan Durumu ve Haberler İçin Aşağı Kaydırın
                </div>
            </div>
        </div>
    );
}