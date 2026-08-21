"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let W = 0;
let H = 0;

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
    attackRange: 85,
    attackCooldown: 650,
    lastAttack: 0,

    facingX: 1,
    facingY: 0
};

let stage = 1;
let monsters = [];
let projectiles = [];
let effects = [];
let particles = [];
let damageTexts = [];

let selectedSkill = null;
let killsThisStage = 0;
let stageGoal = 8;


/* =====================================================
   SKILLS
===================================================== */

const skills = {

    fireball: {
        name: "🔥 Fireball",
        level: 1,
        damage: 25,
        cooldown: 1000,
        color: "#ff4d22",
        type: "projectile",
        speed: 7
    },

    waterbolt: {
        name: "💧 Water Bolt",
        level: 2,
        damage: 30,
        cooldown: 1100,
        color: "#38bdf8",
        type: "projectile",
        speed: 8
    },

    flamewave: {
        name: "🔥 Flame Wave",
        level: 3,
        damage: 45,
        cooldown: 2500,
        color: "#ff7b00",
        type: "area",
        radius: 135
    },

    iceshard: {
        name: "❄️ Ice Shard",
        level: 3,
        damage: 30,
        cooldown: 1200,
        color: "#7dd3fc",
        type: "projectile",
        speed: 8,
        freeze: true
    },

    thunder: {
        name: "⚡ Thunder",
        level: 5,
        damage: 40,
        cooldown: 1800,
        color: "#fde047",
        type: "thunder"
    },

    tsunami: {
        name: "🌊 Tsunami",
        level: 5,
        damage: 60,
        cooldown: 3500,
        color: "#0ea5e9",
        type: "tsunami",
        radius: 180
    },

    blizzard: {
        name: "🌨️ Blizzard",
        level: 7,
        damage: 70,
        cooldown: 4500,
        color: "#bae6fd",
        type: "blizzard",
        radius: 190,
        freeze: true
    }
};

const skillLastUsed = {};


/* =====================================================
   RESIZE
===================================================== */

function resizeCanvas() {

    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = W;
    canvas.height = H;

    if (player.x === 0) {
        player.x = W / 2;
        player.y = H / 2 + 50;
    }
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();


/* =====================================================
   KEYBOARD
===================================================== */

const keys = {};

window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});


/* =====================================================
   JOYSTICK
===================================================== */

const joystick = {
    active: false,
    pointerId: null,
    baseX: 0,
    baseY: 0,
    x: 0,
    y: 0,
    radius: 60
};

canvas.addEventListener("pointerdown", e => {

    joystick.active = true;
    joystick.pointerId = e.pointerId;

    joystick.baseX = e.clientX;
    joystick.baseY = e.clientY;

    joystick.x = 0;
    joystick.y = 0;

    try {
        canvas.setPointerCapture(e.pointerId);
    } catch (_) {}
});

canvas.addEventListener("pointermove", e => {

    if (!joystick.active ||
        e.pointerId !== joystick.pointerId) {
        return;
    }

    let dx = e.clientX - joystick.baseX;
    let dy = e.clientY - joystick.baseY;

    const distance = Math.hypot(dx, dy);

    if (distance > joystick.radius) {
        dx = dx / distance * joystick.radius;
        dy = dy / distance * joystick.radius;
    }

    joystick.x = dx / joystick.radius;
    joystick.y = dy / joystick.radius;
});

function stopJoystick() {

    joystick.active = false;
    joystick.pointerId = null;
    joystick.x = 0;
    joystick.y = 0;
}

canvas.addEventListener("pointerup", stopJoystick);
canvas.addEventListener("pointercancel", stopJoystick);


/* =====================================================
   PLAYER MOVEMENT
===================================================== */

