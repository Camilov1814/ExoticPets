import React, { useEffect, useState } from 'react';
import { trackSearch, trackCategoryFilter, trackAddToCart } from '../utils/analytics';

const AnalyticsDebug = () => {
  const [gtagLoaded, setGtagLoaded] = useState(false);
  const [dataLayerExists, setDataLayerExists] = useState(false);
  const [isCloudFront, setIsCloudFront] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Verificar si gtag está disponible
    const checkGtag = () => {
      const hasGtag = typeof window !== 'undefined' && typeof window.gtag === 'function';
      const hasDataLayer = typeof window !== 'undefined' && Array.isArray(window.dataLayer);
      const isLocalhost = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('localhost'));
      const hasScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
      
      // Verificar conexión de red a Google Analytics
      const testGAConnection = () => {
        fetch('https://www.google-analytics.com/g/collect', {
          method: 'HEAD',
          mode: 'no-cors'
        }).then(() => {
          console.log('🌐 GA Network: Connection successful');
        }).catch((error) => {
          console.warn('⚠️ GA Network: Connection issue', error);
        });
      };
      
      setGtagLoaded(hasGtag);
      setDataLayerExists(hasDataLayer);
      setIsCloudFront(!isLocalhost);
      setScriptLoaded(!!hasScript);
      
      const debugInfo = {
        gtag: hasGtag,
        dataLayer: hasDataLayer,
        dataLayerLength: hasDataLayer ? window.dataLayer.length : 0,
        domain: window.location.hostname,
        isLocalhost: isLocalhost,
        scriptExists: !!hasScript,
        url: window.location.href,
        userAgent: navigator.userAgent.substring(0, 50) + '...',
        timestamp: new Date().toISOString()
      };
      
      if (isLocalhost) {
        console.log('%c🏠 LOCALHOST DEBUG:', 'background: green; color: white; padding: 5px;', debugInfo);
        testGAConnection();
      } else {
        console.log('🔍 Analytics Debug:', debugInfo);
      }
    };

    // Verificar inmediatamente
    checkGtag();
    
    // Verificar después de delays progresivos
    const timeout1 = setTimeout(checkGtag, 1000);
    const timeout2 = setTimeout(checkGtag, 3000);
    const timeout3 = setTimeout(checkGtag, 5000);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, []);

  const testEvent = () => {
    console.log(!isCloudFront ? '%c🧪 LOCALHOST - Enviando evento de prueba...' : '🧪 Enviando evento de prueba...', 
                !isCloudFront ? 'background: green; color: white;' : '');
    
    // Test different events
    trackSearch('reptil test', 5);
    trackCategoryFilter('Reptiles', 3);
    
    // Test product add to cart
    const testProduct = {
      id: 'test-product',
      name: 'Gecko Test',
      category: 'Reptiles',
      price: 150,
      color: 'Verde'
    };
    trackAddToCart(testProduct);
    
    console.log('✅ Test events sent to Google Analytics from localhost');
  };

  const testNetworkRequest = () => {
    // Simular evento y verificar peticiones de red
    console.log('%c📡 Verificando peticiones de red...', 'background: purple; color: white;');
    fetch('https://www.google-analytics.com/g/collect', {
      method: 'POST',
      mode: 'no-cors'
    }).catch(() => {
      console.log('Network test completed - check Network tab for GA requests');
    });
    testEvent();
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: !isCloudFront ? 'rgba(0,128,0,0.9)' : 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      minWidth: '200px'
    }}>
      <h4>{!isCloudFront ? '🏠 LOCALHOST' : '🔧'} Analytics Debug</h4>
      <div>gtag: {gtagLoaded ? '✅' : '❌'}</div>
      <div>dataLayer: {dataLayerExists ? '✅' : '❌'}</div>
      <div>script: {scriptLoaded ? '✅' : '❌'}</div>
      <div>domain: {window.location.hostname}</div>
      <button 
        onClick={testEvent}
        style={{
          marginTop: '5px',
          padding: '5px 10px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
          display: 'block',
          width: '100%',
          marginBottom: '5px'
        }}
      >
        Test Event
      </button>
      {(
        <button 
          onClick={testNetworkRequest}
          style={{
            padding: '5px 10px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            display: 'block',
            width: '100%',
            fontSize: '11px'
          }}
        >
          🔍 Test Network
        </button>
      )}
    </div>
  );
};

export default AnalyticsDebug;