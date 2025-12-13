import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import { useGoogleMapsLoader } from './hooks/useGoogleMapsLoader';
import circuitsData from '../../f1-api-server/data/circuits.json';

const MapPage = () => {
    const { id } = useParams();
    const { isLoaded, libraries, mapId } = useGoogleMapsLoader();
    const circuit = circuitsData.find(c => c.id === id);

    const mapContainerRef = useRef(null);
    const streetViewRef = useRef(null);
    const mapInstanceRef = useRef(null); 
    const svInstanceRef = useRef(null);  
    const [viewMode, setViewMode] = useState('3D'); 


    // --- 1. 3D MAP INITIALIZER ---
    useEffect(() => {
        if (!isLoaded || viewMode !== '3D' || !circuit || !libraries) return;

        const init3DMap = () => {
            const { Map3DElement } = libraries.maps3d;
            
            if (mapContainerRef.current) {
                if (!mapInstanceRef.current) {
                    mapContainerRef.current.innerHTML = ''; 
                    const map = new Map3DElement({
                        center: circuit.center,
                        range: circuit.range,
                        tilt: circuit.tilt,
                        heading: circuit.heading,
                        mapId: mapId, 
                        mode: 'HYBRID',
                        gestureHandling: "COOPERATIVE"
                    });
                    mapContainerRef.current.appendChild(map);
                    mapInstanceRef.current = map; 
                }
            }
        };
        init3DMap();

        return () => {
            if (mapContainerRef.current) {
                mapContainerRef.current.innerHTML = '';
            }
            mapInstanceRef.current = null;
        };
        
    }, [isLoaded, viewMode, circuit, libraries, mapId]); 


    // --- 2. STREET VIEW INITIALIZER ---
    useEffect(() => {
        if (!isLoaded || viewMode !== 'STREET' || !circuit || !libraries) return;
        
        if (svInstanceRef.current && streetViewRef.current.children.length > 0) return;

        const initStreetView = () => {
            const { StreetViewPanorama } = libraries.streetView;
            
            if (streetViewRef.current) {
                streetViewRef.current.innerHTML = ''; 
                const panorama = new StreetViewPanorama(streetViewRef.current, {
                    position: { lat: circuit.streetView.lat, lng: circuit.streetView.lng },
                    pov: {
                        heading: circuit.streetView.heading,
                        pitch: 0,
                    },
                    zoom: 1,
                    disableDefaultUI: false, 
                    motionTracking: false,
                    motionTrackingControl: false
                });
                svInstanceRef.current = panorama;
            }
        };
        initStreetView();

        return () => {
             if (streetViewRef.current) {
                 streetViewRef.current.innerHTML = '';
             }
             svInstanceRef.current = null;
        };
    }, [isLoaded, viewMode, circuit, libraries]);


    const toggleViewMode = () => {
        setViewMode(viewMode === '3D' ? 'STREET' : '3D');
    };

    // 3. HANDLE MISSING CIRCUIT (e.g. invalid ID in URL)
    if (!circuit) {
        return (
            <div style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}>
                <h1>Pist bulunamadı! ({id})</h1>
                <Link to="/tracks" style={{color: '#e10600'}}>Listeye Dön</Link>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000' }}>
            
            <button 
                onClick={toggleViewMode}
                style={{
                    position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 1000, padding: '15px 30px', borderRadius: '50px',
                    background: viewMode === '3D' ? '#007aff' : '#ff9500',
                    color: 'white', border: 'none', fontSize: '1.2rem', fontWeight: 'bold',
                    cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', transition: 'all 0.3s ease',
                }}
            >
                {viewMode === '3D' ? '👀 PİSTE İN (Street View)' : '🚁 HAVALAN (3D Drone)'}
            </button>

            <Link to="/tracks" style={{
                position: 'absolute', top: 20, left: 20, zIndex: 1000,
                padding: '10px 20px', background: '#e10600', color: 'white',
                textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold'
            }}>
                ← PİST DEĞİŞTİR
            </Link>

            {/* 3D Map Container */}
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%', display: viewMode === '3D' ? 'block' : 'none' }} />

            {/* Street View Container */}
            <div ref={streetViewRef} style={{ width: '100%', height: '100%', display: viewMode === 'STREET' ? 'block' : 'none' }} />

        </div>
    );
};

export default MapPage;