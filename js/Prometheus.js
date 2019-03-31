let Prometheus = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize: function Prometheus () {
    Phaser.Scene.call(this, { key: 'prometheus' });

    this.EAGLE_FLY_SPEED = 80;
  },

  create: function () {
    this.cameras.main.setBackgroundColor('#faa');

    this.gameIsOver = false;

    // Sound
    this.victorySFX = this.sound.add('victory');
    this.victorySFX.volume = 0.2;
    this.gameOverSFX = this.sound.add('swoopdown');
    this.gameOverSFX.volume = 0.2;
    this.newDaySFX = this.sound.add('swoopdown');
    this.newDaySFX.volume = 0.2;
    this.peckSFX = this.sound.add('peck');
    this.peckSFX.volume = 0.2;
    this.goodKeySFX = this.sound.add('key-good');
    this.goodKeySFX.volume = 0.2;
    this.badKeySFX = this.sound.add('key-bad');
    this.badKeySFX.volume = 0.2;

    // Prometheus
    this.prometheus = this.add.sprite(this.game.canvas.width/2,this.game.canvas.height/2 + 4*10,'atlas','prometheus/prometheus/prometheus_1.png').setScale(4);

    this.createAnimation('prometheus_idle','prometheus/prometheus/prometheus',1,1,5,0);
    this.createAnimation('prometheus_struggle','prometheus/prometheus/prometheus',2,3,2,0);

    this.prometheus.on('animationcomplete', (animation,frame) => {
      switch(animation.key) {
        case 'prometheus_struggle':
        this.prometheus.anims.play('prometheus_idle');
        break;
      }
    });

    this.prometheus.anims.play('prometheus_idle');

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

    this.landTargetX = this.prometheus.x - 2*4;
    this.landTargetY = this.prometheus.y - 4*4;

    this.awayTargetX = this.game.canvas.width + 20;
    this.awayTargetY = -20;

    // DARKENED ROCK FOR NIGHTTIME

    this.darkRock = this.add.sprite(400,200,'atlas','prometheus/dark_rock.png').setScale(4);
    this.darkRock.alpha = 0;

    // Input

    this.createTypingInput();

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

  createTypingInput: function () {
    let minWPM;
    let input;

    switch (difficulty) {
      case 'beginner':
      minWPM = BEGINNER_WPM;
      input = prometheusBeginnerGrammar;
      break;

      case 'intermediate':
      minWPM = INTERMEDIATE_WPM;
      input = prometheusIntermediateGrammar;
      break;

      case 'advanced':
      minWPM = ADVANCED_WPM;
      input = prometheusAdvancedStrings;
      break;
    }
    this.typingInput = new TypingInput(this,100,30,input,minWPM,'#000',155,80,'#000',0xFCFB00);
    this.typingInput.create();
  },

  update: function (time,delta) {
    this.updatePrometheus();
  },

  updatePrometheus: function () {
    if (this.liver > 0 && this.typingInput.success() && this.prometheus.anims.currentAnim.key === 'prometheus_idle') {
      this.prometheus.anims.play('prometheus_struggle');
      if (this.perched) {
        this.hover();
      }
    }
  },

  arrive: function () {
    this.typingInput.enable();
    this.eagle.anims.play('eagle_flying');
    let eagleTweenIn = this.tweens.add({
      targets: this.eagle,
      x: this.landTargetX,
      y: this.landTargetY,
      duration: this.getFlightDuration(this.landTargetX,this.landTargetY),
      repeat: 0,
      onComplete: () => {
        this.land();
      },
    });
  },

  land: function () {
    let eagleTweenHover = this.tweens.add({
      targets: this.eagle,
      x: this.landTargetX,
      y: this.landTargetY,
      duration: this.getFlightDuration(this.landTargetX,this.landTargetY)+0.0001,
      repeat: 0,
      onComplete: () => {
        this.eagle.x = this.landTargetX;
        this.eagle.y = this.landTargetY;
        this.perched = true;
        this.eagle.anims.play('eagle_perched');
        this.peckTimeout = setTimeout(() => {
          this.peck();
        },1000 + Math.random() * 2000);
      },
    });
  },

  hover: function () {
    this.perched = false;
    clearTimeout(this.peckTimeout);
    this.eagle.anims.play('eagle_flying');
    let eagleTweenHover = this.tweens.add({
      targets: this.eagle,
      y: this.eagle.y - 50,
      duration: 1000,
      duration: this.getFlightDuration(this.eagle.x,this.eagle.y - 50),
      repeat: 0,
      onComplete: () => {
        this.land();
      },
    });
  },

  peck: function () {
    this.eagle.anims.play("eagle_peck");
    this.peckSFX.play();

    this.liver -= 10;
    if (this.liver < 0) this.liver = 0;

    this.liverText.text = `LIVER: ${this.liver}%`;

    if (this.liver === 0) {
      // Short-circuit the day if this was the last peck
      this.typingInput.disable();
      this.depart();
    }
    else {
      this.peckTimeout = setTimeout(() => {
        this.peck();
      },2000);
    }
  },

  depart: function () {
    this.eagle.flipX = false;
    this.tweens.add({
      targets: this.eagle,
      x: this.awayTargetX,
      y: this.awayTargetY,
      duration: this.getFlightDuration(this.awayTargetX,this.awayTargetY),
      delay: 2000,
      repeat: 0,
      onDelay: () => {
        this.eagle.anims.play('eagle_flying');
      },
      onComplete: () => {
        this.endOfDay();
      }
    });
  },

  endOfDay: function () {
    this.endOfDayTween = this.tweens.add({
      targets: [this.night, this.darkRock],
      alpha: 1,
      duration: 1,
      delay: 2500,
      repeat: 0,
      onComplete: () => {
        this.endOfDayTween = null;
        this.eagle.x = -20;
        this.eagle.y = -20;
        this.currentPerch = null;
        this.liverText.text = `LIVER: ${this.liver}%`;
        this.dayText.text = `DAYS: ${this.days}`;
        this.tweens.add({
          targets: [this.night, this.darkRock],
          alpha: 0,
          duration: 1,
          delay: 5000,
          repeat: 0,
          onComplete: () => {
            this.days++;
            this.liver = 100;
            this.liverText.text = `LIVER: ${this.liver}%`;
            this.newDaySFX.play();
            this.arrive();
          },
        });
      },
    });
  },

  getFlightDuration: function (targetX,targetY) {
    return (Phaser.Math.Distance.Between(this.eagle.x,this.eagle.y,targetX,targetY) / this.EAGLE_FLY_SPEED) * 1000
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

});
