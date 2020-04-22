import { createMuiTheme } from '@material-ui/core';
import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';
import colors from './colors';
import { generateShadows } from './shadows';

const baseDarkPalette: ThemeOptions['palette'] = {
  type: 'dark',
  text: {
    primary: colors.white,
  },
  primary: {
    main: colors.bright,
  },
  secondary: {
    main: colors.dark,
  },
  background: {
    default: colors.black,
    paper: colors.medium,
  },
};
const baseLightPalette: ThemeOptions['palette'] = {
  type: 'light',
  text: {
    primary: colors.black,
  },
  primary: {
    main: colors.black,
  },
  secondary: {
    main: colors.medium,
  },
  background: {
    default: colors.bright,
    paper: colors.white,
  },
};

const { palette: lightPalette } = createMuiTheme({ palette: baseLightPalette });
const { palette: darkPalette } = createMuiTheme({ palette: baseDarkPalette });

const themeFactory = (
  palette: ThemeOptions['palette'],
  shadows: ThemeOptions['shadows'],
) =>
  createMuiTheme({
    palette,
    shape: {},
    shadows,
    overrides: {
      MuiAppBar: {
        colorDefault: {
          backgroundColor: 'transparent',
        },
      },
    },
    props: {
      MuiTextField: {
        variant: 'outlined',
      },
      MuiButton: {
        color: 'primary',
      },
      MuiLink: {
        underline: 'always',
      },
    },
  });

export const lightTheme = themeFactory(lightPalette, generateShadows());
export const darkTheme = themeFactory(
  darkPalette,
  generateShadows(colors.blackRgb, colors.trueBlackRgb),
);
