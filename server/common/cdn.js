import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import { CDN_DEV_PLAYLIST_URL } from './constants.js'

export {
    uploadPlaylistToCDN,
    loadPlaylistFromCDN,
    emptyPlaylist
}

async function uploadPlaylistToCDN(playlist) {
    await fs.writeFile("../cdn/playlist.json", JSON.stringify({data: playlist}), 'utf8', function (err) {
        throw new Error('adding to playlist failed')
    });
    return true
}

async function loadPlaylistFromCDN() {
    const res = await fetch(CDN_DEV_PLAYLIST_URL, {
        mode: 'cors'
    })
    const { data = [] } = await res.json()
    return data
}

async function emptyPlaylist() {
    await fs.writeFile("../cdn/playlist.json", JSON.stringify({ data: [] }), 'utf8', function (err) {
        throw new Error('empty playlist failed')
    });
}

