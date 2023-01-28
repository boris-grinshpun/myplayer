import { YOUTUBE_VIDEO_BASEURL } from '../../utils/constants'

import './playlist.css'

export default function Playlist({ list, songClickHandler }) {
    return (
        <ul data-testid="playlist">
            {list.map(song => (
                <li onClick={songClickHandler} key={song.id} title={song.title}>
                    {song.title || `${YOUTUBE_VIDEO_BASEURL}${song.songId}`}
                </li>
            ))}
        </ul>
    )
}