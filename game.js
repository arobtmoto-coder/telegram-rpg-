"use strict";

/*
    ELEMENT RPG
    No Phaser
    No external library
*/


// ==========================================
// CANVAS
// ==========================================

const canvas =
    document.getElementById("game");

const ctx =
    canvas.getContext("2d");


let W = 0;
let H = 0;


// ==========================================
// PLAYER
// ==========================================

const player = {

    x: 0,
    y: 0,

    radius: 22,

    speed: 3.8,

    hp: 100,
    maxHp: 100,

    level: 1,

    xp: 0,

    coins: 0,

    attack: 18,

    attackRange: 90,

    attackCooldown: 600,

    lastAttack: 0,

    facingX: 1,
    facingY: 0,

    moving: false
};


// ==========================================
// GAME
// ==========================================

let stage = 1;

let monsters = [];

let projectiles = [];

let particles = [];

let effects = [];

let damageTexts = [];

let selectedSkill = null;

let killsThisStage = 0;

let stageGoal = 8;


// ==========================================
// RESIZE
// ==========================================

function resizeCanvas() {

    W =
        window.innerWidth;

    H =
        window.innerHeight;


    canvas.width = W;
    canvas.height = H;


    if (
        player.x === 0 &&
        player.y === 0
    ) {

        player.x =
            W / 2;

        player.y =
            H / 2 + 50;
    }
}


window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


// ==========================================
// SKILLS
// ==========================================

const skills = {

    fireball: {

        name: "🔥 Fireball",

        damage: 25,

        cooldown: 800,

        color: "#ff5722",

        type: "projectile"
    },


    flamewave: {

        name: "🔥 Flame Wave",

        damage: 45,

        cooldown: 2200,

        color: "#ff8c00",

        type: "area",

        radius: 130
    },


    waterbolt: {

        name: "💧 Water Bolt",

        damage: 30,

        cooldown: 850,

        color: "#38bdf8",

        type: "projectile"
    },


    tsunami: {

        name: "🌊 Tsunami",

        damage: 60,

        cooldown: 3000,

        color: "#0284c7",

        type: "area",

        radius: 175
    },


    iceshard: {

        name: "❄️ Ice Shard",

        damage: 30,

        cooldown: 900,

        color: "#7dd3fc",

        type: "projectile",

        freeze: true
    },


    blizzard: {

        name: "🌨️ Blizzard",

        damage: 70,

        cooldown: 3500,

        color: "#bae6fd",

        type: "area",

        radius: 190,

        freeze: true
    },


    thunder: {

        name: "⚡ Thunder",

        damage: 40,

        cooldown: 1200,

        color: "#fde047",

        type: "lightning"
    }

};


const skillLastUsed = {};


// ==========================================
// INPUT
// ==========================================

const keys = {};


window.addEventListener(
    "keydown",
    function(e) {

        keys[
            e.key.toLowerCase()
        ] = true;
    }
);


window.addEventListener(
    "keyup",
    function(e) {

        keys[
            e.key.toLowerCase()
        ] = false;
    }
);


// ==========================================
// MOBILE JOYSTICK
// ==========================================

const joystick = {

    active: false,

    pointerId: null,

    baseX: 0,
    baseY: 0,

    x: 0,
    y: 0,

    radius: 62
};


canvas.addEventListener(
    "pointerdown",
    function(e) {

        joystick.active = true;

        joystick.pointerId =
            e.pointerId;

        joystick.baseX =
            e.clientX;

        joystick.baseY =
            e.clientY;

        joystick.x = 0;
        joystick.y = 0;

        try {
            canvas.setPointerCapture(
                e.pointerId
            );
        } catch (_) {}
    }
);


canvas.addEventListener(
    "pointermove",
    function(e) {

        if (
            !joystick.active ||
            e.pointerId !==
            joystick.pointerId
        ) {
            return;
        }


        let dx =
            e.clientX -
            joystick.baseX;

        let dy =
            e.clientY -
            joystick.baseY;


        const distance =
            Math.hypot(dx, dy);


        if (
            distance >
            joystick.radius
        ) {

            dx =
                dx / distance *
                joystick.radius;

            dy =
                dy / distance *
                joystick.radius;
        }


        joystick.x =
            dx /
            joystick.radius;

        joystick.y =
            dy /
            joystick.radius;
    }
);


