/**
 * High-definition Netflix Catalog with real IMDB & TMDB IDs and Official Image CDNs
 */

export const getOfficialPoster = (imdbId) => `https://images.metahub.space/poster/medium/${imdbId}/img`;
export const getOfficialBackdrop = (imdbId) => `https://images.metahub.space/background/large/${imdbId}/img`;
export const getOfficialLogo = (imdbId) => `https://images.metahub.space/logo/medium/${imdbId}/img`;
export const getOfficialEpThumb = (imdbId, season, ep) => `https://episodes.metahub.space/${imdbId}/${season}/${ep}/w780.jpg`;

export const HERO_FEATURED = {
  id: 'stranger-things',
  title: 'Stranger Things',
  type: 'tv',
  imdb_id: 'tt4574334',
  tmdb_id: '66732',
  year: '2024',
  rating: 'TV-MA',
  seasonsCount: 4,
  match: '99% Match',
  quality: '4K Ultra HD',
  audio: 'Dolby Atmos 5.1',
  backdrop: getOfficialBackdrop('tt4574334'),
  poster: getOfficialPoster('tt4574334'),
  logoUrl: getOfficialLogo('tt4574334'),
  logoText: 'STRANGER THINGS',
  videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
  genres: ['Sci-Fi', 'Horror', 'Drama', 'Mystery'],
  cast: ['Millie Bobby Brown', 'Finn Wolfhard', 'Winona Ryder', 'David Harbour'],
  creator: 'The Duffer Brothers',
  seasons: [
    {
      season_number: 1,
      title: 'Season 1',
      episodes: [
        {
          episode_number: 1,
          title: 'Chapter One: The Vanishing of Will Byers',
          duration: '48m',
          overview: 'On his way home from a friend’s house, young Will sees something terrifying. Nearby, a sinister secret lurks in the depths of a government lab.',
          thumbnail: getOfficialEpThumb('tt4574334', 1, 1)
        },
        {
          episode_number: 2,
          title: 'Chapter Two: The Weirdo on Maple Street',
          duration: '55m',
          overview: 'Lucas, Mike and Dustin try to talk to the girl they found in the woods. Hopper questions an anxious Joyce about an unsettling phone call.',
          thumbnail: getOfficialEpThumb('tt4574334', 1, 2)
        },
        {
          episode_number: 3,
          title: 'Chapter Three: Holly, Jolly',
          duration: '51m',
          overview: 'An increasingly concerned Joyce believes Will is communicating with her through holiday lights. The boys test Eleven’s abilities.',
          thumbnail: getOfficialEpThumb('tt4574334', 1, 3)
        },
        {
          episode_number: 4,
          title: 'Chapter Four: The Body',
          duration: '50m',
          overview: 'Refusing to believe Will is dead, Joyce tries to connect with her son. The boys give Eleven a makeover before sneaking her into school.',
          thumbnail: getOfficialEpThumb('tt4574334', 1, 4)
        }
      ]
    },
    {
      season_number: 2,
      title: 'Season 2',
      episodes: [
        {
          episode_number: 1,
          title: 'Chapter One: MADMAX',
          duration: '48m',
          overview: 'As the town preps for Halloween, a high-scoring rival shakes things up at the arcade, and a skeptical Hopper inspects a field of rotting pumpkins.',
          thumbnail: getOfficialEpThumb('tt4574334', 2, 1)
        },
        {
          episode_number: 2,
          title: 'Chapter Two: Trick or Treat, Freak',
          duration: '56m',
          overview: 'After Will sees something terrible on trick-or-treat night, Mike wonders whether Eleven is still out there somewhere.',
          thumbnail: getOfficialEpThumb('tt4574334', 2, 2)
        }
      ]
    }
  ]
};

