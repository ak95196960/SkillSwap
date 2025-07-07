import React, { useState, useEffect } from 'react';
import { X, Check, UserCheck, Clock, MessageCircle, Sparkles, RefreshCw } from 'lucide-react';
import { matchRequestsAPI } from '../lib/api';
import MatchPopup from './MatchPopup';

interface Request {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    linkedinProfile: string;
  };
  skillOffered: string;
  skillWanted: string;
  message: string;
  createdAt: string;
}

interface RequestsPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onRequestCountChange: (count: number) => void;
}

const RequestsPanel: React.FC<RequestsPanelProps> = ({ 
  isVisible, 
  onClose, 
  onRequestCountChange 
}) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [matchedUserName, setMatchedUserName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isVisible) {
      fetchRequests();
    }
  }, [isVisible]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching received requests...');
      const response = await matchRequestsAPI.getReceivedRequests({ status: 'pending' });
      console.log('Received requests response:', response.data);
      
      setRequests(response.data.requests || []);
      onRequestCountChange((response.data.requests || []).length);
    } catch (error: any) {
      console.error('Failed to fetch requests:', error);
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string, senderName: string) => {
    console.log('=== ACCEPT REQUEST FRONTEND ===');
    console.log('Request ID:', requestId);
    console.log('Sender name:', senderName);
    
    setProcessingId(requestId);
    setError('');
    
    try {
      console.log('Calling accept API...');
      const response = await matchRequestsAPI.acceptRequest(requestId);
      console.log('Accept response:', response.data);
      
      if (response.data.success) {
        console.log('Request accepted successfully');
        
        // Remove request from list
        setRequests(prev => {
          const newRequests = prev.filter(req => req.id !== requestId);
          onRequestCountChange(newRequests.length);
          return newRequests;
        });
        
        // Show success animation
        setMatchedUserName(senderName);
        setShowMatchPopup(true);
      } else {
        throw new Error('Accept request failed');
      }
    } catch (error: any) {
      console.error('Failed to accept request:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to accept request';
      
      if (error.response?.status === 404) {
        errorMessage = 'Request not found or already processed';
      } else if (error.response?.status === 403) {
        errorMessage = 'Not authorized to accept this request';
      } else if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData?.error === 'ALREADY_PROCESSED') {
          errorMessage = `Request already ${errorData.message.split(' ').pop()}`;
        } else if (errorData?.error === 'INVALID_ID_FORMAT') {
          errorMessage = 'Invalid request format';
        } else if (errorData?.error === 'VALIDATION_ERROR') {
          errorMessage = `Data validation failed: ${errorData.details || errorData.message}`;
        } else if (errorData?.error === 'MATCH_VALIDATION_ERROR') {
          errorMessage = `Match creation failed: ${errorData.details || errorData.message}`;
        } else if (errorData?.error === 'MATCH_CREATION_ERROR') {
          errorMessage = 'Failed to create match. Please try again.';
        } else {
          errorMessage = errorData?.message || 'Invalid request';
        }
      } else if (error.response?.status === 500) {
        const errorData = error.response.data;
        if (errorData?.error === 'SERVER_ERROR') {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = 'Internal server error. Please try again.';
        }
      } else if (error.response?.status === 503) {
        errorMessage = 'Service temporarily unavailable. Please try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      
      // Refresh requests to get current state
      setTimeout(() => {
        fetchRequests();
      }, 2000);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    console.log('=== DECLINE REQUEST FRONTEND ===');
    console.log('Request ID:', requestId);
    
    setProcessingId(requestId);
    setError('');
    
    try {
      console.log('Calling decline API...');
      const response = await matchRequestsAPI.declineRequest(requestId);
      console.log('Decline response:', response.data);
      
      if (response.data.success) {
        console.log('Request declined successfully');
        
        // Remove request from list
        setRequests(prev => {
          const newRequests = prev.filter(req => req.id !== requestId);
          onRequestCountChange(newRequests.length);
          return newRequests;
        });
      } else {
        throw new Error('Decline request failed');
      }
    } catch (error: any) {
      console.error('Failed to decline request:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to decline request';
      
      if (error.response?.status === 404) {
        errorMessage = 'Request not found or already processed';
      } else if (error.response?.status === 403) {
        errorMessage = 'Not authorized to decline this request';
      } else if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData?.error === 'ALREADY_PROCESSED') {
          errorMessage = `Request already ${errorData.message.split(' ').pop()}`;
        } else if (errorData?.error === 'INVALID_ID_FORMAT') {
          errorMessage = 'Invalid request format';
        } else {
          errorMessage = errorData?.message || 'Invalid request';
        }
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
      
      // Refresh requests to get current state
      setTimeout(() => {
        fetchRequests();
      }, 2000);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Match Requests</h2>
              <p className="text-sm text-gray-400">
                {requests.length} pending request{requests.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchRequests}
              disabled={loading}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-900 border-b border-red-700">
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-xs text-red-400 hover:text-red-300 mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                <p className="text-sm text-gray-400">Loading requests...</p>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                <UserCheck className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No pending requests</h3>
              <p className="text-gray-400">
                When someone sends you a skill exchange request, it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors"
                >
                  {/* User Info */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      {request.sender.avatar ? (
                        <img
                          src={request.sender.avatar}
                          alt={request.sender.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {request.sender.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {request.sender.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skill Exchange */}
                  <div className="bg-gray-800 rounded-lg p-3 mb-3">
                    <div className="text-center">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <p className="text-gray-400 mb-1">Offers</p>
                          <p className="font-medium text-blue-300">{request.skillOffered}</p>
                        </div>
                        <div className="px-3">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Sparkles className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-400 mb-1">Wants</p>
                          <p className="font-medium text-green-300">{request.skillWanted}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  {request.message && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <MessageCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">Message</span>
                      </div>
                      <p className="text-sm text-gray-300 bg-gray-800 rounded-lg p-3">
                        "{request.message}"
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleDecline(request.id)}
                      disabled={processingId === request.id}
                      className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {processingId === request.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <X className="h-4 w-4" />
                          <span>Decline</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAccept(request.id, request.sender.name)}
                      disabled={processingId === request.id}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {processingId === request.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Accept</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Match Success Popup */}
      <MatchPopup
        isVisible={showMatchPopup}
        userName={matchedUserName}
        onClose={() => setShowMatchPopup(false)}
      />
    </>
  );
};

export default RequestsPanel;