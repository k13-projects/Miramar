// Miramar Food Hall - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            const isOpen = navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            // Communicate expanded/collapsed state to assistive tech (WCAG 4.1.2)
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
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

    // Respect the user's reduced-motion preference for scripted scrolling (WCAG 2.3.3)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const target = href.length > 1 ? document.querySelector(href) : null;
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: scrollBehavior
                });
            } else {
                window.scrollTo({
                    top: 0,
                    behavior: scrollBehavior
                });

                // Wait for scroll to reach top before resetting animations
                function waitForScrollTop() {
                    if (window.pageYOffset <= 5) {
                        // Reset fade-in animations
                        document.querySelectorAll('.fade-in.visible').forEach(el => {
                            el.classList.remove('visible');
                            observer.observe(el);
                        });
                        // Reset story section animations
                        if (typeof window.resetStoryAnimations === 'function') {
                            window.resetStoryAnimations();
                        }
                    } else {
                        requestAnimationFrame(waitForScrollTop);
                    }
                }
                requestAnimationFrame(waitForScrollTop);
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
    const animateElements = document.querySelectorAll('.vendor-card, .event-card');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Let's Connect Form Handling
    initConnectForm();

    // UPDATED: Celebrations modal (T13, T14)
    initCelebrationsModal();

    // Parallax effect for hero section (throttled with rAF)
    const hero = document.querySelector('.hero');
    if (hero) {
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    const scrolled = window.pageYOffset;
                    const heroContent = hero.querySelector('.hero-content');
                    if (heroContent && scrolled < window.innerHeight) {
                        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                        heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // Story year animations now handled by story-section.js

    // UPDATED: Marquee and carousel removed (T7, T10) - replaced with static titles

    // UPDATED: Load events from Google Sheets (T12)
    // TODO: Replace SHEET_ID with the actual published Google Sheet ID
    // Sheet should have columns: Month, Day, Title, Description
    // To set up: Create a Google Sheet, publish it to web (File > Share > Publish to web > CSV)
    loadEventsFromSheet();
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
                    <span class="uploaded-file-name"></span>
                    <span class="uploaded-file-size"></span>
                </div>
                <button type="button" class="remove-file-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            `;
            fileEl.querySelector('.uploaded-file-name').textContent = file.name;
            fileEl.querySelector('.uploaded-file-size').textContent = `(${formatFileSize(file.size)})`;
            const removeBtn = fileEl.querySelector('.remove-file-btn');
            removeBtn.dataset.index = index;
            removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
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

        // Build the email body from the fields and hand off to the visitor's mail client
        const inquiryLabels = {
            general: 'General Inquiry',
            vendor: 'Vendor Opportunity',
            reservation: 'Group Reservation',
            career: 'Career Opportunity',
            other: 'Other'
        };
        const phone = (formData.get('phoneNumber') || '').trim();
        const inquiryLabel = inquiryLabels[inquiry] || inquiry;

        const bodyLines = [
            `Full Name: ${fullName}`,
            `Email: ${email}`,
            `Phone: ${phone || '—'}`,
            `Inquiry Type: ${inquiryLabel}`,
            '',
            'Message:',
            message
        ];
        // mailto: can't attach files — surface selected resumes as a note instead
        if (uploadedFiles.length) {
            bodyLines.push(
                '',
                `Note: ${uploadedFiles.length} resume file(s) selected (${uploadedFiles.map(f => f.name).join(', ')}). Please attach them to this email before sending.`
            );
        }

        window.location.href = 'mailto:info@miramarfoodhall.com'
            + '?subject=' + encodeURIComponent(`${inquiryLabel} — ${fullName}`)
            + '&body=' + encodeURIComponent(bodyLines.join('\n'));

        // Confirm to the user, then reset
        formMessage.className = 'form-message success';
        formMessage.textContent = 'Opening your email app to send your message…';

        form.reset();
        uploadedFiles = [];
        renderUploadedFiles();
        fileUploadGroup.style.display = 'none';
        fileUploadGroup.setAttribute('aria-hidden', 'true');
        fileWarning.textContent = '';

        setTimeout(() => {
            formMessage.className = 'form-message';
            formMessage.textContent = '';
        }, 5000);
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

// Opening announcement pop-up — shows on page load
function initOpeningPopup() {
    const popup = document.getElementById('openingPopup');
    const closeBtn = document.getElementById('openingPopupClose');

    if (!popup || !closeBtn) return;

    // Open on load
    popup.classList.add('active');
    popup.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();

    function closePopup() {
        popup.classList.remove('active');
        popup.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closePopup);

    // Close when clicking the dark backdrop (outside the image)
    popup.addEventListener('click', function(e) {
        if (e.target === popup) closePopup();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popup.classList.contains('active')) closePopup();
    });
}

// UPDATED: Celebrations Modal (T13, T14)
function initCelebrationsModal() {
    const cta = document.getElementById('celebrationsCta');
    const modal = document.getElementById('celebrationsModal');
    const closeBtn = document.getElementById('celebrationsClose');
    const form = document.getElementById('celebrationsForm');
    const formMessage = document.getElementById('celebrationsFormMessage');

    if (!cta || !modal) return;

    // Open modal
    cta.addEventListener('click', function(e) {
        e.preventDefault();
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    });

    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    // Form validation and submission
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        formMessage.className = 'form-message';
        formMessage.textContent = '';

        // Clear errors
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        form.querySelectorAll('.field-error').forEach(el => el.textContent = '');

        let isValid = true;
        const data = new FormData(this);

        // Validate Host Name
        if (!data.get('eventHostName').trim()) {
            document.getElementById('eventHostName').classList.add('error');
            document.getElementById('eventHostNameError').textContent = 'Event host name is required.';
            isValid = false;
        }

        // Validate Email
        const email = data.get('celebrationEmail').trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            document.getElementById('celebrationEmail').classList.add('error');
            document.getElementById('celebrationEmailError').textContent = 'Email is required.';
            isValid = false;
        } else if (!emailRegex.test(email)) {
            document.getElementById('celebrationEmail').classList.add('error');
            document.getElementById('celebrationEmailError').textContent = 'Please enter a valid email.';
            isValid = false;
        }

        // Validate Message
        if (!data.get('celebrationMessage').trim()) {
            document.getElementById('celebrationMessage').classList.add('error');
            document.getElementById('celebrationMessageError').textContent = 'Message is required.';
            isValid = false;
        }

        if (!isValid) {
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Please fix the errors above.';
            return;
        }

        // Build the email body from the fields and hand off to the visitor's mail client
        const hostName = data.get('eventHostName').trim();
        const phone = (data.get('celebrationPhone') || '').trim();
        const guests = (data.get('guestCount') || '').trim();
        const eventDate = (data.get('eventDate') || '').trim();
        const eventTime = (data.get('eventTime') || '').trim();
        const message = data.get('celebrationMessage').trim();

        const subject = `Event Inquiry — ${hostName}`;
        const body = [
            `Event Host Name: ${hostName}`,
            `Email: ${email}`,
            `Phone: ${phone || '—'}`,
            `Number of Guests: ${guests || '—'}`,
            `Date: ${eventDate || '—'}`,
            `Time: ${eventTime || '—'}`,
            '',
            'Message:',
            message
        ].join('\n');

        window.location.href = 'mailto:info@miramarfoodhall.com'
            + '?subject=' + encodeURIComponent(subject)
            + '&body=' + encodeURIComponent(body);

        // Confirm to the user, then reset & close
        formMessage.className = 'form-message success';
        formMessage.textContent = 'Opening your email app to send the request…';
        form.reset();

        setTimeout(() => {
            formMessage.className = 'form-message';
            formMessage.textContent = '';
            closeModal();
        }, 3000);
    });

    // Clear field errors on input
    form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error');
            const errorEl = document.getElementById(this.id + 'Error');
            if (errorEl) errorEl.textContent = '';
        });
    });
}

