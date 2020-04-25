import * as React from 'react';
import { Profile } from '../components/Profile';
import { fetchUser } from '../data/suspense';

export type ProfilePageProps = {};

// TODO: move initial fetch to event handler before page transition
const initialResource = fetchUser('user');

export function ProfilePage({}: ProfilePageProps) {
  const [resource, setResource] = React.useState(initialResource);

  React.useEffect(() => {
    const handleStale = () => {
      setResource(fetchUser('user'));
    };
    resource.onStale(handleStale);
    return () => resource.offStale(handleStale);
  }, [resource, setResource]);

  return <Profile user={resource} />;
}
