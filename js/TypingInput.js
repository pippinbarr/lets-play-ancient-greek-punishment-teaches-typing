let TypingInput = new Phaser.Class({

  initialize: function TypingInput (parent,strings,cursorColor) {
    console.log('TypingInput()');

    this.scene = parent;
    this.wpm = 0;
    this.MIN_WPM = 30;
    this.WORD_LENGTH = 6; // Actually it's 5 + a space/punctuation character

    this.strings = strings;
    this.typingIndex = 0;

    this.cursorColor = cursorColor;
    this.texts = [

    ];
  },

  create: function () {
    this.scene.input.keyboard.on('keydown', function (event) {
      if (this.enabled) this.handleInput(event);
    },this);

    this.enabled = true;
    this.wpms = [];
    this.charsTyped = 0;
    this.wpmInterval = setInterval(() => {
      let wpm = ((this.charsTyped / this.WORD_LENGTH) * 60 * (1000/150));
      this.wpms.push(wpm);
      if (this.wpms.length > 5) this.wpms.shift();
      this.wpm = this.wpms.reduce((a,b) => a + b,0)/this.wpms.length;
      this.wpm = Math.floor(this.wpm);
      this.wpmText.text = `${this.wpm} WPM`;
      this.charsTyped = 0;
    },150);

    let cursorRect = new Phaser.Geom.Rectangle(100,10,18,30);
    this.cursor = this.scene.add.graphics();
    this.cursor.fillStyle(this.cursorColor);
    this.cursor.fillRectShape(cursorRect);

    this.currentText = 0;

    let inputStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: '#000', wordWrap: true, align: 'center' };
    let totalWidth = 0;
    let totalChars = 0;
    let x = 100;
    for (let i = 0; i < this.strings.length; i++) {
      let text = this.scene.add.text(x,10,this.strings[i],inputStyle);
      text.setOrigin(0);
      this.texts.push(text);
      totalWidth += text.width;
      totalChars += this.strings[i].length;
      x += text.width;
    }
    this.CHAR_WIDTH = totalWidth / totalChars;
    console.log(totalWidth,totalChars,this.CHAR_WIDTH)

    // Add WPM text
    let wpmStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: '#fff', wordWrap: true, align: 'center' };
    let wpmString = "0 WPM";
    this.wpmText = this.scene.add.text(100,340,wpmString,wpmStyle);
    this.wpmText.setOrigin(0);
  },

  handleInput: function (event) {
    if (event.key === this.strings[this.currentText].charAt(this.typingIndex)) {
      // Correct
      this.typingIndex = (this.typingIndex + 1) % this.strings[this.currentText].length;
      this.charsTyped++;

      if (this.typingIndex === 0) {
        this.currentText = (this.currentText + 1) % this.strings.length;
      }

      this.texts.forEach(function (text,index) {
        text.x -= this.CHAR_WIDTH;
      },this);

      this.texts.forEach(function (text,index) {
        if (text.x + text.width < 0) {
          let nextTextIndex = (index + this.strings[index].length - 1) % this.strings.length;
          let nextText = this.texts[nextTextIndex];
          text.x = nextText.x + nextText.width;
        }
      },this);
    }
    else {
      if (event.key !== 'Shift') {
        // Incorrect
      }
    }
  },

  success: function () {
    return (this.wpm >= this.MIN_WPM);
  },

  update: function (time,delta) {

    if (this.gameIsOver) return;

  }

});
