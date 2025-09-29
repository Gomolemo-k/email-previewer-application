import React from 'react';
import styles from './DeviceMockup.module.css';

interface DeviceMockupProps {
  deviceName: string;
  children: React.ReactNode;
  className?: string;
}

const DeviceMockup: React.FC<DeviceMockupProps> = ({ deviceName, children, className = '' }) => {
  const name = deviceName.toLowerCase();

  // Determine device type and orientation
  let deviceClass = '';
  if ((name.includes('iphone') || name.includes('pixel') || name.includes('galaxy')) && !name.includes('tab')) {
    deviceClass = name.includes('landscape') ? 'phone landscape' : 'phone';
  } else if (name.includes('ipad') || name.includes('galaxy tab')) {
    deviceClass = name.includes('landscape') ? 'tablet landscape' : 'tablet';
  } else if (name.includes('macbook')) {
    deviceClass = 'laptop macbook';
  } else if (name.includes('galaxy book')) {
    deviceClass = 'laptop';
  } else if (name.includes('imac')) {
    deviceClass = 'desktop imac';
  } else if (name.includes('display') || name.includes('monitor')) {
    deviceClass = 'desktop';
  } else {
    deviceClass = 'phone'; // fallback
  }

  // Determine if stand or base should be shown
  const showStand = ['laptop', 'imac', 'desktop'].some(type => deviceClass.includes(type));
  const isMacBook = name.includes('macbook');
  const isSamsungLaptop = name.includes('galaxy book');
  const isIMac = name.includes('imac');
  const isAppleDisplay = name.includes('display');
  const isSamsungDisplay = name.includes('samsung') && (name.includes('monitor') || name.includes('all-in-one'));

  return (
    <div className={`${styles.device} ${styles[deviceClass]} ${className}`}>
      {children}
      {/* Add stands and bases dynamically if applicable */}
      {showStand && (
        <>
          {isIMac && (
            <>
              <div className={styles.stand}></div>
              <div className={styles.base}></div>
            </>
          )}
          {isAppleDisplay && (
            <>
              <div className={styles.stand}></div>
              <div className={`${styles.stand} ${styles.base}`}></div>
            </>
          )}
          {isSamsungDisplay && (
            <>
              <div className={styles.stand}></div>
            </>
          )}
          {isMacBook && !isIMac && <div className={styles.stand}></div>}
          {isSamsungLaptop && <div className={styles.stand}></div>}
        </>
      )}
    </div>
  );
};

export default DeviceMockup;
