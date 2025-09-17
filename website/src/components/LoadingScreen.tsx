'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show loading for 2.2 seconds, then fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Complete fade out animation after 400ms
      setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 400);
    }, 2200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-white z-50 flex items-center justify-center transition-opacity duration-400 ${
          fadeOut ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="relative">
          {/* Logo with subtle sparkle animation */}
          <div className="relative">
            <Image
              src="/logo/iroto-logo.png"
              alt="Iroto Realty"
              width={200}
              height={80}
              className="mx-auto"
              priority
            />
            
            {/* Sparkle elements with subtle glow */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Sparkle 1 - Top left */}
              <div className="absolute top-2 left-8 sparkle sparkle-1">
                <div className="w-1 h-1 bg-amber-300 rounded-full"></div>
              </div>
              
              {/* Sparkle 2 - Top right */}
              <div className="absolute top-6 right-12 sparkle sparkle-2">
                <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full"></div>
              </div>
              
              {/* Sparkle 3 - Bottom left */}
              <div className="absolute bottom-4 left-12 sparkle sparkle-3">
                <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
              </div>
              
              {/* Sparkle 4 - Center left */}
              <div className="absolute top-8 left-16 sparkle sparkle-4">
                <div className="w-0.5 h-0.5 bg-yellow-400 rounded-full"></div>
              </div>
              
              {/* Sparkle 5 - Bottom right */}
              <div className="absolute bottom-6 right-8 sparkle sparkle-5">
                <div className="w-1 h-1 bg-yellow-200 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Subtle loading dots */}
          <div className="text-center mt-8">
            <div className="flex items-center justify-center space-x-1">
              <div 
                className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" 
                style={{ animationDelay: '0ms', animationDuration: '1s' }}
              ></div>
              <div 
                className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" 
                style={{ animationDelay: '150ms', animationDuration: '1s' }}
              ></div>
              <div 
                className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" 
                style={{ animationDelay: '300ms', animationDuration: '1s' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes sparkle {
          0%, 30% { 
            opacity: 0; 
            transform: scale(0) rotate(0deg); 
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.2) rotate(180deg); 
          }
          70%, 100% { 
            opacity: 0; 
            transform: scale(0) rotate(360deg); 
          }
        }
        
        .sparkle {
          animation: sparkle 2.5s ease-in-out infinite;
        }
        
        .sparkle-1 { animation-delay: 0.2s; }
        .sparkle-2 { animation-delay: 0.5s; }
        .sparkle-3 { animation-delay: 0.8s; }
        .sparkle-4 { animation-delay: 0.3s; }
        .sparkle-5 { animation-delay: 0.6s; }
      `}</style>
    </>
  );
}