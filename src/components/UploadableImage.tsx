import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { StreamingMedia } from './StreamingMedia';
import { DirectImage } from './DirectImage';

export type UploadableImageProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> & {
  value: File | string | null;
  onChange: (value: File) => any;
};

export const UploadableImage = React.forwardRef<
  HTMLDivElement,
  UploadableImageProps
>(function ({ value, onChange, ...rest }, ref) {
  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      onChange(acceptedFiles[0]);
    },
    [onChange],
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} {...rest} ref={ref}>
      <input {...getInputProps()} />
      {typeof value === 'string' ? (
        <StreamingMedia limit={1} uri={value} />
      ) : !!value ? (
        <DirectImage file={value} />
      ) : null}
    </div>
  );
});
