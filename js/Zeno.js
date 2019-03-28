let Zeno = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize: function Zeno () {
    Phaser.Scene.call(this, { key: 'zeno' });

    this.SPECIAL_START_TEXT = "ALMOST\nHALF-WAY";
    this.SPECIAL_HALFWAY_TEXT = "HALF-WAY";
    this.speed = 1;
    this.animSpeed = 100;
    this.ZENO_START_X = 16*4;
    this.ZENO_HALFWAY_X = 95*4;
    this.ZENO_FINISH_X = this.ZENO_HALFWAY_X + (this.ZENO_HALFWAY_X - this.ZENO_START_X);
  },

  create: function () {

    // let test = 50;
    // let count = 0.25;
    // while (test < 100) {
    //   console.log(count);
    //   test += (100 - test)/2;
    //   count += 0.25;
    // }
    // console.log(count);

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
    this.zeno.setOrigin(0.5);

    this.flag = this.add.sprite(this.ZENO_FINISH_X, this.game.canvas.height/2 + 4*10, 'atlas', 'zeno/flag.png');
    this.flag.setScale(4,4);

    let groundRect = new Phaser.Geom.Rectangle(0, this.game.canvas.height/2 + 4*26, this.game.canvas.width, 200);
    this.ground = this.add.graphics({ fillStyle: { color: 0x000000 } });
    this.ground.fillRectShape(groundRect);

    // Add the various animations
    this.createAnimation('zeno_idle',4,4,5,0);
    this.createAnimation('zeno_running',1,3,5,-1);
    this.createAnimation('zeno_victory',4,8,5,0);
    this.createAnimation('zeno_defeat',8,4,5,0);

    this.zeno.anims.play('zeno_idle');

    this.zeno.on('animationcomplete', (animation,frame) => {
      switch(animation.key) {
        case 'zeno_victory':
        this.startText.visible = false;
        let zenoTweenBack = this.tweens.add({
          targets: [this.zeno,this.halfWayText],
          x: this.ZENO_START_X,
          duration: 1000,
          repeat: 0,
          onComplete: () => {
            this.startText.visible = true;
            if (this.startText.text === this.SPECIAL_START_TEXT)  {

            }
            else  {
              this.halfway += (100 - this.halfway)/2;
              if (this.halfway  ===  100) {
                this.startText.text = `${this.SPECIAL_START_TEXT}`;
                this.halfWayText.text = `${this.SPECIAL_HALFWAY_TEXT}`;
              }
              else {
                this.speed++;
                this.animSpeed = 100 / this.speed;
                this.startText.text = this.halfWayText.text;
                this.halfWayText.text = `${this.halfway}m`;
              }
            }
            this.halfWayText.x = this.ZENO_HALFWAY_X;

            setTimeout(() => {
              this.zeno.anims.play('zeno_defeat');
              this.defeatSFX.play();
            },1000);
          },
        });

        break;
        case 'zeno_defeat':
        this.typingInput.enable();
        this.zeno.anims.play('zeno_idle');
        this.encouragementText.visible = false;
        break;
      }
    });

    this.start = 0;
    this.halfway = 50; // This will max out at 99.99999999999999m (14dp)
    this.finish = 100;

    let encouragementStyle = { fontFamily: 'Commodore', fontSize: '20px', fill: '#000', wordWrap: true, align: 'center' };
    this.encouragementText = this.add.text(this.game.canvas.width/2, 40*4, "HALF-WAY THERE!", encouragementStyle);
    this.encouragementText.setOrigin(0.5,0.5);
    this.encouragementText.visible = false;

    let markerStyle = { fontFamily: 'Commodore', fontSize: '18px', fill: '#fff', wordWrap: true, align: 'left' };
    this.startText = this.add.text(this.ZENO_START_X, 82*4, `${this.start}m`, markerStyle);//.setOrigin(0.5);
    this.halfWayText = this.add.text(this.ZENO_HALFWAY_X, 82*4, `${this.halfway}m`, markerStyle);//.setOrigin(0.5);
    this.finishText = this.add.text(this.ZENO_FINISH_X, 82*4, `${this.finish}m`, markerStyle);//.setOrigin(0.5);

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
    this.typingInput = new TypingInput(this,100,10,input,minWPM,'#000',0x00A830,this.goodKeySFX,this.badKeySFX);
    this.typingInput.create();
  },

  update: function (time,delta) {

    this.updateZeno();

  },

  updateZeno: function () {
    if (this.typingInput.enabled && this.zeno.x >= this.ZENO_HALFWAY_X) {
      this.zeno.x = this.ZENO_HALFWAY_X;
      this.typingInput.disable();
      this.zeno.anims.play('zeno_victory');
      this.victorySFX.play();
      this.encouragementText.visible = true;
    }
    else if (this.typingInput.success()) {
      if (this.zeno.anims.currentAnim.key === 'zeno_idle') {
        this.anims.get('zeno_running').msPerFrame = this.animSpeed;
        this.zeno.anims.play('zeno_running');
      }
      this.zeno.x += this.speed;
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
