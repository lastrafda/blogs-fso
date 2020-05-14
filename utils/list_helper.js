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
  if(!blogs.length) return undefined
  // copypaste from https://mikeheavers.com/tutorials/getting_the_most_commonly_repeated_object_value_from_an_array_using_lodash/
  const authors = _.map(blogs, 'author')
  const [author, total] = _.chain(authors).countBy().toPairs().maxBy(_.last)
  const response ={
    author: author,
    blogs: total
  }
  return response
}

const mostLikes = (blogs) => {
  if(!blogs.length) return undefined
  const likes = (acc, blog) => {
    let accObj = {...acc}
    accObj[blog.author] = (accObj[blog.author] + blog.likes) || blog.likes
    return accObj
  }
  const authorLikes = _(blogs).reduce(likes, {})
  const greatest  = Object.keys(authorLikes).reduce((a,b) => authorLikes[a] > authorLikes[b] ? a : b)
  return { author: greatest, likes: authorLikes[greatest] }
}

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}