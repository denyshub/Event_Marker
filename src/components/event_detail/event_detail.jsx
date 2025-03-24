import React from 'react';

const EventDetail = ({ event }) => {
  return (
    <div>
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <p>{event.date}</p>
      <p>{event.location}</p>
    </div>
  );
};

export default EventDetail;
