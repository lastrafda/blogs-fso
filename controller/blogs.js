const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', (request, response, next) => {
  Blog.find({})
    .then((blogs) => {
      if (blogs) {
        response.json(blogs)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

blogsRouter.post('/', (request, response) => {
  const blog = new Blog(request.body)
  if (typeof blog.likes === 'undefined') {
    blog.likes = 0
  }

  blog.save().then((result) => {
    response.status(201).json(result)
  })
})

module.exports = blogsRouter
