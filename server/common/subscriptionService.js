import { UPDATE_INTERVAL } from './constants.js'
import { loadPlaylistFromCDN } from './cdn.js'
import GlobalStore  from './GlobalStore.js'

const store = GlobalStore.getInstance()
console.log(store)
// Mimicking a pub/sub service.
// Feching the playlist from the "CDN" every 18sec,
// and comparing it to the old one.
// If it has changes, we're updating the subscribed clients to this node via sse

// Idealy this node should subscribe to a messeging service 
// such as RabbitMQ to get notified about additions to the playlist
// and in turn it will notify its clients about these changes
export function monitorPlaylistChanges() {
    store.intervalId = setInterval(async () => {

        const newPlaylist = await loadPlaylistFromCDN()

        console.log('store.cachedPlaylist', store.cachedPlaylist)
        console.log('newPlaylist', newPlaylist)

        if (store.cachedPlaylist.length !== newPlaylist.length) {
            const diff = newPlaylist.slice(store.cachedPlaylist.length)

            console.log('diff', diff)
            notifySubscribedClients(diff)
            store.cachedPlaylist = [...newPlaylist]
        }
    }, UPDATE_INTERVAL)
}

// sends playlist updates to clients
function notifySubscribedClients(diff) {
    store.users.forEach(client => {
        // exlude songs that were added by current user
        const data = diff.filter(song => song.userId !== client.id)

        client.response.write(`event: diff\ndata: ${JSON.stringify({ data })}\n\n`)
    })
}

export const initPlaylist = () => {

    // store the playlist from CDN for future comparisonss
    setTimeout(async () => {
        store.cachedPlaylist = await loadPlaylistFromCDN()
        console.log('store.cachedPlaylist', store.cachedPlaylist)
    }, 0)
}