import {useCallback, useEffect, useRef, useState} from 'react'
import styles from './search.module.css'

function capitalizeFirstLetter(string) {
  if(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  else{
    return string;
  }
}

export default function Search() {

  const searchRef = useRef(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(false)
  const [results, setResults] = useState([])
  const [allResults, setAllResults] = useState([])
  const [currentFilter, setCurrentFilter] = useState("All");
  const [totalHitsResults, setTotalHitsResults] = useState({})

  const searchEndpoint = (query) => `/api/search?query=${query}`

  const onChange = useCallback((event) => {
    const query = event.target.value;
    setQuery(query)
    if (query.length > 2) {
      fetch(searchEndpoint(query))
        .then(res => res.json())
        .then(res => {
          setResults(res.hits)
          setAllResults(res.hits)
          setTotalHitsResults(res.total)
        })
    } else {
      setResults([])
      setAllResults([])
      setTotalHitsResults({})
    }
  }, [])

  const onFocus = useCallback(() => {
    setActive(true)
    window.addEventListener('click', onClick)
  }, [])

  const onClick = useCallback((event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setActive(false)
      window.removeEventListener('click', onClick)
    }
  }, [])

  const filter = (e) => {
    let word = e.target.value;
    setCurrentFilter(word);
  };
  useEffect(() => {
    if (currentFilter === "All") {
      setResults(allResults);
    } else {
      const filtered = allResults.filter (item => {
        return item.asset_type === currentFilter;
      });
      setResults(filtered);
    }
  }, [currentFilter]);

  return (
    <div
      className={styles.container}
      ref={searchRef}
    >
      <input
        className={styles.search}
        onChange={onChange}
        onFocus={onFocus}
        placeholder='Search documents'
        type='text'
        value={query}
      />
      { results.length > 0 && (
        <ul className={styles.results}>
          <p>Number of usages: {totalHitsResults.value}</p>
          <button className={styles.button} onClick={filter} type="button" value="All">Everything</button>
          <button className={styles.button} onClick={filter} type="button" value="activecontent">Active Content</button>
          <button className={styles.button} onClick={filter}  type="button" value="document">Documents</button>
          <button className={styles.button} onClick={filter} type="button" value="publication">Publications</button>
          {results.map((item) => (
            <li className={styles.result} key={item._id}>
              <h3>{item.asset_name}</h3>
              <h4>Type: <span>{capitalizeFirstLetter(item.asset_type)}</span></h4>
              <h5>Location: <span>{item.asset_path}</span></h5>
              <p>Paragraphs:</p>
              <ul>
                {item.inner_hits.map((paragraphs) => (
                  <li key={paragraphs._source.item_id}>{paragraphs._source.text_content}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) }
    </div>
  )
}