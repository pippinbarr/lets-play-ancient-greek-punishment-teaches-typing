let Danaids = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize: function Danaids () {
    Phaser.Scene.call(this, { key: 'danaids' });
    this.MAX_FILL_TIME = 2000;
    this.FILL_PER_POUR = 20;
    this.currentVX = -1;
  },

  create: function () {
    this.cameras.main.setBackgroundColor('#dda');

    // Sound
    this.emptySFX = this.sound.add('swoopdown');
    this.emptySFX.volume = 0.2;
    this.fillSFX = this.sound.add('swoopup');
    this.fillSFX.volume = 0.2;
    this.goodKeySFX = this.sound.add('key-good');
    this.goodKeySFX.volume = 0.2;
    this.badKeySFX = this.sound.add('key-bad');
    this.badKeySFX.volume = 0.2;

    // Add tap
    this.tap = this.add.sprite(4*5, this.game.canvas.height/2 + 4*16, 'atlas', 'danaids/tap/tap_1.png');
    this.tap.setScale(4,4);
    this.TAP_X = this.tap.x + this.tap.width + 4*1;

    this.createAnimation('tap_running','danaids/tap/tap',1,3,10,-1);
    this.createAnimation('tap_filling','danaids/tap/tap',4,4,10,-1);
    this.createAnimation('tap_restarting','danaids/tap/tap',4,6,10,0);

    this.tap.on('animationcomplete',function (animation,frame) {
      switch (animation.key) {
        case 'tap_restarting':
        this.tap.play('tap_running');
        break;
      }
    },this);

    this.tap.anims.play('tap_running');

    // Add Danaid
    this.danaid = this.add.sprite(4*40, this.game.canvas.height/2 + 4*16, 'atlas', 'danaids/danaid/danaid_1.png');
    this.danaid.setScale(4,4);
    this.danaid.flipX = true;
    this.danaid.vx = 0;

    this.createAnimation('idle','danaids/danaid/danaid',4,4,10,-1);
    this.createAnimation('running','danaids/danaid/danaid',1,3,10,-1);
    this.createAnimation('raise_bucket','danaids/danaid/danaid',5,6,5,0);
    this.createAnimation('lower_bucket','danaids/danaid/danaid',6,5,5,0);
    this.createAnimation('pour','danaids/danaid/danaid',5,11,3,0);
    this.createAnimation('unpour','danaids/danaid/danaid',11,5,3,0);

    this.pouring = false;
    this.filling = false;
    this.filled = false;
    this.toFill = true;

    this.danaid.on('animationcomplete',function (animation,frame) {
      switch (animation.key) {
        case 'pour':
        this.pouring = true;
        this.fillSFX.play();
        break;

        case 'unpour':
        this.danaid.anims.play('running');
        this.danaid.flipX = true;
        this.currentVX = -1;
        this.holesOpen = true;
        this.toFill = true;
        this.danaid.x -= this.danaid.width;
        this.typingInput.enable();
        break;

        case 'raise_bucket':
        this.tap.play('tap_filling');
        break;

        case 'lower_bucket':
        if (this.filled) {
          this.danaid.anims.play('running');
          this.danaid.flipX = false;
          this.danaid.x += this.danaid.width;
          this.tap.play('tap_restarting');
          this.currentVX = 1;
          this.danaid.vx = this.currentVX;
          this.filling = false;
          this.toFill = false;
        }
        break;
      }
    },this);

    this.danaid.vx = 0;
    this.danaid.flipX = true;
    this.danaid.anims.play('idle');

    // Add bath
    this.bath = this.add.sprite(this.game.canvas.width - 4*20, this.game.canvas.height/2 + 4*19, 'atlas', 'danaids/bath/bath_9.png');
    this.bath.setScale(4,4);

    this.createAnimation('bath_closed','danaids/bath/bath',10,10,10,-1);
    this.createAnimation('bath_open','danaids/bath/bath',1,1,10,-1);
    this.createAnimation('bath_emptying','danaids/bath/bath',3,6,5,0);
    this.createAnimation('bath_finish_empty','danaids/bath/bath',6,9,5,0);

    this.bath.on('animationcomplete',function (animation,frame) {
      if (animation.key === 'bath_finish_empty') {
        setTimeout(() => {
          this.bath.anims.play('bath_closed');
          this.holesOpen = false;
        },500);
      }
    },this);

    this.bath.anims.play('bath_closed');
    this.holesOpen = false;
    this.emptying = false;
    this.fullPercentage = 0;
    this.currentPourAmount = 0;
    this.fillTime = 0;
    this.BATH_X = this.bath.x - 4*16;

    // Add ground plane
    let groundRect = new Phaser.Geom.Rectangle(0, this.game.canvas.height/2 + 4*26, this.game.canvas.width, 200);
    this.ground = this.add.graphics({ fillStyle: { color: 0x000000 } });
    this.ground.fillRectShape(groundRect);

    // Input
    this.createTypingInput();

    // Add bath percentage information
    let informationStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: '#fff', wordWrap: true, align: 'center' };
    let informationString = "BATH FULL: 0%";
    this.informationText = this.add.text(this.game.canvas.width - 350,320,informationString,informationStyle);
    this.informationText.setOrigin(0);
  },

  createTypingInput: function () {
    let minWPM;
    let input;

    switch (difficulty) {
      case 'beginner':
      minWPM = BEGINNER_WPM;
      input = danaidsBeginnerGrammar;
      break;

      case 'intermediate':
      minWPM = INTERMEDIATE_WPM;
      input = danaidsIntermediateGrammar;
      break;

      case 'advanced':
      minWPM = ADVANCED_WPM;
      input = danaidsAdvancedStrings;
      break;
    }
    this.typingInput = new TypingInput(this,100,10,input,minWPM,'#000',0x00A830,this.goodKeySFX,this.badKeySFX);
    this.typingInput.create();
  },

  update: function (time,delta) {

    this.updateDanaid(delta);
    this.updateBath(delta);

  },

  updateDanaid: function (delta) {

    let key = this.danaid.anims.currentAnim.key;

    if (this.typingInput.success()) {
      this.danaid.x += this.danaid.vx;

      if (key === 'idle') {
        this.danaid.vx = this.currentVX;
        this.danaid.anims.play('running');
      }

      if (this.toFill && (key === 'running' || key === 'lower_bucket') && this.danaid.x <= this.TAP_X) {
        this.danaid.vx = 0;
        this.danaid.x = this.TAP_X;
        this.danaid.anims.play('raise_bucket');
        this.filling = true;
      }

      if (key === 'running' && this.danaid.x > this.BATH_X) {
        this.danaid.vx = 0;
        this.danaid.x = this.BATH_X;
        this.danaid.anims.play('pour');
        this.typingInput.disable();
      }

      if (this.filling) {
        this.fillTime += delta;
        if (this.fillTime > this.MAX_FILL_TIME) {
          this.danaid.anims.play('lower_bucket');
          this.filling = false;
          this.toFill = false;
          this.filled = true;
          this.fillTime = 0;
        }
      }
    }
    else {
      this.danaid.vx = 0;
      if (key === 'running') {
        this.danaid.anims.play('idle');
      }
      else if (this.filling) {
        this.danaid.anims.play('lower_bucket');
        this.tap.anims.play('tap_restarting');
        this.filling = false;
      }
    }
  },

  updateBath: function (delta) {
    let anims = this.danaid.anims;

    if (this.pouring) {
      this.currentPourAmount++;
      if (this.currentPourAmount === this.FILL_PER_POUR) {
        this.fullPercentage += this.FILL_PER_POUR;
        this.currentPourAmount = 0;
        this.danaid.anims.play('unpour');
        this.pouring = false;
        this.filled = false;
      }
    }
    else if (this.emptying) {
      this.fullPercentage--;
      if (this.fullPercentage === 0) {
        this.emptying = false;
        this.bath.anims.play('bath_finish_empty');
      }
    }
    else if (this.holesOpen && this.fullPercentage > 0) {
      this.emptying = true;
      this.bath.anims.play('bath_emptying');
      this.emptySFX.play();
    }

    this.informationText.text = `BATH FULL: ${this.fullPercentage + this.currentPourAmount}%`;
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
  }

});
