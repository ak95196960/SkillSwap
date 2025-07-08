import React from 'react';
import { Star, TrendingUp, Users, MessageCircle, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockSkillListings } from '../data/mockData';

interface DashboardProps {
  onViewChange: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const { user } = useAuth();

  if (!user) return null;

  const recommendedListings = mockSkillListings.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-300">
            Ready to continue your skill exchange journey?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Your Rating</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-white">{user.rating || '4.8'}</p>
                  <Star className="h-5 w-5 text-yellow-400 ml-1 fill-current" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-900 rounded-lg">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Exchanges</p>
                <p className="text-2xl font-bold text-white">{user.completedExchanges || 12}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-900 rounded-lg">
                <MessageCircle className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Active Chats</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => onViewChange('create-listing')}
                  className="p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-400 hover:bg-gray-700 transition-colors text-center"
                >
                  <div className="text-gray-300 hover:text-blue-400">
                    <div className="text-2xl mb-2">+</div>
                    <div className="font-medium">Create New Listing</div>
                    <div className="text-sm">Share your skills</div>
                  </div>
                </button>
                <button
                  onClick={() => onViewChange('browse')}
                  className="p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-green-400 hover:bg-gray-700 transition-colors text-center"
                >
                  <div className="text-gray-300 hover:text-green-400">
                    <div className="text-2xl mb-2">🔍</div>
                    <div className="font-medium">Find Skills</div>
                    <div className="text-sm">Discover new opportunities</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recommended For You */}
            <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Recommended For You</h2>
                <button
                  onClick={() => onViewChange('browse')}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recommendedListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={listing.userAvatar}
                        alt={listing.userName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white truncate">
                            {listing.title}
                          </h3>
                          <div className="flex items-center text-yellow-400">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm text-gray-400 ml-1">
                              {listing.userRating}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">
                          by {listing.userName}
                        </p>
                        <p className="text-sm text-gray-300 line-clamp-2">
                          {listing.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {listing.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {listing.timeCommitment}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Profile Completion</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Profile Info</span>
                  <span className="text-green-400 font-medium">Complete</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Skills Offered</span>
                  <span className="text-yellow-400 font-medium">
                    {user.skillsOffered.length > 0 ? 'Complete' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Skills Wanted</span>
                  <span className="text-yellow-400 font-medium">
                    {user.skillsWanted.length > 0 ? 'Complete' : 'Pending'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onViewChange('profile')}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Complete Profile
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="text-sm">
                    <p className="text-white font-medium">New match found!</p>
                    <p className="text-gray-400">Sarah wants to learn Guitar</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="text-sm">
                    <p className="text-white font-medium">Session completed</p>
                    <p className="text-gray-400">Web Development with Marcus</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <div className="text-sm">
                    <p className="text-white font-medium">New review received</p>
                    <p className="text-gray-400">5 stars from Elena</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;