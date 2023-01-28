import express, { json } from 'express';
import cors from 'cors';
import { uploadPlaylistToCDN, loadPlaylistFromCDN } from './cdn.js'
import { getDiff } from './utils.js'



const port = 3000
const app = express()
app.use(cors())
app.use(json());
app.set('trust proxy', true)

let users = [];
let cachedPlaylist


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


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



app.get('/sync/:timestamp', eventsHandler)

function eventsHandler(request, response, next) {

  const { timestamp } = request.params
  
  let clientIp = request.headers['x-forwarded-for'] || request.socket.remoteAddress
  clientIp = clientIp.replaceAll(":", "").replaceAll(".", "")
  
  const newUserId = timestamp + clientIp
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };

  response.writeHead(200, headers);
  const data = `event: register\ndata: ${JSON.stringify({ newUserId })}\n\n`;
  response.write(data)

  const newUser = {
    id: newUserId,
    response
  };

  if (!users.find(user => user.id === newUserId)) {
    users.push(newUser);
    console.log('Connected Users :', users.map(c => c.id))
  
    request.on('close', () => {
      users = users.filter(user => user.id !== newUserId)
      console.log(`${newUserId} Connection closed`)
      console.log('Connected Users :', users.map(c => c.id))
    });
  }
}

function sendUpdatesToAll(diff) {
  users.forEach(client => {
    // exlude songs that were added by current user
    const data = diff.filter(song => song.userId !== client.id)

    client.response.write(`event: diff\ndata: ${JSON.stringify({ data })}\n\n`)
  })
}

setInterval(async () => {

  const newPlaylist = await loadPlaylistFromCDN()

  console.log('cachedPlaylist', cachedPlaylist)
  console.log('newPlaylist', newPlaylist)

  if (cachedPlaylist.length !== newPlaylist.length) {
    const diff = getDiff(cachedPlaylist, newPlaylist)
    console.log('diff', diff)
    sendUpdatesToAll(diff)
    cachedPlaylist = [...newPlaylist]
  }
}, 18000)

setTimeout(async () => {
  cachedPlaylist = await loadPlaylistFromCDN()
  console.log('cachedPlaylist', cachedPlaylist)
}, 0)