function stopJoystick() {

    joystick.active = false;

    joystick.pointerId = null;

    joystick.x = 0;
    joystick.y = 0;
}


canvas.addEventListener(
    "pointerup",
    stopJoystick
);

canvas.addEventListener(
    "pointercancel",
    stopJoystick
);


// ==========================================
// PLAYER MOVEMENT
// ==========================================

function updatePlayer() {

    let dx = 0;
    let dy = 0;


    // Touch

    if (joystick.active) {

        dx += joystick.x;
        dy += joystick.y;
    }


    // Keyboard

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {
        dy -= 1;
    }

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {
        dy += 1;
    }

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {
        dx -= 1;
    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {
        dx += 1;
    }


    const length =
        Math.hypot(dx, dy);


    if (length > 0) {

        dx /= length;
        dy /= length;


        player.moving = true;


        player.facingX = dx;
        player.facingY = dy;


        player.x +=
            dx *
            player.speed;

        player.y +=
            dy *
            player.speed;

    } else {

        player.moving = false;
    }


    // Screen boundaries

    player.x =
        Math.max(
            30,
            Math.min(
                W - 30,
                player.x
            )
        );


    player.y =
        Math.max(
            105,
            Math.min(
                H - 35,
                player.y
            )
        );
}


// ==========================================
// MONSTERS
// ==========================================

const monsterTypes = [

    {
        name: "Slime",

        color: "#22c55e",

        hp: 55,

        speed: 0.7,

        radius: 21
    },


    {
        name: "Goblin",

        color: "#ef4444",

        hp: 70,

        speed: 0.85,

        radius: 23
    },


    {
        name: "Demon",

        color: "#9333ea",

        hp: 100,

        speed: 0.5,

        radius: 27
    }

];


function spawnMonster() {

    const type =
        monsterTypes[
            Math.floor(
                Math.random() *
                monsterTypes.length
            )
        ];


    let x;
    let y;


    // Spawn away from player

    do {

        x =
            45 +
            Math.random() *
            (W - 90);

        y =
            120 +
            Math.random() *
            Math.max(
                100,
                H - 165
            );

    } while (
        Math.hypot(
            x - player.x,
            y - player.y
        ) < 220
    );


    const hp =
        type.hp +
        (stage - 1) * 12;


    monsters.push({

        x: x,

        y: y,

        radius:
            type.radius,

        color:
            type.color,

        name:
            type.name,

        hp: hp,

        maxHp: hp,

        speed:
            type.speed +
            (stage - 1) * 0.015,

        frozen: 0,

        hitFlash: 0,

        attackTimer: 0
    });
}


function maintainMonsters() {

    const desired =
        Math.min(
            3 + stage,
            8
        );


    while (
        monsters.length <
        desired
    ) {

        spawnMonster();
    }
}


// ==========================================
// MONSTER MOVEMENT
// ==========================================

function updateMonsters() {

    for (
        const monster of monsters
    ) {

        if (
            monster.hitFlash >
            0
        ) {

            monster.hitFlash--;
        }


        if (
            monster.frozen >
            0
        ) {

            monster.frozen--;

            continue;
        }


        const dx =
            player.x -
            monster.x;

        const dy =
            player.y -
            monster.y;


        const distance =
            Math.hypot(dx, dy);


        if (
            distance > 58
        ) {

            monster.x +=
                dx /
                distance *
                monster.speed;

            monster.y +=
                dy /
                distance *
                monster.speed;
        }
    }
}


// ==========================================
// NORMAL AUTO ATTACK
// ==========================================

function normalAttack() {

    const now =
        performance.now();


    if (
        now -
        player.lastAttack <
        player.attackCooldown
    ) {

        return;
    }


    let target = null;

    let closest =
        Infinity;


    for (
        const monster of monsters
    ) {

        const distance =
            Math.hypot(
                monster.x -
                player.x,

                monster.y -
                player.y
            );


        if (
            distance <=
            player.attackRange &&
            distance < closest
        ) {

            closest =
                distance;

            target =
                monster;
        }
    }


    if (!target)
        return;


    player.lastAttack =
        now;


    target.hp -=
        player.attack;


    target.hitFlash =
        8;


    createParticles(
        target.x,
        target.y,
        "#ffffff",
        7
    );


    addDamageText(
        target.x,
        target.y - 35,
        player.attack,
        "#ffffff"
    );


    checkMonsterDeath(
        target
    );
}


// ==========================================
// SELECT SKILL
// ==========================================

function selectSkill(name) {

    if (!skills[name])
        return;


    selectedSkill =
        name;


    updateSkillButton();


    // AUTO CLOSE PANEL

    document.getElementById(
        "skillPanel"
    ).style.display =
        "none";


    showMessage(
        skills[name].name +
        " selected!"
    );
}


// ==========================================
// USE SKILL
// ==========================================

function useSelectedSkill() {

    if (!selectedSkill) {

        showMessage(
            "⚡ Select a skill first"
        );

        return;
    }


    const skill =
        skills[selectedSkill];


    const now =
        performance.now();


    const last =
        skillLastUsed[
            selectedSkill
        ] || 0;


    if (
        now - last <
        skill.cooldown
    ) {

        const seconds =
            (
                (
                    skill.cooldown -
                    (now - last)
                ) / 1000
            ).toFixed(1);


        showMessage(
            "⏳ " +
            seconds +
            "s cooldown"
        );

        return;
    }


    skillLastUsed[
        selectedSkill
    ] = now;


    if (
        skill.type ===
        "projectile"
    ) {

        castProjectile(
            skill
        );

    } else if (
        skill.type ===
        "area"
    ) {

        castAreaSkill(
            skill
        );

    } else if (
        skill.type ===
        "lightning"
    ) {

        castLightning(
            skill
        );
    }
}


// ==========================================
// PROJECTILE SKILL
// ==========================================

function castProjectile(
    skill
) {

    let target = null;

    let closest =
        Infinity;


    for (
        const monster of monsters
    ) {

        const distance =
            Math.hypot(
                monster.x -
                player.x,

                monster.y -
                player.y
            );


        if (
            distance <
            closest
        ) {

            closest =
                distance;

            target =
                monster;
        }
    }


    if (!target) {

        showMessage(
            "No monster nearby"
        );

        return;
    }


    projectiles.push({

        x:
            player.x,

        y:
            player.y,

        target:
            target,

        speed:
            8,

        damage:
            skill.damage,

        color:
            skill.color,

        freeze:
            skill.freeze || false,

        radius:
            9
    });
}


// ==========================================
// PROJECTILES
// ==========================================

function updateProjectiles() {

    for (
        let i =
        projectiles.length - 1;

        i >= 0;

        i--
    ) {

        const p =
            projectiles[i];


        if (
            !p.target ||
            !monsters.includes(
                p.target
            )
        ) {

            projectiles.splice(
                i,
                1
            );

            continue;
        }


        const dx =
            p.target.x -
            p.x;

        const dy =
            p.target.y -
            p.y;


        const distance =
            Math.hypot(dx, dy);


        if (
            distance <
            16
        ) {

            p.target.hp -=
                p.damage;


            p.target.hitFlash =
                10;


            if (p.freeze) {

                p.target.frozen =
                    100;
            }


            createParticles(
                p.target.x,
                p.target.y,
                p.color,
                18
            );


            addDamageText(
                p.target.x,
                p.target.y - 35,
                p.damage,
                p.color
            );


            checkMonsterDeath(
                p.target
            );


            projectiles.splice(
                i,
                1
            );

            continue;
        }


        p.x +=
            dx /
            distance *
            p.speed;

        p.y +=
            dy /
            distance *
            p.speed;
    }
}


// ==========================================
// AREA SKILL
// ==========================================

function castAreaSkill(
    skill
) {

    effects.push({

        x:
            player.x,

        y:
            player.y,

        radius:
            skill.radius,

        color:
            skill.color,

        life:
            30,

        maxLife:
            30
    });


    for (
        const monster of
        [...monsters]
    ) {

        const distance =
            Math.hypot(
                monster.x -
                player.x,

                monster.y -
                player.y
            );


        if (
            distance <=
            skill.radius
        ) {

            monster.hp -=
                skill.damage;


            monster.hitFlash =
                10;


            if (skill.freeze) {

                monster.frozen =
                    130;
            }


            createParticles(
                monster.x,
                monster.y,
                skill.color,
                16
            );


            addDamageText(
                monster.x,
                monster.y - 35,
                skill.damage,
                skill.color
            );


            checkMonsterDeath(
                monster
            );
        }
    }
}


// ==========================================
// LIGHTNING
// ==========================================

function castLightning(
    skill
) {

    let target = null;

    let closest =
        Infinity;


    for (
        const monster of monsters
    ) {

        const distance =
            Math.hypot(
                monster.x -
                player.x,

                monster.y -
                player.y
            );


        if (
            distance <
            closest
        ) {

            closest =
                distance;

            target =
                monster;
        }
    }


    if (!target) {

        showMessage(
            "No monster nearby"
        );

        return;
    }


    target.hp -=
        skill.damage;


    target.hitFlash =
        15;


    effects.push({

        type:
            "lightning",

        x1:
            target.x,

        y1:
            0,

        x2:
            target.x,

        y2:
            target.y,

        color:
            skill.color,

        life:
            18,

        maxLife:
            18
    });


    createParticles(
        target.x,
        target.y,
        skill.color,
        25
    );


    addDamageText(
        target.x,
        target.y - 40,
        skill.damage,
        skill.color
    );


    checkMonsterDeath(
        target
    );
}


// ==========================================
// MONSTER DEATH
// ==========================================

function checkMonsterDeath(
    monster
) {

    if (
        monster.hp > 0
    ) {

        return;
    }


    const index =
        monsters.indexOf(
            monster
        );


    if (
        index === -1
    ) {

        return;
    }


    monsters.splice(
        index,
        1
    );


    player.coins +=
        5 +
        stage;


    player.xp +=
        15 +
        stage * 2;


    killsThisStage++;


    createParticles(
        monster.x,
        monster.y,
        monster.color,
        25
    );


    checkLevelUp();


    if (
        killsThisStage >=
        stageGoal
    ) {

        stage++;

        killsThisStage = 0;

        stageGoal =
            7 +
            stage * 3;


        showMessage(
            "🏆 STAGE " +
            stage +
            "!"
        );
    }
}


// ==========================================
// LEVEL UP
// ==========================================

function checkLevelUp() {

    const required =
        player.level *
        100;


    if (
        player.xp >=
        required
    ) {

        player.xp -=
            required;

        player.level++;

        player.maxHp +=
            15;

        player.hp =
            player.maxHp;

        player.attack +=
            4;


        showMessage(
            "⭐ LEVEL " +
            player.level +
            "!"
        );
    }
}


// ==========================================
// PARTICLES
// ==========================================

function createParticles(
    x,
    y,
    color,
    amount
) {

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI *
            2;


        const speed =
            1 +
            Math.random() *
            4;


        particles.push({

            x:
                x,

            y:
                y,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            life:
                20 +
                Math.random() *
                20,

            color:
                color
        });
    }
}


