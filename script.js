// GSAP Eklentisini Kaydet: Sayfa kaydırma ve buton animasyonları için şart.
gsap.registerPlugin(ScrollTrigger);

/**
 * 1. THREE.JS TEMEL KURULUM
 */
const scene = new THREE.Scene();
const canvas = document.querySelector('.webgl');

// IŞIKLAR: Bardağın ve tatlının hacimli görünmesini sağlar.
const sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.position.set(-5, 5, 5); 
sunLight.castShadow = true;
scene.add(sunLight);

const ambient = new THREE.AmbientLight(0xffffff, 0.6); 
scene.add(ambient);

/**
 * 2. MENÜ ELEMENTLERİ
 */
const menuBtn = document.querySelector('.cta-btn');
const menuOverlay = document.querySelector('#menu-overlay');
const closeBtn = document.querySelector('.close-menu');

/**
 * 3. BARDAK ÜZERİNE YAZI (CANVAS TEXTURE)
 */
const canvasLabel = document.createElement('canvas');
const context = canvasLabel.getContext('2d');
canvasLabel.width = 512;
canvasLabel.height = 256;
context.fillStyle = '#8b5a2b'; 
context.fillRect(0, 0, 512, 256);
context.font = 'Bold 60px Playfair Display';
context.fillStyle = '#ffffff';
context.textAlign = 'center';
context.fillText('COFFEE LAB', 256, 120);
context.font = '30px Montserrat';
context.fillText('coffee shop & roastery', 256, 180);
const labelTexture = new THREE.CanvasTexture(canvasLabel);

/**
 * 4. MATERYAL TANIMLAMALARI (Vites 6 Ayarları)
 */
const cupMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }); 
const sleeveMaterial = new THREE.MeshStandardMaterial({ map: labelTexture, roughness: 1 }); 
const lidMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2 }); 

const beanMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3d2b1f, 
    roughness: 0.2, 
    metalness: 0.3, 
});
/**
 * 5. BARDAK VE TATLI TASARIMI (GROUP)
 */
const cupGroup = new THREE.Group();

// Bardak Parçaları
const cupBody = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.3, 1.2, 32), cupMaterial);
cupGroup.add(cupBody);

const cupSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.51, 0.42, 0.6, 32), sleeveMaterial);
cupSleeve.position.y = 0.05; 
cupGroup.add(cupSleeve);

const lidBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.52, 0.1, 32), lidMaterial);
lidBase.position.y = 0.6;
cupGroup.add(lidBase);

const lidTop = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.15, 32), lidMaterial);
lidTop.position.y = 0.7;
cupGroup.add(lidTop);

// DUMAN
const steamCount = 20;
const steamGeometry = new THREE.BufferGeometry();
const steamPositions = new Float32Array(steamCount * 3);
for(let i = 0; i < steamCount * 3; i++) steamPositions[i] = (Math.random() - 0.5) * 0.2;
steamGeometry.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3));

const steamMaterial = new THREE.PointsMaterial({ 
    color: 0xffffff, 
    size: 0.15, // Biraz daha büyük ve yumuşak noktalar
    transparent: true, 
    opacity: 0.15, // Daha şeffaf, daha doğal
    blending: THREE.AdditiveBlending,
    depthWrite: false // Dumanın bardağın arkasında/önünde çirkin durmasını engeller
});

const steam = new THREE.Points(steamGeometry, steamMaterial);
steam.position.y = 0.8; 
cupGroup.add(steam); 


// --- VİTES 8: ULTRA-GERÇEKÇİ TATLI TASARIMI ---
const dessertGroup = new THREE.Group();
dessertGroup.position.set(0.9, -0.55, 0.4); // Hizalama milimetrik!

// 1. Tabağa Porselen Parlaklığı (Derinlikli Tabak)
const plateBottom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.55, 0.05, 32), 
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.2 }) 
);
dessertGroup.add(plateBottom);

const plateRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.04, 16, 100), // Tabağın o kavisli kenarı
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 })
);
plateRim.rotation.x = Math.PI / 2;
plateRim.position.y = 0.05;
dessertGroup.add(plateRim);

// 2. Kekin Kremamsı Gövdesi (Gerçekçi Doku)[cite: 11]
// San Sebastian'ın o tam pişmemiş, yumuşak dokusu için roughness: 0.9 yaptık.
const cakeInsideMat = new THREE.MeshStandardMaterial({ 
    color: 0xfdf0d5, // Daha kremamsı bir bej[cite: 11]
    roughness: 0.9, 
    metalness: 0 
});
const cakeInside = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 3), cakeInsideMat);
cakeInside.position.y = 0.22;
cakeInside.rotation.y = Math.PI / 4;
dessertGroup.add(cakeInside);

