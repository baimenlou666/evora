(() => {
  // <stdin>
  var IFRAME = document.createElement("iframe");
  var VIDEO_PREFIX = "https://www.youtube-nocookie.com/embed/";
  var SELECT_SONG = document.querySelector("#select-song");
  var CONTAINER = document.querySelector("#playlist-container");
  var BTN_PREV = document.querySelector("button#btn-prev");
  var BTN_PAUSE_PLAY = document.querySelector("button#btn-pause-play");
  var BTN_NEXT = document.querySelector("button#btn-next");
  var SELECT_PLAYING_MODE = document.querySelector("select#playing-mode");
  async function createYouTubePlayer() {
    IFRAME.setAttribute("src", "");
    IFRAME.setAttribute("frameborder", "0");
    IFRAME.setAttribute("allowfullscreen", "");
    IFRAME.setAttribute("id", "musicVideoPlayer");
    IFRAME.setAttribute("allow", "autoplay");
    SELECT_SONG.addEventListener("change", (e) => {
      e.preventDefault();
      changeMusic();
    });
    changeMusic(false);
    IFRAME.addEventListener("load", function() {
      this.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: "setVolume",
          args: [50]
        }),
        "*"
      );
      this.contentWindow.postMessage(JSON.stringify({ event: "listening" }), "*");
    });
    BTN_PREV.addEventListener("click", () => handleNextPrev(-1));
    BTN_NEXT.addEventListener("click", () => handleNextPrev(1));
    BTN_PAUSE_PLAY.addEventListener("click", () => pauseOrPlay());
    CONTAINER.prepend(IFRAME);
    return IFRAME;
  }
  window.addEventListener("message", (e) => {
    if (e.origin.includes("youtube-nocookie.com")) {
      let data = JSON.parse(e.data);
      if (data.event == "infoDelivery") {
        parseYoutubeData(data);
      }
    }
  });
  function parseYoutubeData(data) {
    const { playerState } = data.info;
    switch (playerState) {
      case 0:
        handleVideoEnd();
        break;
      case 1:
        BTN_PAUSE_PLAY.dataset.playing = true;
        BTN_PAUSE_PLAY.ariaLabel = "Pause Video";
        break;
      case 2:
        BTN_PAUSE_PLAY.dataset.playing = false;
        BTN_PAUSE_PLAY.ariaLabel = "Play Video";
        break;
      default:
        break;
    }
  }
  function changeMusic(autoplay = true) {
    let videoSrc = VIDEO_PREFIX + SELECT_SONG.value + "?enablejsapi=1";
    if (autoplay) {
      videoSrc += "&autoplay=1";
    }
    const selectedChild = SELECT_SONG.selectedOptions.item(0);
    if (selectedChild.hasAttribute("data-start")) {
      const seconds = Number(selectedChild.dataset.start);
      videoSrc += "&start=" + seconds;
    }
    IFRAME.setAttribute("src", videoSrc);
  }
  function changeSelectionTo(offset) {
    let index = SELECT_SONG.selectedIndex;
    let optionsLength = SELECT_SONG.length;
    if (index + offset < 0) {
      SELECT_SONG.selectedIndex = optionsLength - 1;
    } else if (index + offset >= optionsLength) {
      SELECT_SONG.selectedIndex = 0;
    } else {
      SELECT_SONG.selectedIndex = index + offset;
    }
    changeMusic();
  }
  function chooseRandomSong() {
    let optionsLength = SELECT_SONG.length;
    SELECT_SONG.selectedIndex = Math.floor(Math.random() * optionsLength);
    changeMusic();
  }
  function handleNextPrev(offset) {
    if (SELECT_PLAYING_MODE.value == "RANDOM") {
      chooseRandomSong();
      return;
    }
    changeSelectionTo(offset);
  }
  function pauseOrPlay() {
    let event = {
      event: "command",
      func: "pauseVideo"
    };
    if (BTN_PAUSE_PLAY.dataset.playing == "true") {
      event.func = "pauseVideo";
      BTN_PAUSE_PLAY.dataset.playing = false;
      BTN_PAUSE_PLAY.ariaLabel = "Play Video";
    } else {
      event.func = "playVideo";
      BTN_PAUSE_PLAY.dataset.playing = true;
      BTN_PAUSE_PLAY.ariaLabel = "Pause Video";
    }
    IFRAME.contentWindow.postMessage(JSON.stringify(event), "*");
  }
  function handleVideoEnd() {
    const playingMode = SELECT_PLAYING_MODE.value;
    switch (playingMode) {
      case "PLAYLIST":
        changeSelectionTo(1);
        break;
      case "LOOP":
        changeSelectionTo(0);
        break;
      case "RANDOM":
        chooseRandomSong();
    }
  }
  window.addEventListener("load", () => createYouTubePlayer());
})();
