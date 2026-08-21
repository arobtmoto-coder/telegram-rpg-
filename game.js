// ============================================
// TELEGRAM MINI APP
// ============================================

const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}


// ============================================
// PLAYER DATA
// ============================================

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


// ============================================
// GAME VARIABLES
// ============================================

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


// ============================================
// GAME CONFIG
// ============================================

const config = {
    type: Phaser.AUTO,

    parent: "game-container",

    width: window.innerWidth,
    height: window.innerHeight,

    backgroundColor: "#17251b",

    physics: {
        default: "arcade",

        arcade: {
            debug: false
        }
    },

    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: {
        preload,
        create,
        update
    }
};


const game = new Phaser.Game(config);


// ============================================
// PRELOAD
// ============================================

function preload() {

    // Nothing external to load.
}


// ============================================
// CREATE
// ============================================

function create() {

    createTextures.call(this);

    createMap.call(this);

    createPlayer.call(this);

    setupTouchControls.call(this);

    updateHUD();

    showMessage("STAGE 1");

    // Start with 3 monsters
    for (let i = 0; i < 3; i++) {
        spawnMonster.call(this);
    }
}


// ============================================
// CREATE TEXTURES
// ============================================

function createTextures() {

    // PLAYER TEXTURE
    const playerGraphics = this.make.graphics({
        x: 0,
        y: 0,
        add: false
    });

    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillCircle(20, 20, 18);

    playerGraphics.fillStyle(0xffffff, 1);

    playerGraphics.fillCircle(14, 16, 4);
    playerGraphics.fillCircle(26, 16, 4);

    playerGraphics.generateTexture(
        "player",
        40,
        40
    );

    playerGraphics.destroy();


    // MONSTER TEXTURE
    const monsterGraphics = this.make.graphics({
        x: 0,
        y: 0,
        add: false
    });

    monsterGraphics.fillStyle(0xe74c3c, 1);
    monsterGraphics.fillCircle(18, 18, 16);

    monsterGraphics.fillStyle(0xffffff, 1);

    monsterGraphics.fillCircle(12, 14, 3);
    monsterGraphics.fillCircle(24, 14, 3);

    monsterGraphics.generateTexture(
        "monster",
        36,
        36
    );

    monsterGraphics.destroy();


    // BOSS TEXTURE
    const bossGraphics = this.make.graphics({
        x: 0,
        y: 0,
        add: false
    });

    bossGraphics.fillStyle(0x8e44ad, 1);
    bossGraphics.fillCircle(30, 30, 27);

    bossGraphics.fillStyle(0xffd700, 1);

    bossGraphics.fillCircle(20, 22, 5);
    bossGraphics.fillCircle(40, 22, 5);

    bossGraphics.generateTexture(
        "boss",
        60,
        60
    );

    bossGraphics.destroy();
}


// ============================================
// MAP
// ============================================

function createMap() {

    const width = this.scale.width;
    const height = this.scale.height;

    const graphics = this.add.graphics();

    graphics.fillStyle(
        0x243b2a,
        1
    );

    graphics.fillRect(
        0,
        0,
        width,
        height
    );


    // Grid

    graphics.lineStyle(
        1,
        0x35543b,
        0.35
    );

    for (
        let x = 0;
        x < width;
        x += 50
    ) {

        graphics.lineBetween(
            x,
            0,
            x,
            height
        );
    }


    for (
        let y = 0;
        y < height;
        y += 50
    ) {

        graphics.lineBetween(
            0,
            y,
            width,
            y
        );
    }
}


// ============================================
// CREATE PLAYER
// ============================================

function createPlayer() {

    player = this.physics.add.sprite(
        this.scale.width / 2,
        this.scale.height / 2,
        "player"
    );

    player.setDepth(10);

    player.setCollideWorldBounds(true);

    player.body.setCircle(
        17,
        3,
        3
    );
}


// ============================================
// SPAWN MONSTER
// ============================================