export const CATALOG = [
  HERO_FEATURED,
  {
    id: 'inception',
    title: 'Inception',
    type: 'movie',
    imdb_id: 'tt1375666',
    tmdb_id: '27205',
    year: '2010',
    rating: 'PG-13',
    duration: '2h 28m',
    match: '99% Match',
    quality: '4K Ultra HD',
    audio: 'Spatial 5.1',
    backdrop: getOfficialBackdrop('tt1375666'),
    poster: getOfficialPoster('tt1375666'),
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    genres: ['Action', 'Sci-Fi', 'Adventure', 'Thriller'],
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
    director: 'Christopher Nolan'
  },
  {
    id: 'interstellar',
    title: 'Interstellar',
    type: 'movie',
    imdb_id: 'tt0816692',
    tmdb_id: '157336',
    year: '2014',
    rating: 'PG-13',
    duration: '2h 49m',
    match: '98% Match',
    quality: '4K Ultra HD',
    audio: 'Dolby Atmos',
    backdrop: getOfficialBackdrop('tt0816692'),
    poster: getOfficialPoster('tt0816692'),
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    overview: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    director: 'Christopher Nolan'
  },
  {
    id: 'the-dark-knight',
    title: 'The Dark Knight',
    type: 'movie',
    imdb_id: 'tt0468569',
    tmdb_id: '155',
    year: '2008',
    rating: 'PG-13',
    duration: '2h 32m',
    match: '99% Match',
    quality: '4K Ultra HD',
    audio: '5.1 Surround',
    backdrop: getOfficialBackdrop('tt0468569'),
    poster: getOfficialPoster('tt0468569'),
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    genres: ['Action', 'Crime', 'Drama', 'Thriller'],
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
    director: 'Christopher Nolan'
  },
  {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    type: 'movie',
    imdb_id: 'tt15398776',
    tmdb_id: '872585',
    year: '2023',
    rating: 'R',
    duration: '3h 00m',
    match: '97% Match',
    quality: '4K Ultra HD',
    audio: 'IMAX 6-Track',
    backdrop: getOfficialBackdrop('tt15398776'),
    poster: getOfficialPoster('tt15398776'),
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    genres: ['Biography', 'Drama', 'History'],
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    director: 'Christopher Nolan'
  },
  {
    id: 'iron-man-3',
    title: 'Iron Man 3',
    type: 'movie',
    imdb_id: 'tt1300854',
    tmdb_id: '68721',
    year: '2013',
    rating: 'PG-13',
    duration: '2h 10m',
    match: '95% Match',
    quality: '1080p Full HD',
    audio: 'Dolby Digital',
    backdrop: getOfficialBackdrop('tt1300854'),
    poster: getOfficialPoster('tt1300854'),
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    overview: 'When Tony Stark’s world is torn apart by a formidable terrorist called the Mandarin, he starts an odyssey of rebuilding and retribution.',
    genres: ['Action', 'Sci-Fi', 'Adventure'],
    cast: ['Robert Downey Jr.', 'Gwyneth Paltrow', 'Don Cheadle', 'Guy Pearce'],
    director: 'Shane Black'
  },
  {
    id: 'wednesday',
    title: 'Wednesday',
    type: 'tv',
    imdb_id: 'tt13655566',
    tmdb_id: '119051',
    year: '2023',
    rating: 'TV-14',
    seasonsCount: 1,
    match: '98% Match',
    quality: '4K Ultra HD',
    audio: 'Dolby Atmos',
    backdrop: getOfficialBackdrop('tt13655566'),
    poster: getOfficialPoster('tt13655566'),
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    overview: 'Follows Wednesday Addams’ years as a student, attempting to master her emerging psychic ability, thwart a monstrous killing spree, and solve a mystery that embroiled her parents.',
    genres: ['Comedy', 'Crime', 'Fantasy', 'Mystery'],
    cast: ['Jenna Ortega', 'Gwendoline Christie', 'Riki Lindhome', 'Christina Ricci'],
    creator: 'Alfred Gough, Miles Millar',
    seasons: [
      {
        season_number: 1,
        title: 'Season 1',
        episodes: [
          {
            episode_number: 1,
            title: 'Wednesday\'s Child Is Full of Woe',
            duration: '59m',
            overview: 'When a deliciously wicked prank gets Wednesday expelled, her parents ship her off to Nevermore Academy, the boarding school where they fell in love.',
            thumbnail: getOfficialEpThumb('tt13655566', 1, 1)
          },
          {
            episode_number: 2,
            title: 'Woe Is the Loneliest Number',
            duration: '48m',
            overview: 'The sheriff questions Wednesday about the night\'s strange happenings. Later, Wednesday faces off against a fierce rival during the Poe Cup race.',
            thumbnail: getOfficialEpThumb('tt13655566', 1, 2)
          }
        ]
      }
    ]
  },
  {
    id: 'game-of-thrones',
    title: 'Game of Thrones',
    type: 'tv',
    imdb_id: 'tt0944947',
    tmdb_id: '1399',
    year: '2019',
    rating: 'TV-MA',
    seasonsCount: 8,
    match: '99% Match',
    quality: '4K HDR',
    audio: 'Dolby Atmos',
    backdrop: getOfficialBackdrop('tt0944947'),
    poster: getOfficialPoster('tt0944947'),
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    overview: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
    cast: ['Emilia Clarke', 'Kit Harington', 'Peter Dinklage', 'Lena Headey'],
    creator: 'David Benioff, D.B. Weiss',
    seasons: [
      {
        season_number: 1,
        title: 'Season 1',
        episodes: [
          {
            episode_number: 1,
            title: 'Winter Is Coming',
            duration: '62m',
            overview: 'Jon Arryn, the Hand of the King, is dead. King Robert Baratheon plans to ask his oldest friend, Lord Eddard Stark, to take his place.',
            thumbnail: getOfficialEpThumb('tt0944947', 1, 1)
          },
          {
            episode_number: 2,
            title: 'The Kingsroad',
            duration: '56m',
            overview: 'Bran\'s fate remains in doubt. Having agreed to become the King\'s Hand, Ned leaves Winterfell with his daughters Arya and Sansa.',
            thumbnail: getOfficialEpThumb('tt0944947', 1, 2)
          }
        ]
      }
    ]
  },
  {
    id: 'the-boys',
    title: 'The Boys',
    type: 'tv',
    imdb_id: 'tt1190634',
    tmdb_id: '76479',
    year: '2024',
    rating: 'TV-MA',
    seasonsCount: 4,
    match: '98% Match',
    quality: '4K Ultra HD',
    audio: '5.1 Surround',
    backdrop: getOfficialBackdrop('tt1190634'),
    poster: getOfficialPoster('tt1190634'),
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    overview: 'A fun and irreverent take on what happens when superheroes—who are as popular as celebrities—abuse their superpowers rather than use them for good.',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    cast: ['Karl Urban', 'Jack Quaid', 'Antony Starr', 'Erin Moriarty'],
    creator: 'Eric Kripke',
    seasons: [
      {
        season_number: 1,
        title: 'Season 1',
        episodes: [
          {
            episode_number: 1,
            title: 'The Name of the Game',
            duration: '60m',
            overview: 'When a Supe kills the love of his life, A/V salesman Hughie Campbell teams up with Billy Butcher, a vigilante hell-bent on punishing corrupt Supes.',
            thumbnail: getOfficialEpThumb('tt1190634', 1, 1)
          }
        ]
      }
    ]
  },
  {
    id: 'avatar-2',
    title: 'Avatar: The Way of Water',
    type: 'movie',
    imdb_id: 'tt1630029',
    tmdb_id: '76600',
    year: '2022',
    rating: 'PG-13',
    duration: '3h 12m',
    match: '96% Match',
    quality: '4K HDR 3D',
    audio: 'Dolby Atmos',
    backdrop: getOfficialBackdrop('tt1630029'),
    poster: getOfficialPoster('tt1630029'),
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    overview: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
    genres: ['Action', 'Adventure', 'Fantasy', 'Sci-Fi'],
    cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Stephen Lang'],
    director: 'James Cameron'
  },
  {
    id: 'cyberpunk-edgerunners',
    title: 'Cyberpunk: Edgerunners',
    type: 'tv',
    imdb_id: 'tt12590266',
    tmdb_id: '105248',
    year: '2022',
    rating: 'TV-MA',
    seasonsCount: 1,
    match: '99% Match',
    quality: '4K Ultra HD',
    audio: '5.1 Surround',
    backdrop: getOfficialBackdrop('tt12590266'),
    poster: getOfficialPoster('tt12590266'),
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    overview: 'A street kid trying to survive in a technology and body modification-obsessed city of the future. Having everything to lose, he chooses to stay alive by becoming an edgerunner: a mercenary outlaw also known as a cyberpunk.',
    genres: ['Animation', 'Action', 'Sci-Fi'],
    cast: ['Aoi Yuuki', 'KENN', 'Hiroki Touchi', 'Zach Aguilar'],
    creator: 'Rafal Jaki, Mike Pondsmith',
    seasons: [
      {
        season_number: 1,
        title: 'Season 1',
        episodes: [
          {
            episode_number: 1,
            title: 'Let You Down',
            duration: '24m',
            overview: 'David Martinez is a talented student at the Arasaka Academy, living in poverty with his overworked mother Gloria.',
            thumbnail: getOfficialEpThumb('tt12590266', 1, 1)
          }
        ]
      }
    ]
  },
  {
    id: 'spiderman-spiderverse',
    title: 'Spider-Man: Across the Spider-Verse',
    type: 'movie',
    imdb_id: 'tt9362722',
    tmdb_id: '569094',
    year: '2023',
    rating: 'PG',
    duration: '2h 20m',
    match: '98% Match',
    quality: '4K Ultra HD',
    audio: 'Dolby Atmos',
    backdrop: getOfficialBackdrop('tt9362722'),
    poster: getOfficialPoster('tt9362722'),
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    overview: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
    genres: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Brian Tyree Henry', 'Oscar Isaac'],
    director: 'Joaquim Dos Santos, Kemp Powers'
  },
  {
    id: 'breaking-bad',
    title: 'Breaking Bad',
    type: 'tv',
    imdb_id: 'tt0903747',
    tmdb_id: '1396',
    year: '2013',
    rating: 'TV-MA',
    seasonsCount: 5,
    match: '99% Match',
    quality: '4K Ultra HD',
    audio: '5.1 Surround',
    backdrop: getOfficialBackdrop('tt0903747'),
    poster: getOfficialPoster('tt0903747'),
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    overview: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family\'s future.',
    genres: ['Crime', 'Drama', 'Thriller'],
    cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn', 'Giancarlo Esposito'],
    creator: 'Vince Gilligan',
    seasons: [
      {
        season_number: 1,
        title: 'Season 1',
        episodes: [
          {
            episode_number: 1,
            title: 'Pilot',
            duration: '58m',
            overview: 'When an unassuming high school chemistry teacher discovers he has lung cancer, he decides to secure his family\'s financial future by making and selling methamphetamine.',
            thumbnail: getOfficialEpThumb('tt0903747', 1, 1)
          },
          {
            episode_number: 2,
            title: 'Cat\'s in the Bag...',
            duration: '48m',
            overview: 'Walt and Jesse attempt to tie up loose ends following the disastrous drug deal in the desert.',
            thumbnail: getOfficialEpThumb('tt0903747', 1, 2)
          }
        ]
      }
    ]
  },
  {
    id: 'arcane',
    title: 'Arcane',
    type: 'tv',
    imdb_id: 'tt11126994',
    tmdb_id: '94605',
    year: '2024',
    rating: 'TV-14',
    seasonsCount: 2,
    match: '99% Match',
    quality: '4K Ultra HD',
    audio: 'Dolby Atmos',
    backdrop: getOfficialBackdrop('tt11126994'),
    poster: getOfficialPoster('tt11126994'),
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    overview: 'Set in the utopian region of Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League champions-and the power that will tear them apart.',
    genres: ['Animation', 'Action', 'Sci-Fi', 'Fantasy'],
    cast: ['Hailee Steinfeld', 'Ella Purnell', 'Katie Leung', 'Kevin Alejandro'],
    creator: 'Christian Linke, Alex Yee',
    seasons: [
      {
        season_number: 1,
        title: 'Season 1',
        episodes: [
          {
            episode_number: 1,
            title: 'Welcome to the Playground',
            duration: '43m',
            overview: 'Orphaned sisters Vi and Powder bring trouble to Zaun\'s underground streets following a heist in posh Piltover.',
            thumbnail: getOfficialEpThumb('tt11126994', 1, 1)
          }
        ]
      }
    ]
  },
  {
    id: 'matrix',
    title: 'The Matrix',
    type: 'movie',
    imdb_id: 'tt0133093',
    tmdb_id: '603',
    year: '1999',
    rating: 'R',
    duration: '2h 16m',
    match: '99% Match',
    quality: '4K Ultra HD',
    audio: 'Dolby Atmos',
    backdrop: getOfficialBackdrop('tt0133093'),
    poster: getOfficialPoster('tt0133093'),
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    overview: 'When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.',
    genres: ['Action', 'Sci-Fi'],
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss', 'Hugo Weaving'],
    director: 'Lana Wachowski, Lilly Wachowski'
  }
];

export const CATEGORIES = [
  { id: 'trending', title: 'Trending Now', filter: item => true },
  { id: 'top10', title: 'Top 10 Movies & Shows Today', isTop10: true, filter: item => true },
  { id: 'scifi', title: 'Sci-Fi & Cyberpunk Hits', filter: item => item.genres?.includes('Sci-Fi') },
  { id: 'action', title: 'Action & High-Octane Blockbusters', filter: item => item.genres?.includes('Action') },
  { id: 'tvshows', title: 'Binge-Worthy TV Series', filter: item => item.type === 'tv' },
  { id: 'movies', title: 'Critically Acclaimed Movies', filter: item => item.type === 'movie' },
  { id: 'drama', title: 'Award-Winning Dramas', filter: item => item.genres?.includes('Drama') }
];
