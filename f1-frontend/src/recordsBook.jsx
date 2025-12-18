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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!bookRef.current) return;

      const flipBook = bookRef.current.pageFlip();

      if (e.key === "ArrowRight") {
        flipBook.flipNext();
      }

      if (e.key === "ArrowLeft") {
        flipBook.flipPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleFlip = (e) => {
    if (e.data === 1) {
      setOpened(true); // Contents sayfasına ulaşınca 3D dönüşe girsin
    }
  };

  const goToPage = (page) => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flip(page + 2);
    }
  };

  const goToContents = () => bookRef.current.pageFlip().flip(0);

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
      <HTMLFlipBook
        ref={bookRef}
        width={530}
        height={650}
        showCover={true}
        size="fixed"
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
        <div className="contents-page">
          <h2 className="contents-title">Contents</h2>

          <ul className="contents-list">
            <li onClick={() => goToPage(pilotsPageStart)}>
              <span className="contents-index">1.</span>
              <span className="contents-text pilots">Pilots</span>
            </li>

            <li onClick={() => goToPage(othersPageStart)}>
              <span className="contents-index">2.</span>
              <span className="contents-text others">
                Principals • Directors • Engineers • Innovators • Captains
              </span>
            </li>

            <li onClick={() => goToPage(mediaPageStart)}>
              <span className="contents-index">3.</span>
              <span className="contents-text media">Media</span>
            </li>
          </ul>
          <p className="keyboard-hint">⬅️ ➡️ Use arrow keys to flip pages</p>
        </div>

        {/* PILOTS TITLE PAGE */}
        <div className="book-page">
          <h1 className="book-section-title pilots">
            {/*f1 driver helmet is to long */}
            <svg
              id="Motorbike-Helmet--Streamline-Openmoji"
              viewBox="0 0 72 72"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              height="32"
              width="32"
            >
              <desc>
                Motorbike Helmet Streamline Emoji: https://streamlinehq.com
              </desc>
              <g id="color">
                <path
                  transform="translate(10.98 10.98) scale(.09775)"
                  fill="#ffffff"
                  stroke="#ffffff"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M239.6-10.21c-44.27 0-84.31 10.25-118.4 30.65l-.004.0039c-39.7 23.75-69.77 60.52-89.05 108.2v.002c-34.92 86.49 3.753 175.5 8.596 186.2l3.659 31.83 7.043 4.746 309.7 163.4 18.91-19.07s.0273-.004.041-.006c2.822-.4102 5.594-1.204 8.092-2.77 46.32-28.86 83.99-100.2 99.19-179.6v-.004c7.991-41.68 9.062-84.04 3.031-122.8l-.002-.002c-6.955-44.63-23.04-84.55-47.88-118.3l-.002-.0039c-16.45-22.37-45.92-42.54-81.67-57.58h-.002c-38.22-16.09-81.02-24.91-121.2-24.91zm0 20.46c37.13 0 77.61 8.307 113.2 23.31h.004c33.31 14.02 60.28 33.38 73.12 50.85l.004.0059c22.78 30.94 37.64 67.58 44.14 109.3 5.624 36.14 4.662 76.32-2.908 115.8v.004c-14.42 75.33-52.76 143-89.93 166.1-.01.006-.0195.013-.0293.0195-.0569.0357-.1603.0586-.2031.0586-.0111.005-.0221.0104-.0332.0156-.0535-.006-.1293-.0195-.1856-.0488h-.002l-317.3-169c-.08985-.0479-.151-.1136-.1895-.1992l-.002-.008c-3.845-8.534-39.32-93.28-8.279-170.2v-.002c17.9-44.29 44.93-77.02 80.58-98.35l.0039-.001953c30.7-18.34 66.82-27.75 107.9-27.75z"
                  color="#000000"
                  display="none"
                ></path>
                <path
                  fill="#3f3f3f"
                  stroke="#3f3f3f"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m16 44.46-.1332-3.112c-1.748-5.302-2.465-12.26-1.214-16.17.9622-3.006 4.864-9.584 9.72-11.86 8.772-4.172 16.37-1.611 20.49-.3777 4.87 1.952 8.904 4.811 11.51 11.06 1.24 2.972 2.174 8.5 1.751 13.93-.2985 3.839-1.669 7.596-2.533 10.6-1.046 3.631-5.339 7.492-8.255 9.831l.4903.1222-1.622 1.988z"
                ></path>
                <path
                  fill="#3f3f3f"
                  stroke="#3f3f3f"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m16 44.46-.1332-3.112.4597.4917 31.01 16.52.4903.1222-1.622 1.988z"
                ></path>
                <path
                  transform="translate(10.98 10.98) scale(.09775)"
                  fill="#d22f27"
                  stroke-width="20.46"
                  d="M377 486c-1.719 0-3.453-.422-5.016-1.25l-317.3-169c-2.078-1.109-3.734-2.875-4.703-5.03-4.344-9.641-41.42-96.51-8.437-178.2 18.59-46.01 47.14-80.76 84.82-103.3 32.42-19.37 70.5-29.2 113.2-29.2 38.64 0 80.28 8.562 117.2 24.11 34.53 14.53 62.75 34.3 77.4 54.22 23.81 32.34 39.28 70.62 46.01 113.8 5.828 37.45 4.812 78.72-2.969 119.3-14.81 77.39-52.82 146.9-94.57 172.9-1.718 1.078-3.687 1.625-5.64 1.625z"
                ></path>
                <path
                  transform="translate(10.98 10.98) scale(.09775)"
                  fill="#3f3f3f"
                  stroke-width="20.46"
                  d="M476.2 171.2c-11.12-1.625-45.56-6.843-86.87-15.05-66.15-13.17-119.6-27.98-154.6-42.87-3.25-1.374-34.89-6.326-37.86-4.405-18.69 3.56-34.1 21.12-34.1 51.11 0 2.547-.031 62.72 15.16 93.89 5.343 10.98 27.31 28.17 149.7 72.43 64.47 23.31 128.1 43.54 133.1 45.12 6.952-18.97 12.61-39.2 16.59-60 7.781-40.61 8.797-81.87 2.969-119.3-1.11-7.109-2.469-14.08-4.047-20.91z"
                ></path>
                <path
                  fill="none"
                  stroke="#9b9b9a"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m55.76 27.44.3762 2.314.3602 4.32-.0481 2.445-.2961 3.049-.6881 3.614-.7776 3.58"
                ></path>
                <path
                  stroke="#000000"
                  stroke-width="2"
                  d="M26.883 25.52a3.957 3.957 0 1 0 7.914 0 3.957 3.957 0 1 0-7.914 0"
                ></path>
              </g>
              <g id="line" fill="none" stroke="#000000">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M47.83175 58.4865c-.16803225 0-.33753075-.0412505-.490314-.1221875l-31.016075-16.51975c-.2031245-.10840475-.3649985-.28103125-.45971825-.4916825-.424626-.94240775-4.048805-9.4338525-.82471675-17.41905 1.323535-3.274625 3.1622125-5.9656825 5.4867075-8.0379825.8678245-.7735935 1.8034875-1.4613625 2.8044475-2.0595925 3.169055-1.8934175 6.891375-2.8543 11.0653-2.8543 3.77706 0 7.84737.8369355 11.4563 2.3567525 3.3753075 1.4203075 6.1338125 3.352825 7.56585 5.300005 2.3274275 3.161235 3.83962 6.903105 4.4974775 11.12395.569687 3.6607375.470373 7.69488-.29021975 11.661575-1.4476775 7.5648725-5.163155 14.359475-9.2442175 16.900975-.1679345.1053745-.36040425.15884375-.55131.15884375z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m16 44.46 30.21 16.01"
                ></path>
                <path
                  stroke-width="2"
                  d="M57.52855 27.7148c-1.08698-.15884375-4.45349-.66890325-8.4915425-1.4711375-6.4661625-1.2873675-11.6909-2.735045-15.11215-4.1905425-.3176875-.1343085-3.4104975-.6183665-3.700815-.43058875-1.8269475.34799-3.333275 2.06448-3.333275 4.9960025 0 .24896925-.00303025 6.13088 1.48189 9.1777475.52227825 1.073295 2.6695525 2.7536175 14.633175 7.0800325 6.3019425 2.2785525 12.521775 4.256035 13.010525 4.41048.679558-1.8543175 1.2326275-3.8318 1.6216725-5.865.76059275-3.9696275.85990675-8.0027925.29021975-11.661575-.1085025-.69490475-.24134475-1.37632-.39559425-2.0439525z"
                ></path>
              </g>
            </svg>
            PILOTS
          </h1>
          <p className="book-section-subtitle">
            The greatest drivers in Formula 1 history.
          </p>
        </div>

        {/* PILOT PAGES */}
        {pilots.map((p, i) => (
          <div className="book-page" key={i}>
            <div className="back-to-contents" onClick={goToContents}>
              ← Back to Contents
            </div>
            <h2 className="driver-title">{p.name.toUpperCase()}</h2>
            <h4 className="driver-team">Category: Pilot</h4>

            <img
              src={p.image_url}
              style={{ width: "60%", margin: "0 auto", borderRadius: 10 }}
            />

            {p.stats && (
              <div className="driver-stats">
                {Object.entries(p.stats).map(([key, value]) => (
                  <p key={key}>
                    <strong>{key.replace(/_/g, " ").toUpperCase()}:</strong>{" "}
                    {value}
                  </p>
                ))}
              </div>
            )}

            <p className="driver-desc">
              {p.bio}{" "}
              <a href={p.related_link} className="more-link" target="_blank">
                More..
              </a>
            </p>
          </div>
        ))}

        {/* OTHERS TITLE PAGE */}
        <div className="book-page">
          <div className="back-to-contents" onClick={goToContents}>
            ← Back to Contents
          </div>

          <h1 className="book-section-title others">
            PRINCIPALS ❟ DIRECTORS ❟ ENGINEERS ❟ INNOVATORS ❟ CAPTAINS
          </h1>
        </div>

        {/* OTHERS PAGES */}
        {others.map((p, i) => (
          <div className="book-page" key={i}>
            <div className="back-to-contents" onClick={goToContents}>
              ← Back to Contents
            </div>
            <h2 className="driver-title">{p.name.toUpperCase()}</h2>
            <h4 className="driver-team">Category: Team / Technical</h4>

            <img
              src={p.image_url}
              style={{ width: "60%", margin: "0 auto", borderRadius: 10 }}
            />

            {p.stats && (
              <div className="driver-stats">
                {Object.entries(p.stats).map(([key, value]) => (
                  <p key={key}>
                    <strong>{key.replace(/_/g, " ").toUpperCase()}:</strong>{" "}
                    {value}
                  </p>
                ))}
              </div>
            )}

            <p className="driver-desc">{p.bio} <a href={p.related_link} className="more-link" target="_blank">
                  More..
              </a>
            </p>
          </div>
        ))}

        {/* MEDIA TITLE PAGE */}
        <div className="book-page">
          <div className="back-to-contents" onClick={goToContents}>
            ← Back to Contents
          </div>

          <h1 className="book-section-title media">MEDIA</h1>

          <p className="book-section-subtitle">
            Broadcasters, journalists & iconic storytellers.
          </p>
        </div>

        {/* MEDIA PAGES */}
        {media.map((p, i) => (
          <div className="book-page" key={i}>
            <div className="back-to-contents" onClick={goToContents}>
              ← Back to Contents
            </div>
            <h2 className="driver-title">{p.name.toUpperCase()}</h2>
            <h4 className="driver-team">Category: Media</h4>

            <img
              src={p.image_url}
              style={{ width: "60%", margin: "0 auto", borderRadius: 10 }}
            />

            {p.stats && (
              <div className="driver-stats">
                {Object.entries(p.stats).map(([key, value]) => (
                  <p key={key}>
                    <strong>{key.replace(/_/g, " ").toUpperCase()}:</strong>{" "}
                    {value}
                  </p>
                ))}
              </div>
            )}

            <p className="driver-desc">{p.bio}
              {" "}
              <a href={p.related_link} className="more-link" target="_blank">
                More..
              </a>
            </p>
          </div>
        ))}
        <div className="book-page cover back-cover">
          {/*<h2 className="back-cover-title">F1 Legends</h2>*/}
          {/*<p className="back-cover-subtitle">Speed • Innovation • Legacy</p>*/}

          <img src="/assets/images/f1logo.png" className="back-cover-logo" />

          <p className="back-cover-footer">© Formula One History Archive</p>
        </div>
      </HTMLFlipBook>
    </section>
  );
}
