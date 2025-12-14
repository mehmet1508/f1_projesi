import React from 'react';
import './GPHeroSection.css';

export default function GPHeroSection({ upcomingGP }) {
    // Veri yoksa veya yükleniyorsa boş dön (veya loading spinner koyabilirsin)
    if (!upcomingGP) return null;

    return (
        <div className="gp-hero-section">
            <div
                className="hero-background"
                style={{
                    // Resim varsa onu kullan, yoksa gri arka plan
                    backgroundImage: upcomingGP.trackImage ? `url(${upcomingGP.trackImage})` : 'none',
                }}
            >
                {/* CSS'te filter brightness ile karartma yapacağız */}
            </div>

            <div className="hero-content">
                <h1>{upcomingGP.name}</h1>
                <h2>{upcomingGP.date}</h2>



            </div>
        </div>
    );
}