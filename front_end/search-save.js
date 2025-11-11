(function() {
  let lastSearch = "";
  const searchInput = document.querySelector(".search-bar input");
  const searchButton = document.querySelector(".search-bar button");

  searchButton.addEventListener("click", () => {
    lastSearch = searchInput.value.trim();
    if (lastSearch) {
      console.log("Saved search:", lastSearch);
      alert(`Saved "${lastSearch}"`);
    }
  });
})();



