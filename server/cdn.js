import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import { CDN_DEV_PLAYLIST_URL } from './utils.js'


export {
    uploadPlaylistToCDN,
    loadPlaylistFromCDN,
}

async function uploadPlaylistToCDN(playlist) {
    await fs.writeFile("../cdn/playlist.json", JSON.stringify({data: playlist}), 'utf8', function (err) {
       throw new Error('adding to playlist failed')
    });
    return true
}

async function loadPlaylistFromCDN(){
    const res = await fetch(CDN_DEV_PLAYLIST_URL, {
        mode:'cors'
      })
      return (await res.json()).data
}

