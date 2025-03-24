import React, { useEffect, useState } from "react";

import EventMap from "../event_map/event_map";

import { ReactComponent as CloseIcon } from "../../images/svg/close.svg";
import Pagination from "../../components/pagination/pagination";
import "./home.css";
import axiosInstance from "../../axiosConfig";
// Створення axios інстансу
import EventCard from "../../components/event_card/event_card";
import { API_IP } from "../../API_IP";

const CategoryFilter = ({ categories, value, onChange }) => {
  return (
    <div className="categoryFilter">
      <label htmlFor="categoryFilter">Select Category:</label>
      <select
        id="categoryFilter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
};
const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};

const getFromLocalStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    console.log(key, item)
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Error reading from localStorage:', e);
    return defaultValue;
  }
};
const Home = () => {
  const [events, setEvents] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [coords, setCoords] = useState(getFromLocalStorage('coords', ""));
  const [inputCity, setInputCity] = useState(getFromLocalStorage('inputCity', ""));
  const [city, setCity] = useState(getFromLocalStorage('city', "") );
  const [filterLabel, setFilterLabel] = useState(getFromLocalStorage('filterLabel', 'Popular'));
  const [filters, setFilters] = useState(getFromLocalStorage('filters', { category: "",
    min_price: "",
    max_price: "",
    start_date: "",
    end_date: "",
  }));
 
  
const [appliedFilters, setAppliedFilters] = useState({
  category: "",
  min_price: "",
  max_price: "",
  start_date: "",
  end_date: "",
});


  const [viewMode, setViewMode] = useState("list");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  useEffect(() => {
    if (viewMode === "map") {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }, [viewMode]); // Перемикаємося лише на зміни viewMode
  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };


  // Зберігаємо стани при їх зміні
  useEffect(() => {
    saveToLocalStorage('currentPage', currentPage);
  }, [currentPage]);

  useEffect(() => {
    saveToLocalStorage('viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    saveToLocalStorage('inputCity', inputCity);
    saveToLocalStorage('city', city);
    saveToLocalStorage('coords', coords);
  }, [inputCity, city, coords]);

  useEffect(() => {
    saveToLocalStorage('filters', filters);
    saveToLocalStorage('appliedFilters', appliedFilters);
    saveToLocalStorage('filterLabel', filterLabel);
  }, [filters, appliedFilters, filterLabel]);




// Fetch categories on mount
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const filter = true;
      const response = await axiosInstance.get(
        `http://${API_IP}/api/categories/`,
        { params: { filter } }
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  fetchCategories();
}, []);

// Fetch events whenever appliedFilters, city or pagination changes
useEffect(() => {
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`http://${API_IP}/api/events/`);
      const params = {
        page: currentPage,
        city: city,
        ...appliedFilters, // Using appliedFilters instead of filters
      };
      
      // Remove empty params
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== '')
      );
      
      Object.entries(cleanParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
      
      const response = await axiosInstance.get(url.toString());
      setEvents(response.data.events.results);
      setMarkers(response.data.markers);
      setCoords(response.data.city);
      setTotalPages(Math.ceil(response.data.events.count / 2));
    } catch (err) {
      setError("Error fetching events. Please try again later.");
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchEvents();
}, [currentPage, city, appliedFilters]); // Using appliedFilters in dependencies

const handleFilterChange = (name, value) => {
  setFilters(prev => ({
    ...prev,
    [name]: value,
  }));
};



const applyFilters = () => {
  setCurrentPage(1);
  setAppliedFilters(filters); // Apply filters only when button is clicked
  setFilterLabel(getFilterLabel());
};

const resetFilters = () => {
  const emptyFilters = {
    category: "",
    min_price: "",
    max_price: "",
    start_date: "",
    end_date: "",
  };
  setFilters(emptyFilters);
  setAppliedFilters(emptyFilters);
  setCurrentPage(1);
  setFilterLabel('Popular');
};

const handleSearch = () => {
  setCurrentPage(1);
  setCity(inputCity);
};

const clearSearch = () => {
  setInputCity("");
  setCity("");
  setCurrentPage(1);
};

const getFilterLabel = () => {
  if (
    filters.category ||
    filters.min_price ||
    filters.max_price ||
    filters.start_date ||
    filters.end_date
  ) {
    return "Results";
  }
  return "Popular";
};

const handlePageChange = (page) => {
  if (page > 0 && page <= totalPages) {
    setCurrentPage(page);
  }
};
  
  return (
    <div className="home-container">

      <div className="filter-container">
        <button className="filter-toggle-btn" onClick={toggleFilters}>
          {isFilterOpen ? "Close Filters" : "Open Filters"}
        </button>

        {isFilterOpen && (
          <div className="filter-dropdown">
            <div className="filter-section">
              <CategoryFilter
                categories={categories}
                value={filters.category}
                onChange={(value) => handleFilterChange("category", value)}
              />
            </div>

            <div className="priceFilters">
              <input
                type="number"
                placeholder="Min Price"
                value={filters.min_price}
                onChange={(e) =>
                  handleFilterChange("min_price", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Max Price"
                value={filters.max_price}
                onChange={(e) =>
                  handleFilterChange("max_price", e.target.value)
                }
              />
            </div>

            <div className="date-filters">
              <input
                type="date"
                placeholder="Start Date"
                value={filters.start_date}
                onChange={(e) =>
                  handleFilterChange("start_date", e.target.value)
                }
              />
              <input
                type="date"
                placeholder="End Date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange("end_date", e.target.value)}
              />
            </div>

            <div className="filter-actions">
              <button onClick={applyFilters}>Apply</button>
              <button onClick={resetFilters}>Reset</button>
            </div>
          </div>
        )}
      </div>

      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Enter city..."
          value={inputCity}
          onChange={(e) => setInputCity(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
        {city && (
          <button onClick={clearSearch} className="clear-button">
            <CloseIcon width={20} height={20} />
          </button>
        )}
      </div>

      <div className="view-switcher">
        <button
          className={viewMode === "list" ? "active" : ""}
          onClick={() => setViewMode("list")}
        >
          List
        </button>
        <button
          className={viewMode === "map" ? "active" : ""}
          onClick={() => setViewMode("map")}
        >
          Map
        </button>
      </div>

      {loading && <p>Loading events...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <>
          {viewMode === "list" ? (
            events.length === 0 ? (
              <p>No events found matching your criteria.</p>
            ) : (
              <>
                {" "}
                <div>
                  <h2>{filterLabel}</h2> {/* Динамічний заголовок */}
                  {/* Далі ваш список подій або компоненти */}
                </div>
                <div className="event-list">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
               
              </>
            )
          ) : (
            <EventMap city={coords} markers={markers} />
          )}
        </>
      )}
    </div>
  );
};

export default Home;
