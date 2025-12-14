import { useEffect, useMemo, useState } from "react";
import "./raceinfo.css";

export default function RaceInfo() {

    /* ---------- STATES ---------- */
    const [data, setData] = useState(null);
    const [query, setQuery] = useState("");

    /* ---------- FETCH ---------- */
    useEffect(() => {
        fetch("http://localhost:5000/api/raceinfo")
            .then(res => res.json())
            .then(setData)
            .catch(console.error);
    }, []);

    /* ---------- SEARCH INDEX ---------- */
    const searchIndex = useMemo(() => {
        return data
            ? [
                ...data.flags,
                ...data.penalties,
                ...data.scenarios
            ].map(item => ({
                id: item.id,
                title: item.title
            }))
            : [];
    }, [data]);

    const results = useMemo(() => {
        return searchIndex.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase())
        );
    }, [query, searchIndex]);

    /* ---------- LOADING ---------- */
    if (!data) {
        return <div className="loading-banner">Race info loading...</div>;
    }

    /* ---------- JSX ---------- */
    return (
        <div className="raceinfo">
            <h1>Race Control Explained</h1>

            {/* SEARCH */}
            <div className="search-wrapper">
                <input
                    className="raceinfo-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search: Safety Car, Yellow Flag..."
                />

                {query && (
                    <div className="search-dropdown">
                        {results.length === 0 && (
                            <div className="search-empty">No results</div>
                        )}

                        {results.map(r => (
                            <div
                                key={r.id}
                                className="search-item"
                                onClick={() => {
                                    document
                                        .getElementById(r.id)
                                        ?.scrollIntoView({ behavior: "smooth" });
                                    setQuery("");
                                }}
                            >
                                {r.title}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FLAGS */}
            <h2 className="section-title">Flags</h2>
            {data.flags.map(flag => (
                <section key={flag.id} id={flag.id} className="info-section">
                    <img src={flag.image} alt={flag.title} />
                    <div>
                        <h3>{flag.title}</h3>
                        <p><strong>Display:</strong> {flag.sections.display}</p>
                        <p><strong>Meaning:</strong> {flag.sections.meaning}</p>
                        <p><strong>Restriction:</strong> {flag.sections.restriction}</p>
                        <p><strong>Impact:</strong> {flag.sections.impact}</p>
                        <p className="warning">{flag.sections.penalty}</p>
                    </div>
                </section>
            ))}

            {/* PENALTIES */}
            <h2 className="section-title">Penalties</h2>
            {data.penalties.map(p => (
                <section key={p.id} id={p.id} className="info-section reverse">
                    <img src={p.image} alt={p.title} />
                    <div>
                        <h3>{p.title}</h3>
                        <p><strong>Reason:</strong> {p.sections.reason}</p>
                        <p><strong>Application:</strong> {p.sections.application}</p>
                        <p><strong>Impact:</strong> {p.sections.impact}</p>
                    </div>
                </section>
            ))}

            {/* SCENARIOS */}
            <h2 className="section-title">Race Scenarios</h2>
            {data.scenarios.map(s => (
                <section key={s.id} id={s.id} className="info-section">
                    <img src={s.image} alt={s.title} />
                    <div>
                        <h3>{s.title}</h3>
                        {Object.values(s.sections).map((text, i) => (
                            <p key={i}>{text}</p>
                        ))}
                    </div>
                </section>
            ))}

            {/* STEWARDS */}
            <h2 className="section-title">Steward Decisions</h2>
            {data.stewards.map(s => (
                <section key={s.id} className="info-section">
                    <div>
                        <h3>{s.title}</h3>
                        {Object.values(s.sections).map((text, i) => (
                            <p key={i}>{text}</p>
                        ))}
                    </div>
                </section>
            ))}

            {/* STRATEGY */}
            <h2 className="section-title">Strategy Impact</h2>
            {data.strategy.map(s => (
                <section key={s.id} className="info-section">
                    <div>
                        <h3>{s.title}</h3>
                        {Object.values(s.sections).map((text, i) => (
                            <p key={i}>{text}</p>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
