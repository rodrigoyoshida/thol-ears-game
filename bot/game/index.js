const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'thol-ears-game',
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 600,
    height: 600
  },
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 900 },
        debug: false
    }
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

const game = new Phaser.Game(config);
let player;
let platforms;
let cursors;
let score = 0;
let scoreText;
let button;

function preload () {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('ear', 'assets/ear.png');
  this.load.image('bomb', 'assets/bomb.png');
  this.load.image('button', 'assets/button.png');
  this.load.spritesheet('tython', 
      'assets/tython.png',
      { frameWidth: 38, frameHeight: 56 }
  );
}

function create () {
  this.add.image(300, 300, 'sky');
  
  platforms = this.physics.add.staticGroup();
  platforms.create(300, 568, 'ground').setScale(2).refreshBody();
  platforms.create(620, 400, 'ground');
  platforms.create(60, 270, 'ground');
  platforms.create(710, 240, 'ground');

  player = this.physics.add.sprite(100, 450, 'tython');
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('tython', { start: 0, end: 3 }),
    frameRate: 15,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [ { key: 'tython', frame: 4 } ],
    frameRate: 25
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('tython', { start: 5, end: 8 }),
    frameRate: 15,
    repeat: -1
  });

  this.physics.add.collider(player, platforms);

  ears = this.physics.add.group({
    key: 'ear',
    repeat: 7,
    setXY: { x: 20, y: 0, stepX: 74 }
  });

  ears.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  this.physics.add.collider(ears, platforms);

  cursors = this.input.keyboard.createCursorKeys();

  this.physics.add.overlap(player, ears, collectEars, null, this);

  function collectEars (player, ear) {
    ear.disableBody(true, true);

    score += 1;
    scoreText.setText('Ears: ' + score);

    if (ears.countActive(true) === 0) {
      ears.children.iterate(function (child) {
        child.enableBody(true, child.x, 0, true, true);
      });

      const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
      const bomb = bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-100, 100), 10);
    }
  }

  bombs = this.physics.add.group();
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(player, bombs, hitBomb, null, this);

  function hitBomb (player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;

    const urlParams = new URLSearchParams(window.location.search)
    const postBody = {
      user_id: urlParams.get('user_id'),
      score,
      message_id: urlParams.get('message_id'),
      chat_id: urlParams.get('chat_id'),
    }
    fetch('https://rodrigoymy.online/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postBody)
    })

    button = this.add.image(320, 300, 'button').setInteractive();
    button.on('pointerdown', () => {
      score = 0;
      this.scene.restart();
    })
  }
  
  scoreText = this.add.text(16, 16, 'Ears: 0', { fontSize: '32px', fill: '#000' });
}

function update () {
  if (this.input.activePointer.isDown) {
    const { x, y } = this.input.activePointer.position
    const { x: prevX, y: prevY } = this.input.activePointer.prevPosition
    
    const sideMovement = x > prevX ? x - prevX : prevX - x
    const upMovement = y > prevY ? y - prevY : prevY - y
    const movedToSide = sideMovement > upMovement

    if (sideMovement > 8 || upMovement > 8) {
      if (movedToSide && x < prevX) {
        moveLeft()
      } else if (movedToSide && x > prevX) {
        moveRight()
      } else if (y < prevY && player.body.touching.down) {
        moveUp()
      }
    }
  }

  if (cursors.up.isDown && player.body.touching.down) {
    moveUp()
  } else if (cursors.left.isDown) {
    moveLeft()
  } else if (cursors.right.isDown) {
    moveRight()
  }
}

function moveLeft () {
  player.setVelocityX(-200);
  player.anims.play('left', true);
}

function moveRight () {
  player.setVelocityX(200);
  player.anims.play('right', true);
}

function moveUp () {
  player.setVelocityY(-640);
}
