import { YOUTUBE_VIDEO_BASEURL } from '../../core/constants'
export default function Playlist({ list, songClickHandler }) {
    return (
        <ul data-testid="playlist">
            {list.map(item => (
                <li onClick={songClickHandler} key={item.id}>
                    {`${YOUTUBE_VIDEO_BASEURL}${item.songId}`}
                </li>
            ))}
        </ul>
    )
}