const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  time: {
    type: String, // e.g., "18:00"
    required: [true, 'Time is required'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
    default: null,
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attendees: {
    type: Number,
    default: 0,
    min: [0, 'Attendees cannot be negative'],
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative'],
  },
  bookedBy: [{ // Array to store ObjectIds of users who booked
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to update `updatedAt` field
EventSchema.pre('save', function (next) {
  if (this.isModified()) { // Only update if actual fields are modified, not just on every save call
    this.updatedAt = Date.now();
  }
  next();
});

// Transform _id to id and remove __v for JSON output
EventSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // Optionally hide bookedBy from general event listings if sensitive
    // delete returnedObject.bookedBy; 
  }
});

const Event = mongoose.model('Event', EventSchema);
module.exports = Event;