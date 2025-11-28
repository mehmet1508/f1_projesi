import './recordsBook.css';

const records = [
    { title: 'En Çok Şampiyonluk', holder: 'Lewis Hamilton & Michael Schumacher', detail: '7 Dünya Şampiyonluğu' },
    { title: 'Arka Arkaya En Fazla Yarış Galibiyeti', holder: 'Max Verstappen', detail: '2023 sezonunda 10 galibiyet' },
    { title: 'En Genç Yarış Galibi', holder: 'Max Verstappen', detail: '18 yaş, 228 gün (İspanya GP 2016)' },
    { title: 'En Uzun Podium Serisi', holder: 'Lewis Hamilton', detail: '2007-2008 arası 33 podium' }
];

export default function RecordsBookPage() {
    return (
        <section className="page records-page">
            <header className="page-header">
                <p>Formula 1 tarihinin kırılması en zor rekorları.</p>
            </header>
            <div className="records-grid">
                {records.map((record) => (
                    <article key={record.title} className="record-card">
                        <h2>{record.title}</h2>
                        <strong>{record.holder}</strong>
                        <p>{record.detail}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
