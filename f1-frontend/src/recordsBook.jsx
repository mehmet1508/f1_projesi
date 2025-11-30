import { useEffect, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import "./recordsBook.css";

export default function RecordsBookPage() {
  const [legends, setLegends] = useState(null);  // başlangıç: null

  useEffect(() => {
    fetch("http://localhost:5000/api/legends")
      .then((res) => res.json())
      .then((data) => setLegends(data))
      .catch((err) => console.error("Legends API Error:", err));
  }, []);

  // Flipbook'u legends gelmeden render etme!
  if (!legends) {
    return (
      <section className="records-book-wrapper page">
        <h1 className="book-title">F1 Legendary Drivers & Icons</h1>
        <p style={{ color: "#ccc" }}>Loading...</p>
      </section>
    );
  }

  return (
    <section className="records-book-wrapper page">
      <h1 className="book-title">F1 Legendary Drivers & Icons</h1>

      <HTMLFlipBook
        width={800}
        height={1000}
        size="stretch"
        minWidth={350}
        maxWidth={750}
        minHeight={500}
        maxHeight={950}
        showCover={true}
        useMouseEvents={true}
        mobileScrollSupport={true}
        className="f1-book"
      >

        {/* COVER PAGE */}
        <div className="book-page cover">
          <img
            src="/assets/images/f1logo.png"
            alt="F1 Logo"
            className="cover-f1-logo"
          />
          <h2 className="cover-title">F1 Records Book</h2>
          <p className="cover-subtitle">
            The legends, the battles, the moments that shaped Formula 1.
          </p>
        </div>

        {/* LEGEND DYNAMIC PAGES */}
        {legends.map((legend, index) => (
          <div key={index} className="book-page">
            <h2 className="driver-title">{legend.name}</h2>

            <h4 className="driver-team">
              Category: {legend.category.toUpperCase()}
            </h4>

            <div className="album-grid">
              <img
                src={legend.image_url}
                alt={legend.name}
                style={{ width: "100%", borderRadius: "10px" }}
              />
            </div>

            <p className="driver-desc">{legend.bio}</p>

            {legend.stats && (
              <ul style={{ color: "#ccc", marginTop: "15px" }}>
                {Object.entries(legend.stats).map(([key, value], idx) => (
                  <li key={idx}>
                    <strong>{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {/* LAST PAGE */}
        <div className="book-page empty-page">
          <h2>More Legends Coming Soon…</h2>
        </div>

      </HTMLFlipBook>
    </section>
  );
}
