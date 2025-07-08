import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { skillCategories } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const CreateListing: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    timeCommitment: '',
    availability: '',
    location: '',
    skillsWanted: [] as string[]
  });
  const [newSkill, setNewSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addSkillWanted = () => {
    if (newSkill.trim() && !formData.skillsWanted.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skillsWanted: [...formData.skillsWanted, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkillWanted = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skillsWanted: formData.skillsWanted.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured() && user) {
        const { error } = await supabase!
          .from('skill_listings')
          .insert([
            {
              user_id: user.id,
              title: formData.title,
              description: formData.description,
              category: formData.category,
              level: formData.level,
              time_commitment: formData.timeCommitment,
              availability: formData.availability,
              location: formData.location,
              skills_wanted: formData.skillsWanted
            }
          ]);

        if (error) throw error;
      } else {
        // Simulate API call when Supabase is not configured
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      alert('Skill listing created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        level: 'Beginner',
        timeCommitment: '',
        availability: '',
        location: '',
        skillsWanted: []
      });
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Error creating listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Skill Listing</h1>
          <p className="text-gray-300">
            Share your expertise with the community and find skills you want to learn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-8">
          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Skill Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Guitar Lessons for Beginners"
                    className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {skillCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-300 mb-2">
                    Level *
                  </label>
                  <select
                    id="level"
                    name="level"
                    required
                    value={formData.level}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what you'll teach, your experience, and what students can expect to learn..."
                    className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Logistics */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Logistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="timeCommitment" className="block text-sm font-medium text-gray-300 mb-2">
                    Time Commitment *
                  </label>
                  <input
                    type="text"
                    id="timeCommitment"
                    name="timeCommitment"
                    required
                    value={formData.timeCommitment}
                    onChange={handleInputChange}
                    placeholder="e.g., 2 hours/week"
                    className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-gray-300 mb-2">
                    Availability *
                  </label>
                  <input
                    type="text"
                    id="availability"
                    name="availability"
                    required
                    value={formData.availability}
                    onChange={handleInputChange}
                    placeholder="e.g., Evenings & Weekends"
                    className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., San Francisco, CA (or Online)"
                    className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Skills Wanted */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Skills You Want to Learn</h2>
              <p className="text-gray-400 mb-4">
                Add skills you'd like to learn in exchange for teaching your skill
              </p>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillWanted())}
                  placeholder="Enter a skill you want to learn"
                  className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addSkillWanted}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {formData.skillsWanted.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skillsWanted.map((skill, index) => (
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
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Listing...
                  </div>
                ) : (
                  'Create Listing'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;