/**
 * CRA helper to measure Web Vitals in production.
 *
 * WHY it is loaded lazily:
 * - Most apps do not need Web Vitals logging in development.
 * - The dynamic import keeps the initial bundle smaller.
 */
const reportWebVitals = (onPerfEntry) => {
  const hasCallback = Boolean(onPerfEntry);
  const isCallable = typeof onPerfEntry === 'function';

  // If no callback is provided, we do nothing.
  if (!hasCallback || !isCallable) {
    return;
  }

  // Dynamically import `web-vitals` so it doesn't affect the initial bundle.
  import('web-vitals').then((webVitals) => {
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = webVitals;

    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  });
};

export default reportWebVitals;
