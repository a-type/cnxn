import * as React from 'react';
import { makeStyles, Theme } from '@material-ui/core';

export type ProfileEditorProps = {};

const useStyles = makeStyles<Theme, ProfileEditorProps>((theme) => ({}));

export function ProfileEditor(props: ProfileEditorProps) {
  const classes = useStyles(props);
  const {} = props;

  return null;
}