// 3. Kekin O Meşhur Yanık Üst Katmanı[cite: 11]
// Üst kısmın hafif pürüzlü ve "karamelize" görünmesi için özel materyal:
const cakeTopMat = new THREE.MeshStandardMaterial({ 
    color: 0x2b1d0e, // Yanık kahverengi tonu
    roughness: 0.6,   // Hafif ışık yansıtan "ıslak yanık" efekti
    metalness: 0.1
});
const cakeTop = new THREE.Mesh(new THREE.CylinderGeometry(0.41, 0.41, 0.02, 3), cakeTopMat);
cakeTop.position.y = 0.37;
cakeTop.rotation.y = Math.PI / 4;
dessertGroup.add(cakeTop);

// 4. SON DOKUNUŞ: Üzerine Çilek Ekleme (Estetik Detay)
const strawberry = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xbf0603, roughness: 0.3 }) // Kırmızı canlı çilek
);
strawberry.scale.set(1, 1.3, 1); // Çileği hafifçe uzattık
strawberry.position.set(0, 0.45, 0); // Kekin tam tepesinde
dessertGroup.add(strawberry);

cupGroup.add(dessertGroup); // Ana gruba bağladık
cupGroup.position.x = 2;
scene.add(cupGroup);

/**
 * 6. KAHVE ÇEKİRDEĞİ SİSTEMİ (200 Adet)
 */
const beanGeometry = new THREE.SphereGeometry(0.04, 12, 12); // Segment sayısı artırılarak daha yuvarlak yapıldı.
beanGeometry.scale(1, 0.6, 1.2); 

const coffeeBeans = new THREE.InstancedMesh(beanGeometry, beanMaterial, 200);
const dummy = new THREE.Object3D();
for (let i = 0; i < 200; i++) {
    dummy.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    dummy.updateMatrix();
    coffeeBeans.setMatrixAt(i, dummy.matrix);
}
scene.add(coffeeBeans);

/**
 * 7. KAMERA VE RENDERER
 */
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3;
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * 8. GSAP ANİMASYONLARI
 */
const introTl = gsap.timeline(); 
introTl.to(".hero .content", { opacity: 1, y: 0, duration: 1.5 })
       .from(cupGroup.position, { x: 5, duration: 2 }, "-=1");
// script.js içindeki scrollTl bloğunu bu şekilde güncelle
const isMobile = window.innerWidth < 991;

const scrollTl = gsap.timeline({
    scrollTrigger: { 
        trigger: ".menu", 
        start: "top bottom", 
        end: "top top", 
        scrub: 2 
    }
});

// Mobilde bardak X:0 (Merkez) kalsın, sadece dönsün ve renk değiştirsin
scrollTl.to(cupGroup.position, { 
    x: isMobile ? 0 : -1.3, // Mobilde merkezde çakılı kalır
    y: isMobile ? 0 : -0.1 
}) 
.to(cupGroup.rotation, { 
    y: isMobile ? Math.PI * 6 : Math.PI * 1.4, // Mobilde daha hızlı ve çok döner
    z: 0.02 
}, 0) 
.to(cupMaterial.color, { r: 0.23, g: 0.15, b: 0.1 }, 0); // Renk espresso tonuna döner

scrollTl.to(cupGroup.position, { x: -1.3, y: -0.1 }) 
        .to(cupGroup.rotation, { 
            y: Math.PI * 1.4, 
            z: 0.02 // Eğimi iyice azalttık, masa hissi için
        }, 0) 
        .to(cupMaterial.color, { r: 0.23, g: 0.15, b: 0.1 }, 0)
        .to(".menu .content", { opacity: 1, y: 0 }, 0.5);

        
/**
 * 9. ETKİLEŞİM VE DÖNGÜ
 */
const animate = () => {
    const elapsedTime = Date.now() * 0.001;
    if(cupGroup) {
        // Süzülme etkisi minimize edildi, artık daha ağır ve masada duruyor gibi.
        cupGroup.position.y += Math.sin(elapsedTime) * 0.0002; 
        cupGroup.rotation.y += 0.003; // Dönüş hızı yavaşlatıldı
    }
    if(coffeeBeans) {
        coffeeBeans.rotation.y += 0.001;
        coffeeBeans.rotation.z += 0.0005;
    }
    if(steam) {
        const positions = steam.geometry.attributes.position.array;
        for(let i = 1; i < positions.length; i += 3) {
            positions[i] += 0.002; 
            if(positions[i] > 0.4) positions[i] = 0; 
        }
        steam.geometry.attributes.position.needsUpdate = true;
    }
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
};
animate();

// BUTONLAR
menuBtn.addEventListener('click', () => {
    document.body.classList.add('stop-scroll'); 
    gsap.to(camera.position, { z: 1.8, duration: 1.2 });
    
    // Menüyü anında aktif et, donmayı engelle
    menuOverlay.classList.add('active'); 
    
    // Ürünleri JS ile getirmek yerine CSS'e bırakıyoruz ama yumuşaklık istersen:
    gsap.fromTo(".menu-item", 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.3, delay: 0.2 }
    );
});

closeBtn.addEventListener('click', () => {
    document.body.classList.remove('stop-scroll');
    menuOverlay.classList.remove('active');
    gsap.to(camera.position, { z: 3, duration: 1.5 });
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight); 
});