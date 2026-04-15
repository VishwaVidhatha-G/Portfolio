// Ensure DOM is ready before we unleash GSAP/ThreeJS
document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================================
       0. Theme Toggle
       ========================================================================= */
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    function setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        if(theme === 'dark') {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
        localStorage.setItem('portfolio-theme', theme);
        
        // Notify Three.js to update colors if needed
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
    }

    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark'; // Defaulting to dark because it's bombastic
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    /* =========================================================================
       1. GSAP SCROLL & LOAD ANIMATIONS
       ========================================================================= */
    
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.fromTo(".nav-pill", 
        { y: -100, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2, delay: 0.2 }
    )
    .fromTo(".gsap-up", 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8 }, "-=0.8"
    )
    .fromTo(".gsap-title", 
        { y: 50, opacity: 0, scale: 0.95 }, 
        { y: 0, opacity: 1, scale: 1, duration: 1 }, "-=0.6"
    )
    .fromTo(".gsap-fade", 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 1, stagger: 0.15 }, "-=0.6"
    )
    .fromTo(".gsap-stagger > div", 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, "-=0.4"
    );

    const slideUpElements = gsap.utils.toArray('.gsap-slide-up');
    slideUpElements.forEach(item => {
        gsap.fromTo(item, 
            { y: 60, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 85%",
                }
            }
        );
    });

    const certCards = gsap.utils.toArray('.cert-card');
    gsap.fromTo(certCards, 
        { x: -30, opacity: 0 },
        {
            x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)",
            scrollTrigger: {
                trigger: ".cert-grid",
                start: "top 80%", 
            }
        }
    );

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* =========================================================================
       2. THREE.JS INTERACTIVE PARTICLE NETWORK
       ========================================================================= */
    const canvasContainer = document.getElementById('particle-canvas');
    if (!canvasContainer || typeof THREE === "undefined") return;

    const scene = new THREE.Scene();
    
    // Will update fog color on theme change
    let currentFogHex = savedTheme === 'dark' ? 0x050505 : 0xFAFAFA;
    scene.fog = new THREE.FogExp2(currentFogHex, 0.002); 

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasContainer.appendChild(renderer.domElement);

    const particleCount = 400;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 800; // x
        positions[i * 3 + 1] = (Math.random() - 0.5) * 800; // y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 500; // z

        velocities.push({
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5,
            z: (Math.random() - 0.5) * 0.5
        });
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Colors that invert correctly based on theme
    let dotColor = savedTheme === 'dark' ? 0x00F0FF : 0x2563EB; // Cyan vs Blue
    let lineColor = savedTheme === 'dark' ? 0x8B5CF6 : 0x7C3AED; // Purple shades

    const pMaterial = new THREE.PointsMaterial({
        color: dotColor, 
        size: 2.5, transparent: true, opacity: 0.6,
        blending: savedTheme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending
    });

    const particleSystem = new THREE.Points(particles, pMaterial);
    scene.add(particleSystem);

    const lineMaterial = new THREE.LineBasicMaterial({
        color: lineColor,
        transparent: true, opacity: 0.15,
        blending: savedTheme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending
    });

    const linesMesh = new THREE.LineSegments(new THREE.BufferGeometry(), lineMaterial);
    scene.add(linesMesh);

    // Theme change dynamic updater
    window.addEventListener('themeChanged', (e) => {
        const isDark = e.detail === 'dark';
        
        scene.fog.color.setHex(isDark ? 0x050505 : 0xFAFAFA);
        
        pMaterial.color.setHex(isDark ? 0x00F0FF : 0x2563EB);
        pMaterial.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
        
        lineMaterial.color.setHex(isDark ? 0x8B5CF6 : 0x7C3AED);
        lineMaterial.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    });

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
        requestAnimationFrame(animate);

        targetX = mouseX * 0.1;
        targetY = mouseY * 0.1;
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        const posAttribute = particles.getAttribute('position');
        for (let i = 0; i < particleCount; i++) {
            let px = posAttribute.getX(i);
            let py = posAttribute.getY(i);
            let pz = posAttribute.getZ(i);

            px += velocities[i].x;
            py += velocities[i].y;
            pz += velocities[i].z;

            if (px < -400 || px > 400) velocities[i].x *= -1;
            if (py < -400 || py > 400) velocities[i].y *= -1;
            if (pz < -250 || pz > 250) velocities[i].z *= -1;

            posAttribute.setXYZ(i, px, py, pz);
        }
        posAttribute.needsUpdate = true;

        let linePositions = [];
        let minDist = 70;

        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
                let dx = posAttribute.getX(i) - posAttribute.getX(j);
                let dy = posAttribute.getY(i) - posAttribute.getY(j);
                let dz = posAttribute.getZ(i) - posAttribute.getZ(j);
                let dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

                if (dist < minDist) {
                    linePositions.push(
                        posAttribute.getX(i), posAttribute.getY(i), posAttribute.getZ(i),
                        posAttribute.getX(j), posAttribute.getY(j), posAttribute.getZ(j)
                    );
                }
            }
        }

        linesMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        
        particleSystem.rotation.y += 0.0005;
        linesMesh.rotation.y += 0.0005;

        renderer.render(scene, camera);
    }
    animate();

});
