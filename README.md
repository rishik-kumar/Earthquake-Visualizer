# Earthquake-Visualizer
An interactive earthquake visualization app using React, Leaflet, and USGS Earthquake API.

# 🌍 Earthquake Visualizer

An interactive web app that visualizes global earthquakes from the past 24 hours using the **USGS Earthquake API** and **React + Leaflet**.

### 🚀 Features
- Live earthquake data (updated automatically from USGS)
- Interactive world map (Leaflet)
- Circle markers sized & colored by magnitude
- Magnitude filter slider
- Popup details (location, time, depth, link to USGS page)
- Responsive UI & sidebar list
- Error and loading handling

### 🛠️ Tech Stack
- React (Vite or CRA)
- Leaflet / React-Leaflet
- USGS GeoJSON API
- CSS / Tailwind optional

### 📡 Data Source
USGS Earthquake Feed  
https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson

### 🏃‍♂️ Run Locally
```bash
git clone https://github.com/YOUR-USERNAME/earthquake-visualizer
cd earthquake-visualizer
npm install
npm start
