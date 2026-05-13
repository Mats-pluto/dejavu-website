/* ============================================================
   COIFFEUR DÉJÀVU – script.js
   Funktionen:
   1. Header-Scrolleffekt (Hintergrund erscheint beim Scrollen)
   2. Mobile Navigation (Hamburger-Menü)
   3. Aktive Nav-Links beim Scrollen (Highlighting)
   4. Scroll-Reveal-Animationen (Elemente erscheinen beim Einblenden)
   5. Formular-Validierung & Demo-Absenden
   6. Jahreszahl im Footer automatisch aktualisieren
   ============================================================ */

/* Warten, bis das HTML vollständig geladen ist */
document.addEventListener('DOMContentLoaded', () => {


  /* =====================
     1. HEADER – Scrolleffekt
        Die Klasse .scrolled wird hinzugefügt, sobald der Nutzer
        mehr als 50px nach unten gescrollt hat.
     ===================== */
  const header = document.getElementById('site-header');

  function handleHeaderScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // Direkt beim Laden prüfen (z. B. bei Page Refresh)


  /* =====================
     2. MOBILE NAVIGATION
        Hamburger-Knopf öffnet / schließt das Menü.
        Klick auf einen Nav-Link schließt das Menü automatisch.
     ===================== */
  const navToggle = document.getElementById('nav-toggle');
  const mainNav   = document.getElementById('main-nav');

  if (navToggle && mainNav) {

    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');

      // Scrollen des Body sperren, wenn Menü offen ist
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Klick auf einen Link → Menü schließen
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-label', 'Menü öffnen');
        document.body.style.overflow = '';
      });
    });
  }


  /* =====================
     3. AKTIVE NAV-LINKS
        Hebt den Link der aktuell sichtbaren Sektion hervor.
     ===================== */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.main-nav a[href^="#"]');

  function setActiveNavLink() {
    let currentId = '';

    sections.forEach(section => {
      // Sektion gilt als aktiv, wenn ihr oberer Rand weniger als 200px vom Viewport-Oben liegt
      if (window.scrollY >= section.offsetTop - 200) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentId) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', setActiveNavLink, { passive: true });
  setActiveNavLink();


  /* =====================
     4. SCROLL-REVEAL-ANIMATIONEN
        Elemente mit der Klasse .reveal werden sichtbar,
        sobald sie in den sichtbaren Bereich des Browsers scrollen.

        Verwendung im HTML:
        Fügen Sie class="reveal" zu jedem Element hinzu,
        das animiert erscheinen soll (z. B. Karten, Texte).
     ===================== */

  // Alle Karten und relevante Elemente automatisch mit .reveal versehen
  const revealTargets = document.querySelectorAll(
    '.service-card, .team-card, .product-card, .review-card, .kontakt-card, .salon-text, .salon-images'
  );

  revealTargets.forEach(el => el.classList.add('reveal'));

  // IntersectionObserver: effizient, ohne scroll-Event-Listener
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Element nicht mehr beobachten, nachdem es erschienen ist
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,     // Element muss zu 10 % sichtbar sein
      rootMargin: '0px 0px -40px 0px'  // Etwas frühzeitiger triggern
    }
  );

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


  /* =====================
     5. KONTAKTFORMULAR – Validierung & Demo-Absenden

        WICHTIG FÜR DIE EINRICHTUNG:
        Damit Nachrichten wirklich ankommen, benötigen Sie
        einen Formulardienst wie Formspree (kostenlos):
        1. Erstellen Sie ein Konto auf formspree.io
        2. Erstellen Sie ein Formular und kopieren Sie Ihre ID
        3. Ersetzen Sie "IHRE-FORMSPREE-ID" unten durch die echte ID
        4. Entfernen Sie das event.preventDefault() und lassen Sie
           das Formular normal abschicken, ODER behalten Sie das
           fetch()-Abschicken per JavaScript.

        Alternativ: Setzen Sie action="mailto:ihre@email.de"
        im <form>-Tag (erfordert E-Mail-Programm auf dem Gerät).
     ===================== */
  const contactForm  = document.getElementById('contact-form');
  const formSuccess  = document.getElementById('form-success');
  const FORMSPREE_ID = 'IHRE-FORMSPREE-ID'; // ← Hier Ihre ID eintragen

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // --- Einfache Validierung ---
      const name    = document.getElementById('name');
      const email   = document.getElementById('email');
      let isValid   = true;

      // Fehlerklassen zurücksetzen
      [name, email].forEach(field => field.classList.remove('error'));

      if (!name.value.trim()) {
        name.classList.add('error');
        isValid = false;
      }

      if (!email.value.trim() || !email.value.includes('@')) {
        email.classList.add('error');
        isValid = false;
      }

      if (!isValid) return;

      // --- Formulardaten sammeln ---
      const formData = new FormData(contactForm);

      // Absende-Button deaktivieren während des Sendens
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Wird gesendet …';
      submitBtn.disabled = true;

      try {
        /* ---- Echtes Abschicken via Formspree ----
           Kommentieren Sie diese Option ein, wenn Sie Formspree verwenden:

        const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' }
        });

        if (response.ok) {
          contactForm.reset();
          formSuccess.style.display = 'block';
        } else {
          alert('Es gab ein Problem. Bitte rufen Sie uns direkt an.');
        }
        */

        /* ---- Demo-Modus (ohne echtes Backend) ----
           Simuliert eine kurze Verzögerung und zeigt die Erfolgsmeldung.
           Entfernen Sie diesen Block, wenn Sie Formspree nutzen. */
        await new Promise(resolve => setTimeout(resolve, 1000));
        contactForm.reset();
        if (formSuccess) {
          formSuccess.style.display = 'block';
          // Automatisch nach 5 Sekunden ausblenden
          setTimeout(() => { formSuccess.style.display = 'none'; }, 5000);
        }

      } catch (error) {
        alert('Verbindungsfehler. Bitte rufen Sie uns direkt an: 02323 9469252');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }


  /* =====================
     6. JAHRESZAHL IM FOOTER
        Wird automatisch mit dem aktuellen Jahr befüllt.
     ===================== */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  /* =====================
     7. SMOOTH SCROLL für Anker-Links
        (als Fallback für ältere Browser, die kein CSS scroll-behavior kennen)
     ===================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });


}); // Ende DOMContentLoaded
