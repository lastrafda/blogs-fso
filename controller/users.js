const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users.map((u) => u.toJSON()))
})

usersRouter.post('/', async (request, response) => {
  const body = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const users = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  const savedUser = await users.save()

  response.json(savedUser)
})

module.exports = usersRouter
