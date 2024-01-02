// ==UserScript==
// @name         Notify me Stream Canvas (with randomized sounds)
// @namespace    http://littleendu.xyz
// @version      2024
// @description  Notifies when you're able to place a pixel on the canvas, with a random Neuro-sama sound.
// @author       LittleEndu, DaVince
// @match        https://8q5oz45uh8llq89kny7vkt7phuxr0b.ext-twitch.tv/*
// @homepage
// @grant        GM.xmlHttpRequest
// ==/UserScript==

// If you don't want some of these, comment them out by adding // in front of them.
// You can add new ones by following the formatting as shown: "name": "url",
const AUDIO_URLS = {
  "Evil HEART": "https://neuroplace.pages.dev/sounds/heart.mp3",
  "Evil KEKWA": "https://neuroplace.pages.dev/sounds/evilKEKWA.mp3",
  "Evil Corpa Clap": "https://neuroplace.pages.dev/sounds/evil_corpa_clap.mp3",
  "Evil KEK": "https://cdn.discordapp.com/attachments/1127884706831147008/1128686424733003847/evilKEK.mp3",
  "Meow": "https://neuroplace.pages.dev/sounds/meow.mp3",
  "KEKWA": "https://neuroplace.pages.dev/sounds/kekwa.mp3",
  "Erm": "https://neuroplace.pages.dev/sounds/erm.mp3",
  "Erm Erm": "https://neuroplace.pages.dev/sounds/ermErm.mp3",
  "evilKEK": "https://neuroplace.pages.dev/sounds/evilKEK.mp3",
  "HiNeuro": "https://neuroplace.pages.dev/sounds/HiNeuro.mp3",
  "AAAAAUUUUHHHUUUUHH": "https://neuroplace.pages.dev/sounds/AAAAAUUUUHHHUUUUHH.mp3",
  "neuro_wuu": "https://neuroplace.pages.dev/sounds/neuro_wuu.mp3",
  "neuro_uwu": "https://neuroplace.pages.dev/sounds/neuro_uwu.mp3",
  "neuro_owo": "https://neuroplace.pages.dev/sounds/neuro_owo.mp3",
  "neuro_lel": "https://neuroplace.pages.dev/sounds/neuro_lel.mp3",
  "neuro_Hm": "https://neuroplace.pages.dev/sounds/neuro_Hm.mp3",
  "neuro_bansed": "https://neuroplace.pages.dev/sounds/neuro_bansed.mp3",
  "neuro_yeap": "https://neuroplace.pages.dev/sounds/neuro_yeap.mp3",
  "neuro_water": "https://neuroplace.pages.dev/sounds/neuro_water.mp3",
  "neuro_hhhhh": "https://neuroplace.pages.dev/sounds/neuro_hhhhh.mp3",
  "yep1": "https://neuroplace.pages.dev/sounds/yep1.mp3",
  "yep2": "https://neuroplace.pages.dev/sounds/yep2.mp3",
  "heart": "https://neuroplace.pages.dev/sounds/heart.mp3",
  "gymbag": "https://neuroplace.pages.dev/sounds/gymbag.mp3",
  "neuro_he": "https://neuroplace.pages.dev/sounds/neuro_he.mp3",
  "neuro_good": "https://neuroplace.pages.dev/sounds/neuro_good.mp3",
  "neuro_ermcon": "https://neuroplace.pages.dev/sounds/neuro_ermcon.mp3",
  "neuro_noise_01": "https://neuroplace.pages.dev/sounds/neuro_noise_01.mp3",
  "wink": "https://neuroplace.pages.dev/sounds/wink.mp3",
};
const DELAY_SECONDS = 15;

async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

const context = new AudioContext();
class NotificationSound {
  /**
   * @param {string} _name A name for the audio file (for convenience).
   * @param {string} _src The source to the audio file.
   */
  constructor(_name, _src) {
    this.ready = false;
    this.src = _src;
    this.name = _name;
  }

  load() {
    return new Promise((resolve, reject) => {
      console.log(`[Notify me Stream Canvas] Loading constant notification audio ${this.name}...`);

      if (!this.src)
        return reject(new Error('Source is not set.'));
      const error = (errText) => {
        return (err) => {
          console.error(`failed to load the sound from source`, this.src, ':', err);
          reject(new Error(errText));
        };
      };
      GM.xmlHttpRequest({
        method: 'GET',
        url: this.src,
        responseType: 'arraybuffer',
        onload: (response) => {
          const errText = 'Failed to decode audio';
          context.decodeAudioData(response.response, (buffer) => {
            this._buffer = buffer;
            this.ready = true;
            console.log(`[Notify me Stream Canvas] Constant notification audio loaded: ${audioClip.name}`);
            resolve();
          }, error(errText));
        },
        onerror: error(`[Notify me Stream Canvas] Failed to fetch audio from URL: ${this.src}`)
      });
    });
  }

  play() {
    if (!this.ready || !this._buffer) {
      throw new Error('[Notify me Stream Canvas] Audio not ready. Please load the audio with .load()');
    }
    if (this._sound) {
      try {
        this._sound.disconnect(context.destination);
      }
      catch (_a) { }
    }
    this._sound = context.createBufferSource();
    this._sound.buffer = this._buffer;
    this._sound.connect(context.destination);
    this._sound.start(0);
  }
}


(async () => {
  const notificationSounds = [];

  Object.entries(AUDIO_URLS).forEach(audioEntry => {
    notificationSounds.push(new NotificationSound(audioEntry[0], audioEntry[1]));
  });

  notificationSounds.forEach(audioClip => {
    audioClip.load();
  });

  let cooldownProgress = null;
  console.log("[Notify me Stream Canvas] Targeting cooldown progress")
  while (!cooldownProgress) {
    await sleep(1000)
    cooldownProgress = document.querySelector('.cooldown-progress')
  }
  console.log("[Notify me Stream Canvas] Cooldown progress found")

  let pixelAvailable = () => {
    let _style = window.getComputedStyle(cooldownProgress);
    if (_style.width > _style.height)
      return parseFloat(cooldownProgress.style.width) > 99;
    else
      return parseFloat(cooldownProgress.style.height) > 99;
  }

  let pixelWebsocketOffline = () => {
    let _style = window.getComputedStyle(cooldownProgress)
    if (_style.width > _style.height) {
      let w = parseFloat(cooldownProgress.style.width)
      return w < 1 || w > 99
    }
    else {
      let h = parseFloat(cooldownProgress.style.height)
      return h < 1 || h > 99
    }
  }

  while (true) {
    await sleep(100);
    while (pixelAvailable()) {
      const randomAudioClip = notificationSounds[Math.floor(Math.random() * notificationSounds.length)];
      console.log(`[Notify me Stream Canvas] Playing notification ${randomAudioClip.name}`);
      randomAudioClip.play();
      await sleep(DELAY_SECONDS * 1000);
    }
    while (pixelWebsocketOffline()) {
      // Stream Canvas websocket is offline so cooldown switches between 0 and 100
      // We don't want to spam the audio so we wait a bit
      await sleep(1000);
    }
  }
})().catch(console.error);
