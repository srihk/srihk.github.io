const canvas = document.createElement("canvas");
document.querySelector("body").appendChild(canvas);
const ctx = canvas.getContext("2d");

const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

function getBackgroundColor() {
    return `rgba(${getComputedStyle(document.querySelector("body")).backgroundColor.replace(/[^\d,]/g, " ")}, 0.25)`;
}

function getColor() {
    return `rgba(${getComputedStyle(document.querySelector("body")).color.replace(/[^\d,]/g, " ")}, 0.25)`;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function random(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function randomRGB() {
    return `rgb(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)})`;
}

class Shape {
    constructor(x, y, velX, velY) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
    }
}

class Ball extends Shape {
    constructor(x, y, velX, velY, color, size) {
        super(x, y, velX, velY);
        this.color = color;
        this.size = size;
        this.exists = true;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }

    update() {
        if (this.x + this.size >= width) {
            this.velX = -this.velX;
        }

        if (this.x - this.size <= 0) {
            this.velX = -this.velX;
        }

        if (this.y + this.size >= height) {
            this.velY = -this.velY;
        }

        if (this.y - this.size <= 0) {
            this.velY = -this.velY;
        }

        this.x += this.velX;
        this.y += this.velY;
    }

    collisionDetect() {
        for (const ball of balls) {
            if (this !== ball && ball.exists) {
                const dx = this.x - ball.x;
                const dy = this.y - ball.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.size + ball.size) {
                    ball.color = this.color = randomRGB();
                    const thisVelX = this.velX;
                    const thisVelY = this.velY;
                    this.velX = ball.velX;
                    this.velY = ball.velY;
                    ball.velX = thisVelX;
                    ball.velY = thisVelY;
                }
            }
        }
    }
}

class Player extends Shape {
    static State = {
        DISABLED: "disabled",
        ENABLED: "enabled",
        RELEASING: "releasing"
    }

    updatePosition() {
        // Position is updated via keyboard events
        if (this.movLeft) {
            this.x -= this.velX;
        }
        if (this.movRight) {
            this.x += this.velX;
        }
        if (this.movUp) {
            this.y -= this.velY;
        }
        if (this.movDown) {
            this.y += this.velY;
        }
    }
    
    constructor(x, y) {
        super(x, y, 10, 10);
        this.color = `rgb(255, 0, 0)`;
        this.size = 20;
        this.state = Player.State.DISABLED;
        this.balls = [];
        this.movLeft = false;
        this.movRight = false;
        this.movUp = false;
        this.movDown = false;

        window.addEventListener("keydown", (event) => {
            if (this.state === Player.State.DISABLED) {
                if (["w", "a", "s", "d"].includes(event.key)) {
                    this.state = Player.State.ENABLED;
                } else {
                    return;
                }
            }

            switch(event.key) {
                case "a":
                    this.movLeft = true;
                    break;
                case "d":
                    this.movRight = true;
                    break;
                case "w":
                    this.movUp = true;
                    break;
                case "s":
                    this.movDown = true;
                    break;
                case "Escape":
                    if (this.state === Player.State.ENABLED) {
                        this.state = Player.State.RELEASING;
                        this.releaseBalls();
                    }
                    break;
            }
        });

        window.addEventListener("keyup", (event) => {
            switch(event.key) {
                case "a":
                    this.movLeft = false;
                    break;
                case "d":
                    this.movRight = false;
                    break;
                case "w":
                    this.movUp = false;
                    break;
                case "s":
                    this.movDown = false;
                    break;
            }
        });
    }

    draw() {
        ctx.beginPath();
        let alpha = 0.8;
        if (this.state === Player.State.DISABLED) {
            alpha = 0.2;
            this.x = width - 50;
            this.y = height - 50;
        } else {
            ctx.font = "10px JetBrains Mono";
            ctx.fillStyle = getColor();
            ctx.fillText("Press ESC to release all the collected balls.", width - 270, height);
        }

        const color = `rgba(${this.color.replace(/[^\d,]/g, " ")}, ${alpha})`;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.font = "20px JetBrains Mono";
        ctx.fillStyle = color;
        this.updatePosition();
        if (this.state === Player.State.DISABLED) {
            ctx.fillText("wa", this.x - (this.size / 5) * 3, this.y - 2);
            ctx.fillText("sd", this.x - (this.size / 5) * 3, this.y + this.size / 1.6);
        } else {
            ctx.fillText(`${this.balls.length}`.padStart(2, "0"), this.x - (this.size / 5) * 3, this.y + this.size / 3);
        }
    }

    checkBounds() {
        if (this.x + this.size >= width) {
            this.x = width - this.size;
        }

        if (this.x - this.size <= 0) {
            this.x = this.size;
        }

        if (this.y + this.size >= height) {
            this.y = height - this.size;
        }

        if (this.y - this.size <= 0) {
            this.y = this.size;
        }
    }

    collisionDetect() {
        if (this.state !== Player.State.ENABLED) {
            return;
        }
        
        for (const ball of balls) {
            if (ball.exists) {
                const dx = this.x - ball.x;
                const dy = this.y - ball.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.size + ball.size) {
                    ball.exists = false;
                    this.balls.push(ball);
                }
            }
        }
    }

    releaseBalls() {
        if (this.balls.length === 0) {
            this.state = Player.State.DISABLED;
            return;
        }

        const ball = this.balls.pop();
        ball.exists = true;
        ball.x = random(this.size, width - this.size);
        ball.y = random(this.size, height - this.size);
    }
}

const balls = [];

while (balls.length < 25) {
    const size = random(4, 4);
    const ball = new Ball(
        random(0 + size, width - size),
        random(0 + size, height - size),
        random(-1, 1),
        random(-1, 1),
        randomRGB(),
        size
    );

    balls.push(ball);
}

function loop() {
    ctx.fillStyle = getBackgroundColor();
    ctx.fillRect(0, 0, width, height);

    for (const ball of balls) {
        if (ball.exists) {
            ball.draw();
            ball.update();
            ball.collisionDetect();
        }
    }

    player.draw();
    player.checkBounds();
    player.collisionDetect();

    if (player.state === Player.State.RELEASING) {
        player.releaseBalls();
    }

    requestAnimationFrame(loop);
}

const player = new Player(width - 50, height - 50);

loop();
