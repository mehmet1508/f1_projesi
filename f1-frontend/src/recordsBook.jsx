import HTMLFlipBook from "react-pageflip";
import "./recordsBook.css";
import f1 from "./assets/images/farina1.jpg";
import f2 from "./assets/images/farina2.avif";
import f3 from "./assets/images/farina3.avif";
import f5 from "./assets/images/farina5.jpg";
import f6 from "./assets/images/farina6.webp";

export default function RecordsBookPage() {
  return (
    <section className="records-book-wrapper page">
      <h1 className="book-title">
        F1 Legendary Drivers & Unforgettable F1 Moments
      </h1>

      <HTMLFlipBook
        width={650}
        height={820}
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
        {/* 📕 KAPAK SAYFASI */}
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

        {/* 📘 NINO FARINA PAGE */}
        <div className="book-page">
          <h2 className="driver-title">Nino Farina</h2>
          <h4 className="driver-team">Team: Alfa Romeo</h4>

          <div className="album-grid">
            <img src={f1} alt="Farina" />
            <img src={f2} alt="Farina" />
            <img src={f3} alt="Farina" />
            <img src={f5} alt="Farina" />
            <img src={f6} alt="Farina" />
          </div>

          <p className="driver-desc">
            Giuseppe “Nino” Farina, 1950 yılında tarihin ilk Formula 1 Dünya
            Şampiyonu oldu. Alfa Romeo 158 ile sergilediği kararlı, agresif ve
            kusursuz sürüş stiliyle modern F1’in temellerini atan pilotların
            başında gelir.
          </p>
        </div>

        {/* 📘 EMPTY PAGE FOR NEXT DRIVER */}
        <div className="book-page empty-page">
          <h2>Next Driver Page</h2>
          <p>Burayı sen doldurabilirsin.</p>
        </div>

        <div className="book-page empty-page">
          <h2>Next Driver Page</h2>
        </div>
      </HTMLFlipBook>
    </section>
  );
}
