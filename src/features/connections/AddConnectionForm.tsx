import * as React from 'react';
import { TextField, Button } from '@material-ui/core';
import { client } from '../../p2p/singleton';

export function AddConnectionForm() {
  const [userId, setUserId] = React.useState('');

  const handleSubmit = React.useCallback(
    (ev: React.FormEvent) => {
      ev.preventDefault();
      client.connect(userId);
    },
    [userId],
  );

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        fullWidth
        value={userId}
        onChange={(ev) => setUserId(ev.target.value)}
        label="User Id"
        margin="normal"
      />
      <Button type="submit">Add</Button>
    </form>
  );
}
