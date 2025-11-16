import React from 'react';
import { CheckCircle, Home, Calendar, Users, MapPin } from 'lucide-react';
import { Booking, Property } from '../types/api';
import { formatPrice, formatDate } from '../lib/utils';

interface BookingConfirmationProps {
  booking: Booking;
  property: Property;
  onNewSearch: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ 
  booking, 
  property, 
  onNewSearch 
}) => {
  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Your reservation has been successfully created
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Booking #{booking.id.slice(-8).toUpperCase()}
              </h2>
              <p className="text-sm text-gray-600">
                Confirmation sent to {booking.guest_email}
              </p>
            </div>
            <div className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
              Confirmed
            </div>
          </div>

          {/* Property Info */}
          <div className="flex items-start space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {property.title}
              </h3>
              <p className="text-gray-600 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {property.location}
              </p>
            </div>
          </div>

          {/* Booking Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Check-in */}
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700 mb-1">Check-in</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(booking.check_in)}
              </p>
            </div>

            {/* Check-out */}
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700 mb-1">Check-out</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(booking.check_out)}
              </p>
            </div>

            {/* Guests */}
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700 mb-1">Guests</p>
              <p className="text-lg font-semibold text-gray-900">
                {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
              </p>
            </div>
          </div>

          {/* Total Cost */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Paid:</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(booking.total_amount)}
              </span>
            </div>
          </div>

          {/* Guest Information */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <span className="ml-2 text-gray-900">{booking.guest_name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <span className="ml-2 text-gray-900">{booking.guest_email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Phone:</span>
                <span className="ml-2 text-gray-900">{booking.guest_phone}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Booking Date:</span>
                <span className="ml-2 text-gray-900">{formatDate(booking.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white mb-8">
          <h3 className="text-lg font-semibold mb-3">What's Next?</h3>
          <ul className="space-y-2 text-sm">
            <li>• You'll receive a confirmation email shortly</li>
            <li>• Check-in instructions will be sent 24 hours before arrival</li>
            <li>• Contact your host if you have any questions</li>
            <li>• Remember to bring a valid ID for check-in</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onNewSearch}
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Book Another Stay</span>
          </button>
        </div>

        {/* Demo Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            🧪 This is a demo booking - no actual reservation or payment was processed
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
