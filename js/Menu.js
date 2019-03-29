let scene = '';

let Menu = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function Menu () {
        Phaser.Scene.call(this, { key: 'menu' });
        console.log("Menu()");
    },

    create: function () {
      this.cameras.main.setBackgroundColor('#000');
      let titleStyle = { fontFamily: 'Commodore', fontSize: '38px', fill: '#aadddd', wordWrap: true, align: 'center' };
      let title = this.add.text(this.game.canvas.width/2,100,"LET'S PLAY:\nANCIENT GREEK PUNISHMENT:\nTEACHES TYPING",titleStyle);
      title.setOrigin(0.5);

      let items = [
        { text: '(S)ISYPHUS', key: 'S', scene: 'sisyphus' },
        { text: '(T)ANTALUS', key: 'T', scene: 'tantalus' },
        { text: '(P)ROMETHEUS', key: 'P', scene: 'prometheus' },
        { text: '(D)ANAIDS', key: 'D', scene: 'danaids' },
        { text: '(Z)ENO', key: 'Z', scene: 'zeno' },
        { text: '(C)AMUS', key: 'C', scene: 'camus' },
      ];
      let itemsTop = 52*4;
      let spacing = 26;
      let y = itemsTop;
      for (let i = 0; i < items.length; i++) {
        this.addMenuItem(items[i],y);
        y += spacing;
      }
    },

    addMenuItem: function (item,y) {
      let itemStyle = { fontFamily: 'Commodore', fontSize: '24px', fill: '#aadddd', wordWrap: true };
      let itemText = this.add.text(this.game.canvas.width/2,y,item.text,itemStyle);
      if (item.scene === 'camus') {
        itemText.alpha = 0.5;
      }
      itemText.setOrigin(0.5);
      this.input.keyboard.on('keydown', (e) => {
        if (e.key.toUpperCase() === item.key) {
          scene = item.scene;
          if (item.scene === 'camus') {
            this.scene.start('camus');
          }
          else {
            this.scene.start('difficultymenu');
          }
        }
      });
    },

    update: function () {

    }

});
