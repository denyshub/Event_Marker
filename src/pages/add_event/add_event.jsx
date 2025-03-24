  import React, { useState, useEffect } from "react";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";
  import "./add_event.css";
  import "leaflet-geosearch/dist/geosearch.css";
  import L from "leaflet";
  import axiosInstance from "../../axiosConfig";
  import LocationIcon from "../../images/svg/location.svg";
  import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMapEvents,
  } from "react-leaflet";
  import { OpenStreetMapProvider } from "leaflet-geosearch";
  import { GeoSearchControl } from "leaflet-geosearch";
  import "leaflet/dist/leaflet.css";
  import { checkAuth } from "../../authCheck";
  import { API_IP } from "../../API_IP";
  const MapComponent = ({ onLocationSelect }) => {
    const customIcon = new L.Icon({
      iconUrl: LocationIcon, // Шлях до твого кастомного зображення
      iconSize: [32, 32], // Розмір іконки [width, height]
      iconAnchor: [16, 32], // Точка, яка вказує на координати [x, y]
      popupAnchor: [0, -32], // Точка появи попапу відносно маркера
    });

    const [position, setPosition] = useState(null);

    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      onLocationSelect(lat, lng); // Pass coordinates to the form
    };

    return (
      <MapContainer center={[49.2827, -123.1207]} zoom={13}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <MapClickHandler onMapClick={handleMapClick} />
        {position && (
          <Marker position={position} icon={customIcon}>
            <Popup>
              Coordinates: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </Popup>
          </Marker>
        )}
        <SearchBox onLocationSelect={onLocationSelect} icon={customIcon} />
      </MapContainer>
    );
  };

  // Adds map click handler
  const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({
      click: onMapClick,
    });
    return null;
  };

  // Adds search box to the map
  const SearchBox = ({ onLocationSelect }) => {
    const map = useMapEvents({});

    useEffect(() => {
      // Ensure leaflet-geosearch is imported and available
      if (
        typeof GeoSearchControl !== "undefined" &&
        typeof OpenStreetMapProvider !== "undefined"
      ) {
        const provider = new OpenStreetMapProvider();
        const searchControl = new GeoSearchControl({
          provider,
          style: "bar",
          autoClose: true,
          keepResult: true,
          showMarker: false,
        });

        map.addControl(searchControl);

        const handleSearchLocation = (e) => {
          const { lat, lng } = e.location;
          onLocationSelect(lat, lng);
        };

        map.on("geosearch/showlocation", handleSearchLocation);

        return () => {
          map.removeControl(searchControl);
          map.off("geosearch/showlocation", handleSearchLocation);
        };
      }
    }, [map, onLocationSelect]);

    return null;
  };

    const EventAddPage = () => {
      const [eventData, setEventData] = useState({
        title: "",
        slug: "",
        date: "",
        location: "",
        description: "",
        price: "",
        latitude: "",
        longitude: "",
        category: "",
        website: "",
        image: null,
      });

      const [categories, setCategories] = useState([]);
      const [successMessage, setSuccessMessage] = useState(""); // Стейт для повідомлення
      const navigate = useNavigate();

      // Fetch categories from the backend
      useEffect(() => {
      
        const fetchCategories = async () => {
          if (!checkAuth()) {
            navigate('/login');  // або куди вам потрібно перенаправити
            return;
          }
      
          try {
            const response = await axiosInstance.get(
              `http://${API_IP}/api/categories/`
            );
            setCategories(response.data);
          } catch (error) {
            console.error("Error fetching categories:", error);
            // Якщо отримуємо помилку 401 (неавторизований), можна також перенаправити
            if (error.response?.status === 401) {
              navigate('/login');
            }
          }
        };
      
        fetchCategories();
        console.log("hyi:", localStorage.getItem("accessToken"));
        console.log("lalalala", localStorage.getItem("refreshToken"));
      }, []);

      const handleChange = (e) => {
        const { name, value, files } = e.target;
        setEventData((prev) => ({
          ...prev,
          [name]: files ? files[0] : value,
        }));
      };

      const handleSubmit = (e) => {
        e.preventDefault();
      
        const formData = new FormData();
        formData.append("title", eventData.title);
        formData.append("slug", eventData.slug);
        formData.append("date", eventData.date);
        formData.append("location", eventData.location);
        formData.append("description", eventData.description);
        formData.append("price", eventData.price);
        formData.append("latitude", eventData.latitude);
        formData.append("longitude", eventData.longitude);
        formData.append("category", eventData.category); // Passing category ID
        formData.append("website", eventData.website);
        if (eventData.image) {
          formData.append("image", eventData.image); // Ensure that this is a valid file object
        }
      
        // Sending the formData to the server
        axiosInstance
          .post(`http://${API_IP}/api/events/`, formData, {
            headers: {
              "Content-Type": "multipart/form-data", // Ensure this header is set
            },
          })
          .then((response) => {
            console.log("Event created:", response.data);
            setEventData({
              title: "",
              slug: "",
              date: "",
              location: "",
              description: "",
              price: "",
              latitude: "",
              longitude: "",
              category: "",
              website: "",
              image: null,
            });
            setSuccessMessage("Event created successfully!");
            setTimeout(() => {
              setSuccessMessage("");
            }, 3000);
          })
          .catch((error) => {
            console.error("Error creating event:", error);
            // Handle the error appropriately
          });
      };
      

      return (
        <div className="event-add-wrapper">
          <div className="event-add-container">
            <h1>Create New Event</h1>
            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-row">
                <input
                  type="text"
                  name="title"
                  placeholder="Event Title"
                  value={eventData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <input
                  type="datetime-local"
                  name="date"
                  value={eventData.date}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={eventData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <textarea
                name="description"
                placeholder="Event Description"
                value={eventData.description}
                onChange={handleChange}
                required
              ></textarea>

              <div className="form-row">
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={eventData.price}
                  onChange={handleChange}
                  required
                />
                <select
                  name="category"
                  value={eventData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <input
                  type="number"
                  name="latitude"
                  placeholder="Latitude"
                  value={eventData.latitude}
                  onChange={handleChange}
                  step="0.0001"
                />
                <input
                  type="number"
                  name="longitude"
                  placeholder="Longitude"
                  value={eventData.longitude}
                  onChange={handleChange}
                  step="0.0001"
                />
              </div>
              <MapComponent
                onLocationSelect={(lat, lng) => {
                  setEventData((prev) => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                  }));
                }}
              />

              <div className="form-row">
                <input
                  type="url"
                  name="website"
                  placeholder="Event Website"
                  value={eventData.website}
                  onChange={handleChange}
                />
                <div className="file-upload">
                  <input
                    type="file"
                    name="image"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  <label htmlFor="image-upload">
                    {eventData.image ? eventData.image.name : "Upload Event Photo"}
                  </label>
                </div>
              </div>

              <button type="submit" className="submit-btn">
                Create Event
              </button>
            </form>

            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
          </div>
        </div>
      );
    };

    export default EventAddPage;
