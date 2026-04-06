import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function BookingHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/my-bookings' } });
      return;
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const response = await getMyBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await cancelBooking(bookingId);
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.booking_status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
            <p className="text-gray-600">View and manage your event bookings</p>
          </div>
          <Link
            to="/"
            className="mt-4 md:mt-0 inline-flex items-center bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Book New Event
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'confirmed', 'pending', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  filter === status
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Bookings' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't made any bookings yet."
                : `No ${filter} bookings found.`}
            </p>
            <Link
              to="/"
              className="inline-block bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 h-32 md:h-auto">
                    <img
                      src={booking.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400'}
                      alt={booking.event_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{booking.event_name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(booking.booking_status)}`}>
                            {booking.booking_status}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(booking.event_date).toLocaleDateString('en-IN', { 
                              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                            })}
                          </p>
                          <p className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {booking.venue}
                          </p>
                          <p className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {booking.guest_count} Guests
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 md:text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          ₹{booking.total_amount?.toLocaleString('en-IN')}
                        </div>
                        <div className={`text-sm ${booking.payment_status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                          Payment: {booking.payment_status}
                        </div>
                      </div>
                    </div>

                    {booking.manager_name && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Event Manager:</span> {booking.manager_name} ({booking.manager_phone})
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        to={`/event/${booking.event_id}`}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        View Event
                      </Link>
                      {booking.booking_status === 'pending' && (
                        <>
                          <Link
                            to={`/payment/${booking.id}`}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                          >
                            Complete Payment
                          </Link>
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                          >
                            Cancel Booking
                          </button>
                        </>
                      )}
                      {booking.booking_status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
