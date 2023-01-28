import { useRef, useState } from "react"
import './search.css'

export default function Search({ onAddSong }) {
    const searchInput = useRef()
    const [error, setError] = useState(false)

    const onSubmit = () => {

        if (searchInput.current.value.match(/[a-zA-Z0-9-_]{11}/)) {
            onAddSong(searchInput.current.value)
            searchInput.current.value = ""
            setError(false)
        } else {
            setError(true)
        }
    }

    const onChange = () => {
        setError(false)
    }

    const onEnter = (event) => {
        if (event.key === 'Enter') {
            onSubmit()
        }
    }
    return (
        <div className="search-wrapper">
            <div className="search">
                <input data-testid="input" type="text" onKeyPress={onEnter} onChange={onChange} ref={searchInput} placeholder="Song Id" />
                <button data-testid="button" onClick={onSubmit}>Add</button>
            </div>
            {error ? <div data-testid="error" className="error">Please enter a valid  video id</div> : null}
        </div>
    )
}