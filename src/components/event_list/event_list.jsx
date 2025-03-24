import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_IP } from '../../API_IP';
const EventList = () => {
  const [events, setEvents] = useState([]);


  useEffect(() => {
    axios.get(`http://${API_IP}/api/events/`)
      .then(response => {
        setEvents(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the events!", error);
      });
  }, []);

  return (
    <div>
      <h2>Upcoming Events</h2>
      <ul>
        {events.map(event => (
          <li key={event.id}>
            <h3>{event.title}</h3>
            <p>{event.date}</p>
            <p>{event.location}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventList;
