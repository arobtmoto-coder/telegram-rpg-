// ======================================
// TELEGRAM
// ======================================

const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}

let telegramUser = null;

if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    telegramUser = tg.initDataUnsafe.user;

    document.getElementById("player-name").textContent =
        telegramUser.first_name || "Player";
}


// ======================================
// GAME DATA
// ======================================

const playerData = {

    level: 1,

    xp: 0,
    xpNeeded: 100,

    coins: 0,

    hp: 100,
    maxHp: 100,

    attack: 20,

    speed: 180,

    critical: 0.05,

    skillPoints: 0,

    skills: {
        attack: 0,
        speed: 0,
        critical: 0
    },

    stage: 1
};


// ======================================
// PHASER CONFIG
// ======================================

const config = {

    type: Phaser.AUTO,

    width: window.innerWidth,
    height: window.innerHeight,

    parent: "game-container",

    backgroundColor: "#18251d",

    physics: {
        default: "arcade",

        arcade: {
            debug: false
        }
    },

    scene: {
        preload: preload,
        create: create,
        update: update
    },

    scale: {
        mode: Phaser.Scale.RESIZE,

        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};


const game = new Phaser.Game(config);


// ======================================
// VARIABLES
// ======================================

let player;

let monsters = [];

let joystick = {
    active: false,
    x: 0,
    y: 0
};

let attackTimer = 0;

let monsterTimer = 0;

let stageKills = 0;

let stageTarget = 10;

let stageBossSpawned = false;


// ======================================
// PRELOAD
// ======================================

function preload() {

    // No external images required.
    // Everything is drawn using Phaser graphics.
}


// ======================================
// CREATE
// ======================================

function create() {

    createMap();

    createPlayer();

    setupTouchControls();

    updateHUD();

    showMessage("STAGE 1");

}


// ======================================
// MAP
// ======================================

function createMap() {

    const width = this.scale.width;
    const height = this.scale.height;

    const graphics = this.add.graphics();

    graphics.fillStyle(0x243b2a, 1);

    graphics.fillRect(
        0,
        0,
        width,
        height
    );

    // Simple grid

    graphics.lineStyle(
        1,
        0x35543b,
        0.5
    );

    for (let x = 0; x < width; x += 50) {

        graphics.lineBetween(
            x,
            0,
            x,
            height
        );
    }

    for (let y = 0; y < height; y += 50) {

        graphics.lineBetween(
            0,
            y,
            width,
            y
        );
    }
}


// ======================================
// PLAYER
// ======================================

function createPlayer() {

    player = this.physics.add.sprite(
        this.scale.width / 2,
        this.scale.height / 2,
        null
    );

    player.setCircle(18);

    player.setTint(0x4dabf7);

    player.body.setCollideWorldBounds(true);

    // Draw player manually

    const graphics = this.add.graphics();

    graphics.fillStyle(0x4dabf7, 1);

    graphics.fillCircle(
        0,
        0,
        18
    );

    graphics.fillStyle(0xffffff, 1);

    graphics.fillCircle(
        -6,
        -4,
        4
    );

    graphics.fillCircle(
        6,
        -4,
        4
    );

    graphics.generateTexture(
        "playerTexture",
        40,
        40
    );

    graphics.destroy();

    player.setTexture("playerTexture");

    player.setDepth(5);
}


// ======================================
// MONSTER
// ======================================

function spawnMonster() {

    if (monsters.length >= 12) {
        return;
    }

    const scene = game.scene.scenes[0];

    const side = Phaser.Math.Between(0, 3);

    let x;
    let y;

    if (side === 0) {
        x = Phaser.Math.Between(20, scene.scale.width - 20);
        y = 100;
    }

    else if (side === 1) {
        x = Phaser.Math.Between(20, scene.scale.width - 20);
        y = scene.scale.height - 20;
    }

    else if (side === 2) {
        x = 20;
        y = Phaser.Math.Between(100, scene.scale.height - 20);
    }

    else {
        x = scene.scale.width - 20;
        y = Phaser.Math.Between(100, scene.scale.height - 20);
    }


    const monster = scene.physics.add.sprite(
        x,
        y
    );

    monster.setCircle(15);

    monster.setTint(
        Phaser.Display.Color.RandomRGB().color
    );

    monster.hp = 50 + (playerData.stage * 20);

    monster.maxHp = monster.hp;

    monster.attack = 5 + playerData.stage * 2;

    monster.speed = 45 + playerData.stage * 5;

    monster.xp = 25 + playerData.stage * 5;

    monster.coins = 5 + playerData.stage * 2;

    monster.lastAttack = 0;

    monsters.push(monster);
}


// ======================================
// BOSS
// ======================================

function spawnBoss() {

    const scene = game.scene.scenes[0];

    const boss = scene.physics.add.sprite(
        scene.scale.width / 2,
        130
    );

    boss.setCircle(30);

    boss.setTint(0xff5252);

    boss.hp = 500 + playerData.stage * 150;

    boss.maxHp = boss.hp;

    boss.attack = 15 + playerData.stage * 5;

    boss.speed = 30;

    boss.xp = 250;

    boss.coins = 100;

    boss.isBoss = true;

    boss.lastAttack = 0;

    monsters.push(boss);

    showMessage("👹 BOSS!");

}


// ======================================
// UPDATE
// ======================================

function update(time, delta) {

    if (!player) {
        return;
    }


    // PLAYER MOVEMENT

    player.setVelocity(
        joystick.x * playerData.speed,
        joystick.y * playerData.speed
    );


    // MONSTER SPAWN

    monsterTimer += delta;

    if (monsterTimer > 1800) {

        monsterTimer = 0;

        spawnMonster();
    }


    // MONSTER AI

    monsters.forEach(monster => {

        if (!monster.active) {
            return;
        }

        const distance = Phaser.Math.Distance.Between(
            monster.x,
            monster.y,
            player.x,
            player.y
        );


        if (distance > 55) {

            const angle = Phaser.Math.Angle.Between(
                monster.x,
                monster.y,
                player.x,
                player.y
            );

            monster.setVelocity(
                Math.cos(angle) * monster.speed,
                Math.sin(angle) * monster.speed
            );

        } else {

            monster.setVelocity(0, 0);

            if (
                time - monster.lastAttack >
                1000
            ) {

                monster.lastAttack = time;

                damagePlayer(monster.attack);
            }
        }

    });


    // AUTOMATIC ATTACK

    attackTimer += delta;

    if (attackTimer > 700) {

        attackTimer = 0;

        autoAttack();
    }


    // CLEAN DEAD MONSTERS

    monsters = monsters.filter(
        monster => monster.active
    );


    // CHECK BOSS

    if (
        stageKills >= stageTarget &&
        !stageBossSpawned
    ) {

        stageBossSpawned = true;

        spawnBoss();
    }

}


// ======================================
// AUTO ATTACK
// ======================================

function autoAttack() {

    let closest = null;

    let closestDistance = Infinity;


    monsters.forEach(monster => {

        if (!monster.active) {
            return;
        }

        const distance =
            Phaser.Math.Distance.Between(
                player.x,
                player.y,
                monster.x,
                monster.y
            );

        if (
            distance < closestDistance &&
            distance < 130
        ) {

            closest = monster;
            closestDistance = distance;
        }

    });


    if (!closest) {
        return;
    }


    let damage = playerData.attack;


    // Critical

    if (
        Math.random() <
        playerData.critical
    ) {

        damage *= 2;

        showMessage("CRITICAL!");
    }


    closest.hp -= damage;


    // Damage text

    createDamageText(
        closest.x,
        closest.y,
        damage
    );


    if (closest.hp <= 0) {

        killMonster(closest);
    }

}


// ======================================
// KILL MONSTER
// ======================================

function killMonster(monster) {

    monster.setActive(false);

    monster.destroy();

    stageKills++;

    addCoins(monster.coins);

    addXP(monster.xp);


    if (monster.isBoss) {

        stageComplete();

    }

}


// ======================================
// DAMAGE PLAYER
// ======================================

function damagePlayer(amount) {

    playerData.hp -= amount;

    if (playerData.hp <= 0) {

        playerData.hp = playerData.maxHp;

        player.x =
            game.scale.width / 2;

        player.y =
            game.scale.height / 2;

        showMessage("💀 Defeated!");

    }

    updateHUD();
}


// ======================================
// XP
// ======================================

function addXP(amount) {

    playerData.xp += amount;


    while (
        playerData.xp >=
        playerData.xpNeeded
    ) {

        playerData.xp -=
            playerData.xpNeeded;

        levelUp();
    }


    updateHUD();
}


// ======================================
// LEVEL UP
// ======================================

function levelUp() {

    playerData.level++;

    playerData.skillPoints++;

    playerData.maxHp += 15;

    playerData.hp =
        playerData.maxHp;

    playerData.attack += 5;

    playerData.xpNeeded =
        Math.floor(
            playerData.xpNeeded * 1.25
        );


    showMessage(
        "LEVEL UP! 🎉"
    );

    updateHUD();
}


// ======================================
// COINS
// ======================================

function addCoins(amount) {

    playerData.coins += amount;

    updateHUD();
}


// ======================================
// STAGE COMPLETE
// ======================================

function stageComplete() {

    showMessage(
        "STAGE COMPLETE! 🏆"
    );

    setTimeout(() => {

        playerData.stage++;

        stageKills = 0;

        stageTarget =
            10 + playerData.stage * 3;

        stageBossSpawned = false;

        showMessage(
            "STAGE " +
            playerData.stage
        );

        updateHUD();

    }, 1800);

}


// ======================================
// DAMAGE TEXT
// ======================================

function createDamageText(
    x,
    y,
    damage
) {

    const scene =
        game.scene.scenes[0];

    const text =
        scene.add.text(
            x,
            y - 25,
            "-" + Math.floor(damage),
            {
                fontSize: "16px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        );

    text.setDepth(20);

    scene.tweens.add({

        targets: text,

        y: y - 60,

        alpha: 0,

        duration: 500,

        onComplete: () => {
            text.destroy();
        }

    });

}


// ======================================
// MESSAGE
// ======================================

function showMessage(text) {

    const element =
        document.getElementById("message");

    element.textContent = text;

    element.style.opacity = "1";

    setTimeout(() => {

        element.style.opacity = "0";

    }, 1000);
}


// ======================================
// HUD
// ======================================

function updateHUD() {

    document.getElementById(
        "level"
    ).textContent =
        playerData.level;


    document.getElementById(
        "coins"
    ).textContent =
        playerData.coins;


    document.getElementById(
        "stage"
    ).textContent =
        playerData.stage;


    document.getElementById(
        "skill-points"
    ).textContent =
        playerData.skillPoints;


    const hpPercent =
        (
            playerData.hp /
            playerData.maxHp
        ) * 100;


    const xpPercent =
        (
            playerData.xp /
            playerData.xpNeeded
        ) * 100;


    document.getElementById(
        "hp-bar"
    ).style.width =
        hpPercent + "%";


    document.getElementById(
        "xp-bar"
    ).style.width =
        xpPercent + "%";
}


// ======================================
// TOUCH CONTROLS
// ======================================

function setupTouchControls() {

    const scene =
        game.scene.scenes[0];

    let startX = 0;
    let startY = 0;

    let joystickGraphics =
        scene.add.graphics();

    joystickGraphics.setDepth(30);


    scene.input.on(
        "pointerdown",
        pointer => {

            startX = pointer.x;
            startY = pointer.y;

            joystick.active = true;

            drawJoystick(
                joystickGraphics,
                startX,
                startY,
                startX,
                startY
            );

        }
    );


    scene.input.on(
        "pointermove",
        pointer => {

            if (!joystick.active) {
                return;
            }

            let dx =
                pointer.x - startX;

            let dy =
                pointer.y - startY;


            const maxDistance = 70;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (distance > maxDistance) {

                dx =
                    (dx / distance) *
                    maxDistance;

                dy =
                    (dy / distance) *
                    maxDistance;
            }


            joystick.x =
                dx / maxDistance;

            joystick.y =
                dy / maxDistance;


            drawJoystick(
                joystickGraphics,
                startX,
                startY,
                startX + dx,
                startY + dy
            );

        }
    );


    scene.input.on(
        "pointerup",
        () => {

            joystick.active = false;

            joystick.x = 0;
            joystick.y = 0;

            joystickGraphics.clear();
        }
    );

}


// ======================================
// JOYSTICK DRAW
// ======================================

function drawJoystick(
    graphics,
    baseX,
    baseY,
    knobX,
    knobY
) {

    graphics.clear();

    graphics.fillStyle(
        0xffffff,
        0.12
    );

    graphics.fillCircle(
        baseX,
        baseY,
        70
    );

    graphics.fillStyle(
        0xffffff,
        0.35
    );

    graphics.fillCircle(
        knobX,
        knobY,
        30
    );
}


// ======================================
// SKILLS
// ======================================

function upgradeSkill(skill) {

    if (
        playerData.skillPoints <= 0
    ) {

        showMessage(
            "No Skill Points"
        );

        return;
    }


    playerData.skillPoints--;

    playerData.skills[skill]++;


    if (skill === "attack") {

        playerData.attack += 10;

    }


    if (skill === "speed") {

        playerData.speed += 20;

    }


    if (skill === "critical") {

        playerData.critical += 0.05;

    }


    showMessage(
        "Skill Upgraded!"
    );

    updateHUD();
}


// ======================================
// SKILL UI
// ======================================

document
    .getElementById("skill-button")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "skill-panel"
                )
                .style.display = "block";

        }
    );


document
    .getElementById("close-skills")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "skill-panel"
                )
                .style.display = "none";

        }
    );
