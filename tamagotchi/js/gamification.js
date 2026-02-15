// Gamification System - Quests, Achievements, and Economy

class Achievement {
    constructor(id, title, description, icon, condition, reward) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.icon = icon;
        this.condition = condition; // Function that checks if unlocked
        this.reward = reward;
        this.unlocked = false;
        this.unlockedAt = null;
    }

    check(stats) {
        if (!this.unlocked && this.condition(stats)) {
            this.unlocked = true;
            this.unlockedAt = Date.now();
            return true;
        }
        return false;
    }
}

class Quest {
    constructor(id, title, icon, target, reward, type = 'daily') {
        this.id = id;
        this.title = title;
        this.icon = icon;
        this.target = target;
        this.current = 0;
        this.reward = reward;
        this.type = type;
        this.completed = false;
        this.claimed = false;
    }

    progress(amount = 1) {
        if (!this.completed) {
            this.current = Math.min(this.current + amount, this.target);
            if (this.current >= this.target) {
                this.completed = true;
                return true;
            }
        }
        return false;
    }

    claim() {
        if (this.completed && !this.claimed) {
            this.claimed = true;
            return this.reward;
        }
        return null;
    }

    getProgress() {
        return `${this.current}/${this.target}`;
    }

    getPercent() {
        return (this.current / this.target) * 100;
    }
}

class GamificationSystem {
    constructor() {
        this.coins = 0;
        this.totalCoinsEarned = 0;
        this.achievements = [];
        this.quests = [];
        this.stats = {
            apiCalls: 0,
            tasksCompleted: 0,
            petsInteracted: 0,
            feedCount: 0,
            playCount: 0,
            workSessions: 0,
            totalXPEarned: 0,
            daysPlayed: 1,
            maxLevel: 1,
            longestStreak: 0
        };
        this.lastQuestReset = null;
        
        this.initAchievements();
        this.initQuests();
    }

    initAchievements() {
        this.achievements = [
            new Achievement(
                'first_pet',
                'Best Friends',
                'Pet Mardy for the first time',
                '🤝',
                s => s.petsInteracted >= 1,
                { coins: 50 }
            ),
            new Achievement(
                'well_fed',
                'Well Fed',
                'Feed your pet 10 times',
                '🍤',
                s => s.feedCount >= 10,
                { coins: 100 }
            ),
            new Achievement(
                'playful',
                'Playful Spirit',
                'Play with your pet 25 times',
                '🎮',
                s => s.playCount >= 25,
                { coins: 150 }
            ),
            new Achievement(
                'hard_worker',
                'Hard Worker',
                'Complete 50 work sessions',
                '💼',
                s => s.workSessions >= 50,
                { coins: 300 }
            ),
            new Achievement(
                'api_rookie',
                'API Rookie',
                'Process 100 API calls',
                '📡',
                s => s.apiCalls >= 100,
                { coins: 100 }
            ),
            new Achievement(
                'api_pro',
                'API Professional',
                'Process 1,000 API calls',
                '🚀',
                s => s.apiCalls >= 1000,
                { coins: 500 }
            ),
            new Achievement(
                'api_master',
                'API Master',
                'Process 10,000 API calls',
                '👑',
                s => s.apiCalls >= 10000,
                { coins: 2000 }
            ),
            new Achievement(
                'level_5',
                'Rising Star',
                'Reach Level 5',
                '⭐',
                s => s.maxLevel >= 5,
                { coins: 200 }
            ),
            new Achievement(
                'level_10',
                'Seasoned Veteran',
                'Reach Level 10',
                '🌟',
                s => s.maxLevel >= 10,
                { coins: 500, unlock: 'rainbow' }
            ),
            new Achievement(
                'level_25',
                'Legendary',
                'Reach Level 25',
                '💫',
                s => s.maxLevel >= 25,
                { coins: 2000 }
            ),
            new Achievement(
                'task_starter',
                'Task Starter',
                'Complete your first task',
                '✅',
                s => s.tasksCompleted >= 1,
                { coins: 25 }
            ),
            new Achievement(
                'task_master',
                'Task Master',
                'Complete 100 tasks',
                '🏆',
                s => s.tasksCompleted >= 100,
                { coins: 500, unlock: 'halo' }
            ),
            new Achievement(
                'week_streak',
                'Week Warrior',
                'Play for 7 days in a row',
                '📅',
                s => s.longestStreak >= 7,
                { coins: 350 }
            ),
            new Achievement(
                'month_streak',
                'Monthly Champion',
                'Play for 30 days in a row',
                '🗓️',
                s => s.longestStreak >= 30,
                { coins: 1500 }
            ),
            new Achievement(
                'xp_hoarder',
                'XP Hoarder',
                'Earn 10,000 total XP',
                '📈',
                s => s.totalXPEarned >= 10000,
                { coins: 500 }
            )
        ];
    }

