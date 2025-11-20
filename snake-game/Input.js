class Input {
    constructor() {
        this.direction = { x: 1, y: 0 }; // Initial direction: Right
        this.lastDirection = { x: 1, y: 0 }; // Prevent 180 turns
        this.inputQueue = []; // Queue inputs for smooth turning
        this.isSpacePressed = false;

        window.addEventListener('keydown', this.handleKey.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));

        // Touch Controls
        this.touchStartX = 0;
        this.touchStartY = 0;
        window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });

        // Virtual Button
        const mobileBtn = document.getElementById('mobile-bullet-time-btn');
        if (mobileBtn) {
            mobileBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.isSpacePressed = true;
            });
            mobileBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.isSpacePressed = false;
            });
        }
    }

    handleTouchStart(e) {
        // Ignore if touching the button
        if (e.target.closest('.mobile-btn')) return;

        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }

    handleTouchMove(e) {
        // Ignore if touching the button
        if (e.target.closest('.mobile-btn')) return;
        e.preventDefault(); // Prevent scrolling

        if (!this.touchStartX || !this.touchStartY) return;

        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;

        const dx = touchEndX - this.touchStartX;
        const dy = touchEndY - this.touchStartY;

        // Threshold for swipe
        if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal
                if (dx > 0) this.inputQueue.push({ x: 1, y: 0 });
                else this.inputQueue.push({ x: -1, y: 0 });
            } else {
                // Vertical
                if (dy > 0) this.inputQueue.push({ x: 0, y: 1 });
                else this.inputQueue.push({ x: 0, y: -1 });
            }

            // Reset start to allow continuous swiping
            this.touchStartX = touchEndX;
            this.touchStartY = touchEndY;
        }
    }

    handleKey(e) {
        // Prevent default scrolling for arrow keys and space
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }

        const key = e.key;

        // Bullet Time
        if (key === ' ') {
            this.isSpacePressed = true;
            return;
        }

        // Direction Controls
        // We push to a queue to handle rapid key presses correctly
        if (key === 'ArrowUp' || key === 'w' || key === 'W') this.inputQueue.push({ x: 0, y: -1 });
        if (key === 'ArrowDown' || key === 's' || key === 'S') this.inputQueue.push({ x: 0, y: 1 });
        if (key === 'ArrowLeft' || key === 'a' || key === 'A') this.inputQueue.push({ x: -1, y: 0 });
        if (key === 'ArrowRight' || key === 'd' || key === 'D') this.inputQueue.push({ x: 1, y: 0 });
    }

    handleKeyUp(e) {
        if (e.key === ' ') {
            this.isSpacePressed = false;
        }
    }

    getDirection() {
        if (this.inputQueue.length > 0) {
            const nextDir = this.inputQueue.shift();
            // Prevent 180 degree turns
            if (nextDir.x !== 0 && this.lastDirection.x !== 0) return this.lastDirection;
            if (nextDir.y !== 0 && this.lastDirection.y !== 0) return this.lastDirection;

            this.direction = nextDir;
            this.lastDirection = nextDir;
        }
        return this.direction;
    }
}
