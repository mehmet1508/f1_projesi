import './teams.css';

const teams = [
    {
        name: 'Scuderia Ferrari',
        principal: 'Frédéric Vasseur',
        drivers: ['Charles Leclerc', 'Carlos Sainz'],
        championshipPoints: 341,
        car: 'SF-24'
    },
    {
        name: 'Red Bull Racing',
        principal: 'Christian Horner',
        drivers: ['Max Verstappen', 'Sergio Pérez'],
        championshipPoints: 372,
        car: 'RB20'
    },
    {
        name: 'Mercedes-AMG',
        principal: 'Toto Wolff',
        drivers: ['Lewis Hamilton', 'George Russell'],
        championshipPoints: 247,
        car: 'W15'
    },
    {
        name: 'McLaren',
        principal: 'Andrea Stella',
        drivers: ['Lando Norris', 'Oscar Piastri'],
        championshipPoints: 298,
        car: 'MCL38'
    }
];

export default function TeamsPage() {
    return (
        <section className="page teams-page">
            <header className="page-header">
                <p>Sezonun en hızlı mühendislik eserleri ve direksiyon başındaki pilotlar.</p>
            </header>
            <div className="teams-grid">
                {teams.map((team) => (
                    <article key={team.name} className="team-card">
                        <div className="team-card__header">
                            <h2>{team.name}</h2>
                            <span>{team.car}</span>
                        </div>
                        <dl>
                            <div>
                                <dt>Takım Patronu</dt>
                                <dd>{team.principal}</dd>
                            </div>
                            <div>
                                <dt>Pilotlar</dt>
                                <dd>{team.drivers.join(' • ')}</dd>
                            </div>
                            <div>
                                <dt>Şampiyona Puanı</dt>
                                <dd>{team.championshipPoints} pts</dd>
                            </div>
                        </dl>
                    </article>
                ))}
            </div>
        </section>
    );
}
