import * as React from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import { StreamingMedia } from '../features/media/StreamingMedia';
import clsx from 'clsx';

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
    width: '66%',
    height: '66%',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
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
        <svg viewBox="0 0 150 150" className={classes.label}>
          <path
            d={`
              M 25, 75
              a 50,50 0 1,1 100,0
              a 50,50 0 1,1 -100,0
            `}
            id="arc"
            fill="none"
            stroke="none"
          />
          <text textLength="600" fill="white">
            <textPath xlinkHref="#arc" startOffset="25%">
              {label}
            </textPath>
          </text>
        </svg>
      )}
    </div>
  );
}
