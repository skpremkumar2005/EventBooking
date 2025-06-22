import React from 'react';

export const CalendarIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

export const LocationIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

export const UsersIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.076M15 15V3.75a3 3 0 00-3-3h-3a3 3 0 00-3 3V15m0 0v2.25m0-2.25H5.25m0 0A2.25 2.25 0 013 12.75V8.25a2.25 2.25 0 012.25-2.25h1.5M15 15h.01M15 15h1.5a2.25 2.25 0 012.25 2.25V18.75a2.25 2.25 0 01-2.25 2.25h-1.5m-3 0h3.75m-3.75 0h-3.75m0 0H9m3.75 0H12m2.25-6H12m3.75 0H12M6 12C6 9.791 7.791 8 10 8s4 1.791 4 4-1.791 4-4 4S6 14.209 6 12z" />
    </svg>
);

export const TicketIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12h1.5M9 9h1.5M9 12h1.5M9 15h1.5M4.5 6H14a2 2 0 012 2v12a2 2 0 01-2 2H4.5a2 2 0 01-2-2V8a2 2 0 012-2z" />
    </svg>
);

export const SparklesIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L24.75 5.25l-.813 2.846a4.5 4.5 0 00-3.09 3.09L18.25 12l2.846.813a4.5 4.5 0 003.09 3.09L24.75 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L18.25 12zM12 1.25l.813 2.846a4.5 4.5 0 003.09 3.09L18.75 9l-2.846.813a4.5 4.5 0 00-3.09 3.09L12 15.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L5.25 9l2.846-.813a4.5 4.5 0 003.09-3.09L12 1.25z" />
  </svg>
);

export const PlusCircleIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const DefaultEventCategories = [
  'Birthday Party', 'Wedding Reception', 'Corporate Conference', 'Music Festival', 
  'Workshop', 'Charity Gala', 'Anniversary Celebration', 'Baby Shower', 
  'Art Exhibition', 'Product Launch', 'Networking Event', 'Holiday Party'
];

export const AppName = "EventHub";

export const MAX_TICKETS_PER_USER_PER_EVENT = 2; // Example limit

export const GENERIC_USER_AVATAR_URL = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=150';