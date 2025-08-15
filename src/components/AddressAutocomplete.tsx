import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressAutocompleteProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceResolved: (place: google.maps.places.PlaceResult | null) => void;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ id, label, placeholder, value, onChange, onPlaceResolved }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!inputRef.current || !(window as any).google?.maps?.places) return;

    const ac = new (window as any).google.maps.places.Autocomplete(inputRef.current!, {
      fields: ['formatted_address', 'geometry', 'place_id', 'name'],
      componentRestrictions: { country: 'za' },
    });
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      onPlaceResolved(place && place.geometry ? place : null);
      if (place?.formatted_address) {
        onChange(place.formatted_address);
      }
    });
    setAutocomplete(ac);

    return () => {
      if (ac) {
        (window as any).google.maps.event.clearInstanceListeners(ac);
      }
    };
  }, [inputRef.current]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} ref={inputRef} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
};

export default AddressAutocomplete;
