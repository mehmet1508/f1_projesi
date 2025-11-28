import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StandingsPanel.css'; // Birazdan oluşturacağız

const StandingsPanel = () => {
    const [activeTab, setActiveTab] = useState('drivers'); // 'drivers' veya 'teams'
    const [data, setData] = useState([]);

    // Tab değişince veya sayfa açılınca veriyi çek
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Backend adresin (5000 portu)
                const response = await axios.get(`http://localhost:5000/api/standings/${activeTab}`);
                setData(response.data);
            } catch (error) {
                console.error("Veri çekilemedi:", error);
            }
        };

        fetchData();
    }, [activeTab]);

    return (
        <div className="standings-wrapper">
            <div className="standings-header">
                {/* SÜRÜCÜLER BUTONU */}
                <button
                    className={activeTab === 'drivers' ? 'active' : ''}
                    onClick={() => setActiveTab('drivers')}
                >
                    SÜRÜCÜLER
                </button>

                {/* TAKIMLAR BUTONU */}
                <button
                    className={activeTab === 'teams' ? 'active' : ''}
                    onClick={() => setActiveTab('teams')}
                >
                    TAKIMLAR
                </button>
            </div>

            <div className="standings-list">
                <table>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>{activeTab === 'drivers' ? 'Pilot' : 'Takım'}</th>
                        <th className="text-right">Puan</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((item, index) => (
                        <tr key={item._id}>
                            <td className="pos">{index + 1}</td>
                            <td className="name-cell">
                                {/* Eğer Drivers tabındaysak Takım logosunu göstermeyi deneyelim */}
                                {activeTab === 'drivers' && item.team_id && item.team_id.logo_url && (
                                    // Not: Resimlerin çalışması için backend'de statik dosya ayarı gerekebilir,
                                    // şimdilik sadece isimlere odaklanalım.
                                    <span className="team-indicator" title={item.team_id.name}>
                       {/* Buraya renk veya logo gelecek */}
                                        🏎️
                    </span>
                                )}
                                {item.name}
                            </td>
                            <td className="points text-right">{item.points} PTS</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StandingsPanel;