    initQuests() {
        this.quests = [
            new Quest('daily_pet', 'Pet Mardy 5 times', '🦞', 5, { coins: 20, xp: 25 }),
            new Quest('daily_feed', 'Feed your pets 3 times', '🍤', 3, { coins: 15, xp: 20 }),
            new Quest('daily_work', 'Complete 2 work sessions', '💼', 2, { coins: 30, xp: 40 }),
            new Quest('daily_play', 'Play with pets 3 times', '🎮', 3, { coins: 25, xp: 30 }),
            new Quest('daily_api', 'Process 50 API calls', '📡', 50, { coins: 40, xp: 50 })
        ];
        
        this.lastQuestReset = this.getTodayKey();
    }

    getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }

    checkQuestReset() {
        const today = this.getTodayKey();
        if (this.lastQuestReset !== today) {
            this.initQuests();
            this.lastQuestReset = today;
            return true;
        }
        return false;
    }

    addCoins(amount) {
        this.coins += amount;
        this.totalCoinsEarned += amount;
    }

    spendCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            return true;
        }
        return false;
    }

    updateStat(stat, amount = 1) {
        if (this.stats[stat] !== undefined) {
            this.stats[stat] += amount;
        }
    }

    setStat(stat, value) {
        if (this.stats[stat] !== undefined) {
            this.stats[stat] = value;
        }
    }

    checkAchievements() {
        const newlyUnlocked = [];
        for (const achievement of this.achievements) {
            if (achievement.check(this.stats)) {
                newlyUnlocked.push(achievement);
                this.addCoins(achievement.reward.coins || 0);
            }
        }
        return newlyUnlocked;
    }

    progressQuest(questId, amount = 1) {
        const quest = this.quests.find(q => q.id === questId);
        if (quest) {
            return quest.progress(amount);
        }
        return false;
    }

    claimQuest(questId) {
        const quest = this.quests.find(q => q.id === questId);
        if (quest) {
            const reward = quest.claim();
            if (reward) {
                this.addCoins(reward.coins || 0);
                return reward;
            }
        }
        return null;
    }

    getActiveQuests() {
        return this.quests.filter(q => !q.claimed);
    }

    getCompletedQuests() {
        return this.quests.filter(q => q.completed && !q.claimed);
    }

    getUnlockedAchievements() {
        return this.achievements.filter(a => a.unlocked);
    }

    getLockedAchievements() {
        return this.achievements.filter(a => !a.unlocked);
    }

    save() {
        return {
            coins: this.coins,
            totalCoinsEarned: this.totalCoinsEarned,
            stats: { ...this.stats },
            achievements: this.achievements.map(a => ({
                id: a.id,
                unlocked: a.unlocked,
                unlockedAt: a.unlockedAt
            })),
            quests: this.quests.map(q => ({
                id: q.id,
                current: q.current,
                completed: q.completed,
                claimed: q.claimed
            })),
            lastQuestReset: this.lastQuestReset
        };
    }

    load(data) {
        if (!data) return;
        
        this.coins = data.coins || 0;
        this.totalCoinsEarned = data.totalCoinsEarned || 0;
        this.stats = { ...this.stats, ...data.stats };
        this.lastQuestReset = data.lastQuestReset;
        
        // Restore achievement states
        if (data.achievements) {
            for (const saved of data.achievements) {
                const achievement = this.achievements.find(a => a.id === saved.id);
                if (achievement) {
                    achievement.unlocked = saved.unlocked;
                    achievement.unlockedAt = saved.unlockedAt;
                }
            }
        }
        
        // Restore quest progress
        if (data.quests) {
            for (const saved of data.quests) {
                const quest = this.quests.find(q => q.id === saved.id);
                if (quest) {
                    quest.current = saved.current;
                    quest.completed = saved.completed;
                    quest.claimed = saved.claimed;
                }
            }
        }
        
        // Check if we need to reset quests
        this.checkQuestReset();
    }
}

// Export
window.GamificationSystem = GamificationSystem;
