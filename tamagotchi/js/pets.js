// Pet System - Behaviors, States, and Interactions

class Pet {
    constructor(type, name, x, y) {
        this.type = type;
        this.name = name;
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.vx = 0;
        this.vy = 0;
        this.frame = Math.random() * 100;
        this.state = 'idle';
        this.stateTimer = 0;
        this.direction = 1; // 1 = right, -1 = left
        this.happiness = 100;
        this.energy = 100;
        this.level = 1;
        this.xp = 0;
        this.xpToNext = 100;
        this.color = 'red';
        this.accessory = 'none';
        this.isWorking = false;
        this.workProgress = 0;
        this.lastPetTime = 0;
        this.affection = 0;
        
        // Personality traits affect behavior
        this.personality = {
            wanderFrequency: 0.3 + Math.random() * 0.4,
            speed: 0.5 + Math.random() * 0.5,
            playfulness: 0.3 + Math.random() * 0.4
        };
    }

    update(deltaTime, bounds) {
        this.frame += deltaTime * 60 / 1000;
        this.stateTimer -= deltaTime;
        
        // State machine
        switch (this.state) {
            case 'idle':
                this.updateIdle();
                break;
            case 'wander':
                this.updateWander(bounds);
                break;
            case 'happy':
                this.updateHappy();
                break;
            case 'working':
                this.updateWorking(deltaTime);
                break;
            case 'eating':
                this.updateEating();
                break;
            case 'playing':
                this.updatePlaying();
                break;
            case 'tired':
                this.updateTired();
                break;
        }
        
        // Move towards target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 2) {
            const speed = this.personality.speed * 2;
            this.vx = (dx / dist) * speed;
            this.vy = (dy / dist) * speed;
            this.direction = dx > 0 ? 1 : -1;
        } else {
            this.vx *= 0.9;
            this.vy *= 0.9;
        }
        
        this.x += this.vx;
        this.y += this.vy;
        
        // Keep in bounds
        this.x = Math.max(50, Math.min(bounds.width - 50, this.x));
        this.y = Math.max(bounds.minY, Math.min(bounds.maxY, this.y));
        
        // Natural stat decay
        if (this.happiness > 0) this.happiness -= 0.001 * deltaTime;
        if (!this.isWorking && this.energy < 100) this.energy += 0.005 * deltaTime;
        
        // Clamp stats
        this.happiness = Math.max(0, Math.min(100, this.happiness));
        this.energy = Math.max(0, Math.min(100, this.energy));
    }

    updateIdle() {
        if (this.stateTimer <= 0) {
            // Decide next action
            if (Math.random() < this.personality.wanderFrequency) {
                this.setState('wander');
            } else {
                this.stateTimer = 2000 + Math.random() * 3000;
            }
        }
    }

    updateWander(bounds) {
        if (this.stateTimer <= 0) {
            // Pick new random target
            this.targetX = 100 + Math.random() * (bounds.width - 200);
            this.targetY = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
            this.stateTimer = 3000 + Math.random() * 4000;
            
            // Chance to go back to idle
            if (Math.random() < 0.3) {
                this.setState('idle');
            }
        }
    }

    updateHappy() {
        if (this.stateTimer <= 0) {
            this.setState('idle');
        }
    }

    updateWorking(deltaTime) {
        this.workProgress += deltaTime / 100;
        this.energy -= 0.01 * deltaTime;
        
        if (this.workProgress >= 100 || this.energy <= 0) {
            this.finishWork();
        }
    }

    updateEating() {
        if (this.stateTimer <= 0) {
            this.happiness += 15;
            this.energy += 10;
            this.setState('happy');
        }
    }

    updatePlaying() {
        if (this.stateTimer <= 0) {
            this.happiness += 20;
            this.addXP(10);
            this.setState('happy');
        }
    }

    updateTired() {
        if (this.stateTimer <= 0 && this.energy > 30) {
            this.setState('idle');
        }
    }

    setState(state, duration = null) {
        this.state = state;
        this.stateTimer = duration || this.getDefaultDuration(state);
    }

    getDefaultDuration(state) {
        const durations = {
            idle: 2000,
            wander: 5000,
            happy: 1500,
            working: 10000,
            eating: 2000,
            playing: 3000,
            tired: 5000
        };
        return durations[state] || 2000;
    }

    pet() {
        const now = Date.now();
        if (now - this.lastPetTime > 500) {
            this.lastPetTime = now;
            this.happiness += 5;
            this.affection += 1;
            this.setState('happy', 1000);
            this.addXP(2);
            return true;
        }
        return false;
    }

    feed() {
        if (this.state !== 'eating') {
            this.setState('eating', 2000);
            return true;
        }
        return false;
    }

    play() {
        if (this.energy >= 10) {
            this.energy -= 10;
            this.setState('playing', 3000);
            return true;
        }
        return false;
    }

    startWork() {
        if (this.energy >= 20 && !this.isWorking) {
            this.isWorking = true;
            this.workProgress = 0;
            this.setState('working');
            return true;
        }
        return false;
    }

    finishWork() {
        this.isWorking = false;
        const xpEarned = 25 + Math.floor(this.workProgress / 4);
        this.addXP(xpEarned);
        this.workProgress = 0;
        this.setState('happy');
        
        if (this.energy < 20) {
            this.setState('tired');
        }
        
        return xpEarned;
    }

    addXP(amount) {
        this.xp += amount;
        while (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.xpToNext = Math.floor(this.xpToNext * 1.5);
        this.happiness = 100;
        this.energy = 100;
        return this.level;
    }

    getXPPercent() {
        return (this.xp / this.xpToNext) * 100;
    }

    // Check if point is within pet's clickable area
    containsPoint(px, py) {
        const hitbox = 60; // Increased for easier clicking
        return px >= this.x - hitbox/2 && 
               px <= this.x + hitbox/2 && 
               py >= this.y - hitbox && 
               py <= this.y + hitbox/2;
    }

    serialize() {
        return {
            type: this.type,
            name: this.name,
            level: this.level,
            xp: this.xp,
            xpToNext: this.xpToNext,
            happiness: this.happiness,
            energy: this.energy,
            color: this.color,
            accessory: this.accessory,
            affection: this.affection
        };
    }

    deserialize(data) {
        Object.assign(this, data);
    }
}

class PetManager {
    constructor() {
        this.pets = [];
        this.mainPet = null;
    }

    createMainPet(x, y) {
        this.mainPet = new Pet('mardy', 'Mardy', x, y);
        this.pets.push(this.mainPet);
        return this.mainPet;
    }

    addHelperPet(type, name, x, y) {
        const pet = new Pet(type, name, x, y);
        this.pets.push(pet);
        return pet;
    }

    update(deltaTime, bounds) {
        for (const pet of this.pets) {
            pet.update(deltaTime, bounds);
        }
    }

    getPetAt(x, y) {
        // Check in reverse order (top pets first)
        for (let i = this.pets.length - 1; i >= 0; i--) {
            if (this.pets[i].containsPoint(x, y)) {
                return this.pets[i];
            }
        }
        return null;
    }

    save() {
        return {
            mainPet: this.mainPet?.serialize(),
            helpers: this.pets.filter(p => p !== this.mainPet).map(p => p.serialize())
        };
    }

    load(data) {
        if (data.mainPet && this.mainPet) {
            this.mainPet.deserialize(data.mainPet);
        }
    }
}

// Export
window.Pet = Pet;
window.PetManager = PetManager;
