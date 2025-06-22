
import React from 'react';
import { Event } from '../types';
import { CalendarIcon, LocationIcon, UsersIcon, TicketIcon } from '../constants';

interface EventCardProps {
  event: Event;
  onViewDetails: (event: Event) => void;
  onBookTicket?: (eventId: string) => void; // Optional if booking is handled elsewhere
  isHost?: boolean; // To show edit/delete options
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onViewDetails, onBookTicket, isHost, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 flex flex-col">
      <img 
        className="w-full h-48 object-cover" 
        src={event.imageUrl || `https://picsum.photos/seed/${event.id}/400/200`} 
        alt={event.title} 
      />
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-sky-700 mb-2">{event.title}</h3>
        <p className="text-xs text-slate-500 mb-1 bg-sky-100 text-sky-700 px-2 py-1 rounded-full inline-block self-start font-medium">{event.category}</p>
        
        <div className="mt-2 space-y-2 text-sm text-slate-600 flex-grow">
          <div className="flex items-center">
            {CalendarIcon} {new Date(event.date).toLocaleDateString()} at {event.time}
          </div>
          <div className="flex items-center">
            {LocationIcon} {event.location}
          </div>
          <p className="line-clamp-2 text-sm text-slate-500 mb-3">{event.description}</p>
          <div className="flex items-center text-sm text-slate-600">
            {UsersIcon} {event.attendees} / {event.capacity} Attendees
          </div>
          {event.price !== undefined && (
            <div className="flex items-center text-sm text-slate-600 font-semibold">
              {TicketIcon} {event.price > 0 ? `$${event.price.toFixed(2)}` : 'Free'}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={() => onViewDetails(event)}
              className="w-full sm:w-auto flex-grow bg-sky-500 text-white px-4 py-2 rounded-md hover:bg-sky-600 transition-colors text-sm font-medium"
            >
              View Details
            </button>
            {onBookTicket && !isHost && (
              <button
                onClick={() => onBookTicket(event.id)}
                className="w-full sm:w-auto flex-grow bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors text-sm font-medium"
              >
                Book Ticket
              </button>
            )}
          </div>
          {isHost && onEdit && onDelete && (
            <div className="mt-3 flex space-x-2">
              <button 
                onClick={() => onEdit(event)}
                className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded hover:bg-slate-300"
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(event.id)}
                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
