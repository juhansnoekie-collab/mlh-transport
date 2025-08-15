let googleMapsPromise: Promise<void> | null = null;

export function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window !== 'undefined' && (window as any).google?.maps) {
    return Promise.resolve();
  }
  if (!apiKey) {
    return Promise.reject(new Error('Missing Google Maps API key'));
  }
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById('google-maps-script');
    if (existing) {
      (existing as HTMLScriptElement).addEventListener('load', () => resolve());
      (existing as HTMLScriptElement).addEventListener('error', (e) => reject(e));
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&region=ZA`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
