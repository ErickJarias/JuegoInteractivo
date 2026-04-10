class SoundService {
  private goalSound: HTMLAudioElement | null = null;
  private goalShout: HTMLAudioElement | null = null;
  private failSound: HTMLAudioElement | null = null;
  private stadiumAmbience: HTMLAudioElement | null = null;
  private whistleSound: HTMLAudioElement | null = null;
  private comboSound: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Placeholders with more descriptive names/better sources if possible
      this.goalSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'); // Intense crowd roar
      this.goalShout = new Audio('https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3'); // Crowd cheer/shout
      this.failSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3'); // Disappointed crowd
      this.stadiumAmbience = new Audio('https://assets.mixkit.co/active_storage/sfx/112/112-preview.mp3'); // Constant stadium noise
      this.whistleSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3'); // Referee whistle
      this.comboSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2016/2016-preview.mp3'); // Power-up/Combo sound
      
      if (this.stadiumAmbience) {
        this.stadiumAmbience.loop = true;
        this.stadiumAmbience.volume = 0.15;
      }
    }
  }

  playGoal() {
    if (this.goalSound) {
      this.goalSound.currentTime = 0;
      this.goalSound.volume = 0.8;
      this.goalSound.play().catch(() => {});
    }
    if (this.goalShout) {
      this.goalShout.currentTime = 0;
      this.goalShout.volume = 0.9;
      this.goalShout.play().catch(() => {});
    }
  }

  playFail() {
    if (this.failSound) {
      this.failSound.currentTime = 0;
      this.failSound.volume = 0.6;
      this.failSound.play().catch(() => {});
    }
  }

  playWhistle() {
    if (this.whistleSound) {
      this.whistleSound.currentTime = 0;
      this.whistleSound.volume = 0.5;
      this.whistleSound.play().catch(() => {});
    }
  }

  playCombo() {
    if (this.comboSound) {
      this.comboSound.currentTime = 0;
      this.comboSound.volume = 0.7;
      this.comboSound.play().catch(() => {});
    }
  }

  startAmbience() {
    if (this.stadiumAmbience) {
      this.stadiumAmbience.play().catch(() => {});
    }
  }

  stopAmbience() {
    if (this.stadiumAmbience) {
      this.stadiumAmbience.pause();
    }
  }
}

export const soundService = new SoundService();
