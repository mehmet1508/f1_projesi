import React, { useState, useEffect } from 'react';
import './HeroSection.css';

const HeroSection = () => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY < window.innerHeight) {
                setOffset(window.scrollY);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="hero-container" style={{ transform: `translateY(-${offset * 0.5}px)` }}>
            <div className="hero-overlay"></div>
            <div className="hero-content">
                <h1 className="hero-title">MASTERPIECE OF ENGINEERING</h1>
                <p className="hero-subtitle">HOW IT WORKS</p>
            </div>
            <div className="scroll-indicator">
                <span>SCROLL TO DISCOVER</span>
                <div className="mouse-icon">
                    <div className="wheel"></div>
                </div>
            </div>
            <div className="hero-fade-bottom"></div>
        </div>
    );
};

export default HeroSection;