function updatePlayer() {

    let dx = 0;
    let dy = 0;

    if (joystick.active) {
        dx += joystick.x;
        dy += joystick.y;
    }

    if (keys["w"] || keys["arrowup"]) dy -= 1;
    if (keys["s"] || keys["arrowdown"]) dy += 1;
    if (keys["a"] || keys["arrowleft"]) dx -= 1;
    if (keys["d"] || keys["arrowright"]) dx += 1;

    const length = Math.hypot(dx, dy);

    if (length > 0) {

        dx /= length;
        dy /= length;

        player.x += dx * player.speed;
        player.y += dy * player.speed;

        player.facingX = dx;
        player.facingY = dy;
    }

    player.x = Math.max(30, Math.min(W - 30, player.x));
    player.y = Math.max(110, Math.min(H - 35, player.y));
}


/* =====================================================
   MONSTERS
===================================================== */

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
            Math.floor(Math.random() * monsterTypes.length)
        ];

    let x;
    let y;

    do {

        x = 40 + Math.random() * (W - 80);
        y = 120 + Math.random() * Math.max(100, H - 160);

    } while (
        Math.hypot(x - player.x, y - player.y) < 220
    );

    const hp =
        type.hp + (stage - 1) * 12;

    monsters.push({

        x,
        y,

        radius: type.radius,
        color: type.color,
        name: type.name,

        hp,
        maxHp: hp,

        speed:
            type.speed +
            (stage - 1) * 0.015,

        frozen: 0,
        hitFlash: 0
    });
}

function maintainMonsters() {

    const amount =
        Math.min(3 + stage, 8);

    while (monsters.length < amount) {
        spawnMonster();
    }
}


/* =====================================================
   MONSTER MOVEMENT
===================================================== */

function updateMonsters() {

    for (const monster of monsters) {

        if (monster.hitFlash > 0) {
            monster.hitFlash--;
        }

        if (monster.frozen > 0) {
            monster.frozen--;
            continue;
        }

        const dx = player.x - monster.x;
        const dy = player.y - monster.y;

        const distance = Math.hypot(dx, dy);

        if (distance > 58) {

            monster.x +=
                dx / distance *
                monster.speed;

            monster.y +=
                dy / distance *
                monster.speed;
        }
    }
}


/* =====================================================
   NORMAL ATTACK
===================================================== */

function normalAttack() {

    const now = performance.now();

    if (
        now - player.lastAttack <
        player.attackCooldown
    ) {
        return;
    }

    let target = null;
    let closest = Infinity;

    for (const monster of monsters) {

        const distance =
            Math.hypot(
                monster.x - player.x,
                monster.y - player.y
            );

        if (
            distance <= player.attackRange &&
            distance < closest
        ) {

            closest = distance;
            target = monster;
        }
    }

    if (!target) return;

    player.lastAttack = now;

    target.hp -= player.attack;
    target.hitFlash = 8;

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

    checkMonsterDeath(target);
}


/* =====================================================
   SKILL UNLOCK
===================================================== */

function isSkillUnlocked(skillName) {

    const skill = skills[skillName];

    return player.level >= skill.level;
}


/* =====================================================
   SELECT SKILL
===================================================== */

function selectSkill(name) {

    const skill = skills[name];

    if (!skill) return;

    /* LOCKED SKILL */

    if (!isSkillUnlocked(name)) {

        showMessage(
            "🔒 Unlock at Level " +
            skill.level
        );

        return;
    }

    selectedSkill = name;

    updateSkillButton();

    /*
       IMPORTANT:
       PANEL AUTOMATICALLY CLOSES
    */

    const panel =
        document.getElementById("skillPanel");

    panel.style.display = "none";

    showMessage(
        skill.name + " selected!"
    );
}


/* =====================================================
   USE SKILL
===================================================== */

