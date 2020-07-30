import * as React from 'react';
import { ImageInput } from '../../components/ImageInput';
import { client } from '../../p2p/singleton';
import { RemoteMedia } from '../../media/RemoteMedia';

export type UploadableMediaProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> & {
  onChange: (remoteMedia: RemoteMedia) => any;
  value: string | null;
};

export function UploadableMedia({
  value,
  onChange,
  ...rest
}: UploadableMediaProps) {
  const handleChange = React.useCallback(
    async (file: File) => {
      const remoteMedia = await client.media.seedMedia(file);
      onChange(remoteMedia);
    },
    [onChange],
  );

  return <ImageInput value={value} onChange={handleChange} {...rest} />;
}
