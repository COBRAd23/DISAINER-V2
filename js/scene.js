import * as THREE from 'three'
import gsap from 'gsap'

export function initScene(scene, renderer, camera, manager) {

  // Texturas (usa LoadingManager para trackeo preciso en el preloader)
  const loader = manager ? new THREE.TextureLoader(manager) : new THREE.TextureLoader()

  // Carga de assets
  const textures = {
    hero:         loader.load('assets/img/home header hero.webp'),
    heroOsc:      loader.load('assets/img/home header hero OSCURO LATERAL.webp'),
    sol:          loader.load('assets/img/SOL LATERAL.webp'),
    noche:        loader.load('assets/img/todo noche.webp'),
    todoSol:      loader.load('assets/img/todo sol.webp'),
    solCerca:     loader.load('assets/img/todo sol mas cerca.webp'),
    solCerca2:    loader.load('assets/img/todo sol mas mas cerca.webp'),
    bustoIzq:     loader.load('assets/img/bustos/yo_busto_izq.webp'),
    bustoPartido: loader.load('assets/img/bustos/busto patido.webp'), // Nombre exacto del archivo físico
    columna:      loader.load('assets/img/columna.webp'),
  }

  // ── 0. FONDO BASE NOCHE (ESCENA 0) ─────────────────
  const nightGeo = new THREE.PlaneGeometry(24, 13.5)
  const nightMat = new THREE.MeshBasicMaterial({
    map: textures.noche,
    transparent: true,
    opacity: 0, // Se desvanece de negro inicial al completarse la carga
  })
  const nightBg = new THREE.Mesh(nightGeo, nightMat)
  nightBg.position.set(0, 0, -6)
  scene.add(nightBg)

  // ── NUBES VELOCES (EFECTO INHÓSPITO DE ALTA VELOCIDAD) ─────────────────
  const cloudGroup = new THREE.Group()
  scene.add(cloudGroup)

  const cloudCount = 3
  const clouds = []
  for (let i = 0; i < cloudCount; i++) {
    const cloudGeo = new THREE.PlaneGeometry(12, 6)
    const cloudMat = new THREE.MeshBasicMaterial({
      map: textures.heroOsc,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    })
    const cloud = new THREE.Mesh(cloudGeo, cloudMat)
    cloud.position.set((Math.random() - 0.5) * 15, 2 + Math.random() * 2, -5.5)
    cloudGroup.add(cloud)
    clouds.push({
      mesh: cloud,
      speed: 0.008 + Math.random() * 0.012
    })
  }

  // ── 1. PORTAL DE OTRA DIMENSIÓN (PÍVOT SUPERIOR DE DESPLIEGUE) ────────
  // Posición del dintel superior: X = 1.5, Y = 3.2, Z = -2
  const doorPivot = new THREE.Object3D()
  doorPivot.position.set(1.5, 3.2, -2)
  doorPivot.scale.y = 0.0001 // Inicialmente colapsado a una sola línea superior
  scene.add(doorPivot)

  // Contenido de la puerta (desplazado hacia abajo para que el pívot esté arriba)
  const doorContent = new THREE.Group()
  doorContent.position.set(0, -3.0, 0)
  doorPivot.add(doorContent)

  // A. Brillo interior del portal (Sunny side)
  const portalGeo = new THREE.PlaneGeometry(3.6, 6.0)
  const portalMat = new THREE.MeshBasicMaterial({
    map: textures.sol,
    transparent: true,
    opacity: 0.95,
  })
  const portalMesh = new THREE.Mesh(portalGeo, portalMat)
  doorContent.add(portalMesh)

  // B. Textos Deslizantes (CanvasTexture Dinámico)
  const txtCanvas = document.createElement('canvas')
  txtCanvas.width = 1024
  txtCanvas.height = 512
  const txtCtx = txtCanvas.getContext('2d')

  const txtTexture = new THREE.CanvasTexture(txtCanvas)
  const txtMat = new THREE.MeshBasicMaterial({
    map: txtTexture,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  })
  const txtGeo = new THREE.PlaneGeometry(3.6, 1.8)
  const txtMesh = new THREE.Mesh(txtGeo, txtMat)
  txtMesh.position.set(0, 0.4, 0.01) // Justo en frente del sol
  doorContent.add(txtMesh)

  // C. Marco Físico de la Puerta (Neon Glow Dorado en 3D)
  const frameGroup = new THREE.Group()
  doorContent.add(frameGroup)

  const lineMat = new THREE.MeshBasicMaterial({ color: 0xFFCC00 })
  
  // Marco superior (Línea de dintel que brilla siempre)
  const topBarGeo = new THREE.BoxGeometry(3.64, 0.06, 0.06)
  const topBar = new THREE.Mesh(topBarGeo, lineMat)
  topBar.position.set(0, 3.0, 0.02)
  doorContent.add(topBar) // Fuera del contenido escalable del pivot si quisiéramos, pero mantenerlo aquí lo unifica

  // Marcos laterales y base
  const sideBarGeo = new THREE.BoxGeometry(0.04, 6.0, 0.04)
  const leftBar = new THREE.Mesh(sideBarGeo, lineMat)
  leftBar.position.set(-1.8, 0, 0.02)
  frameGroup.add(leftBar)

  const rightBar = new THREE.Mesh(sideBarGeo, lineMat)
  rightBar.position.set(1.8, 0, 0.02)
  frameGroup.add(rightBar)

  const bottomBarGeo = new THREE.BoxGeometry(3.64, 0.04, 0.04)
  const bottomBar = new THREE.Mesh(bottomBarGeo, lineMat)
  bottomBar.position.set(0, -3.0, 0.02)
  frameGroup.add(bottomBar)

  // ── 2. BUSTO PORTERO & PEDESTAL (ESCENA 0) ───────────────────────────
  const porteroGroup = new THREE.Group()
  porteroGroup.position.set(-2.5, -4, -1.2) // Inicialmente bajo la pantalla
  scene.add(porteroGroup)

  // Pedestal / Atril
  const atrilGeo = new THREE.PlaneGeometry(2.0, 4.0)
  const atrilMat = new THREE.MeshBasicMaterial({
    map: textures.columna,
    transparent: true,
    alphaTest: 0.01,
  })
  const atrilMesh = new THREE.Mesh(atrilGeo, atrilMat)
  atrilMesh.position.set(0, -1.6, 0)
  porteroGroup.add(atrilMesh)

  // Busto Portero
  const bustoGeo = new THREE.PlaneGeometry(2.4, 3.4)
  const bustoMat = new THREE.MeshBasicMaterial({
    map: textures.bustoIzq,
    transparent: true,
    alphaTest: 0.01,
  })
  const bustoMesh = new THREE.Mesh(bustoGeo, bustoMat)
  bustoMesh.position.set(0, 0.9, 0.1)
  porteroGroup.add(bustoMesh)


  // ── 3. ESCENARIO FILOSOFÍA: SOL BRILLANTE & BUSTO PARTIDO (ESCENA 1) ───
  // Ubicado más atrás en el eje Z (Z = -12)
  const sunBgGeo = new THREE.PlaneGeometry(28, 15.75)
  const sunBgMat = new THREE.MeshBasicMaterial({
    map: textures.todoSol,
    transparent: true,
    opacity: 0, // Se activa al cruzar el portal
  })
  const sunBg = new THREE.Mesh(sunBgGeo, sunBgMat)
  sunBg.position.set(0, 0, -12)
  scene.add(sunBg)

  // Busto Partido (Floating)
  const partidoGeo = new THREE.PlaneGeometry(3.6, 5.0)
  const partidoMat = new THREE.MeshBasicMaterial({
    map: textures.bustoPartido,
    transparent: true,
    opacity: 0,
  })
  const partidoMesh = new THREE.Mesh(partidoGeo, partidoMat)
  partidoMesh.position.set(-2.5, 0.3, -9) // Izquierda de la pantalla para dejar texto libre a la derecha
  scene.add(partidoMesh)


  // ── 4. ESCENARIO SERVICIOS: ESTRUCTURAS GEOMÉTRICAS FLOTANTES (ESCENA 2) ──
  // Ubicado a Z = -20
  const servicesBgGeo = new THREE.PlaneGeometry(32, 18)
  const servicesBgMat = new THREE.MeshBasicMaterial({
    map: textures.solCerca,
    transparent: true,
    opacity: 0,
  })
  const servicesBg = new THREE.Mesh(servicesBgGeo, servicesBgMat)
  servicesBg.position.set(0, 0, -20)
  scene.add(servicesBg)

  // Figuras 3D abstractas flotantes para representar "Estructuras" de servicios
  const structGroup = new THREE.Group()
  structGroup.position.set(0, 0, -16)
  scene.add(structGroup)

  const structs = []
  for (let i = 0; i < 4; i++) {
    const geom = new THREE.BoxGeometry(1.5, 1.5, 1.5)
    const edge = new THREE.EdgesGeometry(geom)
    const mat = new THREE.LineBasicMaterial({
      color: 0xFFCC00,
      transparent: true,
      opacity: 0,
    })
    const cube = new THREE.LineSegments(edge, mat)
    cube.position.set((i - 1.5) * 3.5, (Math.random() - 0.5) * 2, 0)
    structGroup.add(cube)
    structs.push({
      mesh: cube,
      rotSpeedX: 0.005 + Math.random() * 0.01,
      rotSpeedY: 0.005 + Math.random() * 0.01,
      mat: mat
    })
  }


  // ── 5. ESCENARIO PORTFOLIO: PARTÍCULAS DORADAS FLOTANTES (ESCENA 3) ────
  // Ubicado a Z = -28
  const portfolioBgGeo = new THREE.PlaneGeometry(36, 20.25)
  const portfolioBgMat = new THREE.MeshBasicMaterial({
    map: textures.solCerca2,
    transparent: true,
    opacity: 0,
  })
  const portfolioBg = new THREE.Mesh(portfolioBgGeo, portfolioBgMat)
  portfolioBg.position.set(0, 0, -28)
  scene.add(portfolioBg)

  // Partículas doradas
  const pCount = 800
  const pPos = new Float32Array(pCount * 3)
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3]     = (Math.random() - 0.5) * 25
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 12
    pPos[i * 3 + 2] = -21 + (Math.random() - 0.5) * 10
  }
  const pGeo = new THREE.BufferGeometry()
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
  const pMat = new THREE.PointsMaterial({
    color: 0xFFCC00,
    size: 0.03,
    transparent: true,
    opacity: 0, // se desvanece al inicio
  })
  const goldParticles = new THREE.Points(pGeo, pMat)
  scene.add(goldParticles)


  // ── 6. ESCENARIO CONTACTO (ESCENA 4) ─────────────────────────────────
  // Ubicado a Z = -35
  const contactBgGeo = new THREE.PlaneGeometry(40, 22.5)
  const contactBgMat = new THREE.MeshBasicMaterial({
    color: 0x030303,
    transparent: true,
    opacity: 0,
  })
  const contactBg = new THREE.Mesh(contactBgGeo, contactBgMat)
  contactBg.position.set(0, 0, -35)
  scene.add(contactBg)


  // ── 7. ILUMINACIÓN NEON & AMBIENTE ──────────────────────────────────
  const ambient = new THREE.AmbientLight(0xffffff, 0.9)
  scene.add(ambient)

  const portalLight = new THREE.PointLight(0xFFCC00, 5, 12)
  portalLight.position.set(1.5, 0.2, -1)
  scene.add(portalLight)


  // ── 8. EVENTO: CARGA DE PORTAL COMPLETADA (DESPLIEGUE HACIA ABAJO) ───
  window.addEventListener('startPortalReveal', () => {
    // A. Desvanecer negro y revelar paisaje estrellado nocturno
    gsap.to(nightMat, { opacity: 1, duration: 1.5, ease: 'power2.out' })

    // B. Desplegar la puerta hacia abajo (scale.y 0 -> 1)
    gsap.to(doorPivot.scale, { y: 1, duration: 2.2, ease: 'power3.inOut' })

    // C. Elevar el busto del portero y su pedestal en el espacio
    gsap.to(porteroGroup.position, { y: 0, duration: 2.0, delay: 0.4, ease: 'power2.out' })
    
    // D. Activar luces del portal
    gsap.to(portalLight, { intensity: 6, duration: 1.8 })
  })


  // ── 9. EVENTO: TRANSICIÓN DE ESCENAS (CONTROLADO POR SCROLL) ──────────
  window.addEventListener('sceneChanged', (e) => {
    const idx = e.detail

    // Resetear opacidades y activaciones dirigidas según la escena actual
    
    // ESCENA 0: HOME
    if (idx === 0) {
      gsap.to(nightMat, { opacity: 1, duration: 1.2 })
      gsap.to(porteroGroup.position, { x: -2.5, y: 0, duration: 1.2, ease: 'power2.out' })
      
      // Apagar escenas posteriores
      gsap.to(sunBgMat, { opacity: 0, duration: 1.0 })
      gsap.to(partidoMat, { opacity: 0, duration: 0.8 })
    }

    // ESCENA 1: FILOSOFÍA (Cruzamos el portal hacia el sol)
    if (idx === 1) {
      // Cruzar el portal: se desvanece la noche, se revela el mundo solar
      gsap.to(nightMat, { opacity: 0.15, duration: 1.5 })
      gsap.to(sunBgMat, { opacity: 1, duration: 1.8, ease: 'power2.out' })
      
      // El portero se desplaza hacia la izquierda saliendo de escena
      gsap.to(porteroGroup.position, { x: -6, duration: 1.5, ease: 'power2.inOut' })

      // Se revela el Busto Partido flotando majestuoso en el sol
      gsap.to(partidoMat, { opacity: 1, duration: 1.5, delay: 0.5, ease: 'power2.out' })

      // Apagar escenas posteriores
      gsap.to(servicesBgMat, { opacity: 0, duration: 1.0 })
      structs.forEach(s => gsap.to(s.mat, { opacity: 0, duration: 0.8 }))
    }

    // ESCENA 2: SERVICIOS
    if (idx === 2) {
      // Apagar Filosofía
      gsap.to(sunBgMat, { opacity: 0, duration: 1.0 })
      gsap.to(partidoMat, { opacity: 0, duration: 0.8 })

      // Encender Servicios
      gsap.to(servicesBgMat, { opacity: 1, duration: 1.5 })
      structs.forEach((s, i) => {
        gsap.to(s.mat, { opacity: 0.75, duration: 1.2, delay: i * 0.15 })
      })

      // Apagar Portfolio
      gsap.to(portfolioBgMat, { opacity: 0, duration: 1.0 })
      gsap.to(pMat, { opacity: 0, duration: 0.8 })
    }

    // ESCENA 3: PORTFOLIO
    if (idx === 3) {
      // Apagar Servicios
      gsap.to(servicesBgMat, { opacity: 0, duration: 1.0 })
      structs.forEach(s => gsap.to(s.mat, { opacity: 0, duration: 0.8 }))

      // Encender Portfolio
      gsap.to(portfolioBgMat, { opacity: 1, duration: 1.5 })
      gsap.to(pMat, { opacity: 0.8, duration: 1.5 })

      // Apagar Contacto
      gsap.to(contactBgMat, { opacity: 0, duration: 1.0 })
    }

    // ESCENA 4: CONTACTO
    if (idx === 4) {
      // Apagar Portfolio
      gsap.to(portfolioBgMat, { opacity: 0, duration: 1.0 })
      gsap.to(pMat, { opacity: 0.1, duration: 1.0 })

      // Encender Contacto (Fondo ultra-oscuro para lectura óptima del formulario)
      gsap.to(contactBgMat, { opacity: 1, duration: 1.5 })
    }
  })


  // ── 10. ANIMACIÓN IDLE Y LOOP ───────────────────────────────────────
  const clock = new THREE.Clock()
  
  let textOffset1 = 0
  let textOffset2 = 1024

  function tick() {
    requestAnimationFrame(tick)
    const t = clock.getElapsedTime()

    // A. Busto del portero flota suavemente
    porteroGroup.position.y = Math.sin(t * 1.0) * 0.08

    // B. Nubes veloces se desplazan por el cielo
    clouds.forEach(c => {
      c.mesh.position.x += c.speed
      if (c.mesh.position.x > 15) {
        c.mesh.position.x = -15
      }
    })

    // C. Busto partido flota majestuosamente en el sol
    partidoMesh.position.y = 0.3 + Math.sin(t * 0.7) * 0.12
    partidoMesh.rotation.y = Math.sin(t * 0.3) * 0.08
    partidoMesh.rotation.x = Math.cos(t * 0.25) * 0.04

    // D. Estructuras de Servicios rotan e interactúan
    structs.forEach(s => {
      s.mesh.rotation.x += s.rotSpeedX
      s.mesh.rotation.y += s.rotSpeedY
      s.mesh.position.y += Math.sin(t * 0.5 + s.mesh.position.x) * 0.002
    })

    // E. Partículas del Portfolio flotan lentamente
    goldParticles.rotation.y = t * 0.015
    goldParticles.rotation.x = t * 0.008

    // F. CanvasTexture de Textos Corriendo en el Portal
    txtCtx.clearRect(0, 0, 1024, 512)

    // Gradiente brillante de fondo para el texto
    txtCtx.fillStyle = 'rgba(255, 120, 0, 0.18)'
    txtCtx.fillRect(0, 0, 1024, 512)

    // Estilos del texto
    txtCtx.font = 'bold 70px Montserrat, Arial, sans-serif'
    txtCtx.fillStyle = 'rgba(255, 204, 0, 0.95)'
    txtCtx.shadowColor = '#FFCC00'
    txtCtx.shadowBlur = 12

    // Texto Fila 1 (Izquierda a Derecha)
    textOffset1 -= 2
    if (textOffset1 < -1000) textOffset1 = 0
    txtCtx.fillText('DISEÑO  DESIGN  DISAINER  DISEÑADOR', textOffset1, 180)
    txtCtx.fillText('DISEÑO  DESIGN  DISAINER  DISEÑADOR', textOffset1 + 1000, 180)

    // Texto Fila 2 (Derecha a Izquierda)
    textOffset2 += 1.8
    if (textOffset2 > 1000) textOffset2 = 0
    txtCtx.fillText('CREATIVIDAD  INNOVACIÓN  ARTE  ESTILO', -textOffset2, 380)
    txtCtx.fillText('CREATIVIDAD  INNOVACIÓN  ARTE  ESTILO', -textOffset2 + 1000, 380)

    txtTexture.needsUpdate = true
  }
  tick()
}