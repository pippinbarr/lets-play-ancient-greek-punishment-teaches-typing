let Zeno = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize: function Zeno () {
    Phaser.Scene.call(this, { key: 'zeno' });

    this.ZENO_SPEED = 10;//0.2;
    this.ZENO_START_X = 16*4;
    this.ZENO_HALFWAY_X = 88*4;
  },

  create: function () {
    this.cameras.main.setBackgroundColor('#dad');

    // Sound
    this.victorySFX = this.sound.add('victory');
    this.victorySFX.volume = 0.2;
    this.defeatSFX = this.sound.add('swoopdown');
    this.defeatSFX.volume = 0.2;
    this.goodKeySFX = this.sound.add('key-good');
    this.goodKeySFX.volume = 0.2;
    this.badKeySFX = this.sound.add('key-bad');
    this.badKeySFX.volume = 0.2;

    this.zeno = this.add.sprite(this.ZENO_START_X, this.game.canvas.height/2 + 4*15, 'atlas', 'zeno/zeno/zeno_1.png');
    this.zeno.setScale(4,4);

    this.flag = this.add.sprite(this.game.canvas.width - 4*18, this.game.canvas.height/2 + 4*10, 'atlas', 'zeno/flag.png');
    this.flag.setScale(4,4);

    let groundRect = new Phaser.Geom.Rectangle(0, this.game.canvas.height/2 + 4*26, this.game.canvas.width, 200);
    this.ground = this.add.graphics({ fillStyle: { color: 0x000000 } });
    this.ground.fillRectShape(groundRect);

    // Add the various animations
    this.createAnimation('zeno_idle',4,4,5,0);
    this.createAnimation('zeno_running',1,3,5,-1);
    this.createAnimation('zeno_victory',4,8,5,0);
    this.createAnimation('zeno_defeat',8,4,5,0);

    // this.zeno.anims.play('zeno_idle');
    // this.zeno.anims.play('zeno_running');

    this.zeno.on('animationcomplete', (animation,frame) => {
      switch(animation.key) {
        case 'zeno_victory':
        let zenoTweenBack = this.tweens.add({
          targets: this.zeno,
          x: this.ZENO_START_X,
          duration: 1000,
          repeat: 0,
          onComplete: () => {
            this.zeno.anims.play('zeno_defeat');
          },
        });

        break;
        case 'zeno_defeat':
        this.typingInput.enable();
        this.zeno.anims.play('zeno_idle');
        break;
      }
    });

    this.start = 0;
    this.halfway = 50;
    this.finish = 100;

    let markerStyle = { fontFamily: 'Commodore', fontSize: '18px', fill: '#fff', wordWrap: true, align: 'left' };
    this.startText = this.add.text(15*4, 82*4, "0m", markerStyle);
    this.halfWayText = this.add.text(95*4, 82*4, "50m", markerStyle);
    this.finishText = this.add.text(180*4, 82*4, "100m", markerStyle);

    // Input
    this.createTypingInput();
  },

  createTypingInput: function () {
    let minWPM;
    let input;

    switch (difficulty) {
      case 'beginner':
      minWPM = BEGINNER_WPM;
      input = zenoBeginnerGrammar;
      break;

      case 'intermediate':
      minWPM = INTERMEDIATE_WPM;
      input = zenoIntermediateGrammar;
      break;

      case 'advanced':
      minWPM = ADVANCED_WPM;
      input = zenoAdvancedStrings;
      break;
    }

    this.typingInput = new TypingInput(this,input,minWPM,0x00A830,this.goodKeySFX,this.badKeySFX);
    this.typingInput.create();
  },

  update: function (time,delta) {

    this.updateZeno();

  },

  updateZeno: function () {
    if (this.typingInput.enabled && this.zeno.x >= this.ZENO_HALFWAY_X) {
      this.typingInput.disable();
      this.zeno.anims.play('zeno_victory');
    }
    else if (this.typingInput.success()) {
      if (this.zeno.anims.currentAnim.key === 'zeno_idle') {
        this.zeno.anims.play('zeno_running');
      }
      this.zeno.x += this.ZENO_SPEED;
    }
    else if (this.typingInput.enabled) {
      this.zeno.anims.play('zeno_idle');
    }
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
