import { useState , useEffect} from 'react';
import Search from './components/Search.jsx';
import Spinner from './components/Spinner.jsx';
import MovieCard from './components/MovieCard.jsx';
import { getTrendingMovies, updateSearchCount } from './appwrite.js';


const API_BASE_URL = 'https://api.themoviedb.org/3/';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {

  method : 'GET',
  headers : {
    accept : 'application/json',
    Authorization : `Bearer ${API_KEY}`,
  }
}

function App() {

  const [searchTerm,setSearchTerm ] = useState('');

  const [errorMessage,setErrorMessage] = useState('');

  const [movies,setMovies] = useState([]);

  const [trendingMovies,setTrendingMovies] = useState([]);

  const [loading,setLoading] = useState(false);

  const [debounceSearchTerm,setDebounceSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  

  // API - Application Programming Interface

  const fetchMovies = async (query = '') => {

    setLoading(true);
    setErrorMessage('')

    try{

      const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
       : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`

      const response = await fetch(endpoint,API_OPTIONS);

      if(!response.ok){

        throw new Error('Failed to fetch movies try again later');  

      }

      

      const data = await response.json();

      if(data.Response == 'False'){

        setErrorMessage(data.error||'Failed to fetch movies');

        setMovies([]);

        return;

      }

      setMovies(data.results || []);

      if(query && data.results.length > 0){

        await updateSearchCount(query,data.results[0]);

      }


      

      console.log(data);


    }catch(error){

      console.log(`Error Fetching Movies ${error}`)
      setErrorMessage('Error Fetching Movies. Please Try Again Later');
    }finally{

      setLoading(false);

    }
  }

  const loadTrendingMovies = async () => {

    try{

      const movies = await getTrendingMovies();

      setTrendingMovies(movies);


    }catch(error){

      console.log('error fetching trending movies',error)
      
    }
  }

  useEffect(() => {

    fetchMovies(debounceSearchTerm);

  },[debounceSearchTerm]);

  useEffect(() => {

    loadTrendingMovies();

  },[])


  return (

    <main className='pattern'>

      <div className='wrapper'>

        <header>
          <img src='hero.png' alt='Hero Banner'></img>
          <h1>Find <span className='text-gradient'>Movies</span>You'll Enjoy Without the Hassle </h1>
          <Search searchTerm = {searchTerm} setSearchTerm = {setSearchTerm} />

        </header>

        {trendingMovies.length > 0 && (
          <section className='trending'>
          <h2>Trending Searches</h2>
          <ul>
            {trendingMovies.map((movie,index) => (

              <li key={movie.$id}>

                <p>{index + 1}</p>
                <img src={movie.poster_url} alt={movie.title}/>
              </li>
              


            ))}
          </ul>
            

          </section>
        )}

        {/* <h1 className='text-white'>{searchTerm}</h1> */}
 
        <section className='all-movies'>
          <h2>All Movies</h2>

          {loading ? (
            <Spinner/>
          ): errorMessage ? (<p className='text-red-500'>{errorMessage}</p>):(
            <ul>
              {movies.map((movie) => (
                
                  <MovieCard key={movie.id} movie={movie} />
                
              ))}
            </ul>
          )

          }

        </section>

      </div>


    </main>
  
  )
}

export default App
