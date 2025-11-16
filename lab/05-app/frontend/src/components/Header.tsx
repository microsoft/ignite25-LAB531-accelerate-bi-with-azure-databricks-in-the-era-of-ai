import React, { useState } from 'react';
import { Menu, X, User as UserIcon, BarChart3, Check, Database, TrendingUp } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ViewType } from '../types/api';
import type { User as UserType } from '../types/api';

type PersonaType = 'countryManager' | 'customerData' | 'demandForecasting';

interface HeaderProps {
  currentView: ViewType;
  user: UserType | null;
  onLogoClick: () => void;
  currentPersona?: PersonaType;
  onPersonaChange?: (persona: PersonaType) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogoClick, currentPersona = 'countryManager', onPersonaChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0">
            <button
              onClick={onLogoClick}
              className="flex items-center space-x-2 group hover:scale-105 transition-transform duration-200"
            >
              {/* Logo Icon */}
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-bold">W</span>
              </div>
              
              {/* Brand Name */}
              <div className="ml-2">
                <h1 className="text-xl font-bold transition-colors duration-200 gradient-text group-hover:text-primary">
                  Wanderbricks
                </h1>
              </div>
            </button>
          </div>

          {/* Center Navigation - Removed non-functional search and destinations */}

          {/* Right Section - User Menu */}
          <div className="flex items-center space-x-4">
            
            {/* Desktop User Menu with Persona Switcher */}
            <div className="flex items-center space-x-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center space-x-3 px-3 py-2 rounded-full border border-gray-200 bg-white hover:shadow-md transition-all duration-200 cursor-pointer">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium truncate max-w-48 text-gray-900">
                        {currentPersona === 'countryManager' ? 'Country Manager' :
                         currentPersona === 'customerData' ? 'Customer Data' :
                         'Demand Forecasting'}
                      </span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200 shadow-lg">
                    <DropdownMenuLabel className="font-semibold text-gray-900">
                      User Menu
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    
                    {/* Persona Selection */}
                    {onPersonaChange && (
                      <>
                        <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                          Switch Persona
                        </DropdownMenuLabel>

                        <DropdownMenuItem
                          onClick={() => onPersonaChange('countryManager')}
                          className="cursor-pointer hover:bg-teal-50 transition-colors"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
                                <BarChart3 className="h-4 w-4 text-secondary" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">Country Manager</span>
                                <span className="text-xs text-gray-500">Analytics dashboard</span>
                              </div>
                            </div>
                            {currentPersona === 'countryManager' && (
                              <Check className="h-4 w-4 text-secondary" />
                            )}
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onPersonaChange('customerData')}
                          className="cursor-pointer hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                <Database className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">Customer Data Platform</span>
                                <span className="text-xs text-gray-500">Customer insights & segments</span>
                              </div>
                            </div>
                            {currentPersona === 'customerData' && (
                              <Check className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onPersonaChange('demandForecasting')}
                          className="cursor-pointer hover:bg-orange-50 transition-colors"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-orange-600" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">Demand Forecasting</span>
                                <span className="text-xs text-gray-500">Predictive analytics & planning</span>
                              </div>
                            </div>
                            {currentPersona === 'demandForecasting' && (
                              <Check className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-gray-200" />
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 bg-primary text-white hover:bg-primary-hover shadow-md hover:shadow-lg">
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2 rounded-lg transition-colors duration-200 text-gray-700 hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white transition-all duration-200">
            <div className="px-2 pt-2 pb-3 space-y-1">

              {/* Persona Switcher Section */}
              {onPersonaChange && (
                <div className="pt-2">
                  <div className="px-3 py-1 text-xs text-gray-500 uppercase tracking-wider font-medium">
                    Switch Persona
                  </div>

                  <button
                    onClick={() => onPersonaChange('countryManager')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      currentPersona === 'countryManager'
                        ? 'bg-teal-50 text-secondary border border-teal-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Country Manager</p>
                      <p className="text-xs text-gray-500">Analytics dashboard</p>
                    </div>
                  </button>

                  <button
                    onClick={() => onPersonaChange('customerData')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      currentPersona === 'customerData'
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <Database className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Customer Data Platform</p>
                      <p className="text-xs text-gray-500">Customer insights & segments</p>
                    </div>
                  </button>

                  <button
                    onClick={() => onPersonaChange('demandForecasting')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      currentPersona === 'demandForecasting'
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Demand Forecasting</p>
                      <p className="text-xs text-gray-500">Predictive analytics & planning</p>
                    </div>
                  </button>
                </div>
              )}
              
              {/* Mobile User Section */}
              <div className="pt-4 border-t border-gray-100">
                {user ? (
                  <div className="flex items-center space-x-3 px-3 py-2 text-gray-900">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {currentPersona === 'countryManager' ? 'Country Manager' :
                         currentPersona === 'customerData' ? 'Customer Data' :
                         'Demand Forecasting'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <button className="w-full px-3 py-2 rounded-lg font-medium transition-colors duration-200 bg-primary text-white hover:bg-primary-hover">
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
