// ===============================
// TELEGRAM
// ===============================

if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
}


// ===============================
// CANVAS
// ===============================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


// ===============================
// PLAYER
// ===============================

const player = {
    x: 0,
    y: 0,

    radius: 22,

    level: 1,
    xp: 0,

    maxHP: 100,
    hp: 100,

    coins: 0,

    speed: 3.2,
    attack: 15,

    directionX: 1,
    directionY: 0
};

player.x = canvas.width / 2;
player.y = canvas.height / 2;


// ===============================
// GAME DATA
// ===============================

let monsters = [];

let particles = [];

let projectiles = [];

let selectedSkill = null;

let stage = 1;

let kills = 0;

let stageTarget = 10;

let joystick = {
    active: false,
    x: 0,
    y: 0,
    startX: 0,
    startY: 0
};


// ===============================
// SKILLS
// ===============================

const skills = {

    fireball: {
        name: "🔥 Fireball",
        damage: 25,
        cooldown: 700,
        lastUsed: 0,
        color: "#ff5a36"
    },

    flamewave: {
        name: "🔥 Flame Wave",
        damage: 40,
        cooldown: 1800,
        lastUsed: 0,
        color: "#ff7a00"
    },

    meteor: {
        name: "☄️ Meteor",
        damage: 100,
        cooldown: 4000,
        lastUsed: 0,
        color: "#ff2200",
        requiredLevel: 10
    },

    waterbolt: {
        name: "💧 Water Bolt",
        damage: 25,
        cooldown: 900,
        lastUsed: 0,
        color: "#38bdf8"
    },

    tsunami: {
        name: "🌊 Tsunami",
        damage: 70,
        cooldown: 3500,
        lastUsed: 0,
        color: "#0284c7",
        requiredLevel: 10
    },

    iceshard: {
        name: "❄️ Ice Shard",
        damage: 30,
        cooldown: 1000,
        lastUsed: 0,
        color: "#7dd3fc"
    },

    blizzard: {
        name: "🌨️ Blizzard",
        damage: 80,
        cooldown: 4000,
        lastUsed: 0,
        color: "#bae6fd",
        requiredLevel: 15
    },

    thunder: {
        name: "⚡ Thunder Bolt",
        damage: 35,
        cooldown: 1200,
        lastUsed: 0,
        color: "#fde047"
    }

};


// ===============================
// MONSTERS
// ===============================

function createMonster() {

    const side = Math.floor(Math.random() * 4);

    let x;
    let y;

    if (side === 0) {
        x = -40;
        y = Math.random() * canvas.height;
    }

    if (side === 1) {
        x = canvas.width + 40;
        y = Math.random() * canvas.height;
    }

    if (side === 2) {
        x = Math.random() * canvas.width;
        y = -40;
    }

    if (side === 3) {
        x = Math.random() * canvas.width;
        y = canvas.height + 40;
    }

    const types = [
        {
            name: "Goblin",
            color: "#ef4444",
            hp: 45,
            speed: 0.65,
            size: 19
        },
        {
            name: "Slime",
            color: "#22c55e",
            hp: 60,
            speed: 0.45,
            size: 22
        },
        {
            name: "Demon",
            color: "#a855f7",
            hp: 80,
            speed: 0.35,
            size: 23
        }
    ];

    const type = types[Math.floor(Math.random() * types.length)];

    monsters.push({
        x,
        y,

        hp: type.hp + stage * 5,
        maxHP: type.hp + stage * 5,

        speed: type.speed,

        size: type.size,

        color: type.color,

        name: type.name,

        hitFlash: 0
    });
}


// ===============================
// INITIAL MONSTERS
// ===============================

for (let i = 0; i < 5; i++) {
    createMonster();
}


// ===============================
// PLAYER DRAW
// ===============================

function drawPlayer() {

    ctx.save();

    ctx.translate(player.x, player.y);

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";

    ctx.beginPath();
    ctx.ellipse(0, 15, 25, 9, 0, 0, Math.PI * 2);
    ctx.fill();


    // body
    ctx.fillStyle = "#2563eb";

    ctx.beginPath();
    ctx.roundRect(-15, -4, 30, 28, 8);
    ctx.fill();


    // head
    ctx.fillStyle = "#f1c7a5";

    ctx.beginPath();
    ctx.arc(0, -17, 14, 0, Math.PI * 2);
    ctx.fill();


    // hair
    ctx.fillStyle = "#292524";

    ctx.beginPath();
    ctx.arc(0, -22, 14, Math.PI, Math.PI * 2);
    ctx.fill();


    // eyes
    ctx.fillStyle = "#111";

    ctx.beginPath();
    ctx.arc(-5, -17, 2, 0, Math.PI * 2);
    ctx.arc(5, -17, 2, 0, Math.PI * 2);
    ctx.fill();


    // sword
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(
        player.directionX * 12,
        player.directionY * 12
    );

    ctx.lineTo(
        player.directionX * 38,
        player.directionY * 38
    );

    ctx.stroke();


    ctx.restore();
}


