// src/circuitData.js

export const circuits = [
  {
    id: "monaco",
    name: "Circuit de Monaco",
    // 3D Map Settings (Drone View/Start)
    center: { lat: 43.7347, lng: 7.4205, altitude: 100 }, 
    range: 800,
    heading: 160,
    tilt: 65,
    lat: 43.7347,
    lng: 7.4205,
    // Static Street View Landing (On a known public road near the start/finish line)
    streetView: {
        lat: 43.7352, 
        lng: 7.4215,
        heading: 220, // Looking down the track
        pitch: 0
    },
    imgUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Monte_Carlo_Formula_1_track_map.svg/500px-Monte_Carlo_Formula_1_track_map.svg.png"
  },
  {
    id: "bahrain",
    name: "Bahrain International Circuit",
    // 3D Map Settings
    center: { lat: 26.0325, lng: 50.5106, altitude: 0 },
    range: 1000,
    heading: 30,
    tilt: 60,
    lat: 26.0325,
    lng: 50.5106,
    // Static Street View Landing (Near the main access road, verified to have data)
    streetView: {
        lat: 26.0322, 
        lng: 50.5125,
        heading: 15,
        pitch: 0
    },
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Bahrain_International_Circuit--Grand_Prix_Layout.svg/320px-Bahrain_International_Circuit--Grand_Prix_Layout.svg.png"
  },
  {
    id: "spa",
    name: "Circuit de Spa-Francorchamps",
    // 3D Map Settings (Near Eau Rouge/Raidillon)
    center: { lat: 50.4372, lng: 5.9714, altitude: 20 },
    range: 800,
    heading: 45,
    tilt: 70, 
    lat: 50.4372, // Fixed
    lng: 5.9714,
    // Static Street View Landing (Near the road by the track complex)
    streetView: {
        lat: 50.4368, 
        lng: 5.9722, 
        heading: 150,
        pitch: 0
    },
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Spa-Francorchamps_of_Belgium.svg/320px-Spa-Francorchamps_of_Belgium.svg.png"
  },
   { 
    id: "monza", 
    name: "Monza", 
    location: "Italy", 
    lat: 45.6189, 
    lng: 9.2812, 
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Monza_track_map.svg/500px-Monza_track_map.svg.png" 
  },
  { 
    id: 'suzuka', 
    name: "Suzuka", 
    location: "Japan", 
    lat: 34.8431, 
    lng: 136.541, 
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Suzuka_circuit_map--2005.svg/500px-Suzuka_circuit_map--2005.svg.png "
  },
  { 
    id: "interlagos", 
    name: "Interlagos", 
    location: "Brazil", 
    lat: -23.7036, 
    lng: -46.6997, 
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Aut%C3%B3dromo_Jos%C3%A9_Carlos_Pace_%28AKA_Interlagos%29_track_map.svg/500px-Aut%C3%B3dromo_Jos%C3%A9_Carlos_Pace_%28AKA_Interlagos%29_track_map.svg.png" 
  },
  { 
    id: "gilles", 
    name: "Gilles Villeneuve", 
    location: "Canada", 
    lat: 45.5000, 
    lng: -73.5228, 
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/%C3%8Ele_Notre-Dame_%28Circuit_Gilles_Villeneuve%29.svg/500px-%C3%8Ele_Notre-Dame_%28Circuit_Gilles_Villeneuve%29.svg.png" 
  },
  { 
    id: "albert", 
    name: "Albert Park", 
    location: "Australia", 
    lat: -37.8497, 
    lng: 144.968, 
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Albert_Park_Circuit_2021.svg/500px-Albert_Park_Circuit_2021.svg.png" 
  },
  { 
    id: "nurburging", 
    name: "Nürburgring", 
    location: "Germany", 
    lat: 50.3356, 
    lng: 6.9475, 
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/N%C3%BCrburgring_-_Grand-Prix-Strecke.svg/500px-N%C3%BCrburgring_-_Grand-Prix-Strecke.svg.png" 
  },
  { 
    id: "cota", 
    name: "COTA", 
    location: "USA", 
    lat: 30.1328, 
    lng: -97.6411, 
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Austin_circuit.svg/320px-Austin_circuit.svg.png" 
  }
];