import React, { useState, useEffect } from "react";
import "./main.css";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
} from "date-fns";

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [events, setEvents] = useState(() => {
    try {
      const storedEvents = localStorage.getItem("calendarEvents");
      return storedEvents ? JSON.parse(storedEvents) : {};
    } catch (error) {
      console.error("Error parsing events from localStorage:", error);
      return {};
    }
  });
  const [showModal, setShowModal] = useState(false);
  const [modalDateKey, setModalDateKey] = useState("");


  useEffect(() => {
    try {
      localStorage.setItem("calendarEvents", JSON.stringify(events));
    } catch (error) {
      console.error("Error saving events to localStorage:", error);
    }
  }, [events]); 

  const handleDayClick = (day) => {
    const dateKey = format(day, "yyyy-MM-dd");
    setSelectedDate(day);
    setModalDateKey(dateKey);
    setShowModal(true);
  };

  const handleAddEvent = () => {
    const newEvent = prompt("Enter new event:");
    if (newEvent) {
      setEvents((prev) => ({
        ...prev,
        [modalDateKey]: [...(prev[modalDateKey] || []), newEvent],
      }));
    }
  };

  const handleEditEvent = (index) => {
    const updated = prompt("Edit event:", events[modalDateKey][index]);
    if (updated !== null && updated.trim() !== "") {
      const updatedEvents = [...events[modalDateKey]];
      updatedEvents[index] = updated;
      setEvents((prev) => ({
        ...prev,
        [modalDateKey]: updatedEvents,
      }));
    }
  };

  const handleDeleteEvent = (index) => {
    const confirmed = window.confirm("Delete this event?");
    if (confirmed) {
      const updatedEvents = [...events[modalDateKey]];
      updatedEvents.splice(index, 1);
      setEvents((prev) => ({
        ...prev,
        [modalDateKey]: updatedEvents,
      }));
    }
  };

  const renderHeader = () => (
    <>
      <div className="header row">
        <div className="col col-start">
          <button onClick={prevMonth}>❮</button>
        </div>
        <div className="col col-center">
          <span>{format(currentMonth, "MMMM yyyy")}</span>
        </div>
        <div className="col col-end">
          <button onClick={nextMonth}>❯</button>
        </div>
      </div>
      <div className="today-line">
        Today: {new Date().toLocaleDateString()}
      </div>
    </>
  );

  const renderDays = () => {
    const days = [];
    const dateFormat = "EEEEEE";
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="col col-center" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="days row">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dateKey = format(day, "yyyy-MM-dd");
        const hasEvents = events[dateKey]?.length > 0; 

        days.push(
          <div
            className={`col cell ${
              !isSameMonth(day, monthStart)
                ? "disabled"
                : isSameDay(day, selectedDate)
                ? "selected"
                : ""
            }`}
            key={day}
            onClick={() => handleDayClick(cloneDay)}
          >
            <span>{format(day, dateFormat)}</span>
            {hasEvents && <div className="event-indicator"></div>}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="row" key={day}>
          {days}
        </div>
      );
      days = [];
    }

    return <div className="body">{rows}</div>;
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="calendar">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Events on {modalDateKey}</h3>
            <ul>
              {(events[modalDateKey] || []).map((event, idx) => (
                <li key={idx}>
                  {event}
                  <button onClick={() => handleEditEvent(idx)}>✏️</button>
                  <button onClick={() => handleDeleteEvent(idx)}>🗑️</button>
                </li>
              ))}
            </ul>
            <button onClick={handleAddEvent}>Add Event</button>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
