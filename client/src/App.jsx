import { useEffect, useState } from 'react'
import './App.css'
import Player from './components/player/Player'
import Playlist from './components/playlist/Playlist'
import Search from './components/search/Search'
import {
  PLAYLIST_DIFF_EVENT,
  SUBSCTIPTION_URL,
  UPDATE_PLAYLIST_URL,
  USER_REGISTRATION_EVENT
} from './utils/constants'
import { updatePlaylistTitlesFromYoutube } from './utils/youtube'
import { fetchPlaylistFromCDN } from './utils/api'


function App() {
  const [playlist, setPlaylist] = useState([])
  const [diff, setDiff] = useState([])
  const [userId, setUserId] = useState("")
  const [connected, setConnected] = useState(false)

  // fetch initial playlist from cdn, could be empty
  useEffect(() => {
    try {
      (async () => {
        const cdnPlaylist = await fetchPlaylistFromCDN()

        if (cdnPlaylist.length) {
          const updatedList = await updatePlaylistTitlesFromYoutube(cdnPlaylist)
          setPlaylist([...updatedList])
        }
      })()
    } catch (err) {
      console.log(err)
    }
  }, [])

  // subscribe to server side events to get playlist updates
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
      if (uniqueSongs && uniqueSongs.length) {
        (async () => {
          const updatedSongs = await updatePlaylistTitlesFromYoutube(uniqueSongs)
          setPlaylist([...playlist, ...updatedSongs])
        })()
      }
    }
  }, [diff])

  // 1. update playlist when new song is added
  // 2. send a request to update the playlist on cdn
  const addSongHandler = async (songId) => {
    const id = userId + Date.now()
    const updatedSong = await updatePlaylistTitlesFromYoutube([{ userId, songId, id }])
    setPlaylist([...playlist, ...updatedSong])
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
  const onSongErrorHandler = () => {
    onSongEndHandler()
  }

  const songId = playlist && playlist.length ? playlist[0].songId : null

  return (
    <div className="App">
      <div className="container">
        <aside>
          <Search className="search" onAddSong={addSongHandler} />
          <Playlist list={playlist} />
        </aside>
        <main>
        </main>
        <Player songId={songId} onSongEnd={onSongEndHandler} onSongError={onSongErrorHandler} />
      </div>
    </div>
  )
}

export default App

