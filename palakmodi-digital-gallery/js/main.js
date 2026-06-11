document.addEventListener("DOMContentLoaded", () => {

  /* ═══════════════════════════════════
     SCROLL REVEALS
     ═══════════════════════════════════ */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-up, .fade-in').forEach((el, i) => {
    setTimeout(() => el.classList.add('is-visible'), i * 120);
  });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* ═══════════════════════════════════
     NAVBAR: glassmorphism + hide/show
     ═══════════════════════════════════ */
  const header = document.querySelector('.site-header');
  if (header) {
    let lastScroll = 0;
    const scrollThreshold = 60;

    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      header.classList.toggle('scrolled', currentScroll > 30);

      if (currentScroll > scrollThreshold) {
        if (currentScroll > lastScroll + 5) {
          header.classList.add('nav-hidden');
        } else if (currentScroll < lastScroll - 5) {
          header.classList.remove('nav-hidden');
        }
      } else {
        header.classList.remove('nav-hidden');
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }

  /* ═══════════════════════════════════
     MOBILE HAMBURGER
     ═══════════════════════════════════ */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ═══════════════════════════════════
     HERO BANNER CROSSFADE
     ═══════════════════════════════════ */
  const bannerImages = document.querySelectorAll('.banner-img');
  if (bannerImages.length > 0) {
    let currentBannerIndex = 0;
    setInterval(() => {
      bannerImages[currentBannerIndex].classList.remove('opacity-100');
      bannerImages[currentBannerIndex].classList.add('opacity-0');
      
      currentBannerIndex = (currentBannerIndex + 1) % bannerImages.length;
      
      bannerImages[currentBannerIndex].classList.remove('opacity-0');
      bannerImages[currentBannerIndex].classList.add('opacity-100');
    }, 4000);
  }

  /* ═══════════════════════════════════
     INTERACTIVE CANVAS (System Input)
     ═══════════════════════════════════ */
  const canvas = document.getElementById('system-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      canvas.width = r.width;
      canvas.height = r.height;
    };
    window.addEventListener('resize', resize);
    resize();

    let drawing = false, pts = [];

    const pos = (e) => {
      const r = canvas.getBoundingClientRect();
      const cx = (e.clientX || e.touches?.[0]?.clientX) - r.left;
      const cy = (e.clientY || e.touches?.[0]?.clientY) - r.top;
      return { x: cx, y: cy };
    };

    const start = (e) => { drawing = true; pts = [pos(e)]; };
    const move = (e) => {
      if (!drawing) return;
      pts.push(pos(e));
      ctx.fillStyle = 'rgba(250,250,250,0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(Math.round(pts[i].x / 20) * 20, Math.round(pts[i].y / 20) * 20);
      }
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1;
      ctx.stroke();
      const lp = pts[pts.length - 1];
      ctx.beginPath();
      ctx.arc(lp.x, lp.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#666';
      ctx.fill();
    };
    const end = () => { drawing = false; };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('mouseleave', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);
  }

  /* ═══════════════════════════════════
     PREMIUM LIGHTBOX (Grid Images)
     ═══════════════════════════════════ */
  const initLightbox = () => {
    // Create global lightbox DOM elements with split layout
    const lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    
    const lightboxContent = document.createElement('div');
    lightboxContent.className = 'lightbox-content';
    
    const lightboxInfo = document.createElement('div');
    lightboxInfo.className = 'lightbox-info';
    
    const lightboxTitle = document.createElement('h3');
    const lightboxDesc = document.createElement('p');
    
    lightboxInfo.appendChild(lightboxTitle);
    lightboxInfo.appendChild(lightboxDesc);
    
    const lightboxImageWrapper = document.createElement('div');
    lightboxImageWrapper.className = 'lightbox-image-wrapper';
    
    const lightboxImg = document.createElement('img');
    lightboxImageWrapper.appendChild(lightboxImg);
    
    lightboxContent.appendChild(lightboxInfo);
    lightboxContent.appendChild(lightboxImageWrapper);
    
    lightbox.appendChild(lightboxContent);
    
    // Close button for mobile and desktop clarity
    const lightboxClose = document.createElement('button');
    lightboxClose.className = 'lightbox-close';
    lightboxClose.innerHTML = '&times;';
    lightboxClose.style.cssText = 'position:absolute;top:1rem;right:1.5rem;background:none;border:none;color:rgba(255,255,255,0.6);font-size:2.5rem;cursor:pointer;z-index:100000;transition:color 0.3s,transform 0.3s;line-height:1;outline:none;';
    lightboxClose.addEventListener('mouseover', () => { lightboxClose.style.color = '#fff'; lightboxClose.style.transform = 'scale(1.1)'; });
    lightboxClose.addEventListener('mouseout', () => { lightboxClose.style.color = 'rgba(255,255,255,0.6)'; lightboxClose.style.transform = 'scale(1)'; });
    lightboxClose.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
    lightbox.appendChild(lightboxClose);

    document.body.appendChild(lightbox);

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      
      // Wait for out-animation before clearing the image source
      setTimeout(() => {
        if (!lightbox.classList.contains('active')) {
          lightboxImg.src = '';
          lightboxTitle.textContent = '';
          lightboxDesc.textContent = '';
        }
      }, 500);
    };

    // Target all images in the project tab views (exclude collage cards)
    const galleryImages = document.querySelectorAll('.tab-content img');
    
    galleryImages.forEach(img => {
      // Skip images inside collage cards or with data-no-lightbox
      if (img.closest('.collage-card') || img.hasAttribute('data-no-lightbox')) return;

      // Prevent ugly default drag behaviour on images
      img.addEventListener('dragstart', e => e.preventDefault());
      
      img.addEventListener('click', () => {
        lightboxImg.src = img.getAttribute('data-large') || img.src;
        // Populate text if present, otherwise set to a default message
        lightboxTitle.textContent = img.getAttribute('data-title') || 'Artwork Title';
        lightboxDesc.textContent = img.getAttribute('data-desc') || 'Description goes here';
        
        lightbox.classList.add('active');
        // Prevent background scrolling while modal is open
        document.body.style.overflow = 'hidden'; 
      });
    });

    // Close on click outside the image and description (improves mobile UX)
    lightbox.addEventListener('click', (e) => {
      if (e.target !== lightboxImg && !lightboxInfo.contains(e.target)) {
        closeLightbox();
      }
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  };

  initLightbox();

});
