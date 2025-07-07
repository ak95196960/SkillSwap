import React, { useState } from 'react';
import { X, Send, Heart, ArrowRight } from 'lucide-react';
import { matchRequestsAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface SendRequestModalProps {
  isVisible: boolean;
  targetUser: {
    id: string;
    name: string;
    avatar?: string;
    skillsOffered: string[];
    skillsWanted: string[];
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

const SendRequestModal: React.FC<SendRequestModalProps> = ({
  isVisible,
  targetUser,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    skillOffered: '',
    skillWanted: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isVisible || !user || !targetUser) return null;

  // Get user's skills with fallbacks
  const userSkillsOffered = user.skillsOffered && user.skillsOffered.length > 0 
    ? user.skillsOffered 
    : ['Web Development', 'JavaScript', 'React', 'Node.js', 'Python', 'Design', 'Writing', 'Marketing'];

  // Get target user's skills with fallbacks
  const targetSkillsOffered = targetUser.skillsOffered && targetUser.skillsOffered.length > 0
    ? targetUser.skillsOffered
    : ['Programming', 'Design', 'Marketing', 'Writing', 'Photography', 'Music', 'Cooking', 'Languages'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.skillOffered.trim()) {
        setError('Please select a skill you can offer');
        setLoading(false);
        return;
      }

      if (!formData.skillWanted.trim()) {
        setError('Please select a skill you want to learn');
        setLoading(false);
        return;
      }

      if (formData.skillOffered === formData.skillWanted) {
        setError('You cannot offer and want the same skill');
        setLoading(false);
        return;
      }

      const requestData = {
        receiverId: targetUser.id,
        skillOffered: formData.skillOffered.trim(),
        skillWanted: formData.skillWanted.trim(),
        message: formData.message.trim()
      };

      console.log('Sending request with data:', requestData);

      const response = await matchRequestsAPI.sendRequest(requestData);
      console.log('Request sent successfully:', response.data);

      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        skillOffered: '',
        skillWanted: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Send request error:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || 'Invalid request data';
        if (errorMessage.includes('already sent') || errorMessage.includes('already exists')) {
          setError('You have already sent a request for this skill combination');
        } else if (errorMessage.includes('already matched')) {
          setError('You are already matched with this user');
        } else if (errorMessage.includes('yourself')) {
          setError('You cannot send a request to yourself');
        } else if (errorMessage.includes('Validation failed')) {
          const details = error.response.data?.details || error.response.data?.errors;
          if (details) {
            setError(`Validation error: ${Array.isArray(details) ? details.join(', ') : details}`);
          } else {
            setError('Please check all required fields');
          }
        } else {
          setError(errorMessage);
        }
      } else if (error.response?.status === 404) {
        setError('User not found or no longer available');
      } else if (error.response?.status === 503) {
        setError('Service temporarily unavailable. Please try again later.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to send request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      skillOffered: '',
      skillWanted: '',
      message: ''
    });
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl p-8 mx-4 max-w-lg w-full border border-gray-600 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Send Skill Exchange Request</h2>
          <p className="text-gray-300">
            Connect with <span className="font-semibold text-blue-300">{targetUser.name}</span> for skill exchange
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Skill Exchange Preview */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-sm text-gray-400 mb-1">You offer</p>
                <p className="font-semibold text-blue-300">
                  {formData.skillOffered || 'Select skill'}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 mx-4" />
              <div className="text-center flex-1">
                <p className="text-sm text-gray-400 mb-1">You want to learn</p>
                <p className="font-semibold text-green-300">
                  {formData.skillWanted || 'Select skill'}
                </p>
              </div>
            </div>
          </div>

          {/* Skill Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Skill You Offer *
              </label>
              <select
                value={formData.skillOffered}
                onChange={(e) => setFormData({...formData, skillOffered: e.target.value})}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a skill</option>
                {userSkillsOffered.map((skill, index) => (
                  <option key={index} value={skill}>{skill}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Skills from your profile
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Skill You Want *
              </label>
              <select
                value={formData.skillWanted}
                onChange={(e) => setFormData({...formData, skillWanted: e.target.value})}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a skill</option>
                {targetSkillsOffered.map((skill, index) => (
                  <option key={index} value={skill}>{skill}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Skills offered by {targetUser.name}
              </p>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="Introduce yourself and explain why you'd like to connect..."
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.message.length}/500 characters
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-3">
              <p className="text-sm text-red-300">{error}</p>
              <button
                type="button"
                onClick={() => setError('')}
                className="text-xs text-red-400 hover:text-red-300 mt-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.skillOffered || !formData.skillWanted}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendRequestModal;