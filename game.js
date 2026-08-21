// ========================================
// TELEGRAM
// ========================================

if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
}


// ========================================
// CANVAS
// ========================================

const canvas = document.getElementById("game");

const ctx = canvas.getContext("2d");


// ========================================
// RESIZE
// ========================================

function resize() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

resize();

window.addEventListener(
    "resize",
    resize
);


// ========================================
// PLAYER
// ========================================

const player = {

    x: window.innerWidth / 2,

    y: window.innerHeight / 2,

    radius: 20,

    speed: 4,

    hp: 100,

    maxHp: 100,

    attack: 20,

    level: 1,

    xp: 0,

    xpNeeded: 100,

    coins: 0,

    skillPoints: 0,

    critical: 0.05,

    stage: 1
};


// ========================================
// MONSTERS
// ========================================

let monsters = [];

let kills = 0;

let stageTarget = 10;

let lastSpawn = 0;

let lastAttack = 0;


// ========================================
// JOYSTICK
// ========================================

const joystick = {

    active: false,

    startX: 0,

    startY: 0,

    x: 0,

    y: 0,

    max: 60
};


// ========================================
// TOUCH
// ========================================

canvas.addEventListener(
    "pointerdown",
    function(e) {

        joystick.active = true;

        joystick.startX = e.clientX;

        joystick.startY = e.clientY;

        joystick.x = 0;

        joystick.y = 0;

    }
);


canvas.addEventListener(
    "pointermove",
    function(e) {

        if (!joystick.active) {
            return;
        }

        let dx =
            e.clientX -
            joystick.startX;

        let dy =
            e.clientY -
            joystick.startY;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance >
            joystick.max
        ) {

            dx =
                dx /
                distance *
                joystick.max;

            dy =
                dy /
                distance *
                joystick.max;

        }


        joystick.x =
            dx /
            joystick.max;

        joystick.y =
            dy /
            joystick.max;

    }
);


canvas.addEventListener(
    "pointerup",
    function() {

        joystick.active = false;

        joystick.x = 0;

        joystick.y = 0;

    }
);


// ========================================
// CREATE MONSTER
// ========================================

function createMonster() {

    const side =
        Math.floor(
            Math.random() * 4
        );


    let x;
    let y;


    if (side === 0) {

        x =
            Math.random() *
            canvas.width;

        y = 100;

    }

    else if (side === 1) {

        x =
            Math.random() *
            canvas.width;

        y =
            canvas.height - 20;

    }

    else if (side === 2) {

        x = 20;

        y =
            100 +
            Math.random() *
            (
                canvas.height -
                120
            );

    }

    else {

        x =
            canvas.width - 20;

        y =
            100 +
            Math.random() *
            (
                canvas.height -
                120
            );

    }


    monsters.push({

        x: x,

        y: y,

        radius: 18,

        hp:
            50 +
            player.stage * 20,

        maxHp:
            50 +
            player.stage * 20,

        speed:
            0.8 +
            player.stage * 0.05,

        attack:
            5 +
            player.stage * 2,

        xp:
            20 +
            player.stage * 5,

        coins:
            5 +
            player.stage * 2

    });
}


// ========================================
// DRAW PLAYER
// ========================================

