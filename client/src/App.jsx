import { useEffect, useState } from 'react'
import './App.css'
import Player from './components/player/Player'
import Playlist from './components/playlist/Playlist'
import Search from './components/search/Search'
import {
  PLAYLIST_DIFF_EVENT,
  SUBSCTIPTION_URL,
  UPDATE_PLAYLIST_URL,
  CDN_DEV_PLAYLIST_URL,
  USER_REGISTRATION_EVENT
} from './core/constants'


function App() {
  const [playlist, setPlaylist] = useState([])
  const [diff, setDiff] = useState([])
  const [userId, setUserId] = useState("")
  const [connected, setConnected] = useState(false)

  // fetch initial playlist from cdn, could be empty
  useEffect(() => {
    try {
      (async () => {
        const res = await fetch(CDN_DEV_PLAYLIST_URL, {
          mode: 'cors'
        })

        const list = await res.json()

        if (list.data.length) {
          setPlaylist([...list.data])
        }
      })()
    } catch (err) {
      console.log(err)
    }
  }, [])

  // connect to server side events to get playlist updates
  useEffect(() => {
    if (!connected) {
      try {
        const clientTimestamp = Date.now()
        const evtSource = new EventSource(`${SUBSCTIPTION_URL}/${clientTimestamp}`, {
          withCredentials: false,
        });
        evtSource.addEventListener(`${USER_REGISTRATION_EVENT}`, (event) => {
          const data = JSON.parse(event.data)
          setUserId(data.userId)
        })
        evtSource.addEventListener(PLAYLIST_DIFF_EVENT, (event) => {
          const response = JSON.parse(event.data)
          if (response.data.length) {
            setDiff(response.data)
          }
        })
      } catch (err) {
        console.log(err)
      }
      setConnected(true)
    }
  }, [connected])

  // update playlist when songs are added by other clients
  useEffect(() => {
    if (diff) {
      const uniqueSongs = diff.filter(song => {
        const res = playlist.find(item => item.ifd === song.id)
        if (res === undefined) return true
        return false
      })
      if (uniqueSongs && uniqueSongs.length)
        setPlaylist([...playlist, ...uniqueSongs])
    }
  }, [diff])

  // 1. update playlist when new song is added
  // 2. send a request to update the playlist on cdn
  const addSongHandler = async (songId) => {
    const id = userId + Date.now()
    setPlaylist([...playlist, { userId, songId, id }])
    try {
      const res = await fetch(UPDATE_PLAYLIST_URL, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ userId, songId, id })
      })
    } catch (err) {
      console.log(err)
    }
  }
  // play next song handler
  const onSongEndHandler = () => {
    if (playlist.length) {
      setPlaylist([...playlist.slice(1)])
    }
  }

  const songId = playlist.length ? playlist[0].songId : null

  return (
    <div className="App">
      <div className="container">
        <aside>
          <Search className="search" onAddSong={addSongHandler} />
          <Playlist list={playlist} />
        </aside>
        <main>
        </main>
        <Player songId={songId} onSongEnd={onSongEndHandler} />
      </div>
    </div>
  )
}

export default App

