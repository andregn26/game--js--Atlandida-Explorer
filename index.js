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
        // console.log(e)
      })
      window.addEventListener("keyup", (e) => {
        if (this.game.keys.indexOf(e.key) > -1) {
          this.game.keys.splice(this.game.keys.indexOf(e.key), 1)
        }
        // console.log(this.game.keys)
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
      if (this.x > this.game.width) {
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
      this.bottomBounceBoundary = Math.random() * 100 + 60
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
      this.width = 120
      this.height = 190
      this.x = 20
      this.y = 100
      this.frameX = 0
      this.frameY = 0
      this.maxFrame = 37
      this.speedY = 0
      this.speedX = 0
      this.maxSpeedY = 0.1
      this.maxSpeedX = 0.3
      this.projectiles = []
      this.image = document.getElementById("player")
      this.powerUp = false
      this.powerUpTimer = 0
      this.powerUpLimit = 10000
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
      if (this.frameX < this.maxFrame) {
        this.frameX++
      } else {
        this.frameX = 0
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
        console.log(this.projectiles)
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
      this.game.ammo = this.game.maxAmmo
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
      this.maxFrame = 37
    }
    update() {
      this.x += this.speedX - this.game.speed
      if (this.x + this.width < 0) {
        this.markedForDeletion = true
      }
      if (this.frameX < this.maxFrame) {
        this.frameX++
      } else this.frameX = 0
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
  class Angler1 extends Enemy {
    constructor(game) {
      super(game)
      this.width = 228
      this.height = 169
      this.lives = 2
      this.score = this.lives
      this.y = Math.random() * (this.game.height * 0.9 - this.height)
      this.image = document.getElementById("angler1")
      this.frameY = Math.floor(Math.random() * 3)
    }
  }
  class Angler2 extends Enemy {
    constructor(game) {
      super(game)
      this.game = game
      this.width = 213
      this.height = 165
      this.lives = 3
      this.score = this.lives
      this.y = Math.random() * this.game.height * 0.9 - this.height
      this.image = document.getElementById("angler2")
      this.frameY = Math.floor(Math.random() * 2)
    }
  }
  class luckyFish extends Enemy {
    constructor(game) {
      super(game)
      this.game = game
      this.width = 99
      this.height = 95
      this.lives = 3
      this.score = 15
      this.y = Math.random() * this.game.height * 0.9 - this.height
      this.image = document.getElementById("lucky")
      this.frameY = Math.floor(Math.random() * 2)
      this.type = "lucky"
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
  class Background {
    constructor(game) {
      this.game = game
      this.image1 = document.getElementById("layer1")
      this.image2 = document.getElementById("layer2")
      this.image3 = document.getElementById("layer3")
      this.image4 = document.getElementById("layer4")
      this.layer1 = new Layer(this.game, this.image1, 0.2)
      this.layer2 = new Layer(this.game, this.image2, 0.4)
      this.layer3 = new Layer(this.game, this.image3, 1)
      this.layer4 = new Layer(this.game, this.image4, 1.5)
      this.layers = [this.layer1, this.layer2, this.layer3]
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
      this.fontFamily = "Helvetica"
      this.color = "white"
    }
    draw(context) {
      // score
      context.save()
      context.shadowOffsetX = 2
      context.shadowOffsetY = 2
      context.shadowColor = "black"
      context.fillStyle = this.color
      context.font = `${this.fontSize}px ${this.fontFamlily}`
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
          message2 = `well done! You destroyed ${this.game.score / 5} enemies`
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
      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(5 * i + 20, 50, 3, 20)
      }

      context.restore()
    }
  }
  class Game {
    //! Constructor on javascript class is a special type of method that will run once when we instantiate the class using the new keyword. It will create one new blank object and it will give it values and properties as defined inside the blueprint
    constructor(width, height) {
      this.width = width
      this.height = height
      this.background = new Background(this)
      this.player = new Player(this)
      this.input = new InputHandler(this)
      this.ui = new UI(this)
      this.keys = []
      this.ammo = 20
      this.maxAmmo = 50
      this.ammoTimer = 0
      this.ammoInterval = 500
      this.enemies = []
      this.enemyTimer = 0
      this.enemyInterval = 1000
      this.gameOver = false
      this.score = 0
      this.winningScore = 400
      this.gameTime = 0
      this.timeLimit = 60000
      this.speed = 1
      this.particles = []
      this.debug = true
    }
    update(deltaTime) {
      if (!this.gameOver) {
        this.gameTime += deltaTime
      }
      if (this.gameTime > this.timeLimit) {
        this.gameOver = true
      }
      this.background.update()
      this.background.layer4.update()
      this.particles.forEach((particle) => particle.update())
      this.particles = this.particles.filter(
        (particle) => !particle.markedForDeletion
      )
      this.player.update(deltaTime)
      if (this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo) this.ammo++
        this.ammoTimer = 0
      } else {
        this.ammoTimer += deltaTime
      }
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
          if (enemy.type === "lucky") {
            this.player.enterPowerUp()
          } else this.score--
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
              if (this.score > this.winningScore) {
                this.gameOver = true
              }
            }
          }
        })
      })
      this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion)
      if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
        this.addEnemy()
        this.enemyTimer = 0
      } else {
        this.enemyTimer += deltaTime
      }
    }
    draw(context) {
      this.background.draw(context)
      this.player.draw(context)
      this.ui.draw(context)
      this.particles.forEach((particle) => particle.draw(context))
      this.enemies.forEach((enemy) => enemy.draw(context))
      this.background.layer4.draw(context)
    }
    addEnemy() {
      const randomize = Math.random()
      if (randomize < 0.5) {
        this.enemies.push(new Angler1(this))
      } else if (randomize < 0.7) {
        this.enemies.push(new luckyFish(this))
      } else this.enemies.push(new Angler2(this))
    }
    checkCollision(rect1, rect2) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.height + rect1.y > rect2.y
      )
    }
  }
  //! new keyword will look for class with that name. It will find it on line 32 and it will run its constructor method to create one new blank javascript object, and assign it values and properties based on the blueprint here on line 46
  const game = new Game(canvas.width, canvas.height)

  //! last time job will be to store a value of timestamp from the previous animation loop so that we can compare it against the value of timestamp from this animation loop this difference will give us delta time the difference in milliseconds between the timestamp from this loop and the timestamp from the previous loop
  let lastTime = 0

  //animation loop
  function animate(timeStamp) {
    //! delta time is the difference in milliseconds between the timestamp from this loop and the timestamp from the previous loop
    const deltaTime = timeStamp - lastTime
    lastTime = timeStamp
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    game.update(deltaTime)
    game.draw(ctx)
    requestAnimationFrame(animate)
  }
  animate(0)
  // console.log(player)
})
