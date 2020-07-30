import * as React from 'react';
import { makeStyles, Theme, Box, TextField, BoxProps } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { client } from '../../p2p/singleton';
import { setUserManifest, createUserManifestSelector } from './manifestsSlice';
import { UploadableMedia } from '../media/UploadableMedia';
import { RemoteMedia } from '../../media/RemoteMedia';

export type ManifestEditorProps = BoxProps & {};

const useStyles = makeStyles<Theme, ManifestEditorProps>((theme) => ({
  avatar: {
    width: 400,
    height: 400,
    borderRadius: '100%',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    margin: 'auto',
    marginBottom: theme.spacing(3),
  },
}));

export function ManifestEditor(props: ManifestEditorProps) {
  const classes = useStyles(props);

  const dispatch = useDispatch();

  const manifest = useSelector(createUserManifestSelector(client.id));

  const handleAvatarChange = React.useCallback(
    async (remoteMedia: RemoteMedia) => {
      dispatch(
        setUserManifest({
          ...manifest,
          id: client.id,
          avatarUri: remoteMedia.uri,
        }),
      );
    },
    [manifest, dispatch],
  );

  const handlePreferredNameChange = React.useCallback(
    async (name: string) => {
      dispatch(
        setUserManifest({
          ...manifest,
          id: client.id,
          preferredName: name,
        }),
      );
    },
    [dispatch, manifest],
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-center"
      {...props}
    >
      <UploadableMedia
        value={manifest?.avatarUri}
        onChange={handleAvatarChange}
        className={classes.avatar}
      />
      <TextField
        label="Preferred name"
        helperText="This is the default name offered to friends when they connect"
        value={manifest?.preferredName ?? ''}
        onChange={(ev) => handlePreferredNameChange(ev.target.value)}
      />
    </Box>
  );
}
