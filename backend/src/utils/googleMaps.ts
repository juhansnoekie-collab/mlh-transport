import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export interface DistanceMatrixResult {
  distance: number; // in meters
  duration: number; // in seconds
}

export async function calculateDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<DistanceMatrixResult> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/distancematrix/json',
      {
        params: {
          origins: `${origin.lat},${origin.lng}`,
          destinations: `${destination.lat},${destination.lng}`,
          units: 'metric',
          mode: 'driving',
          key: GOOGLE_MAPS_API_KEY
        }
      }
    );

    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${response.data.status}`);
    }

    const element = response.data.rows[0]?.elements[0];
    if (!element || element.status !== 'OK') {
      throw new Error('Could not calculate distance between locations');
    }

    return {
      distance: element.distance.value, // meters
      duration: element.duration.value  // seconds
    };
  } catch (error) {
    console.error('Distance calculation error:', error);
    throw new Error('Failed to calculate distance');
  }
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address,
          key: GOOGLE_MAPS_API_KEY
        }
      }
    );

    if (response.data.status !== 'OK' || !response.data.results.length) {
      throw new Error('Could not geocode address');
    }

    const location = response.data.results[0].geometry.location;
    return {
      lat: location.lat,
      lng: location.lng
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode address');
  }
}