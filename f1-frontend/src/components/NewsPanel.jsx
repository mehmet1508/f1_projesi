import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './NewsPanel.css';

export default function NewsPanel() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Backend'den haberleri çek
                const res = await axios.get('http://localhost:5000/api/news');
                setNews(res.data);
            } catch (err) {
                console.error("Haberler alınamadı:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    if (loading) return <div className="loading-text" style={{color:'white', padding:'20px'}}>Son Dakika Haberleri Yükleniyor...</div>;

    return (
        <div className="news-container">
            <h3>SON DAKİKA - F1 DÜNYASI</h3>

            {/* BURAYI DEĞİŞTİRDİK: news-grid yerine news-scroll-wrapper */}
            <div className="news-scroll-wrapper">
                {news.map((item, index) => (
                    <a key={index} href={item.link} target="_blank" rel="noopener noreferrer" className="news-card">
                        <div className="news-image">
                            {/* Eğer resim yoksa varsayılan bir F1 resmi koyalım */}
                            <img src={item.image || "https://media.formula1.com/image/upload/f_auto/q_auto/v1677244984/f1/misc/placeholder-image.jpg"} alt="News" />
                            <span className="news-source">{item.source || "F1 News"}</span>
                        </div>
                        <div className="news-content">
                            <span className="news-date">{formatDate(item.pubDate)}</span>
                            <h4>{item.title}</h4>
                            <p>{item.content ? item.content.replace(/<[^>]+>/g, '').substring(0, 80) + "..." : ""}</p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}