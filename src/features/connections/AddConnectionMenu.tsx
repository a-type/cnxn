import * as React from 'react';
import { IconButton, Dialog, DialogContent } from '@material-ui/core';
import { PersonAdd } from '@material-ui/icons';
import { AddConnectionForm } from './AddConnectionForm';

export function AddConnectionMenu() {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <>
      <IconButton onClick={() => setDialogOpen(true)}>
        <PersonAdd />
      </IconButton>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogContent>
          <AddConnectionForm />
        </DialogContent>
      </Dialog>
    </>
  );
}
