const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const navItems = [...document.querySelectorAll('[data-nav]')];
const revealEls = document.querySelectorAll('.reveal');
const backToTop = document.getElementById('backToTop');
const cursorGlow = document.getElementById('cursorGlow');

// ===== ระบบเพลง (BGM) — ใส่ไฟล์เพลงที่ assets/bgm.mp3 แล้วจะเล่นอัตโนมัติเมื่อกดปุ่ม =====
const musicBtn = document.getElementById('musicBtn');
let bgmAudio = null;

if (musicBtn) {
  bgmAudio = new Audio('assets/bgm.mp3');
  bgmAudio.loop = true;
  bgmAudio.volume = 0.45;

  musicBtn.addEventListener('click', () => {
    if (bgmAudio.paused) {
      bgmAudio.play().then(() => {
        musicBtn.classList.add('playing');
        musicBtn.setAttribute('aria-label', 'ปิดเพลง');
      }).catch(() => {
        musicBtn.classList.remove('playing');
      });
    } else {
      bgmAudio.pause();
      musicBtn.classList.remove('playing');
      musicBtn.setAttribute('aria-label', 'เปิดเพลง');
    }
  });
}

// สมาชิกห้องเรียน — แก้ชื่อ/IG/รูปจริงที่นี่ (photo: null = วงกลมไล่สี)
// ข้อมูลถูกเก็บใน localStorage — หน้า admin.html ใช้แก้ไขได้โดยไม่ต้องใช้ดาต้าเบส
const gradientPairs = [
  ['#9b5cff', '#4fd6ff'],
  ['#ef5da8', '#f59e4a'],
  ['#4fd6ff', '#7a4dff'],
  ['#f59e4a', '#9b5cff'],
];

const defaultMembers = Array.from({ length: 40 }, (_, i) => ({
  name: `สมาชิกคนที่ ${i + 1}`,
  ig: `@member${i + 1}`,
  photo: 'assets/members/555.jpg',
}));

const loadData = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    // ถ้าข้อมูลที่บันทึกไว้ว่างหรือไม่ใช่ array ให้ใช้ค่าเริ่มต้นแทน (กันกิจกรรม/สมาชิกหาย)
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback;
    return parsed;
  } catch (_) {
    return fallback;
  }
};

const memberList = loadData('asep_members', defaultMembers);

const track = document.getElementById('membersTrack');

