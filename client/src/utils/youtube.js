// TODO: move youtube api requests to server - YOUTUBE_API_KEY in client app is a bad idea

import { YOUTUBE_API_KEY } from "./constants"

export async function updatePlaylistTitlesFromYoutube(playlist){
    const youtubeRes =  await youtube(playlist.map(song => song.songId))
    const { items: youtubeSongsInfo = [] } = await youtubeRes.json()
    const updatedList = await attachTitles(playlist, youtubeSongsInfo)
    return updatedList
}

function youtube(ids){
    const idList = encodeURIComponent(ids.join(","))
    const URL = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${idList}&key=${YOUTUBE_API_KEY}`
    return fetch(URL)
}


function attachTitles(playlist, youtubeSongsInfo) {

    return playlist.map(song => {
        const info = youtubeSongsInfo.find(songInfo => song.songId === songInfo.id)
        let title = ""
        if (info) {
            title = info?.snippet?.title || ""
        }
        return {...song, title}
    })
}