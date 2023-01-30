import express, { json } from 'express';
import cors from 'cors';
import { eventSyncHandler, addSongHandler } from './endPointHandlers.js'
import { initPlaylist } from './utils/subscriptionService.js';


const port = 3000
const app = express()
app.use(cors())
app.use(json());
app.set('trust proxy', true)

// Adding a new song to the playlist and updating the CDN

app.post('/add', addSongHandler)

// subscribe the client to sse and give it an unique id
app.get('/sync/:timestamp', eventSyncHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

initPlaylist()