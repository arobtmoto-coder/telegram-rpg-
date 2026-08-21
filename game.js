const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (!player.x) {
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
    }
}

window.addEventListener("resize", resize);


// ==========================
// PLAYER
// ==========================

const player = {
    x: 0,
    y: 0,

    speed: 3.5,

    hp: 100,
    maxHP: 100,

    level: 1,
    xp: 0,
    coins: 0,

    attack: 15,

    directionX: 1,
    directionY: 0
};

resize();


// ==========================
// MONSTERS
// ==========================

let monsters = [];

function createMonster() {

    const monster = {

        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,

        hp: 60,
        maxHP: 60,

        speed: 0.7,

        size: 25,

        hitFlash: 0
    };

    // Monster player ke bilkul upar spawn na ho
    const distance = Math.hypot(
        monster.x - player.x,
        monster.y - player.y
    );

    if (distance < 180) {
        monster.x += 220;
    }

    monsters.push(monster);
}


// Start with 4 monsters

for (let i = 0; i < 4; i++) {
    createMonster();
}


// ==========================
// JOYSTICK
// ==========================

const joystick = {

    active: false,

    startX: 0,
    startY: 0,

    x: 0,
    y: 0,

    radius: 60
};


canvas.addEventListener("pointerdown", function(e) {

    joystick.active = true;

    joystick.startX = e.clientX;
    joystick.startY = e.clientY;

    joystick.x = 0;
    joystick.y = 0;

});


canvas.addEventListener("pointermove", function(e) {

    if (!joystick.active) return;

    let dx = e.clientX - joystick.startX;
    let dy = e.clientY - joystick.startY;

    const distance = Math.hypot(dx, dy);

    if (distance > joystick.radius) {

        dx =
            dx / distance *
            joystick.radius;

        dy =
            dy / distance *
            joystick.radius;
    }

    joystick.x =
        dx / joystick.radius;

    joystick.y =
        dy / joystick.radius;

});


