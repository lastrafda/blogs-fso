const mongoose = require('mongoose')
const helper = require('./blogs_helper')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const { blogsInDb } = require('./blogs_helper')

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(helper.initialBlogs[0])
  await blogObject.save()

  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})
/**
 * Verifies that the unique identifier property of the blog posts
 * is named id, by default the database names the property _id
 */
test('it renames the id attribute', async () => {
  const blogs = blogsInDb()
  ;(await blogs).map((blog) => {
    expect(blog.id).toBeDefined()
  })
})

afterAll(() => {
  mongoose.connection.close()
})
