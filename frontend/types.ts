
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AttendeeInfo {
  id: string;
  name: string;
  // email?: string; // Optional: include if backend provides and host needs it
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string; // e.g., 'Birthday Party', 'Conference', 'Workshop'
  imageUrl?: string;
  hostId?: string; 
  attendees: number;
  capacity: number;
  isPublic: boolean;
  price?: number; // Optional price for tickets
  bookedBy?: AttendeeInfo[]; // List of users who booked
}

export type Page = 'dashboard' | 'createEvent' | 'aiRecommendations' | 'publicEvents' | 'profile' | 'login' | 'signup' | 'eventDetails';

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  // Other types of chunks can be added here if needed
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  // Other grounding metadata fields
}