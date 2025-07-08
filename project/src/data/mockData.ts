export interface SkillListing {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRating: number;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  timeCommitment: string;
  skillsWanted: string[];
  location: string;
  availability: string;
  createdAt: string;
}

export const skillCategories = [
  'Programming',
  'Design',
  'Languages',
  'Music',
  'Cooking',
  'Photography',
  'Writing',
  'Marketing',
  'Business',
  'Fitness',
  'Crafts',
  'Other'
];

export const mockSkillListings: SkillListing[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Sarah Chen',
    userAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    userRating: 4.9,
    title: 'Professional Web Development Mentoring',
    description: 'I offer comprehensive web development training covering React, Node.js, and modern JavaScript. Perfect for beginners looking to break into tech or experienced developers wanting to level up.',
    category: 'Programming',
    level: 'Intermediate',
    timeCommitment: '2-3 hours/week',
    skillsWanted: ['Graphic Design', 'UI/UX Design'],
    location: 'San Francisco, CA',
    availability: 'Evenings & Weekends',
    createdAt: '2025-01-15'
  },
  {
    id: '2',
    userId: '3',
    userName: 'Marcus Johnson',
    userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    userRating: 4.7,
    title: 'Guitar Lessons - From Basics to Blues',
    description: 'Learn guitar with 15+ years of experience. I teach acoustic and electric guitar, focusing on technique, music theory, and helping you play your favorite songs.',
    category: 'Music',
    level: 'Beginner',
    timeCommitment: '1 hour/week',
    skillsWanted: ['Photography', 'Video Editing'],
    location: 'Austin, TX',
    availability: 'Flexible',
    createdAt: '2025-01-14'
  },
  {
    id: '3',
    userId: '4',
    userName: 'Elena Rodriguez',
    userAvatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
    userRating: 4.8,
    title: 'Spanish Language Conversation Practice',
    description: 'Native Spanish speaker offering conversation practice and cultural insights. Perfect for intermediate learners wanting to improve fluency and confidence.',
    category: 'Languages',
    level: 'Intermediate',
    timeCommitment: '1-2 hours/week',
    skillsWanted: ['English Writing', 'Public Speaking'],
    location: 'Miami, FL',
    availability: 'Mornings',
    createdAt: '2025-01-13'
  },
  {
    id: '4',
    userId: '5',
    userName: 'David Park',
    userAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    userRating: 4.6,
    title: 'Professional Photography & Lightroom',
    description: 'Award-winning photographer teaching composition, lighting, and post-processing. Learn to capture stunning portraits and landscapes with hands-on guidance.',
    category: 'Photography',
    level: 'Advanced',
    timeCommitment: '3-4 hours/week',
    skillsWanted: ['Social Media Marketing', 'Business Strategy'],
    location: 'Los Angeles, CA',
    availability: 'Weekends',
    createdAt: '2025-01-12'
  },
  {
    id: '5',
    userId: '6',
    userName: 'Amy Liu',
    userAvatar: 'https://images.pexels.com/photos/1689731/pexels-photo-1689731.jpeg?auto=compress&cs=tinysrgb&w=150',
    userRating: 4.9,
    title: 'UI/UX Design Fundamentals',
    description: 'Senior product designer at tech startup teaching design thinking, user research, prototyping, and design systems. Perfect for career switchers.',
    category: 'Design',
    level: 'Beginner',
    timeCommitment: '2-3 hours/week',
    skillsWanted: ['Data Analysis', 'Python Programming'],
    location: 'Seattle, WA',
    availability: 'Evenings',
    createdAt: '2025-01-11'
  },
  {
    id: '6',
    userId: '7',
    userName: 'Roberto Silva',
    userAvatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    userRating: 4.5,
    title: 'Authentic Italian Cooking',
    description: 'Learn traditional Italian recipes passed down through generations. From pasta making to regional specialties, bring Italy to your kitchen.',
    category: 'Cooking',
    level: 'Beginner',
    timeCommitment: '2 hours/week',
    skillsWanted: ['Wine Knowledge', 'Food Photography'],
    location: 'Boston, MA',
    availability: 'Weekend afternoons',
    createdAt: '2025-01-10'
  }
];