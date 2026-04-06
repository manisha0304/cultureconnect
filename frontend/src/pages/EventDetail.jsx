import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEvent } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await getEvent(id);
      setEvent(response.data.event);
      setManagers(response.data.managers);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      navigate('/login', { state: { from: `/booking/${id}` } });
    } else {
      navigate(`/booking/${id}`);
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
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <Link to="/" className="text-primary-600 hover:underline">Go back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[400px] lg:h-[500px]">
        <img
          src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200'}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-16">
          <div className="max-w-7xl mx-auto">
            <span className="inline-block bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium capitalize mb-4">
              {event.category}
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
              {event.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event.state}, {event.region}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="flex border-b">
                {['about', 'history', 'dress', 'hotels', 'shopping'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 px-4 text-center font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {tab === 'about' && 'About'}
                    {tab === 'history' && 'History'}
                    {tab === 'dress' && 'Dress Code'}
                    {tab === 'hotels' && 'Hotels'}
                    {tab === 'shopping' && 'Shopping'}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'about' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">About This Event</h3>
                    <p className="text-gray-600 leading-relaxed">{event.description}</p>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Historical Background</h3>
                    <p className="text-gray-600 leading-relaxed">{event.history || 'History information coming soon.'}</p>
                  </div>
                )}

                {activeTab === 'dress' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Dress Suggestions</h3>
                    {event.dress_suggestions && event.dress_suggestions.length > 0 ? (
                      <ul className="space-y-3">
                        {event.dress_suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-600">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No specific dress code suggestions available.</p>
                    )}
                  </div>
                )}

                {activeTab === 'hotels' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Nearby Hotels</h3>
                    <p className="text-gray-600 mb-4">Find accommodation near your event location:</p>
                    <div className="grid gap-4">
                      <a
                        href={`https://www.google.com/maps/search/hotels+near+${encodeURIComponent(event.state + ' India')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Google Maps</h4>
                            <p className="text-sm text-gray-600">Find hotels on Google Maps</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                      <a
                        href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(event.state + ', India')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                            <span className="text-blue-600 font-bold">B</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Booking.com</h4>
                            <p className="text-sm text-gray-600">Browse and book hotels</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                      <a
                        href={`https://www.makemytrip.com/hotels/hotels-in-${encodeURIComponent(event.state.toLowerCase().replace(/\s+/g, '-'))}.html`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                            <span className="text-red-600 font-bold">MMT</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">MakeMyTrip</h4>
                            <p className="text-sm text-gray-600">Indian hotel booking platform</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}

                {activeTab === 'shopping' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Shop for This Event</h3>
                    <p className="text-gray-600 mb-4">Get the perfect attire and accessories:</p>
                    <div className="grid gap-4">
                      <a
                        href={`https://www.amazon.in/s?k=${encodeURIComponent(event.name + ' dress')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                            <span className="text-yellow-600 font-bold text-lg">a</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Amazon India</h4>
                            <p className="text-sm text-gray-600">Shop traditional and modern wear</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                      <a
                        href={`https://www.myntra.com/${encodeURIComponent(event.category)}-wear`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mr-4">
                            <span className="text-pink-600 font-bold">M</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Myntra</h4>
                            <p className="text-sm text-gray-600">Fashion for every occasion</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                      <a
                        href={`https://www.flipkart.com/search?q=${encodeURIComponent(event.name + ' clothing')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                            <span className="text-blue-600 font-bold">F</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Flipkart</h4>
                            <p className="text-sm text-gray-600">Wide range of ethnic wear</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Google Maps */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Location Map</h3>
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                <iframe
                  title="Event Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(event.state + ', India')}`}
                ></iframe>
              </div>
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(event.state + ', India')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-4 text-primary-600 hover:underline"
              >
                Open in Google Maps
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Book Now Card */}
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Book This Event</h3>
              <p className="text-gray-600 mb-6">
                Ready to celebrate? Book now and let us handle the rest!
              </p>
              <button
                onClick={handleBookNow}
                className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              >
                Book Now
              </button>
              {!user && (
                <p className="text-sm text-gray-500 mt-3 text-center">
                  You'll need to login to continue booking
                </p>
              )}
            </div>

            {/* Event Managers */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Event Managers</h3>
              {managers.length > 0 ? (
                <div className="space-y-4">
                  {managers.map((manager) => (
                    <div key={manager.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{manager.name}</h4>
                          <p className="text-sm text-gray-600">{manager.specialty}</p>
                          <p className="text-sm text-gray-500">{manager.location}</p>
                        </div>
                        <div className="flex items-center bg-green-100 px-2 py-1 rounded">
                          <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-green-700">{manager.rating}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <a
                          href={`tel:${manager.phone}`}
                          className="flex-1 flex items-center justify-center gap-2 bg-primary-50 text-primary-600 py-2 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Call
                        </a>
                        <a
                          href={`mailto:${manager.email}`}
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No event managers available for this category.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
