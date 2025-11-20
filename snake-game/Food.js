class Food {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.position = { x: 0, y: 0 };
        this.type = 'normal'; // normal, energy, bonus
        this.color = '#0ff';
        this.pulse = 0;
    }

    spawn(cols, rows, snakeBody) {
        let validPosition = false;
        while (!validPosition) {
            this.position.x = Math.floor(Math.random() * cols);
            this.position.y = Math.floor(Math.random() * rows);

            // Check if food spawns on snake
            validPosition = !snakeBody.some(segment =>
                segment.x === this.position.x && segment.y === this.position.y
            );
        }

        // Randomize type
        const rand = Math.random();
        if (rand < 0.1) {
            this.type = 'bonus';
            this.color = '#ff0'; // Yellow
        } else if (rand < 0.3) {
            this.type = 'energy';
            this.color = '#f0f'; // Magenta
        } else {
            this.type = 'normal';
            this.color = '#0ff'; // Cyan
        }
    }

    draw(ctx) {
        const x = this.position.x * this.gridSize;
        const y = this.position.y * this.gridSize;
        const size = this.gridSize;
        const center = size / 2;

        this.pulse += 0.1;
        const glow = Math.sin(this.pulse) * 5 + 10;

        ctx.save();
        ctx.shadowBlur = glow;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;

        if (this.type === 'normal') {
            ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        } else if (this.type === 'energy') {
            ctx.beginPath();
            ctx.arc(x + center, y + center, size / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'bonus') {
            ctx.translate(x + center, y + center);
            ctx.rotate(this.pulse);
            ctx.fillRect(-size / 3, -size / 3, size / 1.5, size / 1.5);
        }

        ctx.restore();
    }
}
