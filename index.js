window.addEventListener("load", function () {
  const canvas = this.document.getElementById("canvas1")
  const ctx = canvas.getContext("2d")
  canvas.width = 500
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
      this.width = 10
      this.height = 3
      this.speed = 3
      this.markedForDeletion = false
    }
    update() {
      this.x += this.speed
      if (this.x > this.game.width) {
        this.markedForDeletion = true
      }
    }
    draw(context) {
      context.fillStyle = "red"
      context.fillRect(this.x, this.y, this.width, this.height)
    }
  }
  class Particle {}
  class Player {
    constructor(game) {
      this.game = game
      this.width = 120
      this.height = 190
      this.x = 20
      this.y = 100
      this.speedY = 0
      this.speedX = 0
      this.maxSpeed = 1
      this.projectiles = []
    }
    update() {
      if (this.game.keys.includes("ArrowUp")) {
        this.speedY += -0.01
      } else if (this.game.keys.includes("ArrowDown")) {
        this.speedY += 0.01
      } else {
        this.speedY = 0
      }
      if (this.game.keys.includes("ArrowLeft")) {
        this.speedX += -0.03
      } else if (this.game.keys.includes("ArrowRight")) {
        this.speedX += 0.03
      } else {
        this.speedX = 0
      }
      this.y += this.speedY
      this.x += this.speedX
      // handle Projectiles
      this.projectiles.forEach((projectile) => {
        projectile.update()
      })
      this.projectiles = this.projectiles.filter(
        (projectile) => !projectile.markedForDeletion
      )
    }
    draw(context) {
      context.fillStyle = "green"
      context.fillRect(this.x, this.y, this.width, this.height)
      this.projectiles.forEach((projectile) => {
        projectile.draw(context)
      })
    }
    shootTop() {
      if (this.game.ammo > 0) {
        this.projectiles.push(new Projectile(this.game, this.x, this.y))
        console.log(this.projectiles)
        this.game.ammo--
      }
    }
  }
  class Enemy {
    constructor(game) {
      this.game = game
      this.x = this.game.width
      this.speedX = Math.random() * -1.5 - 0.5
      this.markedForDeletion = false
    }
    update() {
      this.x += this.speedX
      if (this.x + this.width < 0) {
        this.markedForDeletion = true
      }
    }
    draw(context) {
      context.fillStyle = "red"
      context.fillRect(this.x, this.y, this.width, this.height)
    }
  }
  class Angler1 extends Enemy {
    constructor(game) {
      super(game)
      this.width = 220 * 0.2
      this.height = 100 * 0.2
      this.y = Math.random() * (this.game.height * 0.9 - this.height)
    }
  }
  class Layer {}
  class Background {}
  class UI {
    constructor(game) {
      this.game = game
      this.fontSize = 25
      this.fontFamily = "Helvetica"
      this.color = "white"
    }
    draw(context) {
      //amo
      context.fillStyle = this.color
      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(5 * i, 50, 3, 20)
      }
    }
  }
  class Game {
    //! Constructor on javascript class is a special type of method that will run once when we instantiate the class using the new keyword. It will create one new blank object and it will give it values and properties as defined inside the blueprint
    constructor(width, height) {
      this.width = width
      this.height = height
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
    }
    update(deltaTime) {
      this.player.update()
      if (this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo) this.ammo++
        this.ammoTimer = 0
      } else {
        this.ammoTimer += deltaTime
      }
      this.enemies.forEach((enemy) => {
        enemy.update()
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
      this.player.draw(context)
      this.ui.draw(context)
      this.enemies.forEach((enemy) => enemy.draw(context))
    }
    addEnemy() {
      this.enemies.push(new Angler1(this))
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
