import React, { JSX, useEffect, useRef, useState } from "react";
import "dhtmlx-scheduler/codebase/dhtmlxscheduler.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { scheduler } from "@dhx/trial-scheduler";
import { generateEvents } from "./utils";
import Legend from "./Legend/Legend";
import { people } from "./constants";
import EventCount from "./EventCount/EventCount";
import ReactDOM from "react-dom/client";
import CustomForm from "./CustomForm/CustomForm";

const SchedulerComponent = (): JSX.Element => {
  const [visiblePeople, setVisiblePeople] = useState<string[]>(
    people.map((p) => p.name)
  );
  const schedulerRef = useRef<HTMLDivElement>(null);
  const [eventCount, setEventCount] = useState(100);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const initializeSchedularEvents = () => {
    if (scheduler._$initialized) {
      return;
    }
    // Disable lightbox on single click
    scheduler.attachEvent("onClick", function (id, e) {
      return false; // Prevents event details from opening on single-click
    });
    scheduler.attachEvent("onEventAdded", (id, ev) => {
      // if (onDataUpdated) {
      //   onDataUpdated("create", ev, id);
      // }
    });

    scheduler.attachEvent("onEventChanged", (id, ev) => {
      // if (onDataUpdated) {
      //   onDataUpdated("update", ev, id);
      // }
    });

    scheduler.attachEvent("onEventDeleted", (id, ev) => {
      // if (onDataUpdated) {
      //   onDataUpdated("delete", ev, id);
      // }
    });

    scheduler._$initialized = true;
  };

  useEffect(() => {
    if (!schedulerRef.current) return;

    const startTime = performance.now();

    scheduler.init(schedulerRef.current, new Date(), "month"); // Initialize Scheduler

    // Add scheduler congurable options
    scheduler.config.xml_date = "%Y-%m-%d %H:%i";
    scheduler.config.drag_create = true;
    scheduler.config.drag_move = true;
    scheduler.config.drag_resize = true;
    scheduler.config.details_on_dblclick = true;
    scheduler.config.details_on_create = true;
    scheduler.config.repeat_date = "%Y-%m-%d %H:%i";
    scheduler.config.max_month_events = 3;
    scheduler.config.resize_month_events = true;
    scheduler.config.multi_day = true; // Allow multiple events per cell
    scheduler.config.collision_limit = 1;

    const events = generateEvents(eventCount); // Generate 10,000 events
    scheduler.parse(events); // Load events
    const endTime = performance.now();
    console.log(
      `DHX Scheduler Rendered in: ${(endTime - startTime).toFixed(2)}ms`
    );

    // Initialize Scheduler events
    initializeSchedularEvents();

    // Heatmap Effect
    scheduler.templates.month_date_class = function (date: Date) {
      const events = scheduler.getEvents(
        date,
        new Date(date.getTime() + 86400000)
      ); // Get events for the day
      const count = events.length;

      // if (count >= 10) return "high-density"; // Dark Red
      // if (count >= 5) return "medium-density"; // Orange
      // if (count >=1) return "low-density"; // Light Yellow
      return "";
    };
    scheduler.templates.event_class = function (start, end, event) {
      return "dhx_event_custom"; // Add a custom class
    };

    scheduler.templates.event_text = function (start, end, event) {
      const icon = event.type === "service" ? "🔧" : "📅";
      return `<span style="margin-right: 5px;">${icon}</span> ${event.text} (${event.personId})`;
    };
    scheduler.plugins({
      recurring: true,
      collision: true
    });

    return () => {
      scheduler.clearAll();
    };
  }, []);

  useEffect(() => {
    scheduler.clearAll();
    const events = generateEvents(eventCount); // Generate 10,000 events

    const filteredEvents = events.filter((event) =>
      visiblePeople.includes(event.personId)
    );
    const startTime = performance.now();

    scheduler.parse(filteredEvents);
    const endTime = performance.now();

    console.log(
      `DHX Scheduler Rendered in: ${(endTime - startTime).toFixed(2)}ms`
    );
  }, [visiblePeople]);

  useEffect(() => {
    // Simulate real-time updates every 10 seconds
    const interval = setInterval(() => {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour
      const newEvent = {
        id: "new-event",
        start_date: now.toISOString().slice(0, 16).replace("T", " "),
        end_date: oneHourLater.toISOString().slice(0, 16).replace("T", " "),
        text: `Event New`,
      };
      scheduler.batchUpdate(function () {
        const events = scheduler.getEvents();
        for (var i = 0; i < events.length; i++) {
          const event = events[i];
          event.start_date = scheduler.date.add(event.start_date, 1, "day");
          event.end_date = scheduler.date.add(event.end_date, 1, "day");
          scheduler.updateEvent(event.id);
        }
      });

      // Append new event to current events
      scheduler?.addEvent(newEvent);
    }, 10000);

    return () => clearInterval(interval); // Clean up the interval on unmount
  }, []);

  useEffect(() => {
    scheduler.clearAll();
    const events = generateEvents(eventCount); // Generate 10,000 events

    const filteredEvents = events.filter((event) =>
      visiblePeople.includes(event.personId)
    );
    const startTime = performance.now();

    scheduler.parse(filteredEvents);
    const endTime = performance.now();

    console.log(
      `DHX Scheduler Rendered in: ${(endTime - startTime).toFixed(2)}ms`
    );
  }, [eventCount]);

  // Handle date selection from the calendar
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    scheduler.setCurrentView(date, "month"); // Update scheduler view
  };

  // Toggle filter logic
  const togglePersonVisibility = (personId: string) => {
    setVisiblePeople((prev) =>
      prev.includes(personId)
        ? prev.filter((id) => id !== personId)
        : [...prev, personId]
    );
  };

  // Handle dropdown selection
  const handleEventCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value, 10);
    setEventCount(count);
  };

  return (
    <>
      <div className="scheduler-container">
        <div className="sidebar">
          <Calendar
            onChange={(date) => handleDateChange(date as Date)}
            value={selectedDate}
          />
          <Legend
            visiblePeople={visiblePeople}
            togglePersonVisibility={togglePersonVisibility}
          />
          <EventCount
            eventCount={eventCount}
            handleEventCountChange={handleEventCountChange}
          />
        </div>
        <div className="scheduler" ref={schedulerRef}></div>
        <div id="lightbox_container" style={{ display: "none" }}></div>
      </div>
      <div>
        <a href="https://docs.dhtmlx.com/scheduler/samples/06_timeline/02_lines.html?_gl=1*15c5gnh*_gcl_au*MTI4ODY0OTAzMC4xNzM4ODMwNDQ4Ljg4NTg2NDAwNC4xNzM5ODU2NjkwLjE3Mzk4NTY2OTA.*_ga*OTA0NDA3ODgwLjE3Mzg2NTYxNjQ.*_ga_N87XPB4GSG*MTczOTg2MzUxMC4yMC4xLjE3Mzk4NjQ0NDIuNjAuMC4w&_ga=2.251718793.1603370314.1739763375-904407880.1738656164">
        
          Timeline view
        </a>
      </div>
      <div>
        {" "}
        <a href=" https://dhtmlx.com/docs/products/dhtmlxScheduler/sample_units.shtml">
          Unit multiple resource view
        </a>{" "}
      </div>
      <div>
        <a href="https://docs.dhtmlx.com/scheduler/samples/06_timeline/02_lines.html?_gl=1*15c5gnh*_gcl_au*MTI4ODY0OTAzMC4xNzM4ODMwNDQ4Ljg4NTg2NDAwNC4xNzM5ODU2NjkwLjE3Mzk4NTY2OTA.*_ga*OTA0NDA3ODgwLjE3Mzg2NTYxNjQ.*_ga_N87XPB4GSG*MTczOTg2MzUxMC4yMC4xLjE3Mzk4NjQ0NDIuNjAuMC4w&_ga=2.251718793.1603370314.1739763375-904407880.1738656164">
          Custom HTML Content
        </a>
      </div>
    </>
  );
};

export default SchedulerComponent;