function drawPlayer() {

    ctx.fillStyle =
        "#3498db";

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        player.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // eyes

    ctx.fillStyle =
        "white";


    ctx.beginPath();

    ctx.arc(
        player.x - 6,
        player.y - 4,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        player.x + 6,
        player.y - 4,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// ========================================
// DRAW MONSTER
// ========================================

function drawMonster(
    monster
) {

    ctx.fillStyle =
        "#e74c3c";


    ctx.beginPath();

    ctx.arc(
        monster.x,
        monster.y,
        monster.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // eyes

    ctx.fillStyle =
        "white";


    ctx.beginPath();

    ctx.arc(
        monster.x - 5,
        monster.y - 3,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        monster.x + 5,
        monster.y - 3,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // HP bar

    const width = 40;

    const hp =
        monster.hp /
        monster.maxHp;


    ctx.fillStyle =
        "#333";

    ctx.fillRect(
        monster.x - 20,
        monster.y - 30,
        width,
        5
    );


    ctx.fillStyle =
        "#2ecc71";

    ctx.fillRect(
        monster.x - 20,
        monster.y - 30,
        width * hp,
        5
    );
}


// ========================================
// DRAW BACKGROUND
// ========================================

function drawBackground() {

    ctx.fillStyle =
        "#243b2a";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // grid

    ctx.strokeStyle =
        "rgba(255,255,255,.05)";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x < canvas.width;
        x += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            canvas.height
        );

        ctx.stroke();
    }


    for (
        let y = 0;
        y < canvas.height;
        y += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();
    }
}


// ========================================
// DRAW JOYSTICK
// ========================================

function drawJoystick() {

    if (!joystick.active) {
        return;
    }


    ctx.fillStyle =
        "rgba(255,255,255,.12)";


    ctx.beginPath();

    ctx.arc(
        joystick.startX,
        joystick.startY,
        joystick.max,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "rgba(255,255,255,.45)";


    ctx.beginPath();

    ctx.arc(
        joystick.startX +
        joystick.x *
        joystick.max,

        joystick.startY +
        joystick.y *
        joystick.max,

        25,

        0,
        Math.PI * 2
    );

    ctx.fill();
}


// ========================================
// MOVE PLAYER
// ========================================

function movePlayer() {

    player.x +=
        joystick.x *
        player.speed;

    player.y +=
        joystick.y *
        player.speed;


    // boundaries

    player.x =
        Math.max(
            player.radius,
            Math.min(
                canvas.width -
                player.radius,

                player.x
            )
        );


    player.y =
        Math.max(
            100 +
            player.radius,

            Math.min(
                canvas.height -
                player.radius,

                player.y
            )
        );
}


// ========================================
// MONSTER AI
// ========================================

function updateMonsters() {

    for (
        const monster of monsters
    ) {

        const dx =
            player.x -
            monster.x;

        const dy =
            player.y -
            monster.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance > 45
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


// ========================================
// ATTACK
// ========================================

function attackMonsters(
    now
) {

    if (
        now -
        lastAttack <
        600
    ) {

        return;
    }


    lastAttack = now;


    let target = null;

    let targetDistance =
        Infinity;


    for (
        const monster of monsters
    ) {

        const dx =
            player.x -
            monster.x;

        const dy =
            player.y -
            monster.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <
            150 &&
            distance <
            targetDistance
        ) {

            target =
                monster;

            targetDistance =
                distance;
        }
    }


    if (!target) {
        return;
    }


    let damage =
        player.attack;


    if (
        Math.random() <
        player.critical
    ) {

        damage *= 2;

        showMessage(
            "CRITICAL! 💥"
        );
    }


    target.hp -=
        damage;


    if (
        target.hp <= 0
    ) {

        killMonster(
            target
        );
    }
}


// ========================================
// KILL
// ========================================

function killMonster(
    monster
) {

    const index =
        monsters.indexOf(
            monster
        );


    if (index === -1) {
        return;
    }


    monsters.splice(
        index,
        1
    );


    kills++;


    player.coins +=
        monster.coins;


    addXP(
        monster.xp
    );


    if (
        kills >=
        stageTarget
    ) {

        nextStage();

    }


    updateHUD();
}


// ========================================
// XP
// ========================================

function addXP(
    amount
) {

    player.xp +=
        amount;


    while (
        player.xp >=
        player.xpNeeded
    ) {

        player.xp -=
            player.xpNeeded;

        player.level++;

        player.skillPoints++;

        player.attack += 5;

        player.maxHp += 15;

        player.hp =
            player.maxHp;

        player.xpNeeded =
            Math.floor(
                player.xpNeeded *
                1.25
            );


        showMessage(
            "LEVEL UP! 🎉"
        );
    }
}


// ========================================
// NEXT STAGE
// ========================================

function nextStage() {

    player.stage++;

    kills = 0;

    stageTarget =
        10 +
        player.stage * 3;


    showMessage(
        "STAGE " +
        player.stage
    );


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        createMonster();
    }


    updateHUD();
}


// ========================================
// HUD
// ========================================

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
        player.stage;


    document.getElementById(
        "points"
    ).textContent =
        player.skillPoints;


    document.getElementById(
        "hp"
    ).style.width =
        (
            player.hp /
            player.maxHp *
            100
        ) +
        "%";


    document.getElementById(
        "xp"
    ).style.width =
        (
            player.xp /
            player.xpNeeded *
            100
        ) +
        "%";
}


// ========================================
// SKILLS
// ========================================

function upgrade(
    skill
) {

    if (
        player.skillPoints <= 0
    ) {

        showMessage(
            "No Skill Points"
        );

        return;
    }


    player.skillPoints--;


    if (
        skill ===
        "attack"
    ) {

        player.attack += 10;
    }


    if (
        skill ===
        "speed"
    ) {

        player.speed += 1;
    }


    if (
        skill ===
        "critical"
    ) {

        player.critical += 0.05;
    }


    updateHUD();

    showMessage(
        "Skill Upgraded! ⚡"
    );
}


// ========================================
// SKILL UI
// ========================================

document
    .getElementById(
        "skills"
    )
    .onclick = function() {

        document.getElementById(
            "skillPanel"
        ).style.display =
            "block";

    };


function closeSkills() {

    document.getElementById(
        "skillPanel"
    ).style.display =
        "none";
}


// ========================================
// MESSAGE
// ========================================

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
        window.msgTimer
    );


    window.msgTimer =
        setTimeout(
            function() {

                element.style.opacity =
                    "0";

            },
            1000
        );
}


// ========================================
// GAME LOOP
// ========================================

function gameLoop(
    timestamp
) {

    drawBackground();

    movePlayer();

    updateMonsters();

    attackMonsters(
        timestamp
    );


    for (
        const monster of monsters
    ) {

        drawMonster(
            monster
        );
    }


    drawPlayer();

    drawJoystick();


    // Spawn

    if (
        timestamp -
        lastSpawn >
        1800
    ) {

        lastSpawn =
            timestamp;

        if (
            monsters.length <
            8
        ) {

            createMonster();
        }
    }


    requestAnimationFrame(
        gameLoop
    );
}


// ========================================
// START GAME
// ========================================

createMonster();

createMonster();

createMonster();

updateHUD();

requestAnimationFrame(
    gameLoop
);
