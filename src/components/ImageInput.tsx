import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { StreamingMedia } from '../features/media/StreamingMedia';

export type ImageInputProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> & {
  value: string | null;
  onChange: (value: File) => any;
};

export const ImageInput = React.forwardRef<HTMLDivElement, ImageInputProps>(
  function ({ value, onChange, ...rest }, ref) {
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
        ) : (
          <div />
        )}
      </div>
    );
  },
);
