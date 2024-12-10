import Phaser from "phaser";
import { useEffect, useRef } from "react";
import sky from "../map_assets/phs/sky.png";
import platform from '../map_assets/phs/platform.png';
import star from '../map_assets/phs/star.png';
import bomb from '../map_assets/phs/bomb.png';
import dude from '../map_assets/phs/dude.png';

const Space = () => {
    const gameRef = useRef<Phaser.Game | null>(null);
    var platforms: Phaser.Physics.Arcade.StaticGroup,
        player: Phaser.Physics.Arcade.Sprite,
        cursors: Phaser.Types.Input.Keyboard.CursorKeys,
        stars: Phaser.Physics.Arcade.Group;
    var score = 0;
    var scoreText: Phaser.GameObjects.Text, bombs: Phaser.Physics.Arcade.Group;


    useEffect(() => {
        if (!gameRef.current) {


            var config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                width: 800,
                height: 600,
                scene: {
                    preload,
                    create,
                    update
                },
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: {
                            y: 300,
                            x: 0
                        },
                        debug: false
                    }
                }
            };
            gameRef.current = new Phaser.Game(config);

            function preload() {
                this.load.image("sky", sky);
                this.load.image('ground', platform);
                this.load.image('star', star);
                this.load.image('bomb', bomb);
                this.load.spritesheet('dude',
                    dude,
                    { frameWidth: 32, frameHeight: 48 }
                );
            }

            function create() {
                this.add.image(400, 300, "sky"); // center

                platforms = this.physics.add.staticGroup();
                // width center, hight center.
                platforms.create(400, 568, 'ground').setScale(2).refreshBody(); // nofity changes on scaling 'refreshbody'
                platforms.create(600, 400, 'ground');
                platforms.create(50, 250, 'ground');
                platforms.create(750, 220, 'ground');

                player = this.physics.add.sprite(100, 450, 'dude');

                this.physics.add.collider(player, platforms);

                player.setBounce(0.2);
                player.setCollideWorldBounds(true);

                this.anims.create({
                    key: 'left',
                    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
                    frameRate: 10,
                    repeat: -1
                });

                this.anims.create({
                    key: 'turn',
                    frames: [{ key: 'dude', frame: 4 }],
                    frameRate: 20
                });

                this.anims.create({
                    key: 'right',
                    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
                    frameRate: 10,
                    repeat: -1
                });

                cursors = this.input.keyboard.createCursorKeys();

                stars = this.physics.add.group({
                    key: 'star',
                    repeat: 11,
                    setXY: { x: 12, y: 0, stepX: 70 }
                });
                this.physics.add.collider(stars, platforms);
                this.physics.add.overlap(player, stars, collectStar, null, this);
                stars.children.iterate((child: any) => child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)));
                scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
                bombs = this.physics.add.group();

                this.physics.add.collider(bombs, platforms);

                this.physics.add.collider(player, bombs, hitBomb, null, this);

            }

            function collectStar(player: any, star: any) {
                star.disableBody(true, true);

                score += 10;
                scoreText.setText('Score: ' + score);

                if (stars.countActive(true) === 0) {
                    stars.children.iterate(function (child: any) {
                        return child.enableBody(true, child.x, 0, true, true);
                    });

                    var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

                    var bomb = bombs.create(x, 16, 'bomb');
                    bomb.setBounce(1);
                    bomb.setCollideWorldBounds(true);
                    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
                }
            }


            function hitBomb(player: any, bomb: any) {
                this.physics.pause();

                player.setTint(0xff0000);

                player.anims.play('turn');

                var gameOver = true;
            }


            function update() {
                if (cursors.left.isDown) {
                    player.setVelocityX(-160);

                    player.anims.play('left', true);
                }
                else if (cursors.right.isDown) {
                    player.setVelocityX(160);

                    player.anims.play('right', true);
                }
                else {
                    player.setVelocityX(0);

                    player.anims.play('turn');
                }

                if (cursors.up.isDown && player.body?.touching.down) {
                    player.setVelocityY(-330);
                }

            }
        }
    }, [])
    return (
        <h1>Hello again</h1>
    )
}
export default Space;