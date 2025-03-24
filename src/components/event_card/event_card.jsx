import { Link } from "react-router-dom";
import '../../pages/home/home.css'
import { ReactComponent as LocationIcon } from "../../images/svg/event_location.svg";
import { ReactComponent as DateIcon } from "../../images/svg/date.svg";
import { ReactComponent as PriceIcon } from "../../images/svg/price.svg";
const EventCard = ({ event }) => {
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const truncateDescription = (description, wordLimit = 50) => {
    const words = description.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : description;
  };

  return (
    <div className="event-card">
      <div className="event-img-container">
        {event.image && (
          <Link to={`/events/${event.slug}`}>
            <img src={event.image} alt={event.title} className="event-image" />
          </Link>
        )}
      </div>

      <div className="info-container">
        <h3>{event.title}</h3>
        <p className="line-aligner">
          <DateIcon width={20} height={20} /> {formattedDate}
        </p>
        <p className="description-event">
          {truncateDescription(event.description)}
        </p>

        {/* Блок завжди буде залишатися внизу */}
        <div className="location-price-line">
          <p className="line-aligner">
            <LocationIcon width={20} height={20} /> {event.location}
          </p>

          {event.price !== undefined && (
            <p className="line-aligner price">
              <PriceIcon width={25} height={25} />
              {event.price === 0 ? "Free" : `$${event.price}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;