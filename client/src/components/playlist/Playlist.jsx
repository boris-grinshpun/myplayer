import { YOUTUBE_VIDEO_BASEURL } from '../../utils/constants'

import './playlist.css'

export default function Playlist({ list, songClickHandler, onSongRemove }) {
    return (
        <ul data-testid="playlist">
            {list.map((song, index) => (
                <li onClick={songClickHandler} key={song.id} title={song.title}>
                    {song.title || `${YOUTUBE_VIDEO_BASEURL}${song.songId}`}
                    <div className="remove-song" onClick={() => onSongRemove(index)}>x</div>
                </li>
            ))}
        </ul>
    )
}