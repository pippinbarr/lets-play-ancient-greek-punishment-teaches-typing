let Sisyphus = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize: function Sisyphus () {
    Phaser.Scene.call(this, { key: 'sisyphus' });

    // Used to set rate of animation relative to typing
    this.MAX_FRAME_TIME = 800;
    this.MIN_FRAME_TIME = 100;

    this.wpm = 0;
    this.MIN_WPM = 30;
    this.AVERAGE_WORD_LENGTH = 6; // Actually it's 5 + a space/punctuation character

    // Force exerted between rock and Sisypus
    // -1 = no rock force (Sisyphus pushes top speed)
    // 0 = equillibrium and no movement
    // +1 = total rock force (Sisyphus retreats)
    this.rockForce = -1;

    this.testText1 = "The rain in Spain falls mainly on the plain. "
    this.testText2 = "The mansplainer mansplained all my pain away, it was quite a day. "
    this.typingIndex = 0;

    this.elapsed = 0;
  },

  create: function () {
    this.cameras.main.setBackgroundColor('#aaf');

    this.gameIsOver = false;
    this.failures = 0;

    // Sound
    this.victorySFX = this.sound.add('victory');
    this.victorySFX.volume = 0.2;
    this.gameOverSFX = this.sound.add('swoopdown');
    this.gameOverSFX.volume = 0.2;

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
          this.inputEnabled = false;
        }
        else {
          this.sisyphus.anims.forward = true;
          this.sisyphus.anims.play('uphill');
          this.sisyphus.anims.currentAnim.pause();
        }
        break;

        case 'downhill':
        this.inputEnabled = true;
        this.sisyphus.anims.forward = true;
        this.sisyphus.anims.play('uphill');
        this.sisyphus.anims.currentAnim.pause();
        this.failures++;
        this.failureText.text = `FAILURES: ${this.failures}`;
        break;
      }
    },this);

    this.defaultFrameTime = this.sisyphus.anims.currentAnim.msPerFrame;

    this.input.keyboard.on('keydown', function (event) {
      if (this.inputEnabled) this.handleInput(event);
    },this);

    this.inputEnabled = true;

    this.wpms = [];
    this.wordsTyped = 0;
    this.charsTyped = 0;
    this.wpmInterval = setInterval(() => {
      let wpm = ((this.charsTyped / 5) * 60 * (1000/150));
      this.wpms.push(wpm);
      if (this.wpms.length > 5) this.wpms.shift();
      this.wpm = this.wpms.reduce((a,b) => a + b,0)/this.wpms.length;
      this.wpm = Math.floor(this.wpm);
      this.wpmText.text = `${this.wpm} WPM`;
      this.elapsed = 0;
      this.wordsTyped = 0;
      this.charsTyped = 0;
    },150);

    // Add input tracking
    // this.pushKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);

    let cursorRect = new Phaser.Geom.Rectangle(100,10,18,30);
    this.cursor = this.add.graphics();
    this.cursor.fillStyle(0x915C00);
    this.cursor.fillRectShape(cursorRect);

    // Add text to type
    let inputStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: '#000', wordWrap: true, align: 'center' };
    this.inputText = this.add.text(100,10,this.testText1,inputStyle);
    this.inputText.setOrigin(0);

    this.CHAR_WIDTH = this.inputText.width / this.testText1.length;

    this.inputText2 = this.add.text(this.inputText.x + this.inputText.width,10,this.testText2,inputStyle);
    this.inputText2.setOrigin(0);

    this.currentText = this.testText1;

    // Add WPM text
    let wpmStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: '#fff', wordWrap: true, align: 'center' };
    let wpmString = "0 WPM";
    this.wpmText = this.add.text(100,340,wpmString,wpmStyle);
    this.wpmText.setOrigin(0);

    // Add FAILURES text
    let failureStyle = { fontFamily: 'Commodore', fontSize: '30px', fill: '#fff', wordWrap: true, align: 'center' };
    let failureString = "FAILURES: 0";
    this.failureText = this.add.text(420,340,failureString,failureStyle);
    this.failureText.setOrigin(0);
    this.failureText.angle = -45;
  },

  handleInput: function (event) {
    if (event.key === this.currentText.charAt(this.typingIndex)) {
      // Correct
      if ("-/ ".indexOf(event.key) !== -1) {
      }

      this.typingIndex++;
      this.charsTyped++;
      // if (this.charsTyped >= this.AVERAGE_WORD_LENGTH) {
        // this.wordsTyped++;
        // this.charsTyped = 0;
      // }

      if (this.typingIndex === this.currentText.length) {
        this.currentText = (this.currentText === this.testText1) ? this.testText2 : this.testText1;
        this.typingIndex = 0;
      }

      this.inputText.x -= this.CHAR_WIDTH;
      this.inputText2.x -= this.CHAR_WIDTH;

      if (this.inputText.x + this.inputText.width < 0) {
        this.inputText.x = this.inputText2.x + this.inputText2.width;
      }
      if (this.inputText2.x + this.inputText2.width < 0) {
        this.inputText2.x = this.inputText.x + this.inputText.width;
      }
    }
    else {
      if (event.key !== 'Shift') {
        // Incorrect
      }
    }
  },

  update: function (time,delta) {

    if (this.gameIsOver) return;

    this.elapsed += delta;

    // this.timeSinceLastInput += delta;

    let anims = this.sisyphus.anims;

    let index = anims.currentFrame.index;

    if (this.wpm > this.MIN_WPM) {
      this.rockForce = Math.min(this.rockForce + 0.05,1);
      if (this.sisyphus.anims.currentAnim.key === 'start') {
        this.sisyphus.anims.currentAnim.resume();
      }
      else if (this.sisyphus.anims.currentAnim.key === 'uphill'){
        this.sisyphus.anims.currentAnim.resume();
        this.sisyphus.anims.forward = true;
      }
    }
    else {
      this.rockForce = Math.max(this.rockForce - 0.05,-1);
      if (this.sisyphus.anims.currentAnim.key === 'start') {
        this.sisyphus.anims.currentAnim.pause();
      }
      else if (this.sisyphus.anims.currentAnim.key === 'uphill'){
        if (!this.sisyphus.anims.currentAnim.paused) {
          this.sisyphus.anims.forward = false;
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
