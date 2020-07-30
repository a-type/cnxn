import * as React from 'react';
import { useSelector } from 'react-redux';
import { createUserManifestSelector } from './manifestsSlice';
import { Bubble } from '../../components/Bubble';

export type ProfileBubbleProps = {
  userId: string;
  className?: string;
};

export function ProfileBubble({ userId, ...rest }: ProfileBubbleProps) {
  const manifest = useSelector(createUserManifestSelector(userId));

  return (
    <Bubble
      imageUri={manifest?.avatarUri}
      label={manifest?.preferredName}
      {...rest}
    />
  );
}
