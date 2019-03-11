let Preloader = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize: function Preloader () {
    Phaser.Scene.call(this, { key: 'preloader' });
  },

  preload: function () {
    this.ready = false;

    this.load.multiatlas('atlas', 'assets/atlas/atlas.json', 'assets/atlas');
    // this.load.image('clown','assets/clown_logo.png');

    this.load.audio('peck', ['assets/sounds/peck.mp3','assets/sounds/peck.ogg']);
    this.load.audio('swoopup', ['assets/sounds/swoopup.mp3','assets/sounds/swoopup.ogg']);
    this.load.audio('swoopdown', ['assets/sounds/swoopdown.mp3','assets/sounds/swoopdown.ogg']);
    this.load.audio('victory', ['assets/sounds/victory.mp3','assets/sounds/victory.ogg']);
    this.load.audio('key-bad', ['assets/sounds/key-bad.wav']);
    this.load.audio('key-good', ['assets/sounds/key-good.wav']);
  },

  create: function () {
    // Absolutely hideous hack to avoid this font-loading problem: display invisible text in preloader for
    // a tiny amount of time before going to the menu, which seems to fix it.
    let titleStyle = { fontFamily: 'Commodore', fontSize: '38px', fill: '#000', wordWrap: true, align: 'center' };
    let title = this.add.text(this.game.canvas.width/2,100,"LET'S PLAY:\nANCIENT GREEK PUNISHMENT:\nINVERSION EDITION",titleStyle);

    this.add.sprite(this.game.canvas.width/2,this.game.canvas.height/2,'clown_logo');

    setTimeout(() => {
      this.scene.start('menu');
    },1000);
  },
});
