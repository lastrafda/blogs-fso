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
  let blogObjects = helper.initialBlogs.map((blog) => new Blog(blog))
  const promiseArray = blogObjects.map((blog) => blog.save())
  await Promise.all(promiseArray)
})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })
})

describe('viewing a specific blog', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]
    console.log(blogToView)
    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const processedBlogToView = JSON.parse(JSON.stringify(blogToView))
    expect(resultBlog.body).toEqual(processedBlogToView)
  })

  test('fails with status code 404 if blogs does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api.get(`/api/blogs/${validNonexistingId}`).expect(404)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'
    await api.get(`/api/blogs/${invalidId}`).expect(400)
  })
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
