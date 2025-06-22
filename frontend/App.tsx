
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import EventForm from './components/EventForm';
import EventCard from './components/EventCard';
import AiRecommender from './components/AiRecommender';
import LoadingSpinner from './components/LoadingSpinner';
import Modal from './components/Modal';
import { Event, User, Page, AttendeeInfo } from './types';
import { AppName, PlusCircleIcon, CalendarIcon, SparklesIcon, UsersIcon, MAX_TICKETS_PER_USER_PER_EVENT, GENERIC_USER_AVATAR_URL } from './constants';
import * as apiService from './services/apiService';
import { generateEventImage } from './services/geminiService';


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false); 
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');


  const showNotification = (message: string, isError: boolean = false) => {
    setNotification(message);
    if(isError) console.error("Notification (Error):", message);
    else console.log("Notification:", message);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchEvents = useCallback(async (): Promise<Event[]> => {
    try {
      setApiError(null);
      const fetchedEvents = await apiService.getEvents();
      setEvents(fetchedEvents);
      return fetchedEvents;
    } catch (error: any) {
      const errorMessage = error.message || 'Could not load events.';
      setApiError(errorMessage);
      showNotification(errorMessage, true);
      return []; // Return empty array on error
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    setIsLoadingApp(true);
    setApiError(null);
    const token = localStorage.getItem('eventhub_token');
    if (token) {
      try {
        const user = await apiService.getCurrentUser();
        setCurrentUser(user);
      } catch (error: any) {
        localStorage.removeItem('eventhub_token'); 
        showNotification('Session expired. Please log in again.', true);
      }
    }
    await fetchEvents();
    setIsLoadingApp(false);
  }, [fetchEvents]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleLogin = async (email: string, pass: string) => {
    setIsActionLoading(true);
    setApiError(null);
    try {
      const { token, user } = await apiService.loginUser({ email, password: pass });
      localStorage.setItem('eventhub_token', token);
      setCurrentUser(user);
      setCurrentPage('dashboard');
      showNotification(`Welcome back, ${user.name}!`);
      await fetchEvents(); 
    } catch (error: any) {
      const loginErrorMessage = error.message || 'Login failed. Please check your credentials.';
      setApiError(loginErrorMessage);
      showNotification(loginErrorMessage, true);
    }
    setIsActionLoading(false);
  };

  const handleSignup = async (name: string, email: string, pass: string) => {
    setIsActionLoading(true);
    setApiError(null);
    try {
      const { token, user } = await apiService.signupUser({ name, email, password: pass });
      localStorage.setItem('eventhub_token', token);
      setCurrentUser(user);
      setCurrentPage('dashboard');
      showNotification(`Welcome, ${user.name}! Your account has been created.`);
      await fetchEvents();
    } catch (error: any) {
      const signupErrorMessage = error.message || 'Signup failed. Please try again.';
      setApiError(signupErrorMessage);
      showNotification(signupErrorMessage, true);
    }
    setIsActionLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('eventhub_token');
    setCurrentUser(null);
    setCurrentPage('login');
    setEvents([]); 
    setSearchQuery('');
    showNotification("You have been logged out.");
  };

  const handleCreateOrUpdateEvent = async (eventData: Omit<Event, 'id' | 'attendees' | 'hostId' | 'bookedBy'>, existingEventId?: string) => {
    setIsActionLoading(true);
    setApiError(null);
    let finalEventData = { ...eventData };

    try {
      if (!existingEventId && !eventData.imageUrl) {
        showNotification("Generating event image with AI...");
        const imageResult = await generateEventImage(eventData.title, eventData.category);
        if (imageResult.imageUrl) {
          finalEventData.imageUrl = imageResult.imageUrl;
          showNotification("AI image generated successfully!");
        } else if (imageResult.error) {
          showNotification(`AI image generation failed: ${imageResult.error}. Proceeding without AI image.`, true);
        }
      }

      if (existingEventId) {
        const updatedEvent = await apiService.updateEvent(existingEventId, finalEventData);
        setEvents(prevEvents => prevEvents.map(evt => evt.id === existingEventId ? { ...evt, ...updatedEvent} : evt)); 
        showNotification(`Event "${updatedEvent.title}" updated successfully!`);
      } else {
        const newEvent = await apiService.createEvent(finalEventData);
        setEvents(prevEvents => [newEvent, ...prevEvents]);
        showNotification(`Event "${newEvent.title}" created successfully!`);
      }
      setEditingEvent(null);
      setCurrentPage('dashboard');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save event.';
      setApiError(errorMessage);
      showNotification(errorMessage, true);
    }
    setIsActionLoading(false);
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleBookTicket = async (eventId: string) => {
    if (isActionLoading) {
        console.warn("handleBookTicket: An action is already in progress. Ignoring subsequent call.");
        return;
    }

    if (!currentUser) {
        showNotification("Please log in to book tickets."); 
        setCurrentPage('login');
        return;
    }

    setIsActionLoading(true);
    setApiError(null);
    
    const eventToBook = events.find(e => e.id === eventId);
    const eventTitleForMessage = eventToBook ? eventToBook.title : "this event";

    try {
        await apiService.bookTicket(eventId); // Assume this updates the backend
        const freshEvents = await fetchEvents(); // Re-fetch all events to get the latest state including updated bookedBy
        
        const updatedEventFromFreshList = freshEvents.find(e => e.id === eventId);

        if (selectedEvent && selectedEvent.id === eventId && updatedEventFromFreshList) {
            setSelectedEvent(updatedEventFromFreshList); // Update modal if it was open
        }
        showNotification(`Ticket booked for "${updatedEventFromFreshList?.title || eventTitleForMessage}"!`);
    } catch (error: any) {
        const errorMessage = error.message || 'Failed to book ticket.';
        if (errorMessage.toLowerCase().includes('sold out') || errorMessage.toLowerCase().includes('capacity')) {
            showNotification(`Sorry, "${eventTitleForMessage}" is sold out!`, true);
        } else if (errorMessage.toLowerCase().includes('limit reached') || errorMessage.toLowerCase().includes('maximum ticket')) {
            showNotification(errorMessage, true); 
        }
        else {
            setApiError(errorMessage);
            showNotification(errorMessage, true);
        }
    } finally {
        setIsActionLoading(false);
    }
  };
  
  const handleEditEvent = (event: Event) => {
    if (event.hostId && currentUser && event.hostId !== currentUser.id) {
        showNotification("You can only edit events you hosted.", true);
        return;
    }
    setEditingEvent(event);
    setCurrentPage('createEvent');
  };
  
  const handleDeleteEvent = async (eventId: string) => {
    const eventToDelete = events.find(e => e.id === eventId);
    if (eventToDelete?.hostId && currentUser && eventToDelete.hostId !== currentUser.id) {
        showNotification("You can only delete events you hosted.", true);
        return;
    }

    if(window.confirm(`Are you sure you want to delete "${eventToDelete?.title || 'this event'}"?`)){
        if (isActionLoading) {
            console.warn("handleDeleteEvent: An action is already in progress. Ignoring subsequent call.");
            return;
        }
        setIsActionLoading(true);
        setApiError(null);
        try {
            await apiService.deleteEvent(eventId);
            setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
            showNotification(`Event "${eventToDelete?.title || 'this event'}" deleted.`);
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to delete event.';
            setApiError(errorMessage);
            showNotification(errorMessage, true);
        } finally {
            setIsActionLoading(false);
        }
    }
  };

  const navigate = (page: Page) => {
    if (page === 'createEvent' && !currentUser) {
        showNotification("Please log in to create an event."); 
        setCurrentPage('login');
        return;
    }
    if ((page === 'login' || page === 'signup') && currentUser) {
      setCurrentPage('dashboard');
      return;
    }
    setEditingEvent(null); 
    setApiError(null); 
    // setSearchQuery(''); // Optionally clear search when navigating, or persist it
    setCurrentPage(page);
  }

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  const filterEventsBySearch = useCallback((eventsToFilter: Event[]): Event[] => {
    if (!searchQuery.trim()) {
      return eventsToFilter;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return eventsToFilter.filter(event =>
      event.title.toLowerCase().includes(lowerCaseQuery) ||
      event.description.toLowerCase().includes(lowerCaseQuery) ||
      event.location.toLowerCase().includes(lowerCaseQuery) ||
      event.category.toLowerCase().includes(lowerCaseQuery)
    );
  }, [searchQuery]);


  const upcomingEvents = filterEventsBySearch(events.filter(event => new Date(event.date) >= new Date()).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  const pastEvents = filterEventsBySearch(events.filter(event => new Date(event.date) < new Date()).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  
  // For dashboard/profile page - these should not be affected by global search query
  const userHostedEvents = currentUser ? events.filter(event => event.hostId === currentUser.id) : [];
  const userBookedEvents = currentUser ? events.filter(event => event.bookedBy?.some(attendee => attendee.id === currentUser!.id)) : [];
  
  // For public events page - this *should* be affected by global search
  const publicEventsToDisplay = filterEventsBySearch(events.filter(event => event.isPublic));

  const renderPage = () => {
    if (isLoadingApp) return <LoadingSpinner message="Loading EventHub..." size="lg"/>;
    if (apiError && (currentPage === 'dashboard' || currentPage === 'publicEvents')) { 
        return <div className="text-center py-10">
            <p className="text-red-500 bg-red-100 p-4 rounded-md">{apiError}</p>
            <button onClick={loadInitialData} className="mt-4 px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600">Try Again</button>
        </div>;
    }

    const noResultsMessage = searchQuery.trim() !== '' ? <p className="text-slate-500 text-center py-4">No events found matching your search for "{searchQuery}".</p> : null;

    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {currentUser && !searchQuery.trim() && ( 
                <div className="p-6 bg-sky-500 text-white rounded-lg shadow-md">
                    <h2 className="text-3xl font-semibold">Welcome back, {currentUser.name}!</h2>
                    <p className="mt-2 text-sky-100">Ready to plan your next amazing event?</p>
                </div>
            )}
            {searchQuery.trim() && (
                 <p className="text-slate-600 text-lg">Search results for: <span className="font-semibold">"{searchQuery}"</span></p>
            )}
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center">{CalendarIcon} Upcoming Events</h2>
              {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map(event => <EventCard key={event.id} event={event} onViewDetails={handleViewDetails} onBookTicket={handleBookTicket} isHost={event.hostId === currentUser?.id} onEdit={handleEditEvent} onDelete={handleDeleteEvent} />)}
                </div>
              ) : (searchQuery.trim() ? noResultsMessage : <p className="text-slate-500">No upcoming events. Why not create one?</p>)}
            </div>
            {currentUser && (
                 <div>
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center"><i className="fas fa-user-tie mr-2"></i> Your Hosted Events (on main dashboard)</h2>
                    {userHostedEvents.length > 0 ? ( // Use userHostedEvents for the dashboard section
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userHostedEvents.map(event => <EventCard key={event.id} event={event} onViewDetails={handleViewDetails} isHost={true} onEdit={handleEditEvent} onDelete={handleDeleteEvent}/>)}
                        </div>
                    ): (searchQuery.trim() && !upcomingEvents.length ? null : (searchQuery.trim() ? noResultsMessage : <p className="text-slate-500">You haven't hosted any events yet.</p>))}
                </div>
            )}
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">Past Events</h2>
              {pastEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map(event => <EventCard key={event.id} event={event} onViewDetails={handleViewDetails} isHost={event.hostId === currentUser?.id} onEdit={handleEditEvent} onDelete={handleDeleteEvent} />)}
                </div>
              ) : (searchQuery.trim() && !upcomingEvents.length && (!currentUser || !userHostedEvents.length) ? null : (searchQuery.trim() ? noResultsMessage :<p className="text-slate-500">No past events found.</p>))}
            </div>
          </div>
        );
      case 'createEvent':
        return <EventForm onSubmit={handleCreateOrUpdateEvent} initialData={editingEvent} onCancel={() => { setEditingEvent(null); setCurrentPage('dashboard');}} />;
      case 'aiRecommendations':
        return <AiRecommender />;
      case 'publicEvents':
        return (
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center"><i className="fas fa-globe-americas mr-2"></i> Discover Public Events</h2>
              {searchQuery.trim() && (
                 <p className="text-slate-600 text-lg mb-4">Search results for: <span className="font-semibold">"{searchQuery}"</span></p>
              )}
              {publicEventsToDisplay.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publicEventsToDisplay.map(event => <EventCard key={event.id} event={event} onViewDetails={handleViewDetails} onBookTicket={handleBookTicket} />)}
                </div>
              ) : (searchQuery.trim() ? noResultsMessage : <p className="text-slate-500">No public events available at the moment.</p>)}
            </div>
        );
      case 'profile': // This is now the "My Dashboard"
        if (!currentUser) {
            navigate('login'); 
            return <LoadingSpinner message="Redirecting to login..."/>;
        }
        return (
            <div className="space-y-10">
                <div className="p-6 md:p-8 bg-white rounded-lg shadow-xl text-center">
                    <img src={GENERIC_USER_AVATAR_URL} alt="User Avatar" className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-4 border-4 border-sky-500 shadow-md"/>
                    <h2 className="text-2xl md:text-3xl font-semibold text-sky-700">{currentUser.name}</h2>
                    <p className="text-slate-600 md:text-lg">{currentUser.email}</p>
                    <button onClick={handleLogout} className="mt-6 w-full sm:w-auto bg-amber-500 text-white px-6 py-2 rounded-md hover:bg-amber-600 transition-colors text-sm font-medium">
                        Logout
                    </button>
                </div>

                <div className="p-6 md:p-8 bg-white rounded-lg shadow-xl">
                    <h3 className="text-xl md:text-2xl font-semibold text-slate-800 mb-6 flex items-center">
                        <i className="fas fa-calendar-check mr-3 text-sky-600"></i> Events I've Booked ({userBookedEvents.length})
                    </h3>
                    {userBookedEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userBookedEvents.map(event => (
                            <EventCard 
                                key={`booked-${event.id}`} 
                                event={event} 
                                onViewDetails={handleViewDetails} 
                                // No onBookTicket prop, so button won't show
                                // No edit/delete for booked events unless they are also the host
                                isHost={event.hostId === currentUser.id} 
                                onEdit={event.hostId === currentUser.id ? handleEditEvent : undefined}
                                onDelete={event.hostId === currentUser.id ? handleDeleteEvent : undefined}
                            />
                        ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 italic">You haven't booked any events yet. Explore public events or wait for an invitation!</p>
                    )}
                </div>
                
                <div className="p-6 md:p-8 bg-white rounded-lg shadow-xl">
                     <h3 className="text-xl md:text-2xl font-semibold text-slate-800 mb-6 flex items-center">
                        <i className="fas fa-user-tie mr-3 text-sky-600"></i> My Hosted Events ({userHostedEvents.length})
                    </h3>
                    {userHostedEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userHostedEvents.map(event => (
                            <EventCard 
                                key={`hosted-${event.id}`} 
                                event={event} 
                                onViewDetails={handleViewDetails} 
                                isHost={true} 
                                onEdit={handleEditEvent} 
                                onDelete={handleDeleteEvent}
                            />
                        ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 italic">You haven't hosted any events yet. Time to create your next big thing!</p>
                    )}
                </div>
            </div>
        );
      case 'login':
        return <LoginView onLogin={handleLogin} isLoading={isActionLoading} apiError={apiError} onNavigateToSignup={() => navigate('signup')}/>;
      case 'signup':
        return <SignupView onSignup={handleSignup} isLoading={isActionLoading} apiError={apiError} onNavigateToLogin={() => navigate('login')}/>;
      default:
        return <p>Page not found.</p>;
    }
  };

  const currentUserTicketCountForSelectedEvent = useCallback(() => {
    if (!currentUser || !selectedEvent || !selectedEvent.bookedBy) {
      return 0;
    }
    return selectedEvent.bookedBy.filter(attendee => attendee.id === currentUser.id).length;
  }, [currentUser, selectedEvent]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        currentPage={currentPage} 
        onNavigate={navigate} 
        currentUser={currentUser} 
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={handleSearchQueryChange}
      />
      
      {notification && (
        <div className={`fixed top-20 right-5 ${notification.toLowerCase().includes('error') || notification.toLowerCase().includes('fail') || notification.toLowerCase().includes('sorry') || notification.toLowerCase().includes('invalid') || notification.toLowerCase().includes('limit reached') ? 'bg-red-500' : 'bg-green-500'} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out`}>
          {notification}
        </div>
      )}
      <style>{`
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(-20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out forwards;
        }
      `}</style>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {isActionLoading && currentPage !== 'login' && currentPage !== 'signup' && <LoadingSpinner message="Processing..."/>}
        {renderPage()}
      </main>

      {selectedEvent && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedEvent.title} size="lg">
          <img className="w-full h-64 object-cover rounded-md mb-4" src={selectedEvent.imageUrl || `https://picsum.photos/seed/${selectedEvent.id}/600/300`} alt={selectedEvent.title} />
          <p className="text-sm text-slate-500 mb-1 bg-sky-100 text-sky-700 px-2 py-1 rounded-full inline-block self-start font-medium">{selectedEvent.category}</p>
          <div className="my-3 space-y-1 text-slate-700">
            <p><strong className="font-medium">Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()} at {selectedEvent.time}</p>
            <p><strong className="font-medium">Location:</strong> {selectedEvent.location}</p>
            <p><strong className="font-medium">Description:</strong> {selectedEvent.description}</p>
            <p><strong className="font-medium">Capacity:</strong> {selectedEvent.attendees} / {selectedEvent.capacity}</p>
            <p><strong className="font-medium">Price:</strong> {selectedEvent.price !== undefined ? (selectedEvent.price > 0 ? `$${selectedEvent.price.toFixed(2)}` : 'Free') : 'N/A'}</p>
          </div>

          {currentUser && selectedEvent.hostId === currentUser.id && (
            <div className="mt-4 pt-3 border-t">
              <h4 className="text-md font-semibold text-slate-800 mb-2">Attendees ({selectedEvent.bookedBy?.length || 0} / {selectedEvent.attendees}):</h4>
              {selectedEvent.bookedBy && selectedEvent.bookedBy.length > 0 ? (
                <ul className="list-disc list-inside ml-4 text-sm text-slate-600 max-h-40 overflow-y-auto bg-slate-50 p-3 rounded-md">
                  {selectedEvent.bookedBy.map((attendee: AttendeeInfo) => (
                    <li key={attendee.id + Math.random()}>{attendee.name}</li> 
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">No specific attendee data available or no one has booked yet.</p>
              )}
               { (selectedEvent.bookedBy?.length || 0) !== selectedEvent.attendees &&
                  <p className="text-xs text-amber-600 mt-1">Note: Attendee count ({selectedEvent.attendees}) and detailed list count ({(selectedEvent.bookedBy?.length || 0)}) may differ if not all attendee details are available.</p>
               }
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">Close</button>
            {selectedEvent.hostId !== currentUser?.id && (
                 <button 
                 onClick={() => {
                     handleBookTicket(selectedEvent.id);
                 }}
                 className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-md hover:bg-amber-600 disabled:bg-slate-400 disabled:cursor-not-allowed"
                 disabled={
                    isActionLoading || 
                    selectedEvent.attendees >= selectedEvent.capacity ||
                    (currentUser && currentUserTicketCountForSelectedEvent() >= MAX_TICKETS_PER_USER_PER_EVENT)
                 }
                 >
                 {isActionLoading && selectedEvent.id === selectedEvent.id ? 'Booking...' : 
                    (selectedEvent.attendees >= selectedEvent.capacity ? "Sold Out" : 
                    (currentUser && currentUserTicketCountForSelectedEvent() >= MAX_TICKETS_PER_USER_PER_EVENT ? "Limit Reached" : "Book Ticket"))
                 }
             </button>
            )}
          </div>
        </Modal>
      )}
      <Footer />
    </div>
  );
};


interface LoginViewProps {
  onLogin: (email: string, pass: string) => void;
  isLoading: boolean;
  apiError: string | null;
  onNavigateToSignup: () => void;
}
const LoginView: React.FC<LoginViewProps> = ({ onLogin, isLoading, apiError, onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
        alert("Please enter both email and password.");
        return;
    }
    onLogin(email, password);
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-center text-sky-700 mb-6">Login</h2>
      {apiError && <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">{apiError}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
          <input 
            type="email" 
            id="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            autoComplete="email"
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            aria-describedby={apiError ? "login-error" : undefined}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
          <input 
            type="password" 
            id="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            autoComplete="current-password"
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            aria-describedby={apiError ? "login-error" : undefined}
          />
        </div>
        {apiError && <p id="login-error" className="sr-only">{apiError}</p>}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : 'Login'}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-600 text-center">
        Don't have an account?{' '}
        <button onClick={onNavigateToSignup} className="font-medium text-sky-600 hover:text-sky-500 hover:underline">
          Sign Up
        </button>
      </p>
    </div>
  );
};

interface SignupViewProps {
  onSignup: (name: string, email: string, pass: string) => void;
  isLoading: boolean;
  apiError: string | null;
  onNavigateToLogin: () => void;
}
const SignupView: React.FC<SignupViewProps> = ({ onSignup, isLoading, apiError, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
        alert("Please fill in all fields: name, email, and password.");
        return;
    }
    if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }
    onSignup(name, email, password);
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-center text-sky-700 mb-6">Create Account</h2>
      {apiError && <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">{apiError}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="signup-name" className="block text-sm font-medium text-slate-700">Full Name</label>
          <input 
            type="text" 
            id="signup-name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            autoComplete="name"
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700">Email Address</label>
          <input 
            type="email" 
            id="signup-email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            autoComplete="email"
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            aria-describedby={apiError ? "signup-error" : undefined}
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700">Password</label>
          <input 
            type="password" 
            id="signup-password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            autoComplete="new-password"
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            aria-describedby={apiError ? "signup-error" : undefined}
            aria-label="Password (min. 6 characters)"
          />
           <p className="mt-1 text-xs text-slate-500">Minimum 6 characters.</p>
        </div>
        {apiError && <p id="signup-error" className="sr-only">{apiError}</p>}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : 'Sign Up'}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-600 text-center">
        Already have an account?{' '}
        <button onClick={onNavigateToLogin} className="font-medium text-sky-600 hover:text-sky-500 hover:underline">
          Log In
        </button>
      </p>
    </div>
  );
};

const Footer: React.FC = () => {
    return (
      <footer className="bg-slate-800 text-slate-300 py-8 text-center mt-auto">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} {AppName}. All rights reserved.</p>
          <p className="text-sm mt-1">Your ultimate event planning companion.</p>
        </div>
      </footer>
    );
  };

export default App;