function useSelectedSkill() {

    if (!selectedSkill) {

        showMessage(
            "⚡ Select a skill first"
        );

        return;
    }

    const skill =
        skills[selectedSkill];

    if (!isSkillUnlocked(selectedSkill)) {

        showMessage(
            "🔒 Skill locked"
        );

        return;
    }

    const now = performance.now();

    const last =
        skillLastUsed[selectedSkill] || 0;

    if (
        now - last <
        skill.cooldown
    ) {

        const remaining =
            (
                skill.cooldown -
                (now - last)
            ) / 1000;

        showMessage(
            "⏳ " +
            remaining.toFixed(1) +
            "s"
        );

        return;
    }

    skillLastUsed[selectedSkill] = now;

    if (skill.type === "projectile") {

        castProjectile(skill);

    } else if (skill.type === "area") {

        castFlameWave(skill);

    } else if (skill.type === "tsunami") {

        castTsunami(skill);

    } else if (skill.type === "thunder") {

        castThunder(skill);

    } else if (skill.type === "blizzard") {

        castBlizzard(skill);
    }
}


/* =====================================================
   FIND TARGET
===================================================== */

function findNearestMonster() {

    let target = null;
    let closest = Infinity;

    for (const monster of monsters) {

        const distance =
            Math.hypot(
                monster.x - player.x,
                monster.y - player.y
            );

        if (distance < closest) {

            closest = distance;
            target = monster;
        }
    }

    return target;
}


/* =====================================================
   FIREBALL / WATER / ICE PROJECTILE
===================================================== */

function castProjectile(skill) {

    const target = findNearestMonster();

    if (!target) {

        showMessage("No monster nearby");
        return;
    }

    projectiles.push({

        x: player.x,
        y: player.y,

        target,

        speed: skill.speed,

        damage: skill.damage,

        color: skill.color,

        type: selectedSkill,

        freeze: skill.freeze || false,

        radius:
            selectedSkill === "fireball"
                ? 10
                : 8,

        life: 120
    });
}


/* =====================================================
   PROJECTILE UPDATE
===================================================== */

