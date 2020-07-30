import * as React from 'react';
import { AddConnectionMenu } from '../features/connections/AddConnectionMenu';
import { client } from '../p2p/singleton';
import { Typography } from '@material-ui/core';
import { ConnectionBubbles } from '../features/connections/ConnectionBubbles';

export function HomePage() {
  return (
    <div>
      <div>
        <AddConnectionMenu />
        <Typography>{client.id}</Typography>
      </div>
      <ConnectionBubbles />
    </div>
  );
}
