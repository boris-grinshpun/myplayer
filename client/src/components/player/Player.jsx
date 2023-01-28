import YouTube from 'react-youtube';
import {CLIENT_URL} from '../../utils/constants'
import './player.css'

export default function Player({ songId, onSongEnd, onSongError }) {
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

    return (
        <div>
            { 
                songId ? 
                    <div data-testid="video-player" >
                        <YouTube videoId={songId} opts={playerOptions} onEnd={onSongEnd} onError={onSongError} onReady={onReady}/> 
                    </div>
                    : 
                    <div data-testid="thumbnail" className="video-thumbnail">Enter YouTube Song ID</div>}
        </div>
    )
}