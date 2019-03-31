let Camus = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize: function Camus () {
    Phaser.Scene.call(this, { key: 'camus' });
  },

  create: function () {
    this.cameras.main.setBackgroundColor('#aaa');

    // Sound
    this.emptySFX = this.sound.add('swoopdown');
    this.emptySFX.volume = 0.2;
    this.pageSFX = this.sound.add('swoopup');
    this.pageSFX.volume = 0.2;
    this.goodKeySFX = this.sound.add('key-good');
    this.goodKeySFX.volume = 0.2;
    this.badKeySFX = this.sound.add('key-bad');
    this.badKeySFX.volume = 0.2;
    this.victorySFX = this.sound.add('victory');
    this.victorySFX.volume = 0.2;

    // Add camus
    this.camus = this.add.sprite(this.game.canvas.width/2, this.game.canvas.height/2 + 4*14, 'atlas', 'camus/camus/camus_1.png');
    this.camus.setScale(4,4);

    this.createAnimation('camus_idle','camus/camus/camus',1,1,5,0);
    this.createAnimation('camus_typing','camus/camus/camus',1,2,10,-1);
    this.createAnimation('camus_defeated','camus/camus/camus',3,3,5,0);
    this.createAnimation('camus_victory','camus/camus/camus',4,6,5,0);
    this.createAnimation('camus_unvictory','camus/camus/camus',6,4,5,0);

    this.camus.on('animationcomplete',function (animation,frame) {
      switch (animation.key) {
        case 'camus_unvictory':
        this.camus.anims.play('camus_defeated');
        setTimeout(() => {
          this.emptySFX.play();
          this.typingInput.reset();
          this.typingInput.enable();
        },2000);
        break;
      }
    },this);

    this.camus.anims.play('camus_idle');

    // Add ground plane
    let groundRect = new Phaser.Geom.Rectangle(0, this.game.canvas.height/2 + 4*26, this.game.canvas.width, 200);
    this.ground = this.add.graphics({ fillStyle: { color: 0x000000 } });
    this.ground.fillRectShape(groundRect);

    // Input
    this.createTypingInput();

    this.WORDS_PER_PAGE = 100;
    this.PAGES_PER_SPRITE = 1;
    this.pages = 0;
    this.nextPageSpriteAt = 1;
    this.nextPageSpriteY = this.camus.y + 4*2;
    this.pageSprites = this.add.group();

    this.trash = this.add.sprite(this.camus.x + 4*17, this.camus.y + 4*9, 'atlas', 'camus/trash.png');
    this.trash.setScale(4,4);

    // Add information
    let informationStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: '#fff', wordWrap: true, align: 'center' };
    let informationString = `PAGES TYPED: ${this.pages}`;
    this.informationText = this.add.text(this.game.canvas.width - 350,320,informationString,informationStyle);
    this.informationText.setOrigin(0);
  },

  createTypingInput: function () {
    let minWPM = INTERMEDIATE_WPM;
    let input = camusStrings;

    this.typingInput = new TypingInput(this,100,10,input,minWPM,'#000',0xF09A00,true,undefined,false);
    this.typingInput.create();

    this.input.keyboard.on('keydown', function (event) {
      if (!this.typingInput.enabled) return;

      if (this.typingInput.isFinalKey(event.key)) {
        this.typingInput.disable();
        this.typingInput.cursor.visible  = false;
        this.victorySFX.play();
        this.camus.anims.play('camus_victory');
        setTimeout(() => {
          this.children.bringToTop(this.trash);
          this.children.bringToTop(this.ground);
          this.children.bringToTop(this.informationText);
          this.tweenPagesToTrash(this.resetPostVictory.bind(this));
        },3000);

        return;
      }

      let inputCorrect = this.typingInput.isNextKey(event.key);

      if (inputCorrect) {
        this.typingInput.handleInput(event.key)
      }
      else if (event.key != 'Shift') {
        this.badKeySFX.play();
        this.typingInput.disable();
        this.camus.anims.play('camus_defeated');
        setTimeout(() => {
          this.pageSprites.create(this.camus.x + 4*8, this.nextPageSpriteY, 'atlas', 'camus/paper.png').setScale(4,4);
          this.children.bringToTop(this.trash);
          this.children.bringToTop(this.ground);
          this.children.bringToTop(this.informationText);
          setTimeout(() => {
            this.tweenPagesToTrash(this.resetPostError.bind(this));
          },1000);
        },1000);
      }
    },this);
  },

  resetPostError: function () {
    setTimeout(() => {
      this.pages = 0;
      this.informationText.text = `PAGES TYPED: ${this.pages}`
      this.nextPageSpriteY = this.camus.y + 4*2;
      this.nextPageSpriteAt = 1;
      this.pageSprites.clear();
      this.emptySFX.play();
      this.camus.anims.play('camus_idle');
      this.typingInput.reset();
      this.typingInput.enable();
    },1000);
  },

  resetPostVictory: function () {
    setTimeout(() => {
      this.pages = 0;
      this.informationText.text = `PAGES TYPED: ${this.pages}`
      this.nextPageSpriteY = this.camus.y + 4*2;
      this.nextPageSpriteAt = 1;
      this.pageSprites.clear();
      this.camus.anims.play('camus_unvictory');
      this.emptySFX.play();
    },2000);
  },


  tweenPagesToTrash: function (complete) {
    this.tweens.add({
      targets: this.pageSprites.getChildren(),
      x: this.trash.x,
      duration: 2000,
      repeat: 0,
      onComplete: () => {
        this.typingInput.hide();
        this.tweens.add({
          targets: this.pageSprites.getChildren(),
          y: '+=70',
          duration: 500,
          repeat: 0,
          onComplete: () => {
            complete();
          },
        });
      },
    });
  },

  update: function (time,delta) {
    this.handleInput();
  },

  handleInput: function () {
    if (!this.typingInput.enabled) return;

    if (this.typingInput.success()) {
      if (this.camus.anims.currentAnim.key !== 'camus_typing') {
        this.camus.anims.play('camus_typing');
      }
    }
    else {
      this.camus.anims.play('camus_idle');
    }

    if (this.typingInput.words >= this.WORDS_PER_PAGE) {
      this.typingInput.words = 0;
      this.pages++;
      this.informationText.text = `PAGES TYPED: ${this.pages}`;
      this.pageSFX.play();
      if (this.pages === this.nextPageSpriteAt) {
        this.pageSprites.create(this.camus.x + 4*8, this.nextPageSpriteY, 'atlas', 'camus/paper.png').setScale(4,4);
        this.nextPageSpriteY -= 4*1;
        this.nextPageSpriteAt += this.PAGES_PER_SPRITE;
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
