
const express = require('express');
const {
  getAllEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  bookEvent,
} = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(getAllEvents) // Public
  .post(authMiddleware, createEvent); // Private

router.route('/:eventId')
  .get(getEventById) // Public
  .put(authMiddleware, updateEvent) // Private
  .delete(authMiddleware, deleteEvent); // Private

router.post('/:eventId/book', authMiddleware, bookEvent); // Private

module.exports = router;
