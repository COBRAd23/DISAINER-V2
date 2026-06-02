export function initCursor() {
  const cursor = document.createElement('div')
  cursor.style.cssText = `
    position: fixed;
    width: 10px; height: 10px;
    background: #FFCC00;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: width 0.2s, height 0.2s;
    mix-blend-mode: difference;
  `
  document.body.appendChild(cursor)

  const follower = document.createElement('div')
  follower.style.cssText = `
    position: fixed;
    width: 32px; height: 32px;
    border: 1px solid rgba(255,204,0,0.5);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%, -50%);
    transition: all 0.12s ease;
  `
  document.body.appendChild(follower)

  let mx = -100, my = -100
  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY
    cursor.style.left   = mx + 'px'
    cursor.style.top    = my + 'px'
    follower.style.left = mx + 'px'
    follower.style.top  = my + 'px'
  })

  // Hover
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width  = '6px'
      cursor.style.height = '6px'
      follower.style.width  = '48px'
      follower.style.height = '48px'
      follower.style.borderColor = 'rgba(255,204,0,0.9)'
    })
    el.addEventListener('mouseleave', () => {
      cursor.style.width  = '10px'
      cursor.style.height = '10px'
      follower.style.width  = '32px'
      follower.style.height = '32px'
      follower.style.borderColor = 'rgba(255,204,0,0.5)'
    })
  })
}