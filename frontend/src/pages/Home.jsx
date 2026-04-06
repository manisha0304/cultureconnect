import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, getCategories, getStates } from '../utils/api';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, selectedState, searchTerm]);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, statesRes] = await Promise.all([
        getCategories(),
        getStates()
      ]);
      setCategories(categoriesRes.data);
      setStates(statesRes.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedState) params.state = selectedState;
      if (searchTerm) params.search = searchTerm;
      
      const response = await getEvents(params);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Discover India's Rich
              <span className="block text-primary-400">Cultural Heritage</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              From vibrant festivals to grand weddings, explore and celebrate the diverse 
              traditions of India. Book events, find venues, and connect with expert planners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#events" className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors">
                Explore Events
              </a>
              <a href="#categories" className="bg-white/10 backdrop-blur text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20">
                Browse Categories
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-slide-up">
              <div className="text-3xl md:text-4xl font-bold text-primary-600">500+</div>
              <div className="text-gray-600 mt-1">Events Listed</div>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-3xl md:text-4xl font-bold text-primary-600">29</div>
              <div className="text-gray-600 mt-1">States Covered</div>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl md:text-4xl font-bold text-primary-600">1000+</div>
              <div className="text-gray-600 mt-1">Event Managers</div>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-3xl md:text-4xl font-bold text-primary-600">50K+</div>
              <div className="text-gray-600 mt-1">Happy Customers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Event Categories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore events across different categories - from religious festivals to personal celebrations
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? '' : category.id)}
                className={`p-6 rounded-xl text-center transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:shadow-md hover:scale-105'
                }`}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="font-semibold">{category.name}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Discover Events
              </h2>
              <p className="text-gray-600">Find events from across India</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Events</label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All States</option>
                  {states.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No events found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link
                  key={event.id}
                  to={`/event/${event.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {event.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.state}
                      </div>
                      <span className="text-primary-600 font-medium text-sm group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Plan Your Event?
          </h2>
          <p className="text-primary-100 max-w-2xl mx-auto mb-8">
            Join thousands of happy customers who have celebrated their special moments with us. 
            Get started today!
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
