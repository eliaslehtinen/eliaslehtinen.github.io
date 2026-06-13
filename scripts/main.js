// Basic interactivity: filters, open modal with content, embed youtube if present
document.addEventListener("DOMContentLoaded", async () => {
  // Fetch and render projects
  let projects = [];
  try {
    const resp = await fetch("data/projects.json");
    projects = await resp.json();
    renderCards(projects);
  } catch (e) {
    console.error("Failed to load projects:", e);
  }

  function renderCards(projectList) {
    const grid = document.getElementById("projects");
    grid.innerHTML = "";
    projectList.forEach((proj) => {
      const article = document.createElement("article");
      article.className = "card";
      article.setAttribute("role", "button");
      article.setAttribute(
        "aria-label",
        `Open ${proj.type === "experience" ? "experience" : "project"} ${proj.title}`,
      );
      article.setAttribute("tabindex", "0");
      article.dataset.type = proj.type;
      article.dataset.title = proj.title;
      article.dataset.year = proj.year;
      article.dataset.tech = proj.tech;
      article.dataset.desc = proj.description;
      article.dataset.images = proj.images.join(",");
      if (proj.youtube) article.dataset.youtube = proj.youtube;
      article.project = proj;

      const thumb = document.createElement("img");
      thumb.className = "thumb";
      thumb.src = proj.images[0];
      thumb.alt = `${proj.title} thumbnail`;

      const body = document.createElement("div");
      body.className = "card-body";
      const title = document.createElement("h3");
      title.className = "card-title";
      title.textContent = proj.title;
      const meta = document.createElement("p");
      meta.className = "card-meta";
      meta.textContent = `${proj.type === "experience" ? "Work Experience" : proj.type.charAt(0).toUpperCase() + proj.type.slice(1)} · ${proj.year}`;

      body.appendChild(title);
      body.appendChild(meta);
      if (proj.role) {
        const roleText = document.createElement("p");
        roleText.className = "card-role";
        roleText.textContent = `Role: ${proj.role}`;
        body.appendChild(roleText);
      }
      article.appendChild(thumb);
      article.appendChild(body);
      grid.appendChild(article);
    });
    setupCardListeners();
  }

  function setupCardListeners() {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      card.addEventListener("click", () => openCard(card));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openCard(card);
        }
      });
    });
  }

  const filters = document.querySelectorAll(".filter-btn");
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalMeta = document.getElementById("modal-meta");
  const modalDesc = document.getElementById("modal-desc");
  const modalMedia = document.getElementById("modal-media");
  const modalClose = modal.querySelector(".modal-close");

  let lastFocused = null;
  let slides = [];
  let currentSlide = 0;

  function applyFilter(filterType) {
    const cards = document.querySelectorAll(".card");
    cards.forEach((c) => {
      c.style.display =
        filterType === "all" || c.dataset.type === filterType ? "flex" : "none";
    });
  }

  filters.forEach((btn) =>
    btn.addEventListener("click", () => {
      filters.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      applyFilter(btn.dataset.filter);
    }),
  );

  function createCarousel(imageList, title) {
    slides = imageList.slice();
    currentSlide = 0;
    const container = document.createElement("div");
    container.className = "carousel";
    const img = document.createElement("img");
    img.className = "carousel-image";
    img.src = slides[0];
    img.alt = title ? `${title} screenshot 1` : "";
    container.appendChild(img);
    const controls = document.createElement("div");
    controls.className = "carousel-controls";
    const prev = document.createElement("button");
    prev.className = "carousel-btn prev";
    prev.setAttribute("aria-label", "Previous");
    prev.innerHTML = "◀";
    const next = document.createElement("button");
    next.className = "carousel-btn next";
    next.setAttribute("aria-label", "Next");
    next.innerHTML = "▶";
    controls.appendChild(prev);
    controls.appendChild(next);
    container.appendChild(controls);

    function showSlide(delta) {
      if (slides.length === 0) return;
      currentSlide = (currentSlide + delta + slides.length) % slides.length;
      img.src = slides[currentSlide];
      if (title) img.alt = `${title} screenshot ${currentSlide + 1}`;
    }

    prev.addEventListener("click", () => showSlide(-1));
    next.addEventListener("click", () => showSlide(1));

    // expose showSlide so keyboard handlers can use it
    container.showSlide = showSlide;
    return container;
  }

  function trapFocus(modalEl) {
    const focusableSelector =
      'a[href], area, input, select, textarea, button, iframe, [tabindex]:not([tabindex="-1"])';
    const nodes = Array.from(
      modalEl.querySelectorAll(focusableSelector),
    ).filter((n) => !n.hasAttribute("disabled"));
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    function keyHandler(e) {
      if (e.key === "Tab") {
        if (nodes.length === 0) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
      if (e.key === "ArrowLeft") {
        if (
          typeof modalMedia.querySelector(".carousel")?.showSlide === "function"
        )
          modalMedia.querySelector(".carousel").showSlide(-1);
      }
      if (e.key === "ArrowRight") {
        if (
          typeof modalMedia.querySelector(".carousel")?.showSlide === "function"
        )
          modalMedia.querySelector(".carousel").showSlide(1);
      }
      if (e.key === "Escape") {
        closeModal();
      }
    }
    modalEl._keyHandler = keyHandler;
    document.addEventListener("keydown", keyHandler);
    // focus first focusable element
    if (first) first.focus();
    else modalClose.focus();
  }

  function removeTrap(modalEl) {
    if (modalEl._keyHandler)
      document.removeEventListener("keydown", modalEl._keyHandler);
    modalEl._keyHandler = null;
  }

  function openCard(card) {
    const project = card.project || {
      title: card.dataset.title,
      tech: card.dataset.tech,
      year: card.dataset.year,
      description: card.dataset.desc,
      images: card.dataset.images
        ? card.dataset.images.split(",").map((s) => s.trim())
        : [],
      youtube: card.dataset.youtube,
    };
    lastFocused = document.activeElement;
    modalTitle.textContent = project.title || "";
    modalMeta.textContent = [project.tech, project.year]
      .filter(Boolean)
      .join(" · ");
    document.getElementById("modal-role").textContent = project.role
      ? `Role: ${project.role}`
      : "";
    modalDesc.textContent = project.description || "";
    modalMedia.innerHTML = "";
    document.getElementById("modal-tasks").innerHTML = "";
    document.getElementById("modal-links").innerHTML = "";
    slides = [];
    currentSlide = 0;
    if (project.youtube) {
      const iframe = document.createElement("iframe");
      iframe.src = project.youtube;
      iframe.width = "100%";
      iframe.height = "360";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("title", `${project.title || "Video"} demo`);
      modalMedia.appendChild(iframe);
    } else if (project.images && project.images.length) {
      if (project.images.length > 1) {
        modalMedia.appendChild(createCarousel(project.images, project.title));
      } else {
        const img = document.createElement("img");
        img.src = project.images[0];
        img.alt = project.title || "";
        img.style.maxWidth = "100%";
        modalMedia.appendChild(img);
      }
    }
    if (Array.isArray(project.tasks) && project.tasks.length) {
      const tasksList = document.getElementById("modal-tasks");
      const label = document.createElement("p");
      label.className = "modal-tasks-label";
      label.textContent = "Tasks:";
      tasksList.appendChild(label);
      project.tasks.forEach((task) => {
        const item = document.createElement("li");
        item.textContent = task;
        tasksList.appendChild(item);
      });
    }
    if (Array.isArray(project.links) && project.links.length) {
      const linksContainer = document.getElementById("modal-links");
      const label = document.createElement("p");
      label.className = "modal-links-label";
      label.textContent = "Links:";
      linksContainer.appendChild(label);
      const linkGroup = document.createElement("div");
      linkGroup.className = "link-group";
      project.links.forEach((link) => {
        const anchor = document.createElement("a");
        anchor.href = link.url;
        anchor.textContent = link.label || link.url;
        anchor.target = "_blank";
        anchor.rel = "noreferrer noopener";
        anchor.className = "link-pill";
        linkGroup.appendChild(anchor);
      });
      linksContainer.appendChild(linkGroup);
    }
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    trapFocus(modal);
  }

  function closeModal() {
    removeTrap(modal);
    modal.setAttribute("aria-hidden", "true");
    modalMedia.innerHTML = "";
    document.body.style.overflow = "";
    if (lastFocused && typeof lastFocused.focus === "function")
      lastFocused.focus();
  }

  modalClose.addEventListener("click", closeModal);
  modal.querySelector("[data-dismiss]").addEventListener("click", closeModal);
});
