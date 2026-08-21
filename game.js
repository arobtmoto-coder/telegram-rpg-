alert("GAME JS LOADED");
// ==========================================
// TELEGRAM
// ==========================================

if (
    window.Telegram &&
    Telegram.WebApp
) {

    Telegram.WebApp.ready();

    Telegram.WebApp.expand();
}


// ==========================================
// CANVAS
// ==========================================

const canvas =
    document.getElementById("game");

const ctx =
    canvas.getContext("2d");


function resize() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;


    if (
        player.x === 0 &&
        player.y === 0
    ) {

        player.x =
            canvas.width / 2;

        player.y =
            canvas.height / 2;
    }
}


// ==========================================
// PLAYER
// ==========================================

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

window.addEventListener(
    "resize",
    resize
);


// ==========================================
// GAME DATA
// ==========================================

let monsters = [];

let projectiles = [];

let particles = [];

let explosions = [];

let stage = 1;

let kills = 0;

let stageTarget = 10;

let selectedSkill = null;


// ==========================================
// SKILLS
// ==========================================

const skills = {

    fireball: {

        name: "🔥 Fireball",

        damage: 25,

        cooldown: 700,

        lastUsed: 0,

        color: "#ff4d22"
    },


    flamewave: {

        name: "🔥 Flame Wave",

        damage: 40,

        cooldown: 1800,

        lastUsed: 0,

        color: "#ff8a00"
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

        cooldown: 800,

        lastUsed: 0,

        color: "#38bdf8"
    },


    tsunami: {

        name: "🌊 Tsunami",

        damage: 60,

        cooldown: 3000,

        lastUsed: 0,

        color: "#0284c7"
    },


    iceshard: {

        name: "❄️ Ice Shard",

        damage: 30,

        cooldown: 900,

        lastUsed: 0,

        color: "#7dd3fc"
    },


    blizzard: {

        name: "🌨️ Blizzard",

        damage: 70,

        cooldown: 3500,

        lastUsed: 0,

        color: "#bae6fd"
    },


    thunder: {

        name: "⚡ Thunder Bolt",

        damage: 35,

        cooldown: 1200,

        lastUsed: 0,

        color: "#fde047"
    }

};


// ==========================================
// MONSTERS
// ==========================================

function createMonster() {

    const margin = 50;

    let x =
        Math.random() *
        (canvas.width - margin * 2)
        + margin;

    let y =
        Math.random() *
        (canvas.height - 140)
        + 90;


    let distance =
        Math.hypot(
            x - player.x,
            y - player.y
        );


    if (distance < 180) {

        x += 220;

        if (
            x >
            canvas.width - margin
        ) {

            x =
                canvas.width -
                margin;
        }
    }


    const types = [

        {
            color: "#ef4444",
            hp: 60,
            speed: 0.65,
            size: 25
        },

        {
            color: "#22c55e",
            hp: 75,
            speed: 0.45,
            size: 28
        },

        {
            color: "#a855f7",
            hp: 90,
            speed: 0.38,
            size: 27
        }

    ];


    const type =
        types[
            Math.floor(
                Math.random() *
                types.length
            )
        ];


    monsters.push({

        x: x,

        y: y,

        hp:
            type.hp +
            stage * 5,

        maxHP:
            type.hp +
            stage * 5,

        speed:
            type.speed,

        size:
            type.size,

        color:
            type.color,

        hitFlash: 0,

        frozen: 0
    });
}


for (
    let i = 0;
    i < 4;
    i++
) {

    createMonster();
}


// ==========================================
// JOYSTICK
// ==========================================

const joystick = {

    active: false,

    startX: 0,
    startY: 0,

    x: 0,
    y: 0,

    radius: 60
};


canvas.addEventListener(
    "pointerdown",
    function(e) {

        joystick.active = true;

        joystick.startX =
            e.clientX;

        joystick.startY =
            e.clientY;

        joystick.x = 0;
        joystick.y = 0;
    }
);


