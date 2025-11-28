import './history.css';

const eras = [
    { year: '1950', title: 'Başlangıç', detail: 'Silverstone’daki ilk Dünya Şampiyonası yarışı.' },
    { year: '1988', title: 'Turbo Çağı', detail: 'McLaren-Honda 16 yarışın 15’ini kazandı.' },
    { year: '2004', title: 'Michael Schumacher', detail: '13 galibiyetlik sezon rekoru.' },
    { year: '2021', title: 'Yeni Nesil', detail: 'Hamilton ve Verstappen arasındaki tarihi mücadele.' }
];

export default function HistoryPage() {
    return (
        <section className="page history-page">
            <header className="page-header">
                <p>F1 tarihindeki dönüm noktaları.</p>
            </header>
            <div className="timeline">
                {eras.map((era) => (
                    <article key={era.year} className="timeline-item">
                        <span className="timeline-year">{era.year}</span>
                        <h2>{era.title}</h2>
                        <p>{era.detail}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
