/**
 * Global types for common data structures
 */

export type Manifest = {
  _id: string;
  lastModified: number;
  profileCid: string | null;
  vaultCid: string | null;
};
