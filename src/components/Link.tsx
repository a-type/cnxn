import * as React from 'react';
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from 'react-router-dom';
import { Link as MuiLink, LinkProps as MuiLinkProps } from '@material-ui/core';

export type LinkProps = Omit<RouterLinkProps, 'color'> &
  Pick<MuiLinkProps, 'underline' | 'color'>;

export function Link(props: LinkProps) {
  return <MuiLink component={RouterLink} {...props} />;
}