function stopJoystick() {

    joystick.active = false;

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


// ==========================
// PLAYER MOVEMENT
// ==========================

function movePlayer() {

    if (!joystick.active) return;


    player.x +=
        joystick.x *
        player.speed;

    player.y +=
        joystick.y *
        player.speed;


    // Direction

    if (
        Math.abs(joystick.x) > 0.1 ||
        Math.abs(joystick.y) > 0.1
    ) {

        player.directionX =
            joystick.x;

        player.directionY =
            joystick.y;
    }


    // Keep player inside screen

    player.x = Math.max(
        30,
        Math.min(
            canvas.width - 30,
            player.x
        )
    );

    player.y = Math.max(
        90,
        Math.min(
            canvas.height - 30,
            player.y
        )
    );
}


// ==========================
// MONSTER MOVEMENT
// ==========================

function moveMonsters() {

    monsters.forEach(monster => {

        const dx =
            player.x - monster.x;

        const dy =
            player.y - monster.y;

        const distance =
            Math.hypot(dx, dy);


        // Monster player ke paas aayega

        if (distance > 55) {

            monster.x +=
                dx / distance *
                monster.speed;

            monster.y +=
                dy / distance *
                monster.speed;
        }


        // Hit flash

        if (monster.hitFlash > 0) {
            monster.hitFlash--;
        }

    });
}


// ==========================
// PLAYER DRAW
// ==========================

function drawPlayer() {

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );


    // Shadow

    ctx.fillStyle =
        "rgba(0,0,0,0.4)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        25,
        30,
        10,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Body

    ctx.fillStyle =
        "#2563eb";

    ctx.fillRect(
        -18,
        -5,
        36,
        35
    );


    // Head

    ctx.fillStyle =
        "#f2c6a5";

    ctx.beginPath();

    ctx.arc(
        0,
        -22,
        16,
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
        -27,
        16,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    // Eyes

    ctx.fillStyle =
        "#111";

    ctx.beginPath();

    ctx.arc(
        -6,
        -22,
        2,
        0,
        Math.PI * 2
    );

    ctx.arc(
        6,
        -22,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Sword

    ctx.strokeStyle =
        "#fff";

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(
        player.directionX * 12,
        player.directionY * 12
    );

    ctx.lineTo(
        player.directionX * 42,
        player.directionY * 42
    );

    ctx.stroke();


    ctx.restore();
}


// ==========================
// MONSTER DRAW
// ==========================

function drawMonster(monster) {

    ctx.save();

    ctx.translate(
        monster.x,
        monster.y
    );


    // Shadow

    ctx.fillStyle =
        "rgba(0,0,0,0.4)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        27,
        30,
        10,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Body

    ctx.fillStyle =
        monster.hitFlash > 0
            ? "#ffffff"
            : "#ef4444";

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        monster.size,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Horn 1

    ctx.fillStyle =
        "#7f1d1d";

    ctx.beginPath();

    ctx.moveTo(-15, -15);
    ctx.lineTo(-25, -38);
    ctx.lineTo(-5, -25);

    ctx.fill();


    // Horn 2

    ctx.beginPath();

    ctx.moveTo(15, -15);
    ctx.lineTo(25, -38);
    ctx.lineTo(5, -25);

    ctx.fill();


    // Eyes

    ctx.fillStyle =
        "#ffffff";

    ctx.beginPath();

    ctx.arc(
        -8,
        -4,
        5,
        0,
        Math.PI * 2
    );

    ctx.arc(
        8,
        -4,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // HP background

    ctx.fillStyle =
        "#111";

    ctx.fillRect(
        -30,
        -48,
        60,
        6
    );


    // HP

    ctx.fillStyle =
        "#22c55e";

    ctx.fillRect(
        -30,
        -48,
        60 *
        Math.max(
            0,
            monster.hp /
            monster.maxHP
        ),
        6
    );


    ctx.restore();
}


// ==========================
// NORMAL ATTACK
// ==========================

let lastAttack = 0;

function normalAttack() {

    const now = Date.now();

    if (now - lastAttack < 700) {
        return;
    }


    let target = null;

    let closest = Infinity;


    monsters.forEach(monster => {

        const distance =
            Math.hypot(
                monster.x - player.x,
                monster.y - player.y
            );


        if (
            distance < 100 &&
            distance < closest
        ) {

            closest = distance;
            target = monster;
        }

    });


    if (!target) return;


    lastAttack = now;


    target.hp -= player.attack;

    target.hitFlash = 8;


    if (target.hp <= 0) {

        killMonster(target);
    }
}


// ==========================
// KILL MONSTER
// ==========================

function killMonster(monster) {

    const index =
        monsters.indexOf(monster);

    if (index === -1) return;


    monsters.splice(
        index,
        1
    );


    player.coins += 5;

    player.xp += 15;


    // Level up

    const requiredXP =
        player.level * 100;


    if (
        player.xp >=
        requiredXP
    ) {

        player.xp -=
            requiredXP;

        player.level++;

        player.attack += 3;

        player.maxHP += 10;

        player.hp =
            player.maxHP;

        showMessage(
            "🎉 LEVEL " +
            player.level
        );
    }


    // New monster

    setTimeout(
        createMonster,
        500
    );
}


// ==========================
// JOYSTICK DRAW
// ==========================

function drawJoystick() {

    if (!joystick.active) return;


    ctx.save();


    // Outer circle

    ctx.fillStyle =
        "rgba(255,255,255,0.12)";

    ctx.beginPath();

    ctx.arc(
        joystick.startX,
        joystick.startY,
        60,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Inner circle

    ctx.fillStyle =
        "rgba(255,255,255,0.35)";

    ctx.beginPath();

    ctx.arc(
        joystick.startX +
        joystick.x * 60,

        joystick.startY +
        joystick.y * 60,

        25,

        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.restore();
}


// ==========================
// MESSAGE
// ==========================

let messageTimer;

function showMessage(text) {

    const message =
        document.getElementById(
            "message"
        );

    if (!message) return;


    message.innerText =
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


// ==========================
// HUD
// ==========================

function updateHUD() {

    const level =
        document.getElementById(
            "level"
        );

    const coins =
        document.getElementById(
            "coins"
        );

    const hpBar =
        document.getElementById(
            "hpBar"
        );

    const xpBar =
        document.getElementById(
            "xpBar"
        );


    if (level) {
        level.innerText =
            player.level;
    }

    if (coins) {
        coins.innerText =
            player.coins;
    }

    if (hpBar) {

        hpBar.style.width =
            (
                player.hp /
                player.maxHP *
                100
            ) + "%";
    }


    if (xpBar) {

        xpBar.style.width =
            (
                player.xp /
                (player.level * 100) *
                100
            ) + "%";
    }
}


// ==========================
// GAME LOOP
// ==========================

function gameLoop() {

    // Background

    ctx.fillStyle =
        "#18252d";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Ground grid

    ctx.strokeStyle =
        "rgba(255,255,255,0.04)";

    for (
        let x = 0;
        x < canvas.width;
        x += 45
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);

        ctx.stroke();
    }


    for (
        let y = 0;
        y < canvas.height;
        y += 45
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);

        ctx.stroke();
    }


    // GAME UPDATE

    movePlayer();

    moveMonsters();

    normalAttack();


    // DRAW

    monsters.forEach(
        drawMonster
    );

    drawPlayer();

    drawJoystick();

    updateHUD();


    requestAnimationFrame(
        gameLoop
    );
}


gameLoop();
