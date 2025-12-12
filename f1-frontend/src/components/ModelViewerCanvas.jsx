import { Suspense, useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Html, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

const spacing = 8;
const defaultCameraPosition = new THREE.Vector3(4, 5, 8);
const defaultCameraTarget = new THREE.Vector3(0, 0, 0);
const ENABLE_ZOOM_ON_SELECT = true;

const PART_INFOS = [
    {
        matchers: ['wheel', 'tire', 'tekerlek', 'wheels'],
        title: 'Tekerlek',
        description: 'Lastik bileşimi, sıcaklık ve aerodinamiğe etkisi hakkında bilgi.'
    },
    {
        matchers: ['front', 'nose', 'wing', 'front_wings'],
        title: 'Ön Kanat',
        description: 'Ön kanat hava akışını yönlendirir, downforce üretir.'
    },
    {
        matchers: ['rear', 'back', 'spoiler', 'back_wings'],
        title: 'Arka Kanat',
        description: 'Denge için yüksek hızda downforce sağlar, DRS ile azaltılır.'
    },
    {
        matchers: ['cockpit', 'halo', 'driver', 'hola'],
        title: 'Kokpit',
        description: 'Sürücü koruması ve halo yapısı FIA standartlarını karşılar.'
    },
    {
        matchers: ['body', 'chassis', 'monocoque', 'gövde'],
        title: 'Gövde / Şasi',
        description: 'Karbon monokok yapı, güvenlik hücresi ve yapısal rijitlik.'
    },
    {
        matchers: ['engine', 'powerunit', 'motor'],
        title: 'Güç Ünitesi',
        description: 'İçten yanmalı motor, turbo, MGU-K/H ve batarya paketinin yönetimi.'
    },
    {
        matchers: ['sidepod', 'radiator', 'soğutma'],
        title: 'Sidepod / Soğutma',
        description: 'Hava girişleri, radyatör yerleşimi ve termal yönetim.'
    },
    {
        matchers: ['floor', 'venturi', 'taban'],
        title: 'Taban / Venturi',
        description: 'Yer etkisi kanalları ile downforce üreten taban yapısı.'
    }
];

const HOTSPOT_KEYS = ['wheels', 'hola', 'back_wings', 'front_wings', 'sidepod', 'engine'];
const HOTSPOT_INFO_BY_KEY = {
    wheels: {
        title: 'Tekerlek',
        description: 'Formula 1 araçlarında kullanılan Pirelli lastikleri, farklı bileşimler ve bileşiklerle üretilir. Lastik sıcaklığı, basıncı ve aşınması performansı doğrudan etkiler. Aerodinamik olarak tekerlekler, hava akışını yönlendiren önemli bir bileşendir. Karbon fiber jantlar hafiflik ve dayanıklılık sağlar.'
    },
    hola: {
        title: 'Kokpit',
        description: 'Sürücü güvenliği için tasarlanmış kokpit, FIA standartlarına uygun şekilde üretilir. Halo sistemi, 2018\'den beri zorunlu olan kritik bir güvenlik özelliğidir. Kokpit içinde sürücü pozisyonu, görüş açısı ve ergonomi optimize edilmiştir. Monokok yapı ile entegre edilmiş güvenlik hücresi, çarpışmalarda sürücüyü korur.'
    },
    back_wings: {
        title: 'Arka Kanat',
        description: 'Arka kanat, yüksek hızlarda downforce üretir ve araç dengesini sağlar. DRS (Drag Reduction System) sistemi ile düz bölümlerde açılarak sürükleme kuvvetini azaltır ve geçiş hızını artırır. Kanat açısı ve elemanları, pist koşullarına göre ayarlanabilir. Aerodinamik verimlilik için sürekli geliştirilir.'
    },
    front_wings: {
        title: 'Ön Kanat',
        description: 'Ön kanat, hava akışını kontrol eden ve downforce üreten kritik bir aerodinamik bileşendir. Farklı elemanlar ve açılar ile hava akışı optimize edilir. Kanat elemanları, pist koşullarına göre ayarlanabilir. Ön kanat tasarımı, araç genelindeki hava akışını ve diğer aerodinamik bileşenlerin performansını doğrudan etkiler.'
    },
    sidepod: {
        title: 'Sidepod / Soğutma',
        description: 'Sidepod\'lar, motor ve güç ünitesi soğutma sistemlerini barındırır. Hava girişleri, radyatörler ve soğutma kanalları optimize edilmiş şekilde yerleştirilir. Aerodinamik olarak sidepod tasarımı, hava akışını yönlendirir ve downforce üretimine katkıda bulunur. Termal yönetim, motor performansı ve güvenilirliği için kritik öneme sahiptir.'
    },
    engine: {
        title: 'Güç Ünitesi',
        description: 'Modern Formula 1 güç ünitesi, 1.6L V6 turbo motor, MGU-K (kinetik enerji geri kazanımı), MGU-H (ısı enerjisi geri kazanımı) ve batarya sisteminden oluşur. Toplam güç yaklaşık 1000 beygir gücüne ulaşır. Hibrit teknoloji, yakıt verimliliğini artırırken performansı optimize eder. Motor haritası ve enerji yönetimi, pist koşullarına göre ayarlanır.'
    }
};
const PULSE_STYLE_ID = 'hotspot-marker-pulse-style';

function findPartInfo(name = '') {
    const lowered = name.toLowerCase();
    return PART_INFOS.find((part) => part.matchers.some((m) => lowered.includes(m)));
}

function resolveHotspotInfo(name = '') {
    const lowered = name.toLowerCase();
    // HOTSPOT_KEYS'deki her bir key için kontrol et
    for (const key of HOTSPOT_KEYS) {
        if (lowered.includes(key.toLowerCase())) {
            return HOTSPOT_INFO_BY_KEY[key];
        }
    }
    return findPartInfo(name);
}

function isHotspotName(name = '') {
    const lowered = name.toLowerCase();
    return HOTSPOT_KEYS.some((target) => lowered.includes(target));
}

function ensurePulseStyle() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(PULSE_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = PULSE_STYLE_ID;
    style.innerHTML = `
      @keyframes markerPulse {
        0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.8; }
        50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.8; }
      }
      @keyframes infoFade {
        0% { opacity: 0; transform: translateY(-50%) translateX(-10px); }
        100% { opacity: 1; transform: translateY(-50%) translateX(0); }
      }
    `;
    document.head.appendChild(style);
}

function ShadowCatcher() {
    return (
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[300, 200]} />
            <shadowMaterial transparent opacity={0.4} />
        </mesh>
    );
}

