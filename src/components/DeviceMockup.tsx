import React from 'react';
import styles from './DeviceMockup.module.css';

interface DeviceMockupProps {
  deviceName: string;
  children: React.ReactNode;
  className?: string;
}

const DeviceMockup: React.FC<DeviceMockupProps> = ({ 
  deviceName, 
  children, 
  className = '' 
}) => {
  const name = deviceName.toLowerCase();
  
  // Determine device type and orientation
  let deviceClass = '';
  if (name.includes('iphone') || name.includes('pixel') || name.includes('galaxy') && !name.includes('tab')) {
    deviceClass = name.includes('landscape') ? 'phone landscape' : 'phone';
  } else if (name.includes('ipad') || name.includes('galaxy tab')) {
    deviceClass = name.includes('landscape') ? 'tablet landscape' : 'tablet';
  } else if (name.includes('macbook') || name.includes('galaxy book')) {
    deviceClass = 'laptop';
  } else if (name.includes('imac') || name.includes('display') || name.includes('monitor')) {
    deviceClass = 'desktop';
  } else {
    deviceClass = 'phone'; // fallback
  }

  return (
    <div className={`${styles.device} ${styles[deviceClass]} ${className}`}>
      {children}
    </div>
  );
};

export default DeviceMockup;