import React, { useEffect, useState } from 'react';
import { Heart, CheckCircle, X, Sparkles } from 'lucide-react';

interface MatchPopupProps {
  isVisible: boolean;
  userName: string;
  onClose: () => void;
}

const MatchPopup: React.FC<MatchPopupProps> = ({ isVisible, userName, onClose }) => {
  const [animationStage, setAnimationStage] = useState<'enter' | 'success' | 'exit'>('enter');

  useEffect(() => {
    if (isVisible) {
      setAnimationStage('enter');
      
      // Show success animation after initial animation
      const successTimer = setTimeout(() => {
        setAnimationStage('success');
      }, 600);

      // Auto close after 4 seconds
      const closeTimer = setTimeout(() => {
        setAnimationStage('exit');
        setTimeout(onClose, 400);
      }, 4000);

      return () => {
        clearTimeout(successTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-500 ${
          animationStage === 'exit' ? 'opacity-0' : 'opacity-60'
        }`}
        onClick={onClose}
      />
      
      {/* Popup */}
      <div 
        className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 mx-4 max-w-md w-full border border-gray-600 shadow-2xl transform transition-all duration-700 ${
          animationStage === 'enter' 
            ? 'scale-0 rotate-12 opacity-0' 
            : animationStage === 'exit'
            ? 'scale-75 opacity-0 rotate-6'
            : 'scale-100 rotate-0 opacity-100'
        }`}
        style={{
          background: animationStage === 'success' 
            ? 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4f46e5 100%)'
            : 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Floating sparkles */}
        {animationStage === 'success' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            {[...Array(8)].map((_, i) => (
              <Sparkles
                key={i}
                className={`absolute text-yellow-400 animate-ping`}
                style={{
                  left: `${15 + i * 12}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  animationDelay: `${i * 150}ms`,
                  animationDuration: '1.5s'
                }}
                size={12 + (i % 3) * 4}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="text-center relative z-10">
          {/* Animated Heart Container */}
          <div className="relative mb-8">
            <div 
              className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-red-600 transition-all duration-1000 ${
                animationStage === 'success' ? 'animate-pulse shadow-lg shadow-red-500/50' : ''
              }`}
              style={{
                transform: animationStage === 'success' ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              <Heart 
                className={`h-12 w-12 text-white transition-all duration-700 ${
                  animationStage === 'success' ? 'fill-current scale-110' : ''
                }`} 
              />
            </div>
            
            {/* Success checkmark overlay with bounce */}
            {animationStage === 'success' && (
              <div 
                className="absolute -top-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  animation: 'bounce 1s infinite'
                }}
              >
                <CheckCircle className="h-6 w-6 text-white fill-current" />
              </div>
            )}

            {/* Pulsing ring effect */}
            {animationStage === 'success' && (
              <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75" />
            )}
          </div>

          {/* Text content with staggered animation */}
          <div 
            className={`transition-all duration-700 ${
              animationStage === 'enter' ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <h2 className="text-3xl font-bold text-white mb-3 flex items-center justify-center space-x-2">
              <span>🎉</span>
              <span>Match Created!</span>
              <span>🎉</span>
            </h2>
            <p className="text-gray-200 mb-4 text-lg">
              You've successfully connected with{' '}
              <span className="font-bold text-blue-300 bg-blue-900/30 px-2 py-1 rounded-lg">
                {userName}
              </span>
            </p>
            <p className="text-sm text-gray-300 leading-relaxed">
              Great choice! You can now reach out to them on LinkedIn to start your skill exchange journey. 
              <span className="block mt-2 text-yellow-300 font-medium">
                ✨ Happy learning! ✨
              </span>
            </p>
          </div>

          {/* Animated progress bar */}
          {animationStage === 'success' && (
            <div className="mt-6">
              <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-4000 ease-out"
                  style={{
                    width: '100%',
                    animation: 'progressFill 4s ease-out forwards'
                  }}
                />
              </div>
            </div>
          )}

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-2000 ${
                  animationStage === 'success' 
                    ? 'animate-bounce opacity-80' 
                    : 'opacity-0'
                }`}
                style={{
                  left: `${10 + i * 8}%`,
                  top: `${15 + (i % 4) * 20}%`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: `${1000 + i * 100}ms`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style >{`
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default MatchPopup;