function CameraInitializer({ focusPoint, onZoomComplete }) {
    const onZoomCompleteRef = useRef(onZoomComplete);
    
    // onZoomComplete callback'ini ref'te sakla ki closure sorunu olmasın
    useEffect(() => {
        onZoomCompleteRef.current = onZoomComplete;
    }, [onZoomComplete]);
    const controlsRef = useRef();
    const { camera } = useThree();
    const isAnimatingRef = useRef(false);
    
    useEffect(() => {
        // Kamerayı arka üstten bakacak şekilde ayarla
        camera.position.copy(defaultCameraPosition);
        camera.lookAt(defaultCameraTarget);
        
        if (controlsRef.current) {
            controlsRef.current.update();
        }
        // OrbitControls referansını paylaş ki diğer componentler erişsin
        camera.userData.orbitControls = controlsRef.current;
    }, [camera]);

    useEffect(() => {
        const controls = controlsRef.current;
        if (!controls) return;

        // Animasyon başladığında OrbitControls'ün tüm kontrollerini devre dışı bırak
        isAnimatingRef.current = true;
        controls.enabled = false;

        const startPosition = camera.position.clone();
        const startTarget = controls.target.clone();

        // Odak noktası yoksa varsayılan konuma dön
        if (!focusPoint) {
            // Tek bir tween ile hem pozisyonu hem de hedefi senkronize şekilde güncelle
            const tweenData = {
                posX: startPosition.x,
                posY: startPosition.y,
                posZ: startPosition.z,
                targetX: startTarget.x,
                targetY: startTarget.y,
                targetZ: startTarget.z
            };
            
            const tween = gsap.to(tweenData, {
                duration: 1.8,
                posX: defaultCameraPosition.x,
                posY: defaultCameraPosition.y,
                posZ: defaultCameraPosition.z,
                targetX: defaultCameraTarget.x,
                targetY: defaultCameraTarget.y,
                targetZ: defaultCameraTarget.z,
                ease: 'power2.inOut',
                onUpdate: () => {
                    // Kamerayı ve hedefi senkronize şekilde güncelle
                    camera.position.set(tweenData.posX, tweenData.posY, tweenData.posZ);
                    controls.target.set(tweenData.targetX, tweenData.targetY, tweenData.targetZ);
                    // OrbitControls devre dışı olduğu için manuel olarak kamerayı hedefe bakacak şekilde ayarla
                    camera.lookAt(controls.target);
                },
                onComplete: () => {
                    isAnimatingRef.current = false;
                    controls.enabled = true;
                    controls.update();
                    // Zoom tamamlandığında callback'i çağır
                    if (onZoomCompleteRef.current) {
                        onZoomCompleteRef.current();
                    }
                }
            });
            
            return () => {
                tween.kill();
                isAnimatingRef.current = false;
                controls.enabled = true;
            };
        }

        // Odak noktası varsa yakına zoom yap
        const direction = new THREE.Vector3()
            .subVectors(camera.position, focusPoint)
            .normalize();
        const targetPosition = focusPoint
            .clone()
            .add(direction.multiplyScalar(3.2))
            .setY(focusPoint.y + 2.2);

        // Hedefi önce ayarla
        controls.target.copy(focusPoint);

        const tween = gsap.to(camera.position, {
            duration: 1.8,
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            ease: 'power2.out',
            onUpdate: () => {
                // OrbitControls devre dışı olduğu için manuel olarak kamerayı hedefe bakacak şekilde ayarla
                camera.lookAt(controls.target);
            },
            onComplete: () => {
                isAnimatingRef.current = false;
                controls.enabled = true;
                controls.update();
                // Zoom tamamlandığında callback'i çağır
                // onZoomComplete prop'unu closure'dan al
                if (onZoomComplete) {
                    onZoomComplete();
                }
            }
        });

        return () => {
            tween.kill();
            isAnimatingRef.current = false;
            controls.enabled = true;
        };
    }, [camera, focusPoint]);

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

function LoadedModel({ config, index, total, activeIndex, onPartSelect, onHotspotPositions, onHotspotInfos, onHoverHotspotIndex, onMarkerVisibilityChange }) {
    const group = useRef();
    const wheelsRef = useRef([]);
    const shadowCatcherRef = useRef();
    const hotspotNodesRef = useRef([]);
    const isActive = index === activeIndex;
    const gltf = useGLTF(config.path);
    const clonedScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
    const { scene, raycaster } = useThree();

    useEffect(() => {
        if (!group.current) return;
        group.current.clear();
        wheelsRef.current = [];
        hotspotNodesRef.current = [];
        const root = clonedScene;
        root.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                const name = child.name ? child.name.toLowerCase() : '';
                const hotspotInfo = resolveHotspotInfo(name);
                const shouldHide = isHotspotName(child.name || '');
                // Belirli meshleri görünmez yap ama tıklanabilir kalsın
                if (shouldHide) {
                    child.castShadow = false;
                    child.receiveShadow = false;
                    if (child.material) {
                        const original = child.material;
                        const cloneAndHide = (mat) => {
                            const cloned = mat.clone();
                            cloned.transparent = true;
                            cloned.opacity = 0;
                            cloned.depthWrite = false;
                            cloned.side = THREE.DoubleSide;
                            return cloned;
                        };
                        if (Array.isArray(original)) {
                            child.material = original.map(cloneAndHide);
                        } else {
                            child.material = cloneAndHide(original);
                        }
                    }
                    child.userData.isHotspot = true;
                    if (hotspotInfo) {
                        child.userData.hotspotInfo = hotspotInfo;
                    }
                    hotspotNodesRef.current.push(child);
                }
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

    // Hotspot world pozisyonlarını bildir
    useEffect(() => {
        if (!group.current) return;
        if (!isActive) {
            onHotspotPositions([]);
            if (onHotspotInfos) onHotspotInfos([]);
            onHoverHotspotIndex(null);
            if (onMarkerVisibilityChange) onMarkerVisibilityChange(false);
            return;
        }
        // Marker'ları başlangıçta GİZLE - sadece mouse model üzerindeyken gösterilecek
        if (onMarkerVisibilityChange) onMarkerVisibilityChange(false);
        // Bir sonraki frame'de hesapla ki bounding box'lar tam hesaplanmış olsun
        const rafId = requestAnimationFrame(() => {
            if (!group.current) return;
            group.current.updateMatrixWorld(true);
            const positions = hotspotNodesRef.current.map((node) => {
                const box = new THREE.Box3().setFromObject(node);
                const center = new THREE.Vector3();
                box.getCenter(center);
                // Hotspot pozisyonunu biraz aşağıya kaydır
                center.y -= 0.18;
                return center;
            });
            const infos = hotspotNodesRef.current.map((node) => {
                return node.userData.hotspotInfo || findPartInfo(node.name);
            });
            onHotspotPositions(positions);
            if (onHotspotInfos) onHotspotInfos(infos);
            onHoverHotspotIndex(null);
        });
        return () => cancelAnimationFrame(rafId);
    }, [clonedScene, config.length, config.rotationY, config.scale, isActive, onHotspotPositions, onHotspotInfos, onHoverHotspotIndex]);

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

    // Raycast ile yüksekliği ayarla ve hotspot pozisyonlarını güncelle
    const lastPositionRef = useRef(new THREE.Vector3());
    useFrame(() => {
        if (!group.current || !isActive) return;

        // Hotspot pozisyonlarını sürekli güncelle (araba hareket ederken)
        if (hotspotNodesRef.current.length > 0) {
            group.current.updateMatrixWorld(true);
            const positions = hotspotNodesRef.current.map((node) => {
                const box = new THREE.Box3().setFromObject(node);
                const center = new THREE.Vector3();
                box.getCenter(center);
                // Hotspot pozisyonunu biraz aşağıya kaydır
                center.y -= 0.18;
                return center;
            });
            const infos = hotspotNodesRef.current.map((node) => {
                return node.userData.hotspotInfo || findPartInfo(node.name);
            });
            onHotspotPositions(positions);
            if (onHotspotInfos) onHotspotInfos(infos);
        }

        if (!shadowCatcherRef.current) return;

        // Arabanın pozisyonu değiştiyse raycast yapma (hareket sırasında zıplamayı önle)
        const currentPos = group.current.position;
        const lastPos = lastPositionRef.current;
        const isMoving = Math.abs(currentPos.x - lastPos.x) > 0.001 || Math.abs(currentPos.z - lastPos.z) > 0.001;
        
        if (isMoving) {
            lastPositionRef.current.copy(currentPos);
            return; // Hareket sırasında raycast yapma
        }

        // Arabanın altından aşağı doğru raycast yap (R3F raycasting kullanarak)
        const carPosition = group.current.position.clone();
        const rayOrigin = new THREE.Vector3(carPosition.x, carPosition.y + 2, carPosition.z);
        const rayDirection = new THREE.Vector3(0, -1, 0);
        
        // R3F'in raycaster'ını kullan
        raycaster.set(rayOrigin, rayDirection);
        raycaster.layers.set(0);
        
        // Marker'ları raycast'ten hariç tut - sadece shadow catcher'ı kontrol et
        const intersects = raycaster.intersectObject(shadowCatcherRef.current, false);
        
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

    const handleClick = (event) => {
        if (!isActive) return;
        event.stopPropagation();
        const hitObject = event.intersections?.[0]?.object ?? event.object;
        if (!hitObject?.userData?.isHotspot) return;
        const info = hitObject.userData.hotspotInfo ?? findPartInfo(hitObject?.name);
        if (!info || !hitObject) {
            return;
        }

        const hotspotIndex = hotspotNodesRef.current.indexOf(hitObject);
        const box = new THREE.Box3().setFromObject(hitObject);
        const worldPosition = new THREE.Vector3();
        box.getCenter(worldPosition);
        // Hotspot pozisyonunu biraz aşağıya kaydır
        worldPosition.y -= 0.5;
        onPartSelect({
            ...info,
            position: worldPosition,
            hotspotIndex: hotspotIndex >= 0 ? hotspotIndex : null
        });
    };

    const handleHotspotOver = (event) => {
        if (!isActive) return;
        // Marker'lara hover yapılıyorsa hotspot node'larına hover yapma
        if (event.nativeEvent?.target?.closest('.marker-container')) return;
        const hitObject = event.intersections?.[0]?.object ?? event.object;
        if (!hitObject?.userData?.isHotspot) return;
        const idx = hotspotNodesRef.current.indexOf(hitObject);
        if (idx >= 0) {
            onHoverHotspotIndex(idx);
        }
        event.stopPropagation();
    };

    const handleHotspotOut = (event) => {
        if (!isActive) return;
        // Marker'lara hover yapılıyorsa hover'ı kaldırma
        if (event?.nativeEvent?.target?.closest('.marker-container')) return;
        onHoverHotspotIndex(null);
    };

    const handleGroupEnter = () => {
        // Marker'ları göster - SADECE mouse model üzerindeyken
        if (isActive) {
        onMarkerVisibilityChange(true);
        }
    };

    const handleGroupLeave = () => {
        // Gerçekten araçtan çıkıldığında marker'ları gizle
        if (isActive) {
        onMarkerVisibilityChange(false);
        }
        onHoverHotspotIndex(null);
    };

    return (
        <group
            ref={group}
            onClick={handleClick}
            onPointerOver={handleHotspotOver}
            onPointerOut={handleHotspotOut}
            onPointerEnter={handleGroupEnter}
            onPointerLeave={handleGroupLeave}
        />
    );
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
    const navigate = useNavigate();
    const [selectedPart, setSelectedPart] = useState(null);
    const [hotspotPositions, setHotspotPositions] = useState([]);
    const [hotspotInfos, setHotspotInfos] = useState([]);
    const [hoveredHotspotIndex, setHoveredHotspotIndex] = useState(null);
    const [showMarkers, setShowMarkers] = useState(false);
    const [showInfoBox, setShowInfoBox] = useState(false);
    const hoverTimeoutsRef = useRef({});
    const isOverMarkerRef = useRef(false);
    const markerVisibilityTimeoutRef = useRef(null);
    const clearSelection = (e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setSelectedPart(null);
        setHoveredHotspotIndex(null);
        setShowInfoBox(false);
    };
    
    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            Object.values(hoverTimeoutsRef.current).forEach(timeout => {
                if (timeout) clearTimeout(timeout);
            });
        };
    }, []);
    
    // Marker'a tıklanınca hotspot bilgisini kullan
    const handleMarkerClick = (idx) => {
        if (hotspotInfos[idx] && hotspotPositions[idx]) {
            const position = hotspotPositions[idx].clone();
            setSelectedPart({
                ...hotspotInfos[idx],
                position: position,
                hotspotIndex: idx
            });
        }
    };
    
    // Zoom animasyonu tamamlandığında kutucuğu göster - useRef ile closure sorununu çöz
    const handleZoomCompleteRef = useRef(null);
    handleZoomCompleteRef.current = () => {
        setShowInfoBox(true);
    };
    const handleZoomComplete = () => {
        if (handleZoomCompleteRef.current) {
            handleZoomCompleteRef.current();
        }
    };
    
    // selectedPart değiştiğinde kutucuğu göster (zoom varsa zoom tamamlandıktan sonra gösterilecek)
    useEffect(() => {
        if (selectedPart && selectedPart.position) {
            // Eğer zoom aktif değilse direkt göster
            if (!ENABLE_ZOOM_ON_SELECT) {
                setShowInfoBox(true);
            } else {
                // Zoom aktifse kutucuğu gizle, zoom tamamlandıktan sonra handleZoomComplete true yapacak
                setShowInfoBox(false);
            }
        } else {
            setShowInfoBox(false);
        }
    }, [selectedPart]);
    
    // Hotspot'a göre how it works sayfasındaki bölüm index'ini belirle
    const getSectionIndex = (partTitle) => {
        const titleLower = partTitle?.toLowerCase() || '';
        
        // Engine/Motor -> POWER UNIT (index 1)
        if (titleLower.includes('güç') || titleLower.includes('motor') || titleLower.includes('engine') || titleLower.includes('power')) {
            return 1;
        }
        
        // Tekerlek -> TYRES & WHEELS (index 7)
        if (titleLower.includes('tekerlek') || titleLower.includes('wheel') || titleLower.includes('tire')) {
            return 7;
        }
        
        // Kokpit/Hola -> CHASSIS & MONOCOQUE (index 2)
        if (titleLower.includes('kokpit') || titleLower.includes('cockpit') || titleLower.includes('hola')) {
            return 2;
        }
        
        // Diğerleri (ön kanat, arka kanat, sidepod, taban) -> AERODYNAMICS (index 0)
        return 0;
    };
    
    const handleLearnMore = () => {
        if (!selectedPart) return;
        const sectionIndex = getSectionIndex(selectedPart.title);
        navigate(`/how-it-works?section=${sectionIndex}`);
    };

    // Kutucuğun pozisyonunu dinamik olarak hesapla
    // selectedPart.position kullanarak hesapla
    const infoBoxPosition = useMemo(() => {
        if (!selectedPart || !selectedPart.position) return null;
        
        // selectedPart.position'ı kullan (handleMarkerClick içinde zaten clone edilip kaydediliyor)
        return selectedPart.position.clone().add(new THREE.Vector3(0.35, 0, 0));
    }, [selectedPart?.hotspotIndex, selectedPart?.position?.x, selectedPart?.position?.y, selectedPart?.position?.z]);

    useEffect(() => {
        ensurePulseStyle();
    }, []);

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
            onPointerMissed={() => {
                clearSelection();
                setHoveredHotspotIndex(null);
                // Marker'ları gizle - fare model üzerinde değil
                setShowMarkers(false);
            }}
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
                        onPartSelect={setSelectedPart}
                        onHotspotPositions={setHotspotPositions}
                        onHotspotInfos={setHotspotInfos}
                        onHoverHotspotIndex={setHoveredHotspotIndex}
                        onMarkerVisibilityChange={(visible) => {
                            // Marker üzerindeyken görünürlüğü değiştirme
                            if (!visible && isOverMarkerRef.current) {
                                return;
                            }
                            // Timeout'u temizle
                            if (markerVisibilityTimeoutRef.current) {
                                clearTimeout(markerVisibilityTimeoutRef.current);
                            }
                            // Kısa bir delay ile görünürlüğü değiştir
                            markerVisibilityTimeoutRef.current = setTimeout(() => {
                                if (!isOverMarkerRef.current) {
                                    setShowMarkers(visible);
                                }
                            }, 50);
                        }}
                    />
                ))}
                {showMarkers && hotspotPositions.length > 0 && hotspotPositions.map((pos, idx) => {
                    const isHovered = hoveredHotspotIndex === idx;
                    return (
                        <Html 
                            key={`hs-marker-${idx}`} 
                            position={pos} 
                            center 
                            style={{ 
                                pointerEvents: 'none',
                                zIndex: 1000
                            }}
                            raycast={() => null}
                        >
                            <div
                                className="marker-container"
                                onMouseEnter={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    // Marker üzerinde olduğumuzu işaretle
                                    isOverMarkerRef.current = true;
                                    // Marker visibility timeout'unu iptal et
                                    if (markerVisibilityTimeoutRef.current) {
                                        clearTimeout(markerVisibilityTimeoutRef.current);
                                        markerVisibilityTimeoutRef.current = null;
                                    }
                                    // Marker'lar görünür kalsın (araç üzerindeyken)
                                    setShowMarkers(true);
                                    // Tüm timeout'ları temizle
                                    Object.values(hoverTimeoutsRef.current).forEach(timeout => {
                                        if (timeout) clearTimeout(timeout);
                                    });
                                    hoverTimeoutsRef.current = {};
                                    // Hemen hover state'ini ayarla
                                    setHoveredHotspotIndex(idx);
                                }}
                                onMouseLeave={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    // Marker'dan çıktığımızı işaretle
                                    isOverMarkerRef.current = false;
                                    // Bu marker'ın timeout'unu temizle
                                    if (hoverTimeoutsRef.current[idx]) {
                                        clearTimeout(hoverTimeoutsRef.current[idx]);
                                    }
                                    // Kısa bir delay ile hover'ı kaldır (yanıp sönmeyi önlemek için)
                                    hoverTimeoutsRef.current[idx] = setTimeout(() => {
                                        setHoveredHotspotIndex((prev) => prev === idx ? null : prev);
                                        delete hoverTimeoutsRef.current[idx];
                                    }, 100);
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleMarkerClick(idx);
                                }}
                                style={{
                                    // Hit area'yı görsel marker boyutu kadar tut (sabit 28px - hover durumunda da aynı)
                                    width: 28,
                                    height: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer !important',
                                    pointerEvents: 'auto',
                                    position: 'relative',
                                    zIndex: 1001,
                                    userSelect: 'none',
                                    WebkitUserSelect: 'none',
                                    touchAction: 'none',
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <div
                                    style={{
                                        width: 12,
                                        height: 12,
                                    borderRadius: '50%',
                                    border: isHovered ? '2.5px solid rgba(255,70,70,1)' : 'none',
                                    background: isHovered ? 'rgba(255,70,70,0.8)' : 'rgba(255,70,70,0.6)',
                                        animation: 'markerPulse 1.1s ease-in-out infinite'
                                }}
                            />
                            </div>
                        </Html>
                    );
                })}
                {selectedPart && showInfoBox && infoBoxPosition && (
                    <Html
                        position={infoBoxPosition}
                        center={false}
                        raycast={() => null}
                        style={{
                            background: 'rgba(15,15,20,0.9)',
                            color: '#fff',
                            padding: '14px 16px',
                            borderRadius: 10,
                            width: 280,
                            maxWidth: 280,
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRight: '4px solid rgba(255,70,70,1)',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.4), 0 0 30px rgba(255,70,70,0.5), 0 0 60px rgba(255,70,70,0.3)',
                            animation: 'infoFade 0.5s ease-out',
                            transform: 'translateY(-50%)',
                            position: 'relative',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            opacity: 0,
                            animationFillMode: 'forwards'
                        }}
                        >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontWeight: 700, fontSize: 16, wordWrap: 'break-word', overflowWrap: 'break-word' }}>{selectedPart.title}</div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    clearSelection();
                                }}
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 6,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.08)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    lineHeight: '1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={{ fontSize: 13, lineHeight: 1.6, marginTop: 8, wordWrap: 'break-word', overflowWrap: 'break-word' }}>{selectedPart.description}</div>
                        <button
                            type="button"
                            onClick={handleLearnMore}
                            style={{
                                marginTop: 12,
                                padding: '8px 16px',
                                borderRadius: 6,
                                border: '1px solid rgba(255,70,70,0.5)',
                                background: 'rgba(255,70,70,0.15)',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                                transition: 'all 0.2s ease',
                                width: '100%',
                                textAlign: 'center'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255,70,70,0.25)';
                                e.target.style.borderColor = 'rgba(255,70,70,0.8)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255,70,70,0.15)';
                                e.target.style.borderColor = 'rgba(255,70,70,0.5)';
                            }}
                        >
                            Daha Fazla Bilgi →
                        </button>
                    </Html>
                )}
                <Environment files="/assets/map.hdr" background />
                <ShadowCatcher />
                <ContactShadows position={[0, -0.001, 0]} blur={3} opacity={0.45} width={80} height={80} />
            </Suspense>
            <CameraInitializer 
                focusPoint={ENABLE_ZOOM_ON_SELECT ? selectedPart?.position : null} 
                onZoomComplete={handleZoomComplete}
            />
        </Canvas>
    );
}

export default function ModelViewerCanvas({ models, activeIndex }) {
    return <ModelScene models={models} activeIndex={activeIndex} />;
}

useGLTF.preload('/assets/model.glb');