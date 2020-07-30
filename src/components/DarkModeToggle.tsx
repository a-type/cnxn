import React, { FC } from 'react';
import { IconButton } from '@material-ui/core';
import { useDarkMode } from '../contexts/DarkModeContext';
import { Brightness2, Brightness7 } from '@material-ui/icons';

export interface DarkModeToggleProps {}

const DarkModeToggle: FC<DarkModeToggleProps> = () => {
  const { dark, set } = useDarkMode();

  return (
    <IconButton onClick={() => set(!dark)}>
      {dark ? <Brightness7 /> : <Brightness2 />}
    </IconButton>
  );
};

export default DarkModeToggle;
