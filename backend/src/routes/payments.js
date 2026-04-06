import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/database.js';

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
});

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

// Create Razorpay order
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { amount, bookingId } = req.body;

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      notes: {
        bookingId,
        userId: req.userId
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating payment order' });
  }
});

// Verify payment
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
      .update(sign)
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Update booking status
      const db = getDb();
      db.prepare(`
        UPDATE bookings 
        SET payment_status = 'completed', payment_id = ?, booking_status = 'confirmed'
        WHERE id = ?
      `).run(razorpay_payment_id, bookingId);

      res.json({ 
        success: true, 
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
});

// Get Razorpay key (public)
router.get('/key', (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder' });
});

export default router;
