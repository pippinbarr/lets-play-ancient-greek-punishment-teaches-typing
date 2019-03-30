let difficulty = '';

let DifficultyMenu = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function Menu () {
        Phaser.Scene.call(this, { key: 'difficultymenu' });
    },

    create: function () {
      this.cameras.main.setBackgroundColor('#000');
      let titleStyle = { fontFamily: 'Commodore', fontSize: '38px', fill: '#aadddd', wordWrap: true, align: 'center' };
      let title = this.add.text(this.game.canvas.width/2,100,"LET'S PLAY:\nANCIENT GREEK PUNISHMENT:\nTEACHES TYPING",titleStyle);
      title.setOrigin(0.5);

      let items = [
        { text: '(B)EGINNER', difficulty: 'beginner', key: 'B', scene: scene },
        { text: '(I)NTERMEDIATE', difficulty: 'intermediate',key: 'I', scene: scene },
        { text: '(A)DVANCED', difficulty: 'advanced',key: 'A', scene: scene },
      ];

      if (scene === 'camus') {
        items = [
          { text: '(N)IGHTMARE', difficulty: 'nightmare', key: 'N', scene: scene },
        ]
      }

      let instructionStyle = { fontFamily: 'Commodore', fontSize: '18px', fill: '#aadddd', wordWrap: true };
      this.add.text(this.game.canvas.width/2,50*4,`SELECT A DIFFICULTY`,instructionStyle).setOrigin(0.5);

      let itemsTop = 58*4;
      let spacing = 34;
      let y = itemsTop;
      for (let i = 0; i < items.length; i++) {
        this.addMenuItem(items[i],y);
        y += spacing;
      }
    },

    addMenuItem: function (item,y) {
      let itemStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: '#aadddd', wordWrap: true };
      let itemText = this.add.text(this.game.canvas.width/2,y,item.text,itemStyle);
      itemText.setOrigin(0.5);
      this.input.keyboard.on('keydown', (e) => {
        if (e.key.toUpperCase() === item.key) {
          difficulty = item.difficulty;
          this.scene.start(item.scene);
        }
      });
    },

    update: function () {

    }

});
