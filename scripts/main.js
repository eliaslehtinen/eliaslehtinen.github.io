// Basic interactivity: filters, open modal with content, embed youtube if present
document.addEventListener('DOMContentLoaded', async ()=>{
  // Fetch and render projects
  let projects = [];
  try {
    const resp = await fetch('data/projects.json');
    projects = await resp.json();
    renderCards(projects);
  } catch (e) {
    console.error('Failed to load projects:', e);
  }

  function renderCards(projectList) {
    const grid = document.getElementById('projects');
    grid.innerHTML = '';
    projectList.forEach(proj => {
      const article = document.createElement('article');
      article.className = 'card';
      article.setAttribute('role', 'button');
      article.setAttribute('aria-label', `Open ${proj.type === 'experience' ? 'experience' : 'project'} ${proj.title}`);
      article.setAttribute('tabindex', '0');
      article.dataset.type = proj.type;
      article.dataset.title = proj.title;
      article.dataset.year = proj.year;
      article.dataset.tech = proj.tech;
      article.dataset.desc = proj.description;
      article.dataset.images = proj.images.join(',');
      if (proj.youtube) article.dataset.youtube = proj.youtube;
      
      const thumb = document.createElement('img');
      thumb.className = 'thumb';
      thumb.src = proj.images[0];
      thumb.alt = `${proj.title} thumbnail`;
      
      const body = document.createElement('div');
      body.className = 'card-body';
      const title = document.createElement('h3');
      title.className = 'card-title';
      title.textContent = proj.title;
      const meta = document.createElement('p');
      meta.className = 'card-meta';
      meta.textContent = `${proj.type === 'experience' ? 'Work Experience' : proj.type.charAt(0).toUpperCase() + proj.type.slice(1)} · ${proj.year}`;
      
      body.appendChild(title);
      body.appendChild(meta);
      article.appendChild(thumb);
      article.appendChild(body);
      grid.appendChild(article);
    });
    setupCardListeners();
  }

  function setupCardListeners() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.addEventListener('click', () => openCard(card));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(card); } });
    });
  }

  const filters = document.querySelectorAll('.filter-btn');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMeta = document.getElementById('modal-meta');
  const modalDesc = document.getElementById('modal-desc');
  const modalMedia = document.getElementById('modal-media');
  const modalClose = modal.querySelector('.modal-close');

  let lastFocused = null;
  let slides = [];
  let currentSlide = 0;

  function applyFilter(filterType) {
    const cards = document.querySelectorAll('.card');
    cards.forEach(c => { c.style.display = (filterType === 'all' || c.dataset.type === filterType) ? 'flex' : 'none'; });
  }

  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    applyFilter(btn.dataset.filter);
  }));

  function createCarousel(imageList, title){
    slides = imageList.slice();
    currentSlide = 0;
    const container = document.createElement('div'); container.className='carousel';
    const img = document.createElement('img'); img.className='carousel-image'; img.src = slides[0]; img.alt = title ? `${title} screenshot 1` : '';
    container.appendChild(img);
    const controls = document.createElement('div'); controls.className='carousel-controls';
    const prev = document.createElement('button'); prev.className='carousel-btn prev'; prev.setAttribute('aria-label','Previous'); prev.innerHTML='◀';
    const next = document.createElement('button'); next.className='carousel-btn next'; next.setAttribute('aria-label','Next'); next.innerHTML='▶';
    controls.appendChild(prev); controls.appendChild(next);
    container.appendChild(controls);

    function showSlide(delta){
      if(slides.length===0) return;
      currentSlide = (currentSlide + delta + slides.length) % slides.length;
      img.src = slides[currentSlide];
      if(title) img.alt = `${title} screenshot ${currentSlide+1}`;
    }

    prev.addEventListener('click', ()=>showSlide(-1));
    next.addEventListener('click', ()=>showSlide(1));

    // expose showSlide so keyboard handlers can use it
    container.showSlide = showSlide;
    return container;
  }

  function trapFocus(modalEl){
    const focusableSelector = 'a[href], area, input, select, textarea, button, iframe, [tabindex]:not([tabindex="-1"])';
    const nodes = Array.from(modalEl.querySelectorAll(focusableSelector)).filter(n=>!n.hasAttribute('disabled'));
    const first = nodes[0];
    const last = nodes[nodes.length-1];
    function keyHandler(e){
      if(e.key==='Tab'){
        if(nodes.length===0){ e.preventDefault(); return; }
        if(e.shiftKey){ if(document.activeElement===first){ e.preventDefault(); last.focus(); } }
        else { if(document.activeElement===last){ e.preventDefault(); first.focus(); } }
      }
      if(e.key==='ArrowLeft'){ if(typeof modalMedia.querySelector('.carousel')?.showSlide==='function') modalMedia.querySelector('.carousel').showSlide(-1); }
      if(e.key==='ArrowRight'){ if(typeof modalMedia.querySelector('.carousel')?.showSlide==='function') modalMedia.querySelector('.carousel').showSlide(1); }
      if(e.key==='Escape'){ closeModal(); }
    }
    modalEl._keyHandler = keyHandler;
    document.addEventListener('keydown', keyHandler);
    // focus first focusable element
    if(first) first.focus(); else modalClose.focus();
  }

  function removeTrap(modalEl){
    if(modalEl._keyHandler) document.removeEventListener('keydown', modalEl._keyHandler);
    modalEl._keyHandler = null;
  }

  function openCard(card){
    lastFocused = document.activeElement;
    modalTitle.textContent = card.dataset.title || '';
    modalMeta.textContent = [card.dataset.tech, card.dataset.year].filter(Boolean).join(' · ');
    modalDesc.textContent = card.dataset.desc || '';
    modalMedia.innerHTML = '';
    slides = [];
    currentSlide = 0;
      if(card.dataset.youtube){
      const iframe = document.createElement('iframe');
      iframe.src = card.dataset.youtube;
      iframe.width = '100%'; iframe.height = '360'; iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'; iframe.setAttribute('allowfullscreen','');
      iframe.setAttribute('title', `${card.dataset.title || 'Video'} demo`);
      modalMedia.appendChild(iframe);
    } else if(card.dataset.images){
      const list = card.dataset.images.split(',').map(s=>s.trim()).filter(Boolean);
      if(list.length>1){
        modalMedia.appendChild(createCarousel(list, card.dataset.title));
      } else {
        const img = document.createElement('img'); img.src = list[0]; img.alt = card.dataset.title||''; img.style.maxWidth='100%'; modalMedia.appendChild(img);
      }
    }
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    trapFocus(modal);
  }

  function closeModal(){
    removeTrap(modal);
    modal.setAttribute('aria-hidden','true');
    modalMedia.innerHTML='';
    document.body.style.overflow='';
    if(lastFocused && typeof lastFocused.focus==='function') lastFocused.focus();
  }

  modalClose.addEventListener('click', closeModal);
  modal.querySelector('[data-dismiss]').addEventListener('click', closeModal);
});


