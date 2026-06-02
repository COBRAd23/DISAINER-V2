import * as THREE from 'three'
import gsap from 'gsap'
import { initScene } from './scene.js'
import { initScroll } from './scroll.js'
import { initCursor } from './cursor.js'

// Canvas
const canvas = document.getElementById('webgl')

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x000000)
renderer.shadowMap.enabled = true

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(0, 0, 5)

// Scene
const scene = new THREE.Scene()

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// UI & Preloader
const preloader = document.getElementById('preloader')
const fill      = document.getElementById('preloader-line')
const nav       = document.getElementById('nav')
const hint      = document.getElementById('scroll-hint')

// Texture Loading Manager
const manager = new THREE.LoadingManager()
manager.onProgress = (url, itemsLoaded, itemsTotal) => {
  const p = Math.round((itemsLoaded / itemsTotal) * 100)
  if (fill) {
    fill.style.width = p + '%'
  }
}

manager.onLoad = () => {
  // Cuando termina de cargar
  setTimeout(() => {
    // 1. Destello luminoso y señal de despliegue del portal
    window.dispatchEvent(new CustomEvent('startPortalReveal'))
    
    // 2. Esperar a que la puerta se despliegue un poco antes de desvanecer el fondo negro
    setTimeout(() => {
      preloader.classList.add('loading-complete')
      nav.classList.add('visible')
      hint.classList.add('visible')
      
      initScroll(camera, scene)
      initCursor()
    }, 1200) // Sincronizado con la animación de despliegue
  }, 600)
}

manager.onError = (url) => { console.warn('Error al cargar textura:', url) }

// Init 3D Scene
initScene(scene, renderer, camera, manager)

// Hamburger Menu
const hamburger = document.getElementById('nav-hamburger')
const menuOverlay = document.getElementById('menu-overlay')

if (hamburger && menuOverlay) {
  hamburger.addEventListener('click', () => {
    const isActive = menuOverlay.classList.toggle('active')
    document.body.classList.toggle('menu-overlay-active', isActive)
  })

  // Cerrar menú al hacer clic en un link
  document.querySelectorAll('.menu-links a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      const sceneIndex = parseInt(link.dataset.scene)
      
      window.dispatchEvent(new CustomEvent('navigateTo', { detail: sceneIndex }))
      menuOverlay.classList.remove('active')
      document.body.classList.remove('menu-overlay-active')
    })
  })
}

// Text Decoder Effect for Philosophy
const decoderElement = document.getElementById('decoder-text')

function decodeText(element, finalVal, duration = 2.0) {
  if (!element) return
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@$%&*+'
  const length = finalVal.length
  let currentText = ''
  const interval = 25 // ms
  const steps = Math.ceil((duration * 1000) / interval)
  let step = 0
  
  clearInterval(element.decodeInterval)
  element.decodeInterval = setInterval(() => {
    step++
    const progress = step / steps
    const revealIndex = Math.floor(progress * length)
    
    currentText = finalVal.substring(0, revealIndex)
    for (let i = revealIndex; i < length; i++) {
      if (finalVal[i] === ' ') {
        currentText += ' '
      } else {
        currentText += chars[Math.floor(Math.random() * chars.length)]
      }
    }
    
    element.innerHTML = currentText
    if (step >= steps) {
      clearInterval(element.decodeInterval)
      element.innerHTML = finalVal
    }
  }, interval)
}

// Escuchar cambios de escena para el decodificador
window.addEventListener('sceneChanged', e => {
  const index = e.detail
  if (index === 1 && decoderElement) {
    const textVal = decoderElement.getAttribute('data-text')
    if (textVal) {
      setTimeout(() => {
        decodeText(decoderElement, textVal, 2.5)
      }, 500) // Delay para que comience al terminar la transición de cámara
    }
  }
})

// Loop
function tick() {
  requestAnimationFrame(tick)
  renderer.render(scene, camera)
}
tick()