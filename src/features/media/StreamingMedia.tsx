import * as React from 'react';
import { client } from '../../p2p/singleton';

export type StreamingMediaProps = React.HTMLAttributes<HTMLDivElement> & {
  uri: string;
  limit?: number;
};

export function StreamingMedia({
  uri,
  limit,
  style,
  ...rest
}: StreamingMediaProps) {
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    (async () => {
      if (!elementRef.current) {
        console.debug('StreamingMedia element not yet mounted');
        return;
      }
      const media = await client.media.getMedia(uri);

      console.debug(media.name, media.files);

      const list = limit ? media.files.slice(0, limit) : media.files;

      for (const file of list) {
        file.appendTo(elementRef.current, {}, (err, el) => {
          if (err) {
            console.error(err);
            return;
          }
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
        ...style,
      }}
      {...rest}
    />
  );
}
