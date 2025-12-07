// Initialisation du site
document.addEventListener('DOMContentLoaded', function() {
    // Navigation mobile
    initMobileMenu();
    
    // Navigation fluide
    initSmoothScroll();
    
    // Animations au défilement
    initScrollAnimations();
    
    // Compteurs animés
    initCounters();
    
    // Validation du formulaire
    initContactForm();
    
    // Lazy loading des images
    initLazyLoading();
    
    // Gestion du scroll de la navbar
    initNavbarScroll();
    
    // Initialisation des tooltips si nécessaire
    initTooltips();
});

// Navigation mobile
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
    
    // Fermer le menu mobile en cliquant sur un lien
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            // Mettre à jour la classe active
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Fermer le menu en cliquant à l'extérieur
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768 && 
            !event.target.closest('.navbar') && 
            navMenu.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Navigation fluide
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Ignorer les liens qui ne pointent pas vers une ancre
            if (href === '#' || href.startsWith('#!')) return;
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Mettre à jour l'URL sans recharger la page
                history.pushState(null, null, href);
            }
        });
    });
}

// Animations au défilement
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = element.getAttribute('data-delay') || 0;
                
                setTimeout(() => {
                    element.classList.add('visible');
                }, delay * 1000);
                
                // Arrêter d'observer après l'animation
                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    // Observer tous les éléments avec des classes d'animation
    document.querySelectorAll('.animate-fade-up, .animate-fade-left, .animate-fade-right').forEach(el => {
        observer.observe(el);
    });
}

// Compteurs animés
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    if (!counters.length) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };
    
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                const duration = 2000; // 2 secondes
                const step = target / (duration / 16); // 60fps
                let current = 0;
                
                const updateCounter = () => {
                    current += step;
                    
                    if (current < target) {
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                updateCounter();
                counterObserver.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Formulaire de contact
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    // Éléments du formulaire
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectSelect = document.getElementById('subject');
    const messageTextarea = document.getElementById('message');
    const consentCheckbox = document.getElementById('consent');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');
    
    // Cacher les messages d'erreur/succès au départ
    if (formSuccess) formSuccess.style.display = 'none';
    if (formError) formError.style.display = 'none';
    
    // Validation en temps réel
    const inputs = [nameInput, emailInput, subjectSelect, messageTextarea];
    
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearError(this);
            });
        }
    });
    
    if (consentCheckbox) {
        consentCheckbox.addEventListener('change', function() {
            clearError(this);
        });
    }
    
    // Soumission du formulaire
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Valider tous les champs
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });
        
        if (consentCheckbox && !consentCheckbox.checked) {
            showError(consentCheckbox, 'Vous devez accepter la politique de confidentialité.');
            isValid = false;
        }
        
        if (!isValid) {
            // Premier champ invalide
            const firstInvalid = document.querySelector('.form-group .error-message:not(:empty)');
            if (firstInvalid) {
                firstInvalid.closest('.form-group').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
            return;
        }
        
        // Simulation d'envoi
        simulateFormSubmission();
    });
    
    // Fonctions de validation
    function validateField(field) {
        const value = field.value.trim();
        const errorId = field.id + 'Error';
        const errorElement = document.getElementById(errorId);
        
        if (!errorElement) return true;
        
        // Réinitialiser l'erreur
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        field.classList.remove('error');
        
        // Validation selon le type de champ
        if (field.required && !value) {
            showError(field, 'Ce champ est obligatoire.');
            return false;
        }
        
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showError(field, 'Veuillez entrer une adresse email valide.');
                return false;
            }
        }
        
        return true;
    }
    
    function showError(field, message) {
        const errorId = field.id + 'Error';
        const errorElement = document.getElementById(errorId);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            field.classList.add('error');
        }
    }
    
    function clearError(field) {
        const errorId = field.id + 'Error';
        const errorElement = document.getElementById(errorId);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
            field.classList.remove('error');
        }
    }
    
    // Simulation d'envoi du formulaire
    function simulateFormSubmission() {
        // Montrer le spinner
        if (submitText) submitText.style.display = 'none';
        if (submitSpinner) {
            submitSpinner.style.display = 'block';
        }
        submitBtn.disabled = true;
        
        // Cacher les messages précédents
        if (formSuccess) formSuccess.style.display = 'none';
        if (formError) formError.style.display = 'none';
        
        // Simuler une requête API
        setTimeout(() => {
            // Cacher le spinner
            if (submitText) submitText.style.display = 'inline';
            if (submitSpinner) submitSpinner.style.display = 'none';
            submitBtn.disabled = false;
            
            // Montrer le message de succès
            if (formSuccess) {
                formSuccess.style.display = 'block';
                contactForm.reset();
                
                // Faire défiler jusqu'au message de succès
                formSuccess.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                
                // Cacher le message après 5 secondes
                setTimeout(() => {
                    formSuccess.style.display = 'none';
                }, 5000);
            }
            
            // En production, vous enverriez ici une vraie requête
            // fetch('votre-endpoint-api', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         name: nameInput.value,
            //         email: emailInput.value,
            //         company: document.getElementById('company').value,
            //         subject: subjectSelect.value,
            //         message: messageTextarea.value
            //     })
            // })
            // .then(response => response.json())
            // .then(data => {
            //     // Gérer la réponse
            // })
            // .catch(error => {
            //     // Gérer l'erreur
            // });
        }, 1500);
    }
}

// Lazy loading des images
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Charger l'image
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            // Stocker l'URL réelle dans data-src
            if (!img.dataset.src) {
                img.dataset.src = img.src;
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
            }
            
            imageObserver.observe(img);
        });
    } else {
        // Fallback pour les vieux navigateurs
        lazyImages.forEach(img => {
            img.classList.add('loaded');
        });
    }
}

// Gestion du scroll de la navbar
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Ajouter/supprimer la classe scrolled
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Cacher/montrer la navbar au scroll
        if (window.innerWidth > 768) {
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                // Scrolling down
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                navbar.style.transform = 'translateY(0)';
            }
        }
        
        lastScrollTop = scrollTop;
        
        // Mettre à jour la navigation active
        updateActiveNavLink();
    });
    
    // Mettre à jour le lien actif au chargement
    updateActiveNavLink();
}

// Mettre à jour le lien de navigation actif
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSectionId = '';
    const scrollPosition = window.pageYOffset + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSectionId = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if (href === `#${currentSectionId}`) {
            link.classList.add('active');
        }
    });
}

// Initialisation des tooltips (exemple)
function initTooltips() {
    // Exemple d'implémentation de tooltips si nécessaire
    const elementsWithTooltip = document.querySelectorAll('[data-tooltip]');
    
    elementsWithTooltip.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.position = 'fixed';
            tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
            tooltip.style.zIndex = '10000';
            
            this.tooltipElement = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this.tooltipElement) {
                this.tooltipElement.remove();
                this.tooltipElement = null;
            }
        });
    });
}

// Gestion du redimensionnement de la fenêtre
window.addEventListener('resize', function() {
    // Fermer le menu mobile si on redimensionne au-dessus de 768px
    if (window.innerWidth > 768) {
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (menuToggle && navMenu) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// Support des vieux navigateurs
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
        return setTimeout(callback, 1000 / 60);
    };
}

// Polyfill pour Element.closest()
if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
        var el = this;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

// Polyfill pour Element.matches()
if (!Element.prototype.matches) {
    Element.prototype.matches = 
        Element.prototype.matchesSelector || 
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector || 
        Element.prototype.oMatchesSelector || 
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;
        };
}