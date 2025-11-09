/* ========================================
   PowerShare Platform - Custom JavaScript
   ======================================== */

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips if Bootstrap tooltips are used
    initializeTooltips();

    // Initialize smooth scrolling
    initializeSmoothScroll();

    // Initialize form validation
    initializeFormValidation();

    // Add fade-in animations
    addFadeInAnimations();

    // Initialize notification badge update
    updateNotificationBadge();

    console.log('PowerShare Platform Initialized');
});

// ===== TOOLTIP INITIALIZATION =====
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// ===== SMOOTH SCROLLING =====
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '#!') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// ===== FORM VALIDATION =====
function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
}

// ===== FADE-IN ANIMATIONS =====
function addFadeInAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .feature-card').forEach(el => {
        observer.observe(el);
    });
}

// ===== NOTIFICATION BADGE =====
function updateNotificationBadge() {
    // Simulate notification count
    const notificationCount = 5; // This would come from backend in production
    const badge = document.querySelector('.navbar .badge');
    if (badge && notificationCount > 0) {
        badge.textContent = notificationCount;
    }
}

// ===== USER AUTHENTICATION =====
function checkAuthentication() {
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');

    // If on a dashboard page and not authenticated, redirect to login
    if (!userRole && (
        window.location.pathname.includes('dashboard') ||
        window.location.pathname.includes('billing') ||
        window.location.pathname.includes('outage')
    )) {
        window.location.href = 'login.html';
    }

    return { userRole, userName };
}

// ===== LOGOUT FUNCTIONALITY =====
function logout() {
    // Clear all localStorage data
    localStorage.clear();

    // Show logout message
    showNotification('You have been logged out successfully', 'info');

    // Redirect to home page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Add to body
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// ===== PAYMENT PROCESSING =====
function processPayment(invoiceId, amount) {
    // Show loading state
    showNotification('Processing payment...', 'info');

    // Simulate API call
    setTimeout(() => {
        // Simulate successful payment
        showNotification(`Payment of $${amount} successful!`, 'success');

        // Update UI
        updatePaymentStatus(invoiceId, 'paid');

        // In production, this would make an API call:
        // fetch('/api/payments/process', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ invoiceId, amount })
        // });
    }, 2000);
}

function updatePaymentStatus(invoiceId, status) {
    // Find and update the invoice row
    const invoiceRow = document.querySelector(`tr[data-invoice="${invoiceId}"]`);
    if (invoiceRow) {
        const statusBadge = invoiceRow.querySelector('.badge');
        if (statusBadge) {
            statusBadge.className = 'badge bg-success';
            statusBadge.innerHTML = '<i class="fas fa-check me-1"></i>Paid';
        }
    }
}

// ===== SEARCH FUNCTIONALITY =====
function searchTable(searchTerm, tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    const term = searchTerm.toLowerCase();

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

// ===== FILTER FUNCTIONALITY =====
function filterByStatus(status, tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
        if (status === 'all') {
            row.style.display = '';
        } else {
            const statusBadge = row.querySelector('.badge');
            if (statusBadge && statusBadge.textContent.toLowerCase().includes(status)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

// ===== DATE FORMATTING =====
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

function formatDateTime(date) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('en-US', options);
}

// ===== CURRENCY FORMATTING =====
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// ===== COUNTDOWN TIMER =====
function startCountdown(targetTime, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetTime - now;

        if (distance < 0) {
            element.textContent = 'Outage in progress';
            return;
        }

        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        element.textContent = `${hours}h ${minutes}m ${seconds}s`;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ===== DATA LOADING =====
function loadUserData() {
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');

    // Update user name displays
    document.querySelectorAll('#userNameDisplay, #userName').forEach(el => {
        if (userName) {
            el.textContent = userName;
        }
    });

    return { userRole, userName };
}

// ===== CHART HELPERS =====
function createLineChart(canvasId, labels, data, label) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function createDoughnutChart(canvasId, labels, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#0d6efd',
                    '#0dcaf0',
                    '#ffc107',
                    '#198754',
                    '#dc3545'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// ===== FILE UPLOAD =====
function handleFileUpload(input, callback) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result, file);
    };
    reader.readAsDataURL(file);
}

// ===== MODAL HELPERS =====
function showModal(modalId) {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}

function hideModal(modalId) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) {
        modal.hide();
    }
}

// ===== LOCAL STORAGE HELPERS =====
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        return false;
    }
}

function loadFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        return null;
    }
}