function updateParticles() {

    for (
        let i =
        particles.length - 1;

        i >= 0;

        i--
    ) {

        const p =
            particles[i];


        p.x += p.vx;

        p.y += p.vy;

        p.vx *= 0.96;

        p.vy *= 0.96;

        p.life--;


        if (
            p.life <= 0
        ) {

            particles.splice(
                i,
                1
            );
        }
    }
}


// ==========================================
// DAMAGE TEXT
// ==========================================

function addDamageText(
    x,
    y,
    damage,
    color
) {

    damageTexts.push({

        x:
            x,

        y:
            y,

        text:
            "-" + damage,

        color:
            color,

        life:
            35
    });
}


function updateDamageTexts() {

    for (
        let i =
        damageTexts.length - 1;

        i >= 0;

        i--
    ) {

        const d =
            damageTexts[i];


        d.y -=
            0.6;

        d.life--;


        if (
            d.life <= 0
        ) {

            damageTexts.splice(
                i,
                1
            );
        }
    }
}


// ==========================================
// EFFECTS
// ==========================================

function updateEffects() {

    for (
        let i =
        effects.length - 1;

        i >= 0;

        i--
    ) {

        effects[i].life--;


        if (
            effects[i].life <= 0
        ) {

            effects.splice(
                i,
                1
            );
        }
    }
}


