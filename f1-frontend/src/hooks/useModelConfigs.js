import { useEffect, useState } from 'react';
import axios from 'axios';

const FALLBACK_MODELS = [
    {
        name: 'F1-Fever',
        slug: 'main',
        path: '/assets/model.glb',
        description: 'Varsayılan Formula 1 modeli',
        rotationY: 90,
        scale: 1
    }
];

function sanitizeModels(data) {
    if (Array.isArray(data)) {
        return data;
    }
    if (data && typeof data === 'object') {
        return Object.values(data);
    }
    return [];
}

export function useModelConfigs() {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        axios
            .get('/assets/models.json')
            .then((response) => {
                if (!mounted) return;
                const nextModels = sanitizeModels(response.data);
                if (!nextModels.length) {
                    console.warn('models.json boş veya hatalı formatta, fallback kullanılacak.');
                    setModels(FALLBACK_MODELS);
                } else {
                    setModels(nextModels);
                }
                setError(null);
            })
            .catch((err) => {
                if (!mounted) return;
                setError(err);
                setModels(FALLBACK_MODELS);
            })
            .finally(() => {
                if (mounted) {
                    setLoading(false);
                }
            });

        return () => {
            mounted = false;
        };
    }, []);

    return { models, loading, error };
}