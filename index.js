const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const navItems = [...document.querySelectorAll('[data-nav]')];
const revealEls = document.querySelectorAll('.reveal');
const backToTop = document.getElementById('backToTop');
const cursorGlow = document.getElementById('cursorGlow');

// สมาชิกห้องเรียน
// - ใส่ path รูปจริงใน "photo" เมื่อพร้อม (เช่น 'assets/members/somchai.jpg')
// - ถ้า photo เป็น null จะขึ้นเป็นวงกลมไล่สี + หมายเลข ให้ดูเรียบร้อยแทนรูปซ้ำ/รูปหาย
const gradientPairs = [
  ['assets/members/test.png'],
  ['#ef5da8', '#f59e4a'],
  ['#4fd6ff', '#7a4dff'],
  ['#f59e4a', '#9b5cff'],
];

const memberList = Array.from({ length: 40 }, (_, i) => ({
  name: `สมาชิกคนที่ ${i + 1}`,
  ig: `@member${i + 1}`,
  photo: null,
}));

const track = document.getElementById('membersTrack');

memberList.forEach((member, index) => {
  const memberCard = document.createElement('div');
  memberCard.className = 'member-card';

  const photoHtml = member.photo
    ? `<div class="member-photo" style="background-image: url('${member.photo}')"></div>`
    : (() => {
        const [c1, c2] = gradientPairs[index % gradientPairs.length];
        return `<div class="member-photo member-photo-placeholder" style="background: linear-gradient(160deg, ${c1}, ${c2})"><span>${index + 1}</span></div>`;
      })();

  memberCard.innerHTML = `
    ${photoHtml}
    <div class="member-meta">
      <div class="member-name">${member.name}</div>
      <div class="member-ig">
        <span class="ig-badge"><img src="assets/members/instagram-logo.svg" alt="Instagram" loading="lazy" /></span>
        ${member.ig}
      </div>
    </div>
  `;
  track.appendChild(memberCard);
});

const announceList = [
  { date: '27 ส.ค. 2569', title: 'Day Camp ครั้งที่ 2', desc: 'จัดขึ้นวันที่ 27 สิงหาคม 2569 พร้อมกิจกรรมและการอบรมเพื่อพัฒนาทักษะของสมาชิก', tag: 'กิจกรรม' },
];

const announceContainer = document.getElementById('announceList');
announceList.forEach((item) => {
  const el = document.createElement('div');
  el.className = 'announce-item';
  el.innerHTML = `
    <div class="announce-date">${item.date}</div>
    <div>
      <div class="announce-title">${item.title}</div>
      <div class="announce-desc">${item.desc}</div>
    </div>
    <div class="announce-tag">${item.tag}</div>
  `;
  announceContainer.appendChild(el);
});

// แกลเลอรีกิจกรรม — เพิ่ม/ลบรูปได้ตรงนี้โดยไม่ต้องแก้ HTML
const galleryData = [
  { img: 'assets/activities/IMG_8586.JPG', alt: 'บรรยากาศกิจกรรมวันวิทยาศาสตร์ในห้องเรียน', cap: 'วันวิทยาศาสตร์', tag: 'science', size: 'wide' },
  { img: 'assets/activities/IMG_8587.JPG', alt: 'สมาชิกร่วมกิจกรรมวันวิทยาศาสตร์', cap: 'วันวิทยาศาสตร์', tag: 'science', size: 'tall' },
  { img: 'assets/activities/IMG_8585.JPG', alt: 'ภาพหมู่ระหว่างกิจกรรมวันวิทยาศาสตร์', cap: 'วันวิทยาศาสตร์', tag: 'science', size: '' },
  { img: 'assets/activities/785462163_1495368175754875_5808673009276826251_n.jpg', alt: 'โมเมนต์สนุกในวันวิทยาศาสตร์', cap: 'วันวิทยาศาสตร์', tag: 'science', size: '' },
  { img: 'assets/activities/92ED2C53-0F76-41F4-85C1-B67AEFFB2F78.jpg', alt: 'กิจกรรมวันคณิตศาสตร์ของห้องเรียน', cap: 'วันคณิตศาสตร์', tag: 'math', size: 'wide' },
  { img: 'assets/activities/2D66125F-6615-49C0-AFF3-A241826006C9.jpg', alt: 'ภาพพี่น้องรหัสของห้องเรียน', cap: 'พี่น้องรหัส', tag: 'sibling', size: '' },
];

