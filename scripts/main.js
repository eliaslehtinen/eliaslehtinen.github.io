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

  filters.forEach(btn=>btn.addEventListener('click', ()=>{
    filters.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    cards.forEach(c=>{ c.style.display=(f==='all' || c.dataset.type===f)?'flex':'none' });
  }));

  function openCard(card){
    modalTitle.textContent = card.dataset.title || '';
    modalMeta.textContent = [card.dataset.tech, card.dataset.year].filter(Boolean).join(' · ');
    modalDesc.textContent = card.dataset.desc || '';
    modalMedia.innerHTML = '';
    if(card.dataset.youtube){
      const iframe = document.createElement('iframe');
      iframe.src = card.dataset.youtube;
      iframe.width = '100%'; iframe.height = '360'; iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'; iframe.setAttribute('allowfullscreen','');
      modalMedia.appendChild(iframe);
    } else if(card.dataset.images){
      const img = document.createElement('img'); img.src = card.dataset.images; img.alt = card.dataset.title||''; img.style.maxWidth='100%'; modalMedia.appendChild(img);
    }
    modal.setAttribute('aria-hidden','false');
    // focus management
    modalClose.focus();
    document.body.style.overflow='hidden';
  }

  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    modalMedia.innerHTML='';
    document.body.style.overflow='';
  }

  cards.forEach(card=>{
    card.addEventListener('click', ()=>openCard(card));
    card.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' ') openCard(card) });
  });

  modalClose.addEventListener('click', closeModal);
  modal.querySelector('[data-dismiss]').addEventListener('click', closeModal);
  window.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal() });
});