// ===============================
// MONSTER DRAW
// ===============================

function drawMonster(monster) {

    ctx.save();

    ctx.translate(monster.x, monster.y);


    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";

    ctx.beginPath();
    ctx.ellipse(
        0,
        monster.size * 0.8,
        monster.size,
        monster.size * 0.35,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // body
    ctx.fillStyle =
        monster.hitFlash > 0
            ? "#ffffff"
            : monster.color;

    ctx.beginPath();
    ctx.arc(
        0,
        0,
        monster.size,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // horns
    if (monster.name === "Demon") {

        ctx.fillStyle = "#f5f5f5";

        ctx.beginPath();
        ctx.moveTo(-12, -15);
        ctx.lineTo(-20, -30);
        ctx.lineTo(-4, -20);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(12, -15);
        ctx.lineTo(20, -30);
        ctx.lineTo(4, -20);
        ctx.fill();
    }


    // eyes
    ctx.fillStyle = "#111";

    ctx.beginPath();

    ctx.arc(-7, -3, 3, 0, Math.PI * 2);
    ctx.arc(7, -3, 3, 0, Math.PI * 2);

    ctx.fill();


    // HP bar
    const hpPercent =
        Math.max(0, monster.hp / monster.maxHP);

    ctx.fillStyle = "#111";

    ctx.fillRect(
        -25,
        -monster.size - 10,
        50,
        5
    );

    ctx.fillStyle = "#22c55e";

    ctx.fillRect(
        -25,
        -monster.size - 10,
        50 * hpPercent,
        5
    );


    ctx.restore();
}


// ===============================
// BACKGROUND
// ===============================

function drawBackground() {

    ctx.fillStyle = "#18252d";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ground pattern

    ctx.strokeStyle = "rgba(255,255,255,0.035)";
    ctx.lineWidth = 1;

    const size = 45;

    for (
        let x = 0;
        x < canvas.width;
        x += size
    ) {

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (
        let y = 0;
        y < canvas.height;
        y += size
    ) {

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}


// ===============================
// PLAYER MOVEMENT
// ===============================

function movePlayer() {

    if (!joystick.active) return;

    player.x += joystick.x * player.speed;
    player.y += joystick.y * player.speed;


    player.x = Math.max(
        25,
        Math.min(
            canvas.width - 25,
            player.x
        )
    );

    player.y = Math.max(
        70,
        Math.min(
            canvas.height - 25,
            player.y
        )
    );


    if (Math.abs(joystick.x) > 0.1) {
        player.directionX = joystick.x;
        player.directionY = joystick.y;
    }
}


// ===============================
// MONSTER AI
// ===============================

function updateMonsters() {

    monsters.forEach(monster => {

        const dx = player.x - monster.x;
        const dy = player.y - monster.y;

        const distance =
            Math.sqrt(dx * dx + dy * dy);

        if (distance > 40) {

            monster.x +=
                (dx / distance) *
                monster.speed;

            monster.y +=
                (dy / distance) *
                monster.speed;
        }

        if (monster.hitFlash > 0) {
            monster.hitFlash--;
        }

    });

}


// ===============================
// NORMAL ATTACK
// ===============================

let lastAttack = 0;

function normalAttack() {

    const now = Date.now();

    if (now - lastAttack < 700) return;

    lastAttack = now;

    let target = null;

    let closest = Infinity;

    monsters.forEach(monster => {

        const dx = monster.x - player.x;
        const dy = monster.y - player.y;

        const distance =
            Math.sqrt(dx * dx + dy * dy);

        if (distance < closest && distance < 110) {

            closest = distance;
            target = monster;
        }

    });

    if (target) {

        target.hp -= player.attack;

        target.hitFlash = 5;

        createHitParticles(
            target.x,
            target.y,
            "#ffffff"
        );

        if (target.hp <= 0) {
            killMonster(target);
        }
    }
}


// ===============================
// SELECT SKILL
// ===============================

function selectSkill(skillName) {

    const skill = skills[skillName];

    if (!skill) return;


    // Level lock

    if (
        skill.requiredLevel &&
        player.level < skill.requiredLevel
    ) {

        showMessage(
            "🔒 Level " +
            skill.requiredLevel +
            " Required"
        );

        return;
    }


    selectedSkill = skillName;


    // IMPORTANT:
    // Skill panel automatically closes

    document.getElementById(
        "skillPanel"
    ).style.display = "none";


    showMessage(
        skill.name + " Selected!"
    );
}


// ===============================
// USE SELECTED SKILL
// ===============================

function useSelectedSkill() {

    if (!selectedSkill) return;

    const skill =
        skills[selectedSkill];

    const now = Date.now();


    // cooldown

    if (
        now - skill.lastUsed <
        skill.cooldown
    ) {

        return;
    }


    skill.lastUsed = now;


    if (
        selectedSkill === "fireball" ||
        selectedSkill === "waterbolt" ||
        selectedSkill === "iceshard" ||
        selectedSkill === "thunder"
    ) {

        castProjectile(skill);
    }


    if (selectedSkill === "flamewave") {

        areaAttack(
            skill.damage,
            140,
            skill.color
        );
    }


    if (selectedSkill === "meteor") {

        areaAttack(
            skill.damage,
            220,
            skill.color
        );
    }


    if (selectedSkill === "tsunami") {

        areaAttack(
            skill.damage,
            180,
            skill.color
        );
    }


    if (selectedSkill === "blizzard") {

        areaAttack(
            skill.damage,
            200,
            skill.color
        );
    }
}


// ===============================
// PROJECTILE
// ===============================

function castProjectile(skill) {

    let target = null;

    let closest = Infinity;

    monsters.forEach(monster => {

        const dx =
            monster.x - player.x;

        const dy =
            monster.y - player.y;

        const distance =
            Math.sqrt(dx * dx + dy * dy);

        if (
            distance < closest &&
            distance < 350
        ) {

            closest = distance;
            target = monster;
        }

    });


    if (!target) return;


    projectiles.push({

        x: player.x,
        y: player.y,

        target,

        damage: skill.damage,

        color: skill.color,

        size: 9,

        type: selectedSkill
    });
}


// ===============================
// PROJECTILE UPDATE
// ===============================

function updateProjectiles() {

    projectiles.forEach((p, index) => {

        if (!p.target) {

            projectiles.splice(index, 1);
            return;
        }


        const dx =
            p.target.x - p.x;

        const dy =
            p.target.y - p.y;

        const distance =
            Math.sqrt(dx * dx + dy * dy);


        if (distance < 15) {

            p.target.hp -= p.damage;

            p.target.hitFlash = 8;

            createHitParticles(
                p.target.x,
                p.target.y,
                p.color
            );


            if (p.target.hp <= 0) {

                killMonster(
                    p.target
                );
            }


            projectiles.splice(index, 1);

            return;
        }


        p.x +=
            (dx / distance) * 7;

        p.y +=
            (dy / distance) * 7;

    });

}


// ===============================
// DRAW PROJECTILES
// ===============================

function drawProjectiles() {

    projectiles.forEach(p => {

        ctx.save();

        ctx.shadowBlur = 18;
        ctx.shadowColor = p.color;

        ctx.fillStyle = p.color;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // special ring

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size + 4,
            0,
            Math.PI * 2
        );

        ctx.stroke();

        ctx.restore();
    });

}


// ===============================
// AREA ATTACK
// ===============================

function areaAttack(
    damage,
    radius,
    color
) {

    createExplosion(
        player.x,
        player.y,
        radius,
        color
    );


    monsters.forEach(monster => {

        const dx =
            monster.x - player.x;

        const dy =
            monster.y - player.y;

        const distance =
            Math.sqrt(dx * dx + dy * dy);


        if (distance <= radius) {

            monster.hp -= damage;

            monster.hitFlash = 10;

            createHitParticles(
                monster.x,
                monster.y,
                color
            );


            if (monster.hp <= 0) {
                killMonster(monster);
            }
        }

    });

}


// ===============================
// KILL MONSTER
// ===============================

function killMonster(monster) {

    const index =
        monsters.indexOf(monster);

    if (index === -1) return;


    monsters.splice(index, 1);


    player.coins += 5;

    kills++;


    addXP(15);


    createHitParticles(
        monster.x,
        monster.y,
        monster.color
    );


    createMonster();


    if (kills >= stageTarget) {

        nextStage();
    }
}


// ===============================
// XP
// ===============================

function addXP(amount) {

    player.xp += amount;

    const needed =
        player.level * 100;


    if (player.xp >= needed) {

        player.xp -= needed;

        player.level++;

        player.maxHP += 15;

        player.hp =
            player.maxHP;

        player.attack += 3;


        showMessage(
            "🎉 LEVEL " +
            player.level +
            "!"
        );
    }

}


// ===============================
// STAGE
// ===============================

function nextStage() {

    stage++;

    kills = 0;

    stageTarget =
        10 + stage * 3;


    showMessage(
        "⚔️ STAGE " +
        stage
    );


    for (let i = 0; i < 2; i++) {
        createMonster();
    }
}


// ===============================
// PARTICLES
// ===============================

function createHitParticles(
    x,
    y,
    color
) {

    for (let i = 0; i < 12; i++) {

        particles.push({

            x,
            y,

            vx:
                (Math.random() - 0.5) * 5,

            vy:
                (Math.random() - 0.5) * 5,

            life: 30,

            color
        });
    }
}


function createExplosion(
    x,
    y,
    radius,
    color
) {

    for (let i = 0; i < 35; i++) {

        const angle =
            Math.random() *
            Math.PI *
            2;

        const speed =
            Math.random() * 5;

        particles.push({

            x,
            y,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            life: 45,

            color,

            size:
                Math.random() * 5 + 2
        });
    }
}


function updateParticles() {

    particles.forEach((p, index) => {

        p.x += p.vx;
        p.y += p.vy;

        p.life--;

        if (p.life <= 0) {
            particles.splice(index, 1);
        }

    });

}


function drawParticles() {

    particles.forEach(p => {

        ctx.globalAlpha =
            p.life / 45;

        ctx.fillStyle =
            p.color;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size || 3,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });

    ctx.globalAlpha = 1;
}


// ===============================
// JOYSTICK
// ===============================

canvas.addEventListener(
    "pointerdown",
    e => {

        joystick.active = true;

        joystick.startX = e.clientX;
        joystick.startY = e.clientY;

        joystick.x = 0;
        joystick.y = 0;
    }
);


canvas.addEventListener(
    "pointermove",
    e => {

        if (!joystick.active) return;


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


        const max = 60;


        if (distance > max) {

            dx =
                (dx / distance) *
                max;

            dy =
                (dy / distance) *
                max;
        }


        joystick.x =
            dx / max;

        joystick.y =
            dy / max;
    }
);


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


// ===============================
// SKILL BUTTON
// ===============================

document.getElementById(
    "skillsButton"
).addEventListener(
    "click",
    () => {

        const panel =
            document.getElementById(
                "skillPanel"
            );

        panel.style.display =
            "block";
    }
);


document.getElementById(
    "closeSkills"
).addEventListener(
    "click",
    () => {

        document.getElementById(
            "skillPanel"
        ).style.display =
            "none";
    }
);


// ===============================
// MESSAGE
// ===============================

let messageTimer = null;

function showMessage(text) {

    const message =
        document.getElementById(
            "message"
        );

    message.innerText = text;

    message.style.opacity = "1";


    clearTimeout(messageTimer);


    messageTimer =
        setTimeout(() => {

            message.style.opacity = "0";

        }, 1200);
}


// ===============================
// HUD
// ===============================

function updateHUD() {

    document.getElementById(
        "level"
    ).innerText =
        player.level;


    document.getElementById(
        "coins"
    ).innerText =
        player.coins;


    document.getElementById(
        "stage"
    ).innerText =
        stage;


    document.getElementById(
        "hpBar"
    ).style.width =
        (
            player.hp /
            player.maxHP *
            100
        ) + "%";


    document.getElementById(
        "xpBar"
    ).style.width =
        (
            player.xp /
            (player.level * 100) *
            100
        ) + "%";
}


// ===============================
// GAME LOOP
// ===============================

function gameLoop() {

    drawBackground();


    movePlayer();

    updateMonsters();

    normalAttack();

    useSelectedSkill();

    updateProjectiles();

    updateParticles();


    drawProjectiles();

    drawParticles();


    monsters.forEach(
        drawMonster
    );


    drawPlayer();


    updateHUD();


    requestAnimationFrame(
        gameLoop
    );
}


// ===============================
// START
// ===============================

updateHUD();

gameLoop();
