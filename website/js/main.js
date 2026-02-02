// Miramar Food Hall - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.vendor-card, .event-card, .story-grid');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Let's Connect Form Handling
    initConnectForm();

    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const heroContent = hero.querySelector('.hero-content');
            if (heroContent && scrolled < window.innerHeight) {
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
            }
        });
    }

    // Duplicate marquee content for seamless loop
    const marqueeContents = document.querySelectorAll('.marquee-content');
    marqueeContents.forEach(content => {
        const clone = content.innerHTML;
        content.innerHTML += clone;
    });

    // Instagram Carousel
    const carousel = document.querySelector('.instagram-carousel');
    const slides = carousel ? carousel.querySelectorAll('.instagram-grid') : [];
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const dots = document.querySelectorAll('.carousel-dot');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? 'grid' : 'none';
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        currentSlide = index;
    }

    if (prevBtn && nextBtn && slides.length > 0) {
        prevBtn.addEventListener('click', () => {
            const newIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
            showSlide(newIndex);
        });

        nextBtn.addEventListener('click', () => {
            const newIndex = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
            showSlide(newIndex);
        });

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });
    }
});

// Let's Connect Form Functionality
function initConnectForm() {
    const form = document.getElementById('connectForm');
    if (!form) return;

    const inquiryType = document.getElementById('inquiryType');
    const fileUploadGroup = document.getElementById('fileUploadGroup');
    const fileInput = document.getElementById('resumeUpload');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const uploadedFilesContainer = document.getElementById('uploadedFiles');
    const fileWarning = document.getElementById('fileWarning');
    const formMessage = document.getElementById('formMessage');

    let uploadedFiles = [];
    const MAX_FILES = 2;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['.pdf', '.doc', '.docx'];

    // Show/hide file upload based on inquiry type
    inquiryType.addEventListener('change', function() {
        const isCareer = this.value === 'career';
        fileUploadGroup.style.display = isCareer ? 'block' : 'none';
        fileUploadGroup.setAttribute('aria-hidden', !isCareer);

        if (!isCareer) {
            // Clear files when switching away from career
            uploadedFiles = [];
            renderUploadedFiles();
            fileWarning.textContent = '';
        }
    });

    // File upload area interactions
    fileUploadArea.addEventListener('click', () => fileInput.click());

    fileUploadArea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInput.click();
        }
    });

    // Drag and drop
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    });

    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('dragover');
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        fileInput.value = ''; // Reset input to allow re-selecting same file
    });

    function handleFiles(files) {
        fileWarning.textContent = '';

        for (const file of files) {
            // Check max files
            if (uploadedFiles.length >= MAX_FILES) {
                fileWarning.textContent = `Maximum ${MAX_FILES} files allowed.`;
                break;
            }

            // Check file type
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            if (!ALLOWED_TYPES.includes(ext)) {
                fileWarning.textContent = `Invalid file type. Only PDF, DOC, DOCX allowed.`;
                continue;
            }

            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                fileWarning.textContent = `File "${file.name}" exceeds 5MB limit.`;
                continue;
            }

            // Check for duplicate
            if (uploadedFiles.some(f => f.name === file.name)) {
                fileWarning.textContent = `File "${file.name}" already uploaded.`;
                continue;
            }

            uploadedFiles.push(file);
        }

        renderUploadedFiles();

        if (uploadedFiles.length >= MAX_FILES) {
            fileWarning.textContent = `Maximum ${MAX_FILES} files reached.`;
        }
    }

    function renderUploadedFiles() {
        uploadedFilesContainer.innerHTML = '';

        uploadedFiles.forEach((file, index) => {
            const fileEl = document.createElement('div');
            fileEl.className = 'uploaded-file';
            fileEl.innerHTML = `
                <div class="uploaded-file-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    <span class="uploaded-file-name">${file.name}</span>
                    <span class="uploaded-file-size">(${formatFileSize(file.size)})</span>
                </div>
                <button type="button" class="remove-file-btn" data-index="${index}" aria-label="Remove ${file.name}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            `;
            uploadedFilesContainer.appendChild(fileEl);
        });

        // Add remove button listeners
        uploadedFilesContainer.querySelectorAll('.remove-file-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                uploadedFiles.splice(index, 1);
                renderUploadedFiles();
                fileWarning.textContent = '';
            });
        });
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // Form validation and submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Clear previous messages
        formMessage.className = 'form-message';
        formMessage.textContent = '';
        clearAllErrors();

        let isValid = true;
        const formData = new FormData(this);

        // Validate Full Name
        const fullName = formData.get('fullName').trim();
        if (!fullName) {
            showFieldError('fullName', 'Full name is required.');
            isValid = false;
        }

        // Validate Email
        const email = formData.get('emailAddress').trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            showFieldError('emailAddress', 'Email address is required.');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showFieldError('emailAddress', 'Please enter a valid email address.');
            isValid = false;
        }

        // Validate Inquiry Type
        const inquiry = formData.get('inquiryType');
        if (!inquiry) {
            showFieldError('inquiryType', 'Please select an inquiry type.');
            isValid = false;
        }

        // Validate Message
        const message = formData.get('messageText').trim();
        if (!message) {
            showFieldError('messageText', 'Message is required.');
            isValid = false;
        }

        if (!isValid) {
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Please fix the errors above and try again.';
            // Focus first error field
            const firstError = form.querySelector('.error');
            if (firstError) firstError.focus();
            return;
        }

        // Simulate form submission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Success
            formMessage.className = 'form-message success';
            formMessage.textContent = 'Thank you for your message! We\'ll get back to you soon.';

            // Reset form
            form.reset();
            uploadedFiles = [];
            renderUploadedFiles();
            fileUploadGroup.style.display = 'none';
            fileUploadGroup.setAttribute('aria-hidden', 'true');
            fileWarning.textContent = '';

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            // Clear success message after 5 seconds
            setTimeout(() => {
                formMessage.className = 'form-message';
                formMessage.textContent = '';
            }, 5000);

            console.log('Form submitted:', {
                fullName,
                email,
                phone: formData.get('phoneNumber'),
                inquiryType: inquiry,
                message,
                files: uploadedFiles.map(f => f.name)
            });
        }, 1500);
    });

    function showFieldError(fieldName, message) {
        const input = document.getElementById(fieldName);
        const errorEl = document.getElementById(fieldName + 'Error');
        if (input) input.classList.add('error');
        if (errorEl) errorEl.textContent = message;
    }

    function clearAllErrors() {
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    }

    // Clear individual field errors on input
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error');
            const errorEl = document.getElementById(this.id + 'Error');
            if (errorEl) errorEl.textContent = '';
        });
    });
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .fade-in.visible {
        opacity: 1;
        transform: translateY(0);
    }

    .form-group input.error,
    .form-group textarea.error {
        border-color: #e74c3c;
    }

    .nav-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }

    .nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }

    .nav-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(5px, -5px);
    }
`;
document.head.appendChild(style);
