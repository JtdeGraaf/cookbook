import { cloudflareSpaces, SyncSpace } from '@graaf/unsafe-device-sync/cloudflare'
import { handleSyncRequest } from '@graaf/unsafe-device-sync/server'

/** The Durable Object class must be exported from the Worker's main module. */
export { SyncSpace }

type Env = { SYNC_SPACES: DurableObjectNamespace<SyncSpace> }

/** Only /api/* reaches this Worker (see run_worker_first); every other path is served from the built site. */
export default {
  fetch: (request, env) => handleSyncRequest(request, cloudflareSpaces(env.SYNC_SPACES), '/api/sync'),
} satisfies ExportedHandler<Env>
