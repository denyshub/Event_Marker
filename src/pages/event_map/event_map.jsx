import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { Link } from "react-router-dom";
import LocationIcon from "../../images/svg/location.svg";
import { API_IP } from "../../API_IP";
const customIcon = new L.Icon({
  iconUrl: LocationIcon,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const EventMap = ({ city, markers }) => {
  const [events, setEvents] = useState([]);
  const [cityCoordinates, setCityCoordinates] = useState(null);
  const [error, setError] = useState(null);

  const parseCoordinates = (coordinates) => {
    if (!coordinates) return null;
    const match = coordinates.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
    return match ? [parseFloat(match[2]), parseFloat(match[1])] : null;
  };

  useEffect(() => {
    const fetchCityCoordinatesAndEvents = async () => {
      if (city) {
        try {
          setError(null);
          
          // Спочатку отримуємо координати міста
          if (city) {
            setCityCoordinates(city);
          } else {
            setError("Coordinates not found for this city.");
            return;
          }
          
          // Тепер отримуємо мітки подій для цього міста
          
          if (markers) {
            setEvents(markers);
          } else {
            setError("No events found for this city.");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setError("Failed to load data. Please try again later.");
        }
      }
    };

    fetchCityCoordinatesAndEvents();
  }, [city]);

  const defaultCenter = [50, 50];
  const isCitySelected = cityCoordinates !== null;

  return (
    <>
      {error && (
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "18px", color: "red" }}>
          <p>{error}</p>
        </div>
      )}
      {isCitySelected ? (
        <MapContainer
          center={cityCoordinates}
          zoom={12}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {events.map((event, index) => {
            const eventCoordinates = parseCoordinates(event.coordinates);
            if (!eventCoordinates) return null; // Skip event if coordinates are invalid

            return (
              <Marker key={index} position={eventCoordinates} icon={customIcon}>
              <Popup  >
                <div style={{
                  width: "100%",
                
                  overflow: "hidden"
                }}>
                  <img
                    src={`http://${API_IP}` + event.image}
                    alt={event.title}
                    style={{
                     width:'200px',
                     
                      objectFit: "cover",
                      borderRadius: "8px"  // Optional: adds rounded corners
                    }}
                  />
                </div>
                <div style={{ 
                
                  textAlign: "center"
                }}>
                  <b>{event.title}</b>
                  <div className="nav-detail" style={{
                    display: "flex", 
                    justifyContent: "space-between", 
                    marginTop: "10px"
                  }}>
                    <Link to={`/events/${event.slug}`}>Details</Link>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${eventCoordinates[0]},${eventCoordinates[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="navigate-link"
                    >
                      Navigate
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
            
            );
          })}
        </MapContainer>
      ) : (
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "18px" }}>
          <h2>Enter your city</h2>
        </div>
      )}
    </>
  );
};

export default EventMap;
