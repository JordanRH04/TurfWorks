document.addEventListener('DOMContentLoaded', () => {
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } });
  }, { threshold: .15 });
  revealEls.forEach(el => io.observe(el));

  /* ---------- stat counters ---------- */
  const counters = document.querySelectorAll('.counter');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.dataset.target, 10);
        const dur = 1400;
        const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = Math.floor(p * target);
          if (p < 1) requestAnimationFrame(tick); else el.textContent = target;
        }
        requestAnimationFrame(tick);
        cio.unobserve(el);
      }
    });
  }, { threshold: .4 });
  counters.forEach(c => cio.observe(c));

  /* ---------- cycling word ---------- */
  const words = ['lawn', 'garden', 'weekends', 'curb appeal'];
  const cw = document.querySelector('.cycle-word');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (cw && !reduceMotion) {
    let i = 0;
    setInterval(() => {
      i = (i + 1) % words.length;
      cw.style.opacity = 0;
      setTimeout(() => { cw.textContent = words[i]; cw.style.opacity = 1; }, 250);
    }, 2800);
  }

  /* ---------- mobile nav toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---------- portfolio filter ---------- */
  const pills = document.querySelectorAll('.filter-pill');
  const pItems = document.querySelectorAll('.p-item');
  if (pills.length) {
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.dataset.filter;
        pItems.forEach(item => {
          const show = cat === 'all' || item.dataset.category === cat;
          item.classList.toggle('hide', !show);
        });
      });
    });
  }

  /* ---------- booking calendar ---------- */
  const calGrid = document.getElementById('calGrid');
  if (calGrid) {
    const monthLabel = document.getElementById('calMonthLabel');
    const prevBtn = document.getElementById('calPrev');
    const nextBtn = document.getElementById('calNext');
    const slotRow = document.getElementById('slotRow');
    const sumDate = document.getElementById('sumDate');
    const sumTime = document.getElementById('sumTime');
    const submitBtn = document.getElementById('bookSubmit');
    const bookForm = document.getElementById('bookForm');
    const confirmBox = document.getElementById('confirmBox');

    let viewDate = new Date();
    viewDate.setDate(1);
    let selectedDate = null;
    let selectedSlot = null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const slotsByDay = ['8:00 AM','10:00 AM','1:00 PM','3:00 PM'];

    function renderCalendar() {
      calGrid.querySelectorAll('.cal-day').forEach(n => n.remove());
      monthLabel.textContent = `${months[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
      const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
      const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

      for (let i = 0; i < firstDay; i++) {
        const el = document.createElement('div');
        el.className = 'cal-day empty';
        calGrid.appendChild(el);
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const thisDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
        const el = document.createElement('div');
        el.textContent = d;
        const isPast = thisDate < today;
        const isSunday = thisDate.getDay() === 0;
        const disabled = isPast || isSunday;
        el.className = 'cal-day ' + (disabled ? 'disabled' : 'avail');
        if (!disabled) {
          el.addEventListener('click', () => {
            calGrid.querySelectorAll('.cal-day').forEach(n => n.classList.remove('selected'));
            el.classList.add('selected');
            selectedDate = thisDate;
            selectedSlot = null;
            renderSlots();
          });
        }
        calGrid.appendChild(el);
      }
    }

    function renderSlots() {
      slotRow.innerHTML = '';
      slotsByDay.forEach((time, idx) => {
        const taken = (selectedDate.getDate() + idx) % 5 === 0; // demo-only availability pattern
        const el = document.createElement('div');
        el.className = 'slot' + (taken ? ' taken' : '');
        el.textContent = time;
        if (!taken) {
          el.addEventListener('click', () => {
            slotRow.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
            el.classList.add('selected');
            selectedSlot = time;
            updateSummary();
          });
        }
        slotRow.appendChild(el);
      });
      updateSummary();
    }

    function updateSummary() {
      sumDate.textContent = selectedDate
        ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        : 'Select a date';
      sumTime.textContent = selectedSlot || 'Select a time';
      submitBtn.disabled = !(selectedDate && selectedSlot);
    }

    prevBtn.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); });
    nextBtn.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); });

    if (bookForm) {
      bookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!selectedDate || !selectedSlot) return;
        bookForm.style.display = 'none';
        confirmBox.style.display = 'block';
      });
    }

    renderCalendar();
    updateSummary();
  }

  /* ---------- contact form demo submit ---------- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const confirmEl = document.getElementById('contactConfirm');
      contactForm.style.display = 'none';
      if (confirmEl) confirmEl.style.display = 'block';
    });
  }
});
