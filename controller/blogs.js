const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs.map((blog) => blog.toJSON()))
})

blogsRouter.post('/', async (request, response, next) => {
  const blog = new Blog(request.body)
  try {
    const savedBlog = await blog.save()
    response.status(201).json(savedBlog.toJSON())
  } catch (error) {
    next(error)
  }
  /** This is how it looks without async/await */
  // blog
  //   .save()
  //   .then((result) => response.status(201).json(result))
  //   .catch((error) => next(error))
})

blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
      response.json(blog.toJSON())
    } else {
      response.status(404).end()
    }
  } catch (error) {
    response.status(400).end()
    next(error)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
      new: true,
    })
    response.json(updatedBlog.toJSON())
  } catch (error) {
    next(error)
  }
  /** This is how it looks without async/await */
  // Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  //   .then((updatedBlog) => {
  //     response.json(updatedBlog.toJSON())
  //   })
  //   .catch((error) => next(error))
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = blogsRouter
