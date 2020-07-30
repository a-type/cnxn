import * as React from 'react';
import { useSelector } from 'react-redux';
import { connectionsSelector } from './connectionsSlice';
import { Link } from '../../components/Link';
import { ProfileBubble } from '../manifests/ProfileBubble';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  bubble: {
    width: 150,
    height: 150,
    display: 'block',
  },
}));

export function ConnectionBubbles() {
  const classes = useStyles();
  const connections = useSelector(connectionsSelector);

  return (
    <div>
      {connections.map((id) => (
        <Link
          to={`/conversation/${id}`}
          underline="none"
          color="inherit"
          key={id}
          className={classes.bubble}
        >
          <ProfileBubble userId={id} />
        </Link>
      ))}
    </div>
  );
}
