import * as React from 'react';
import { Grid, IconButton, OutlinedInput } from '@material-ui/core';
import { SendTwoTone } from '@material-ui/icons';

export type ComposeFormProps = {
  onSend: (text: string) => void | Promise<void>;
};

export function ComposeForm({ onSend }: ComposeFormProps) {
  const [text, setText] = React.useState('');
  const handleSubmit = React.useCallback(
    (ev: React.FormEvent) => {
      ev.preventDefault();
      onSend(text);
    },
    [onSend, text],
  );

  return (
    <form onSubmit={handleSubmit}>
      <Grid container>
        <Grid item xs={12} md={10}>
          <OutlinedInput
            fullWidth
            value={text}
            onChange={(ev) => setText(ev.target.value)}
            placeholder="Say something"
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <IconButton type="submit" disabled={!text}>
            <SendTwoTone />
          </IconButton>
        </Grid>
      </Grid>
    </form>
  );
}
