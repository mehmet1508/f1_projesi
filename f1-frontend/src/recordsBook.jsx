import { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import "./recordsBook.css";

export default function RecordsBookPage() {
  /* -------------------------
     🔥 TÜM HOOK'LAR EN ÜSTE
  --------------------------*/
  const [legends, setLegends] = useState(null);
  const bookRef = useRef(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/legends")
      .then((res) => res.json())
      .then((data) => setLegends(data))
      .catch((err) => console.error("Legends API Error:", err));
  }, []);

  const handleFlip = (e) => {
    if (e.data === 1) {
      setOpened(true); // Contents sayfasına ulaşınca 3D dönüşe girsin
    }
  };

  const goToPage = (page) => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flip(page);
    }
  };

  const goToContents = () => goToPage(1);

  /* -------------------------
     🚧 LOADING EKRANI
  --------------------------*/
  if (!legends) {
    return (
      <section className="records-book-wrapper page">
        <h1 className="book-title">F1 Legendary Drivers & Icons</h1>
        <p style={{ color: "#ccc" }}>Loading...</p>
      </section>
    );
  }

  /* -------------------------
     📂 VERİLERİ KATEGORİYE AYIR
  --------------------------*/
  const pilots = legends.filter((l) => l.category === "pilot");
  const others = legends.filter((l) => l.category === "others");
  const media = legends.filter((l) => l.category === "media");

  const pilotsPageStart = 2;
  const othersPageStart = pilotsPageStart + 1 + pilots.length;
  const mediaPageStart = othersPageStart + 1 + others.length;

  /* -------------------------
     📘 ANA JSX
  --------------------------*/
  return (
    <section className="records-book-wrapper page">
      <h1 className="book-title">F1 Legendary Drivers & Icons</h1>

      <HTMLFlipBook
        ref={bookRef}
        width={800}
        height={1000}
        showCover={true}
        size="stretch"
        onFlip={handleFlip}
        className={`f1-book ${opened ? "opened" : "closed"}`}
      >
        {/* COVER PAGE */}
        <div className="book-page cover">
          <img src="/assets/images/f1logo.png" className="cover-f1-logo" />
          <h2 className="cover-title">F1 Legends Book</h2>
          <p className="cover-subtitle">
            The legends, the battles, the moments that shaped Formula 1.
          </p>
        </div>

        {/* CONTENTS PAGE */}
        <div className="book-page">
          <h2 style={{ color: "white", textAlign: "center" }}>Contents</h2>

          <ul style={{ listStyle: "none", marginTop: 40 }}>
            <li
              style={{ cursor: "pointer", color: "#ffd890", marginBottom: 20, fontSize: "1.4rem" }}
              onClick={() => goToPage(pilotsPageStart)}
            >
              1. Pilots
            </li>

            <li
              style={{ cursor: "pointer", color: "#ffd890", marginBottom: 20, fontSize: "1.4rem" }}
              onClick={() => goToPage(othersPageStart)}
            >
              2. Principals, Directors, Engineers, Innovators, Captains
            </li>

            <li
              style={{ cursor: "pointer", color: "#ffd890", fontSize: "1.4rem" }}
              onClick={() => goToPage(mediaPageStart)}
            >
              3. Media
            </li>
          </ul>
        </div>

        {/* PILOTS TITLE PAGE */}
        <div className="book-page">
          <h1 style={{ color: "#ff9999", textAlign: "center", marginTop: 200 }}>PILOTS</h1>
          <p style={{ color: "#ccc", textAlign: "center", marginTop: 20 }}>
            The greatest drivers in Formula 1 history.
          </p>
        </div>

        {/* PILOT PAGES */}
        {pilots.map((p, i) => (
          <div className="book-page" key={i}>
            <div className="back-to-contents" onClick={goToContents}>← Back to Contents</div>
            <h2 className="driver-title">{p.name}</h2>
            <h4 className="driver-team">Category: Pilot</h4>

            <img src={p.image_url} style={{ width: "60%", margin: "0 auto", borderRadius: 10 }} />
            <p className="driver-desc">{p.bio}</p>
          </div>
        ))}

        {/* OTHERS TITLE PAGE */}
        <div className="book-page">
          <div className="back-to-contents" onClick={goToContents}>← Back to Contents</div>
          <h1 style={{ color: "#ffd890", textAlign: "center", marginTop: 200 }}>
            PRINCIPALS • DIRECTORS • ENGINEERS • INNOVATORS • CAPTAINS
          </h1>
        </div>

        {/* OTHERS PAGES */}
        {others.map((p, i) => (
          <div className="book-page" key={i}>
            <div className="back-to-contents" onClick={goToContents}>← Back to Contents</div>
            <h2 className="driver-title">{p.name}</h2>
            <h4 className="driver-team">Category: Team / Technical</h4>

            <img src={p.image_url} style={{ width: "60%", margin: "0 auto", borderRadius: 10 }} />
            <p className="driver-desc">{p.bio}</p>
          </div>
        ))}

        {/* MEDIA TITLE PAGE */}
        <div className="book-page">
          <div className="back-to-contents" onClick={goToContents}>← Back to Contents</div>
          <h1 style={{ color: "#a8d7ff", textAlign: "center", marginTop: 200 }}>MEDIA</h1>
          <p style={{ color: "#ccc", textAlign: "center" }}>
            Broadcasters, journalists & iconic storytellers.
          </p>
        </div>

        {/* MEDIA PAGES */}
        {media.map((p, i) => (
          <div className="book-page" key={i}>
            <div className="back-to-contents" onClick={goToContents}>← Back to Contents</div>
            <h2 className="driver-title">{p.name}</h2>
            <h4 className="driver-team">Category: Media</h4>

            <img src={p.image_url} style={{ width: "60%", margin: "0 auto", borderRadius: 10 }} />
            <p className="driver-desc">{p.bio}</p>
          </div>
        ))}

      </HTMLFlipBook>
    </section>
  );
}
