let Sisyphus = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize: function Sisyphus () {
    Phaser.Scene.call(this,'sisyphus');

    // Force exerted between rock and Sisypus
    // -1 = no rock force (Sisyphus pushes top speed)
    // 0 = equillibrium and no movement
    // +1 = total rock force (Sisyphus retreats)
    // this.rockForce = -1;
  },

  create: function () {

    if (difficulty === 'beginner') localStorage.setItem('triedBeginner',true);
    if (difficulty === 'intermediate') localStorage.setItem('triedIntermediate',true);
    if (difficulty === 'advanced') localStorage.setItem('triedAdvanced',true);

    this.cameras.main.setBackgroundColor('#aaf');

    this.gameIsOver = false;
    this.failures = 0;

    // Sound
    this.victorySFX = this.sound.add('victory');
    this.victorySFX.volume = 0.2;
    this.gameOverSFX = this.sound.add('swoopdown');
    this.gameOverSFX.volume = 0.2;
    this.peckSFX = this.sound.add('peck');
    this.peckSFX.volume = 0.2;
    this.goodKeySFX = this.sound.add('key-good');
    this.goodKeySFX.volume = 0.2;
    this.badKeySFX = this.sound.add('key-bad');
    this.badKeySFX.volume = 0.2;

    this.hill = this.add.sprite(this.game.canvas.width/2, this.game.canvas.height/2,'atlas','sisyphus/hill.png');
    this.hill.setScale(4,4);

    // Create the sprite that represents the entire minigame, scale up
    this.sisyphus = this.add.sprite(this.game.canvas.width/2 + 4*20, this.game.canvas.height/2 - 4*15, 'atlas', 'sisyphus/sisyphus/sisyphus_1.png');
    this.sisyphus.setScale(4,4);

    // Add the various animations
    this.createAnimation('start','sisyphus/sisyphus/sisyphus',1,52,10,false);
    this.createAnimation('uphill','sisyphus/sisyphus/sisyphus',51,95,10,false);
    this.createAnimation('downhill','sisyphus/sisyphus/sisyphus',95,51,25,false);

    this.sisyphus.anims.play('start');
    // this.sisyphus.anims.pause();

    this.sisyphus.on('animationcomplete',function (animation,frame) {
      switch(animation.key) {
        case 'start':
        this.sisyphus.anims.play('uphill');
        break;

        case 'uphill':
        if (this.sisyphus.anims.forward) {
          this.sisyphus.anims.play('downhill');
          this.gameOverSFX.play();
          this.typingInput.disable();
        }
        else {
          this.sisyphus.anims.forward = true;
          this.sisyphus.anims.play('uphill');
          this.sisyphus.anims.currentAnim.pause();
        }
        break;

        case 'downhill':
        this.typingInput.enabled = true;
        this.typingInput.enable();
        this.sisyphus.anims.forward = true;
        this.sisyphus.anims.play('uphill');
        this.sisyphus.anims.currentAnim.pause();
        this.failures++;
        // this.failureText.text = `FAILURES: ${this.failures}`;
        this.peckSFX.play();
        break;
      }
    },this);

    this.defaultFrameTime = this.sisyphus.anims.currentAnim.msPerFrame;

    // Add FAILURES text
    // let failureStyle = { fontFamily: 'Commodore', fontSize: '30px', fill: '#fff', wordWrap: true, align: 'center' };
    // let failureString = "FAILURES: 0";
    // this.failureText = this.add.text(420,340,failureString,failureStyle);
    // this.failureText.setOrigin(0);
    // this.failureText.angle = -45;

    this.createTypingInput();
  },

  createTypingInput: function () {
    let minWPM;
    let input;

    switch (difficulty) {
      case 'beginner':
      minWPM = BEGINNER_WPM;
      input = sisyphusBeginnerGrammar;
      break;

      case 'intermediate':
      minWPM = INTERMEDIATE_WPM;
      input = sisyphusIntermediateGrammar;
      break;

      case 'advanced':
      minWPM = ADVANCED_WPM;
      input = sisyphusAdvancedStrings;
      break;
    }
    this.typingInput = new TypingInput(this,100,10,input,minWPM,'#000',0x915C00);
    this.typingInput.create();
  },

  update: function (time,delta) {

    if (this.gameIsOver) return;

    let anims = this.sisyphus.anims;

    if (this.typingInput.success()) {
      // this.rockForce = Math.min(this.rockForce + 0.05,1);
      if (anims.currentAnim.key === 'start') {
        anims.currentAnim.resume();
      }
      else if (anims.currentAnim.key === 'uphill'){
        anims.currentAnim.resume();
        anims.forward = true;
      }
    }
    else {
      // this.rockForce = Math.max(this.rockForce - 0.05,-1);
      if (anims.currentAnim.key === 'start') {
        anims.currentAnim.pause();
      }
      else if (anims.currentAnim.key === 'uphill'){
        if (!anims.currentAnim.paused) {
          anims.forward = false;
        }
      }
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
