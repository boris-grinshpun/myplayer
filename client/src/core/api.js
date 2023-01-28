import { CDN_DEV_PLAYLIST_URL } from './constants' 

export async function fetchPlaylistFromCDN (){
    const res = await fetch(CDN_DEV_PLAYLIST_URL, {mode: 'cors'})
    const {data: list} = await res.json()
    return list
}