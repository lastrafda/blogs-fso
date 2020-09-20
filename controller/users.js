const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    title: 1,
    url: 1,
    likes: 1,
  })
  response.json(users)
})

usersRouter.post('/', async (request, response, next) => {
  try {
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
  } catch (error) {
    next(error)
  }
})

module.exports = usersRouter
