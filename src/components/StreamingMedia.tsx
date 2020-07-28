import * as React from 'react';
import { HostedMedia } from '../p2p/HostedMedia';

export type StreamingMediaProps = {
  media: HostedMedia;
};

export function StreamingMedia({ media }: StreamingMediaProps) {
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!elementRef.current) return;

    for (const file of media.files) {
      file.appendTo(elementRef.current);
    }
  }, [media]);

  return <div ref={elementRef} />;
}
