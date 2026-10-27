import { ScrollView, Text } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { PageTitle, SectionTitle } from '../../components/PageTitle';
import { TripCard } from '../../components/TripCard';
import { useRides } from '../../context/rides-context';
import { splitTrips } from '../../features/bookings/schedule';

export default function TripsScreen() {
  const { rides } = useRides();
  const { upcoming, past } = splitTrips(rides);

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="p-5">
      <PageTitle title="My Trips" subtitle="Rides History" />

      {rides.length === 0 ? (
        <EmptyState title="No trips yet!" message="Your confirmed rides will appear here." />
      ) : (
        <>
          <SectionTitle>Upcoming</SectionTitle>
          {upcoming.length === 0 ? (
            <Text className="mb-6 text-muted">No upcoming rides. Book one from the Home tab.</Text>
          ) : (
            upcoming.map((ride) => <TripCard key={ride.id} ride={ride} />)
          )}

          <SectionTitle>Previous trips</SectionTitle>
          {past.length === 0 ? (
            <Text className="text-muted">Your completed rides will appear here.</Text>
          ) : (
            past.map((ride) => <TripCard key={ride.id} ride={ride} />)
          )}
        </>
      )}
    </ScrollView>
  );
}
