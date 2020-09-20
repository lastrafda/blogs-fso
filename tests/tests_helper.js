const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'testing is iamverysmart',
    author: 'José Lastra',
    url: 'localhost',
    likes: '70',
  },
  {
    title: 'but not everyone likes it (I"m talking to you boss)',
    author: 'José Lastra',
    url: 'localhost',
    likes: '70',
  },
]

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'willremovethissoon',
    author: 'none',
    url: 'localhost',
    likes: '4',
  })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((b) => b.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((u) => u.toJSON())
}

module.exports = { initialBlogs, blogsInDb, nonExistingId, usersInDb }
