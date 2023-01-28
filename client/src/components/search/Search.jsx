import { useRef, useState } from "react"
import './search.css'

export default function Search({ onAddSong }) {
    const searchInput = useRef()
    const [error, setError] = useState(false)
    function onSubmit(e){
        if (searchInput.current.value.match(/[a-zA-Z0-9-]{11}/)){
            onAddSong(searchInput.current.value)
            searchInput.current.value = ""
            setError(false)
        } else {
            setError(true)
        }
    }
    return (
        <div className="search">
            <input data-testid="input" type="text" onKeyPress={onSubmit} ref={searchInput} placeholder="Song Id"/>
            {error ? <div data-testid="error">Please enter a valid YouTubeID</div> : null}
            <button data-testid="button" onClick={onSubmit}>Add</button>
        </div>
    )
}