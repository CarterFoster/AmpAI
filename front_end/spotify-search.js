// spotify-search.js
(function() {
  // ===== CONFIGURATION =====
  // Replace these with your Spotify API credentials
  const SPOTIFY_CLIENT_ID = '775006113d30428d8270b1303dc32206';
  const SPOTIFY_CLIENT_SECRET = '64dabc0523d84f48a1ac84f672ac1d51';
  
  // ===== DOM ELEMENTS =====
  const searchInput = document.querySelector('.search-bar input');
  const dropdown = document.querySelector('.autocomplete-dropdown');
  const selectedSongInfo = document.querySelector('.selected-song-info');
  
  // ===== STATE =====
  let spotifyAccessToken = null;
  let searchTimeout = null;
  let selectedSong = null;
  let currentResults = [];
  let selectedIndex = -1;
  
  console.log('🎵 Spotify search initialized');
  
  // ===== SPOTIFY AUTHENTICATION =====
  async function getSpotifyToken() {
    if (spotifyAccessToken) return spotifyAccessToken;
    
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
        },
        body: 'grant_type=client_credentials'
      });
      
      if (!response.ok) {
        throw new Error('Failed to authenticate with Spotify');
      }
      
      const data = await response.json();
      spotifyAccessToken = data.access_token;
      console.log('✅ Spotify authenticated');
      return spotifyAccessToken;
    } catch (error) {
      console.error('❌ Spotify auth error:', error);
      showError('Failed to connect to Spotify');
      return null;
    }
  }
  
  // ===== SPOTIFY SEARCH =====
  async function searchSpotify(query) {
    if (!query || query.length < 2) {
      hideDropdown();
      return;
    }
    
    const token = await getSpotifyToken();
    if (!token) return;
    
    try {
      showLoading();
      
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Spotify search failed');
      }
      
      const data = await response.json();
      const tracks = data.tracks.items;
      
      console.log(`🔍 Found ${tracks.length} tracks`);
      
      if (tracks.length === 0) {
        showNoResults();
      } else {
        currentResults = tracks;
        displayResults(tracks);
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      showError('Search failed');
    }
  }
  
  // ===== UI FUNCTIONS =====
  function showLoading() {
    dropdown.innerHTML = '<div class="autocomplete-loading">🔍 Searching Spotify...</div>';
    dropdown.classList.add('show');
  }
  
  function showNoResults() {
    dropdown.innerHTML = '<div class="autocomplete-no-results">No songs found</div>';
    dropdown.classList.add('show');
  }
  
  function showError(message) {
    dropdown.innerHTML = `<div class="autocomplete-no-results">❌ ${message}</div>`;
    dropdown.classList.add('show');
  }
  
  function hideDropdown() {
    dropdown.classList.remove('show');
    dropdown.innerHTML = '';
    selectedIndex = -1;
  }
  
  function displayResults(tracks) {
    dropdown.innerHTML = tracks.map((track, index) => {
      const artists = track.artists.map(a => a.name).join(', ');
      const album = track.album.name;
      const image = track.album.images[2]?.url || track.album.images[0]?.url || '';
      
      return `
        <div class="autocomplete-item" data-index="${index}">
          <img src="${image}" alt="${track.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2245%22 height=%2245%22%3E%3Crect width=%2245%22 height=%2245%22 fill=%22%23333%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2220%22%3E♪%3C/text%3E%3C/svg%3E'">
          <div class="autocomplete-item-info">
            <div class="autocomplete-item-title">${escapeHtml(track.name)}</div>
            <div class="autocomplete-item-details">${escapeHtml(artists)} • ${escapeHtml(album)}</div>
          </div>
        </div>
      `;
    }).join('');
    
    dropdown.classList.add('show');
    
    // Add click listeners
    const items = dropdown.querySelectorAll('.autocomplete-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        selectSong(currentResults[index]);
      });
      
      item.addEventListener('mouseenter', () => {
        selectedIndex = parseInt(item.dataset.index);
        updateSelectedItem();
      });
    });
  }
  
  function updateSelectedItem() {
    const items = dropdown.querySelectorAll('.autocomplete-item');
    items.forEach((item, index) => {
      if (index === selectedIndex) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }
  
  function selectSong(track) {
    selectedSong = {
      name: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      albumImage: track.album.images[0]?.url || '',
      spotifyId: track.id,
      uri: track.uri
    };
    
    console.log('✅ Selected song:', selectedSong);
    
    // Update search input
    searchInput.value = `${selectedSong.name} - ${selectedSong.artist}`;
    
    // Show selected info
    selectedSongInfo.textContent = `✓ Selected: ${selectedSong.name} by ${selectedSong.artist}`;
    
    // Hide dropdown
    hideDropdown();
  }
  
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // ===== EVENT LISTENERS =====
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    // Clear selected song when user types
    selectedSong = null;
    selectedSongInfo.textContent = '';
    
    // Debounce search
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
      hideDropdown();
      return;
    }
    
    searchTimeout = setTimeout(() => {
      searchSpotify(query);
    }, 300); // Wait 300ms after user stops typing
  });
  
  // Keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    if (!dropdown.classList.contains('show')) return;
    
    const items = dropdown.querySelectorAll('.autocomplete-item');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateSelectedItem();
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateSelectedItem();
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && currentResults[selectedIndex]) {
        selectSong(currentResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      hideDropdown();
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      hideDropdown();
    }
  });
  
  // ===== EXPORT FOR USE BY make-amp.js =====
  // Make selected song accessible to other scripts
  window.getSelectedSpotifySong = function() {
    return selectedSong;
  };
  
  console.log('✅ Spotify search ready');
})();