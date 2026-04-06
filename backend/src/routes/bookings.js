import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/database.js';
import { sendBookingConfirmation } from '../utils/email.js';

const router = express.Router();

// Middleware to verify token
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Create booking
router.post('/', authenticate, async (req, res) => {
  try {
    const { eventId, eventManagerId, eventDate, venue, guestCount, specialRequests, totalAmount } = req.body;
    const db = getDb();
    const bookingId = uuidv4();

    db.prepare(`
      INSERT INTO bookings (id, user_id, event_id, event_manager_id, event_date, venue, guest_count, special_requests, total_amount, booking_status, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')
    `).run(bookingId, req.userId, eventId, eventManagerId || null, eventDate, venue, guestCount, specialRequests, totalAmount);

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);

    res.status(201).json({ 
      message: 'Booking created successfully',
      booking 
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

// Get user bookings (history)
router.get('/my-bookings', authenticate, (req, res) => {
  try {
    const db = getDb();
    const bookings = db.prepare(`
      SELECT b.*, e.name as event_name, e.image_url, e.category,
             em.name as manager_name, em.phone as manager_phone
      FROM bookings b
      LEFT JOIN events e ON b.event_id = e.id
      LEFT JOIN event_managers em ON b.event_manager_id = em.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `).all(req.userId);

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Get single booking
router.get('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();
    const booking = db.prepare(`
      SELECT b.*, e.name as event_name, e.image_url, e.category, e.description,
             em.name as manager_name, em.phone as manager_phone, em.email as manager_email
      FROM bookings b
      LEFT JOIN events e ON b.event_id = e.id
      LEFT JOIN event_managers em ON b.event_manager_id = em.id
      WHERE b.id = ? AND b.user_id = ?
    `).get(req.params.id, req.userId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Error fetching booking' });
  }
});

// Update booking status (after payment)
router.patch('/:id/confirm', authenticate, async (req, res) => {
  try {
    const { paymentId } = req.body;
    const db = getDb();

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    db.prepare(`
      UPDATE bookings 
      SET booking_status = 'confirmed', payment_status = 'completed', payment_id = ?
      WHERE id = ?
    `).run(paymentId, req.params.id);

    // Get user email for confirmation
    const user = db.prepare('SELECT email, name FROM users WHERE id = ?').get(req.userId);
    const event = db.prepare('SELECT name FROM events WHERE id = ?').get(booking.event_id);

    // Send confirmation email
    await sendBookingConfirmation(user.email, user.name, {
      bookingId: req.params.id,
      eventName: event.name,
      eventDate: booking.event_date,
      venue: booking.venue,
      amount: booking.total_amount
    });

    res.json({ message: 'Booking confirmed successfully' });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ message: 'Error confirming booking' });
  }
});

// Cancel booking
router.patch('/:id/cancel', authenticate, (req, res) => {
  try {
    const db = getDb();
    
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    db.prepare(`
      UPDATE bookings SET booking_status = 'cancelled' WHERE id = ?
    `).run(req.params.id);

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

export default router;
