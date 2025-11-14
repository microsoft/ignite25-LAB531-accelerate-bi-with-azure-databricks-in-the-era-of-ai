import React from 'react';
import { ArrowLeft, Bed, Bath, Users } from 'lucide-react';
import { Property, SearchCriteria } from '../types/api';

interface PropertyGridProps {
  properties: Property[];
  searchData: SearchCriteria;
  onPropertySelect: (propertyId: string) => void;
  onBack: () => void;
  loading?: boolean;
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ 
  properties, 
  searchData, 
  onPropertySelect, 
  onBack, 
  loading: _loading 
}) => {
  console.log('🏠 PropertyGrid - Received properties:', properties);
  console.log('🏠 PropertyGrid - Properties count:', properties.length);
  console.log('🏠 PropertyGrid - Search data:', searchData);
  
  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to search</span>
          </button>
        </div>

        {/* Results Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {properties.length} stays in {searchData.destination}
          </h1>
          <p className="text-gray-600">
            {searchData.check_in} - {searchData.check_out} • {searchData.guests} guests
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              onClick={() => onPropertySelect(property.id)}
              className="card-modern cursor-pointer overflow-hidden"
            >
              <div className="aspect-w-4 aspect-h-3 relative overflow-hidden">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-48 object-cover hover-scale-lg"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{property.location}</p>
                
                {/* Property description */}
                {property.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {property.description}
                  </p>
                )}
                
                {/* Property details */}
                <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                  {property.bedrooms && (
                    <div className="flex items-center space-x-1">
                      <Bed className="w-4 h-4" />
                      <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center space-x-1">
                      <Bath className="w-4 h-4" />
                      <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {property.max_guests && (
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{property.max_guests} guests</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    ${property.price_per_night}/night
                  </span>
                  <span className="text-sm text-gray-600">
                    ⭐ {property.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyGrid;
