let Danaids = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize: function Danaids () {
    Phaser.Scene.call(this, { key: 'danaids' });

    this.MAX_FILL_TIME = 2000;
    this.FILL_PER_POUR = 20;
  },

  create: function () {
    this.cameras.main.setBackgroundColor('#dda');

    this.gameIsOver = false;

    // Sound
    this.emptySFX = this.sound.add('swoopdown');
    this.emptySFX.volume = 0.2;
    this.fillSFX = this.sound.add('swoopup');
    this.fillSFX.volume = 0.2;
    this.gameOverSFX = this.sound.add('swoopdown');
    this.gameOverSFX.volume = 0.2;
    this.victorySFX = this.sound.add('victory');
    this.emptySFX.volume = 0.2;

    // Add tap
    this.tap = this.add.sprite(4*5, this.game.canvas.height/2 + 4*16, 'atlas', 'danaids/tap/tap_1.png');
    this.tap.setScale(4,4);
    this.TAP_X = this.tap.x + this.tap.width;

    this.createAnimation('tap_running','danaids/tap/tap',1,3,10,-1);
    this.createAnimation('tap_filling','danaids/tap/tap',4,4,10,-1);
    this.createAnimation('tap_restarting','danaids/tap/tap',4,6,10,0);

    this.tap.on('animationcomplete',function (animation,frame) {
      if (animation.key === 'tap_restarting') {
        this.tap.play('tap_running');
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
    this.createAnimation('put_down_bucket','danaids/danaid/danaid',12,21,5,0);
    this.createAnimation('pick_up_bucket','danaids/danaid/danaid',21,12,5,0);
    this.createAnimation('enter_bath','danaids/entering_bath/entering_bath',2,11,5,0);
    this.createAnimation('exit_bath','danaids/entering_bath/entering_bath',11,2,5,0);

    this.pouring = false;
    this.filling = false;
    this.inBath = false;
    this.cleanPercentage = 0;

    this.danaid.on('animationcomplete',function (animation,frame) {
      if (animation.key === 'pour') {
        this.pouring = true;
        this.fillSFX.play();
      }
      else if (animation.key === 'unpour') {
        if (this.fullPercentage === 100) {
          this.danaid.play('put_down_bucket');
        }
        else {
          this.danaid.anims.play('running');
          this.danaid.flipX = true;
          this.danaid.vx = -1;
        }
      }
      else if (animation.key === 'put_down_bucket') {
        if (this.fullPercentage === 100) {
          this.danaid.x += 4*5;
          this.danaid.y -= 4*10;
          this.danaid.anims.play('enter_bath');
        }
        else {
          this.danaid.anims.play('pick_up_bucket');
        }
      }
      else if (animation.key === 'pick_up_bucket') {
        this.danaid.anims.play('running');
        this.danaid.flipX = true;
        this.danaid.vx = -1;
      }
      else if (animation.key === 'lower_bucket') {
        this.danaid.anims.play('running');
        this.danaid.flipX = false;
        this.tap.play('tap_restarting');
        this.danaid.vx = 1;
      }
      else if (animation.key === 'enter_bath') {
        this.inBath = true;
      }
      else if (animation.key === 'exit_bath') {
        this.danaid.x -= 4*5;
        this.danaid.y += 4*10;
        this.danaid.anims.play('pick_up_bucket');
      }
    },this);

    this.danaid.vx = -1;
    this.danaid.flipX = true;
    this.danaid.anims.play('running');

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

    // Add key control
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Add instructions
    let instructionStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: '#000', wordWrap: true, align: 'center' };
    let instructionString = "YOU ARE THE BATH\nPRESS SPACE\nTO EMPTY";
    this.instructionsText = this.add.text(3*this.game.canvas.width/4,100,instructionString,instructionStyle);
    this.instructionsText.setOrigin(0.5);

    // Add bath percentage information
    let informationStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: '#fff', wordWrap: true, align: 'center' };
    let informationString = "BATH FULL: 0%";
    this.informationText = this.add.text(this.game.canvas.width - 350,320,informationString,informationStyle);
    this.informationText.setOrigin(0);

    // Add bath percentage information
    let danaidInformationStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: '#000', wordWrap: true, align: 'left' };
    let danaidInformationString = "CLEANLINESS: 0%";
    this.danaidInformationText = this.add.text(this.game.canvas.width - 440,230,danaidInformationString,danaidInformationStyle);
    this.danaidInformationText.setOrigin(0);
    this.danaidInformationText.visible = false;

  },

  update: function (time,delta) {

    if (this.gameIsOver) return;

    this.handleInput();
    this.updateDanaid(delta);
    this.updateBath(delta);

  },

  handleInput: function () {
    if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {

      if (this.emptying || this.pouring) return;

      if (this.holesOpen) {
        return;
      }
      else {
        this.holesOpen = true;
        if (this.fullPercentage === 0) {
          this.bath.play('bath_open');
          this.holesOpen = true;
          setTimeout(() => {
            if (this.emptying || this.pouring) return;
            this.bath.play('bath_closed');
            this.holesOpen = false;
          },1000);
        }
      }
    }
  },

  updateDanaid: function (delta) {
    this.danaid.x += this.danaid.vx;

    if (this.danaid.anims.currentAnim.key === 'running' && this.danaid.x < this.TAP_X) {
      this.danaid.vx = 0;
      this.danaid.x = this.TAP_X;
      this.danaid.anims.play('raise_bucket');
      this.tap.play('tap_filling');
      this.filling = true;
    }

    if (this.danaid.anims.currentAnim.key === 'running' && this.danaid.x > this.BATH_X) {
      this.danaid.vx = 0;
      this.danaid.x = this.BATH_X;
      this.danaid.anims.play('pour');
    }

    if (this.filling) {
      this.fillTime += delta;
      if (this.fillTime > this.MAX_FILL_TIME) {
        this.danaid.anims.play('lower_bucket');
        this.filling = false;
        this.fillTime = 0;
      }
    }

    if (this.inBath) {
      if (this.fullPercentage === 0) {
        this.danaid.anims.play('exit_bath');
        this.cleanPercentage = 0;
        this.danaidInformationText.visible = false;
        this.inBath = false;
      }
      else if (this.fullPercentage === 100) {
        this.danaidInformationText.visible = true;
        this.cleanPercentage += 0.25;
        if (this.cleanPercentage >= 100) {
          this.cleanPercentage = 100;
          this.gameIsOver = true;
          this.victorySFX.play();
          setTimeout(() => {
            this.gameOver();
          },1000);
        }
      }
      this.danaidInformationText.text = `CLEANLINESS: ${Math.floor(this.cleanPercentage)}%`
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
      this.instructionsText.visible = false;
      this.emptying = true;
      this.bath.anims.play('bath_emptying');
      this.emptySFX.play();
    }

    this.informationText.text = `BATH FULL: ${this.fullPercentage + this.currentPourAmount}%`;
  },

  gameOver: function () {
    this.gameIsOver = true;

    this.gameOverSFX.play();

    let screenRect = new Phaser.Geom.Rectangle(0,0, this.game.canvas.width, this.game.canvas.height);
    let gameOverBackground = this.add.graphics({ fillStyle: { color: '#000' } });
    gameOverBackground.fillRectShape(screenRect);
    let gameOverStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: '#dda', wordWrap: true, align: 'center' };
    let gameOverString = "YOU LOSE!\n\nTHE DANAID GOT CLEAN!";
    let gameOverText = this.add.text(this.game.canvas.width/2,this.game.canvas.height/2,gameOverString,gameOverStyle);
    gameOverText.setOrigin(0.5);

    setTimeout(() => {
      this.scene.start('menu');
    },4000);
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
