import level from 'level';

const STORE_NAME = 'cnxnUserStore';

export const userDataStore = level<{}>(STORE_NAME);
