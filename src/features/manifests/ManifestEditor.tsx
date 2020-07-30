import * as React from 'react';
import { makeStyles, Theme, Box, TextField, BoxProps } from '@material-ui/core';
import { UploadableImage } from '../../components/UploadableImage';
import { useDispatch, useSelector } from 'react-redux';
import { client } from '../../p2p/singleton';
import { setUserManifest, createUserManifestSelector } from './manifests';

export type ManifestEditorProps = BoxProps & {
  userId: string;
};

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
  const { userId, ...rest } = props;

  const dispatch = useDispatch();

  const manifest = useSelector(createUserManifestSelector(client.id));

  const handleAvatarChange = React.useCallback(
    async (file: File) => {
      const hosted = await client.uploadMedia(file);
      dispatch(
        setUserManifest({
          ...manifest,
          id: userId,
          avatarUri: hosted.address,
        }),
      );
    },
    [manifest, dispatch, userId],
  );

  const handlePreferredNameChange = React.useCallback(
    async (name: string) => {
      dispatch(
        setUserManifest({
          ...manifest,
          id: userId,
          preferredName: name,
        }),
      );
    },
    [dispatch, manifest, userId],
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-center"
      {...rest}
    >
      <UploadableImage
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
