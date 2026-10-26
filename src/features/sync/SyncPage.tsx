import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Icon } from '@/components/Icon'
import { usePageTitle } from '@/components/usePageTitle'
import { useJoinCode, useJoinLink } from './useJoinLink'
import { useSync, type ConnectFailure, type StatusMessage } from './useSync'
import './sync.css'

/**
 * Sharing the book between phones. The first phone starts; every other phone scans its code or types its four words.
 * A scanned link asks once, then connects.
 */
export function SyncPage() {
  const { t } = useTranslation()
  const sync = useSync()
  const { linkedPhrase, dismiss } = useJoinLink()
  usePageTitle(t('sync.title'))

  const connectedPhrase = sync.status.connected ? sync.status.phrase : null
  // A link to the space this phone already shares has nothing left to ask.
  useEffect(() => {
    if (linkedPhrase !== null && linkedPhrase === connectedPhrase) dismiss()
  }, [linkedPhrase, connectedPhrase, dismiss])

  return (
    <section className="sync">
      <h1 className="sync__title">{t('sync.title')}</h1>
      <SyncBody sync={sync} linkedPhrase={linkedPhrase} connectedPhrase={connectedPhrase} onDismissLink={dismiss} />
      <p className="sync__warning">
        <Icon name="info" size={18} />
        {t('sync.unsafe')}
      </p>
    </section>
  )
}

type SyncBodyProps = {
  sync: ReturnType<typeof useSync>
  linkedPhrase: string | null
  connectedPhrase: string | null
  onDismissLink: () => void
}

function SyncBody({ sync, linkedPhrase, connectedPhrase, onDismissLink }: SyncBodyProps) {
  if (linkedPhrase !== null && linkedPhrase !== connectedPhrase) {
    return (
      <JoinFromLink
        phrase={linkedPhrase}
        connecting={sync.connecting}
        failure={sync.failure}
        onConnect={() => sync.join(linkedPhrase)}
        onDismiss={onDismissLink}
      />
    )
  }
  if (connectedPhrase !== null) {
    return <Connected phrase={connectedPhrase} message={sync.message} onSyncNow={sync.syncNow} onLeave={sync.leave} />
  }
  return (
    <NotConnected
      connecting={sync.connecting}
      failure={sync.failure}
      onStart={() => void sync.startNew()}
      onJoin={sync.join}
    />
  )
}

type NotConnectedProps = {
  connecting: boolean
  failure: ConnectFailure | null
  onStart: () => void
  onJoin: (typed: string) => void
}

function NotConnected({ connecting, failure, onStart, onJoin }: NotConnectedProps) {
  const { t } = useTranslation()
  const [typed, setTyped] = useState('')
  return (
    <>
      <p className="sync__intro">{t('sync.intro')}</p>
      <button type="button" className="button" onClick={onStart} disabled={connecting}>
        <Icon name="sync" />
        {t('sync.start')}
      </button>

      <form
        className="sync__join"
        onSubmit={(event) => {
          event.preventDefault()
          onJoin(typed)
        }}
      >
        <h2 className="sync__subtitle">{t('sync.haveWords')}</h2>
        <p className="sync__hint">{t('sync.haveWordsHint')}</p>
        <label className="sync__label" htmlFor="sync-words">
          {t('sync.wordsLabel')}
        </label>
        <div className="sync__field-row">
          <input
            id="sync-words"
            className="sync__field"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder={t('sync.wordsPlaceholder')}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={failure !== null}
            aria-describedby={failure ? 'sync-failure' : undefined}
          />
          <button type="submit" className="button button--quiet" disabled={connecting || typed.trim() === ''}>
            {t(connecting ? 'sync.connecting' : 'sync.connect')}
          </button>
        </div>
        <FailureMessage failure={failure} />
      </form>
    </>
  )
}

type JoinFromLinkProps = {
  phrase: string
  connecting: boolean
  failure: ConnectFailure | null
  onConnect: () => void
  onDismiss: () => void
}

function JoinFromLink({ phrase, connecting, failure, onConnect, onDismiss }: JoinFromLinkProps) {
  const { t } = useTranslation()
  return (
    <div className="sync__card">
      <h2 className="sync__subtitle">{t('sync.linkQuestion')}</h2>
      <Words phrase={phrase} />
      <p className="sync__hint">{t('sync.linkExplain')}</p>
      <div className="sync__actions">
        <button type="button" className="button" onClick={onConnect} disabled={connecting}>
          {t(connecting ? 'sync.connecting' : 'sync.connect')}
        </button>
        <button type="button" className="button button--quiet" onClick={onDismiss} disabled={connecting}>
          {t('sync.notNow')}
        </button>
      </div>
      <FailureMessage failure={failure} />
    </div>
  )
}

type ConnectedProps = {
  phrase: string
  message: StatusMessage | null
  onSyncNow: () => void
  onLeave: () => void
}

function Connected({ phrase, message, onSyncNow, onLeave }: ConnectedProps) {
  const { t } = useTranslation()
  const [askingToLeave, setAskingToLeave] = useState(false)
  const code = useJoinCode(phrase)
  return (
    <>
      <p className="sync__status" data-message={message} aria-live="polite">
        <Icon name={message === 'upToDate' ? 'check' : 'sync'} size={20} />
        {message && t(`sync.status.${message}`)}
      </p>

      <div className="sync__card sync__share">
        <svg
          className="join-code"
          viewBox={`-2 -2 ${code.size + 4} ${code.size + 4}`}
          role="img"
          aria-label={t('sync.codeLabel')}
        >
          <rect className="join-code__light" x={-2} y={-2} width={code.size + 4} height={code.size + 4} />
          <path className="join-code__dark" d={code.path} />
        </svg>
        <div className="sync__share-text">
          <h2 className="sync__subtitle">{t('sync.scanTitle')}</h2>
          <p className="sync__hint">{t('sync.scanHint')}</p>
          <h3 className="sync__words-title">{t('sync.wordsTitle')}</h3>
          <Words phrase={phrase} />
          <p className="sync__hint">{t('sync.wordsHint')}</p>
        </div>
      </div>

      <div className="sync__actions">
        <button type="button" className="button button--quiet" onClick={onSyncNow}>
          <Icon name="sync" />
          {t('sync.syncNow')}
        </button>
        <button type="button" className="text-button" onClick={() => setAskingToLeave(true)}>
          {t('sync.leave')}
        </button>
      </div>

      <ConfirmDialog
        open={askingToLeave}
        title={t('sync.leaveQuestion')}
        explanation={t('sync.leaveExplain')}
        confirmLabel={t('sync.leave')}
        cancelLabel={t('sync.keepSyncing')}
        onConfirm={() => {
          onLeave()
          setAskingToLeave(false)
        }}
        onCancel={() => setAskingToLeave(false)}
      />
    </>
  )
}

/** The four words, large and apart, to read aloud or copy onto a card. */
function Words({ phrase }: { phrase: string }) {
  return (
    <ol className="sync__words">
      {phrase.split('-').map((word, index) => (
        <li key={index}>{word}</li>
      ))}
    </ol>
  )
}

function FailureMessage({ failure }: { failure: ConnectFailure | null }) {
  const { t } = useTranslation()
  if (!failure) return null
  return (
    <p id="sync-failure" className="sync__failure" role="alert">
      {failure.reason === 'unknownWords'
        ? t('sync.failure.unknownWords', { words: failure.words.join(', ') })
        : t(`sync.failure.${failure.reason}`)}
    </p>
  )
}