// ==========================================
// BACKGROUND
// ==========================================

function drawBackground() {

    // Grass

    ctx.fillStyle =
        "#24452d";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    // Ground patches

    for (
        let i = 0;
        i < 80;
        i++
    ) {

        const x =
            (i * 97) % W;

        const y =
            90 +
            (i * 53) %
            Math.max(
                100,
                H - 120
            );


        ctx.fillStyle =
            i % 2 === 0
                ? "rgba(50,100,55,0.35)"
                : "rgba(20,70,35,0.3)";


        ctx.beginPath();

        ctx.arc(
            x,
            y,
            18 +
            (i % 5) * 4,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    // Grid/path

    ctx.strokeStyle =
        "rgba(255,255,255,0.025)";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x < W;
        x += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 90);

        ctx.lineTo(
            x,
            H
        );

        ctx.stroke();
    }


    for (
        let y = 100;
        y < H;
        y += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(
            W,
            y
        );

        ctx.stroke();
    }


    // Trees

    drawTree(
        55,
        145
    );

    drawTree(
        W - 55,
        180
    );

    drawTree(
        75,
        H - 120
    );

    drawTree(
        W - 70,
        H - 150
    );


    // Rocks

    drawRock(
        W * 0.22,
        H * 0.45
    );

    drawRock(
        W * 0.78,
        H * 0.62
    );
}


