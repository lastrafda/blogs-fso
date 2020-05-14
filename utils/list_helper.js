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

module.exports = {
  totalLikes,
  favoriteBlog
}