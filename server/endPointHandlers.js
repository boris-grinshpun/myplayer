import { monitorPlaylistChanges } from './utils/subscriptionService.js'
import { uploadPlaylistToCDN, emptyPlaylist } from './utils/cdn.js'
import { store } from './utils/globalStore.js'

export const eventSyncHandler = (request, response) => {

    const { timestamp } = request.params

    let clientIp = request.headers['x-forwarded-for'] || request.socket.remoteAddress
    clientIp = clientIp.replaceAll(":", "").replaceAll(".", "")

    const newUserId = timestamp + clientIp
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };

    // sending unique user id to the client 
    response.writeHead(200, headers);
    const data = `event: register\ndata: ${JSON.stringify({ userId: newUserId })}\n\n`;
    response.write(data)

    const newUser = {
        id: newUserId,
        response
    };

    // subscribe new client to recieve updates
    if (!store.users.find(user => user.id === newUserId)) {
        store.users.push(newUser);
        console.log('Connected store.Users :', store.users.map(c => c.id))
        if (!store.intervalId && store.users.length > 1) {
            console.log('started monitoring')
            monitorPlaylistChanges()
        }
        // unsubscribe client
        request.on('close', () => {
            store.users = store.users.filter(user => user.id !== newUserId)
            console.log(`${newUserId} Connection closed`)
            console.log('Connected store.Users :', store.users.map(c => c.id))
            if (store.users.length === 1) {
                clearInterval(store.intervalId)
                store.intervalId = null
                console.log('stopped listening...')
            }
            if (store.users.length === 0) {
                emptyPlaylist()
                store.cachedPlaylist = []
                console.log('playlist cleared...')
            }
        });
    }
}

export const addSongHandler = async (request, response) => {
    const { songId, userId, id } = request.body
    console.log('adding...', songId, userId)
    try {
        const newPlaylist = await loadPlaylistFromCDN()
        newPlaylist.push({ songId, userId, id })
        await uploadPlaylistToCDN(newPlaylist)
        console.log('added...', songId, userId)

        return response.status(200).send({ message: "ok" })
    } catch (err) {
        return response.status(409).send({ message: err })
    }
}
