const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resize();
window.addEventListener("resize", resize);

let player = {
    x: canvas.width / 2,
    y: canvas.height / 2
};

let monster = {
    x: canvas.width / 2 + 180,
    y: canvas.height / 2
};

function draw() {

    // Background
    ctx.fillStyle = "#18252d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // PLAYER
    ctx.save();
    ctx.translate(player.x, player.y);

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(0, 25, 30, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // body
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(-18, -5, 36, 35);

    // head
    ctx.fillStyle = "#f2c6a5";
    ctx.beginPath();
    ctx.arc(0, -22, 16, 0, Math.PI * 2);
    ctx.fill();

    // hair
    ctx.fillStyle = "#292524";
    ctx.beginPath();
    ctx.arc(0, -27, 16, Math.PI, Math.PI * 2);
    ctx.fill();

    // eyes
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(-6, -22, 2, 0, Math.PI * 2);
    ctx.arc(6, -22, 2, 0, Math.PI * 2);
    ctx.fill();

    // sword
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(15, 5);
    ctx.lineTo(45, -25);
    ctx.stroke();

    ctx.restore();


    // MONSTER
    ctx.save();
    ctx.translate(monster.x, monster.y);

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(0, 25, 30, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // body
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();

    // horns
    ctx.fillStyle = "#7f1d1d";

    ctx.beginPath();
    ctx.moveTo(-15, -17);
    ctx.lineTo(-25, -38);
    ctx.lineTo(-5, -25);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(15, -17);
    ctx.lineTo(25, -38);
    ctx.lineTo(5, -25);
    ctx.fill();

    // eyes
    ctx.fillStyle = "#fff";

    ctx.beginPath();
    ctx.arc(-8, -4, 5, 0, Math.PI * 2);
    ctx.arc(8, -4, 5, 0, Math.PI * 2);
    ctx.fill();

    // pupils
    ctx.fillStyle = "#111";

    ctx.beginPath();
    ctx.arc(-8, -4, 2, 0, Math.PI * 2);
    ctx.arc(8, -4, 2, 0, Math.PI * 2);
    ctx.fill();

    // HP bar
    ctx.fillStyle = "#111";
    ctx.fillRect(-30, -45, 60, 6);

    ctx.fillStyle = "#22c55e";
    ctx.fillRect(-30, -45, 60, 6);

    ctx.restore();


    // DEBUG TEXT
    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.fillText("GAME RENDERING OK", 15, 150);

    requestAnimationFrame(draw);
}

draw();
