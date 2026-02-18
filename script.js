var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: 'rBKLvdIeAfU',
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'mute': 1,
            'loop': 1,
            'playlist': 'rBKLvdIeAfU',
            'vq': 'hd1080'
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.mute();
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        player.playVideo();
    }
}

// Auto-scrolling advertisement slider
const slider = document.querySelector('.slider-container');
let scrollAmount = 0;

function autoScroll() {
    if (slider.scrollLeft < (slider.scrollWidth - slider.clientWidth)) {
        slider.scrollLeft += 1;
    } else {
        slider.scrollLeft = 0;
    }
}

setInterval(autoScroll, 20);
