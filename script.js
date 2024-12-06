const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 400;

const player = { x: 50, y: 300, width: 30, height: 30, speed: 5 };
const shapes = [];
const keys = {};
let collectedShapes = 0;
let timer = 10;
const collectSound = new Audio("collect.mp3");
let gameOver = false;
let messageDisplayed = false;

const playerImg = new Image();
playerImg.src = 'icons/tortue.png';

const medusImg = new Image();
medusImg.src = 'icons/meduse.png';

const sacImg = new Image();
sacImg.src = 'icons/sac.png';

const bouteilleImg = new Image();
bouteilleImg.src = 'icons/bouteille.png';

// Définir la zone protégée (position du texte)
const protectedZone = {
  x: 0, // Début en haut à gauche
  y: 0, // Début en haut
  width: 150, // Largeur suffisante pour couvrir "Temps" et "Formes"
  height: 70, // Hauteur suffisante pour couvrir le texte
};

// Vérifier si une forme est dans la zone protégée
function isInProtectedZone(x, y, size) {
  return (
    x - size / 2 < protectedZone.x + protectedZone.width &&
    x + size / 2 > protectedZone.x &&
    y - size / 2 < protectedZone.y + protectedZone.height &&
    y + size / 2 > protectedZone.y
  );
}

// Vérifie si la nouvelle forme chevauche une forme déjà existante
function isOverlapping(newShape) {
  for (let shape of shapes) {
    const distanceX = newShape.x - shape.x;
    const distanceY = newShape.y - shape.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    if (distance < newShape.size / 2 + shape.size / 2) {
      return true; // Les formes se chevauchent
    }
  }
  return false;
}

// Générer les formes avec vérification de la zone protégée
function generateShapes() {
  for (let i = 0; i < 3; i++) {
    let shape;
    do {
      shape = {
        type: "medus",
        x: Math.random() * (canvas.width - 40) + 20,
        y: Math.random() * (canvas.height - 40) + 20,
        size: 25,
      };
    } while (isOverlapping(shape) || isInProtectedZone(shape.x, shape.y, shape.size));

    shapes.push(shape);
  }

  for (let i = 0; i < 3; i++) {
    let shape;
    do {
      shape = {
        type: "bouteille",
        x: Math.random() * (canvas.width - 40) + 20,
        y: Math.random() * (canvas.height - 40) + 20,
        size: 30,
      };
    } while (isOverlapping(shape) || isInProtectedZone(shape.x, shape.y, shape.size));

    shapes.push(shape);
  }

  for (let i = 0; i < 3; i++) {
    let shape;
    do {
      shape = {
        type: "sac",
        x: Math.random() * (canvas.width - 40) + 20,
        y: Math.random() * (canvas.height - 40) + 20,
        size: 25,
      };
    } while (isOverlapping(shape) || isInProtectedZone(shape.x, shape.y, shape.size));

    shapes.push(shape);
  }
}

generateShapes();

// Contrôles du joueur
document.addEventListener("keydown", (e) => {
  if (!gameOver) {
    keys[e.key] = true;
  }
});
document.addEventListener("keyup", (e) => {
  if (!gameOver) {
    keys[e.key] = false;
  }
});

// Déplacement du joueur
function movePlayer() {
  if (keys["ArrowUp"] && player.y > 0) player.y -= player.speed;
  if (keys["ArrowDown"] && player.y + player.height < canvas.height)
    player.y += player.speed;
  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x + player.width < canvas.width)
    player.x += player.speed;
}

// Dessiner le joueur
function drawPlayer() {
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

// Dessiner les formes
function drawShapes() {
  for (let shape of shapes) {
    if (shape.type === "medus") {
      ctx.drawImage(medusImg, shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
    } else if (shape.type === "bouteille") {
      ctx.drawImage(bouteilleImg, shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
    } else if (shape.type === "sac") {
      ctx.drawImage(sacImg, shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
    }
  }
}

// Vérification des collisions
function checkCollisions() {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (
      player.x < shape.x + shape.size / 2 &&
      player.x + player.width > shape.x - shape.size / 2 &&
      player.y < shape.y + shape.size / 2 &&
      player.y + player.height > shape.y - shape.size / 2
    ) {
      if (shape.type === "medus") {
        shapes.splice(i, 1);
        collectedShapes++;
        collectSound.play();
      } else {
        if (!messageDisplayed) {
          messageDisplayed = true;
          gameOver = true;
        }
      }
    }
  }
}

// Mise à jour du timer
function updateTimer() {
  if (timer > 0 && !gameOver) {
    timer--;
  } else if (timer === 0 && !gameOver) {
    gameOver = true; // Déclenche la fin du jeu lorsque le timer atteint zéro
    messageDisplayed = true; // Empêche d'afficher plusieurs fois le message
  }
}

// Dessiner l'interface utilisateur
function drawHUD() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Temps : ${timer}s`, 10, 20);
  ctx.fillText(`Formes : ${collectedShapes}/3`, 10, 50);
}

// Dessiner le message de game over
function drawGameOverMessage() {
  ctx.fillStyle = "#4A628A";
  ctx.font = "30px Arial";
  ctx.fillText("You are a robot 🤖", canvas.width / 3, canvas.height / 2);
}

// Dessiner le message de victoire
function drawVictoryMessage() {
  const message = "Congratulations, you are a human! 😊";
  ctx.fillStyle = "#0B2F9F";
  ctx.font = "30px Arial";
  const textWidth = ctx.measureText(message).width;
  ctx.fillText(message, (canvas.width - textWidth) / 2, canvas.height / 2);
}

// Boucle du jeu
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameOver) {
    drawGameOverMessage();
    return;
  }

  movePlayer();
  drawPlayer();
  drawShapes();
  checkCollisions();
  drawHUD();

  if (collectedShapes === 3) {
    drawVictoryMessage();
    gameOver = true;
    return;
  }

  requestAnimationFrame(gameLoop);
}

setInterval(updateTimer, 1000);

// Chargement des images
playerImg.onload = function() {
  medusImg.onload = function() {
    sacImg.onload = function() {
      bouteilleImg.onload = function() {
        gameLoop();
      };
    };
  };
};
