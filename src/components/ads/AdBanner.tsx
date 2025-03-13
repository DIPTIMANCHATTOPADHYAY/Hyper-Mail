import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
}

export function AdBanner({ slot, format = 'auto', className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Skip if already initialized
    if (initialized.current || !adRef.current) return;

    const currentAd = adRef.current;
    let retryCount = 0;
    const maxRetries = 5;

    const tryInitAd = () => {
      if (retryCount >= maxRetries) {
        console.error('Failed to initialize AdSense after multiple attempts');
        return;
      }

      if (typeof (window as any).adsbygoogle === 'undefined') {
        retryCount++;
        setTimeout(tryInitAd, 100 * Math.pow(2, retryCount)); // Exponential backoff
        return;
      }

      try {
        // Check if this ad unit is already initialized
        const adElement = currentAd.querySelector('.adsbygoogle');
        if (adElement && (adElement as any).dataset.adsbygoogleStatus === 'done') {
          return;
        }

        // Initialize the ad
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
        initialized.current = true;
      } catch (error) {
        console.error('Error initializing AdSense:', error);
      }
    };

    // Start initialization attempt
    tryInitAd();

    return () => {
      initialized.current = false;
    };
  }, []);

  const getAdStyle = () => {
    switch (format) {
      case 'horizontal':
        return { display: 'block', minHeight: '90px', width: '100%' };
      case 'vertical':
        return { display: 'block', minHeight: '600px', width: '160px' };
      case 'rectangle':
        return { display: 'block', minHeight: '250px', width: '300px' };
      default:
        return { display: 'block', minHeight: '100px', width: '100%' };
    }
  };

  return (
    <div ref={adRef} className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={getAdStyle()}
        data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        data-adtest="on"
      />
    </div>
  );
}