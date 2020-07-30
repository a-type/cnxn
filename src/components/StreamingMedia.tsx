import * as React from 'react';
import { client } from '../p2p/singleton';

export type StreamingMediaProps = {
  uri: string;
  limit?: number;
};

export function StreamingMedia({ uri, limit }: StreamingMediaProps) {
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    (async () => {
      if (!elementRef.current) return;
      const media = await client.getMedia(uri);

      const list = limit ? media.files.slice(0, limit) : media.files;

      for (const file of list) {
        file.appendTo(elementRef.current, {}, (err, el) => {
          el.style.width = '100%';
        });
      }

      elementRef.current.style.gridTemplateColumns = `repeat(${Math.ceil(
        list.length / 2,
      )}, 1fr)`;
      elementRef.current.style.gridTemplateRows = `repeat(${Math.ceil(
        list.length / 2,
      )}, 1fr)`;
    })();
  }, [uri, limit]);

  return (
    <div
      ref={elementRef}
      style={{
        display: 'grid',
      }}
    />
  );
}
