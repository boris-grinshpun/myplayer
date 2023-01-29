import { memo, useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import { CLIENT_URL } from '../../utils/constants'
import './player.css'

const Player = ({ song,  onSongEnd, onSongError }) => {
    const [id, setId] = useState(null)
    const playerOptions = {
        height: '390',
        width: '640',
        playerVars: {
            controls: 0,
            autoplay: 1,
            host: CLIENT_URL,
            // start: 6*60+20 // debugging 
        }
    }
    const onReady = (event) => {
        // access to player in all event handlers via event.target
        event.target.playVideo();
        
    }
    const change = (s)=>{
        if  (s.data === 0){
            setId(null)
        }
    }
    useEffect(()=>{
        if (song && song.songId)
            setId(song.songId)
        else 
            setId(null)
    },[song])

    return (
        <div>
            {
                id ?
                    <div data-testid="video-player">
                        <YouTube videoId={id} opts={playerOptions} onEnd={onSongEnd} onError={onSongError} onReady={onReady} onStateChange={change} />
                    </div>
                    :
                    <div data-testid="thumbnail" className="video-thumbnail">enter YouTube song id</div>}
        </div>
    )
}
export default memo(Player)