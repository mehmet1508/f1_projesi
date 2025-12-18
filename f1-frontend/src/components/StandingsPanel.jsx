import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StandingsPanel.css';

const StandingsPanel = () => {
    const [activeTab, setActiveTab] = useState('driverPoints');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setData([]);

            try {
                // --- ORTAK: Sürücü Puanlarını ve Statik Verileri Her Durumda Çekelim ---
                // Çünkü Takımlar tablosunda da pilot isimlerine ihtiyacımız var.
                const [pointsRes, staticRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/driverPoints'),
                    axios.get('http://localhost:5000/api/drivers')
                ]);

                // Sürücü verilerini birleştir (Resim vb. ekle)
                const allDrivers = pointsRes.data.map((pointData) => {
                    const staticData = staticRes.data.find(d => d._id === pointData._id);
                    return {
                        ...pointData,
                        image: staticData ? staticData.image : null,
                        helmet: staticData ? staticData.helmet : null,
                        // team_id bazen obje bazen string gelebilir, kontrol et
                        teamIdString: typeof pointData.team_id === 'object' ? pointData.team_id._id : pointData.team_id,
                        teamName: pointData.team_id?.name || staticData?.team_id || ""
                    };
                });

                if (activeTab === 'driverPoints') {
                    // --- SÜRÜCÜLER TABLOSU ---
                    // Sadece sırala ve göster
                    allDrivers.sort((a, b) => b.points - a.points);
                    setData(allDrivers);

                } else if (activeTab === 'teams') {
                    // --- TAKIMLAR TABLOSU ---
                    // Takım bilgilerini çek
                    const [teamPointsRes, teamStaticRes] = await Promise.all([
                        axios.get('http://localhost:5000/api/teamPoints'),
                        axios.get('http://localhost:5000/api/teams')
                    ]);

                    const mergedTeams = teamPointsRes.data.map((teamPoint) => {
                        const staticInfo = teamStaticRes.data.find(t => t._id === teamPoint._id);

                        // BU TAKIMA AİT SÜRÜCÜLERİ BUL
                        // (Sürücünün team_id'si ile Takımın _id'si eşleşmeli)
                        const teamDrivers = allDrivers.filter(d =>
                            d.teamIdString === teamPoint._id || d.team_id === teamPoint._id
                        );

                        // Sürücüleri puanlarına göre sırala (Takım içinde kim öndeyse üste)
                        teamDrivers.sort((a, b) => b.points - a.points);

                        return {
                            ...teamPoint,
                            logo_url: staticInfo ? staticInfo.logo_url : null,
                            principal: staticInfo ? staticInfo.principal : '',
                            drivers: teamDrivers // <-- Sürücüleri takım objesine ekledik
                        };
                    });

                    // Takımları puana göre sırala
                    mergedTeams.sort((a, b) => b.points - a.points);

                    setData(mergedTeams);
                }

            } catch (error) {
                console.error("Veri çekme hatası:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab]);

    return (
        <div className="standings-wrapper">
            <div className="standings-header">
                <button
                    className={activeTab === 'driverPoints' ? 'active' : ''}
                    onClick={() => setActiveTab('driverPoints')}
                >
                    DRİVERS
                </button>
                <button
                    className={activeTab === 'teams' ? 'active' : ''}
                    onClick={() => setActiveTab('teams')}
                >
                    TEAMS
                </button>
            </div>

            <div className="standings-list">
                {loading ? (
                    <div className="loading-text">Veriler Yükleniyor...</div>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th className="th-pos">POS</th>
                            <th className="th-name">{activeTab === 'driverPoints' ? 'DRİVER' : 'TEAMS AND DRİVERS'}</th>
                            <th className="th-points">POİNTS</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.length > 0 ? (
                            data.map((item, index) => (
                                <tr key={item._id}>
                                    <td className="pos-cell">{index + 1}</td>

                                    <td className="name-cell">
                                        {/* --- SÜRÜCÜ TABLOSU GÖRÜNÜMÜ --- */}
                                        {activeTab === 'driverPoints' && (
                                            <div className="info-flex">
                                                {item.helmet && (
                                                    <div className="img-container">
                                                        <img src={item.helmet} alt="Helmet" />
                                                    </div>
                                                )}
                                                <span className={`team-bar ${item.team_id?._id || item.team_id}`}></span>
                                                <div className="text-info">
                                                    <span className="main-name">{item.name}</span>
                                                    <span className="sub-name">{item.teamName}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* --- TAKIM TABLOSU GÖRÜNÜMÜ (YENİ) --- */}
                                        {activeTab === 'teams' && (
                                            <div className="team-row-container">
                                                {/* Üst Kısım: Takım Logosu ve Adı */}
                                                <div className="info-flex team-header-part">
                                                    {item.logo_url && (
                                                        <div className="img-container team-logo-bg">
                                                            <img src={item.logo_url} alt={item.name} />
                                                        </div>
                                                    )}
                                                    <div className="text-info">
                                                        <span className="main-name">{item.name}</span>
                                                        <span className="sub-name">{item.principal}</span>
                                                    </div>
                                                </div>

                                                {/* Alt Kısım: Sürücü Listesi */}
                                                <div className="team-drivers-list">
                                                    {item.drivers && item.drivers.map(driver => (
                                                        <div key={driver._id} className="mini-driver-row">
                                                            <span className="mini-driver-name">
                                                                <span className={`dot ${item._id}`}>•</span> {driver.name}
                                                            </span>
                                                            <span className="mini-driver-points">{driver.points} pts</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </td>

                                    <td className="points-cell">
                                        {item.points} <span className="pts-label">PTS</span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" style={{textAlign:"center", padding:"20px"}}>Veri bulunamadı.</td></tr>
                        )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default StandingsPanel;
