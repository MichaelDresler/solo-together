import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';

export default function EventMap() {
  return (
    <MapContainer
      center={[49.189372, -122.850190]} // Vancouver
      zoom={14}
      style={{ height: "300px", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=HoR5tUOfiRy9ih4L5FyH"
      />
      <Marker position={[49.189372, -122.850190]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
}