const galleryFilterDefs = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'science', label: 'วันวิทยาศาสตร์' },
  { key: 'math', label: 'วันคณิตศาสตร์' },
  { key: 'sibling', label: 'พี่น้องรหัส' },
];

const galleryGrid = document.getElementById('galleryGrid');
const galleryFilters = document.getElementById('galleryFilters');

const renderGallery = (filterKey) => {
  galleryGrid.innerHTML = '';
  const items = filterKey === 'all' ? galleryData : galleryData.filter((g) => g.tag === filterKey);

  items.forEach((item) => {
    const el = document.createElement('div');
    el.className = `gallery-item reveal in-view${item.size ? ` ${item.size}` : ''}`;
    el.innerHTML = `
      <img src="${item.img}" alt="${item.alt}" loading="lazy" />
      <span class="gallery-cap">${item.cap}</span>
    `;
    const img = el.querySelector('img');
    el.addEventListener('click', () => openLightbox(img.src, item.alt));
    galleryGrid.appendChild(el);
  });
};

if (galleryFilters) {
  galleryFilterDefs.forEach((def, index) => {
    const btn = document.createElement('button');
    btn.className = `gallery-filter-btn${index === 0 ? ' active' : ''}`;
    btn.type = 'button';
    btn.textContent = def.label;
    btn.dataset.filter = def.key;
    btn.addEventListener('click', () => {
      [...galleryFilters.children].forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderGallery(def.key);
    });
    galleryFilters.appendChild(btn);
  });
}

renderGallery('all');

// นับถอยหลังกิจกรรม
const countdownTarget = new Date('2026-08-27T00:00:00+07:00').getTime();
const cdDays = document.getElementById('cdDays');
const cdHours = document.getElementById('cdHours');
const cdMins = document.getElementById('cdMins');
const cdSecs = document.getElementById('cdSecs');

const updateCountdown = () => {
  if (!cdDays) return;
  const diff = countdownTarget - Date.now();

  if (diff <= 0) {
    cdDays.textContent = '0';
    cdHours.textContent = '0';
    cdMins.textContent = '0';
    cdSecs.textContent = '0';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  cdDays.textContent = String(days);
  cdHours.textContent = String(hours).padStart(2, '0');
  cdMins.textContent = String(mins).padStart(2, '0');
  cdSecs.textContent = String(secs).padStart(2, '0');
};

updateCountdown();
setInterval(updateCountdown, 1000);

const lightbox = document.getElementById('imageLightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

const openLightbox = (src, alt) => {
  if (!lightbox || !lightboxImage) return;
  lightboxImage.src = src;
  lightboxImage.alt = alt;
  lightboxCaption.textContent = alt || 'ภาพกิจกรรม';
  lightbox.classList.add('open');
  lightbox.style.visibility = 'visible';
  lightbox.style.opacity = '1';
  lightbox.style.pointerEvents = 'auto';
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  if (!lightbox || !lightboxImage) return;
  lightbox.classList.remove('open');
  lightbox.style.visibility = 'hidden';
  lightbox.style.opacity = '0';
  lightbox.style.pointerEvents = 'none';
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.src = '';
  document.body.style.overflow = '';
};

if (lightboxClose) {
  lightboxClose.addEventListener('click', closeLightbox);
}

if (lightbox) {
  lightbox.addEventListener('click', (event) => {
    if (event.target.dataset.close === 'true' || event.target === lightbox) closeLightbox();
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox && lightbox.classList.contains('open')) {
    closeLightbox();
  }
});

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navItems.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
    });
  });
}

const updateActiveNav = () => {
  const sections = document.querySelectorAll('section[id], header.hero');
  let currentSection = sections[0]?.id || 'members';

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 140 && rect.bottom >= 140) {
      currentSection = section.id || 'members';
    }
  });

  navItems.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${currentSection}`;
    link.classList.toggle('active', isActive);
  });
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach((el) => revealObserver.observe(el));

window.addEventListener('scroll', () => {
  updateActiveNav();

  if (window.scrollY > 500) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('mousemove', (event) => {
  if (window.innerWidth <= 760) return;

  cursorGlow.style.opacity = '1';
  cursorGlow.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
});

window.addEventListener('mouseleave', () => {
  cursorGlow.style.opacity = '0';
});

updateActiveNav();

