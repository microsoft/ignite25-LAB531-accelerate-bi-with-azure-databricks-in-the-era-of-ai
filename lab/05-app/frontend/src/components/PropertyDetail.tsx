import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Property, SearchCriteria } from '../types/api';

interface PropertyDetailProps {
  property: Property;
  searchData: SearchCriteria;
  onBookNow: () => void;
  onBack: () => void;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ 
  property, 
  searchData: _searchData, 
  onBookNow, 
  onBack 
}) => {
  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to results</span>
        </button>

        {/* Property Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-w-16 aspect-h-10 rounded-xl overflow-hidden">
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-80 object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <p className="text-lg text-gray-600">{property.location}</p>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{property.bedrooms} beds</span>
              <span>•</span>
              <span>{property.bathrooms} baths</span>
              <span>•</span>
              <span>Up to {property.max_guests} guests</span>
            </div>

            <p className="text-gray-700">{property.description}</p>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-primary">
                  ${property.price_per_night}/night
                </span>
                <span className="text-sm text-gray-600">
                  ⭐ {property.rating} ({property.review_count} reviews)
                </span>
              </div>
              
              <button
                onClick={onBookNow}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-hover transition-colors"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
