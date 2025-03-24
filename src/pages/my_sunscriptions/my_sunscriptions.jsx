import React, { useState, useEffect } from "react";
import axiosInstance from "../../axiosConfig";
import { useNavigate } from "react-router-dom";
import "../home/home.css";
import { checkAuth } from "../../authCheck";
import EventCard from "../../components/event_card/event_card";
import { API_IP } from "../../API_IP";
const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axiosInstance.get(
          `http://${API_IP}/api/subscribed-events/`
        );
        setSubscriptions(response.data); // При отриманні відповіді зберігаємо підписки
        setLoading(false); // Завершуємо завантаження
      } catch (error) {
        setError("Failed to load subscriptions.");
        setLoading(false);
      }
    };

    // Перевірка на наявність токена і запит до API
    if (checkAuth()) {
      fetchSubscriptions();
    } else {
      navigate("/login"); // Перехід на сторінку логіну, якщо немає токена
    }
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="home-container">
    <div className="subscriptions-page">
      <h1>Your Subscriptions</h1>
      {subscriptions.length === 0 ? (
        <p>You are not subscribed to any events.</p>
      ) : (
        <div className="event-list">
          {subscriptions.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default SubscriptionsPage;
