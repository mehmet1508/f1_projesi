import React, { useState, useEffect, useRef, useCallback } from 'react';
import HeroSection from './HeroSection';
import './howItWorks.css';

const Typewriter = ({ text, isActive, speed = 30, delay = 0, tag = 'p', className = '' }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        if (!isActive) {
            setDisplayedText('');
            return;
        }
        let interval = null;
        const timeout = setTimeout(() => {
            let currentIndex = 0;
            interval = setInterval(() => {
                currentIndex++;
                setDisplayedText(text.substring(0, currentIndex));
                if (currentIndex >= text.length) clearInterval(interval);
            }, speed);
        }, delay);
        return () => {
            clearTimeout(timeout);
            if (interval) clearInterval(interval);
        };
    }, [text, isActive, speed, delay]);

    const Tag = tag;
    const showCursor = isActive && displayedText.length < text.length;

    return (
        <Tag className={`${className} ${showCursor ? 'typing-cursor' : ''}`}>
            {displayedText}
        </Tag>
    );
};

const HowItWorks = () => {
    const [sections, setSections] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    const containerRef = useRef(null);
    const imageAreaRef = useRef(null);
    const textAreaRef = useRef(null);
    const imageRefs = useRef([]);
    const ticking = useRef(false);

    useEffect(() => {
        fetch('http://localhost:5000/api/howitworks')
            .then(res => res.json())
            .then(data => setSections(data))
            .catch(err => console.error(err));
    }, []);

    const updateAnimation = useCallback(() => {
        if (!containerRef.current || sections.length === 0) return;

        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const scrollableDistance = rect.height - windowHeight;
        const scrolled = -rect.top;
        const SHRINK_END = 0.15;
        const TEXT_START = 0.20;

        // --- DURUM 1: BÖLGE İÇİNDEYİZ ---
        if (rect.top <= 0 && rect.bottom >= windowHeight) {
            if (imageAreaRef.current) {
                imageAreaRef.current.style.opacity = 1;
                imageAreaRef.current.style.transform = 'scale(1)';
            }

            const globalProgress = scrolled / scrollableDistance;
            let targetWidth = 100;
            let textOpacity = 0;

            // 1. FAZ: Küçülme
            if (globalProgress < SHRINK_END) {
                const shrinkProgress = globalProgress / SHRINK_END;
                targetWidth = 100 - (shrinkProgress * 50);
                textOpacity = 0;
            } else if (globalProgress < TEXT_START) {
                targetWidth = 50;
                textOpacity = 0;
            } else {
                targetWidth = 50;
                textOpacity = 1;
            }

            if (imageAreaRef.current) imageAreaRef.current.style.width = `${targetWidth}%`;
            if (textAreaRef.current) textAreaRef.current.style.opacity = textOpacity;

            // 2. FAZ: İndeks Hesaplama (YENİ MANTIK)
            let slideGlobalProgress = 0;
            if (globalProgress > TEXT_START) {
                slideGlobalProgress = (globalProgress - TEXT_START) / (1 - TEXT_START);
            }

            // GAP: Her resimden sonra yarım ekranlık (0.5) boşluk/bekleme süresi
            const GAP = 0.5;
            const totalSlides = sections.length;
            const totalUnits = (totalSlides - 1) * (1 + GAP);
            const currentUnit = slideGlobalProgress * totalUnits;

            // --- DEĞİŞİKLİK BURADA: Tam Oturma Kontrolü ---
            let calculatedIndex = 0;
            for (let i = 1; i < totalSlides; i++) {
                // Bu resmin (i) hareketi ne zaman biter?
                // Başlangıç noktası + 1 birim (hareket süresi)
                const finishPoint = (i - 1) * (1 + GAP) + 1;

                // Eğer şimdiki scroll (currentUnit) bitiş noktasını geçtiyse (veya çok yaklaştıysa),
                // resim yerine oturmuş demektir. O zaman yazıyı tetikle.
                // (-0.02 ufak bir toleranstır, takılmayı önler)
                if (currentUnit >= finishPoint - 0.02) {
                    calculatedIndex = i;
                }
            }
            setActiveIndex(calculatedIndex);

            // 3. FAZ: Resim Hareketi
            imageRefs.current.forEach((imgWrapper, i) => {
                if (!imgWrapper) return;

                if (i === 0) {
                    // İlk resim sabit
                    imgWrapper.style.transform = `translateY(0) scale(1)`;
                    imgWrapper.style.opacity = 1;
                } else {
                    const startPoint = (i - 1) * (1 + GAP);
                    let localProgress = currentUnit - startPoint;

                    // 0 ile 1 arasında sınırla (1'den sonrası bekleme süresidir)
                    localProgress = Math.min(Math.max(localProgress, 0), 1);

                    const translateVal = (1 - localProgress) * 100;
                    imgWrapper.style.transform = `translateY(${translateVal}%) scale(1)`;
                    imgWrapper.style.zIndex = 10 + i;
                    imgWrapper.style.opacity = 1;
                }
            });

        } else if (rect.top > 0) {
            setActiveIndex(0);
            if (imageAreaRef.current) {
                imageAreaRef.current.style.width = '100%';
                imageAreaRef.current.style.opacity = 1;
                imageAreaRef.current.style.transform = 'scale(1)';
            }
            if (textAreaRef.current) {
                textAreaRef.current.style.opacity = 0;
            }
            imageRefs.current.forEach((el, i) => {
                if (!el) return;
                if (i === 0) {
                    el.style.transform = `translateY(0) scale(1)`;
                } else {
                    el.style.transform = 'translateY(100%)';
                }
            });
        }
    }, [sections]);

    useEffect(() => {
        const onScroll = () => {
            if (!ticking.current) {
                window.requestAnimationFrame(() => {
                    updateAnimation();
                    ticking.current = false;
                });
                ticking.current = true;
            }
        };
        const onResize = () => updateAnimation();

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);
        updateAnimation();

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
        };
    }, [updateAnimation]);

    return (
        <>
            <HeroSection />
            <div
                ref={containerRef}
                className="hiw-container"
                // HIZ AYARI: 175 (İdeal akış)
                style={{ height: `${sections.length > 0 ? (sections.length * 175) : 100}vh` }}
            >
                <div className="hiw-sticky-wrapper">
                    <div className="hiw-image-area" ref={imageAreaRef}>
                        <div className="hud-overlay">
                            <div className="hud-corner top-left"></div>
                            <div className="hud-corner top-right"></div>
                            <div className="hud-corner bottom-left"></div>
                            <div className="hud-corner bottom-right"></div>
                            <div className="hud-live"><span className="blink-dot"></span> LIVE TELEMETRY</div>
                        </div>
                        {sections.map((section, index) => (
                            <div key={section.id} className="hiw-img-wrapper" ref={el => imageRefs.current[index] = el}>
                                <img src={section.image} alt={section.title} className="hiw-sticky-img" />
                            </div>
                        ))}
                    </div>

                    <div className="hiw-text-area" ref={textAreaRef}>
                        <div className="hiw-static-frame">
                            {sections.map((item, index) => {
                                const isActive = index === activeIndex;
                                return (
                                    <div key={item.id} className={`hiw-content-layer ${isActive ? 'active' : ''}`}>
                                        <Typewriter text={item.title} isActive={isActive} tag="h2" speed={40} />
                                        <Typewriter text={item.description} isActive={isActive} tag="p" speed={5} delay={0} />
                                        {item.subSystems && (
                                            <div className="hiw-subsystems">
                                                <h4 style={{ color: '#ff1801', fontSize: '0.9rem', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', textShadow: '0 0 10px rgba(0,0,0,0.5)', opacity: 1 }}>
                                                    System Components
                                                </h4>
                                                <div className="subsystem-grid">
                                                    {item.subSystems.map((sub, sIndex) => (
                                                        <div key={sIndex} className="tech-pill">
                                                            <span className="tech-dot"></span>{sub}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {item.specs && (
                                            <div className="hiw-specs">
                                                {item.specs.map((spec, i) => (
                                                    <div key={i} className="spec-row">
                                                        <span className="spec-label">{spec.label}</span>
                                                        <div className="spec-bar-bg">
                                                            <div className="spec-bar-fill" style={{ width: isActive ? `${spec.value}%` : '0%' }}></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="hiw-pagination">
                        {sections.map((_, index) => (
                            <div key={index} className={`hiw-page-indicator ${index === activeIndex ? 'active' : ''}`}></div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default HowItWorks;