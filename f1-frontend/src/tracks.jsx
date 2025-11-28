import './tracks.css';

const circuits = [
    { name: 'Bahrain International Circuit', country: 'Bahreyn', length: '5.412 km', laps: 57, highlight: 'Gece yarışı, yüksek fren yükü' },
    { name: 'Jeddah Corniche Circuit', country: 'Suudi Arabistan', length: '6.174 km', laps: 50, highlight: 'Takvimin en hızlı sokak pisti' },
    { name: 'Silverstone Circuit', country: 'Birleşik Krallık', length: '5.891 km', laps: 52, highlight: 'Yüksek hızlı virajlar, Aero testi' },
    { name: 'Monza', country: 'İtalya', length: '5.793 km', laps: 53, highlight: 'Hız tapınağı, düşük sürükleme paketleri' }
];

export default function TracksPage() {
    return (
        <section className="page tracks-page">
            <header className="page-header">
                <p>Dünya üzerindeki en ikonik pistler ve mühendislik açısından öne çıkan özellikleri.</p>
            </header>
            <div className="tracks-list">
                {circuits.map((circuit) => (
                    <article key={circuit.name} className="track-card">
                        <header>
                            <h2>{circuit.name}</h2>
                            <span>{circuit.country}</span>
                        </header>
                        <ul>
                            <li>Tur uzunluğu: {circuit.length}</li>
                            <li>Yarış mesafesi: {circuit.laps} tur</li>
                            <li>{circuit.highlight}</li>
                        </ul>
                    </article>
                ))}
            </div>
        </section>
    );
}
