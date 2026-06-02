import gsap from 'gsap'

export function initScroll(camera, scene) {

  let currentScene = 0
  const totalScenes = 5
  let isAnimating = false

  // Posiciones tridimensionales de la cámara alineadas con los sectores 3D
  const scenes = [
    { x: 0,    y: 0,   z: 5,   lookAt: [0.3, 0, 0] },     // ESCENA 0: HOME (Vista frontal de la noche y el portal)
    { x: -0.5, y: 0.2, z: -4,  lookAt: [-2.5, 0.3, -9] }, // ESCENA 1: FILOSOFÍA (Cruzamos el portal, enfocamos el busto partido)
    { x: 0,    y: 0,   z: -11, lookAt: [0, 0, -16] },     // ESCENA 2: SERVICIOS (Estructuras de servicios)
    { x: 0,    y: 0,   z: -18, lookAt: [0, 0, -24] },     // ESCENA 3: PORTFOLIO (Polvo de oro)
    { x: 0,    y: 0,   z: -25, lookAt: [0, 0, -32] },     // ESCENA 4: CONTACTO (Fondo oscuro minimalista)
  ]

  function toggleContent(index) {
    document.querySelectorAll('.scene-content').forEach(el => {
      if (el.dataset.scene == index) {
        el.classList.add('active')
        // Animación suave de entrada de textos HTML
        gsap.fromTo(el, 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 1.0, delay: 0.4, ease: 'power2.out', clearProps: 'transform' }
        )
      } else {
        el.classList.remove('active')
      }
    })
  }

  function goTo(index) {
    if (isAnimating || index < 0 || index >= totalScenes) return
    isAnimating = true
    currentScene = index

    const s = scenes[index]

    // Transición más lenta al cruzar el portal (de escena 0 a 1) para mayor inmersión
    const duration = index === 1 ? 2.5 : 1.8
    const ease     = 'power3.inOut'

    // Animación de cámara y punto de enfoque (lookAt)
    const look = { x: camera.lookAtTarget ? camera.lookAtTarget.x : 0, y: camera.lookAtTarget ? camera.lookAtTarget.y : 0, z: camera.lookAtTarget ? camera.lookAtTarget.z : 0 }
    
    gsap.to(look, {
      x: s.lookAt[0],
      y: s.lookAt[1],
      z: s.lookAt[2],
      duration,
      ease,
      onUpdate: () => {
        camera.lookAt(look.x, look.y, look.z)
        camera.lookAtTarget = look
      }
    })

    gsap.to(camera.position, {
      x: s.x,
      y: s.y,
      z: s.z,
      duration,
      ease,
      onComplete: () => {
        isAnimating = false
      }
    })

    // Actualizar contenido y notificar a la escena 3D
    toggleContent(index)
    window.dispatchEvent(new CustomEvent('sceneChanged', { detail: index }))

    // Control del hint de scroll en la escena final
    const hint = document.getElementById('scroll-hint')
    if (hint) {
      hint.style.opacity = index === totalScenes - 1 ? '0' : '1'
    }
  }

  // Wheel debounce premium
  let wheelTimer = null
  window.addEventListener('wheel', e => {
    if (isAnimating) return
    clearTimeout(wheelTimer)
    wheelTimer = setTimeout(() => {
      if (e.deltaY > 0) goTo(currentScene + 1)
      else              goTo(currentScene - 1)
    }, 40)
  })

  // Evento de navegación personalizada (Nav Links y Menu Overlay)
  window.addEventListener('navigateTo', e => goTo(e.detail))

  // Soporte Táctil (Móviles/Tablets)
  let ty = 0
  window.addEventListener('touchstart', e => { ty = e.touches[0].clientY })
  window.addEventListener('touchend', e => {
    if (isAnimating) return
    const d = ty - e.changedTouches[0].clientY
    if (Math.abs(d) > 50) {
      if (d > 0) goTo(currentScene + 1)
      else       goTo(currentScene - 1)
    }
  })

  // Mostrar el contenido de la escena inicial (Home)
  toggleContent(0)
}