import { Suspense, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Html, OrbitControls, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import TWEEN from '@tweenjs/tween.js';

const spacing = 8;

function AsphaltGround() {
    const texture = useTexture('/assets/asfalt.png');

    useMemo(() => {
        // Daha yüksek kalite için asfalt dokusunu döşeyerek (tiling) kullan
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        // Buradaki  değerleri (4, 4) artırıp azaltarak tekrar sıklığını ayarlayabilirsin
        texture.repeat.set(4, 4);
        texture.anisotropy = 8;
        // Gerekirse yön için merkez ve rotasyonla yine oynayabiliriz
        texture.center.set(0.5, 0.5);
        return texture;
    }, [texture]);

    useEffect(() => () => texture.dispose(), [texture]);

    return (
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]} receiveShadow>
            {/* args = [en (X), boy (Z)] */}
            <planeGeometry args={[100, 30]} />
            <meshStandardMaterial
                map={texture}
                roughness={0.9}
                metalness={0.05}
            />
        </mesh>
    );
}

function TweenUpdater() {
    useFrame(() => {
        TWEEN.update();
    });
    return null;
}

function LoadingFallback() {
    return (
        <Html center>
            <div style={{ color: '#fff', fontSize: 14, letterSpacing: 2 }}>Model yükleniyor...</div>
        </Html>
    );
}

function LoadedModel({ config, index, total, activeIndex }) {
    const group = useRef();
    const wheelsRef = useRef([]);
    const isActive = index === activeIndex;
    const gltf = useGLTF(config.path);
    const clonedScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
    const baseX = (index - (total - 1) / 2) * spacing;

    useEffect(() => {
        if (!group.current) return;
        group.current.clear();
        wheelsRef.current = [];
        const root = clonedScene;
        root.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                const name = child.name ? child.name.toLowerCase() : '';
                if (name.includes('wheel') || name.includes('tire') || name.includes('tekerlek')) {
                    wheelsRef.current.push(child);
                }
            }
        });
        group.current.add(root);

        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetLength = config.length || 15;
        const autoScale = targetLength / maxDim;
        const scale = config.scale ?? autoScale;
        group.current.scale.setScalar(scale);
        group.current.position.set(baseX, -box.min.y * scale, isActive ? 0 : -2);
        group.current.rotation.y = THREE.MathUtils.degToRad(config.rotationY ?? 90);

        const floatTween = new TWEEN.Tween(group.current.position)
            .to({ y: group.current.position.y + 0.05 }, 2200)
            .yoyo(true)
            .repeat(Infinity)
            .start();

        return () => {
            floatTween.stop();
        };
    }, [clonedScene, config.length, config.rotationY, config.scale, baseX, isActive]);

    useEffect(() => {
        if (!group.current) return;
        gsap.to(group.current.position, {
            duration: 0.8,
            x: baseX,
            z: isActive ? 0 : -2,
            ease: 'power3.out'
        });
    }, [baseX, isActive]);

    useEffect(() => {
        if (!group.current) return;
        const handleWheel = (event) => {
            if (!isActive) return;
            event.preventDefault();
            const direction = event.deltaY > 0 ? 1 : -1;
            const moveAmount = direction * 0.6;
            const forward = new THREE.Vector3(0, 0, -1)
                .applyQuaternion(group.current.quaternion)
                .setY(0)
                .normalize();
            const targetX = group.current.position.x + forward.x * moveAmount;
            const targetZ = group.current.position.z + forward.z * moveAmount;
            gsap.to(group.current.position, {
                duration: 0.5,
                x: targetX,
                z: targetZ,
                ease: 'power2.out'
            });
            wheelsRef.current.forEach((wheel) => {
                gsap.to(wheel.rotation, {
                    duration: 0.5,
                    x: wheel.rotation.x + direction * Math.PI * 0.5,
                    ease: 'power2.out'
                });
            });
        };
        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [isActive]);

    return <group ref={group} />;
}

const SHOW_GROUND = true;

function ModelScene({ models, activeIndex }) {
    if (!models.length) {
        return (
            <div style={{ color: '#fff', padding: 32 }}>
                Yüklenecek model bulunamadı. Lütfen models.json içeriğini kontrol edin.
            </div>
        );
    }

    const devicePixelRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio;

    return (
        <Canvas
            shadows
            camera={{ position: [0, 3.6, 9.5], fov: 60 }}
            dpr={Math.min(devicePixelRatio, 2)}
        >
            <color attach="background" args={['#0b0b0e']} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow shadow-mapSize-height={2048} shadow-mapSize-width={2048} />
            <directionalLight position={[-10, 5, 5]} intensity={0.6} />
            <Suspense fallback={<LoadingFallback />}>
                {models.map((config, index) => (
                    <LoadedModel
                        key={config.slug ?? config.name ?? index}
                        config={config}
                        index={index}
                        total={models.length}
                        activeIndex={activeIndex}
                    />
                ))}
                <Environment files="/assets/map.hdr" background />
                {SHOW_GROUND && <AsphaltGround />}
                <ContactShadows position={[0, -0.001, 0]} blur={3} opacity={0.45} width={80} height={80} />
            </Suspense>
            <OrbitControls enablePan={false} minPolarAngle={Math.PI * 0.15} maxPolarAngle={Math.PI * 0.42} enableZoom={false} />
            <TweenUpdater />
        </Canvas>
    );
}

export default function ModelViewerCanvas({ models, activeIndex }) {
    return <ModelScene models={models} activeIndex={activeIndex} />;
}

useGLTF.preload('/assets/model.glb');