function spawnMonster() {

    if (
        monsters.length >= 15
    ) {
        return;
    }


    let x;
    let y;

    const width = this.scale.width;
    const height = this.scale.height;


    const side = Phaser.Math.Between(
        0,
        3
    );


    if (side === 0) {

        x = Phaser.Math.Between(
            20,
            width - 20
        );

        y = 110;

    }

    else if (side === 1) {

        x = Phaser.Math.Between(
            20,
            width - 20
        );

        y = height - 20;

    }

    else if (side === 2) {

        x = 20;

        y = Phaser.Math.Between(
            110,
            height - 20
        );

    }

    else {

        x = width - 20;

        y = Phaser.Math.Between(
            110,
            height - 20
        );
    }


    const monster =
        this.physics.add.sprite(
            x,
            y,
            "monster"
        );


    monster.setDepth(5);


    // Stats

    monster.hp =
        50 +
        playerData.stage * 20;

    monster.maxHp =
        monster.hp;

    monster.attack =
        5 +
        playerData.stage * 2;

    monster.speed =
        45 +
        playerData.stage * 5;

    monster.xp =
        25 +
        playerData.stage * 5;

    monster.coins =
        5 +
        playerData.stage * 2;

    monster.lastAttack = 0;

    monster.isBoss = false;


    monsters.push(monster);
}


// ============================================
// SPAWN BOSS
// ============================================

function spawnBoss() {

    const boss =
        this.physics.add.sprite(
            this.scale.width / 2,
            150,
            "boss"
        );


    boss.setDepth(6);


    boss.hp =
        500 +
        playerData.stage * 150;

    boss.maxHp =
        boss.hp;

    boss.attack =
        15 +
        playerData.stage * 5;

    boss.speed = 30;

    boss.xp = 250;

    boss.coins = 100;

    boss.lastAttack = 0;

    boss.isBoss = true;


    monsters.push(boss);


    showMessage("👹 BOSS!");
}


// ============================================
// UPDATE
// ============================================

function update(time, delta) {

    if (!player) {
        return;
    }


    // ========================================
    // PLAYER MOVEMENT
    // ========================================

    player.setVelocity(
        joystick.x *
        playerData.speed,

        joystick.y *
        playerData.speed
    );


    // ========================================
    // SPAWN MONSTERS
    // ========================================

    monsterTimer += delta;


    if (
        monsterTimer >= 1800 &&
        stageKills < stageTarget
    ) {

        monsterTimer = 0;

        spawnMonster.call(this);
    }


    // ========================================
    // MONSTER AI
    // ========================================

    for (
        const monster of monsters
    ) {

        if (
            !monster ||
            !monster.active
        ) {
            continue;
        }


        const distance =
            Phaser.Math.Distance.Between(
                monster.x,
                monster.y,
                player.x,
                player.y
            );


        if (distance > 60) {

            const angle =
                Phaser.Math.Angle.Between(
                    monster.x,
                    monster.y,
                    player.x,
                    player.y
                );


            monster.setVelocity(
                Math.cos(angle) *
                monster.speed,

                Math.sin(angle) *
                monster.speed
            );

        }

        else {

            monster.setVelocity(
                0,
                0
            );


            if (
                time -
                monster.lastAttack >
                1000
            ) {

                monster.lastAttack =
                    time;

                damagePlayer(
                    monster.attack
                );
            }
        }
    }


    // ========================================
    // AUTO ATTACK
    // ========================================

    attackTimer += delta;


    if (
        attackTimer >= 600
    ) {

        attackTimer = 0;

        autoAttack();
    }


    // ========================================
    // BOSS
    // ========================================

    if (
        stageKills >= stageTarget &&
        !stageBossSpawned
    ) {

        stageBossSpawned = true;

        spawnBoss.call(this);
    }


    // Remove inactive monsters

    monsters =
        monsters.filter(
            monster =>
                monster &&
                monster.active
        );
}


