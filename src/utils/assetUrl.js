const API_ORIGIN = 'http://159.75.169.224:1235'
const FALLBACK_IMAGE = 'https://file.itndedu.com/psychology_ai.png'

export const normalizeAssetUrl = (url, fallback = '') => {
  if (!url) return fallback
  const value = String(url).trim()

  if (/^(data:|blob:|https:\/\/)/i.test(value)) return value

  if (value.startsWith(API_ORIGIN)) {
    return value.slice(API_ORIGIN.length)
  }

  if (value.startsWith('//')) {
    return `https:${value}`
  }

  if (/^http:\/\/159\.75\.169\.224:1235/i.test(value)) {
    return value.replace(/^http:\/\/159\.75\.169\.224:1235/i, '')
  }

  if (value.startsWith('/')) return value

  return `/${value}`
}

export const getImageUrl = (url) => normalizeAssetUrl(url, FALLBACK_IMAGE)

export const normalizeHtmlImageUrls = (html) => {
  if (!html) return ''

  const wrapper = document.createElement('div')
  wrapper.innerHTML = html

  wrapper.querySelectorAll('img').forEach((img) => {
    img.setAttribute('src', normalizeAssetUrl(img.getAttribute('src')))
    img.removeAttribute('srcset')
    img.setAttribute('loading', 'lazy')
    img.setAttribute('decoding', 'async')
  })

  return wrapper.innerHTML
}
