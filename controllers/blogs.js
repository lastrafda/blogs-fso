const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { tokenExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', tokenExtractor, async (request, response) => {
  const body = request.body
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  const user = await User.findById(decodedToken.id)
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id,
  })
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)

  /** This is how it looks without async/await */
  // blog
  //   .save()
  //   .then((result) => response.status(201).json(result))
  //   .catch((error) => next(error))
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  })
  response.json(updatedBlog)
  /** This is how it looks without async/await */
  // Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  //   .then((updatedBlog) => {
  //     response.json(updatedBlog)
  //   })
  //   .catch((error) => next(error))
})

blogsRouter.delete('/:id', tokenExtractor, async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  const user = await User.findById(decodedToken.id)
  const blog = await Blog.findById(request.params.id)

  if (user._id.toString() === blog.user.toString()) {
    await blog.deleteOne()
    return response.status(204).end()
  }

  return response
    .status(401)
    .json({ error: 'Only the author of this blog post can delete it' })
})

module.exports = blogsRouter
