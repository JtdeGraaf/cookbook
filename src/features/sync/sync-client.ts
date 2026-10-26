import {
  createSyncClient,
  httpSyncServer,
  keepInStep,
  parseSyncState,
  type LocalData,
  type SavedSyncState,
} from '@graaf/unsafe-device-sync/client'
import { forget, onChangeElsewhere, onSavedHere, readSaved, save, saveFromAnotherDevice, savedKeys } from '@/lib/storage'
import { isSyncedKey, mergeSyncedValues } from '@/lib/synced-data'

const SYNC_KEY = 'sync'

const local: LocalData = {
  syncedKeys: () => savedKeys().filter(isSyncedKey),
  isSynced: isSyncedKey,
  read: (key) => readSaved(key, (value) => value),
  write: saveFromAnotherDevice,
}

const savedState: SavedSyncState = {
  load: () => readSaved(SYNC_KEY, parseSyncState),
  save: (state) => (state === null ? forget(SYNC_KEY) : save(SYNC_KEY, state)),
}

/** The one sync client of this tab. Both book addresses share one space, so the app name is the same for both. */
export const syncClient = createSyncClient({
  appName: 'cookbook',
  server: httpSyncServer('/api/sync'),
  local,
  savedState,
  merge: mergeSyncedValues,
})

onSavedHere((key) => {
  if (isSyncedKey(key)) syncClient.recordChange(key)
})

// Joining or leaving in another tab changes this tab's status too.
onChangeElsewhere((key) => {
  if (key === null || key === SYNC_KEY) syncClient.stateChangedElsewhere()
})

/** Syncs now, when the book comes back into view or online, and every half minute while it is open. */
export function keepSyncing(): void {
  keepInStep(syncClient)
}
