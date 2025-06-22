const Event = require('../models/Event');
const User = require('../models/User'); // Import User model
const mongoose = require('mongoose');
const { sendEmail } = require('../utils/emailService'); // Import email service

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getAllEvents = async (req, res, next) => {
  try {
    // Sort by date, upcoming events first, then by creation date for same-day events
    const events = await Event.find({}).sort({ date: 1, createdAt: -1 });
    res.status(200).json(events); // Mongoose toJSON transform handles 'id'
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res, next) => {
  const { title, date, time, location, description, category, imageUrl, capacity, isPublic, price } = req.body;
  
  try {
    if (!title || !date || !time || !location || !description || !category || capacity === undefined) {
        res.status(400);
        throw new Error('Missing required event fields: title, date, time, location, description, category, capacity');
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        res.status(400);
        throw new Error('Invalid date format. Please use YYYY-MM-DD.');
    }

    const host = await User.findById(req.user.id);
    if (!host) {
        res.status(404);
        throw new Error('Host user not found.');
    }

    const eventData = {
      title,
      date: parsedDate,
      time,
      location,
      description,
      category,
      imageUrl: imageUrl || null,
      capacity: Number(capacity),
      isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
      price: price !== undefined ? Number(price) : 0,
      hostId: req.user.id, 
      attendees: 0,
      bookedBy: [],
    };

    const event = await Event.create(eventData);
    
    // Send confirmation email to host
    if (host.email) {
      const subject = 'Your Event has been Created!';
      const html = `
        <h1>Event Created Successfully!</h1>
        <p>Dear ${host.name || 'User'},</p>
        <p>Your event "<strong>${event.title}</strong>" has been successfully created and is now listed on EventHub.</p>
        <p>Details:</p>
        <ul>
          <li>Date: ${event.date.toLocaleDateString()}</li>
          <li>Time: ${event.time}</li>
          <li>Location: ${event.location}</li>
        </ul>
        <p>Thank you for using EventHub!</p>
      `;
      sendEmail(host.email, subject, html).catch(err => console.error("Failed to send event creation email:", err)); // Log email error but don't fail request
    }

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single event by ID
// @route   GET /api/events/:eventId
// @access  Public
exports.getEventById = async (req, res, next) => {
  const { eventId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400);
      throw new Error('Invalid event ID format');
    }

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:eventId
// @access  Private
exports.updateEvent = async (req, res, next) => {
  const { eventId } = req.params;
  const updates = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400);
      throw new Error('Invalid event ID format');
    }

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    if (event.hostId.toString() !== req.user.id) {
      res.status(403);
      throw new Error('You are not authorized to update this event');
    }

    if (updates.date) {
      const parsedDate = new Date(updates.date);
      if (isNaN(parsedDate.getTime())) {
          res.status(400);
          throw new Error('Invalid date format. Please use YYYY-MM-DD.');
      }
      updates.date = parsedDate;
    }
    
    Object.keys(updates).forEach(key => {
      if (key !== 'hostId' && key !== 'attendees' && key !== 'createdAt' && key !== 'bookedBy') {
        event[key] = updates[key];
      }
    });
    // Mongoose pre-save hook will handle updatedAt

    const updatedEvent = await event.save();
    res.status(200).json(updatedEvent);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:eventId
// @access  Private
exports.deleteEvent = async (req, res, next) => {
  const { eventId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400);
      throw new Error('Invalid event ID format');
    }

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    if (event.hostId.toString() !== req.user.id) {
      res.status(403);
      throw new Error('You are not authorized to delete this event');
    }

    await Event.findByIdAndDelete(eventId);
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Book a ticket for an event
// @route   POST /api/events/:eventId/book
// @access  Private
exports.bookEvent = async (req, res, next) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400);
      throw new Error('Invalid event ID format');
    }

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    if (event.hostId.toString() === userId) {
      res.status(400);
      throw new Error('Hosts cannot book their own events.');
    }
    
    // if (event.bookedBy.includes(userId)) {
    //   res.status(400);
    //   throw new Error('You have already booked a ticket for this event.');
    // }

    if (event.attendees >= event.capacity) {
      res.status(400);
      throw new Error('Event is sold out. Capacity reached.');
    }

    const bookingUser = await User.findById(userId);
    if (!bookingUser) {
        res.status(404);
        throw new Error('Booking user not found.');
    }

    event.attendees += 1;
    event.bookedBy.push(userId);
    const updatedEvent = await event.save();

    // Send confirmation email to booker
    if (bookingUser.email) {
      // Count total distinct events booked by this user
      const totalBookedEventsCount = await Event.countDocuments({ bookedBy: userId });

      const subject = 'Event Booking Confirmation!';
      const html = `
        <h1>Booking Confirmed!</h1>
        <p>Dear ${bookingUser.name || 'User'},</p>
        <p>You have successfully booked a ticket for the event: "<strong>${event.title}</strong>".</p>
        <p>Event Details:</p>
        <ul>
          <li>Date: ${event.date.toLocaleDateString()}</li>
          <li>Time: ${event.time}</li>
          <li>Location: ${event.location}</li>
        </ul>
        <p>You have now made bookings for a total of <strong>${totalBookedEventsCount}</strong> event(s) on EventHub.</p>
        <p>Thank you for using EventHub!</p>
      `;
      sendEmail(bookingUser.email, subject, html).catch(err => console.error("Failed to send booking confirmation email:", err));
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    next(error);
  }
};