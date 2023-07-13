import ConsoleMessage from "./LogMessageToConsole.js";

// global variables
const injectValue = document.querySelector("#search-results-here");
const searchTextVal = document.getElementById("search-input-text");
const showModalSongDetails = document.querySelector(".modal-body");
const bodyFixedModalOpened = document.querySelector("body");
const floatingCloseBtn = document.querySelector(".modal-floater-close-btn");

document.addEventListener("readystatechange", (e) => {
  if (e.target.readyState === "complete") {
    initApp();
  }
});

const initApp = () => {
  console.log("App initializes...");

  const spotifyAPIKey = {
    clientId: "dba20c29068348e2bd7a02b5308caa74",
    clientSecret: "4a780916adee4e05a60e8e938c2471e7",
  };

  //  functions
  const APIControler = (function () {
    const _getToken = async () => {
      const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            btoa(spotifyAPIKey.clientId + ":" + spotifyAPIKey.clientSecret),
        },
        body: "grant_type=client_credentials",
      });

      const data = await result.json();
      return data.access_token;
    };

    return {
      getToken() {
        return _getToken();
      },
    };
  })();

  //search Songs
  const searchTracks = async (token, searchQuery) => {
    const searchResult = await fetch(
      `https://api.spotify.com/v1/search?q=${searchQuery}&type=track%2Cartist`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    const data = await searchResult.json();

    const songs = data.tracks.items;

    let matches = songs.filter((song) => {
      // matching text input with regex
      // const regexInput = new RegExp(`^${searchQuery}$`, "gi");

      return (
        // to match exact letters
        // song.artists[0].name.match(regexInput) || song.name.match(regexInput)
        song.artists[0].name || song.name.toLowerCase()
      );
    });

    return matches;
  };

  APIControler.getToken().then((token) => {
    searchTextVal.addEventListener("keyup", async (e) => {
      e.stopPropagation();

      const searchInput = e.target.value.toLowerCase();

      if (!searchInput == "") {
        const spotifyData = await searchTracks(token, searchInput);

        const matches = spotifyData.filter((song) => {
          return spotifyData.indexOf(song) < 5;
        });

        return renderSearchResults(matches);
      } else {
        injectValue.innerHTML = "";
      }
    });
  });

  const renderSearchResults = (matches) => {
    let content = matches
      .map((song) => {
        let imgUrl = song.album.images[2].url;
        let songTitle = song.name;
        let artistName = song.artists[0].name;
        return ` 
        <li class="search-list-item d-flex p-3 gap-1" tabindex="0" data-song-title="${songTitle}" data-song-artist="${artistName}">
          <div class="img-cover">
              <img src="${imgUrl}" alt="${songTitle}">
          </div>
          <div class="song-artist-details">
              <h3 class="song-title">${songTitle}</h3>
              <p class="artist-name">${artistName}</p>
          </div>
      </li>`;
      })
      .join("");

    injectValue.innerHTML = content;
    searchResultsListDropDown(matches);
  };
  //end init app
};

const searchResultsListDropDown = (songDetails) => {
  const listEvents = document.querySelectorAll("li.search-list-item");
  listEvents.forEach((childItem) => {
    // when search results show and when each item is clicked
    // a dialog modal will show
    childItem.addEventListener("click", (e) => {
      // variables assigned to each list
      const songTitle = childItem.getAttribute("data-song-title");
      const songArtist = childItem.getAttribute("data-song-artist");
      // filter the song based on what the users clicked
      const songMatchedClicked = songDetails.filter((song) => {
        if (song.name == songTitle && song.artists[0].name == songArtist) {
          return song;
        }
      });

      // song details object
      const songDetail = {
        songName: songMatchedClicked[0].name,
        songPlayURL: songMatchedClicked[0].external_urls.spotify,
        songArtist: songMatchedClicked[0].artists[0].name,
        songArtistURL: songMatchedClicked[0].artists[0].external_urls.spotify,
        songImgURL: songMatchedClicked[0].album.images[0].url,
        songAlbumName: songMatchedClicked[0].album.name,
        songAlbumReleaseYear: songMatchedClicked[0].album.release_date,
        songAlbumURL: songMatchedClicked[0].album.external_urls.spotify,
        songPlayableURI: songMatchedClicked[0].uri,
      };

      const showYearOnly = convertReleaseDateFunction(songDetail);

      showSongDetails(songDetail, showYearOnly);
      showModal();
      closeModal();

      injectValue.innerHTML = "";
      searchTextVal.value = "";
    });
  });
};

