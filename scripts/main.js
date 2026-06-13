// Basic interactivity: filters, open modal with content, embed youtube if present
document.addEventListener('DOMContentLoaded', ()=>{
  const filters = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.card');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMeta = document.getElementById('modal-meta');
  const modalDesc = document.getElementById('modal-desc');
  const modalMedia = document.getElementById('modal-media');
  const modalClose = modal.querySelector('.modal-close');

  let lastFocused = null;
  let slides = [];
  let currentSlide = 0;

  filters.forEach(btn=>btn.addEventListener('click', ()=>{
    filters.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    cards.forEach(c=>{ c.style.display=(f==='all' || c.dataset.type===f)?'flex':'none' });
  }));

  function createCarousel(imageList){
    slides = imageList.slice();
    currentSlide = 0;
    const container = document.createElement('div'); container.className='carousel';
    const img = document.createElement('img'); img.className='carousel-image'; img.src = slides[0]; img.alt='';
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
      modalMedia.appendChild(iframe);
    } else if(card.dataset.images){
      const list = card.dataset.images.split(',').map(s=>s.trim()).filter(Boolean);
      if(list.length>1){
        modalMedia.appendChild(createCarousel(list));
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

  cards.forEach(card=>{
    card.addEventListener('click', ()=>openCard(card));
    card.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); openCard(card); } });
  });

  modalClose.addEventListener('click', closeModal);
  modal.querySelector('[data-dismiss]').addEventListener('click', closeModal);
});