// UPDATED: Google Sheets Events Integration (T12)
// ─────────────────────────────────────────────────
// HOW TO SET UP (for James / client):
// 1. Create a Google Sheet with these exact column headers in row 1:
//    Month | Day | Title | Description
// 2. Add events in rows below, e.g.: MAR | 22 | Live Music Night | Join us for local bands
// 3. Go to File > Share > Publish to web
// 4. Select "Entire Document" and "Comma-separated values (.csv)"
// 5. Click Publish and copy the URL
// 6. Paste that URL as the SHEET_CSV_URL value below
// ─────────────────────────────────────────────────
function loadEventsFromSheet() {
    // TODO: Paste the published Google Sheet CSV URL here
    const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTAIPRmWzZ21BbTIKqx-Q8UR5hXfok2VQIoYjw7TqkO7-S16yvbKKDkLmP8ZhBAwu9cVv_8AQtgowmd/pub?output=csv';

    if (!SHEET_CSV_URL) return; // Skip if no sheet URL configured

    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;

    // Graceful empty state — shown when the sheet has no events OR can't be reached.
    // No stale/dummy events ever appear; visitors get a friendly nudge instead.
    const EMPTY_STATE = `
        <div class="events-empty">
            <p>No events scheduled right now. Check back soon.</p>
            <a href="https://instagram.com/miramarfoodhall" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Follow @miramarfoodhall for updates</a>
        </div>
    `;

    fetch(SHEET_CSV_URL)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch');
            return response.text();
        })
        .then(csv => {
            // Sorted and filtered here rather than in the sheet, so the client
            // can type rows in any order and never has to delete a finished one.
            const events = classifyEvents(parseCSV(csv));

            if (events.length > 0) {
                eventsGrid.innerHTML = events.map(event => `
                    <div class="event-card${event.state === 'past' ? ' event-card--past' : ''}">
                        <div class="event-date">
                            <span class="month">${escapeHTML(event.monthLabel)}</span>
                            <span class="day">${escapeHTML(event.day)}</span>
                        </div>
                        <div class="event-info">
                            ${event.state === 'past' ? '<span class="event-past-label">Past</span>' : ''}
                            <h3>${escapeHTML(event.title)}</h3>
                            <p>${escapeHTML(event.description)}</p>
                            ${event.url ? `<a href="${normalizeURL(event.url)}" target="_blank" rel="noopener noreferrer" class="event-link">Learn More</a>` : ''}
                        </div>
                    </div>
                `).join('');
            } else {
                // Sheet reached but empty (all events deleted) → show empty state
                eventsGrid.innerHTML = EMPTY_STATE;
            }
        })
        .catch(() => {
            // Fetch failed (sheet unpublished / offline) → same empty state
            eventsGrid.innerHTML = EMPTY_STATE;
        });
}


