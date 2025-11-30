import { Suspense, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Html, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import TWEEN from '@tweenjs/tween.js';

const spacing = 8;

function ShadowCatcher() {
    return (
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[300, 200]} />
            <shadowMaterial transparent opacity={0.4} />
        </mesh>
    );
}

function TweenUpdater() {
    useFrame(() => {
        TWEEN.update();
    });
    return null;
}

function CameraInitializer() {
    const controlsRef = useRef();
    const { camera } = useThree();
    
    useEffect(() => {
        // Kamerayı arka üstten bakacak şekilde ayarla
        camera.position.set(4, 5, 8);
        camera.lookAt(0, 0, 0);
        
        if (controlsRef.current) {
            controlsRef.current.update();
        }
    }, [camera]);

    return (
        <OrbitControls 
            ref={controlsRef}
            enablePan={false} 
            minPolarAngle={Math.PI * 0.25} 
            maxPolarAngle={Math.PI * 0.36} 
            enableZoom={false}
            target={[0, 0, 0]}
        />
    );
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
    const raycaster = useRef(new THREE.Raycaster());
    const shadowCatcherRef = useRef();
    const isActive = index === activeIndex;
    const gltf = useGLTF(config.path);
    const clonedScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
    const baseX = (index - (total - 1) / 2) * spacing;
    const { scene } = useThree();

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
        // Aktif araç merkezde (0,0,0), diğerleri geride
        group.current.position.set(0, -box.min.y * scale, isActive ? 0 : -2);
        group.current.rotation.y = THREE.MathUtils.degToRad(config.rotationY ?? 90);
    }, [clonedScene, config.length, config.rotationY, config.scale, isActive]);

    // Shadow catcher'ı bir kez bul
    useEffect(() => {
        if (!shadowCatcherRef.current) {
            scene.traverse((obj) => {
                if (obj.isMesh && obj.material && obj.material.type === 'ShadowMaterial') {
                    shadowCatcherRef.current = obj;
                }
            });
        }
    }, [scene]);

    // Raycast ile yüksekliği ayarla
    const lastPositionRef = useRef(new THREE.Vector3());
    useFrame(() => {
        if (!group.current || !isActive || !shadowCatcherRef.current) return;

        // Arabanın pozisyonu değiştiyse raycast yapma (hareket sırasında zıplamayı önle)
        const currentPos = group.current.position;
        const lastPos = lastPositionRef.current;
        const isMoving = Math.abs(currentPos.x - lastPos.x) > 0.001 || Math.abs(currentPos.z - lastPos.z) > 0.001;
        
        if (isMoving) {
            lastPositionRef.current.copy(currentPos);
            return; // Hareket sırasında raycast yapma
        }

        // Arabanın altından aşağı doğru raycast yap
        const carPosition = group.current.position.clone();
        const rayOrigin = new THREE.Vector3(carPosition.x, carPosition.y + 2, carPosition.z);
        const rayDirection = new THREE.Vector3(0, -1, 0);
        
        raycaster.current.set(rayOrigin, rayDirection);
        raycaster.current.layers.set(0);
        
        const intersects = raycaster.current.intersectObject(shadowCatcherRef.current, false);
        
        if (intersects.length > 0) {
            const hitPoint = intersects[0].point;
            const box = new THREE.Box3().setFromObject(group.current);
            const carBottom = box.min.y;
            const groundY = hitPoint.y;
            const offset = 0.01; // Küçük bir offset
            const targetY = groundY - carBottom + offset;
            
            // Çok yumuşak geçiş ile güncelle (zıplamayı önlemek için)
            group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.05);
        }
        
        lastPositionRef.current.copy(currentPos);
    });

    useEffect(() => {
        if (!group.current) return;
        // Sadece Z pozisyonunu güncelle (aktif/aktif değil)
        gsap.to(group.current.position, {
            duration: 0.8,
            z: isActive ? 0 : -2,
            ease: 'power3.out'
        });
    }, [isActive]);

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
                    x: wheel.rotation.x - direction * Math.PI * 0.5,
                    ease: 'power2.out'
                });
            });
        };
        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [isActive]);

    return <group ref={group} />;
}

function ShadowLight() {
    const lightRef = useRef();
    
    useEffect(() => {
        if (lightRef.current) {
            const light = lightRef.current;
            light.shadow.camera.left = -300;
            light.shadow.camera.right = 300;
            light.shadow.camera.top = 300;
            light.shadow.camera.bottom = -300;
            light.shadow.camera.near = 0.1;
            light.shadow.camera.far = 500;
            light.shadow.bias = -0.0005; // Titremeyi önlemek için artırıldı
            light.shadow.normalBias = 0.02; // Normal bias eklendi
            light.shadow.radius = 2; // Blur azaltıldı (daha keskin gölge)
            light.shadow.mapSize.width = 4096; // Shadow map resolution artırıldı
            light.shadow.mapSize.height = 4096;
            light.shadow.camera.updateProjectionMatrix();
        }
    }, []);

    return (
        <directionalLight 
            ref={lightRef}
            position={[5, 10, 5]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize-height={4096} 
            shadow-mapSize-width={4096}
        />
    );
}

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
            <ShadowLight />
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
                <ShadowCatcher />
                <ContactShadows position={[0, -0.001, 0]} blur={3} opacity={0.45} width={80} height={80} />
            </Suspense>
            <CameraInitializer />
            <TweenUpdater />
        </Canvas>
    );
}

export default function ModelViewerCanvas({ models, activeIndex }) {
    return <ModelScene models={models} activeIndex={activeIndex} />;
}

useGLTF.preload('/assets/model.glb');