function drawTree(
    x,
    y
) {

    // trunk

    ctx.fillStyle =
        "#633d25";

    ctx.fillRect(
        x - 6,
        y,
        12,
        28
    );


    // leaves

    ctx.fillStyle =
        "#166534";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 5,
        25,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#15803d";

    ctx.beginPath();

    ctx.arc(
        x - 15,
        y + 5,
        18,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 15,
        y + 5,
        18,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


function drawRock(
    x,
    y
) {

    ctx.fillStyle =
        "#53636a";

    ctx.beginPath();

    ctx.ellipse(
        x,
        y,
        22,
        13,
        -0.15,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// ==========================================
// DRAW PLAYER
// ==========================================

function drawPlayer() {

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );


    // Shadow

    ctx.fillStyle =
        "rgba(0,0,0,0.35)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        27,
        25,
        9,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Cape

    ctx.fillStyle =
        "#312e81";

    ctx.beginPath();

    ctx.moveTo(
        -17,
        -2
    );

    ctx.lineTo(
        -22,
        28
    );

    ctx.lineTo(
        0,
        22
    );

    ctx.lineTo(
        22,
        28
    );

    ctx.lineTo(
        17,
        -2
    );

    ctx.closePath();

    ctx.fill();


    // Body

    ctx.fillStyle =
        "#2563eb";

    ctx.fillRect(
        -15,
        -4,
        30,
        29
    );


    // Head

    ctx.fillStyle =
        "#f2c6a5";

    ctx.beginPath();

    ctx.arc(
        0,
        -20,
        15,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Hair

    ctx.fillStyle =
        "#292524";

    ctx.beginPath();

    ctx.arc(
        0,
        -25,
        15,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    // Eyes

    ctx.fillStyle =
        "#111827";

    ctx.beginPath();

    ctx.arc(
        -5,
        -20,
        2,
        0,
        Math.PI * 2
    );

    ctx.arc(
        5,
        -20,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Sword

    const swordX =
        player.facingX * 30;

    const swordY =
        player.facingY * 30;


    ctx.strokeStyle =
        "#e5e7eb";

    ctx.lineWidth = 5;

    ctx.lineCap =
        "round";


    ctx.beginPath();

    ctx.moveTo(
        player.facingX * 9,
        player.facingY * 9
    );

    ctx.lineTo(
        swordX,
        swordY
    );

    ctx.stroke();


    ctx.restore();
}


// ==========================================
// DRAW MONSTER
// ==========================================

function drawMonster(
    monster
) {

    ctx.save();

    ctx.translate(
        monster.x,
        monster.y
    );


    // Shadow

    ctx.fillStyle =
        "rgba(0,0,0,0.35)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        monster.radius + 6,
        monster.radius,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Body

    ctx.fillStyle =
        monster.hitFlash > 0
            ? "#ffffff"
            : monster.color;


    ctx.beginPath();

    ctx.arc(
        0,
        0,
        monster.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Horns

    ctx.fillStyle =
        "#4c1d1d";


    ctx.beginPath();

    ctx.moveTo(
        -monster.radius * 0.55,
        -monster.radius * 0.55
    );

    ctx.lineTo(
        -monster.radius,
        -monster.radius * 1.4
    );

    ctx.lineTo(
        -monster.radius * 0.15,
        -monster.radius * 0.8
    );

    ctx.fill();


    ctx.beginPath();

    ctx.moveTo(
        monster.radius * 0.55,
        -monster.radius * 0.55
    );

    ctx.lineTo(
        monster.radius,
        -monster.radius * 1.4
    );

    ctx.lineTo(
        monster.radius * 0.15,
        -monster.radius * 0.8
    );

    ctx.fill();


    // Eyes

    ctx.fillStyle =
        "#fff";


    ctx.beginPath();

    ctx.arc(
        -7,
        -4,
        5,
        0,
        Math.PI * 2
    );

    ctx.arc(
        7,
        -4,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#111";


    ctx.beginPath();

    ctx.arc(
        -7,
        -4,
        2,
        0,
        Math.PI * 2
    );

    ctx.arc(
        7,
        -4,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // HP bar

    const barWidth =
        monster.radius * 2.4;


    ctx.fillStyle =
        "rgba(0,0,0,0.7)";

    ctx.fillRect(
        -barWidth / 2,
        -monster.radius - 16,
        barWidth,
        6
    );


    ctx.fillStyle =
        "#22c55e";

    ctx.fillRect(
        -barWidth / 2,
        -monster.radius - 16,
        barWidth *
        Math.max(
            0,
            monster.hp /
            monster.maxHp
        ),
        6
    );


    // Frozen effect

    if (
        monster.frozen >
        0
    ) {

        ctx.strokeStyle =
            "#bae6fd";

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            monster.radius + 6,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    }


    ctx.restore();
}


// ==========================================
// DRAW PROJECTILES
// ==========================================

function drawProjectiles() {

    for (
        const p of projectiles
    ) {

        ctx.save();

        ctx.shadowBlur = 18;

        ctx.shadowColor =
            p.color;

        ctx.fillStyle =
            p.color;


        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.restore();
    }
}


// ==========================================
// DRAW PARTICLES
// ==========================================

function drawParticles() {

    for (
        const p of particles
    ) {

        ctx.globalAlpha =
            Math.max(
                0,
                p.life / 40
            );

        ctx.fillStyle =
            p.color;


        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    ctx.globalAlpha = 1;
}


// ==========================================
// DRAW EFFECTS
// ==========================================

function drawEffects() {

    for (
        const e of effects
    ) {

        if (
            e.type ===
            "lightning"
        ) {

            ctx.save();

            ctx.strokeStyle =
                e.color;

            ctx.lineWidth = 5;

            ctx.shadowBlur =
                20;

            ctx.shadowColor =
                e.color;


            ctx.beginPath();

            ctx.moveTo(
                e.x1,
                e.y1
            );


            const segments =
                8;


            for (
                let i = 1;
                i <= segments;
                i++
            ) {

                const t =
                    i / segments;


                const x =
                    e.x1 +
                    (
                        e.x2 -
                        e.x1
                    ) * t;


                const y =
                    e.y1 +
                    (
                        e.y2 -
                        e.y1
                    ) * t;


                const offset =
                    i === segments
                        ? 0
                        : (
                            Math.random() -
                            0.5
                        ) * 35;


                ctx.lineTo(
                    x + offset,
                    y
                );
            }


            ctx.stroke();

            ctx.restore();

            continue;
        }


        const progress =
            1 -
            e.life /
            e.maxLife;


        ctx.save();

        ctx.globalAlpha =
            1 - progress;

        ctx.strokeStyle =
            e.color;

        ctx.lineWidth = 8;


        ctx.beginPath();

        ctx.arc(
            e.x,
            e.y,
            e.radius *
            progress,
            0,
            Math.PI * 2
        );

        ctx.stroke();

        ctx.restore();
    }
}


// ==========================================
// DRAW DAMAGE TEXT
// ==========================================

function drawDamageTexts() {

    for (
        const d of damageTexts
    ) {

        ctx.globalAlpha =
            d.life / 35;

        ctx.fillStyle =
            d.color;

        ctx.font =
            "bold 16px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            d.text,
            d.x,
            d.y
        );
    }


    ctx.globalAlpha = 1;
}


// ==========================================
// DRAW JOYSTICK
// ==========================================

function drawJoystick() {

    if (
        !joystick.active
    ) {

        return;
    }


    ctx.save();


    ctx.globalAlpha =
        0.8;


    // Outer

    ctx.fillStyle =
        "rgba(255,255,255,0.12)";


    ctx.beginPath();

    ctx.arc(
        joystick.baseX,
        joystick.baseY,
        joystick.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Inner

    ctx.fillStyle =
        "rgba(255,255,255,0.35)";


    ctx.beginPath();

    ctx.arc(

        joystick.baseX +
        joystick.x *
        joystick.radius,

        joystick.baseY +
        joystick.y *
        joystick.radius,

        25,

        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.restore();
}


// ==========================================
// HUD
// ==========================================

function updateHUD() {

    document.getElementById(
        "level"
    ).textContent =
        player.level;


    document.getElementById(
        "coins"
    ).textContent =
        player.coins;


    document.getElementById(
        "stage"
    ).textContent =
        stage;


    document.getElementById(
        "hpBar"
    ).style.width =
        (
            player.hp /
            player.maxHp *
            100
        ) + "%";


    document.getElementById(
        "xpBar"
    ).style.width =
        (
            player.xp /
            (
                player.level *
                100
            ) *
            100
        ) + "%";
}


// ==========================================
// SKILL BUTTON
// ==========================================

function updateSkillButton() {

    const button =
        document.getElementById(
            "useSkill"
        );


    if (!selectedSkill) {

        button.textContent =
            "⚡ Select Skill";

        return;
    }


    button.textContent =
        skills[
            selectedSkill
        ].name;
}


// ==========================================
// MESSAGE
// ==========================================

let messageTimer = null;


function showMessage(
    text
) {

    const message =
        document.getElementById(
            "message"
        );


    message.textContent =
        text;


    message.style.opacity =
        "1";


    clearTimeout(
        messageTimer
    );


    messageTimer =
        setTimeout(
            function() {

                message.style.opacity =
                    "0";

            },
            1200
        );
}


// ==========================================
// SKILL UI
// ==========================================

document.getElementById(
    "skillsButton"
).addEventListener(
    "click",
    function() {

        document.getElementById(
            "skillPanel"
        ).style.display =
            "block";
    }
);


document.getElementById(
    "closeSkill"
).addEventListener(
    "click",
    function() {

        document.getElementById(
            "skillPanel"
        ).style.display =
            "none";
    }
);


document.querySelectorAll(
    ".skill-button"
).forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                selectSkill(
                    button.dataset.skill
                );
            }
        );
    }
);


document.getElementById(
    "useSkill"
).addEventListener(
    "click",
    function() {

        useSelectedSkill();
    }
);


// ==========================================
// GAME LOOP
// ==========================================

function gameLoop() {

    // UPDATE

    updatePlayer();

    updateMonsters();

    normalAttack();

    updateProjectiles();

    updateParticles();

    updateEffects();

    updateDamageTexts();

    maintainMonsters();


    // DRAW

    drawBackground();

    drawEffects();

    drawProjectiles();

    drawParticles();

    drawDamageTexts();


    for (
        const monster of monsters
    ) {

        drawMonster(
            monster
        );
    }


    drawPlayer();

    drawJoystick();


    // HUD

    updateHUD();


    requestAnimationFrame(
        gameLoop
    );
}


// ==========================================
// START GAME
// ==========================================

for (
    let i = 0;
    i < 4;
    i++
) {

    spawnMonster();
}


updateSkillButton();

updateHUD();

gameLoop();