// ===== API HELPERS (For future backend integration) =====
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            // Add authorization header if token exists
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    };

    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`/api/${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API call failed');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        showNotification(error.message, 'danger');
        throw error;
    }
}

// ===== DEBOUNCE HELPER =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== COPY TO CLIPBOARD =====
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy', 'danger');
    });
}

// ===== PRINT FUNCTIONALITY =====
function printInvoice(invoiceId) {
    // In production, this would generate a printable invoice
    window.print();
}

// ===== DOWNLOAD FUNCTIONALITY =====
function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===== THEME TOGGLE (Optional) =====
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// ===== LOAD SAVED THEME =====
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
    }
}

// ===== VALIDATE EMAIL =====
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ===== VALIDATE PHONE =====
function isValidPhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 8;
}

// ===== PASSWORD STRENGTH CHECKER =====
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;

    return {
        score: strength,
        text: ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][Math.max(0, strength - 1)]
    };
}

// ===== LOADING INDICATOR =====
function showLoading() {
    const loader = document.createElement('div');
    loader.id = 'globalLoader';
    loader.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
    loader.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    loader.style.zIndex = '9999';
    loader.innerHTML = '<div class="spinner-border text-light" role="status"></div>';
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('globalLoader');
    if (loader) {
        loader.remove();
    }
}

// ===== CONFIRM DIALOG =====
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// ===== AUTO-SAVE FUNCTIONALITY =====
let autoSaveTimeout;
function autoSave(formId, saveFunction) {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        const form = document.getElementById(formId);
        if (form) {
            const formData = new FormData(form);
            saveFunction(formData);
        }
    }, 1000);
}

// ===== EXPORT FUNCTIONS FOR USE IN HTML =====
window.PowerShareApp = {
    logout,
    processPayment,
    showNotification,
    searchTable,
    filterByStatus,
    formatDate,
    formatDateTime,
    formatCurrency,
    copyToClipboard,
    printInvoice,
    downloadFile,
    toggleTheme,
    confirmAction
};

// ===== MODERN HOME PAGE ANIMATIONS =====

// Counter Animation for Stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200; // Animation speed

    counters.forEach(counter => {
        const animate = () => {
            const value = +counter.getAttribute('data-target');
            const data = +counter.innerText.replace(/[^0-9]/g, '');

            const time = value / speed;
            if (data < value) {
                const increment = Math.ceil(time);
                counter.innerText = data + increment;
                setTimeout(animate, 1);
            } else {
                counter.innerText = value + (value === 99 ? '%' : '+');
            }
        };
        animate();
    });
}

// Intersection Observer for Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');

                // Trigger counter animation when stats section is visible
                if (entry.target.closest('.stats-section')) {
                    const counters = entry.target.querySelectorAll('.stat-number');
                    if (counters.length > 0) {
                        animateCounters();
                    }
                }

                // Unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with data-aos attribute
    document.querySelectorAll('[data-aos]').forEach(element => {
        observer.observe(element);
    });

    // Observe stats section
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

// Parallax effect for hero shapes
function initParallaxEffect() {
    const hero = document.querySelector('.hero-modern');
    if (!hero) return;

    const shapes = document.querySelectorAll('.shape');

    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 20;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;

            shape.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

// Smooth reveal on scroll
function initSmoothReveal() {
    const cards = document.querySelectorAll('.feature-card-modern, .step-card, .testimonial-card, .pricing-card-modern');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, revealOptions);

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease-out';
        revealOnScroll.observe(card);
    });
}

// Add floating animation to hero illustration cards
function initHeroCardAnimations() {
    const illustrationCards = document.querySelectorAll('.illustration-card');

    illustrationCards.forEach((card, index) => {
        // Add slight rotation on hover
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) rotate(3deg)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotate(0deg)';
        });
    });
}

// Typing effect for hero title (optional)
function initTypingEffect() {
    const gradientText = document.querySelector('.gradient-text');
    if (!gradientText) return;

    const text = gradientText.textContent;
    gradientText.textContent = '';
    gradientText.style.opacity = '1';

    let index = 0;
    const typingSpeed = 100;

    function type() {
        if (index < text.length) {
            gradientText.textContent += text.charAt(index);
            index++;
            setTimeout(type, typingSpeed);
        }
    }

    // Start typing after a delay
    setTimeout(type, 1000);
}

// Add ripple effect to buttons
function initButtonRipple() {
    const buttons = document.querySelectorAll('.btn-hero-primary, .btn-hero-secondary, .btn-pricing');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Add tilt effect to pricing cards
function initCardTilt() {
    const pricingCards = document.querySelectorAll('.pricing-card-modern');

    pricingCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// Initialize all home page animations
function initHomePageAnimations() {
    // Check if we're on the home page
    const isHomePage = document.querySelector('.hero-modern');
    if (!isHomePage) return;

    console.log('Initializing home page animations...');

    // Initialize all animations
    initScrollAnimations();
    initParallaxEffect();
    initSmoothReveal();
    initHeroCardAnimations();
    initButtonRipple();
    initCardTilt();

    // Optional: Uncomment for typing effect
    // initTypingEffect();

    console.log('Home page animations initialized successfully');
}

// Add CSS for ripple effect
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }

    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// ===== END OF SCRIPT =====
console.log('PowerShare JavaScript loaded successfully');

// Initialize home page animations when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomePageAnimations);
} else {
    initHomePageAnimations();
}