function updateProjectiles() {

    for (
        let i = projectiles.length - 1;
        i >= 0;
        i--
    ) {

        const p = projectiles[i];

        if (
            !p.target ||
            !monsters.includes(p.target)
        ) {

            projectiles.splice(i, 1);
            continue;
        }

        const dx = p.target.x - p.x;
        const dy = p.target.y - p.y;

        const distance = Math.hypot(dx, dy);

        /*
           FIREBALL TRAIL
        */

        createParticles(
            p.x,
            p.y,
            p.color,
            1
        );

        if (distance < 15) {

            p.target.hp -= p.damage;

            p.target.hitFlash = 10;

            if (p.freeze) {
                p.target.frozen = 110;
            }

            /*
               IMPACT EFFECT
            */

            effects.push({

                type: "impact",

                x: p.target.x,
                y: p.target.y,

                radius: 10,

                maxRadius: 45,

                color: p.color,

                life: 20
            });

            createParticles(
                p.target.x,
                p.target.y,
                p.color,
                22
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

            projectiles.splice(i, 1);

            continue;
        }

        p.x +=
            dx / distance *
            p.speed;

        p.y +=
            dy / distance *
            p.speed;

        p.life--;

        if (p.life <= 0) {
            projectiles.splice(i, 1);
        }
    }
}


/* =====================================================
   FLAME WAVE
===================================================== */

function castFlameWave(skill) {

    effects.push({

        type: "wave",

        x: player.x,

        y: player.y,

        radius: 20,

        maxRadius: skill.radius,

        color: "#ff6b00",

        life: 35
    });

    damageArea(
        skill.radius,
        skill.damage,
        false
    );
}


/* =====================================================
   TSUNAMI
===================================================== */

function castTsunami(skill) {

    effects.push({

        type: "tsunami",

        x: player.x,

        y: player.y,

        radius: 30,

        maxRadius: skill.radius,

        color: "#0ea5e9",

        life: 45
    });

    damageArea(
        skill.radius,
        skill.damage,
        false
    );
}


/* =====================================================
   BLIZZARD
===================================================== */

function castBlizzard(skill) {

    effects.push({

        type: "blizzard",

        x: player.x,

        y: player.y,

        radius: 30,

        maxRadius: skill.radius,

        color: "#bae6fd",

        life: 55
    });

    damageArea(
        skill.radius,
        skill.damage,
        true
    );
}


/* =====================================================
   AREA DAMAGE
===================================================== */

function damageArea(
    radius,
    damage,
    freeze
) {

    for (const monster of [...monsters]) {

        const distance =
            Math.hypot(
                monster.x - player.x,
                monster.y - player.y
            );

        if (distance <= radius) {

            monster.hp -= damage;

            monster.hitFlash = 10;

            if (freeze) {
                monster.frozen = 130;
            }

            createParticles(
                monster.x,
                monster.y,
                selectedSkill === "tsunami"
                    ? "#38bdf8"
                    : "#ffffff",
                15
            );

            addDamageText(
                monster.x,
                monster.y - 35,
                damage,
                "#ffffff"
            );

            checkMonsterDeath(monster);
        }
    }
}


/* =====================================================
   THUNDER
===================================================== */

function castThunder(skill) {

    const target =
        findNearestMonster();

    if (!target) {

        showMessage(
            "No monster nearby"
        );

        return;
    }

    target.hp -= skill.damage;

    target.hitFlash = 15;

    effects.push({

        type: "thunder",

        x: target.x,

        y: target.y,

        color: "#fde047",

        life: 30
    });

    createParticles(
        target.x,
        target.y,
        "#fde047",
        30
    );

    addDamageText(
        target.x,
        target.y - 45,
        skill.damage,
        "#fde047"
    );

    checkMonsterDeath(target);
}


/* =====================================================
   MONSTER DEATH
===================================================== */

function checkMonsterDeath(monster) {

    if (monster.hp > 0) return;

    const index =
        monsters.indexOf(monster);

    if (index === -1) return;

    monsters.splice(index, 1);

    player.coins +=
        5 + stage;

    player.xp +=
        15 + stage * 2;

    killsThisStage++;

    createParticles(
        monster.x,
        monster.y,
        monster.color,
        28
    );

    checkLevelUp();

    if (killsThisStage >= stageGoal) {

        stage++;

        killsThisStage = 0;

        stageGoal =
            7 + stage * 3;

        showMessage(
            "🏆 STAGE " +
            stage
        );
    }
}


/* =====================================================
   LEVEL UP
===================================================== */

function checkLevelUp() {

    const required =
        player.level * 100;

    if (player.xp >= required) {

        player.xp -= required;

        player.level++;

        player.maxHp += 15;

        player.hp =
            player.maxHp;

        player.attack += 4;

        showMessage(
            "⭐ LEVEL " +
            player.level +
            "!"
        );

        updateSkillLocks();
    }
}


/* =====================================================
   SKILL LOCK UI
===================================================== */

function updateSkillLocks() {

    document.querySelectorAll(
        ".skill-button"
    ).forEach(button => {

        const name =
            button.dataset.skill;

        const skill =
            skills[name];

        if (!skill) return;

        if (
            player.level >=
            skill.level
        ) {

            button.disabled = false;

            button.style.opacity = "1";

            button.style.filter = "none";

            button.innerHTML =
                skill.name +
                "<span>" +
                skill.damage +
                " DMG</span>";

        } else {

            button.disabled = true;

            button.style.opacity = "0.45";

            button.style.filter =
                "grayscale(0.7)";

            button.innerHTML =
                "🔒 " +
                skill.name +
                "<span>" +
                "Lv " +
                skill.level +
                "</span>";
        }
    });
}


/* =====================================================
   PARTICLES
===================================================== */

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
            Math.PI * 2;

        const speed =
            1 +
            Math.random() * 4;

        particles.push({

            x,
            y,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            life:
                20 +
                Math.random() * 20,

            color
        });
    }
}

function updateParticles() {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.96;
        p.vy *= 0.96;

        p.life--;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}


/* =====================================================
   EFFECTS
===================================================== */

