import './howItWorks.css';

const steps = [
    {
        title: 'Aero Paketleri',
        description: 'Her pist için düşük/orta/yüksek sürükleme paketleri simülasyon ortamında denenir.'
    },
    {
        title: 'Güç Ünitesi',
        description: 'Enerji yönetimi stratejileri, ERS kullanım haritaları ve soğutma gereksinimleri CFD verileriyle eşleştirilir.'
    },
    {
        title: 'Veri Operasyonları',
        description: 'Telemetri, yapay zekâ destekli modeller ile gerçek zamanlı analiz edilir ve pit duvarına aktarılır.'
    }
];

export default function HowItWorksPage() {
    return (
        <section className="page how-page">
            <header className="page-header">
                <p>Bir hafta sonunun perde arkasında yüzlerce mühendis ve milyonlarca veri noktası bulunur.</p>
            </header>
            <div className="steps-grid">
                {steps.map((step) => (
                    <article key={step.title} className="step-card">
                        <h2>{step.title}</h2>
                        <p>{step.description}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
