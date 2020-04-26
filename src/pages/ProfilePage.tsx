import * as React from 'react';
import { Profile } from '../components/Profile';
import { useUser } from '../data/suspense';

export type ProfilePageProps = {};

export function ProfilePage({}: ProfilePageProps) {
  const resource = useUser('user');

  return <Profile user={resource} />;
}
