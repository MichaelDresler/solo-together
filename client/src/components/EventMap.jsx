import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function EventMap({ lat, lng, address = "" }) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-6 text-sm text-stone-500">
        Map unavailable
      </div>
    );
  }

  const center = [lat, lng];

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="rounded-2xl z-0"
      style={{ height: "300px", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=HoR5tUOfiRy9ih4L5FyH"
      />
      <Marker position={center}>
        <Popup>{address || "Event location"}</Popup>
      </Marker>
    </MapContainer>
  );
}
