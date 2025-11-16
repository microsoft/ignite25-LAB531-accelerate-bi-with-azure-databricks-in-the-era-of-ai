import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Property, SearchCriteria, User } from '../types/api';
import { formatPrice, calculateTotalPrice } from '../lib/utils';

interface BookingFlowProps {
  property: Property;
  searchData: SearchCriteria;
  user: User | null;
  onConfirm: (bookingData: { guest_name: string; guest_email: string; guest_country: string }) => void;
  onBack: () => void;
  loading?: boolean;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ 
  property, 
  searchData, 
  user, 
  onConfirm, 
  onBack, 
  loading 
}) => {
  const [bookingData, setBookingData] = useState({
    guest_name: user?.name || 'Richard Brown',
    guest_email: user?.email || 'richard.b@example.com',
    guest_country: 'United States',
  });

  // Ensure we have valid dates for calculation
  const checkIn = searchData.check_in || new Date().toISOString().split('T')[0];
  const checkOut = searchData.check_out || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const totalPrice = calculateTotalPrice(property.price_per_night, checkIn, checkOut);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(bookingData);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors mb-8"
          disabled={loading}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to property</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Booking Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Guest Information */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Guest Information</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Pre-filled for demo purposes
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={bookingData.guest_name}
                      onChange={(e) => setBookingData(prev => ({ ...prev, guest_name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={bookingData.guest_email}
                      onChange={(e) => setBookingData(prev => ({ ...prev, guest_email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={bookingData.guest_country}
                      onChange={(e) => setBookingData(prev => ({ ...prev, guest_country: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Confirm Booking'}
              </button>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-lg p-6 shadow-sm border h-fit">
            <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{property.title}</h3>
                  <p className="text-sm text-gray-600">{property.location}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Check-in:</span>
                  <span>{checkIn}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Check-out:</span>
                  <span>{checkOut}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Guests:</span>
                  <span>{searchData.guests}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold text-primary">
                  <span>Total:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
