# 🏎️ F1 Fever: The Immersive F1 Simulator

**F1 Fever** is a fan-focused Formula 1 web application designed to bridge the gap between static statistics and immersive 3D experiences. Unlike standard wikis, this platform offers a visually stunning, interactive 3D F1 car model, scroll-driven transitions, and real-time race circuit visualizations powered by modern web technologies.

## 🚀 Key Features
* **Interactive 3D Car Model**: High-fidelity 3D F1 car that users can rotate, zoom, and inspect (Component Inspection).
* **3D Track Visualization**: Integration with Google Maps Platform to view circuits in 3D and street perspective.
* **Live Data & Telemetry**: Powered by the **FastF1** Python library for historical data and real-time statistics.
* **Immersive Navigation**: Non-linear, scroll-driven storytelling and "Cinematic Mode" for tracks.
* **Informational Hub**: Sections for Teams, History, Legends, and Breaking News.

## 🛠️ Tech Stack
This project utilizes a **4-Tier Architecture**:
* **Frontend**: React.js, Three.js (for 3D rendering), Google Maps API.
* **Backend**: Node.js, Express.js.
* **Database**: MongoDB.
* **Data Pipeline**: Python, FastF1 Library, Pandas.

## ⚙️ Installation & Setup

### Prerequisites
* Node.js (v18+ recommended)
* Python (3.8+)
* MongoDB (Local or Atlas URI)


### 1. Data Ingestor (The Fuel) 🐍
A virtual environment (venv) setup is required to run the Python data processing pipeline.

**Installation Steps:**
1. Navigate to the folder:
```bash
cd f1-fever-backend/f1-data-ingestor
```
2. Create the Virtual Environment:
```bash
python -m venv venv
```
3. Activate the Virtual Environment:
* **For Windows:**
```bash
venv\Scripts\activate
```
* **For Mac/Linux:**
```bash
source venv/bin/activate
```
4. Start the data fetching process:
```bash
python dataload.py
```
### 2. Backend Setup (The Engine)
The backend serves the API and connects to the database.
```bash
cd f1-fever-backend/f1-api-server
npm install
# Make sure your mongodb server is running in the background
# Once you run the node commands the connection and the db will be made automatically.
node seed.js  # Initializes and populates the database with default data
node server.js # Starts the live server , make sure this runs everytime before you start the frontend part of the application

## Google Maps API setup
# Go to your **Google Cloud Console** -> **Credentials** and generate a new Google Maps Javascript APı key With Map ID , the existing ones are unavailable at the moment
## Replace the Google Maps APı and Maps Id section with your own API keys in the useGoogleMaps Hook under the hooks folder
```

## 3. Run the Application
```bash
cd f1-fever-frontend
## Navigate to frontend and run :
npm install
npm run dev
```
