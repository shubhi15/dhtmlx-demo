import { people } from "./constants";

export const generateEvents = (eventCount: number) => {
    const events = [];
    const startDate = new Date(2025, 1, 1);
    const endDate = new Date(2025, 1, 28);
    

    for (let i = 0; i < eventCount; i++) {
        const personIndex = i % people.length;
        const person = people[personIndex];

        const randomDay = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));

        const hour = Math.floor(Math.random() * 10) + 8;
        const duration = Math.floor(Math.random() * 3) + 1;

        const start = new Date(randomDay);
        start.setHours(hour, 0, 0);

        const end = new Date(start);
        end.setHours(start.getHours() + duration);

        const eventType = Math.random() > 0.5 ? "service" : "non-service";

        events.push({
            id: i + 1,
            start_date: start.toISOString().slice(0, 16).replace("T", " "),
            end_date: end.toISOString().slice(0, 16).replace("T", " "),
            text: `Event ${i + 1}`,
            color: person.color, // Assign background color from person
            personId: person.name,
            type: eventType,
        });
    }
    return events;
};

const simulateRealTimeUpdate = (scheduler: any, events: any[]) => {
  // setInterval(() => {
  //   // Randomly pick an event and update its time
  //   const eventIndex = Math.floor(Math.random() * events.length);
  //   const event = { ...events[eventIndex] };

  //   // Change the start and end time of the event slightly
  //   const newStartDate = new Date(event.start_date);
  //   newStartDate.setMinutes(newStartDate.getMinutes() + 10); // Add 10 minutes
  //   const newEndDate = new Date(event.end_date);
  //   newEndDate.setMinutes(newEndDate.getMinutes() + 10); // Add 10 minutes

  //   event.start_date = newStartDate.toISOString().replace('T', ' ').slice(0, 19);
  //   event.end_date = newEndDate.toISOString().replace('T', ' ').slice(0, 19);
    
  //   // Simulate the update by calling scheduler.updateEvent
  //   scheduler.updateEvent(event.id);

  //   console.log(`Event ${event.id} updated:`, event);
  // }, 5000); // Update every 5 seconds
};
