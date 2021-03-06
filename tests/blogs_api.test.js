const mongoose = require('mongoose')
const helper = require('./tests_helper')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const { blogsInDb, initialBlogs } = require('./tests_helper')
let token

beforeEach(async () => {
  /** Creates a new user and set the jwt token */
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('secret', 10)
  const user = new User({ username: 'root', passwordHash })
  await user.save()
  const loginResponse = await api.post('/api/login').send({
    username: 'root',
    password: 'secret',
  })
  token = loginResponse.body.token

  await Blog.deleteMany({})
  let blogObjects = helper.initialBlogs.map(
    (blog) => new Blog({ ...blog, user: user._id })
  )
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

describe('addition of a new blog', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'a simple blog',
      author: 'myself',
      url: 'localhost',
      likes: '15',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const titles = response.body.map((r) => r.title)
    expect(response.body).toHaveLength(initialBlogs.length + 1)
    expect(titles).toContain('a simple blog')
  })

  test('like property defaults to 0 when creating a blogs without it', async () => {
    const newBlog = {
      title: 'a simple blog that noone likes',
      author: 'myself',
      url: 'localhost',
    }
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toBe(0)
  })

  test('it sends a 400 status code when no title or url are provided', async () => {
    const newBlog = {
      author: 'myself',
    }
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(helper.initialBlogs.length - 1)
    const titles = blogsAtEnd.map((b) => b.title)
    expect(titles).not.toContain(blogToDelete.title)
  })

  test('fails with status code 401 if jwt token is invalid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
    const response = await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `bearer ${token}fail`)
      .expect(401)
    expect(response.body).toEqual({ error: 'invalid token' })
  })
})

describe('modification of a blog', () => {
  test('succeeds with valid data', async () => {
    const blogsAtStart = await helper.blogsInDb()
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
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(helper.initialBlogs.length)
  })
})

afterAll(async () => {
  await Blog.deleteMany({})
  mongoose.connection.close()
})