// inject song details to the DOM
const showSongDetails = (songItemDetail, releaseDateYear) => {
  const renderModal = `<div class="modal-inner" id="modal-inner-content">
  <picture><img src="${songItemDetail.songImgURL}" alt="album cover for the song ${songItemDetail.songName}" class="modal_album-cover-img" width="516" height="516" />
  </picture>
  <div class="album-details d-grid">
      <div class="details-left">
          <article>
              <h4><a href="${songItemDetail.songPlayURL}" target="_blank">${songItemDetail.songName}</a></h4>
              <p>Artist:  <a href="${songItemDetail.songArtistURL}" target="_blank">${songItemDetail.songArtist}</a></p>
              <p>Album: <a href="${songItemDetail.songAlbumURL}" target="_blank">${songItemDetail.songAlbumName}</a></p>

          </article>
      </div>
      <div class="details-right year-released">
          <p>release date<span class="year">${releaseDateYear}</span></p>
      </div>
  </div>
  <div class="short-desc">
      <p>Writing a beautiful user interface requires a blend of creativity and functionality, merging visual appeal with usability. By skillfully integrating elements like color, typography, layout, and interaction, designers can craft interfaces that engage users on multiple levels. A well-designed interface not only captivates users but also enhances their overall experience, making it intuitive and enjoyable.</p>            
      <div class="uri-link">
      <img src="https://scannables.scdn.co/uri/plain/jpeg/000000/white/640/${songItemDetail.songPlayableURI}" width="250" height="62.5" alt="spotify uri image. this image will be scanned by spotify app and automatically be played."/>
      </div>
  </div> 
</div>`;

  showModalSongDetails.insertAdjacentHTML("beforeend", renderModal);
};

// function that will only display the year date
const convertReleaseDateFunction = (songDetailRelYear) => {
  const albumReleaseYear = songDetailRelYear.songAlbumReleaseYear;
  const parts = albumReleaseYear.split("-");
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // Months in JavaScript are zero-based (0-11)
  const day = parseInt(parts[2]);

  const releaseDate = new Date(year, month, day);
  const showYearOnly = releaseDate.getFullYear();

  return showYearOnly;
};

const closeModal = () => {
  floatingCloseBtn.addEventListener("click", (e) => {
    if (e.target == floatingCloseBtn) {
      bodyFixedModalOpened.classList.remove("modal-dialog-opened");
      showModalSongDetails.classList.remove("open");
      showModalSongDetails.innerHTML = "";
      floatingCloseBtn.classList.remove("show");
    }
  });
};

const showModal = () => {
  bodyFixedModalOpened.classList.add("modal-dialog-opened");
  showModalSongDetails.classList.add("open");
  floatingCloseBtn.classList.add("show");
  const modalContent = document.querySelector(".modal-inner");
  if (showModalSongDetails.children.length > 0)
    modalInnerCardMouseTrack(modalContent);
};

// track mouse move and show the clost div button
showModalSongDetails.addEventListener("mousemove", (event) => {
  // Get the mouse position
  const mousePosition = {
    x: event.clientX,
    y: event.clientY,
  };

  // Set the position of the div element to the mouse position
  floatingCloseBtn.style.left = mousePosition.x - 40 + "px";
  floatingCloseBtn.style.top = mousePosition.y - 15 + "px";
});

// event listener to track mouse movement x & y
const modalInnerCardMouseTrack = (modaInnerContent) => {
  modaInnerContent.addEventListener("mouseenter", (e) => {
    floatingCloseBtn.classList.remove("show");
  });
  modaInnerContent.addEventListener("mouseleave", (e) => {
    floatingCloseBtn.classList.add("show");
  });
};

const newArr = [
  {
    name: "Dollar",
    age: 22,
  },
  {
    name: "Kenneth",
    age: 37,
  },
  {
    name: "Rio",
    age: 28,
  },
];

function reverseObj(arr) {
  return arr.map((obj) =>
    Object.entries(obj).reduce((acc, [key, val]) => {
      acc[val] = key;
      return acc;
    }, {})
  );
}

console.log(reverseObj(newArr));
