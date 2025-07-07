import React, { useState } from 'react';
import { Camera, MapPin, Star, Edit3, Plus, X, Linkedin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    linkedinProfile: user?.linkedinProfile || '',
    skillsOffered: user?.skillsOffered || [],
    skillsWanted: user?.skillsWanted || []
  });
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');

  if (!user) return null;

  const handleSave = () => {
    updateUser(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: user.name,
      bio: user.bio || '',
      location: user.location || '',
      linkedinProfile: user.linkedinProfile || '',
      skillsOffered: user.skillsOffered,
      skillsWanted: user.skillsWanted
    });
    setIsEditing(false);
  };

  const addSkillOffered = () => {
    if (newSkillOffered.trim() && !editData.skillsOffered.includes(newSkillOffered.trim())) {
      setEditData({
        ...editData,
        skillsOffered: [...editData.skillsOffered, newSkillOffered.trim()]
      });
      setNewSkillOffered('');
    }
  };

  const removeSkillOffered = (skill: string) => {
    setEditData({
      ...editData,
      skillsOffered: editData.skillsOffered.filter(s => s !== skill)
    });
  };

  const addSkillWanted = () => {
    if (newSkillWanted.trim() && !editData.skillsWanted.includes(newSkillWanted.trim())) {
      setEditData({
        ...editData,
        skillsWanted: [...editData.skillsWanted, newSkillWanted.trim()]
      });
      setNewSkillWanted('');
    }
  };

  const removeSkillWanted = (skill: string) => {
    setEditData({
      ...editData,
      skillsWanted: editData.skillsWanted.filter(s => s !== skill)
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:bg-gray-700 transition-colors">
                    <Camera className="h-4 w-4 text-gray-300" />
                  </button>
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-300 fill-current mr-1" />
                      <span className="text-lg font-semibold">{user.rating || '4.8'}</span>
                      <span className="text-blue-100 ml-1">({user.completedExchanges || 12} exchanges)</span>
                    </div>
                    {user.location && (
                      <div className="flex items-center text-blue-100">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{user.location}</span>
                      </div>
                    )}
                  </div>
                  {user.linkedinProfile && (
                    <div className="flex items-center mt-2">
                      <Linkedin className="h-4 w-4 text-blue-100 mr-2" />
                      <a
                        href={user.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-100 hover:text-white transition-colors text-sm"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Bio */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">About</h2>
                  {isEditing ? (
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData({...editData, bio: e.target.value})}
                      placeholder="Tell others about yourself, your experience, and what you're passionate about..."
                      rows={4}
                      className="w-full px-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-300">
                      {user.bio || 'This user hasn\'t added a bio yet.'}
                    </p>
                  )}
                </div>

                {/* Skills Offered */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Skills I Offer</h2>
                  {isEditing ? (
                    <div>
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={newSkillOffered}
                          onChange={(e) => setNewSkillOffered(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillOffered())}
                          placeholder="Add a skill you can teach"
                          className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={addSkillOffered}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editData.skillsOffered.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900 text-blue-300"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkillOffered(skill)}
                              className="ml-2 text-blue-400 hover:text-blue-200"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user.skillsOffered.length > 0 ? (
                        user.skillsOffered.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900 text-blue-300"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No skills added yet</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Skills Wanted */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Skills I Want to Learn</h2>
                  {isEditing ? (
                    <div>
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={newSkillWanted}
                          onChange={(e) => setNewSkillWanted(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillWanted())}
                          placeholder="Add a skill you want to learn"
                          className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={addSkillWanted}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editData.skillsWanted.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900 text-green-300"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkillWanted(skill)}
                              className="ml-2 text-green-400 hover:text-green-200"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user.skillsWanted.length > 0 ? (
                        user.skillsWanted.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900 text-green-300"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No skills added yet</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({...editData, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-white">{user.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                      <p className="text-white">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.location}
                          onChange={(e) => setEditData({...editData, location: e.target.value})}
                          placeholder="e.g., San Francisco, CA"
                          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-white">{user.location || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">LinkedIn Profile</label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={editData.linkedinProfile}
                          onChange={(e) => setEditData({...editData, linkedinProfile: e.target.value})}
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center">
                          {user.linkedinProfile ? (
                            <a
                              href={user.linkedinProfile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 flex items-center"
                            >
                              <Linkedin className="h-4 w-4 mr-2" />
                              View Profile
                            </a>
                          ) : (
                            <p className="text-gray-400">Not specified</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Rating</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-semibold text-white">{user.rating || '4.8'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Exchanges</span>
                      <span className="font-semibold text-white">{user.completedExchanges || 12}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Matches</span>
                      <span className="font-semibold text-white">{user.matches?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Member Since</span>
                      <span className="font-semibold text-white">Jan 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save/Cancel Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-700">
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;