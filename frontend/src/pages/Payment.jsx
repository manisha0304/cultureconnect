import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBooking, createPaymentOrder, verifyPayment, confirmBooking } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBooking();
    loadRazorpayScript();
  }, [bookingId, user]);

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

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const handleRazorpayPayment = async () => {
    setProcessing(true);
    try {
      const orderResponse = await createPaymentOrder({
        amount: booking.total_amount,
        bookingId
      });

      const options = {
        key: orderResponse.data.keyId,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'CultureConnect',
        description: `Booking for ${booking.event_name}`,
        order_id: orderResponse.data.orderId,
        handler: async function (response) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId
            });
            
            await confirmBooking(bookingId, response.razorpay_payment_id);
            navigate(`/booking-success/${bookingId}`);
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || ''
        },
        theme: {
          color: '#ee7712'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDemoPayment = async () => {
    setProcessing(true);
    try {
      const demoPaymentId = 'demo_' + Date.now();
      await confirmBooking(bookingId, demoPaymentId);
      navigate(`/booking-success/${bookingId}`);
    } catch (error) {
      console.error('Error processing demo payment:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Booking not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
          <p className="text-gray-600">Choose your preferred payment method</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>

              <div className="space-y-4">
                {/* Razorpay Option */}
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'razorpay' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-primary-500"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Razorpay</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">UPI</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Cards</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">NetBanking</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Pay securely with UPI, Debit/Credit Cards, or Net Banking</p>
                  </div>
                </label>

                {/* Demo Payment Option */}
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'demo' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="demo"
                    checked={paymentMethod === 'demo'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-primary-500"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Demo Payment</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">For Testing</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Skip actual payment for testing purposes</p>
                  </div>
                </label>
              </div>

              {/* UPI Scanner (shown when Razorpay is selected) */}
              {paymentMethod === 'razorpay' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Quick Pay with UPI</h3>
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 bg-white rounded-lg border flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        <span className="text-xs">QR Code</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">Scan QR code with any UPI app:</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-white px-3 py-1 rounded border">Google Pay</span>
                        <span className="text-xs bg-white px-3 py-1 rounded border">PhonePe</span>
                        <span className="text-xs bg-white px-3 py-1 rounded border">Paytm</span>
                        <span className="text-xs bg-white px-3 py-1 rounded border">BHIM</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={paymentMethod === 'razorpay' ? handleRazorpayPayment : handleDemoPayment}
                disabled={processing}
                className="w-full mt-6 bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay ₹${booking.total_amount?.toLocaleString('en-IN')}`
                )}
              </button>

              <p className="mt-4 text-xs text-gray-500 text-center">
                Your payment is secured with 256-bit SSL encryption
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 pb-4 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Event</span>
                  <span className="font-medium text-gray-900">{booking.event_name}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Date</span>
                  <span>{new Date(booking.event_date).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Venue</span>
                  <span className="text-right max-w-[150px] truncate">{booking.venue}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Guests</span>
                  <span>{booking.guest_count}</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span>₹{booking.total_amount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