const renderMembers = (query = '') => {
  track.innerHTML = '';
  const q = query.trim().toLowerCase();
  const filtered = memberList.filter(
    (m) => !q || m.name.toLowerCase().includes(q) || m.ig.toLowerCase().includes(q)
  );

  if (!filtered.length) {
    track.innerHTML = '<div class="members-empty">ไม่พบสมาชิกที่ค้นหา 😢</div>';
    return;
  }

  filtered.forEach((member) => {
    const index = memberList.indexOf(member);
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
};

renderMembers();

// ช่องค้นหาสมาชิก
const membersSection = document.querySelector('.members-section');
if (membersSection && !document.getElementById('memberSearch')) {
  const searchWrap = document.createElement('div');
  searchWrap.className = 'member-search';
  searchWrap.innerHTML =
    '<input type="text" id="memberSearch" placeholder="🔍 ค้นหาชื่อหรือ IG ของสมาชิก..." aria-label="ค้นหาสมาชิก" />';
  membersSection.insertBefore(searchWrap, track);
  searchWrap.querySelector('#memberSearch').addEventListener('input', (e) => {
    renderMembers(e.target.value);
  });
}

// ประชาสัมพันธ์ — isNew: true = แสดงป้าย NEW, image: path รูป (ถ้ามี)
const defaultAnnounces = [
  { date: '27 ส.ค. 2569', title: 'Day Camp ครั้งที่ 2', desc: 'จัดขึ้นวันที่ 27 สิงหาคม 2569 พร้อมกิจกรรมและการอบรมเพื่อพัฒนาทักษะของสมาชิก', tag: 'กิจกรรม', isNew: true },
];
const announceData = loadData('asep_announces', defaultAnnounces);

const announceContainer = document.getElementById('announceList');
announceData.forEach((item) => {
  const el = document.createElement('div');
  el.className = 'announce-item';
  el.innerHTML = `
    ${item.image ? `<img class="announce-img" src="${item.image}" alt="${item.title}" loading="lazy" />` : ''}
    <div class="announce-date">${item.date}</div>
    <div>
      <div class="announce-title">${item.title}${item.isNew ? '<span class="new-badge">NEW</span>' : ''}</div>
      <div class="announce-desc">${item.desc}</div>
    </div>
    <div class="announce-actions">
      <button class="share-btn" type="button" title="แชร์ประกาศ">🔗</button>
      <div class="announce-tag">${item.tag}</div>
    </div>
  `;
  el.querySelector('.share-btn').addEventListener('click', async () => {
    const text = `${item.title} — ${item.desc}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text });
      } else {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        const btn = el.querySelector('.share-btn');
        btn.textContent = '✅';
        setTimeout(() => (btn.textContent = '🔗'), 1500);
      }
    } catch (_) {}
  });
  announceContainer.appendChild(el);
});

// ไทม์ไลน์ (ปิดใช้งาน)
const renderTimeline = () => {};

// แกลเลอรีกิจกรรม — เพิ่ม/ลบรูปได้ตรงนี้หรือผ่านหน้า admin.html
const defaultGallery = [
  { img: 'assets/activities/IMG_8586.JPG', alt: 'ภาพหมู่ระหว่างกิจกรรมวันวิทยาศาสตร์', cap: 'วันวิทยาศาสตร์', tag: 'science', size: 'wide' },
  { img: 'assets/activities/IMG_8587.JPG', alt: 'บรรยากาศกิจกรรมวันวิทยาศาสตร์ในห้องเรียน', cap: 'วันวิทยาศาสตร์', tag: 'science', size: 'tall' },
  { img: 'assets/activities/IMG_8585.JPG', alt: 'บรรยากาศกิจกรรมวันวิทยาศาสตร์ในห้องเรียน', cap: 'วันวิทยาศาสตร์', tag: 'science', size: '' },
  { img: 'assets/activities/785462163_1495368175754875_5808673009276826251_n.jpg', alt: 'บรรยากาศกิจกรรมวันวิทยาศาสตร์ในห้องเรียน', cap: 'วันวิทยาศาสตร์', tag: 'science', size: '' },
  { img: 'assets/activities/92ED2C53-0F76-41F4-85C1-B67AEFFB2F78.jpg', alt: 'กิจกรรมวันคณิตศาสตร์ของห้องเรียน', cap: 'วันคณิตศาสตร์', tag: 'math', size: 'wide' },
  { img: 'assets/activities/2D66125F-6615-49C0-AFF3-A241826006C9.jpg', alt: 'ภาพพี่น้องรหัสของห้องเรียน', cap: 'พี่น้องรหัส', tag: 'sibling', size: '' },
];
const galleryData = loadData('asep_gallery', defaultGallery)
  // ตัดรายการที่ path รูปว่างหรือยังเป็น placeholder ออก กันรูปพังในหน้าเว็บ
  .filter((g) => g && g.img && g.img !== 'assets/activities/');

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
    el.addEventListener('click', () => openLightbox(img.src, item.alt, items, items.indexOf(item)));
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

// สถานะ lightbox สำหรับ prev/next
let currentGalleryItems = [];
let currentImageIndex = 0;

const showLightboxImage = (index) => {
  if (!currentGalleryItems.length) return;
  currentImageIndex = (index + currentGalleryItems.length) % currentGalleryItems.length;
  const item = currentGalleryItems[currentImageIndex];
  lightboxImage.src = item.img;
  lightboxImage.alt = item.alt;
  lightboxCaption.textContent = `${item.alt || 'ภาพกิจกรรม'} (${currentImageIndex + 1}/${currentGalleryItems.length})`;
};

const openLightbox = (src, alt, items = [], index = 0) => {
  if (!lightbox || !lightboxImage) return;
  currentGalleryItems = items.length ? items : [{ img: src, alt }];
  showLightboxImage(index);
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

document.getElementById('lightboxPrev')?.addEventListener('click', (e) => {
  e.stopPropagation();
  showLightboxImage(currentImageIndex - 1);
});
document.getElementById('lightboxNext')?.addEventListener('click', (e) => {
  e.stopPropagation();
  showLightboxImage(currentImageIndex + 1);
});

if (lightbox) {
  lightbox.addEventListener('click', (event) => {
    if (event.target.dataset.close === 'true' || event.target === lightbox) closeLightbox();
  });
}

document.addEventListener('keydown', (event) => {
  if (!lightbox || !lightbox.classList.contains('open')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowRight') showLightboxImage(currentImageIndex + 1);
  if (event.key === 'ArrowLeft') showLightboxImage(currentImageIndex - 1);
});

// swipe บนมือถือ
let touchStartX = 0;
lightbox?.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });
lightbox?.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) showLightboxImage(currentImageIndex + (dx < 0 ? 1 : -1));
}, { passive: true });

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

renderTimeline();

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

