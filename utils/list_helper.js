const _ = require('lodash')

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes
  }

  return blogs.length === 0 ? 0 : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const reducer = (max, cur) => {
    return cur.likes > max.likes ? cur : max
  }
  return blogs.length === 0 ? 0 : blogs.reduce(reducer, blogs[0])
}

const mostBlogs = (blogs) => {
  // copypaste from https://mikeheavers.com/tutorials/getting_the_most_commonly_repeated_object_value_from_an_array_using_lodash/
  const authors = _.map(blogs, 'author')
  const [author, total] = _.chain(authors).countBy().toPairs().maxBy(_.last)
  const response ={
    author: author,
    blogs: total
  }
  return blogs.length ? response : {}
}

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs
}