canvas.addEventListener(
    "pointermove",
    function(e) {

        if (!joystick.active)
            return;


        let dx =
            e.clientX -
            joystick.startX;

        let dy =
            e.clientY -
            joystick.startY;


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

function movePlayer() {

    if (!joystick.active)
        return;


    player.x +=
        joystick.x *
        player.speed;


    player.y +=
        joystick.y *
        player.speed;


    if (
        Math.abs(joystick.x) >
        0.1 ||
        Math.abs(joystick.y) >
        0.1
    ) {

        player.directionX =
            joystick.x;

        player.directionY =
            joystick.y;
    }


    player.x =
        Math.max(
            30,
            Math.min(
                canvas.width - 30,
                player.x
            )
        );


    player.y =
        Math.max(
            85,
            Math.min(
                canvas.height - 30,
                player.y
            )
        );
}


// ==========================================
// MONSTER MOVEMENT
// ==========================================

function moveMonsters() {

    monsters.forEach(
        monster => {

            if (
                monster.frozen > 0
            ) {

                monster.frozen--;

                return;
            }


            const dx =
                player.x -
                monster.x;

            const dy =
                player.y -
                monster.y;


            const distance =
                Math.hypot(
                    dx,
                    dy
                );


            if (
                distance > 55
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


            if (
                monster.hitFlash >
                0
            ) {

                monster.hitFlash--;
            }

        }
    );
}


// ==========================================
// DRAW BACKGROUND
// ==========================================

function drawBackground() {

    ctx.fillStyle =
        "#18252d";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.strokeStyle =
        "rgba(255,255,255,0.04)";


    for (
        let x = 0;
        x < canvas.width;
        x += 45
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(
            x,
            canvas.height
        );

        ctx.stroke();
    }


    for (
        let y = 0;
        y < canvas.height;
        y += 45
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();
    }
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
        "#ffffff";

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


    // Horns

    ctx.fillStyle =
        "#7f1d1d";


    ctx.beginPath();

    ctx.moveTo(
        -15,
        -15
    );

    ctx.lineTo(
        -25,
        -38
    );

    ctx.lineTo(
        -5,
        -25
    );

    ctx.fill();


    ctx.beginPath();

    ctx.moveTo(
        15,
        -15
    );

    ctx.lineTo(
        25,
        -38
    );

    ctx.lineTo(
        5,
        -25
    );

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


    ctx.fillStyle =
        "#111";

    ctx.beginPath();

    ctx.arc(
        -8,
        -4,
        2,
        0,
        Math.PI * 2
    );

    ctx.arc(
        8,
        -4,
        2,
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


// ==========================================
// NORMAL ATTACK
// ==========================================

let lastAttack = 0;


function normalAttack() {

    const now =
        Date.now();


    if (
        now -
        lastAttack <
        700
    ) {

        return;
    }


    let target = null;

    let closest =
        Infinity;


    monsters.forEach(
        monster => {

            const distance =
                Math.hypot(
                    monster.x -
                    player.x,

                    monster.y -
                    player.y
                );


            if (
                distance <
                105 &&
                distance <
                closest
            ) {

                closest =
                    distance;

                target =
                    monster;
            }

        }
    );


    if (!target)
        return;


    lastAttack =
        now;


    target.hp -=
        player.attack;


    target.hitFlash =
        8;


    createParticles(
        target.x,
        target.y,
        "#ffffff",
        8
    );


    if (
        target.hp <= 0
    ) {

        killMonster(
            target
        );
    }
}


// ==========================================
// SELECT SKILL
// ==========================================

function selectSkill(
    skillName
) {

    const skill =
        skills[skillName];


    if (!skill)
        return;


    if (
        skill.requiredLevel &&
        player.level <
        skill.requiredLevel
    ) {

        showMessage(
            "🔒 Level " +
            skill.requiredLevel +
            " Required"
        );

        return;
    }


    selectedSkill =
        skillName;


    // IMPORTANT:
    // Panel closes automatically

    document.getElementById(
        "skillPanel"
    ).style.display =
        "none";


    updateSkillButton();


    showMessage(
        skill.name +
        " Selected!"
    );
}


// ==========================================
// UPDATE SKILL BUTTON
// ==========================================

function updateSkillButton() {

    const button =
        document.getElementById(
            "useSkillButton"
        );


    if (!selectedSkill) {

        button.innerText =
            "⚡ SELECT SKILL";

        return;
    }


    button.innerText =
        skills[
            selectedSkill
        ].name;
}


// ==========================================
// USE SKILL
// ==========================================

function useSelectedSkill() {

    if (!selectedSkill)
        return;


    const skill =
        skills[
            selectedSkill
        ];


    const now =
        Date.now();


    if (
        now -
        skill.lastUsed <
        skill.cooldown
    ) {

        return;
    }


    skill.lastUsed =
        now;


    if (
        selectedSkill ===
        "fireball" ||

        selectedSkill ===
        "waterbolt" ||

        selectedSkill ===
        "iceshard" ||

        selectedSkill ===
        "thunder"
    ) {

        projectileAttack(
            skill
        );

        return;
    }


    if (
        selectedSkill ===
        "flamewave"
    ) {

        areaAttack(
            skill.damage,
            140,
            skill.color
        );

        return;
    }


    if (
        selectedSkill ===
        "meteor"
    ) {

        areaAttack(
            skill.damage,
            220,
            skill.color
        );

        return;
    }


    if (
        selectedSkill ===
        "tsunami"
    ) {

        areaAttack(
            skill.damage,
            180,
            skill.color
        );

        return;
    }


    if (
        selectedSkill ===
        "blizzard"
    ) {

        areaAttack(
            skill.damage,
            200,
            skill.color
        );
    }
}


// ==========================================
// PROJECTILE ATTACK
// ==========================================

function projectileAttack(
    skill
) {

    let target = null;

    let closest =
        Infinity;


    monsters.forEach(
        monster => {

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
    );


    if (!target)
        return;


    projectiles.push({

        x:
            player.x,

        y:
            player.y,

        target:
            target,

        damage:
            skill.damage,

        color:
            skill.color,

        size:
            9
    });
}


// ==========================================
// PROJECTILE UPDATE
// ==========================================

function updateProjectiles() {

    projectiles.forEach(
        (p, index) => {

            if (!p.target) {

                projectiles.splice(
                    index,
                    1
                );

                return;
            }


            const dx =
                p.target.x -
                p.x;

            const dy =
                p.target.y -
                p.y;


            const distance =
                Math.hypot(
                    dx,
                    dy
                );


            if (
                distance <
                15
            ) {

                p.target.hp -=
                    p.damage;


                p.target.hitFlash =
                    10;


                createParticles(
                    p.target.x,
                    p.target.y,
                    p.color,
                    15
                );


                if (
                    p.target.hp <=
                    0
                ) {

                    killMonster(
                        p.target
                    );
                }


                projectiles.splice(
                    index,
                    1
                );

                return;
            }


            p.x +=
                dx /
                distance *
                8;


            p.y +=
                dy /
                distance *
                8;
        }
    );
}


// ==========================================
// DRAW PROJECTILES
// ==========================================

function drawProjectiles() {

    projectiles.forEach(
        p => {

            ctx.save();

            ctx.shadowBlur =
                20;

            ctx.shadowColor =
                p.color;


            ctx.fillStyle =
                p.color;


            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                p.size,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.restore();
        }
    );
}


// ==========================================
// AREA ATTACK
// ==========================================

function areaAttack(
    damage,
    radius,
    color
) {

    explosions.push({

        x:
            player.x,

        y:
            player.y,

        radius:
            radius,

        color:
            color,

        life:
            25
    });


    monsters.forEach(
        monster => {

            const distance =
                Math.hypot(
                    monster.x -
                    player.x,

                    monster.y -
                    player.y
                );


            if (
                distance <=
                radius
            ) {

                monster.hp -=
                    damage;


                monster.hitFlash =
                    10;


                createParticles(
                    monster.x,
                    monster.y,
                    color,
                    20
                );


                if (
  
