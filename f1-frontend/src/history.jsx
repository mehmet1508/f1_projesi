import { useState, useEffect, useCallback, useRef } from 'react';
import './history.css';

// 1950'den 2024'e kadar 10'ar yıllık dönemler
const eras = [
    { 
        startYear: 1950, 
        endYear: 1959, 
        title: 'Başlangıç Dönemi', 
        description: 'F1 Dünya Şampiyonası\'nın ilk yılları',
        details: {
            champions: ['Nino Farina', 'Juan Manuel Fangio', 'Alberto Ascari', 'Mike Hawthorn', 'Jack Brabham'],
            highlights: [
                '1950 yılında ilk F1 Dünya Şampiyonası Silverstone\'da başladı',
                'Juan Manuel Fangio 5 şampiyonluk kazandı',
                'Alfa Romeo, Ferrari ve Mercedes hakimiyeti',
                'Ön motorlu, çerçeve şasili arabalar',
                'Pilotların cesareti ve yeteneği ön plandaydı'
            ],
            technology: 'Ön motorlu, çerçeve şasili arabalar. Motorlar 1.5-2.5 litre aralığında, doğal emişli. Lastikler dar ve yüksek profilli.',
            iconicMoments: [
                '1950 Silverstone Grand Prix - F1 tarihinin ilk yarışı',
                '1951 Alman Grand Prix - Fangio\'nun efsanevi Nürburgring zaferi',
                '1955 Le Mans faciası - Mercedes\'in F1\'den çekilmesi',
                '1957 Alman Grand Prix - Fangio\'nun son şampiyonluğu ve efsanevi performansı'
            ],
            dominantTeams: ['Alfa Romeo', 'Ferrari', 'Mercedes-Benz', 'Maserati'],
            keyDrivers: [
                { name: 'Juan Manuel Fangio', achievements: '5 Dünya Şampiyonluğu, 24 yarış kazandı' },
                { name: 'Alberto Ascari', achievements: '2 Dünya Şampiyonluğu, Ferrari ile efsanevi dönem' },
                { name: 'Nino Farina', achievements: 'İlk F1 Dünya Şampiyonu (1950)' }
            ],
            technicalInnovations: [
                'Çerçeve şasi yapısı',
                'Ön motorlu düzen',
                'Drum frenler',
                'Manuel vites kutusu',
                'Yüksek profil lastikler'
            ],
            safety: 'Güvenlik önlemleri minimaldi. Pilotlar kask ve deri kıyafetler kullanıyordu. Güvenlik bariyerleri yoktu.',
            racesPerSeason: '7-9 yarış',
            engineSpecs: '1.5-2.5 litre, doğal emişli, 150-300 HP',
            interestingFacts: [
                'İlk yarışta sadece 21 pilot vardı',
                'Fangio 4 farklı takımla şampiyonluk kazandı',
                '1950\'lerde yarışlar genellikle 3 saatten uzun sürüyordu',
                'Pilotlar aynı zamanda araba sahibi ve mekanik olabiliyordu'
            ]
        }
    },
    { 
        startYear: 1960, 
        endYear: 1969, 
        title: 'Altın Çağ', 
        description: 'Klasik F1 dönemi',
        details: {
            champions: ['Jack Brabham', 'Phil Hill', 'Graham Hill', 'Jim Clark', 'John Surtees', 'Denis Hulme', 'Jackie Stewart'],
            highlights: [
                'Arka motorlu arabaların devrimi',
                'Lotus\'un Colin Chapman liderliğinde yenilikleri',
                'Jim Clark\'ın efsanevi performansları',
                'Güvenlik önlemleri artmaya başladı',
                'Monaco, Monza ve Silverstone gibi klasik pistlerin altın çağı'
            ],
            technology: 'Arka motorlu tasarımın yaygınlaşması. Motorlar 1.5-3.0 litre. Fiberglas ve alüminyum kullanımı artıyor.',
            iconicMoments: [
                '1968 Lotus 49 - İlk sponsorlu araba (Gold Leaf)',
                '1963 Belçika Grand Prix - Jim Clark\'ın 4.5 dakika farkla kazandığı yarış',
                '1965 İtalya Grand Prix - Graham Hill\'in efsanevi Monza zaferi',
                '1969 Monako Grand Prix - Graham Hill\'in 5. Monako zaferi'
            ],
            dominantTeams: ['Lotus', 'Ferrari', 'BRM', 'Brabham', 'Cooper'],
            keyDrivers: [
                { name: 'Jim Clark', achievements: '2 Dünya Şampiyonluğu, 25 yarış kazandı, Lotus efsanesi' },
                { name: 'Graham Hill', achievements: '2 Dünya Şampiyonluğu, Monaco\'nun kralı' },
                { name: 'Jackie Stewart', achievements: '3 Dünya Şampiyonluğu, güvenlik savunucusu' }
            ],
            technicalInnovations: [
                'Arka motorlu düzen',
                'Monokok şasi',
                'Aerodinamik kanatlar',
                'Disk frenler',
                'Sponsorluk anlaşmaları'
            ],
            safety: 'Güvenlik önlemleri gelişmeye başladı. Jackie Stewart güvenlik reformlarının öncüsü oldu. Güvenlik bariyerleri ve kask standartları iyileştirildi.',
            racesPerSeason: '9-11 yarış',
            engineSpecs: '1.5-3.0 litre, doğal emişli, 200-450 HP',
            interestingFacts: [
                '1968\'de ilk sponsorlu araba (Lotus-Gold Leaf)',
                'Jim Clark 1963\'te 7 yarış kazandı',
                'Graham Hill "Monaco\'nun Kralı" unvanını kazandı',
                'Colin Chapman\'ın "Add lightness" felsefesi F1\'i değiştirdi'
            ]
        }
    },
    { 
        startYear: 1970, 
        endYear: 1979, 
        title: 'Wings & Ground Effect', 
        description: 'Aerodinamik devrimi',
        details: {
            champions: ['Jochen Rindt', 'Jackie Stewart', 'Emerson Fittipaldi', 'Niki Lauda', 'James Hunt', 'Mario Andretti'],
            highlights: [
                'Ground Effect teknolojisinin doğuşu',
                'Lotus 78 ve 79\'un devrimci tasarımları',
                'Niki Lauda\'nın Nürburgring kazası ve dönüşü',
                'James Hunt vs Niki Lauda rekabeti',
                'Aerodinamik kanatların yaygınlaşması'
            ],
            technology: 'Ground Effect ile yere basma kuvveti artışı. Venturi tünelleri ve yan podlar. 3.0 litre doğal emişli V8 motorlar.',
            iconicMoments: [
                '1976 Japon Grand Prix - Lauda\'nın yağmurlu yarıştan çekilmesi ve Hunt\'ın şampiyonluğu',
                '1976 Alman Grand Prix - Niki Lauda\'nın Nürburgring\'deki korkunç kazası',
                '1978 İtalya Grand Prix - Mario Andretti\'nin Lotus ile şampiyonluğu',
                '1979 Fransız Grand Prix - Arnoux ve Villeneuve arasındaki efsanevi geçiş mücadelesi'
            ],
            dominantTeams: ['Lotus', 'Ferrari', 'McLaren', 'Tyrrell', 'Brabham'],
            keyDrivers: [
                { name: 'Niki Lauda', achievements: '3 Dünya Şampiyonluğu, Nürburgring kazasından sonra dönüşü' },
                { name: 'James Hunt', achievements: '1 Dünya Şampiyonluğu, Lauda ile efsanevi rekabet' },
                { name: 'Mario Andretti', achievements: '1 Dünya Şampiyonluğu, Lotus 79 ile' }
            ],
            technicalInnovations: [
                'Ground Effect aerodinamiği',
                'Venturi tünelleri',
                'Yan podlar',
                '6 vitesli şanzıman',
                'Radial lastikler'
            ],
            safety: 'Güvenlik önlemleri önemli ölçüde iyileştirildi. Nürburgring kazasından sonra güvenlik standartları yeniden gözden geçirildi. Pilot güvenlik ekipmanları geliştirildi.',
            racesPerSeason: '13-15 yarış',
            engineSpecs: '3.0 litre V8, doğal emişli, 450-500 HP',
            interestingFacts: [
                'Lotus 79 Ground Effect ile devrim yarattı',
                'Niki Lauda kazadan 6 hafta sonra yarışa döndü',
                '1976 sezonu F1 tarihinin en dramatik sezonlarından biri',
                'Ground Effect arabaları çok hızlıydı ama tehlikeliydi'
            ]
        }
    },
    { 
        startYear: 1980, 
        endYear: 1989, 
        title: 'Turbo Çağı', 
        description: 'Güçlü turbo motorlar',
        details: {
            champions: ['Alan Jones', 'Nelson Piquet', 'Keke Rosberg', 'Alain Prost', 'Ayrton Senna', 'Nigel Mansell'],
            highlights: [
                'Turbo motorların zirvesi - 1000+ beygir gücü',
                'Ayrton Senna vs Alain Prost efsanevi rekabeti',
                'McLaren\'ın hakimiyeti',
                'Elektronik yardımların başlangıcı',
                'Güvenlik önlemlerinin artması'
            ],
            technology: '1.5 litre turbo V6 motorlar, 1000+ HP güç. Aktif süspansiyon sistemleri. Karbon fiber şasi yaygınlaşıyor.',
            iconicMoments: [
                '1988 McLaren MP4/4 - Senna ve Prost ile 16 yarıştan 15\'ini kazandı',
                '1989 Japon Grand Prix - Senna ve Prost arasındaki çarpışma ve şampiyonluk',
                '1986 Avustralya Grand Prix - Mansell\'in lastik patlaması ve şampiyonluğu kaybetmesi',
                '1982 Monako Grand Prix - Riccardo Patrese\'nin ilk zaferi ve efsanevi finiş'
            ],
            dominantTeams: ['McLaren', 'Williams', 'Ferrari', 'Lotus', 'Benetton'],
            keyDrivers: [
                { name: 'Ayrton Senna', achievements: '3 Dünya Şampiyonluğu, 41 yarış kazandı, efsanevi pilot' },
                { name: 'Alain Prost', achievements: '4 Dünya Şampiyonluğu, "Profesör" lakabı' },
                { name: 'Nigel Mansell', achievements: '1 Dünya Şampiyonluğu, Williams ile' }
            ],
            technicalInnovations: [
                'Turbo şarjlı motorlar',
                'Karbon fiber monokok',
                'Aktif süspansiyon',
                'Semi-otomatik şanzıman',
                'Elektronik kontrol sistemleri'
            ],
            safety: 'Güvenlik önlemleri sürekli iyileştirildi. Karbon fiber şasi güvenliği artırdı. Pilot güvenlik hücresi geliştirildi.',
            racesPerSeason: '14-16 yarış',
            engineSpecs: '1.5 litre turbo V6, 1000+ HP (qualifying), 650-800 HP (yarış)',
            interestingFacts: [
                'Turbo motorlar qualifying\'de 1000+ HP üretebiliyordu',
                'Senna ve Prost arasındaki rekabet F1 tarihinin en ünlüsü',
                '1988 McLaren MP4/4 en başarılı F1 arabalarından biri',
                'Turbo motorlar 1989\'da yasaklandı'
            ]
        }
    },
    { 
        startYear: 1990, 
        endYear: 1999, 
        title: 'Elektronik Devrim', 
        description: 'Elektronik yardımlar dönemi',
        details: {
            champions: ['Ayrton Senna', 'Nigel Mansell', 'Alain Prost', 'Michael Schumacher', 'Damon Hill', 'Jacques Villeneuve', 'Mika Häkkinen'],
            highlights: [
                'ABS, Traction Control, Launch Control sistemleri',
                'Michael Schumacher\'in F1\'e girişi',
                'Ayrton Senna\'nın trajik ölümü (1994)',
                'Williams ve Benetton\'ın hakimiyeti',
                'Elektronik yardımların yasaklanması (1994)'
            ],
            technology: '3.5 litre doğal emişli V10 motorlar. Traction Control, ABS, Launch Control. Karbon fiber monokok şasi standart.',
            iconicMoments: [
                '1994 San Marino Grand Prix - Senna\'nın ölümü ve güvenlik devrimi',
                '1993 Avrupa Grand Prix - Senna\'nın yağmurda efsanevi performansı',
                '1998 Belçika Grand Prix - Schumacher ve Coulthard arasındaki çarpışma',
                '1999 İngiliz Grand Prix - Schumacher\'in kırık bacağıyla yarışı bitirmesi'
            ],
            dominantTeams: ['Williams', 'Benetton', 'Ferrari', 'McLaren'],
            keyDrivers: [
                { name: 'Michael Schumacher', achievements: '2 Dünya Şampiyonluğu (1994-1995), F1\'e girişi' },
                { name: 'Ayrton Senna', achievements: '3 Dünya Şampiyonluğu, 1994\'te trajik ölümü' },
                { name: 'Mika Häkkinen', achievements: '2 Dünya Şampiyonluğu, McLaren ile' }
            ],
            technicalInnovations: [
                'Elektronik yardımlar (Traction Control, ABS)',
                'V10 motorlar',
                'Karbon fiber şasi',
                'Refueling stratejileri',
                'Aerodinamik gelişmeler'
            ],
            safety: '1994\'teki trajik kazalardan sonra güvenlik devrimi başladı. Şikanlar, güvenlik bariyerleri ve pilot güvenlik ekipmanları iyileştirildi. FIA güvenlik standartlarını sıkılaştırdı.',
            racesPerSeason: '16 yarış',
            engineSpecs: '3.5 litre V10, doğal emişli, 700-800 HP',
            interestingFacts: [
                'Elektronik yardımlar 1994\'te yasaklandı',
                'Senna\'nın ölümü F1\'de güvenlik devrimini başlattı',
                'Schumacher\'in F1 kariyeri bu dönemde başladı',
                'Williams FW14B ve FW15C en gelişmiş arabalardı'
            ]
        }
    },
    { 
        startYear: 2000, 
        endYear: 2009, 
        title: 'Schumacher Dönemi', 
        description: 'Ferrari\'nin hakimiyeti',
        details: {
            champions: ['Michael Schumacher', 'Fernando Alonso', 'Kimi Räikkönen', 'Lewis Hamilton'],
            highlights: [
                'Michael Schumacher\'in 5 ardışık şampiyonluğu',
                'Ferrari\'nin mutlak hakimiyeti',
                'Fernando Alonso\'nun genç şampiyonluğu',
                'Lewis Hamilton\'ın ilk şampiyonluğu',
                'V8 motorlara geçiş (2006)'
            ],
            technology: '3.0 litre V10 (2000-2005), 2.4 litre V8 (2006-2009). KERS sistemi tanıtıldı. Aerodinamik karmaşıklığı arttı.',
            iconicMoments: [
                '2004 Ferrari F2004 - Schumacher\'in 13 yarış kazandığı sezon',
                '2008 Brezilya Grand Prix - Hamilton\'ın son turda şampiyonluğu kazanması',
                '2005 Suzuka - Kimi Räikkönen\'in son turda Alonso\'yu geçmesi',
                '2007 Brezilya Grand Prix - Hamilton\'ın ilk sezonunda şampiyonluğa çok yaklaşması'
            ],
            dominantTeams: ['Ferrari', 'Renault', 'McLaren', 'BMW Sauber'],
            keyDrivers: [
                { name: 'Michael Schumacher', achievements: '5 ardışık şampiyonluk (2000-2004), Ferrari ile efsanevi dönem' },
                { name: 'Fernando Alonso', achievements: '2 Dünya Şampiyonluğu, en genç şampiyon (2005)' },
                { name: 'Lewis Hamilton', achievements: '1 Dünya Şampiyonluğu (2008), McLaren ile ilk sezon' }
            ],
            technicalInnovations: [
                'V8 motorlara geçiş (2006)',
                'KERS sistemi (2009)',
                'Aerodinamik karmaşıklığı',
                'Elektronik kontrol sistemleri',
                'Veri analizi ve simülasyon'
            ],
            safety: 'Güvenlik standartları sürekli iyileştirildi. HANS cihazı zorunlu hale getirildi. Pist güvenliği artırıldı.',
            racesPerSeason: '17-18 yarış',
            engineSpecs: '3.0 litre V10 (2000-2005), 2.4 litre V8 (2006-2009), 750-900 HP',
            interestingFacts: [
                'Schumacher 2004\'te 13 yarış kazandı',
                'Alonso 2005\'te en genç şampiyon oldu',
                'Hamilton ilk sezonunda şampiyonluğa çok yaklaştı',
                '2009\'da KERS sistemi tanıtıldı'
            ]
        }
    },
    { 
        startYear: 2010, 
        endYear: 2019, 
        title: 'Hibrit Çağ', 
        description: 'V6 Turbo Hibrit motorlar',
        details: {
            champions: ['Sebastian Vettel', 'Lewis Hamilton', 'Nico Rosberg', 'Max Verstappen'],
            highlights: [
                'V6 Turbo Hibrit motorlara geçiş (2014)',
                'Red Bull\'un 4 ardışık şampiyonluğu',
                'Mercedes\'in hibrit çağında hakimiyeti',
                'DRS sisteminin tanıtılması',
                'Halo güvenlik sisteminin eklenmesi'
            ],
            technology: '1.6 litre V6 Turbo Hibrit motorlar. ERS (Energy Recovery System). DRS sistemi. Halo güvenlik sistemi.',
            iconicMoments: [
                '2014 Mercedes W05 - Hibrit çağın başlangıcı ve Mercedes hakimiyeti',
                '2016 Abu Dhabi Grand Prix - Rosberg\'in şampiyonluğu ve emekliliği',
                '2012 Brezilya Grand Prix - Vettel\'in son turda şampiyonluğu kazanması',
                '2018 Alman Grand Prix - Hamilton\'ın yağmurda efsanevi performansı'
            ],
            dominantTeams: ['Red Bull', 'Mercedes', 'Ferrari'],
            keyDrivers: [
                { name: 'Sebastian Vettel', achievements: '4 Dünya Şampiyonluğu (2010-2013), Red Bull ile' },
                { name: 'Lewis Hamilton', achievements: '3 Dünya Şampiyonluğu (2014-2015, 2017-2018), Mercedes ile' },
                { name: 'Max Verstappen', achievements: 'F1\'e girişi, Red Bull ile ilk yarış kazançları' }
            ],
            technicalInnovations: [
                'V6 Turbo Hibrit motorlar',
                'ERS (Energy Recovery System)',
                'DRS sistemi',
                'Halo güvenlik sistemi',
                'Gelişmiş aerodinamik'
            ],
            safety: 'Halo güvenlik sistemi 2018\'de zorunlu hale getirildi. Güvenlik standartları en üst seviyeye çıkarıldı.',
            racesPerSeason: '19-21 yarış',
            engineSpecs: '1.6 litre V6 Turbo Hibrit, 850-1000 HP (ERS dahil)',
            interestingFacts: [
                'Mercedes hibrit çağında hakimiyet kurdu',
                'Vettel Red Bull ile 4 ardışık şampiyonluk kazandı',
                'DRS sistemi geçişleri kolaylaştırdı',
                'Halo sistemi pilotları korudu'
            ]
        }
    },
    { 
        startYear: 2020, 
        endYear: 2024, 
        title: 'Yeni Nesil', 
        description: 'Ground effect\'in geri dönüşü',
        details: {
            champions: ['Lewis Hamilton', 'Max Verstappen'],
            highlights: [
                '2022\'de yeni teknik kurallar ve Ground Effect\'in geri dönüşü',
                'Max Verstappen\'in Red Bull ile hakimiyeti',
                'Lewis Hamilton\'ın 8. şampiyonluğa yaklaşması',
                'Bütçe sınırlaması (Budget Cap)',
                'Sprint yarışlarının tanıtılması'
            ],
            technology: 'Ground Effect aerodinamiği geri döndü. 18 inç lastikler. Sürdürülebilir yakıtlar. Bütçe sınırlaması.',
            iconicMoments: [
                '2021 Abu Dhabi Grand Prix - Verstappen\'in ilk şampiyonluğu',
                '2021 Silverstone - Hamilton ve Verstappen arasındaki çarpışma',
                '2022 Brezilya Grand Prix - Verstappen ve Hamilton arasındaki efsanevi mücadele',
                '2023 Monako Grand Prix - Verstappen\'in yağmurda efsanevi pole pozisyonu'
            ],
            dominantTeams: ['Red Bull', 'Mercedes', 'Ferrari'],
            keyDrivers: [
                { name: 'Max Verstappen', achievements: '3 Dünya Şampiyonluğu (2021-2023), Red Bull ile hakimiyet' },
                { name: 'Lewis Hamilton', achievements: '1 Dünya Şampiyonluğu (2020), 8. şampiyonluğa yaklaştı' },
                { name: 'Charles Leclerc', achievements: 'Ferrari ile yarış kazançları' }
            ],
            technicalInnovations: [
                'Ground Effect aerodinamiği (2022)',
                '18 inç lastikler',
                'Sürdürülebilir yakıtlar',
                'Bütçe sınırlaması',
                'Sprint yarış formatı'
            ],
            safety: 'Güvenlik standartları en üst seviyede. Halo sistemi standart. Güvenlik araştırmaları sürüyor.',
            racesPerSeason: '17-24 yarış',
            engineSpecs: '1.6 litre V6 Turbo Hibrit, 1000+ HP (ERS dahil)',
            interestingFacts: [
                '2021 sezonu F1 tarihinin en dramatik sezonlarından biri',
                'Verstappen ve Hamilton arasındaki rekabet',
                '2022\'de Ground Effect geri döndü',
                'Bütçe sınırlaması takımlar arası rekabeti artırdı'
            ]
        }
    }
];

