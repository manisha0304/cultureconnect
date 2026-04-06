import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent, getEventManagers, createBooking } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Booking() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    eventDate: '',
    venue: '',
    guestCount: '',
    eventManagerId: '',
    specialRequests: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/booking/${eventId}` } });
      return;
    }
    fetchEventDetails();
  }, [eventId, user]);

  const fetchEventDetails = async () => {
    try {
      const [eventRes, managersRes] = await Promise.all([
        getEvent(eventId),
        getEventManagers(eventId)
      ]);
      setEvent(eventRes.data.event);
      setManagers(managersRes.data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTotal = () => {
    const basePrice = 5000;
    const guestCount = parseInt(formData.guestCount) || 0;
    const perGuestPrice = 500;
    return basePrice + (guestCount * perGuestPrice);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const bookingData = {
        eventId,
        eventDate: formData.eventDate,
        venue: formData.venue,
        guestCount: parseInt(formData.guestCount),
        eventManagerId: formData.eventManagerId || null,
        specialRequests: formData.specialRequests,
        totalAmount: calculateTotal()
      };

      const response = await createBooking(bookingData);
      navigate(`/payment/${response.data.booking.id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Event not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Book Your Event</h1>
          <p className="text-gray-600">Complete the form below to book {event.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Details</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue / Location *
                  </label>
                  <input
                    type="text"
                    name="venue"
                    required
                    value={formData.venue}
                    onChange={handleChange}
                    placeholder="Enter venue address or location"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests *
                  </label>
                  <input
                    type="number"
                    name="guestCount"
                    required
                    min="1"
                    value={formData.guestCount}
                    onChange={handleChange}
                    placeholder="Expected number of guests"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Event Manager (Optional)
                  </label>
                  <select
                    name="eventManagerId"
                    value={formData.eventManagerId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Choose an event manager</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name} - {manager.location} (Rating: {manager.rating})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    name="specialRequests"
                    rows="4"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    placeholder="Any special requirements or requests..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Continue to Payment'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="flex items-center gap-4 pb-4 border-b">
                <img
                  src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200'}
                  alt={event.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{event.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{event.category}</p>
                </div>
              </div>

              <div className="py-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Base Price</span>
                  <span>₹5,000</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Per Guest ({formData.guestCount || 0})</span>
                  <span>₹{((parseInt(formData.guestCount) || 0) * 500).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Service Fee</span>
                  <span>Included</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{calculateTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-500">
                * Final amount may vary based on additional services
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
