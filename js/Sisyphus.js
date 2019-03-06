let Sisyphus = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize: function Sisyphus () {
    Phaser.Scene.call(this,'sisyphus');

    // Force exerted between rock and Sisypus
    // -1 = no rock force (Sisyphus pushes top speed)
    // 0 = equillibrium and no movement
    // +1 = total rock force (Sisyphus retreats)
    this.rockForce = -1;

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
          this.typingInput.enabled = false;
        }
        else {
          this.sisyphus.anims.forward = true;
          this.sisyphus.anims.play('uphill');
          this.sisyphus.anims.currentAnim.pause();
        }
        break;

        case 'downhill':
        this.typingInput.enabled = true;
        this.sisyphus.anims.forward = true;
        this.sisyphus.anims.play('uphill');
        this.sisyphus.anims.currentAnim.pause();
        this.failures++;
        this.failureText.text = `FAILURES: ${this.failures}`;
        break;
      }
    },this);

    this.defaultFrameTime = this.sisyphus.anims.currentAnim.msPerFrame;

    // Add FAILURES text
    let failureStyle = { fontFamily: 'Commodore', fontSize: '30px', fill: '#fff', wordWrap: true, align: 'center' };
    let failureString = "FAILURES: 0";
    this.failureText = this.add.text(420,340,failureString,failureStyle);
    this.failureText.setOrigin(0);
    this.failureText.angle = -45;

    this.createTypingInput();
  },

  createTypingInput: function () {
    let strings = ['NO STRINGS ASSIGNED'];
    let minWPM;
    let grammar;

    switch (difficulty) {
      case 'beginner':
      minWPM = 40;
      grammar = tracery.createGrammar({
        'adverb': ['slowly','steadily','gradually','painfully','resignedly','wearily','tiredly','relentlessly','eternally','infinitely'],
        'push': ['push','shove','roll','move','work','force','strain','thrust','propel','impel','advance','drive','shift','muscle'],
        'rock': ['rock','boulder','stone','burden','weight','mass','hardship','load'],
        'hill': ['hill','slope','incline','ramp','diagonal','rise','ascent','gradient'],
        'origin':['#adverb.capitalize# #push# the #rock# up the #hill#.'],
      });

      strings = [];
      for (let i = 0; i < 10; i++) {
        strings.push(grammar.flatten('#origin# '));
      }
      break;

      case 'intermediate':
      minWPM = 70;
      grammar = tracery.createGrammar({
        'kill': ['kill','murder'],
        'people': ['travellers','guests','visitors'],
        'rule': ['rule','law','principle'],
        'xenia': ['xenia','hospitality','generosity','courtesy'],
        'anger': ['anger','provoke','cheat','reveal the secrets of'],
        'plot': ['plot','scheme'],
        'against': ['against','to #kill#','to dethrone'],
        'Salmoneus': ['Salmoneus','my brother'],
        'Tyro': ['Tyro','my niece','#Salmoneus#\'s daughter'],
        'crime': [
          'seduce #Tyro#',
          '#kill# #people#',
          'break the #rule# of #xenia#',
          '#anger# Zeus',
          'escape from Tartarus',
          '#plot# #against# #Salmoneus#',
          'reveal the location of Aegina',
          'trap Thanatos in chains',
        ],
        'origin': ['I will not #crime#.'],
      });

      strings = [];
      for (let i = 0; i < 100; i++) {
        strings.push(grammar.flatten('#origin# '));
      }

      break;

      case 'advanced':
      minWPM = 100;
      break;
    }

    this.typingInput = new TypingInput(this,strings,minWPM,0x915C00);
    this.typingInput.create();
  },

  update: function (time,delta) {

    if (this.gameIsOver) return;

    this.elapsed += delta;

    // this.timeSinceLastInput += delta;

    let anims = this.sisyphus.anims;

    let index = anims.currentFrame.index;

    if (this.typingInput.success()) {
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
