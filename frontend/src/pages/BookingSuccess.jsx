import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBooking } from '../utils/api';

export default function BookingSuccess() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await getBooking(bookingId);
      setBooking(response.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-8">
            Your event booking has been successfully confirmed. A confirmation email has been sent to your registered email address.
          </p>

          {booking && (
            <div className="bg-gray-50 rounded-xl p-6 text-left mb-8">
              <h2 className="font-semibold text-gray-900 mb-4">Booking Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID</span>
                  <span className="font-medium text-gray-900">{booking.id?.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Event</span>
                  <span className="font-medium text-gray-900">{booking.event_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(booking.event_date).toLocaleDateString('en-IN', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Venue</span>
                  <span className="font-medium text-gray-900">{booking.venue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-medium text-gray-900">{booking.guest_count}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-gray-600">Total Paid</span>
                  <span className="font-bold text-xl text-primary-600">
                    ₹{booking.total_amount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Event Manager Info */}
          {booking?.manager_name && (
            <div className="bg-blue-50 rounded-xl p-6 text-left mb-8">
              <h2 className="font-semibold text-gray-900 mb-3">Your Event Manager</h2>
              <p className="text-gray-700 font-medium">{booking.manager_name}</p>
              <p className="text-gray-600">{booking.manager_phone}</p>
              {booking.manager_email && (
                <p className="text-gray-600">{booking.manager_email}</p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/my-bookings"
              className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              View My Bookings
            </Link>
            <Link
              to="/"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Back to Home
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Need help? Contact us at support@cultureconnect.in or call +91 1800-123-4567
          </p>
        </div>
      </div>
    </div>
  );
}
