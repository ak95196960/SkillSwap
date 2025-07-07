import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, MapPin, Clock, User, Send, Linkedin, CheckCircle, Plus } from 'lucide-react';
import { skillCategories } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { skillsAPI } from '../lib/api';
import SendRequestModal from './sendRequestModal';

interface SkillListing {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  timeCommitment: string;
  availability: string;
  location: string;
  skillsWanted: string[];
  views?: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    completedExchanges: number;
    linkedinProfile: string;
  };
}

const BrowseSkills: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [listings, setListings] = useState<SkillListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userMatches, setUserMatches] = useState<string[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchListings();
  }, [searchTerm, selectedCategory, selectedLevel]);

  useEffect(() => {
    if (user?.matches) {
      setUserMatches(user.matches);
    }
  }, [user]);

  const fetchListings = async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const params: any = {
        page,
        limit: 12
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedLevel) params.level = selectedLevel;

      const response = await skillsAPI.getListings(params);
      
      if (response.data.skillListings) {
        // Filter out current user's listings
        const filteredListings = response.data.skillListings.filter(
          (listing: SkillListing) => listing.user.id !== user?.id
        );
        
        setListings(filteredListings);
        setPagination(response.data.pagination || { current: 1, pages: 1, total: 0 });
      } else {
        setListings([]);
        setPagination({ current: 1, pages: 1, total: 0 });
      }
    } catch (error: any) {
      console.error('Failed to fetch listings:', error);
      setError('Failed to load skill listings. Please try again.');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const isAlreadyMatched = (listingUserId: string) => {
    return userMatches.includes(listingUserId);
  };

  const handleSendRequest = (listing: SkillListing) => {
    if (!user) return;

    // Create user data for the modal using the listing's user data
    const targetUser = {
      id: listing.user.id,
      name: listing.user.name,
      avatar: listing.user.avatar,
      skillsOffered: [listing.title], // Use the skill from the listing
      skillsWanted: listing.skillsWanted || []
    };

    setSelectedUser(targetUser);
    setShowRequestModal(true);
  };

  const handleRequestSuccess = () => {
    // Show success message
    console.log('Request sent successfully!');
    // Optionally refresh the listings or show a toast notification
  };

  const handleLinkedInClick = (listing: SkillListing) => {
    if (listing.user.linkedinProfile) {
      window.open(listing.user.linkedinProfile, '_blank');
    }
  };

  const getMatchBadge = (listing: SkillListing) => {
    if (isAlreadyMatched(listing.user.id)) {
      return (
        <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
          <CheckCircle className="h-3 w-3" />
          <span>Matched</span>
        </div>
      );
    }

    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading && listings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Skills</h2>
          <p className="text-gray-400">Finding amazing opportunities for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Skills</h1>
          <p className="text-gray-300">
            Discover amazing skills shared by our community members
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search skills, users, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {skillCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900 border border-red-700 rounded-lg p-4">
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => fetchListings()}
              className="mt-2 text-red-400 hover:text-red-300 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-300">
            Showing {listings.length} skill{listings.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
            {pagination.total > 0 && ` (${pagination.total} total)`}
          </p>
        </div>

        {/* Skills Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className={`relative bg-gray-800 rounded-xl shadow-sm border transition-colors ${
                isAlreadyMatched(listing.user.id)
                  ? 'border-green-500'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {getMatchBadge(listing)}

              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    {listing.user.avatar ? (
                      <img
                        src={listing.user.avatar}
                        alt={listing.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white truncate">
                        {listing.user.name}
                      </h3>
                      <div className="flex items-center text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm text-gray-400 ml-1">
                          {listing.user.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-300">
                        {listing.category}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        {listing.level}
                      </span>
                    </div>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-white mb-2">
                  {listing.title}
                </h4>
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {listing.description}
                </p>

                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {listing.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {listing.timeCommitment} • {listing.availability}
                  </div>
                </div>
              </div>

              {/* Skills Wanted */}
              {listing.skillsWanted && listing.skillsWanted.length > 0 && (
                <div className="px-6 pb-4">
                  <p className="text-sm font-medium text-gray-300 mb-2">Looking for:</p>
                  <div className="flex flex-wrap gap-1">
                    {listing.skillsWanted.slice(0, 2).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-900 text-green-300"
                      >
                        {skill}
                      </span>
                    ))}
                    {listing.skillsWanted.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-700 text-gray-400">
                        +{listing.skillsWanted.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-700 rounded-b-xl">
                {isAlreadyMatched(listing.user.id) ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleLinkedInClick(listing)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span>Contact on LinkedIn</span>
                    </button>
                    <div className="text-center">
                      <span className="text-xs text-green-400 font-medium">✓ Already matched</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleSendRequest(listing)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2 group"
                    >
                      <Send className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span>Send Request</span>
                    </button>
                    {listing.user.linkedinProfile && (
                      <button
                        onClick={() => handleLinkedInClick(listing)}
                        className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <Linkedin className="h-4 w-4" />
                        <span>View LinkedIn</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Created Date */}
              <div className="absolute bottom-2 left-6 text-xs text-gray-500">
                {formatDate(listing.createdAt)}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchListings(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    page === pagination.current
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {listings.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No skills found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm || selectedCategory || selectedLevel
                ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                : 'No skill listings available yet. Be the first to create one!'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedLevel('');
              }}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Send Request Modal */}
      <SendRequestModal
        isVisible={showRequestModal}
        targetUser={selectedUser}
        onClose={() => setShowRequestModal(false)}
        onSuccess={handleRequestSuccess}
      />
    </div>
  );
};

export default BrowseSkills;