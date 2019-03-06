let config = {
  type: Phaser.CANVAS,
  width: 800,
  height: 400,
  scene: [Boot, Preloader, Menu, DifficultyMenu, Sisyphus, Zeno, Danaids, Tantalus, Prometheus],
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
};

let game = new Phaser.Game(config);
