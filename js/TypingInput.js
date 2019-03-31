let TypingInput = new Phaser.Class({

  initialize: function TypingInput (parent,x,y,input,minWPM,wpmColor,wpmX,wpmY,textColor,cursorColor,customEvent,upper,showWPM) {
    this.scene = parent;
    this.x = x;
    this.y = y;
    this.enabled = true;
    this.wpm = 0;
    this.minWPM = 1;
    this.wpmColor = wpmColor;
    this.wpmX = wpmX;
    this.wpmY = wpmY;
    this.showWPM = showWPM;
    this.words = 0;
    this.WORD_LENGTH = 6; // Actually it's 5 + a space/punctuation character

    this.customEvent = customEvent;

    let strings = [];
    if (input.origin !== undefined) {
      let grammar = tracery.createGrammar(input);
      for (let i = 0; i < 10; i++) {
        strings.push(grammar.flatten('#origin# '));
      }
    }
    else {
      strings = input;
    }
    if (upper !== undefined)  {
      for (let i = 0; i < strings.length; i++) {
        if (upper) {
          strings[i] = strings[i].toUpperCase();
        }
        else {
          strings[i] = strings[i].toLowerCase();
        }
      }
    }
    this.strings = strings;
    this.typingIndex = 0;

    this.cursorColor = cursorColor;
    this.textColor = textColor;
    this.texts = [

    ];

    this.goodKeySFX = parent.sound.add('key-good');
    this.goodKeySFX.volume = 0.2;
    this.badKeySFX = parent.sound.add('key-bad');
    this.badKeySFX.volume = 0.2;

  },

  reset: function ()  {
    this.texts.forEach((text) => {
      text.destroy();
    });
    this.cursor.destroy();
    if (this.wpmText !== undefined) this.wpmText.destroy();
    this.texts = [];
    this.typingIndex = 0;
    this.words = 0;
    this.create();
  },

  create: function () {
    if (this.customEvent === undefined) {
      this.scene.input.keyboard.on('keydown', function (event) {
        if (this.enabled) this.handleInput(event.key);
      },this);
    }

    this.enabled = true;
    this.wpms = [];
    this.charsTyped = 0;
    this.wpmInterval = setInterval(() => {
      let wpm = ((this.charsTyped / this.WORD_LENGTH) * 60 * (1000/150));
      this.wpms.push(wpm);
      if (this.wpms.length > 5) this.wpms.shift();
      this.wpm = this.wpms.reduce((a,b) => a + b,0)/this.wpms.length;
      this.wpm = Math.floor(this.wpm);
      let wpmString = `${this.wpm} WPM`;
      if (this.showWPM !== false) this.wpmText.text = wpmString;
      this.charsTyped = 0;
    },150);

    let cursorRect = new Phaser.Geom.Rectangle(this.x,this.y,18,30);
    this.cursor = this.scene.add.graphics();
    this.cursor.fillStyle(this.cursorColor);
    this.cursor.fillRectShape(cursorRect);

    this.currentText = 0;

    let inputStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: this.textColor, wordWrap: true, align: 'center' };
    let totalWidth = 0;
    let totalChars = 0;
    let x = this.x;
    for (let i = 0; i < this.strings.length; i++) {
      let text = this.scene.add.text(x,this.y,this.strings[i],inputStyle);
      text.setOrigin(0);
      this.texts.push(text);
      totalWidth += text.width;
      totalChars += this.strings[i].length;
      x += text.width;
    }
    this.CHAR_WIDTH = totalWidth / totalChars;

    if (this.showWPM !== false) {
      // Add WPM text
      let wpmStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: this.wpmColor, wordWrap: true, align: 'left' };
      let wpmString = `0 WPM`;
      this.wpmText = this.scene.add.text(this.wpmX,this.wpmY,wpmString,wpmStyle);
      this.wpmText.setOrigin(1,0);
    }
  },

  isNextKey: function (key) {
    return (key === this.strings[this.currentText].charAt(this.typingIndex));
  },

  isFinalKey: function (key) {
    return this.isNextKey(key) && this.currentText === this.strings.length - 1 && this.typingIndex === this.strings[this.currentText].length - 1;
  },

  handleInput: function (key) {
    if (this.isNextKey(key)) {
      if (key === ' ') {
        this.words++;
      }
      // Correct
      this.typingIndex = (this.typingIndex + 1) % this.strings[this.currentText].length;
      this.charsTyped++;
      this.goodKeySFX.play();

      if (this.typingIndex === 0) {
        this.currentText = (this.currentText + 1) % this.strings.length;
      }

      this.texts.forEach(function (text,index) {
        text.x -= this.CHAR_WIDTH;
      },this);

      this.texts.forEach(function (text,index) {
        if (text.x + text.width < 0) {
          let nextTextIndex = (index + this.strings.length - 1) % this.strings.length;
          let nextText = this.texts[nextTextIndex];
          text.x = nextText.x + nextText.width;
        }
      },this);
    }
    else {
      if (key !== 'Shift') {
        this.badKeySFX.play();
        this.wpms = [0];
      }
    }
  },

  success: function () {
    return (this.enabled && this.wpm >= this.minWPM);
  },

  update: function (time,delta) {
    if (this.gameIsOver) return;
  },

  disable: function () {
    this.enabled = false;
    this.texts.forEach(function (text) {
      text.alpha = 0.4;
    });

  },

  enable: function () {
    this.enabled = true;
    this.texts.forEach(function (text) {
      text.alpha = 1;
    });
  },

  hide: function () {
    this.texts.forEach(function (text) {
      text.visible = false;
    });
    this.enabled = false;
    this.cursor.visible = false;
  },

});
