const mongoose = require('mongoose')
const helper = require('./blogs_helper')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const { blogsInDb, initialBlogs } = require('./blogs_helper')
const blogs_helper = require('./blogs_helper')

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

test('like property defaults to 0 when creating a blogs without it', async () => {
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

test('it sends a 400 status code when no title or url are provided', async () => {
  const newBlog = {
    author: 'myself',
  }
  await api.post('/api/blogs').send(newBlog).expect(400)

  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(initialBlogs.length)
})

//REFACTORING TESTS
// 4.13
test('deletion of a blog', async () => {
  const blogsAtStart = await blogs_helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

  const blogsAtEnd = await blogs_helper.blogsInDb()
  expect(blogsAtEnd.length).toBe(blogs_helper.initialBlogs.length - 1)
  const titles = blogsAtEnd.map((b) => b.title)
  expect(titles).not.toContain(blogToDelete.title)
})
//4.14
test('modification of a blog', async () => {
  const blogsAtStart = await blogs_helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]
  const newData = {
    ...blogToUpdate,
    likes: 123,
  }
  const updatedBlog = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(newData)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  expect(updatedBlog.body.title).toBe(blogToUpdate.title)
  expect(updatedBlog.body.likes).toBe(123)
  const blogsAtEnd = await blogs_helper.blogsInDb()
  expect(blogsAtEnd.length).toBe(blogs_helper.initialBlogs.length)
})

afterAll(async () => {
  await Blog.deleteMany({})
  mongoose.connection.close()
})