// ============================================
// AUTO ATTACK
// ============================================

function autoAttack() {

    if (!player) {
        return;
    }


    let closest = null;

    let closestDistance =
        Infinity;


    for (
        const monster of monsters
    ) {

        if (
            !monster ||
            !monster.active
        ) {
            continue;
        }


        const distance =
            Phaser.Math.Distance.Between(
                player.x,
                player.y,
                monster.x,
                monster.y
            );


        if (
            distance <
            closestDistance &&
            distance <
            160
        ) {

            closest = monster;

            closestDistance =
                distance;
        }
    }


    if (!closest) {
        return;
    }


    let damage =
        playerData.attack;


    // Critical

    if (
        Math.random() <
        playerData.critical
    ) {

        damage *= 2;

        showMessage(
            "CRITICAL! 💥"
        );
    }


    closest.hp -= damage;


    createDamageText(
        closest.x,
        closest.y,
        damage
    );


    // Attack visual

    createAttackEffect(
        player.x,
        player.y,
        closest.x,
        closest.y
    );


    if (
        closest.hp <= 0
    ) {

        killMonster(
            closest
        );
    }
}


// ============================================
// ATTACK EFFECT
// ============================================

function createAttackEffect(
    x1,
    y1,
    x2,
    y2
) {

    const scene =
        game.scene.scenes[0];

    const line =
        scene.add.graphics();

    line.lineStyle(
        3,
        0xffd54f,
        0.8
    );

    line.lineBetween(
        x1,
        y1,
        x2,
        y2
    );


    scene.tweens.add({

        targets: line,

        alpha: 0,

        duration: 120,

        onComplete: () => {
            line.destroy();
        }
    });
}


// ============================================
// KILL MONSTER
// ============================================

function killMonster(
    monster
) {

    if (
        !monster ||
        !monster.active
    ) {
        return;
    }


    const xp =
        monster.xp;

    const coins =
        monster.coins;

    const isBoss =
        monster.isBoss;


    monster.setActive(false);

    monster.setVisible(false);

    monster.destroy();


    if (!isBoss) {

        stageKills++;

        addXP(xp);

        addCoins(coins);

    }

    else {

        addXP(xp);

        addCoins(coins);

        stageComplete();
    }


    updateHUD();
}


// ============================================
// DAMAGE PLAYER
// ============================================

function damagePlayer(
    amount
) {

    playerData.hp -= amount;


    if (
        playerData.hp <= 0
    ) {

        playerData.hp = 0;

        updateHUD();

        showMessage(
            "💀 Defeated!"
        );


        setTimeout(() => {

            playerData.hp =
                playerData.maxHp;

            player.x =
                game.scale.width / 2;

            player.y =
                game.scale.height / 2;

            updateHUD();

        }, 700);
    }


    updateHUD();
}


// ============================================
// XP
// ============================================

