/**
 * Global types for common data structures
 */

/**
 * A manifest is a mutable document that represents the current
 * status of a user. It includes their ID, the name they prefer to
 * be called, and links to torrents of media they are sharing.
 */
export type Manifest = {
  id: string;
  preferredName: string;
  avatarUri: string;
  statusUri: string;
  recentUris: string[];
};
