import YouTube from 'react-youtube';
import {CLIENT_URL} from '../../core/constants'
import './player.css'

export default function Player({ songId, onSongEnd }) {
    const playerOptions = {
        height: '390',
        width: '640',
        playerVars: {
            controls: 0,
            autoplay: 1,
            host: CLIENT_URL,
            // start: 4*60+32
        }
    }

    return (
        <div>
            { 
                songId ? 
                    <div data-testid="video-player" >
                        <YouTube videoId={songId} opts={playerOptions} onEnd={onSongEnd} /> 
                    </div>
                    : 
                    <div data-testid="thumbnail" className="video-thumbnail">Enter YouTube Song ID</div>}
        </div>
    )
}