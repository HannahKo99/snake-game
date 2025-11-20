class Snake {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.body = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.direction = { x: 1, y: 0 };
        this.growCount = 0;
        this.color = '#0ff';
        this.headColor = '#fff';
    }

    update(direction) {
        this.direction = direction;

        // Calculate new head position
        const head = { ...this.body[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;

        // Add new head
        this.body.unshift(head);

        // Remove tail unless growing
        if (this.growCount > 0) {
            this.growCount--;
        } else {
            this.body.pop();
        }
    }

    grow(amount = 1) {
        this.growCount += amount;
    }

    checkCollision(cols, rows) {
        const head = this.body[0];

        // Wall Collision
        if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
            return true;
        }

        // Self Collision
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                return true;
            }
        }

        return false;
    }

    checkFoodCollision(foodPosition) {
        const head = this.body[0];
        return head.x === foodPosition.x && head.y === foodPosition.y;
    }

    draw(ctx) {
        ctx.save();

        // Draw Body
        this.body.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            const size = this.gridSize - 2; // Gap between segments

            // Color gradient from head to tail
            const alpha = 1 - (index / (this.body.length + 5));

            ctx.fillStyle = index === 0 ? this.headColor : this.color;
            ctx.globalAlpha = Math.max(0.2, alpha);

            // Glow effect for head
            if (index === 0) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = this.headColor;
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.fillRect(x + 1, y + 1, size, size);
        });

        ctx.restore();
    }
}
