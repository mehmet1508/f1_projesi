import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { Link } from 'react-router-dom';
import './tracks.css';

const TrackPage = () => {
  const globeEl = useRef();

  const [circuits, setCircuits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Track window size for the globe
  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  useEffect(() => {
    const fetchCircuits = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/circuitData');
        const data = await response.json();
        setCircuits(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching circuits:", error);
        setLoading(false);
      }
    };

    fetchCircuits();
  }, []);

  // Update globe size when resizing window
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-rotate logic
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  const handleHover = (circuit) => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = false;
      globeEl.current.pointOfView({ 
        lat: circuit.lat, 
        lng: circuit.lng, 
        altitude: 1.5 
      }, 1000);
    }
  };

  return (
    <div className="home-page-container">
      <div className="globe-container">
        <Globe
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          htmlElementsData={circuits}
          htmlElement={d => {
            const el = document.createElement('div');
            el.className = 'map-marker';
            el.innerHTML = `
              <div class="marker-arrow"></div>
              <div class="track-tooltip">
                <div style="font-weight:bold; margin-bottom:5px;">${d.name}</div>
                ${d.imgUrl ? `<div class="track-img-container"><img src="${d.imgUrl}" class="track-img" /></div>` : ''}
              </div>
            `;
            el.onclick = () => handleHover(d);
            return el;
          }}
        />
      </div>

      <div className="main-sidebar">
        <h1>🏎️ F1 Explorer</h1>
        <p>Select a track to preview:</p>
        
        <div className="circuit-nav">
          {circuits.map(circuit => (
            <Link 
              key={circuit.id} 
              to={`/map/${circuit.id}`}
              className="circuit-link"
              onMouseEnter={() => handleHover(circuit)}
            >
              {circuit.name} <span>🏁</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default TrackPage;