let Zeno = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize: function Zeno () {
    Phaser.Scene.call(this, { key: 'zeno' });

    this.FLAG_SPEED = 4;
    this.ZENO_SPEED = 1;
    this.MAX_LEFT = 4*20;
  },

  create: function () {
    this.cameras.main.setBackgroundColor('#dad');

    this.MAX_RIGHT = this.game.canvas.width - 4*20;
    this.MAX_LEFT = 0 + 4*20;

    this.gameIsOver = false;

    // Sound
    this.victorySFX = this.sound.add('victory');
    this.victorySFX.volume = 0.2;
    this.gameOverSFX = this.sound.add('swoopdown');
    this.gameOverSFX.volume = 0.2;

    // Create the sprite that represents the entire minigame, scale up
    this.zeno = this.add.sprite(4*10, this.game.canvas.height/2 + 4*15, 'atlas', 'zeno/zeno/zeno_1.png');
    this.zeno.setScale(4,4);

    let zenoIndicatorString = "< ZENO";
    let zenoIndicatorStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: '#000', wordWrap: true, align: 'center' };
    this.zenoIndicatorText = this.add.text(4*6,240,zenoIndicatorString,zenoIndicatorStyle);

    this.flag = this.add.sprite(this.game.canvas.width - 4*20, this.game.canvas.height/2 + 4*10, 'atlas', 'zeno/flag.png');
    this.flag.setScale(4,4);

    let groundRect = new Phaser.Geom.Rectangle(0, this.game.canvas.height/2 + 4*26, this.game.canvas.width, 200);
    this.ground = this.add.graphics({ fillStyle: { color: 0x000000 } });
    this.ground.fillRectShape(groundRect);

    let dotRect = new Phaser.Geom.Rectangle(this.game.canvas.width/2, this.game.canvas.height/2 + 4*27+2, 4, 12);
    this.dot1 = this.add.graphics({ fillStyle: { color: 0xffffff } });
    this.dot1.fillRectShape(dotRect);

    let dot2Rect = new Phaser.Geom.Rectangle(this.game.canvas.width, this.game.canvas.height/2 + 4*27+2, 4, 12);
    this.dot2 = this.add.graphics({ fillStyle: { color: 0xffffff } });
    this.dot2.fillRectShape(dot2Rect);

    // Add the various animations
    this.createAnimation('idle',4,4,5,0);
    this.createAnimation('running',1,3,5,-1);
    this.createAnimation('victory',4,8,5,0);

    // Sisyphus starts off pushing by default
    this.zeno.anims.play('running');

    // Add input tracking
    this.cursors = this.input.keyboard.createCursorKeys();
    // Track how many input frames there are (for removing the instructions)
    this.inputs = 0;

    // Add instructions
    let instructionStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: '#000', wordWrap: true, align: 'center' };
    let instructionString = "YOU ARE THE FLAG\nUSE ARROW KEYS\nTO MOVE";
    this.instructionsText = this.add.text(this.game.canvas.width/4,100,instructionString,instructionStyle);
    this.instructionsText.setOrigin(0.5);

    this.inputEnabled = true;
  },

  update: function (time,delta) {

    if (this.gameIsOver) return;

    this.handleInput();
    this.updateZeno();

    if (this.flag.x <= this.zeno.x + this.zeno.width/2) {
      this.gameIsOver = true;
      this.zeno.play('victory');
      this.inputEnabled = false;
      this.victorySFX.play();

      setTimeout(() => {
        this.gameOver();
      },1250);
    }
  },

  handleInput: function () {
    if (!this.inputEnabled) return;

    if (this.cursors.left.isDown) {
      this.inputs++;
      if (this.flag.x === this.MAX_LEFT) {
        this.zeno.x += this.FLAG_SPEED;
        this.dot1.x += this.FLAG_SPEED;
        this.dot2.x += this.FLAG_SPEED;
      }
      else {
        this.flag.x -= this.FLAG_SPEED;
        if (this.flag.x < this.MAX_LEFT) {
          this.flag.x = this.MAX_LEFT;
        }
      }
    }
    else if (this.cursors.right.isDown) {
      this.inputs++;
      if (this.flag.x === this.MAX_RIGHT) {
        this.zeno.x -= this.FLAG_SPEED;
        this.dot1.x -= this.FLAG_SPEED;
        this.dot2.x -= this.FLAG_SPEED;
      }
      else {
        this.flag.x += this.FLAG_SPEED;
        if (this.flag.x > this.MAX_RIGHT) {
          this.flag.x = this.MAX_RIGHT;
        }
      }
    }
    if (this.dot1.x < -this.game.canvas.width/2) {
      this.dot1.x += this.game.canvas.width;
    }
    if (this.dot2.x < -this.game.canvas.width) {
      this.dot2.x += this.game.canvas.width;
    }

    if (this.dot1.x > this.game.canvas.width/2) {
      this.dot1.x -= this.game.canvas.width;
    }
    if (this.dot2.x > this.game.canvas.width) {
      this.dot2.x -= this.game.canvas.width;
    }

    if (this.inputs > 120) {
      this.instructionsText.visible = false;
    }
  },

  updateZeno: function () {
    this.zeno.x += this.ZENO_SPEED;

    if (this.zeno.x <= 0 - this.zeno.width) {
      this.zenoIndicatorText.visible = true;
      this.zenoIndicatorText.text = `< ZENO (${Math.floor(Math.abs(this.zeno.x)/40)}m)`
    }
    else {
      this.zenoIndicatorText.visible = false;
    }
  },

  gameOver: function () {
    this.gameIsOver = true;

    this.gameOverSFX.play();

    let screenRect = new Phaser.Geom.Rectangle(0,0, this.game.canvas.width, this.game.canvas.height);
    let gameOverBackground = this.add.graphics({ fillStyle: { color: '#000' } });
    gameOverBackground.fillRectShape(screenRect);
    let gameOverStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: '#aaf', wordWrap: true, align: 'center' };
    let gameOverString = "YOU LOSE!\n\nZENO FINISHED THE RACE!";
    let gameOverText = this.add.text(this.game.canvas.width/2,this.game.canvas.height/2,gameOverString,gameOverStyle);
    gameOverText.setOrigin(0.5);

    setTimeout(() => {
      this.scene.start('menu');
    },2000);
  },

  // createAnimation(name,start,end)
  //
  // Helper function to generate the frames and animation for Sisyphus between set limits
  createAnimation: function (name,start,end,framerate,repeat) {
    let frames = this.anims.generateFrameNames('atlas', {
      start: start, end: end, zeroPad: 0,
      prefix: 'zeno/zeno/zeno_', suffix: '.png'
    });
    let config = {
      key: name,
      frames: frames,
      frameRate: framerate,
      repeat: repeat,
    };
    this.anims.create(config);
  }

});
