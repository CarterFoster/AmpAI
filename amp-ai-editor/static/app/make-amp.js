(function() {
  const makeAmpBtn = document.querySelector(".make-amp-btn");
  const knobs = document.querySelectorAll(".knob");

  console.log("🚀 make-amp.js loaded (protected version)!");
  
  // Check authentication on page load
  const token = localStorage.getItem('ampai_token');
  const user = JSON.parse(localStorage.getItem('ampai_user') || '{}');
  
  if (!token) {
    console.log('No auth token found, redirecting to landing...');
    window.location.href = '/';
    return;
  }
  
  console.log('✅ User authenticated:', user.email);
  
  // Add logout button
  const header = document.querySelector('header');
  if (header && user.email) {
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background: rgba(0,0,0,0.2);">
        <div style="color: #f0f0f0; font-size: 14px;">
          Welcome, ${user.name || user.email}
        </div>
        <button id="logout-btn" style="
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.3);
          color: #f0f0f0;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        ">Logout</button>
      </div>
    `;
    
    document.getElementById('logout-btn').addEventListener('click', () => {
      localStorage.removeItem('ampai_token');
      localStorage.removeItem('ampai_user');
      window.location.href = '/';
    });
  }
  
  // Function to update a specific knob value
  function updateKnob(knobLabel, value) {
    console.log(`🎚️ Updating ${knobLabel} to ${value}`);
    knobs.forEach((knob) => {
      const label = knob.querySelector("label").textContent;
      if (label.toLowerCase() === knobLabel.toLowerCase()) {
        const pointer = knob.querySelector(".pointer");
        const valueDisplay = knob.querySelector(".knob-value");
        
        const clampedValue = Math.min(100, Math.max(0, value));
        const angle = (clampedValue - 50) * 2.7;
        pointer.style.transform = `rotate(${angle}deg)`;
        valueDisplay.textContent = Math.round(clampedValue);
        console.log(`✅ ${knobLabel} updated to ${clampedValue}`);
      }
    });
  }

  // Function to apply all amp settings
  function applyAmpSettings(settings) {
    console.log("🎛️ Applying settings:", settings);
    if (settings.gain !== undefined) updateKnob("Gain", settings.gain);
    if (settings.volume !== undefined) updateKnob("Volume", settings.volume);
    if (settings.bass !== undefined) updateKnob("Bass", settings.bass);
    if (settings.treble !== undefined) updateKnob("Treble", settings.treble);
    if (settings.presence !== undefined) updateKnob("Presence", settings.presence);
    if (settings.master !== undefined) updateKnob("Master", settings.master);
  }

  // Function to show loading state
  function setLoadingState(isLoading) {
    console.log("⏳ Loading state:", isLoading);
    if (isLoading) {
      makeAmpBtn.textContent = "Generating...";
      makeAmpBtn.disabled = true;
      makeAmpBtn.style.opacity = "0.6";
      makeAmpBtn.style.cursor = "wait";
    } else {
      makeAmpBtn.textContent = "Make Amp";
      makeAmpBtn.disabled = false;
      makeAmpBtn.style.opacity = "1";
      makeAmpBtn.style.cursor = "pointer";
    }
  }

  // Main function to get amp settings from backend
  async function makeAmp() {
    console.log("🎸 Make Amp button clicked!");
    
    // Get selected Spotify song from spotify-search.js
    const selectedSong = window.getSelectedSpotifySong && window.getSelectedSpotifySong();
    
    if (!selectedSong) {
      alert("Please search for and select a song from Spotify first!");
      return;
    }

    console.log("🎵 Selected song data:", selectedSong);

    setLoadingState(true);

    try {
      const requestBody = {
        song_name: selectedSong.name,
        artist: selectedSong.artist,
        album: selectedSong.album,
        spotify_id: selectedSong.spotifyId,
        desired_tone: "authentic to the original recording"
      };
      
      console.log("📤 Sending authenticated request to:", `/api/get_amp_settings`);
      console.log("📦 Request body:", requestBody);

      // Make request to backend WITH AUTH TOKEN
      const response = await fetch(`/api/get_amp_settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Add auth token
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📥 Response status:", response.status);

      if (response.status === 401) {
        // Token expired or invalid
        alert("Session expired. Please login again.");
        localStorage.removeItem('ampai_token');
        localStorage.removeItem('ampai_user');
        window.location.href = '/';
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Received data:", data);
      
      // Apply the settings to the knobs
      if (data.settings) {
        applyAmpSettings(data.settings);
      } else {
        console.error("❌ No settings in response");
        throw new Error("No settings received from server");
      }

    } catch (error) {
      console.error("❌ Error:", error);
      alert(`Failed to generate amp settings: ${error.message}`);
    } finally {
      setLoadingState(false);
    }
  }

  // Add click event listener to Make Amp button
  console.log("🔗 Adding click listener to button");
  makeAmpBtn.addEventListener("click", makeAmp);

  console.log("✅ make-amp.js fully initialized with authentication!");
})();