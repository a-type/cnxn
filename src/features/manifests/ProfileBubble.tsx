import * as React from 'react';
import { useSelector } from 'react-redux';
import { createUserManifestSelector } from './manifestsSlice';
import { Bubble } from '../../components/Bubble';

export type ProfileBubbleProps = {
  userId: string;
  className?: string;
};

const truncate = (str: string, len: number) => {
  if (str.length < len) return str;
  return str.substr(0, len - 3) + '...';
};

export function ProfileBubble({ userId, ...rest }: ProfileBubbleProps) {
  const manifest = useSelector(createUserManifestSelector(userId));

  return (
    <Bubble
      imageUri={manifest?.avatarUri}
      label={truncate(manifest?.preferredName ?? userId, 24)}
      {...rest}
    />
  );
}
