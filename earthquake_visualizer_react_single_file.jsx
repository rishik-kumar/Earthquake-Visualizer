import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Simple component to fit map to bounds of markers
function FitBounds({ features }) {
  const map = useMap();
  useEffect(() => {
    if (!features || features.length === 0) return;
    const bounds = features
      .map((f) => {
        const [lon, lat] = f.geometry.coordinates;
        return [lat, lon];
      })
      .filter(Boolean);
    if (bounds.length) map.fitBounds(bounds, { padding: [50, 50] });
  }, [features, map]);
  return null;
}

export default function EarthquakeVisualizer() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minMag, setMinMag] = useState(0);

  // USGS all-day feed (past 24 hours)
  const USGS_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(USGS_URL)
      .then((r) => {
        if (!r.ok) throw new Error("Network response was not ok");
        return r.json();
      })
      .then((json) => {
        if (!mounted) return;
        const features = (json.features || []).map((f) => ({
          id: f.id,
          magnitude: f.properties.mag,
          place: f.properties.place,
          time: f.properties.time,
          url: f.properties.url,
          coords: f.geometry.coordinates, // [lon, lat, depth]
          depth: f.geometry.coordinates[2],
        }));
        setData(features);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to load");
        setLoading(false);
      });
    return () => (mounted = false);
  }, []);

  const filtered = data.filter((d) => (d.magnitude ?? 0) >= minMag);

  function magToRadius(m) {
    if (m == null) return 4;
    // scale: small mags -> small circles, large mags -> larger
    return Math.max(4, Math.pow(2, m / 1.4));
  }

  function magToColor(m) {
    if (m == null) return "#999";
    if (m >= 5) return "#800026";
    if (m >= 4) return "#BD0026";
    if (m >= 3) return "#E31A1C";
    if (m >= 2) return "#FC4E2A";
    if (m >= 1) return "#FD8D3C";
    return "#FED976";
  }

  return (
    <div style={{ fontFamily: "Inter, Roboto, Arial, sans-serif", height: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "12px 16px", background: "#0f172a", color: "white", display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>Earthquake Visualizer</h1>
        <div style={{ opacity: 0.8, fontSize: 13 }}>• Recent quakes (past 24 hrs)</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontSize: 13 }}>Min magnitude:</label>
          <input
            type="range"
            min="0"
            max="6"
            step="0.1"
            value={minMag}
            onChange={(e) => setMinMag(parseFloat(e.target.value))}
            aria-label="Minimum magnitude"
          />
          <div style={{ width: 32, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{minMag}</div>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          {error ? (
            <div style={{ padding: 16 }}>Error loading data: {error}</div>
          ) : loading ? (
            <div style={{ padding: 16 }}>Loading recent earthquakes...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 16 }}>No earthquakes match the filter.</div>
          ) : (
            <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FitBounds features={filtered.map((f) => ({ geometry: { coordinates: [f.coords[0], f.coords[1]] } }))} />

              {filtered.map((f) => {
                const lon = f.coords[0];
                const lat = f.coords[1];
                const mag = f.magnitude;
                return (
                  <CircleMarker
                    key={f.id}
                    center={[lat, lon]}
                    radius={magToRadius(mag)}
                    pathOptions={{ color: magToColor(mag), weight: 1, fillOpacity: 0.7 }}
                  >
                    <Popup>
                      <div style={{ minWidth: 200 }}>
                        <strong>{f.place}</strong>
                        <div>Magnitude: {mag ?? "—"}</div>
                        <div>Depth: {typeof f.depth === "number" ? `${f.depth} km` : "—"}</div>
                        <div>
                          Time: {new Date(f.time).toLocaleString()}
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <a href={f.url} target="_blank" rel="noreferrer">More details</a>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}
        </div>

        <aside style={{ width: 320, borderLeft: "1px solid #e6e6e6", padding: 12, overflowY: "auto", background: "#fafafa" }}>
          <h3 style={{ marginTop: 4 }}>Stats & List</h3>
          <div style={{ fontSize: 13, marginBottom: 8 }}>
            Total quakes (past 24 hrs): <strong>{data.length}</strong>
          </div>
          <div style={{ fontSize: 13, marginBottom: 8 }}>
            Showing: <strong>{filtered.length}</strong>
          </div>

          <div style={{ marginTop: 8 }}>
            {filtered
              .slice()
              .sort((a, b) => (b.magnitude ?? 0) - (a.magnitude ?? 0))
              .map((f) => (
                <div key={f.id} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                  <div style={{ fontWeight: 600 }}>{f.place}</div>
                  <div style={{ fontSize: 13, color: "#444" }}>
                    Mag {f.magnitude ?? "—"} • {new Date(f.time).toLocaleString()}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <a href={f.url} target="_blank" rel="noreferrer">Details</a>
                  </div>
                </div>
              ))}
          </div>

          <div style={{ marginTop: 12, fontSize: 13 }}>
            <strong>Legend</strong>
            <div style={{ marginTop: 6 }}>
              <div>Circle size = magnitude</div>
              <div>Color scale: small → large</div>
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
            Data source: USGS Earthquake Hazards Program (past 24 hours).
          </div>
        </aside>
      </main>

      <footer style={{ padding: 8, textAlign: "center", fontSize: 12, color: "#666" }}>
        Tips: Pan/zoom map. Click circles for details. Use the min magnitude slider to filter results.
      </footer>
    </div>
  );
}
