/* ===================================
   Miramar Food Hall - Story Section
   Scroll-driven timeline with flip counter,
   wipe reveals, and chapter navigation
   =================================== */

document.addEventListener('DOMContentLoaded', function () {
    const section = document.querySelector('.story-section');
    if (!section) return;

    const chapters = section.querySelectorAll('.story-chapter');
    const transitions = section.querySelectorAll('.story-transition');
    const flipDigits = section.querySelectorAll('.flip-digit');
    const progressFill = section.querySelector('.story-progress-fill');
    const navDots = section.querySelector('.story-nav-dots');
    const dots = navDots ? navDots.querySelectorAll('.dot') : [];
    const stickyStrip = section.querySelector('.story-sticky-strip');
    const navbar = document.querySelector('.navbar');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- A. Sticky offset based on navbar height ----
    function updateStickyOffset() {
        if (stickyStrip && navbar) {
            const h = navbar.offsetHeight;
            stickyStrip.style.top = h + 'px';
        }
    }
    updateStickyOffset();
    window.addEventListener('resize', updateStickyOffset);

    // ---- B. Chapter Observer (triggers animations) ----
    const chapterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.2 });

    chapters.forEach(function (ch) { chapterObserver.observe(ch); });

    // ---- C. Transition Observer ----
    const transitionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                transitionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    transitions.forEach(function (t) { transitionObserver.observe(t); });

    // ---- D. Flip Counter Logic (slot-machine roll) ----
    var currentDigits = [0, 0, 0, 0];
    var currentYear = null;
    var flipTimers = [null, null, null, null];
    var rollGeneration = 0; // track which roll is active

    // Set a single digit instantly (no animation)
    function setDigitInstant(i, digit) {
        var el = flipDigits[i];
        if (!el) return;
        var topSpan = el.querySelector('.flip-digit-top span');
        var bottomSpan = el.querySelector('.flip-digit-bottom span');
        var card = el.querySelector('.flip-card');
        var cardSpan = card.querySelector('span');
        card.classList.remove('flipping');
        topSpan.textContent = digit;
        bottomSpan.textContent = digit;
        cardSpan.textContent = digit;
    }

    // Flip a single digit down by one step with animation
    function flipDigitDown(i, fromVal, toVal, fast, callback) {
        var el = flipDigits[i];
        if (!el) return;
        var topSpan = el.querySelector('.flip-digit-top span');
        var bottomSpan = el.querySelector('.flip-digit-bottom span');
        var card = el.querySelector('.flip-card');
        var cardSpan = card.querySelector('span');

        // Card shows old value, bottom reveals new value
        cardSpan.textContent = fromVal;
        topSpan.textContent = fromVal;
        bottomSpan.textContent = toVal;

        // Toggle fast class for quicker transitions
        if (fast) {
            card.classList.add('flip-fast');
        } else {
            card.classList.remove('flip-fast');
        }

        card.classList.remove('flipping');
        void card.offsetHeight;
        card.classList.add('flipping');

        var duration = fast ? 80 : 130;
        setTimeout(function () {
            topSpan.textContent = toVal;
            cardSpan.textContent = toVal;
            card.classList.remove('flipping');
            if (callback) callback();
        }, duration);
    }

    function cancelAllRolls() {
        for (var i = 0; i < 4; i++) {
            if (flipTimers[i]) {
                clearTimeout(flipTimers[i]);
                flipTimers[i] = null;
            }
        }
    }

    function flipTo(yearStr) {
        if (yearStr === currentYear) return;
        currentYear = yearStr;
        rollGeneration++;
        var thisGen = rollGeneration;

        var targetDigits = yearStr.padStart(4, '0').split('').map(Number);

        cancelAllRolls();

        if (prefersReducedMotion) {
            for (var i = 0; i < 4; i++) {
                setDigitInstant(i, targetDigits[i]);
            }
            currentDigits = targetDigits.slice();
            return;
        }

        // Phase 1: Quick snap to 9 on all digits (fast cascade)
        var snapDelay = 0;
        for (var i = 0; i < 4; i++) {
            (function (idx) {
                if (currentDigits[idx] === 9 && targetDigits[idx] === 9) {
                    // Already at 9 and target is 9, no work needed
                    return;
                }
                setTimeout(function () {
                    if (rollGeneration !== thisGen) return;
                    setDigitInstant(idx, 9);
                    currentDigits[idx] = 9;
                }, snapDelay);
                snapDelay += 25;
            })(i);
        }

        // Phase 2: After snap, roll all digits down from 9 to target simultaneously
        var rollStartDelay = snapDelay + 60;
        var STEP_INTERVAL = 140; // ms between each decrement

        setTimeout(function () {
            if (rollGeneration !== thisGen) return;

            for (var i = 0; i < 4; i++) {
                (function (idx) {
                    var target = targetDigits[idx];
                    var cur = 9;

                    if (cur === target) {
                        // Already at target
                        return;
                    }

                    function rollStep() {
                        if (rollGeneration !== thisGen) return;
                        if (cur <= target) return;

                        var nextVal = cur - 1;
                        flipDigitDown(idx, cur, nextVal, false, function () {
                            cur = nextVal;
                            currentDigits[idx] = nextVal;

                            if (cur > target && rollGeneration === thisGen) {
                                flipTimers[idx] = setTimeout(rollStep, STEP_INTERVAL - 130);
                            }
                        });
                    }

                    rollStep();
                })(i);
            }
        }, rollStartDelay);
    }

    // ---- E. Scroll Handler (rAF-throttled) ----
    var ticking = false;

    function onScroll() {
        var sectionRect = section.getBoundingClientRect();
        var viewH = window.innerHeight;

        // Progress bar: 0 at section top, 1 at section bottom
        var scrolled = -sectionRect.top;
        var totalScrollable = sectionRect.height - viewH;
        var progress = Math.max(0, Math.min(1, scrolled / totalScrollable));

        if (progressFill) {
            progressFill.style.width = (progress * 100) + '%';
        }

        // Determine active chapter (which chapter top is above viewport center)
        var activeIndex = 0;
        var viewCenter = viewH * 0.45;

        chapters.forEach(function (ch, i) {
            var rect = ch.getBoundingClientRect();
            if (rect.top < viewCenter) {
                activeIndex = i;
            }
        });

        // Update flip counter
        var activeYear = chapters[activeIndex].dataset.year;
        if (activeYear) {
            flipTo(activeYear);
        }

        // Update nav dots
        dots.forEach(function (d, i) {
            d.classList.toggle('active', i === activeIndex);
        });

        // Show/hide nav dots based on section visibility
        if (navDots) {
            var inSection = sectionRect.top < viewH && sectionRect.bottom > 0;
            navDots.classList.toggle('visible', inSection);
        }
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(function () {
                onScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    // ---- F. Nav Dot Click Handlers ----
    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            var target = chapters[i];
            if (!target) return;
            var navbarH = navbar ? navbar.offsetHeight : 0;
            var top = target.getBoundingClientRect().top + window.pageYOffset - navbarH - 40;
            window.scrollTo({ top: top, behavior: 'smooth' });
        });
    });

    // Arrow key navigation between dots
    if (navDots) {
        navDots.addEventListener('keydown', function (e) {
            var focused = document.activeElement;
            var index = Array.from(dots).indexOf(focused);
            if (index === -1) return;

            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                var next = dots[Math.min(index + 1, dots.length - 1)];
                next.focus();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                var prev = dots[Math.max(index - 1, 0)];
                prev.focus();
            }
        });
    }

    // ---- G. Initial trigger ----
    // Short delay then fire initial scroll calc
    setTimeout(function () {
        onScroll();
    }, 100);
});