// ─────────────────────────────────────────────────
// What happens to an event after its date passes
// ─────────────────────────────────────────────────
// Kazim, 2026-09-18: a finished event keeps its place for a while so visitors
// can see what they missed, then disappears on its own. Three lives:
//
//   upcoming  today or later         full colour, listed first, soonest first
//   past      up to 60 days ago      greyed, labelled Past, listed after
//   gone      more than 60 days ago  not rendered
//
// The client never deletes a row to make this happen. A calendar that needs
// housekeeping to stay honest will not stay honest.
//
// THE YEAR. The sheet has Month and Day and no year, so "APRIL 1" cannot be
// placed on a timeline on its own. There is an optional sixth column, Year,
// appended after URL so the five columns this sheet already uses are untouched.
// When it is filled in it wins outright.
//
// When it is blank the year is inferred, and the inference threads one needle.
// Two rows look identical and mean opposite things:
//
//   a January event typed in December    means next year, and must appear
//   an April row nobody deleted          means last spring, and must not
//
// What separates them is how far ahead the next occurrence is. Somebody
// entering an event without a year is entering something weeks or a couple of
// months out, not eleven months. So: try this year, and if that is well behind
// us, try next year and accept it only inside NO_YEAR_LOOKAHEAD_DAYS. Otherwise
// the row is stale and is dropped.
//
// The window is chosen with the failure modes in mind. Too long and a forgotten
// row reappears as a date nobody planned, which is invented content and
// invisible. Too short and a real event does not show, which the client tells
// us about within a day. The second is self-correcting, the first is not.
//
// "Today" is today in California, where the hall is, not in the visitor's own
// time zone.
//
// This mirrors STATION8/lib/event-lifecycle.ts and GlobalFork/src/lib/
// event-lifecycle.ts. Spec: K13-WarRoom/starter-kit/EVENTS_SHEET.md
const PAST_EVENT_GRACE_DAYS = 60;
const NO_YEAR_LOOKAHEAD_DAYS = 120;
const VENUE_TIME_ZONE = 'America/Los_Angeles';
const MONTH_NAMES = ['january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'];

