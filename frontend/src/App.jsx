import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import BookingHistory from './pages/BookingHistory';
import BookingSuccess from './pages/BookingSuccess';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/event/:id" element={<EventDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/booking/:eventId" element={<Booking />} />
              <Route path="/payment/:bookingId" element={<Payment />} />
              <Route path="/booking-success/:bookingId" element={<BookingSuccess />} />
              <Route path="/my-bookings" element={<BookingHistory />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
