import * as React from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import { StreamingMedia } from '../features/media/StreamingMedia';
import clsx from 'clsx';
import { ArcPath } from './ArcPath';

export type BubbleProps = React.HTMLAttributes<HTMLDivElement> & {
  label?: string;
  imageUri?: string;
};

const useStyles = makeStyles<Theme, BubbleProps>((theme) => ({
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: '100%',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  label: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    zIndex: 1,
  },
}));

export function Bubble(props: BubbleProps) {
  const classes = useStyles(props);
  const { imageUri, className, label, ...rest } = props;

  return (
    <div className={clsx(classes.root, className)} {...rest}>
      {imageUri ? (
        <StreamingMedia className={classes.avatar} uri={imageUri} />
      ) : (
        <div className={classes.avatar} />
      )}
      {label && (
        <svg viewBox="0 0 100 100" className={classes.label}>
          <ArcPath
            x={50}
            y={50}
            startDegrees={0}
            endDegrees={160}
            radius={50}
            id="arc"
          />
          <text textLength="600" fill="white">
            <textPath xlinkHref="#arc" {...({ side: 'right' } as any)}>
              {label}
            </textPath>
          </text>
        </svg>
      )}
    </div>
  );
}
