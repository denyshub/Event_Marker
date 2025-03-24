import "./event_detail.css";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LocationIcon from "../../images/svg/location.svg";
import axios from "axios";
import axiosInstance from "../../axiosConfig";
import { checkAuth } from "../../authCheck";
import { API_IP } from "../../API_IP";
const parseCoordinates = (coordinates) => {
  if (!coordinates) return null;
  const match = coordinates.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
  console.log("dadadadada", match);
  return match ? [parseFloat(match[2]), parseFloat(match[1])] : null;
};

// async function getWeather(coordinates, date) {
//   const parsed_coords = parseCoordinates(coordinates);

//   console.log(parsed_coords, date);
//   const API_KEY = "ezXkQnf26mF58By4jiKMAReG9FQiiXrs"; // Замініть на свій API-ключ
//   const url = `https://api.tomorrow.io/v4/weather/forecast?location=${parsed_coords[0]},${parsed_coords[1]}&apikey=${API_KEY}`;

//   try {
//     const response = await fetch(url);
//     const data = await response.json();

//     const forecast = data.timelines?.daily || [];
//     for (const day of forecast) {
//       if (day.time.startsWith(date)) {
//         // YYYY-MM-DD
//         console.log("temperature", day.values.temperatureAvg);
//         console.log("weather_code", day.values.weatherCodeMax);
//         return {
//           temperature: day.values.temperatureAvg,
//           weather_code: day.values.weatherCodeMax,
//         };
//       }
//     }
//   } catch (error) {
//     console.error("Error fetching weather data:", error);
//   }

//   return null;
// }

const EventDetail = () => {
  const customIcon = new L.Icon({
    iconUrl: LocationIcon,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`http://${API_IP}/api/events/${slug}/`);
        if (!response.ok) throw new Error("Cannot get the event");

        const data = await response.json();
        setEvent(data);

        // Отримання прогнозу погоди
        // const weatherData = await getWeather(
        //   data.coordinates,
        //   data.date.split("T")[0]
        // );

        // if (weatherData !== null) {
        //   setWeather(weatherData);
        // }

        // console.log("wd:", weatherData);
      } catch (err) {
        // Виправлено
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  if (loading)
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="error">
        <span>{error}</span>
      </div>
    );

  if (!event)
    return (
      <div className="error">
        <span>Event not found</span>
      </div>
    );

  const parsedCoords = parseCoordinates(event.coordinates);
  console.log("daaaaaaaaaaaaaaaaaaaaaaa", parsedCoords);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };
  const EventSubscriptionButton = ({ eventId }) => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [error, setError] = useState("");

    // Перевірка, чи підписаний користувач
    const checkSubscriptionStatus = async () => {
      try {
        const response = await axiosInstance.get(
          `http://${API_IP}/api/subscriptions/${eventId}`
        );
        const userSubscriptions = response.data.subscription;

        setIsSubscribed(userSubscriptions); // Якщо користувач підписаний на подію
      } catch (err) {
        setError("An error occurred while checking subscription status.");
      }
    };

    useEffect(() => {
      checkSubscriptionStatus();
    }, [eventId]);

    // Функція для підписки або відписки
    const handleSubscription = async () => {
      if (!checkAuth()) {
        setError("You need to log in first.");
        return;
      }

      try {
        if (isSubscribed) {
          // Видалення підписки
          await axiosInstance.delete(
            `http://${API_IP}/api/subscriptions/${eventId}/`,
            {
              data: { event: eventId },
            }
          );
          setIsSubscribed(false); // Якщо відписалися
          setError(""); // Очищаємо помилки
        } else {
          // Підписка на подію
          await axiosInstance.post(`http://${API_IP}/api/subscriptions/`, {
            event: eventId,
          });
          setIsSubscribed(true); // Якщо підписалися
          setError(""); // Очищаємо помилки
        }
      } catch (err) {
        if (err.response && err.response.status === 400) {
          setError("Already subscribed to this event.");
        } else {
          setError("An error occurred. Please try again.");
        }
      }
    };

    return (
      <div>
        <button
          className="sub-button"
          onClick={handleSubscription}
          disabled={error === "You need to log in first."} // Деактивуємо кнопку, якщо користувач не авторизований
        >
          {isSubscribed ? "Unsubscribe" : "Follow Event"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  };

  return (
    <div className="event-page">
      <button onClick={() => window.history.back()} className="back-button">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to events list
      </button>

      <div className="event-image-container">
        {event.image ? (
          <img src={event.image} alt={event.title} className="event-image" />
        ) : (
          <div className="no-image">No image...</div>
        )}
      </div>
      <div className="event-subscription-count">

      </div>

      <div className="event-content">
        <div className="event-main">
          <h1 className="event-title">{event.title}</h1>
          {event.subscription_count > 0 && (
          <span className="counter">
            {event.subscription_count} people want to visit this event
          </span>
        )}
          <div className="event-description">{event.description}</div>
        </div>

        <div className="event-sidebar">
          <div className="info-card">
            <div className="info-item">
              <span>
                <strong>Price:</strong> {event.price + "$"}
              </span>
            </div>
            <div className="info-item">
              <span>
                <strong>Date:</strong> {formatDate(event.date)}
              </span>
            </div>
            <div className="info-item">
              <span>
                <strong>Time:</strong> {formatTime(event.date)}
              </span>
            </div>
            <div className="info-item">
              <span>
                <strong>Location:</strong> {event.location}
              </span>
            </div>
            {/* {weather && (
              <div className="info-item">
                <span>
                  <strong>Expected temperature:</strong> {weather.temperature}°C
                </span>
              </div>
            )} */}
            {event.website && (
              <div className="info-item">
                <a href={event.website}>Website</a>
              </div>
            )}

            <button
              className="share-button"
              onClick={() => {
                navigator
                  .share?.({
                    title: event.title,
                    text: event.description,
                    url: window.location.href,
                  })
                  .catch(console.error);
              }}
            >
              Share
            </button>
            <EventSubscriptionButton eventId={event.id} />
          </div>

          <div className="map-container">
            {parsedCoords ? (
              <MapContainer
                center={parsedCoords}
                zoom={13}
                scrollWheelZoom={true}
                style={{ width: "100%", height: "300px" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={parsedCoords} icon={customIcon}>
                  <Popup>
                    <h3>{event.title}</h3>
                    <div className="nav-detail">
                      <p>{event.location}</p>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${parsedCoords[0]},${parsedCoords[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="navigate-link"
                      >
                        Navigate
                      </a>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="map-placeholder">No location</div>
            )}
            <p className="map-label">Event location</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
