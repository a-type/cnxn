import * as React from 'react';
import {
  makeStyles,
  Theme,
  AppBar,
  Toolbar,
  Typography,
} from '@material-ui/core';
import DarkModeToggle from './DarkModeToggle';
import { Link } from './Link';

export interface NavigationProps {}

const useStyles = makeStyles<Theme, NavigationProps>((theme) => ({
  title: {
    fontSize: theme.typography.pxToRem(18),
    marginRight: theme.spacing(2),
  },
}));

function Navigation(props: {}) {
  const classes = useStyles(props);

  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <Link underline="none" color="inherit" to="/">
          <Typography className={classes.title}>cnxn</Typography>
        </Link>
        <div style={{ marginLeft: 'auto' }}>
          <DarkModeToggle />
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation;