// Names, long or short, any case: APRIL, april, Apr, Sept, Dec.
// And numbers 1 to 12, with or without a leading zero. That was missing at
// first and it cost three events on the day the STATION8 sheet went live: the
// column is headed "Month", so 10, 11 and 12 were typed, which is an entirely
// reasonable reading of a column called Month, and all three rows silently
// vanished. A parser that only accepts the format its author had in mind is a
// trap for everyone else.
function monthIndex(raw) {
    const m = String(raw || '').trim().toLowerCase().replace(/\.$/, '');
    if (!m) return null;
    if (/^\d{1,2}$/.test(m)) {
        const n = Number(m);
        return n >= 1 && n <= 12 ? n - 1 : null;
    }
    const exact = MONTH_NAMES.indexOf(m);
    if (exact !== -1) return exact;
    const prefixed = MONTH_NAMES.findIndex(name => name.indexOf(m) === 0 && m.length >= 3);
    return prefixed === -1 ? null : prefixed;
}

function classifyEvents(rows, now) {
    now = now || new Date();
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: VENUE_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(now);
    const at = type => Number((parts.find(p => p.type === type) || {}).value);
    const today = { year: at('year'), month: at('month') - 1, day: at('day') };
    const todayStamp = Date.UTC(today.year, today.month, today.day);
    const cutoff = todayStamp - PAST_EVENT_GRACE_DAYS * 86400000;

    const dated = [];
    rows.forEach(row => {
        const month = monthIndex(row.month);
        const day = Number(String(row.day).trim());
        if (month === null || !Number.isInteger(day) || day < 1 || day > 31) return;

        const rawYear = String(row.year || '').trim();

        let timestamp;
        if (rawYear) {
            const year = Number(rawYear);
            if (!Number.isInteger(year) || year < 2000 || year > 2999) return;
            timestamp = Date.UTC(year, month, day);
            // A day-overflow, e.g. FEBRUARY 30, lands in the next month. Drop
            // it rather than silently move the event.
            if (new Date(timestamp).getUTCMonth() !== month) return;
            if (timestamp < cutoff) return;
        } else {
            const thisYear = Date.UTC(today.year, month, day);
            const nextYear = Date.UTC(today.year + 1, month, day);
            // Check the overflow on the candidate actually used; a leap day is
            // valid in one of these years and not the other.
            if (thisYear >= cutoff) {
                if (new Date(thisYear).getUTCMonth() !== month) return;
                timestamp = thisYear;
            } else if (nextYear <= todayStamp + NO_YEAR_LOOKAHEAD_DAYS * 86400000) {
                if (new Date(nextYear).getUTCMonth() !== month) return;
                timestamp = nextYear;
            } else {
                return;
            }
        }

        dated.push(Object.assign({}, row, {
            timestamp: timestamp,
            state: timestamp >= todayStamp ? 'upcoming' : 'past',
            // Always the full name in capitals, whatever was typed, so a row
            // entered as 10 does not draw a date tab reading "10 / 1".
            monthLabel: (MONTH_NAMES[month] || '').toUpperCase()
        }));
    });

    const upcoming = dated.filter(e => e.state === 'upcoming').sort((a, b) => a.timestamp - b.timestamp);
    const past = dated.filter(e => e.state === 'past').sort((a, b) => b.timestamp - a.timestamp);
    return upcoming.concat(past);
}

function parseCSV(csv) {
    const lines = csv.split('\n').slice(1); // Skip header row
    return lines
        .map(line => {
            // Handle quoted fields (commas inside descriptions)
            const cols = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const ch = line[i];
                if (ch === '"') {
                    inQuotes = !inQuotes;
                } else if (ch === ',' && !inQuotes) {
                    cols.push(current.trim());
                    current = '';
                } else {
                    current += ch;
                }
            }
            cols.push(current.trim());

            if (cols.length >= 3 && cols[0] && cols[1] && cols[2]) {
                return { month: cols[0], day: cols[1], title: cols[2], description: cols[3] || '', url: cols[4] || '', year: cols[5] || '' };
            }
            return null;
        })
        .filter(Boolean);
}

function normalizeURL(url) {
    url = url.trim();
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }
    return escapeHTML(url);
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
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
