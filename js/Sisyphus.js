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
        'push': ['push','shove','roll'],
        'origin':['#push# #push# #push# #push# #push# #push# #push# #push# #push# #push# #push#'],
      });

      strings = [];
      for (let i = 0; i < 10; i++) {
        strings.push(grammar.flatten('#origin#'));
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
        strings.push(grammar.flatten('#origin#'));
      }

      break;

      case 'advanced':
      minWPM = 100;
      // let markov = new RiMarkov(2);
      // markov.loadText(camus);
      strings = camus;
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

let camus = [
  'The gods had condemned Sisyphus to ceaselessly rolling a rock to the top of a mountain, whence the stone would fall back of its own weight.',
  'They had thought with some reason that there is no more dreadful punishment than futile and hopeless labor.',
  'If one believes Homer, Sisyphus was the wisest and most prudent of mortals.',
  'According to another tradition, however, he was disposed to practice the profession of highwayman.',
  'I see no contradiction in this.',
  'Opinions differ as to the reasons why he became the futile laborer of the underworld.',
  'To begin with, he is accused of a certain levity in regard to the gods.',
  'He stole their secrets.',
  'Egina, the daughter of Esopus, was carried off by Jupiter.',
  'The father was shocked by that disappearance and complained to Sisyphus.',
  'He, who knew of the abduction, offered to tell about it on condition that Esopus would give water to the citadel of Corinth.',
  'To the celestial thunderbolts he preferred the benediction of water.',
  'He was punished for this in the underworld.',
  'Homer tells us also that Sisyphus had put Death in chains.',
  'Pluto could not endure the sight of his deserted, silent empire.',
  'He dispatched the god of war, who liberated Death from the hands of her conqueror.',
  'It is said that Sisyphus, being near to death, rashly wanted to test his wife\'s love.',
  'He ordered her to cast his unburied body into the middle of the public square.',
  'Sisyphus woke up in the underworld.',
  'And there, annoyed by an obedience so contrary to human love, he obtained from Pluto permission to return to earth in order to chastise his wife.',
  'But when he had seen again the face of this world, enjoyed water and sun, warm stones and the sea, he no longer wanted to go back to the infernal darkness.',
  'Recalls, signs of anger, warnings were of no avail.',
  'Many years more he lived facing the curve of the gulf, the sparkling sea, and the smiles of earth.',
  'A decree of the gods was necessary.',
  'Mercury came and seized the impudent man by the collar and, snatching him from his joys, lead him forcibly back to the underworld, where his rock was ready for him.',
  'You have already grasped that Sisyphus is the absurd hero.',
  'He is, as much through his passions as through his torture.',
  'His scorn of the gods, his hatred of death, and his passion for life won him that unspeakable penalty in which the whole being is exerted toward accomplishing nothing.',
  'This is the price that must be paid for the passions of this earth.',
  'Nothing is told us about Sisyphus in the underworld.',
  'Myths are made for the imagination to breathe life into them.',
  'As for this myth, one sees merely the whole effort of a body straining to raise the huge stone, to roll it, and push it up a slope a hundred times over; one sees the face screwed up, the cheek tight against the stone, the shoulder bracing the clay-covered mass, the foot wedging it, the fresh start with arms outstretched, the wholly human security of two earth-clotted hands.',
  'At the very end of his long effort measured by skyless space and time without depth, the purpose is achieved.',
  'Then Sisyphus watches the stone rush down in a few moments toward that lower world whence he will have to push it up again toward the summit.',
  'He goes back down to the plain.',
  'It is during that return, that pause, that Sisyphus interests me.',
  'A face that toils so close to stones is already stone itself! I see that man going back down with a heavy yet measured step toward the torment of which he will never know the end.',
  'That hour like a breathing-space which returns as surely as his suffering, that is the hour of consciousness.',
  'At each of those moments when he leaves the heights and gradually sinks toward the lairs of the gods, he is superior to his fate.',
  'He is stronger than his rock.',
  'If this myth is tragic, that is because its hero is conscious.',
  'Where would his torture be, indeed, if at every step the hope of succeeding upheld him? The workman of today works everyday in his life at the same tasks, and his fate is no less absurd.',
  'But it is tragic only at the rare moments when it becomes conscious.',
  'Sisyphus, proletarian of the gods, powerless and rebellious, knows the whole extent of his wretched condition: it is what he thinks of during his descent.',
  'The lucidity that was to constitute his torture at the same time crowns his victory.',
  'There is no fate that can not be surmounted by scorn.',
  'If the descent is thus sometimes performed in sorrow, it can also take place in joy.',
  'This word is not too much.',
  'Again I fancy Sisyphus returning toward his rock, and the sorrow was in the beginning.',
  'When the images of earth cling too tightly to memory, when the call of happiness becomes too insistent, it happens that melancholy arises in man\'s heart: this is the rock\'s victory, this is the rock itself.',
  'The boundless grief is too heavy to bear.',
  'These are our nights of Gethsemane.',
  'But crushing truths perish from being acknowledged.',
  'Thus, Edipus at the outset obeys fate without knowing it.',
  'But from the moment he knows, his tragedy begins.',
  'Yet at the same moment, blind and desperate, he realizes that the only bond linking him to the world is the cool hand of a girl.',
  'Then a tremendous remark rings out: "Despite so many ordeals, my advanced age and the nobility of my soul make me conclude that all is well." Sophocles\' Edipus, like Dostoevsky\'s Kirilov, thus gives the recipe for the absurd victory.',
  'Ancient wisdom confirms modern heroism.',
  'One does not discover the absurd without being tempted to write a manual of happiness.',
  '"What!---by such narrow ways--?" There is but one world, however.',
  'Happiness and the absurd are two sons of the same earth.',
  'They are inseparable.',
  'It would be a mistake to say that happiness necessarily springs from the absurd.',
  'discovery.',
  'It happens as well that the felling of the absurd springs from happiness.',
  '"I conclude that all is well," says Edipus, and that remark is sacred.',
  'It echoes in the wild and limited universe of man.',
  'It teaches that all is not, has not been, exhausted.',
  'It drives out of this world a god who had come into it with dissatisfaction and a preference for futile suffering.',
  'It makes of fate a human matter, which must be settled among men.',
  'All Sisyphus\' silent joy is contained therein.',
  'His fate belongs to him.',
  'His rock is a thing Likewise, the absurd man, when he contemplates his torment, silences all the idols.',
  'In the universe suddenly restored to its silence, the myriad wondering little voices of the earth rise up.',
  'Unconscious, secret calls, invitations from all the faces, they are the necessary reverse and price of victory.',
  'There is no sun without shadow, and it is essential to know the night.',
  'The absurd man says yes and his efforts will henceforth be unceasing.',
  'If there is a personal fate, there is no higher destiny, or at least there is, but one which he concludes is inevitable and despicable.',
  'For the rest, he knows himself to be the master of his days.',
  'At that subtle moment when man glances backward over his life, Sisyphus returning toward his rock, in that slight pivoting he contemplates that series of unrelated actions which become his fate, created by him, combined under his memory\'s eye and soon sealed by his death.',
  'Thus, convinced of the wholly human origin of all that is human, a blind man eager to see who knows that the night has no end, he is still on the go.',
  'The rock is still rolling.',
  'I leave Sisyphus at the foot of the mountain! One always finds one\'s burden again.',
  'But Sisyphus teaches the higher fidelity that negates the gods and raises rocks.',
  'He too concludes that all is well.',
  'This universe henceforth without a master seems to him neither sterile nor futile.',
  'Each atom of that stone, each mineral flake of that night filled mountain, in itself forms a world.',
  'The struggle itself toward the heights is enough to fill a man\'s heart.',
  'One must imagine Sisyphus happy.'
];