import { User, Event } from '../types';

const BASE_URL = '/api'; // This would ideally be an environment variable

interface AuthResponse {
  token: string;
  user: User;
}

const getAuthToken = (): string | null => localStorage.getItem('eventhub_token');

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}: ${response.statusText}` }));
    throw new Error(errorData.message || `An unexpected error occurred (Status: ${response.status})`);
  }
  return response.json() as Promise<T>;
};

const apiRequest = async <T>(url: string, method: string, body?: unknown, needsAuth = false): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (needsAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Optionally handle missing token for authenticated requests differently, e.g., redirect to login
      console.warn('Attempted authenticated request without a token.');
    }
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${url}`, config);
  return handleResponse<T>(response);
};

// Authentication
export const loginUser = (credentials: { email: string, password?: string /* Backend handles missing pass for demo */ }): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>('/auth/login', 'POST', credentials);
};

export const signupUser = (userData: { name: string, email: string, password?: string }): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>('/auth/signup', 'POST', userData);
};

export const getCurrentUser = (): Promise<User> => {
  return apiRequest<User>('/users/me', 'GET', undefined, true);
};

// Events
export const getEvents = (): Promise<Event[]> => {
  return apiRequest<Event[]>('/events', 'GET');
};

export const getEventById = (eventId: string): Promise<Event> => {
  return apiRequest<Event>(`/events/${eventId}`, 'GET');
};

export const createEvent = (eventData: Omit<Event, 'id' | 'attendees' | 'hostId'>): Promise<Event> => {
  // hostId will be set by backend based on authenticated user
  return apiRequest<Event>('/events', 'POST', eventData, true);
};

export const updateEvent = (eventId: string, eventData: Partial<Omit<Event, 'id' | 'attendees' | 'hostId'>>): Promise<Event> => {
  return apiRequest<Event>(`/events/${eventId}`, 'PUT', eventData, true);
};

export const deleteEvent = (eventId: string): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(`/events/${eventId}`, 'DELETE', undefined, true);
};

// Ticket Booking
export const bookTicket = (eventId: string): Promise<Event> => { // Assuming backend returns updated event
  return apiRequest<Event>(`/events/${eventId}/book`, 'POST', undefined, true);
};
