let Prometheus = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize: function Prometheus () {
    Phaser.Scene.call(this, { key: 'prometheus' });

    this.EAGLE_FLY_SPEED = 70;
  },

  create: function () {
    this.cameras.main.setBackgroundColor('#faa');

    this.gameIsOver = false;

    // Sound

    this.peckSFX = this.sound.add('peck');
    this.peckSFX.volume = 0.2;
    this.liverRegenerationSFX = this.sound.add('swoopup');
    this.liverRegenerationSFX.volume = 0.2;
    this.gameOverSFX = this.sound.add('swoopdown');
    this.gameOverSFX.volume = 0.2;
    this.victorySFX = this.sound.add('victory');
    this.victorySFX.volume = 0.2;

    // Prometheus

    this.prometheus = this.add.sprite(this.game.canvas.width/2,this.game.canvas.height/2 + 4*10,'atlas','prometheus/prometheus/prometheus_1.png').setScale(4);

    this.createAnimation('prometheus_struggle','prometheus/prometheus/prometheus',2,3,5,0);

    // this.prometheus.anims.play('prometheus_struggle');

    // Rock

    this.rock = this.add.sprite(this.game.canvas.width/2,this.game.canvas.height/2,'atlas','prometheus/rock/rock_1.png').setScale(4);

    // Nighttime scene

    this.night = this.add.sprite(400,200,'atlas','prometheus/night.png').setScale(4);
    this.night.alpha = 0;


    // Eagle

    this.eagle = this.physics.add.sprite(-20,-20,'atlas','prometheus/eagle/eagle_1.png').setScale(4);
    this.eagle.setCollideWorldBounds(false);

    this.createAnimation('eagle_flying','prometheus/eagle/eagle',1,4,5,-1);
    this.createAnimation('eagle_perched','prometheus/eagle/eagle',5,5,5,-1);
    this.createAnimation('eagle_peck','prometheus/eagle/eagle',6,5,5,0);

    this.canPeck = true;

    this.eagle.anims.play('eagle_flying');

    // DARKENED ROCK FOR NIGHTTIME

    this.darkRock = this.add.sprite(400,200,'atlas','prometheus/dark_rock.png').setScale(4);
    this.darkRock.alpha = 0;

    // Hotspots

    this.perches = this.createPerches();
    this.currentPerch = null;

    this.physics.add.overlap(this.eagle,this.perches, this.perch, null, this);

    // Input

    this.cursors = this.input.keyboard.createCursorKeys();

    this.inputEnabled = false;

    // Instructions

    let flyInstructionStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: '#000', wordWrap: true, align: 'center' };
    let flyInstructionString = "YOU ARE THE EAGLE\nUSE ARROW KEYS\nTO FLY AND LAND\nON PROMETHEUS'S BODY";
    this.flyInstructionsText = this.add.text(this.game.canvas.width/2,100,flyInstructionString,flyInstructionStyle);
    this.flyInstructionsText.setOrigin(0.5);

    let peckInstructionStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: '#000', wordWrap: true, align: 'center' };
    let peckInstructionString = "USE SPACEBAR TO\nPECK OUT\nPROMETHEUS'S\nLIVER";
    this.peckInstructionsText = this.add.text(400,100,peckInstructionString,peckInstructionStyle);
    this.peckInstructionsText.setOrigin(0.5);
    this.peckInstructionsText.visible = false;


    // Stats

    this.liver = 100;

    let liverStatStyle = { fontFamily: 'Commodore', fontSize: '28px', fill: '#000', wordWrap: true, align: 'left' };
    let liverStatString = `LIVER: ${this.liver}%`;
    this.liverText = this.add.text(80,234,liverStatString,liverStatStyle);
    this.liverText.setOrigin(0);

    this.days = 0;

    let dayStatStyle = { fontFamily: 'Commodore', fontSize: '28px', fill: '#000', wordWrap: true, align: 'left' };
    let dayStatString = `DAYS: ${this.days}`;
    this.dayText = this.add.text(500,234,dayStatString,dayStatStyle);
    this.dayText.setOrigin(0);

    // Blackness
    let screenRect = new Phaser.Geom.Rectangle(0,0, this.game.canvas.width, this.game.canvas.height);
    this.blackness = this.add.graphics({ fillStyle: { color: '#000' } });
    this.blackness.fillRectShape(screenRect);
    this.blackness.alpha = 0;

    this.elapsed = 0;
    this.DAY_LENGTH = 20000;
    this.endOfDayTween = null;

    // Tween in the eagle
    this.arrive();
  },

  update: function (time,delta) {
    if (this.gameIsOver) return;

    if (this.inputEnabled) {
      this.elapsed += delta;
      if (this.elapsed >= this.DAY_LENGTH && this.endOfDayTween === null) {
        console.log("endOfDay() triggered by elapsed time.");
        this.endOfDay();
      }
    }

    this.handleInput();
    this.updatePrometheus();
  },

  endOfDay: function () {
    if (this.endOfDayTween !== null) {
      return;
    }

    this.endOfDayTween = this.tweens.add({
      targets: [this.night, this.darkRock],
      alpha: 1,
      duration: 2000,
      delay: 1000,
      repeat: 0,
      onComplete: () => {
        console.log("endOfDay tween complete");
        this.endOfDayTween = null;
        this.inputEnabled = false;
        setTimeout(() => {
          if (this.liver > 0) {
            console.log("Liver > 0")
            this.gameIsOver = true;
            this.victorySFX.play();
            setTimeout(() => {
              this.gameOver("PROMETHEUS MADE IT TO THE NIGHT\nWITH SOME LIVER INTACT!");
            },1000);
          }
          else {
            this.reset();
          }
        },2000);
      },
    });
  },

  reset: function () {
    // Start the next day
    this.endOfDayTween = null;
    this.days++;
    this.elapsed = 0;
    this.liver = 100;
    this.depart();
  },

  depart: function () {
    this.eagle.setCollideWorldBounds(false);
    this.eagle.anims.play('eagle_flying');
    this.eagle.flipX = false;
    this.tweens.add({
      targets: this.eagle,
      x: this.game.canvas.width + 20,
      y: -20,
      duration: Phaser.Math.Distance.Between(this.eagle.x,this.eagle.y,this.game.canvas.width + 20,20)/50 * 1000,
      repeat: 0,
      onComplete: () => {
        this.liverRegenerationSFX.play();
        setTimeout(() => {
          this.eagle.x = -20;
          this.eagle.y = -20;
          this.currentPerch = null;
          this.liverText.text = `LIVER: ${this.liver}%`;
          this.dayText.text = `DAYS: ${this.days}`;
          this.tweens.add({
            targets: [this.night, this.darkRock],
            alpha: 0,
            duration: 2000,
            repeat: 0,
            onComplete: () => {
              this.arrive();
            },
          });
        },2000);
      }
    });
  },

  handleInput: function () {

    if (!this.inputEnabled) return;

    if (this.currentPerch !== null) {
      if (this.cursors.up.isDown) {
        this.hover();
      }
      else if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.currentPerch.peck && this.canPeck) {
        this.peck();
      }
      return;
    }

    // Check cursor input and move eagle appropriately
    if (this.cursors.left.isDown) {
      this.eagle.setVelocityX(-this.EAGLE_FLY_SPEED);
      this.eagle.flipX = true;
    }
    else if (this.cursors.right.isDown) {
      this.eagle.setVelocityX(this.EAGLE_FLY_SPEED);
      this.eagle.flipX = false;
    }
    else {
      this.eagle.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.eagle.setVelocityY(-this.EAGLE_FLY_SPEED);
    }
    else if (this.cursors.down.isDown) {
      this.eagle.setVelocityY(this.EAGLE_FLY_SPEED);
    }
    else {
      this.eagle.setVelocityY(0);
    }
  },

  updatePrometheus: function () {
    if (this.inputEnabled && this.currentPerch != null && this.currentPerch.peck && Math.random() < 0.01 && this.liver > 0) {
      this.prometheus.anims.play('prometheus_struggle');
      this.hover();
    }
  },

  hover: function () {
    console.log("hover");
    this.eagle.anims.play('eagle_flying');
    this.currentPerch = null;
    this.inputEnabled = false;
    let eagleTweenHover = this.tweens.add({
      targets: this.eagle,
      y: this.eagle.y - 50,
      duration: 1000,
      repeat: 0,
      onComplete: () => {
        this.inputEnabled = true;
        this.eagle.body.checkCollision.none = false;
        this.eagle.setVelocityY(0);
      },
    });
  },

  arrive: function () {
    this.elapsed = 0;
    this.canPeck = true;
    this.currentPerch = null;
    this.eagle.anims.play('eagle_flying');
    this.eagle.setCollideWorldBounds(false);
    this.eagle.body.checkCollision.none = false;

    let eagleTweenIn = this.tweens.add({
      targets: this.eagle,
      x: 100,
      y: 100,
      duration: 1500,
      repeat: 0,
      onComplete: () => {
        this.elapsed = 0;
        this.inputEnabled = true;
        this.eagle.setCollideWorldBounds(true);
      },
    });
  },

  peck: function () {
    if (this.peckInstructionsText.visible) {
      setTimeout(() => {
        this.peckInstructionsText.visible = false;
      },500);
    }

    this.eagle.anims.play("eagle_peck");
    this.peckSFX.play();

    this.liver -= 10;
    if (this.liver < 0) this.liver = 0;

    if (this.liver === 0) {
      // Short-circuit the day if this was the last peck
      this.inputEnabled = false;
      this.endOfDay();
    }

    this.liverText.text = `LIVER: ${this.liver}%`;
    this.canPeck = false;
    setTimeout(() => {
      if (this.liver > 0) this.canPeck = true;
    },750);
  },

  // createAnimation(name,start,end)
  //
  // Helper function to generate the frames and animation for Sisyphus between set limits
  createAnimation: function (name,path,start,end,framerate,repeat) {
    let frames = this.anims.generateFrameNames('atlas', {
      start: start, end: end, zeroPad: 0,
      prefix: path + '_', suffix: '.png'
    });
    let config = {
      key: name,
      frames: frames,
      frameRate: framerate,
      repeat: repeat,
    };
    this.anims.create(config);
  },

  createPerches: function () {
    let perches = this.physics.add.staticGroup();

    // Liver
    this.createPerch(perches,4*99,4*61,4*98,4*56,true,false);
    // Head
    this.createPerch(perches,4*108,4*61,4*108,4*54,false,true);
    // Feet
    this.createPerch(perches,4*92,4*64,4*92,4*58,false,false);
    // West 1
    this.createPerch(perches,4*86,4*72,4*85,4*68,false,true);
    // West 2
    this.createPerch(perches,4*76,4*80,4*76,4*76,false,true);
    // West 3
    this.createPerch(perches,4*66,4*88,4*68,4*88,false,true);
    // West 4
    this.createPerch(perches,4*64,4*98,4*64,4*94,false,true);
    // East 1
    this.createPerch(perches,4*116,4*64,4*116,4*62,false,false);
    // East 2
    this.createPerch(perches,4*124,4*74,4*124,4*72,false,false);
    // East 3
    this.createPerch(perches,4*134,4*84,4*133,4*82,false,false);
    // East 3
    this.createPerch(perches,4*142,4*90,4*141,4*87,false,false);
    // East 4
    this.createPerch(perches,4*150,4*95,4*152,4*94,false,false);

    return perches;
  },

  createPerch: function (perches,x,y,perchX,perchY,peck,flipX) {
    let p = perches.create(x,y,'atlas','prometheus/perch.png').setScale(4);
    p.peck = peck;
    p.data = { x: perchX, y: perchY, flipX: flipX, destroy: function () {} };
    p.alpha = 0.5;
    p.visible = false;
  },

  perch: function (eagle, perch) {
    if (this.flyInstructionsText.visible && perch.peck) {
      this.flyInstructionsText.visible = false;
      setTimeout(() => {
        this.peckInstructionsText.visible = true;
      },500);
    }

    this.eagle.x = perch.data.x;
    this.eagle.y = perch.data.y;
    this.eagle.flipX = perch.data.flipX;
    this.eagle.setVelocityX(0);
    this.eagle.setVelocityY(0);
    this.eagle.anims.play('eagle_perched');
    this.currentPerch = perch;

    // this.cursors.down.reset();

    // this.inputEnabled = false;
    // setTimeout(() => {
    //   this.inputEnabled = true;
    // },500);

    this.eagle.body.checkCollision.none = true;
  },

  gameOver: function (text) {
    this.gameIsOver = true;

    this.gameOverSFX.play();

    this.blackness.alpha = 1;
    let gameOverStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: '#faa', wordWrap: true, align: 'center' };
    let gameOverString = "YOU LOSE!\n\n" + text;
    let gameOverText = this.add.text(this.game.canvas.width/2,this.game.canvas.height/2,gameOverString,gameOverStyle);
    gameOverText.setOrigin(0.5);

    setTimeout(() => {
      this.scene.start('menu');
    },4000);
  }

});
