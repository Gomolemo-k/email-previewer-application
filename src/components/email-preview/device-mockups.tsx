'use client';

import React from 'react';
import './device-mockups.css';

interface DeviceMockupProps {
  children: React.ReactNode;
  deviceType: 'laptop' | 'desktop' | 'tablet' | 'mobile' | '4k' | 'small-mobile';
  title?: string;
}

const DeviceMockup = ({ children, deviceType, title }: DeviceMockupProps) => {
  // Map deviceType to CSS classes based on the CodePen implementation
  const getDeviceClass = () => {
    switch (deviceType) {
      case 'laptop':
        return 'device laptop';
      case 'desktop':
        return 'device desktop';
      case 'tablet':
        return 'device tablet';
      case 'mobile':
      case 'small-mobile':
        return 'device phone';
      case '4k':
        return 'device desktop';
      default:
        return 'device';
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className={getDeviceClass()}>
        <div className="w-full h-full overflow-hidden">
          {children}
        </div>
      </div>
      {title && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600">
          {title}
        </div>
      )}
    </div>
  );
};

export default DeviceMockup;