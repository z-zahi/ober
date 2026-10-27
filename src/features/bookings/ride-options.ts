import type { RideOption } from './types';

export const rideOptions: RideOption[] = [
  { name: 'OberX', description: 'Affordable everyday rides', seats: 4, price: 120 },
  { name: 'OberXL', description: 'More space for your group', seats: 6, price: 200 },
];

export function cheapestOption(options: RideOption[] = rideOptions): RideOption {
  return options.reduce((best, option) => (option.price < best.price ? option : best));
}
