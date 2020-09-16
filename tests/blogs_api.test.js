const mongoose = require('mongoose')
const helper = require('./blogs_helper')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const { blogsInDb, initialBlogs } = require('./blogs_helper')

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

/**
 * 4.10
 */
test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'a simple blog',
    author: 'myself',
    url: 'localhost',
    likes: '15',
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const title = response.body.map((r) => r.title)
  expect(response.body).toHaveLength(initialBlogs.length + 1)
  expect(title).toContain('a simple blog')
})

test('it checks if the like property defaults to 0 when creating a blogs without it', async () => {
  const newBlog = {
    title: 'a simple blog that noone likes',
    author: 'myself',
    url: 'localhost',
  }
  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  expect(response.body.likes).toBe(0)
})

afterAll(() => {
  mongoose.connection.close()
})
