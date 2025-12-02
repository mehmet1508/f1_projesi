// src/hooks/useGoogleMapsLoader.js
import { useState, useEffect } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

// Güvenlik: Anahtarların gerçek Node.js backend'den gelmesi gerekir, ancak şimdilik buraya yazılmıştır.
// --- AYARLAR ---
const GOOGLE_MAPS_API_KEY = "AIzaSyAGsvbRNpjPXYi3yKQtoZXZbz9X-YBSbdQ"; 
const GOOGLE_MAP_ID = "8adeafa9ebb401d98d8cc64c"; // Google Cloud Console'dan aldığın "VECTOR" Map ID

setOptions({
  key: GOOGLE_MAPS_API_KEY,
  v: "alpha", // 3D/Photorealistic Haritalar için zorunludur
});

export const useGoogleMapsLoader = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [libraries, setLibraries] = useState(null); // Yüklenen kütüphaneleri saklar

    useEffect(() => {
        const loadLibraries = async () => {
            if (isLoaded) return; // Zaten yüklüyse tekrar deneme

            try {
                // maps3d ve streetView kütüphanelerini aynı anda yükle
                const maps3d = await importLibrary("maps3d");
                const streetView = await importLibrary("streetView");

                setLibraries({ 
                    maps3d: maps3d,
                    streetView: streetView
                });
                setIsLoaded(true);

            } catch (err) {
                console.error("Global API Yükleme Hatası:", err);
                setError("Harita API'si yüklenirken hata oluştu. Anahtarları veya Map ID'yi kontrol edin.");
            }
        };

        loadLibraries();
    }, []); // Sadece mount anında çalışır

    return { 
        isLoaded, 
        error, 
        libraries, 
        mapId: GOOGLE_MAP_ID 
    };
};