function addXP(
    amount
) {

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


// ============================================
// LEVEL UP
// ============================================

function levelUp() {

    playerData.level++;

    playerData.skillPoints++;

    playerData.maxHp += 15;

    playerData.hp =
        playerData.maxHp;

    playerData.attack += 5;

    playerData.xpNeeded =
        Math.floor(
            playerData.xpNeeded *
            1.25
        );


    showMessage(
        "LEVEL UP! 🎉"
    );


    updateHUD();
}


// ============================================
// COINS
// ============================================

function addCoins(
    amount
) {

    playerData.coins +=
        amount;

    updateHUD();
}


// ============================================
// STAGE COMPLETE
// ============================================

function stageComplete() {

    showMessage(
        "STAGE COMPLETE! 🏆"
    );


    setTimeout(() => {

        playerData.stage++;

        stageKills = 0;

        stageTarget =
            10 +
            playerData.stage * 3;

        stageBossSpawned =
            false;


        showMessage(
            "STAGE " +
            playerData.stage
        );


        updateHUD();


        // Spawn initial monsters

        for (
            let i = 0;
            i < 3;
            i++
        ) {

            spawnMonster.call(
                game.scene.scenes[0]
            );
        }

    }, 1500);
}


// ============================================
// DAMAGE TEXT
// ============================================

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
            y - 20,
            "-" +
            Math.floor(damage),
            {
                fontSize: "16px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        );


    text.setOrigin(
        0.5
    );


    text.setDepth(
        30
    );


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


// ============================================
// MESSAGE
// ============================================

function showMessage(
    text
) {

    const element =
        document.getElementById(
            "message"
        );


    element.textContent =
        text;


    element.style.opacity =
        "1";


    clearTimeout(
        window.messageTimer
    );


    window.messageTimer =
        setTimeout(() => {

            element.style.opacity =
                "0";

        }, 1000);
}


// ============================================
// HUD
// ============================================

function updateHUD() {

    const level =
        document.getElementById(
            "level"
        );

    const coins =
        document.getElementById(
            "coins"
        );

    const stage =
        document.getElementById(
            "stage"
        );

    const skillPoints =
        document.getElementById(
            "skill-points"
        );

    const hpBar =
        document.getElementById(
            "hp-bar"
        );

    const xpBar =
        document.getElementById(
            "xp-bar"
        );


    if (level) {

        level.textContent =
            playerData.level;
    }


    if (coins) {

        coins.textContent =
            playerData.coins;
    }


    if (stage) {

        stage.textContent =
            playerData.stage;
    }


    if (skillPoints) {

        skillPoints.textContent =
            playerData.skillPoints;
    }


    if (hpBar) {

        const hpPercent =
            Math.max(
                0,
                (
                    playerData.hp /
                    playerData.maxHp
                ) * 100
            );

        hpBar.style.width =
            hpPercent + "%";
    }


    if (xpBar) {

        const xpPercent =
            Math.min(
                100,
                (
                    playerData.xp /
                    playerData.xpNeeded
                ) * 100
            );

        xpBar.style.width =
            xpPercent + "%";
    }
}


// ============================================
// TOUCH JOYSTICK
// ============================================

function setupTouchControls() {

    const scene =
        game.scene.scenes[0];


    let startX = 0;
    let startY = 0;


    const joystickGraphics =
        scene.add.graphics();


    joystickGraphics.setDepth(
        50
    );


    scene.input.on(
        "pointerdown",
        pointer => {

            startX =
                pointer.x;

            startY =
                pointer.y;


            joystick.active =
                true;


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

            if (
                !joystick.active
            ) {
                return;
            }


            let dx =
                pointer.x -
                startX;

            let dy =
                pointer.y -
                startY;


            const maxDistance =
                70;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance >
                maxDistance
            ) {

                dx =
                    (
                        dx /
                        distance
                    ) *
                    maxDistance;

                dy =
                    (
                        dy /
                        distance
                    ) *
                    maxDistance;
            }


            joystick.x =
                dx /
                maxDistance;

            joystick.y =
                dy /
                maxDistance;


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

            joystick.active =
                false;

            joystick.x = 0;
            joystick.y = 0;

            joystickGraphics.clear();
        }
    );
}


// ============================================
// DRAW JOYSTICK
// ============================================

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
        0.4
    );


    graphics.fillCircle(
        knobX,
        knobY,
        28
    );
}


// ============================================
// SKILLS
// ============================================

function upgradeSkill(
    skill
) {

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


    if (
        skill === "attack"
    ) {

        playerData.attack += 10;
    }


    if (
        skill === "speed"
    ) {

        playerData.speed += 20;
    }


    if (
        skill === "critical"
    ) {

        playerData.critical += 0.05;
    }


    showMessage(
        "Skill Upgraded! ⚡"
    );


    updateHUD();
}


// ============================================
// SKILL PANEL
// ============================================

document
    .getElementById("skill-button")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "skill-panel"
                )
                .style.display =
                "block";
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
                .style.display =
                "none";
        }
    );
