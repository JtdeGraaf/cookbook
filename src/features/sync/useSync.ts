import type { SyncErrorCode, SyncStatus } from '@graaf/unsafe-device-sync/client'
import { newPhrase, readPhrase } from '@graaf/unsafe-device-sync/phrase'
import { DUTCH_WORDS } from '@graaf/unsafe-device-sync/words/nl'
import { useState, useSyncExternalStore } from 'react'
import { syncClient } from './sync-client'

/** Why connecting did not work, as the key of its message under `sync.failure`. */
export type ConnectFailure =
  | { reason: 'unknownWords'; words: string[] }
  | { reason: 'wrongWordCount' }
  | { reason: 'spaceNotFound' | 'offline' | 'serverError' }

/** The key of the status line under `sync.status`, or null while this phone does not sync. */
export type StatusMessage = 'busy' | 'upToDate' | 'offline' | 'serverError' | 'spaceNotFound'

export function useSync() {
  const status = useSyncExternalStore(syncClient.subscribe, syncClient.status)
  const [connecting, setConnecting] = useState(false)
  const [failure, setFailure] = useState<ConnectFailure | null>(null)

  async function connect(attempt: () => Promise<'connected' | SyncErrorCode>) {
    setConnecting(true)
    setFailure(null)
    const result = await attempt()
    setConnecting(false)
    if (result !== 'connected') setFailure({ reason: failureReason(result) })
  }

  return {
    status,
    message: statusMessage(status),
    connecting,
    failure,
    startNew: () => connect(() => syncClient.startNew(newPhrase(DUTCH_WORDS))),
    /** Joins with words as someone typed them, or as they came in a scanned link. */
    join(typed: string) {
      const read = readPhrase(typed, DUTCH_WORDS)
      if (read.status === 'unknown-words') return setFailure({ reason: 'unknownWords', words: read.unknownWords })
      if (read.status === 'wrong-word-count') return setFailure({ reason: 'wrongWordCount' })
      void connect(() => syncClient.join(read.phrase))
    },
    leave: () => syncClient.leave(),
    syncNow: () => void syncClient.syncNow(),
  }
}

function statusMessage(status: SyncStatus): StatusMessage | null {
  if (!status.connected) return null
  if (status.problem === 'offline') return 'offline'
  if (status.problem === 'space-not-found') return 'spaceNotFound'
  if (status.problem === 'server-error') return 'serverError'
  if (status.busy || status.waitingChanges > 0) return 'busy'
  return 'upToDate'
}

function failureReason(code: SyncErrorCode): 'spaceNotFound' | 'offline' | 'serverError' {
  if (code === 'space-not-found') return 'spaceNotFound'
  if (code === 'offline') return 'offline'
  return 'serverError'
}
