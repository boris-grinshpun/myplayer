import express, { json } from 'express';
import cors from 'cors';
import { uploadPlaylistToCDN, loadPlaylistFromCDN, emptyPlaylist } from './cdn.js'
import { UPDATE_INTERVAL } from './constants.js'

const port = 3000
const app = express()
app.use(cors())
app.use(json());
app.set('trust proxy', true)

let users = [];
let cachedPlaylist = []
let intervalId = null

// Adding a new song to the playlist and updating the CDN
// 
// songId - youtube video id
// userId - the id of the client
// id     - row id prevent duplications

app.post('/add', async (request, response) => {
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
})


// subscribe the client to sse and give it an unique id
app.get('/sync/:timestamp', eventsHandler)

function eventsHandler(request, response) {

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
  if (!users.find(user => user.id === newUserId)) {
    users.push(newUser);
    console.log('Connected Users :', users.map(c => c.id))

    // unsubscribe client
    request.on('close', () => {
      users = users.filter(user => user.id !== newUserId)
      console.log(`${newUserId} Connection closed`)
      console.log('Connected Users :', users.map(c => c.id))
      if (users.length === 0) {
        emptyPlaylist()
        clearInterval(intervalId)
        intervalId = null
        cachedPlaylist = []
      } else if (!intervalId) {
        monitorPlaylistChanges()
      }
    });
  }
}

// sends playlist updates to clients
function notifySubscribedClients(diff) {
  users.forEach(client => {
    // exlude songs that were added by current user
    const data = diff.filter(song => song.userId !== client.id)

    client.response.write(`event: diff\ndata: ${JSON.stringify({ data })}\n\n`)
  })
}

// store the playlist from CDN for future comparisonss
setTimeout(async () => {
  cachedPlaylist = await loadPlaylistFromCDN()
  console.log('cachedPlaylist', cachedPlaylist)
}, 0)


// Mimicking a pub/sub service.
// Feching the playlist from the "CDN" every 18sec,
// and comparing it to the old one.
// If it has changes, we're updating the subscribed clients to this node via sse

// Idealy this node should subscribe to a messeging service 
// such as RabbitMQ to get notified about additions to the playlist
// and in turn it will notify its clients about these changes
function monitorPlaylistChanges() {
  intervalId = setInterval(async () => {

    const newPlaylist = await loadPlaylistFromCDN()

    console.log('cachedPlaylist', cachedPlaylist)
    console.log('newPlaylist', newPlaylist)

    if (cachedPlaylist.length !== newPlaylist.length) {
      const diff = newPlaylist.slice(cachedPlaylist.length)

      console.log('diff', diff)
      notifySubscribedClients(diff)
      cachedPlaylist = [...newPlaylist]
    }
  }, UPDATE_INTERVAL)
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})