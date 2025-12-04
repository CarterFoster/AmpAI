// make-amp.js (Updated for Spotify integration)
(function() {
  const makeAmpBtn = document.querySelector(".make-amp-btn");
  const knobs = document.querySelectorAll(".knob");

  // Backend URL
  const BACKEND_URL = "http://localhost:8000";

  console.log("🚀 make-amp.js loaded!");
  console.log("📍 Backend URL:", BACKEND_URL);

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
      
      console.log("📤 Sending request to:", `${BACKEND_URL}/get_amp_settings`);
      console.log("📦 Request body:", requestBody);

      // Make request to backend
      const response = await fetch(`${BACKEND_URL}/get_amp_settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response OK:", response.ok);

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
      console.error("❌ Error stack:", error.stack);
      alert(`Failed to generate amp settings: ${error.message}\n\nMake sure your backend is running on ${BACKEND_URL}`);
    } finally {
      setLoadingState(false);
    }
  }

  // Add click event listener to Make Amp button
  console.log("🔗 Adding click listener to button");
  makeAmpBtn.addEventListener("click", makeAmp);

  console.log("✅ make-amp.js fully initialized!");
})();