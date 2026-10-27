import { createContext, useContext, useState, type ReactNode } from 'react';

import type { SavedPlace } from '../features/account/types';
import { validatePlace } from '../features/account/validation';
import { demoPlaces } from '../features/demo-data';
import { newId } from '../lib/format';
import { useAuth } from './auth-context';

type PlacesContextType = {
  /** Saved places of the signed-in user. */
  places: SavedPlace[];
  addPlace: (label: string, address: string) => string | null;
  removePlace: (id: string) => void;
};

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

export function PlacesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [allPlaces, setAllPlaces] = useState<SavedPlace[]>(demoPlaces);

  const places = allPlaces.filter((place) => place.userId === user?.id);

  const addPlace = (label: string, address: string) => {
    if (!user) return 'Sign in to save places.';
    const error = validatePlace(label, address, places);
    if (error) return error;
    const place: SavedPlace = { id: newId(), userId: user.id, label: label.trim(), address: address.trim() };
    setAllPlaces((current) => [...current, place]);
    return null;
  };

  return (
    <PlacesContext.Provider
      value={{
        places,
        addPlace,
        removePlace: (id) => setAllPlaces((current) => current.filter((place) => place.id !== id)),
      }}>
      {children}
    </PlacesContext.Provider>
  );
}

export function usePlaces() {
  const context = useContext(PlacesContext);

  if (!context) {
    throw new Error('usePlaces must be used inside PlacesProvider');
  }

  return context;
}
