/* =====================================================================
   INTERACTIVE LANYARD ID CARD
   Pure Canvas 2D + vanilla JS. No external libraries.

   Structure of this file:
     1. Setup & config
     2. Rope model (Verlet integration + distance constraints)
     3. Input handling (mouse / touch drag with momentum on release)
     4. Rendering (lanyard ribbon + metal ring + ID card face)
     5. Main loop
   ===================================================================== */

   const canvas = document.getElementById('lanyardCanvas');
   const ctx = canvas.getContext('2d');
   /* ===========================
      ASSETS
   =========================== */
   
   const lanyardImg = new Image();
   lanyardImg.src = "./assets/lanyard.png";
   
   const cardImg = new Image();
   cardImg.src = "./assets/card.png";
   const logoImg = new Image();
   logoImg.src = "./assets/logo.png";
   const ringImg = new Image();
   ringImg.src = "./assets/ring.png";
   const hint = document.getElementById('hint');
   
   /* ---------------------------------------------------------------------
      1. SETUP & CONFIG
      --------------------------------------------------------------------- */
   
   let width = 0, height = 0, dpr = 1;
   
   // Physics tuning
   const GRAVITY = 0.62;          // downward acceleration per frame
   const DAMPING = 0.985;         // velocity retained each frame (air friction)
   const CONSTRAINT_ITERATIONS = 10; // more iterations = stiffer, more "rope-like" rope
   const ROPE_SEGMENTS = 7;      // number of small links that make up the lanyard
   
   // Sizing (recomputed on resize so the whole scene stays responsive)
   let CARD_W, CARD_H, SEG_LEN, ANCHOR_REST_Y;
   
   // The physics chain: index 0 = anchor (pinned, clipped to "the wall"),
   // indices 1..ROPE_SEGMENTS-1 = lanyard links,
   // last index = the card's center of mass, hanging like a bob on a rod.
   let points = [];      // {x,y,oldx,oldy,pinned}
   let segLens = [];     // rest length for the segment BEFORE each point (index i-1 -> i)
   let HOOK_INDEX;       // index of the point where the metal ring / card top sits
   let BOB_INDEX;        // index of the card's center-of-mass point
   
   // Intro "falling from the top of the screen" animation
   let introStartTime = null;
   const INTRO_DURATION = 950; // ms
   
   function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
   
   function resize() {
     dpr = Math.min(window.devicePixelRatio || 1, 2);
     const container =
document.querySelector(".container");

const rect =
container.getBoundingClientRect();

width = rect.width;

height = rect.height;   
     canvas.width = width * dpr;
     canvas.height = height * dpr;
     canvas.style.width = width + 'px';
     canvas.style.height = height + 'px';
     ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
   
     // Scale the card to the viewport so it always reads well
     const SCALE = 2;    

     // Opsi "Balanced" yang sudah diperkecil sedikit
     const isMobile =
     window.innerWidth <= 768;
     
     CARD_H =
     isMobile
     ?
     
     Math.max(
     260,
     Math.min(
     340,
     height*0.42
     )
     )
     
     :
     
     Math.max(
     400,
     Math.min(
     560,
     height*0.60
     )
     );     CARD_W = CARD_H * 0.62;
     SEG_LEN = Math.max(18, Math.min(30, height * 0.035));

     if (isMobile) {
       // On mobile the .container stacks into a column and becomes much
       // taller than the .hero-image-wrapper, so the anchor must follow
       // the wrapper's own top instead of a fixed offset from the
       // (now much taller) container top.
       const wrapper = document.querySelector(".hero-image-wrapper");
       const wrapperRect = wrapper.getBoundingClientRect();
       ANCHOR_REST_Y = (wrapperRect.top - rect.top) + 20;
     } else {
       ANCHOR_REST_Y = -45;
     }
     // anchorX()/anchorY() are re-evaluated every frame in satisfyConstraints(),
     // so the chain automatically re-centers itself after a resize.
   }
   
   /* ---------------------------------------------------------------------
      2. ROPE MODEL
      --------------------------------------------------------------------- */
   
   function buildChain() {
     points = [];
     segLens = [];
   
     const startX = anchorX();
     const startY = -Math.max(260, height * 0.35); // begins off-screen, above the viewport
   
     // Rope links (anchor -> hook)
     for (let i = 0; i < ROPE_SEGMENTS; i++) {
       // small horizontal fan-out so the chain isn't perfectly straight;
       // this asymmetry is what makes it swing left/right as it falls, instead
       // of dropping in a dead-straight (and physically boring) line.
       const swingKick = -70 * (i / ROPE_SEGMENTS);
       const x = startX + swingKick;
       const y = startY + i * SEG_LEN;
       points.push({ x, y, oldx: x, oldy: y, pinned: i === 0 });
       if (i > 0) segLens.push(SEG_LEN);
     }
     HOOK_INDEX = ROPE_SEGMENTS - 1;
   
     // Card "bob": a single rigid rod from the hook to the card's center of
     // mass. One distance constraint is enough to make a rectangle swing
     // convincingly like a real badge on a reel.
     const bobKick = -90;
     const hook = points[HOOK_INDEX];
     const bobX = hook.x + bobKick * 0.3;
     const bobY = hook.y + CARD_H * 0.60;;
     points.push({ x: bobX, y: bobY, oldx: bobX, oldy: bobY, pinned: false });
     segLens.push(CARD_H);
     BOB_INDEX = points.length - 1;
   
     introStartTime = performance.now();
   }
   
   function integrate() {
     for (let i = 0; i < points.length; i++) {
       const p = points[i];
       if (p.pinned || p === dragged) continue;
       const localDamping = DAMPING - i * 0.002;
   
   const vx = (p.x - p.oldx) * localDamping;
   const vy = (p.y - p.oldy) * localDamping;;
       p.oldx = p.x;
       p.oldy = p.y;
       p.x += vx;
       p.y += vy + GRAVITY;
       p.x += Math.sin(performance.now() * 0.001 + i * 0.6) * 0.03;
     }
   }
   
   function satisfyConstraints() {
     for (let iter = 0; iter < CONSTRAINT_ITERATIONS; iter++) {
       for (let i = 0; i < points.length - 1; i++) {
         const p1 = points[i];
         const p2 = points[i + 1];
         const restLen =
       segLens[i] *
       (1 + Math.min(0.015, Math.abs(points[i].y - points[i + 1].y) * 0.00008));
         const stiffness = 1 - (i / HOOK_INDEX) * 0.25;
   
         let dx = p2.x - p1.x;
         let dy = p2.y - p1.y;
         let dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
         const diff = (dist - restLen) / dist;
   
         const p1Locked = p1.pinned || p1 === dragged;
         const p2Locked = p2.pinned || p2 === dragged;
         if (p1Locked && p2Locked) continue;
   
         let offX = dx * 0.5 * diff * stiffness;
         let offY = dy * 0.5 * diff * stiffness;
   
         if (!p1Locked) { p1.x += offX; p1.y += offY; }
         if (!p2Locked) { p2.x -= offX; p2.y -= offY; }
       }
       // keep the anchor exactly where the intro animation (or resize) puts it
       points[0].x = anchorX();
       points[0].y = anchorY();
     }
   }
   
   function anchorX(){

    const wrapper =
    document.querySelector(".hero-image-wrapper");

    const container =
    document.querySelector(".container");

    const w =
    wrapper.getBoundingClientRect();

    const c =
    container.getBoundingClientRect();

    return w.left-c.left+w.width/2;

}
   function anchorY() {
     if (introStartTime === null) return ANCHOR_REST_Y;
     const t = Math.min(1, (performance.now() - introStartTime) / INTRO_DURATION);
     const startY = -Math.max(260, height * 0.35);
     const y = startY + (ANCHOR_REST_Y - startY) * easeOutCubic(t);
     return y;
   }
   
   /* ---------------------------------------------------------------------
      3. INPUT HANDLING (drag with released momentum)
      --------------------------------------------------------------------- */
   
   let dragged = null;         // the point object currently being dragged
   let pointer = { x: 0, y: 0 };
   let dragOffset = { x: 0, y: 0 };
   let cardCorners = null;     // updated every frame in drawCard(), used for hit-testing
   
   function getPointer(e) {
     const rect = canvas.getBoundingClientRect();
     const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
     const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
     return { x: cx, y: cy };
   }
   
   function pointInPolygon(px, py, poly) {
     let inside = false;
     for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
       const xi = poly[i].x, yi = poly[i].y;
       const xj = poly[j].x, yj = poly[j].y;
       const intersect = ((yi > py) !== (yj > py)) &&
         (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
       if (intersect) inside = !inside;
     }
     return inside;
   }
   
   function onPointerDown(e) {
     const p = getPointer(e);
     pointer = p;
   
     // Prefer grabbing the card if the click lands on it (it's on top visually)
     if (cardCorners && pointInPolygon(p.x, p.y, cardCorners)) {
   
       dragged = points[BOB_INDEX];
   
       dragOffset.x = p.x - dragged.x;
       dragOffset.y = p.y - dragged.y;
   
   } else {
       // otherwise grab the nearest lanyard link within a comfortable radius
       let best = null, bestDist = 34;
       for (let i = 1; i < points.length; i++) {
         const d = Math.hypot(points[i].x - p.x, points[i].y - p.y);
         if (d < bestDist) { bestDist = d; best = points[i]; }
       }
       dragged = best;
     }
   
     if (dragged) {
       canvas.classList.add('dragging');
       hint.style.opacity = '0';
       e.preventDefault();
     }
   }
   
   function onPointerMove(e) {
     // Kalau tidak sedang drag apa pun, jangan blokir scroll touch bawaan browser.
     if (!dragged) return;
     pointer = getPointer(e);
     e.preventDefault();
   }
   
   function onPointerUp() {
     // Releasing simply stops us from overriding the point's position;
     // its oldx/oldy already encode the last frame's mouse velocity, so
     // Verlet integration carries that momentum forward naturally.
     dragged = null;
     canvas.classList.remove('dragging');
   }
   
   canvas.addEventListener('mousedown', onPointerDown);
   window.addEventListener('mousemove', onPointerMove);
   window.addEventListener('mouseup', onPointerUp);
   canvas.addEventListener('touchstart', onPointerDown, { passive: false });
   window.addEventListener('touchmove', onPointerMove, { passive: false });
   window.addEventListener('touchend', onPointerUp);
   
   function applyDrag() {
     if (!dragged) return;
     // store previous position BEFORE snapping to the pointer, so that
     // (new - old) becomes real velocity once the point is released
     dragged.oldx = dragged.x;
   dragged.oldy = dragged.y;
   
   dragged.x = pointer.x - dragOffset.x;
   dragged.y = pointer.y - dragOffset.y;
   }
   
   /* ---------------------------------------------------------------------
      4. RENDERING
      --------------------------------------------------------------------- */
   
      function drawLanyard() {
   
       const LAN_W = 45;
   
       ctx.save();
       const grad = ctx.createLinearGradient(
         0,
         0,
         LAN_W,
         0
     );
     
     grad.addColorStop(0,"#3a3a3a");
     grad.addColorStop(.18,"#565656");
     grad.addColorStop(.50,"#252525");
     grad.addColorStop(.82,"#171717");
     grad.addColorStop(1,"#090909");
     
     ctx.fillStyle = grad; 
     
     // Gunakan logika path tunggal agar tidak terpisah-pisah
     ctx.beginPath();
     const leftSide = [];
     const rightSide = [];
   
     for (let i = 0; i < HOOK_INDEX; i++) {
       const a = points[i], b = points[i + 1];
       const dx = b.x - a.x, dy = b.y - a.y;
       const len = Math.hypot(dx, dy) || 1;
       const nx = -dy / len * (LAN_W / 2);
       const ny = dx / len * (LAN_W / 2);
   
       leftSide.push({ x: a.x + nx, y: a.y + ny });
       rightSide.push({ x: a.x - nx, y: a.y - ny });
     }
   
     ctx.moveTo(leftSide[0].x, leftSide[0].y);
     for (let p of leftSide) ctx.lineTo(p.x, p.y);
     for (let i = rightSide.length - 1; i >= 0; i--) ctx.lineTo(rightSide[i].x, rightSide[i].y);
     
     ctx.closePath();
     ctx.fill();
     ctx.restore();
   
       ctx.save();
   
       // =========================
       // BUILD CONTINUOUS RIBBON
       // =========================
   
       const left = [];
       const right = [];
   
       for (let i = 0; i <= HOOK_INDEX; i++) {
   
           let prev = points[Math.max(i - 1, 0)];
           let next = points[Math.min(i + 1, HOOK_INDEX)];
   
           let dx = next.x - prev.x;
           let dy = next.y - prev.y;
   
           let len = Math.hypot(dx, dy) || 1;
   
           let nx = -dy / len;
           let ny = dx / len;
   
           left.push({
               x: points[i].x + nx * LAN_W * 0.5,
               y: points[i].y + ny * LAN_W * 0.5
           });
   
           right.push({
               x: points[i].x - nx * LAN_W * 0.5,
               y: points[i].y - ny * LAN_W * 0.5
           });
   
       }
   
       ctx.beginPath();
   
       ctx.moveTo(left[0].x, left[0].y);
   
       for (let i = 1; i < left.length; i++) {
           ctx.lineTo(left[i].x, left[i].y);
       }
   
       for (let i = right.length - 1; i >= 0; i--) {
           ctx.lineTo(right[i].x, right[i].y);
       }
   
       ctx.closePath();
   
       ctx.fillStyle = "#242424";
       ctx.fill();
       
   
       // =========================
       // LOGO
       // =========================
   
       ctx.fillStyle = "#f2f2f2";
       ctx.font = "700 10px Arial";
   
       let carried = 0;
       const LABEL_GAP = 30;
       let labelIndex = 0;
   
       for (let i = 0; i < HOOK_INDEX; i++) {
   
           const a = points[i];
           const b = points[i + 1];
   
           const dx = b.x - a.x;
           const dy = b.y - a.y;
   
           const segLength = Math.hypot(dx, dy) || 1;
   
           const angle = Math.atan2(dy, dx) + Math.PI / 2;
   
           let d = carried;
   
           while (d < segLength) {
   
               const t = d / segLength;
   
               const px = a.x + dx * t;
               const py = a.y + dy * t;
   
               if (labelIndex % 2 === 0) {
   
                   ctx.save();
   
                   ctx.translate(px, py);
   
                   ctx.rotate(angle);
   
                   ctx.scale(-1, -1);
   
                   const logoW = 26;
                   const logoH = 12;
   
                   ctx.drawImage(
                       logoImg,
                       -logoW / 2,
                       -logoH / 2,
                       logoW,
                       logoH
                   );
   
                   ctx.restore();
   
               }
   
               labelIndex++;
               d += LABEL_GAP;
   
           }
   
           carried = d - segLength;
   
       }
   
       // =========================
       // ANCHOR
       // =========================
   
       const anchor = points[0];

   
       ctx.restore();
   
   }
   
   function drawRing() {
   
     const hook = points[HOOK_INDEX];
   
     const w = 50;
     const h = 42;
     
     ctx.drawImage(
         ringImg,
         hook.x - w / 2,
         hook.y - h / 2 + 8,
         w,
         h
     );
   
   }
   
   // Draws the ID card face in LOCAL space: (0,0) is top-center of the card,
   // x grows right/left by CARD_W/2, y grows downward by CARD_H.
   function drawCardFace() {
   
     ctx.drawImage(
         cardImg,
         -CARD_W / 2,
         0,
         CARD_W,
         CARD_H
     );
   
   }
   
   
   
   function drawCard() {
     const hook = points[HOOK_INDEX];
     const bob = points[BOB_INDEX];
     const dx = bob.x - hook.x;
     const dy = bob.y - hook.y;
     const angle = Math.atan2(dy, dx) - Math.PI / 2; // 0 = hanging straight down
    
     ctx.save();
     ctx.translate(hook.x, hook.y + 10); // small gap for the ring
     ctx.rotate(angle);
    
     // drop shadow for a bit of depth
     ctx.shadowColor = 'rgba(0,0,0,0.55)';
     ctx.shadowBlur = 26;
     ctx.shadowOffsetY = 14;
    
     drawCardFace();
     ctx.restore();
    
     // update hit-testing polygon in WORLD space for next frame's pointer events
     const w = CARD_W, h = CARD_H;
     const ox = hook.x, oy = hook.y + 10;
     const cos = Math.cos(angle), sin = Math.sin(angle);
     const corner = (lx, ly) => ({
       x: ox + lx * cos - ly * sin,
       y: oy + lx * sin + ly * cos,
     });
     cardCorners = [
       corner(-w / 2, 0),
       corner(w / 2, 0),
       corner(w / 2, h),
       corner(-w / 2, h),
     ];
   }
    
   function render() {
     ctx.clearRect(0, 0, width, height);
     drawLanyard();
     drawRing();
     drawCard();
   }
    
   /* ---------------------------------------------------------------------
      5. MAIN LOOP
      --------------------------------------------------------------------- */
    
   function tick() {
     applyDrag();
     integrate();
     satisfyConstraints();
     render();
     requestAnimationFrame(tick);
   }
    
   window.addEventListener('resize', resize);
   let started = false;

window.startLanyard = function () {

    if (started) return;

    started = true;

    resize();
    buildChain();
    introStartTime = performance.now();
    requestAnimationFrame(tick);

}

