//Buttons
let startButton = document.getElementById("startButton")
let stopButton = document.getElementById("stopButton")
let resetButton = document.getElementById("resetButton")
let instructionsButton = document.getElementById("instructionsButton")
let mainMenuButton = document.getElementById("mainMenuButton")

//Menus
let startWindow = document.getElementById("startWindow")
let instructionsWindow = document.getElementById("instructionsWindow")

window.addEventListener("load", function () {
  const canvas = this.document.getElementById("canvas1")
  const ctx = canvas.getContext("2d")
  canvas.width = 1300
  canvas.height = 500

  //! we need to declare our classes in a specific order. Class declarations are hoisted in javascript but they stay uninitialized when hosted. That means while javascript will be able to find the reference for a class name we create, it cannot use the class before it is defined in the code.

  class InputHandler {
    constructor(game) {
      this.game = game
      window.addEventListener("keydown", (e) => {
        if (
          (e.key === "ArrowUp" ||
            e.key === "ArrowDown" ||
            e.key === "ArrowRight" ||
            e.key === "ArrowLeft") &&
          this.game.keys.indexOf(e.key) === -1
        ) {
          this.game.keys.push(e.key)
        } else if (e.key === " ") {
          this.game.player.shootTop()
        } else if (e.key === "D" || e.key === "d") {
          this.game.debug = !this.game.debug
        }
      })
      window.addEventListener("keyup", (e) => {
        if (this.game.keys.indexOf(e.key) > -1) {
          this.game.keys.splice(this.game.keys.indexOf(e.key), 1)
        }
      })
    }
  }
  class Projectile {
    constructor(game, x, y) {
      this.game = game
      this.x = x
      this.y = y
      this.width = 30
      this.height = 10
      this.speed = 3
      this.markedForDeletion = false
      this.image = document.getElementById("projectile")
    }
    update() {
      this.x += this.speed
      if (this.x > this.game.width - 150) {
        this.markedForDeletion = true
      }
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y)
      if (this.game.debug) {
        context.fillStyle = "red"
        context.strokeRect(this.x, this.y, this.width, this.height)
      }
    }
  }
  class Particle {
    constructor(game, x, y) {
      this.game = game
      this.x = x
      this.y = y
      this.image = document.getElementById("gears")
      this.frameX = Math.floor(Math.random() * 3)
      this.frameY = Math.floor(Math.random() * 3)
      this.spriteSize = 50
      this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1)
      this.size = this.spriteSize * this.sizeModifier
      this.speedX = Math.random() * 6 - 3
      this.speedY = Math.random() * -15
      this.gravity = 0.5
      this.markedForDeletion = false
      this.angle = 0
      this.velocityOfAngle = Math.random() * 2 - 0.1
      this.bounced = 0
      this.bottomBounceBoundary = Math.random() * 80 + 50
    }
    update() {
      this.angle += this.velocityOfAngle
      this.speedY += this.gravity
      this.x -= this.speedX + this.game.speed
      this.y += this.speedY
      if (this.y > this.game.height + this.size || this.x < 0 - this.size)
        this.markedForDeletion = true
      if (
        this.y > this.game.height - this.bottomBounceBoundary &&
        this.bounced < 2
      ) {
        this.bounced = this.speedY *= -0.7
      }
    }
    draw(context) {
      context.save()
      context.translate(this.x, this.y)
      context.rotate(this.angle)
      context.drawImage(
        this.image,
        this.frameX * this.spriteSize,
        this.frameY * this.spriteSize,
        this.spriteSize,
        this.spriteSize,
        this.size * -0.5,
        this.size * -0.5,
        this.size,
        this.size
      )
      context.restore()
    }
  }
  class Player {
    constructor(game) {
      this.game = game
      this.width = 191
      this.height = 92
      this.x = 20
      this.y = 170
      this.frameX = 0
      this.frameY = 0
      this.maxFrame = 23
      this.speedY = 0
      this.speedX = 0
      this.maxSpeedY = 0.1
      this.maxSpeedX = 0.3
      this.projectiles = []
      this.image = document.getElementById("player1")
      this.powerUp = false
      this.powerUpTimer = 0
      this.powerUpLimit = 10000
      this.timer = 0
      this.fps = 30
      this.interval = 1000 / this.fps
    }
    update(deltaTime) {
      if (this.game.keys.includes("ArrowUp")) {
        this.speedY += -this.maxSpeedY
      } else if (this.game.keys.includes("ArrowDown")) {
        this.speedY += this.maxSpeedY
      } else {
        this.speedY = 0
      }
      if (this.game.keys.includes("ArrowLeft")) {
        this.speedX += -this.maxSpeedX
      } else if (this.game.keys.includes("ArrowRight")) {
        this.speedX += this.maxSpeedX
      } else {
        this.speedX = 0
      }
      this.y += this.speedY
      this.x += this.speedX
      //handle boundaries
      if (this.y > this.game.height - this.height * 0.5) {
        this.y = this.game.height - this.height * 0.5
      } else if (this.y < -this.height * 0.5) {
        this.y = -this.height * 0.5
      }
      // handle Projectiles
      this.projectiles.forEach((projectile) => {
        projectile.update()
      })
      this.projectiles = this.projectiles.filter(
        (projectile) => !projectile.markedForDeletion
      )
      //animate Sprite
      if (this.timer > this.interval) {
        if (this.frameX < this.maxFrame) {
          this.frameX++
          this.timer = 0
        } else {
          this.frameX = 0
        }
      } else {
        this.timer += deltaTime
      }

      //powerUp
      if (this.powerUp) {
        if (this.powerUpTimer > this.powerUpLimit) {
          this.powerUpTimer = 0
          this.powerUp = false
          this.frameY = 0
        } else {
          this.powerUpTimer += deltaTime
          this.frameY = 1
          this.game.ammo += 0.1
        }
      }
    }
    draw(context) {
      if (this.game.debug) {
        context.fillStyle = "black"
        context.strokeRect(this.x, this.y, this.width, this.height)
      }
      this.projectiles.forEach((projectile) => {
        projectile.draw(context)
      })
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      )
    }
    shootTop() {
      if (this.game.ammo > 0) {
        this.projectiles.push(
          new Projectile(this.game, this.x + 95, this.y + 35)
        )

        this.game.ammo--
      }
      if (this.powerUp) this.shootBottom()
    }
    shootBottom() {
      if (this.game.ammo > 0) {
        this.projectiles.push(
          new Projectile(this.game, this.x + 95, this.y + 70)
        )
      }
    }
    enterPowerUp() {
      this.powerUpTimer = 0
      this.powerUp = true
      if (this.game.ammo < this.game.maxAmmo) this.game.ammo = this.game.maxAmmo
    }
  }
  class Enemy {
    constructor(game) {
      this.game = game
      this.x = this.game.width
      this.speedX = Math.random() * -1.5 - 0.5
      this.markedForDeletion = false
      this.frameX = 0
      this.frameY = 0
      // this.maxFrame = 0
    }
    update() {
      this.x += this.speedX - this.game.speed
      if (this.x + this.width < 0) {
        this.markedForDeletion = true
      }
      //! uncoment this code when all the spriteshhets are ready
      // if (this.frameX < this.maxFrame) {
      //   this.frameX++
      // } else this.frameX = 0
    }
    draw(context) {
      if (this.game.debug) {
        context.strokeRect(this.x, this.y, this.width, this.height)
        context.fillStyle = "white"
        context.font = "20px Helvetica"
        context.fillText(this.lives, this.x, this.y)
      }

      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      )
    }
  }
  class MediumEnemy1 extends Enemy {
    constructor(game) {
      super(game)
      this.width = 128
      this.height = 93
      this.lives = 2
      this.score = this.lives
      this.y = Math.random() * (this.game.height * 0.95 - this.height)
      this.image = document.getElementById("mediumEnemy1")
      this.frameY = 0
    }
  }
  class MediumEnemy2 extends Enemy {
    constructor(game) {
      super(game)
      this.game = game
      this.width = 123
      this.height = 121
      this.lives = 3
      this.score = this.lives
      this.y = Math.random() * this.game.height * 0.95 - this.height
      this.image = document.getElementById("mediumEnemy2")
      this.frameY = 0
    }
  }
  class Treasure extends Enemy {
    constructor(game) {
      super(game)
      this.game = game
      this.width = 99
      this.height = 95
      this.lives = 3
      this.score = 15
      this.y = Math.random() * this.game.height * 0.95 - this.height
      this.image = document.getElementById("treasure")
      this.frameY = 0
      this.type = "treasure"
    }
  }
  class BigEnemy extends Enemy {
    constructor(game) {
      super(game)
      this.game = game
      this.width = 320
      this.height = 181
      this.lives = 20
      this.score = this.lives
      this.y = Math.random() * this.game.height * 0.95 - this.height
      this.image = document.getElementById("bigEnemy")
      this.frameY = 0
      this.type = "hive"
      this.speedX = Math.random() * -0.4 - 0.2
    }
  }

  class SmallEnemy extends Enemy {
    constructor(game, x, y) {
      super(game)
      this.game = game
      this.width = 115
      this.height = 36
      this.lives = 3
      this.score = this.lives
      this.y = y
      this.x = x
      this.image = document.getElementById("smallEnemy")
      this.frameY = 0
      this.type = "smallEnemy"
      this.speedX = Math.random() * -4.2 - 1.2
    }
  }
  class Layer {
    constructor(game, image, speedModifier) {
      this.game = game
      this.image = image
      this.speedModifier = speedModifier
      this.width = 1768
      this.height = 500
      this.x = 0
      this.y = 0
    }
    update() {
      if (this.x <= -this.width) this.x = 0
      this.x -= this.game.speed * this.speedModifier
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y)
      context.drawImage(this.image, this.x + this.width, this.y)
    }
  }

  class Explosion {
    constructor(game, x, y) {
      this.game = game
      this.frameX = 0
      this.spriteHeight = 200
      this.spriteWidth = 200
      this.timer = 0
      this.fps = 30
      this.interval = 1000 / this.fps
      this.markedForDeletion = false
      this.maxFrame = 8
    }
    update(deltaTime) {
      this.x -= this.game.speed
      if (this.timer > this.interval) {
        this.frameX++
        this.timer = 0
      } else {
        this.timer += deltaTime
      }
      if (this.frameX > this.maxFrame) this.markedForDeletion = true
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      )
    }
  }
  class SmokeExplosion extends Explosion {
    constructor(game, x, y) {
      super(game, x, y)
      this.image = document.getElementById("smokeExplosion")
      this.width = this.spriteWidth
      this.height = this.spriteHeight
      this.x = x - this.width * 0.5
      this.y = y - this.height * 0.5
    }
  }
  class FireExplosion extends Explosion {
    constructor(game, x, y) {
      super(game, x, y)
      this.image = document.getElementById("fireExplosion")
      this.width = this.spriteWidth
      this.height = this.spriteHeight
      this.x = x - this.width * 0.5
      this.y = y - this.height * 0.5
    }
  }
  class Background {
    constructor(game) {
      this.game = game
      this.image1 = document.getElementById("layer1")
      this.image2 = document.getElementById("layer2")
      this.image4 = document.getElementById("layer4")
      this.layer1 = new Layer(this.game, this.image1, 0.2)
      this.layer2 = new Layer(this.game, this.image2, 0.4)
      this.layer4 = new Layer(this.game, this.image4, 1.5)
      this.layers = [this.layer1, this.layer2, this.layer4]
    }
    update() {
      this.layers.forEach((layer) => layer.update())
    }
    draw(context) {
      this.layers.forEach((layer) => layer.draw(context))
    }
  }
  class UI {
    constructor(game) {
      this.game = game
      this.fontSize = 25
      this.fontFamily = "Corben"
      this.color = "white"
    }
    draw(context) {
      // score
      context.save()
      context.shadowOffsetX = 2
      context.shadowOffsetY = 2
      context.shadowColor = "black"
      context.fillStyle = this.color
      context.font = `${this.fontSize}px ${this.fontFamily}`
      context.fillText(`Score ${this.game.score}`, 20, 40)

      //Timer
      const formattedTime = (this.game.gameTime * 0.001).toFixed(1)
      context.fillText(formattedTime, 20, 100)

      //Game Over
      if (this.game.gameOver) {
        context.textAlign = "center"
        let message1
        let message2
        if (this.game.score > this.game.winningScore) {
          context.textAlign = "center"
          message1 = "You Won!"
          message2 = `well done!`
        } else {
          message1 = "You Loose"
          message2 = `try again `
        }
        context.font = `50px ${this.fontFamily}`
        context.fillText(
          message1,
          this.game.width * 0.5,
          this.game.height * 0.5 - 40
        )
        context.font = `25px ${this.fontFamily}`
        context.fillText(
          message2,
          this.game.width * 0.5,
          this.game.height * 0.5 + 40
        )
      }

      //amo
      if (this.game.player.powerUp) context.fillStyle = "#ffffbd"
      if (!this.game.gameOver) {
        for (let i = 0; i < this.game.ammo; i++) {
          context.fillRect(5 * i + 20, 50, 3, 20)
        }
      }

      context.restore()
    }
  }

  //! Constructor on javascript class is a special type of method that will run once when we instantiate the class using the new keyword. It will create one new blank object and it will give it values and properties as defined inside the blueprint
  class Game {
    constructor(width, height) {
      this.width = width
      this.height = height
      this.background = new Background(this)
      this.player = new Player(this)
      this.input = new InputHandler(this)
      this.ui = new UI(this)
      this.keys = []
      this.enemies = []
      this.particles = []
      this.explosions = []
      this.ammo = 20
      this.maxAmmo = 50
      this.maxAmmoPowerUp = 75
      this.ammoTimer = 0
      this.ammoInterval = 500
      this.enemyTimer = 0
      this.enemyInterval = 1000
      this.gameOver = false
      this.score = 0
      this.winningScore = 300
      this.gameTime = 0
      this.timeLimit = 60000
      this.speed = 1
      this.debug = false
    }
    checkCollision(rect1, rect2) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.height + rect1.y > rect2.y
      )
    }
    addEnemiesToArray() {
      const randomize = Math.random()
      if (randomize < 0.3) {
        this.enemies.push(new MediumEnemy1(this))
      } else if (randomize < 0.6) {
        this.enemies.push(new MediumEnemy2(this))
      } else if (randomize < 0.8) {
        this.enemies.push(new Treasure(this))
      } else if (randomize < 1) {
        this.enemies.push(new BigEnemy(this))
      }
    }
    addExplosionsToArray(enemy) {
      const randomize = Math.random()
      if (randomize < 0.5) {
        this.explosions.push(
          new SmokeExplosion(
            this,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5
          )
        )
      } else {
        this.explosions.push(
          new FireExplosion(
            this,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5
          )
        )
      }
    }
    createSmokeExplosion(deltaTime) {
      this.explosions.forEach((explosion) => explosion.update(deltaTime))
      this.explosions = this.explosions.filter(
        (explosion) => !explosion.markedForDeletion
      )
    }
    createEnemy(deltaTime) {
      this.enemies.forEach((enemy) => {
        enemy.update()
        if (this.checkCollision(this.player, enemy)) {
          for (let i = 0; i < 10; i++) {
            this.particles.push(
              new Particle(
                this,
                enemy.x + enemy.width * 0.5,
                enemy.y + enemy.height * 0.5
              )
            )
          }
          enemy.markedForDeletion = true
          if (!this.gameOver) {
            if (enemy.type === "treasure") {
              this.player.enterPowerUp()
            } else this.score -= enemy.lives
          }
        }
        this.player.projectiles.forEach((projectile) => {
          if (this.checkCollision(projectile, enemy)) {
            enemy.lives--
            this.particles.push(
              new Particle(
                this,
                enemy.x + enemy.width * 0.5,
                enemy.y + enemy.height * 0.5
              )
            )
            projectile.markedForDeletion = true
            if (enemy.lives <= 0) {
              enemy.markedForDeletion = true
              this.addExplosionsToArray(enemy)

              if (enemy.type === "hive") {
                for (let i = 0; i < 5; i++) {
                  this.enemies.push(
                    new SmallEnemy(
                      this,
                      enemy.x + Math.random() * enemy.width,
                      enemy.y + Math.random() * enemy.height
                    )
                  )
                }
              }
              for (let i = 0; i < 3; i++) {
                this.particles.push(
                  new Particle(
                    this,
                    enemy.x + enemy.width * 0.5,
                    enemy.y + enemy.height * 0.5
                  )
                )
              }
              if (!this.gameOver) {
                this.score += enemy.score
              }
            }
          }
        })
      })
      this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion)
      if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
        this.addEnemiesToArray()
        this.enemyTimer = 0
      } else {
        this.enemyTimer += deltaTime
      }
    }
    createParticle() {
      this.particles.forEach((particle) => particle.update())
      this.particles = this.particles.filter(
        (particle) => !particle.markedForDeletion
      )
    }
    restoreAmmo(deltaTime) {
      if (this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo) this.ammo++
        this.ammoTimer = 0
      } else {
        this.ammoTimer += deltaTime
      }
    }
    update(deltaTime) {
      if (!this.gameOver) {
        this.gameTime += deltaTime
      }
      if (this.gameTime > this.timeLimit || this.score < 0) {
        this.gameOver = true
        this.ammo = 0
      }
      this.background.update()
      this.background.layer4.update()
      this.player.update(deltaTime)
      //! Creating the PARTICLES array
      this.createParticle()
      //! Creating the EXPLOSIONS array
      this.createSmokeExplosion(deltaTime)

      //! Restore AMMO
      this.restoreAmmo(deltaTime)
      //! Creating the ENEMIES and the ENEMIES array
      this.createEnemy(deltaTime)
    }
    draw(context) {
      this.background.draw(context)
      this.player.draw(context)
      this.ui.draw(context)
      this.particles.forEach((particle) => particle.draw(context))
      this.explosions.forEach((explosion) => explosion.draw(context))
      this.enemies.forEach((enemy) => enemy.draw(context))

      this.background.layer4.draw(context)
    }
  }
  //! new keyword will look for class with that name. It will find it on line 32 and it will run its constructor method to create one new blank javascript object, and assign it values and properties based on the blueprint here on line 46
  const game = new Game(canvas.width, canvas.height)
  //! last time job will be to store a value of timestamp from the previous animation loop so that we can compare it against the value of timestamp from this animation loop this difference will give us delta time the difference in milliseconds between the timestamp from this loop and the timestamp from the previous loop
  let lastTime = 0
  let requestId

  //animation loop
  let animate = (timeStamp) => {
    const deltaTime = timeStamp - lastTime
    lastTime = timeStamp

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    game.draw(ctx)
    game.update(deltaTime)
    requestId = requestAnimationFrame(animate)
  }

  function startGame() {
    //! delta time is the difference in milliseconds between the timestamp from this loop and the timestamp from the previous loop

    animate(0)
  }

  startButton.addEventListener("click", (e) => {
    startGame()
    e.preventDefault()
    e.stopPropagation()

    startButton.disabled = true
    stopButton.disabled = false
    startWindow.classList.add("d-none")
    instructionsWindow.classList.add("d-none")
    canvas.classList.remove("d-none")
    instructionsButton.classList.add("d-none")
    resetButton.classList.remove("d-none")
    stopButton.classList.remove("d-none")
    mainMenuButton.classList.add("d-none")
    startButton.innerHTML = "Continue Game"
  })
  stopButton.addEventListener("click", (e) => {
    e.preventDefault()
    e.stopPropagation()
    cancelAnimationFrame(requestId)
    startButton.disabled = false
    stopButton.disabled = true
  })
  resetButton.addEventListener("click", (e) => {
    e.stopPropagation()
    location.reload()
  })
  instructionsButton.addEventListener("click", (e) => {
    e.stopPropagation()
    e.preventDefault()
    startButton.classList.add("d-none")
    startWindow.classList.add("d-none")
    instructionsWindow.classList.remove("d-none")
    stopButton.classList.add("d-none")
    canvas.classList.add("d-none")
    mainMenuButton.classList.remove("d-none")
    instructionsButton.classList.add("d-none")
  })
  mainMenuButton.addEventListener("click", (e) => {
    location.reload()
  })
})
