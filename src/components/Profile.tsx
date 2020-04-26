import * as React from 'react';
import { makeStyles, Theme, TextField, Button } from '@material-ui/core';
import { SuspenseKeyValue } from '../data/suspense';
import { User } from '../types/models';

export type ProfileProps = {
  user: SuspenseKeyValue<User>;
};

const useStyles = makeStyles<Theme, ProfileProps>((theme) => ({}));

export function Profile(props: ProfileProps) {
  const classes = useStyles(props);
  const { user } = props;

  const profile = user.data;

  const [editName, setEditName] = React.useState(profile.name);

  const handleSubmit = React.useCallback(
    (ev) => {
      ev.preventDefault();
      user.put('name', editName);
    },
    [editName],
  );

  return (
    <div>
      <div>Profile: {profile.name}</div>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          value={editName}
          onChange={(ev) => setEditName(ev.target.value)}
        />
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
}
