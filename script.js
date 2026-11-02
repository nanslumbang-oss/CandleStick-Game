document.addEventListener("DOMContentLoaded", () => {
    
    /* ----------------------------------------------------
       1. ANIMASI GULIR 60FPS (Intersection Observer)
    ---------------------------------------------------- */
    // Menggunakan observer agar animasi hanya berjalan saat elemen masuk ke viewport layar
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Animasi mulai saat 15% elemen terlihat di layar
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-show');
                // Hentikan observasi setelah animasi selesai agar performa web tetap ringan
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Ambil semua elemen yang memiliki animasi dari kiri atau kanan
    const animatedElements = document.querySelectorAll('.animate-left, .animate-right');
    animatedElements.forEach(el => {
        scrollObserver.observe(el);
    });

    /* ----------------------------------------------------
       2. FITUR PENGATURAN FUNGSIONAL (Settings Modal)
    ---------------------------------------------------- */
    const settingsFab = document.getElementById('open-settings');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings');
    
    // Toggle Modal
    settingsFab.addEventListener('click', () => {
        settingsModal.classList.add('active');
    });
    
    closeSettings.addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });

    // Tutup saat mengklik area di luar kotak modal
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
        }
    });

    /* ----------------------------------------------------
       3. LOGIKA TEMA & ANIMASI
    ---------------------------------------------------- */
    const themeToggle = document.getElementById('toggle-theme');
    const animationToggle = document.getElementById('toggle-animation');

    // Cek penyimpanan lokal (localStorage) agar pengaturan user tersimpan
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }

    if (localStorage.getItem('animations') === 'disabled') {
        document.body.classList.add('no-animations');
        animationToggle.checked = false;
    }

    // Event Listener untuk ubah tema
    themeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    // Event Listener untuk matikan/hidupkan animasi
    animationToggle.addEventListener('change', (e) => {
        if (!e.target.checked) {
            document.body.classList.add('no-animations');
            localStorage.setItem('animations', 'disabled');
        } else {
            document.body.classList.remove('no-animations');
            localStorage.setItem('animations', 'enabled');
        }
    });
});