// Her dönem için araba ikonu seç
const getCarIcon = (startYear) => {
    const year = Math.floor(startYear / 10) * 10; // 1950, 1960, 1970, etc.
    return `/assets/images/history/carsIcon/car${year}.png`;
};

// Dönemlere göre arka plan görseli
const getEraBackground = (startYear) => {
    switch (startYear) {
        case 1950:
            return '/assets/images/history/years/f11950.jpg';
        case 1960:
            return '/assets/images/history/years/f11960.jpg';
        case 1970:
            return '/assets/images/history/years/f11970.jpg';
        case 1980:
            return '/assets/images/history/years/f11980.jpg';
        case 1990:
            return '/assets/images/history/years/f11990.jpg';
        case 2000:
            return '/assets/images/history/years/f12000.jpg';
        case 2010:
            return '/assets/images/history/years/f12010.jpg';
        case 2020:
            return '/assets/images/history/years/f12020.webp';
        default:
            return null;
    }
};

export default function HistoryPage() {
    const [selectedEraIndex, setSelectedEraIndex] = useState(0);
    const [prevEraIndex, setPrevEraIndex] = useState(0);
    const [transitionDirection, setTransitionDirection] = useState('none');
    const selectedEraIndexRef = useRef(0);
    const selectedEra = eras[selectedEraIndex];
    const [carIconOpacity, setCarIconOpacity] = useState(1);
    const eraBackground = getEraBackground(selectedEra.startYear);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [cursorVisible, setCursorVisible] = useState(false);
    const [cursorMode, setCursorMode] = useState('default');
    const [isExploreOpen, setIsExploreOpen] = useState(false);
    const [parallax, setParallax] = useState({
        x: 0,
        y: 0,
        rotX: 0,
        rotY: 0
    });

    const handleParallaxMove = useCallback(
        (event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            const moveIntensity = 15;
            const rotateMax = 10; // maksimum 6 derece eğim

            setParallax({
                x: -x * moveIntensity,
                y: -y * moveIntensity,
                rotY: x * rotateMax,
                rotX: -y * rotateMax
            });
        },
        [selectedEra.startYear]
    );

    const resetParallax = useCallback(() => {
        setParallax({
            x: 0,
            y: 0,
            rotX: 0,
            rotY: 0
        });
    }, []);

    // Özel history cursor hareketi

    const handleMouseMove = useCallback((event) => {
        setCursorVisible(true);
        setCursorPos({
            x: event.clientX,
            y: event.clientY
        });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setCursorVisible(false);
        // Timeline üzerindeyken cursor mode'u koru
        if (cursorMode !== 'timeline') {
        setCursorMode('default');
        }
    }, [cursorMode]);

    // Arabanın timeline üzerindeki pozisyonunu hesapla
    const carPosition = (selectedEraIndex / (eras.length - 1)) * 100;
    
    // Seçili dönem için araba ikonu
    const carIcon = getCarIcon(selectedEra.startYear);

    // Araba ikonu değiştiğinde fade efekti
    useEffect(() => {
        setCarIconOpacity(0);
        const timer = setTimeout(() => {
            setCarIconOpacity(1);
        }, 150);
        return () => clearTimeout(timer);
    }, [carIcon]);

    // Seçili index değiştiğinde referansı güncelle
    useEffect(() => {
        selectedEraIndexRef.current = selectedEraIndex;
    }, [selectedEraIndex]);

    // Dönem değişimini yön bilgisi ile yönet
    const changeEra = useCallback((newIndex) => {
        setPrevEraIndex((prev) => {
            const direction = newIndex > prev ? 'forward' : 'backward';
            setTransitionDirection(direction);
            return newIndex;
        });
        setSelectedEraIndex(newIndex);
        // Dönem değiştiğinde explore panelini kapat
        setIsExploreOpen(false);
    }, []);

    // Explore butonuna tıklama
    const handleExploreClick = useCallback(() => {
        setIsExploreOpen(prev => !prev);
    }, []);

    // Timeline çizgisine tıklayınca en yakın dönemi seç
    const handleTimelineClick = useCallback(
        (event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const relativeX = (event.clientX - rect.left) / rect.width; // 0..1
            const clamped = Math.min(Math.max(relativeX, 0), 1);
            const index = Math.round(clamped * (eras.length - 1));
            changeEra(index);
        },
        [changeEra]
    );

    // Scroll ile yıllar arası geçiş (sadece panel kapalıyken)
    useEffect(() => {
        let scrollTimeout;
        let isThrottled = false;
        
        const handleWheel = (event) => {
            // Panel açıksa scroll'u engelleme, normal scroll yapsın
            if (isExploreOpen) return;
            
            event.preventDefault();
            
            if (isThrottled) return;
            
            const direction = event.deltaY > 0 ? -1 : 1;
            const prevIndex = selectedEraIndexRef.current;
            let newIndex = prevIndex + direction;
            if (newIndex < 0) newIndex = 0;
            if (newIndex >= eras.length) newIndex = eras.length - 1;

            if (newIndex !== prevIndex) {
                changeEra(newIndex);
            }
            
            isThrottled = true;
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isThrottled = false;
            }, 600);
        };

        const container = document.querySelector('.history-page');
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
            return () => {
                container.removeEventListener('wheel', handleWheel);
                clearTimeout(scrollTimeout);
            };
        }
    }, [changeEra, isExploreOpen]);

    return (
        <section
            className="page history-page"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div className="history-content">
                {/* Ana içerik alanı */}
                <div
                    className="year-display clickable-area"
                    onMouseMove={(e) => {
                        handleParallaxMove(e);
                        // Panel açıkken explore moduna geçme
                        if (!isExploreOpen) {
                            setCursorMode('explore');
                        }
                    }}
                    onMouseLeave={() => {
                        resetParallax();
                        setCursorMode('default');
                    }}
                    onClick={handleExploreClick}
                >
                    <div
                        key={selectedEra.startYear}
                        className={`year-transition-wrapper ${
                            transitionDirection === 'forward'
                                ? 'slide-from-right'
                                : transitionDirection === 'backward'
                                ? 'slide-from-left'
                                : ''
                        }`}
                    >
                        <div className="year-background">
                            <div
                                className="year-image-placeholder"
                                style={{
                                    transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0) rotateX(${parallax.rotX}deg) rotateY(${parallax.rotY}deg)`
                                }}
                            >
                                {eraBackground && (
                                    <img
                                        src={eraBackground}
                                        alt={`${selectedEra.startYear} dönemi arka planı`}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="year-info">
                            <h1 className="year-range">
                                {selectedEra.startYear}-{selectedEra.endYear}
                            </h1>
                            <h2 className="era-title">{selectedEra.title}</h2>
                            <p className="era-description">{selectedEra.description}</p>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div
                    className="history-timeline"
                    onMouseEnter={() => setCursorMode('timeline')}
                    onMouseLeave={() => setCursorMode('default')}
                >
                    <div className="timeline-line" onClick={handleTimelineClick}>
                        {/* Timeline noktaları */}
                        {eras.map((era, index) => (
                            <button
                                key={`${era.startYear}-${era.endYear}`}
                                className={`timeline-dot ${index === selectedEraIndex ? 'active' : ''}`}
                                style={{ left: `${(index / (eras.length - 1)) * 100}%` }}
                                onClick={() => changeEra(index)}
                                aria-label={`${era.startYear}-${era.endYear}`}
                            />
                        ))}
                        
                        {/* Minik araba ikonu */}
                        <div
                            className="timeline-car"
                            style={{ left: `${carPosition}%` }}
                        >
                            <img
                                src={carIcon}
                                alt={`Car ${selectedEra.startYear}`}
                                className="car-icon-image"
                                style={{ opacity: carIconOpacity }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Explore Detay Paneli */}
            <div className={`era-details-panel ${isExploreOpen ? 'open' : ''}`}>
                <div className="era-details-content">
                    <button 
                        className="close-details-button"
                        onClick={handleExploreClick}
                        aria-label="Kapat"
                    >
                        ×
                    </button>
                    <div className="era-details-header">
                        <h2>{selectedEra.title}</h2>
                        <span className="era-years">{selectedEra.startYear}-{selectedEra.endYear}</span>
                    </div>
                    
                    <div className="era-details-sections">
                        <div className="details-section">
                            <h3>Şampiyonlar</h3>
                            <div className="champions-list">
                                {selectedEra.details.champions.map((champion, idx) => (
                                    <span key={idx} className="champion-tag">{champion}</span>
                                ))}
                            </div>
                        </div>

                        <div className="details-section">
                            <h3>Önemli Olaylar</h3>
                            <ul className="highlights-list">
                                {selectedEra.details.highlights.map((highlight, idx) => (
                                    <li key={idx}>{highlight}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="details-section">
                            <h3>Önemli Pilotlar</h3>
                            <div className="key-drivers-list">
                                {selectedEra.details.keyDrivers.map((driver, idx) => (
                                    <div key={idx} className="driver-item">
                                        <span className="driver-name">{driver.name}</span>
                                        <span className="driver-achievements">{driver.achievements}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="details-section">
                            <h3>Hakim Takımlar</h3>
                            <div className="teams-list">
                                {selectedEra.details.dominantTeams.map((team, idx) => (
                                    <span key={idx} className="team-tag">{team}</span>
                                ))}
                            </div>
                        </div>

                        <div className="details-section">
                            <h3>Teknik Gelişmeler</h3>
                            <ul className="innovations-list">
                                {selectedEra.details.technicalInnovations.map((innovation, idx) => (
                                    <li key={idx}>{innovation}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="details-section">
                            <h3>Motor Özellikleri</h3>
                            <p className="engine-specs">{selectedEra.details.engineSpecs}</p>
                        </div>

                        <div className="details-section">
                            <h3>Sezon İstatistikleri</h3>
                            <p className="season-stats">Yarış Sayısı: {selectedEra.details.racesPerSeason}</p>
                        </div>

                        <div className="details-section">
                            <h3>Güvenlik</h3>
                            <p className="safety-text">{selectedEra.details.safety}</p>
                        </div>

                        <div className="details-section">
                            <h3>İlginç Bilgiler</h3>
                            <ul className="facts-list">
                                {selectedEra.details.interestingFacts.map((fact, idx) => (
                                    <li key={idx}>{fact}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="details-section full-width">
                            <h3>İkonik Anlar</h3>
                            <div className="iconic-moments-list">
                                {selectedEra.details.iconicMoments.map((moment, idx) => (
                                    <div key={idx} className="iconic-moment-item">
                                        <span className="moment-number">{idx + 1}</span>
                                        <p className="iconic-moment">{moment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Özel cursor */}
            {cursorVisible && (
            <div
                className={`history-cursor ${cursorVisible ? 'visible' : ''} ${
                    cursorMode === 'timeline' ? 'timeline-mode' : ''
                } ${cursorMode === 'explore' && !isExploreOpen ? 'explore-mode' : ''} ${
                    isExploreOpen ? 'timeline-mode' : ''
                }`}
                style={{
                    left: `${cursorPos.x}px`,
                    top: `${cursorPos.y}px`
                }}
            />
            )}
        </section>
    );
}
