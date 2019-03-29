let BEGINNER_WPM = 20;
let INTERMEDIATE_WPM = 50;
let ADVANCED_WPM = 80;

let config = {
  type: Phaser.CANVAS,
  width: 800,
  height: 400,
  scene: [Boot, Preloader, Menu, DifficultyMenu, Sisyphus, Zeno, Danaids, Tantalus, Prometheus, Camus],
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
};

let game = new Phaser.Game(config);
