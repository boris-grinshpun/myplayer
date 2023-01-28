export const CDN_DEV_PLAYLIST_URL = "http://localhost:8080/playlist.json"

export function getDiff(cashedPlaylist, newPlaylist){
    return newPlaylist.slice(cashedPlaylist.length)
}