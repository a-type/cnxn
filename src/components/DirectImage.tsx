import * as React from 'react';

export type DirectImageProps = Omit<
  React.HTMLAttributes<HTMLImageElement>,
  'src' | 'srcset'
> & {
  file: File;
};

export const DirectImage = React.forwardRef<HTMLImageElement, DirectImageProps>(
  function ({ file, ...rest }, ref) {
    const urlRef = React.useRef<string>();
    React.useEffect(() => {
      urlRef.current = URL.createObjectURL(file);
    }, [file]);

    return <img src={urlRef.current} alt="" ref={ref} {...rest} />;
  },
);
