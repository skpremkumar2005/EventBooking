
import React, { useState, useEffect } from 'react';
import { Event } from '../types';
import { DefaultEventCategories } from '../constants';

interface EventFormProps {
  onSubmit: (event: Omit<Event, 'id' | 'attendees' | 'hostId'>, existingEventId?: string) => void;
  initialData?: Event | null;
  onCancel?: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(DefaultEventCategories[0]);
  const [capacity, setCapacity] = useState(50);
  const [isPublic, setIsPublic] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDate(initialData.date.split('T')[0]); // Ensure date is in YYYY-MM-DD for input
      setTime(initialData.time);
      setLocation(initialData.location);
      setDescription(initialData.description);
      setCategory(initialData.category);
      setCapacity(initialData.capacity);
      setIsPublic(initialData.isPublic);
      setImageUrl(initialData.imageUrl || '');
      setPrice(initialData.price || 0);
    } else {
      // Reset form for new event
      setTitle('');
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setTime('18:00');
      setLocation('');
      setDescription('');
      setCategory(DefaultEventCategories[0]);
      setCapacity(50);
      setIsPublic(true);
      setImageUrl('');
      setPrice(0);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time || !location || !description || !category) {
        alert("Please fill in all required fields.");
        return;
    }
    onSubmit({ title, date, time, location, description, category, capacity: Number(capacity), isPublic, imageUrl, price: Number(price) }, initialData?.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-xl max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-sky-700 mb-6">{initialData ? 'Edit Event' : 'Create New Event'}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required 
                 className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"/>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 bg-white">
            {DefaultEventCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required 
                 className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"/>
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-slate-700 mb-1">Time</label>
          <input type="time" id="time" value={time} onChange={(e) => setTime(e.target.value)} required 
                 className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"/>
        </div>
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">Location</label>
        <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} required 
               className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"/>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
          <input type="number" id="capacity" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value, 10))} min="1" required 
                 className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"/>
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">Ticket Price (0 for free)</label>
          <input type="number" id="price" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} min="0" step="0.01" required 
                 className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"/>
        </div>
      </div>
      
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-700 mb-1">Image URL (Optional)</label>
        <input type="url" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
               placeholder="https://example.com/image.jpg"
               className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"/>
      </div>

      <div className="flex items-center">
        <input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} 
               className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"/>
        <label htmlFor="isPublic" className="ml-2 block text-sm text-slate-700">Make this event public</label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button type="button" onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200 transition-colors">
            Cancel
          </button>
        )}
        <button type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors">
          {initialData ? 'Save Changes' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