function updateEffects() {

    for (
        let i = effects.length - 1;
        i >= 0;
        i--
    ) {

        const e = effects[i];

        e.life--;

        if (
            e.type === "wave" ||
            e.type === "tsunami" ||
            e.type === "blizzard" ||
            e.type === "impact"
        ) {

            e.radius +=
                (
                    e.maxRadius -
                    e.radius
                ) * 0.22;
        }

        if (e.life <= 0) {
            effects.splice(i, 1);
        }
    }
}


/* =====================================================
   DAMAGE TEXT
===================================================== */

function addDamageText(
    x,
    y,
    damage,
    color
) {

    damageTexts.push({

        x,
        y,

        text:
            "-" + damage,

        color,

        life: 35
    });
}

function updateDamageTexts() {

    for (
        let i = damageTexts.length - 1;
        i >= 0;
        i--
    ) {

        const d =
            damageTexts[i];

        d.y -= 0.6;

        d.life--;

        if (d.life <= 0) {
            damageTexts.splice(i, 1);
        }
    }
}


/* =====================================================
   BACKGROUND
===================================================== */

function drawBackground() {

    ctx.fillStyle = "#24452d";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    for (
        let i = 0;
        i < 80;
        i++
    ) {

        const x =
            (i * 97) % W;

        const y =
            100 +
            (i * 53) %
            Math.max(100, H - 120);

        ctx.fillStyle =
            i % 2 === 0
                ? "rgba(50,100,55,0.35)"
                : "rgba(20,70,35,0.3)";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            18 + (i % 5) * 4,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    drawTree(55, 145);
    drawTree(W - 55, 180);
    drawTree(75, H - 120);
    drawTree(W - 70, H - 150);

    drawRock(
        W * 0.22,
        H * 0.45
    );

    drawRock(
        W * 0.78,
        H * 0.62
    );
}

function drawTree(x, y) {

    ctx.fillStyle = "#633d25";

    ctx.fillRect(
        x - 6,
        y,
        12,
        28
    );

    ctx.fillStyle = "#166534";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 5,
        25,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#15803d";

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

function drawRock(x, y) {

    ctx.fillStyle = "#53636a";

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


/* =====================================================
   PLAYER
===================================================== */

function drawPlayer() {

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );

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

    ctx.fillStyle = "#312e81";

    ctx.beginPath();

    ctx.moveTo(-17, -2);
    ctx.lineTo(-22, 28);
    ctx.lineTo(0, 22);
    ctx.lineTo(22, 28);
    ctx.lineTo(17, -2);

    ctx.closePath();

    ctx.fill();

    ctx.fillStyle = "#2563eb";

    ctx.fillRect(
        -15,
        -4,
        30,
        29
    );

    ctx.fillStyle = "#f2c6a5";

    ctx.beginPath();

    ctx.arc(
        0,
        -20,
        15,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#292524";

    ctx.beginPath();

    ctx.arc(
        0,
        -25,
        15,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#111827";

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

    ctx.strokeStyle = "#e5e7eb";

    ctx.lineWidth = 5;

    ctx.lineCap = "round";

    ctx.beginPath();

    ctx.moveTo(
        player.facingX * 9,
        player.facingY * 9
    );

    ctx.lineTo(
        player.facingX * 30,
        player.facingY * 30
    );

    ctx.stroke();

    ctx.restore();
}


/* =====================================================
   MONSTER
===================================================== */

function drawMonster(monster) {

    ctx.save();

    ctx.translate(
        monster.x,
        monster.y
    );

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

    ctx.fillStyle = "#4c1d1d";

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

    ctx.fillStyle = "#fff";

    ctx.beginPath();

    ctx.arc(-7, -4, 5, 0, Math.PI * 2);
    ctx.arc(7, -4, 5, 0, Math.PI * 2);

    ctx.fill();

    ctx.fillStyle = "#111";

    ctx.beginPath();

    ctx.arc(-7, -4, 2, 0, Math.PI * 2);
    ctx.arc(7, -4, 2, 0, Math.PI * 2);

    ctx.fill();

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

    ctx.fillStyle = "#22c55e";

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

    if (monster.frozen > 0) {

        ctx.strokeStyle = "#bae6fd";

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            monster.radius + 7,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    }

    ctx.restore();
}


/* =====================================================
   PROJECTILE DRAW
===================================================== */

function drawProjectiles() {

    for (const p of projectiles) {

        ctx.save();

        ctx.shadowBlur = 25;
        ctx.shadowColor = p.color;

        /*
           FIREBALL
        */

        if (p.type === "fireball") {

            ctx.fillStyle = "#ff3300";

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                11,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillStyle = "#ffd166";

            ctx.beginPath();

            ctx.arc(
                p.x - 3,
                p.y - 3,
                5,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

        /*
           WATER
        */

        else if (
            p.type === "waterbolt"
        ) {

            ctx.fillStyle = "#38bdf8";

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                9,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.strokeStyle = "#bae6fd";

            ctx.lineWidth = 3;

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                13,
                0,
                Math.PI * 2
            );

            ctx.stroke();
        }

        /*
           ICE
        */

        else {

            ctx.fillStyle = "#bae6fd";

            ctx.beginPath();

            ctx.moveTo(
                p.x,
                p.y - 13
            );

            ctx.lineTo(
                p.x + 8,
                p.y
            );

            ctx.lineTo(
                p.x,
                p.y + 13
            );

            ctx.lineTo(
                p.x - 8,
                p.y
            );

            ctx.closePath();

            ctx.fill();

            ctx.strokeStyle = "#ffffff";

            ctx.stroke();
        }

        ctx.restore();
    }
}


/* =====================================================
   EFFECT DRAW
===================================================== */

function drawEffects() {

    for (const e of effects) {

        ctx.save();

        const alpha =
            Math.max(
                0,
                e.life /
                45
            );

        ctx.globalAlpha = alpha;


        /* FIRE WAVE */

        if (e.type === "wave") {

            ctx.strokeStyle =
                "#ff6b00";

            ctx.lineWidth = 18;

            ctx.shadowBlur = 25;
            ctx.shadowColor = "#ff3300";

            ctx.beginPath();

            ctx.arc(
                e.x,
                e.y,
                e.radius,
                0,
                Math.PI * 2
            );

            ctx.stroke();
        }


        /* TSUNAMI */

        else if (e.type === "tsunami") {

            ctx.strokeStyle =
                "#38bdf8";

            ctx.lineWidth = 22;

            ctx.shadowBlur = 30;
            ctx.shadowColor = "#0284c7";

            ctx.beginPath();

            ctx.arc(
                e.x,
                e.y,
                e.radius,
                0,
                Math.PI * 2
            );

            ctx.stroke();

            ctx.lineWidth = 8;

            ctx.strokeStyle =
                "#bae6fd";

            ctx.beginPath();

            ctx.arc(
                e.x,
                e.y,
                e.radius - 18,
                0,
                Math.PI * 2
            );

            ctx.stroke();
        }


        /* BLIZZARD */

        else if (e.type === "blizzard") {

            ctx.strokeStyle =
                "#bae6fd";

            ctx.lineWidth = 8;

            ctx.shadowBlur = 25;

            ctx.shadowColor =
                "#7dd3fc";

            ctx.beginPath();

            ctx.arc(
                e.x,
                e.y,
                e.radius,
                0,
                Math.PI * 2
            );

            ctx.stroke();

            for (
                let i = 0;
                i < 12;
                i++
            ) {

                const angle =
                    i * 0.52;

                const px =
                    e.x +
                    Math.cos(angle) *
                    e.radius *
                    0.7;

                const py =
                    e.y +
                    Math.sin(angle) *
                    e.radius *
                    0.7;

                ctx.fillStyle =
                    "#ffffff";

                ctx.beginPath();

                ctx.arc(
                    px,
                    py,
                    4,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
            }
        }


        /* IMPACT */

        else if (e.type === "impact") {

            ctx.strokeStyle =
                e.color;

            ctx.lineWidth = 7;

            ctx.shadowBlur = 20;

            ctx.shadowColor =
                e.color;

            ctx.beginPath();

            ctx.arc(
                e.x,
                e.y,
                e.radius,
                0,
                Math.PI * 2
            );

            ctx.stroke();
        }


        /* THUNDER */

        else if (e.type === "thunder") {

            ctx.strokeStyle =
                "#fde047";

            ctx.lineWidth = 6;

            ctx.shadowBlur = 25;

            ctx.shadowColor =
                "#fde047";

            ctx.beginPath();

            ctx.moveTo(
                e.x,
                0
            );

            ctx.lineTo(
                e.x - 15,
                e.y * 0.35
            );

            ctx.lineTo(
                e.x + 12,
                e.y * 0.55
            );

            ctx.lineTo(
                e.x - 8,
                e.y * 0.75
            );

            ctx.lineTo(
                e.x,
                e.y
            );

            ctx.stroke();
        }

        ctx.restore();
    }
}


/* =====================================================
   PARTICLES DRAW
===================================================== */

function drawParticles() {

    for (const p of particles) {

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


/* =====================================================
   DAMAGE TEXT DRAW
===================================================== */

function drawDamageTexts() {

    for (const d of damageTexts) {

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


/* =====================================================
   JOYSTICK DRAW
===================================================== */

function drawJoystick() {

    if (!joystick.active) return;

    ctx.save();

    ctx.globalAlpha = 0.8;

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


/* =====================================================
   HUD
===================================================== */

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
            (player.level * 100) *
            100
        ) + "%";
}


/* =====================================================
   SKILL BUTTON
===================================================== */

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
        skills[selectedSkill].name;
}


/* =====================================================
   MESSAGE
===================================================== */

let messageTimer = null;

function showMessage(text) {

    const message =
        document.getElementById(
            "message"
        );

    message.textContent = text;

    message.style.opacity = "1";

    clearTimeout(messageTimer);

    messageTimer =
        setTimeout(() => {

            message.style.opacity =
                "0";

        }, 1200);
}


/* =====================================================
   SKILL PANEL
===================================================== */

document.getElementById(
    "skillsButton"
).addEventListener(
    "click",
    () => {

        updateSkillLocks();

        document.getElementById(
            "skillPanel"
        ).style.display = "block";
    }
);


document.getElementById(
    "closeSkill"
).addEventListener(
    "click",
    () => {

        document.getElementById(
            "skillPanel"
        ).style.display = "none";
    }
);


document.querySelectorAll(
    ".skill-button"
).forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const skillName =
                button.dataset.skill;

            if (
                !isSkillUnlocked(
                    skillName
                )
            ) {

                showMessage(
                    "🔒 Unlock at Level " +
                    skills[skillName].level
                );

                return;
            }

            selectSkill(skillName);
        }
    );
});


document.getElementById(
    "useSkill"
).addEventListener(
    "click",
    useSelectedSkill
);


/* =====================================================
   GAME LOOP
===================================================== */

function gameLoop() {

    updatePlayer();

    updateMonsters();

    normalAttack();

    updateProjectiles();

    updateParticles();

    updateEffects();

    updateDamageTexts();

    maintainMonsters();


    drawBackground();

    drawEffects();

    drawProjectiles();

    drawParticles();

    drawDamageTexts();


    for (const monster of monsters) {
        drawMonster(monster);
    }

    drawPlayer();

    drawJoystick();

    updateHUD();

    requestAnimationFrame(
        gameLoop
    );
}


/* =====================================================
   START
===================================================== */

for (let i = 0; i < 4; i++) {
    spawnMonster();
}

updateSkillLocks();
updateSkillButton();
updateHUD();

gameLoop();
