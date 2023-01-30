import { useCallback, useEffect, useState } from 'react'
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
  const [song, setSong] = useState(null)
  // const [playlistLoaded, setPlaylistLoaded] = useState(false)

  // fetch initial playlist from cdn, could be empty
  useEffect(() => {
    try {
      (async () => {
        const cdnPlaylist = await fetchPlaylistFromCDN()

        if (cdnPlaylist.length) {
          const updatedList = await updatePlaylistTitlesFromYoutube(cdnPlaylist)
          setPlaylist([...updatedList])
        }
        setupSEE()
      })()
    } catch (err) {
      console.log(err)
    }
  }, [])

  // handle playing song edge cases on plalist change
  useEffect(() => {
    // set the first song
    if (playlist.length == 1 && song === null) {
      setSong({ ...playlist[0] })
    }

    // empty playlist
    else if (!playlist.length)
      setSong(null)

    // handle playing song removal
    else if (playlist.length && song && song.id !== playlist[0].id)
      setSong({ ...playlist[0] })
      else {
        setSong({ ...playlist[0] })
      }

  }, [playlist])

  useEffect(() => {
    if (diff.length) {
      mergeDiffToPlaylist()
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
  const onSongEndHandler = useCallback(() => {
    if (playlist.length > 1) {
      setSong({ ...playlist[1] })
    }
    else if (playlist.length) {
      setPlaylist([...playlist.slice(1)])
    } else {
      setSong(null)
    }

  })

  const onSongErrorHandler = useCallback(() => {
    onSongEndHandler()
  })

  const removeSongHandler = (index) => {
    const newPlaylist = [...playlist]
    newPlaylist.splice(index, 1)
    setPlaylist(newPlaylist)
  }

  // subscribe to server side events to get playlist updates
  function setupSEE() {
    if (!connected) {
      console.log('connecting...')
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
      console.log('connected')
      setConnected(true)
    }
  }

  // update playlist when songs are added by other clients
  function mergeDiffToPlaylist() {
    if (diff) {
      const uniqueSongs = diff.filter(song => {
        const res = playlist.find(item => item.id === song.id)
        if (res === undefined) return true
        return false
      })
      if (uniqueSongs && uniqueSongs.length) {
        (async () => {
          const updatedSongs = await updatePlaylistTitlesFromYoutube(uniqueSongs)
          setPlaylist([...playlist, ...updatedSongs])
          setDiff([])
        })()
      }
    }
  }

  return (
    <div className="App">
      <div className="container">
        <aside>
          <Search className="search" onAddSong={addSongHandler} />
          <Playlist list={playlist} onSongRemove={removeSongHandler} />
        </aside>
        <main>
        </main>
        <Player song={song} onSongEnd={onSongEndHandler} onSongError={onSongErrorHandler} />
      </div>
    </div>
  )
}

export default App

