let Tantalus = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize: function Tantalus () {
    Phaser.Scene.call(this, { key: 'tantalus' });

    this.ACTION_MIN_DELAY = 1000;
    this.ACTION_DELAY_RANGE = 2000;
    this.ACTION_MIN_PERFORM = 1000;
    this.ACTION_PERFORM_RANGE = 2000;

  },

  create: function () {
    this.cameras.main.setBackgroundColor('#dda');


    // Sound
    this.waterDownSFX = this.sound.add('swoopdown');
    this.waterDownSFX.volume = 0.2;
    this.branchUpSFX = this.sound.add('swoopup');
    this.branchUpSFX.volume = 0.2;
    this.goodKeySFX = this.sound.add('key-good');
    this.goodKeySFX.volume = 0.2;
    this.badKeySFX = this.sound.add('key-bad');
    this.badKeySFX.volume = 0.2;

    // Tantalus

    // - Sprite
    this.tantalus = this.add.sprite(400,200,'atlas','tantalus/tantalus.png');
    this.tantalus.setScale(8,8);

    // - State variables
    this.acting = false;

    // - Animations
    this.createAnimation('tantalus_idle','tantalus/reaching/reaching',1,1,5,-1);

    this.createAnimation('reach','tantalus/reaching/reaching',1,5,5,0);
    this.createAnimation('unreach','tantalus/reaching/reaching',5,1,5,0);
    this.createAnimation('eating_fail','tantalus/eating_fail/eating_fail',1,2,5,-1);

    this.createAnimation('stoop','tantalus/stooping/stooping',1,6,5,0);
    this.createAnimation('unstoop','tantalus/stooping/stooping',6,1,5,0);
    this.createAnimation('drinking_fail','tantalus/stooping/stooping',6,7,5,-1);

    this.tantalus.anims.play('tantalus_idle');

    // - Animation complete events
    this.tantalus.on('animationcomplete',function (animation,frame) {
      switch(animation.key) {
        case 'reach':
        this.tantalus.anims.play('eating_fail');
        break;

        case 'unreach':
        this.tantalus.anims.play('tantalus_idle');
        break;

        case 'stoop':
        this.tantalus.anims.play('drinking_fail');
        break;

        case 'unstoop':
        this.tantalus.x += 1*8;
        this.tantalus.y -= 3*8;
        this.tantalus.anims.play('tantalus_idle');
        break;

        case 'drinking_fail':
        break;

        default:
        console.log(animation.key + " completed. Unhandled.");
      }
    },this);

    // Branch

    // - Sprite
    this.branch = this.add.sprite(400,200,'atlas','tantalus/branch/branch_1.png');
    this.branch.setScale(8,8);

    // - Animations
    this.createAnimation('branch_idle','tantalus/branch/branch',1,1,5,-1);
    this.createAnimation('branch_raise','tantalus/branch/branch',2,4,10,0);
    this.createAnimation('branch_lower','tantalus/branch/branch',4,2,10,0);

    // - State variables
    this.branchUp = false;
    this.branchDown = true;
    this.branchRaising = false;
    this.branchLowering = false;

    // - Animation complete events
    this.branch.on('animationcomplete',function (animation,frame) {
      switch (animation.key) {
        case 'branch_raise':
        this.branchUp = true;
        this.branchRaising = false;
        break;

        case 'branch_lower':
        this.branchDown = true;
        this.branchLowering = false;
        break;
      }
    },this);

    this.branch.anims.play('branch_idle');

    // Water

    // - Sprite
    this.water = this.add.sprite(400,200,'atlas','tantalus/water/water_1.png');
    this.water.setScale(8,8);

    // - Animations
    this.createAnimation('water_idle','tantalus/water/water',1,1,5,-1);
    this.createAnimation('water_lower','tantalus/water/water',2,7,10,0);
    this.createAnimation('water_raise','tantalus/water/water',7,2,10,0);

    // - State variables
    this.waterUp = true;
    this.waterDown = false;
    this.waterRaising = false;
    this.waterLowering = false;

    // - Animation complete events
    this.water.on('animationcomplete',function (animation,frame) {
      switch (animation.key) {
        case 'water_lower':
        this.waterDown = true;
        this.waterLowering = false;
        break;

        case 'water_raise':
        this.waterUp = true;
        this.waterRaising = false;
        break;
      }
    },this);

    this.water.anims.play('water_idle');

    // Ground sprite

    this.ground = this.add.sprite(400,200,'atlas','tantalus/ground.png');
    this.ground.setScale(8,8);

    // Input
    this.createTypingInput();
  },

  createTypingInput: function () {
    let minWPM;
    let input;

    switch (difficulty) {
      case 'beginner':
      minWPM = BEGINNER_WPM;
      input = tantalusAppleBeginnerGrammar;
      break;

      case 'intermediate':
      minWPM = INTERMEDIATE_WPM;
      input = tantalusAppleIntermediateGrammar;
      break;

      case 'advanced':
      minWPM = ADVANCED_WPM;
      input = tantalusAppleAdvancedStrings;
      break;
    }

    this.typingInputApple = new TypingInput(this,100,10,input,minWPM,'#777',0xff0000,this.goodKeySFX,this.badKeySFX);
    this.typingInputApple.create();

    switch (difficulty) {
      case 'beginner':
      minWPM = BEGINNER_WPM;
      input = tantalusWaterBeginnerGrammar;
      break;

      case 'intermediate':
      minWPM = INTERMEDIATE_WPM;
      input = tantalusWaterIntermediateGrammar;
      break;

      case 'advanced':
      minWPM = ADVANCED_WPM;
      input = tantalusWaterAdvancedStrings;
      break;
    }

    this.typingInputWater = new TypingInput(this,100,300,input,minWPM,'#fff',0xff0000,this.goodKeySFX,this.badKeySFX);
    this.typingInputWater.create();
  },

  update: function (time,delta) {
    this.updateTantalus();
  },

  updateTantalus: function () {
    if (this.typingInputApple.success()) {
      this.reach();
    }
    else {
      this.unreach();
    }

    if (this.typingInputWater.success()) {
      this.stoop();
    }
    else {
      this.unstoop();
    }
  },

  stoop: function () {
    let key = this.tantalus.anims.currentAnim.key
    if (key ==='tantalus_idle') {
      this.tantalus.x -= 1*8;
      this.tantalus.y += 3*8;
      this.tantalus.anims.play('stoop');
    }
  },

  unstoop: function () {
    let key = this.tantalus.anims.currentAnim.key
    if (key === 'stoop' || key  === 'drinking_fail') {
      this.tantalus.anims.play('unstoop');
    }
  },

  reach: function () {
    let key = this.tantalus.anims.currentAnim.key
    if (key ==='tantalus_idle') {
      this.tantalus.anims.play('reach');
    }
  },

  unreach: function () {
    let key = this.tantalus.anims.currentAnim.key
    if (key === 'reach' || key  === 'eating_fail') {
      this.tantalus.anims.play('unreach');
    }
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
