import express from 'express';
import { getDb } from '../config/database.js';

const router = express.Router();

// Get all events
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { category, state, region, search } = req.query;
    
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (state && state !== 'All India') {
      query += ' AND (state = ? OR state = "All India")';
      params.push(state);
    }
    if (region) {
      query += ' AND (region = ? OR region = "Pan India")';
      params.push(region);
    }
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const events = db.prepare(query).all(...params);
    
    // Parse dress_suggestions JSON
    const parsedEvents = events.map(event => ({
      ...event,
      dress_suggestions: event.dress_suggestions ? JSON.parse(event.dress_suggestions) : []
    }));

    res.json(parsedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Get event categories
router.get('/categories', (req, res) => {
  const categories = [
    { id: 'festival', name: 'Festivals', icon: '🎉', description: 'Traditional and cultural festivals' },
    { id: 'wedding', name: 'Weddings', icon: '💒', description: 'Wedding ceremonies and celebrations' },
    { id: 'birthday', name: 'Birthdays', icon: '🎂', description: 'Birthday parties and celebrations' },
    { id: 'college', name: 'College Events', icon: '🎓', description: 'College fests and gatherings' },
    { id: 'school', name: 'School Events', icon: '📚', description: 'School functions and annual days' },
    { id: 'corporate', name: 'Corporate Events', icon: '💼', description: 'Business meetings and conferences' }
  ];
  res.json(categories);
});

// Get Indian states
router.get('/states', (req, res) => {
  const states = [
    'All India', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 
    'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
  ];
  res.json(states);
});

// Get regions
router.get('/regions', (req, res) => {
  const regions = [
    { id: 'pan-india', name: 'Pan India' },
    { id: 'north', name: 'North India' },
    { id: 'south', name: 'South India' },
    { id: 'east', name: 'East India' },
    { id: 'west', name: 'West India' },
    { id: 'northeast', name: 'Northeast India' },
    { id: 'central', name: 'Central India' }
  ];
  res.json(regions);
});

// Get single event
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Parse dress_suggestions
    event.dress_suggestions = event.dress_suggestions ? JSON.parse(event.dress_suggestions) : [];

    // Get related event managers
    const managers = db.prepare(
      'SELECT * FROM event_managers WHERE event_category = ? ORDER BY rating DESC LIMIT 5'
    ).all(event.category);

    res.json({ event, managers });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event' });
  }
});

// Get event managers by category
router.get('/:id/managers', (req, res) => {
  try {
    const db = getDb();
    const event = db.prepare('SELECT category FROM events WHERE id = ?').get(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const managers = db.prepare(
      'SELECT * FROM event_managers WHERE event_category = ? ORDER BY rating DESC'
    ).all(event.category);

    res.json(managers);
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(500).json({ message: 'Error fetching managers' });
  }
});

export default router;
