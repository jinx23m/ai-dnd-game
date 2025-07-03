import React, { useState, useEffect, useCallback, useRef } from 'react';
// Firebase Imports (ensure these are available in your setup)
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";


// --- GAME DATA ---
const racesData = {
    "Aasimar": { stats: { charisma: 2, wisdom: 1 } },
    "Dragonborn": { stats: { strength: 2, charisma: 1 } },
    "Dwarf": { stats: { constitution: 2, strength: 1 } },
    "Elf": { stats: { dexterity: 2, intelligence: 1 } },
    "Gnome": { stats: { intelligence: 2, dexterity: 1 } },
    "Goliath": { stats: { strength: 2, constitution: 1 } },
    "Halfling": { stats: { dexterity: 2, charisma: 1 } },
    "Half-Elf": { stats: { charisma: 2, dexterity: 1, wisdom: 1 } }, // Example of multiple bonuses
    "Half-Orc": { stats: { strength: 2, constitution: 1 } },
    "Human": { stats: { power: 1, agility: 1, intellect: 1, vitality: 1, charisma: 1, wisdom: 1 } }, // Versatile
    "Orc": { stats: { strength: 2, constitution: 1, intelligence: -1 } },
    "Tiefling": { stats: { charisma: 2, intelligence: 1 } },
    "Aarakocra": { stats: { dexterity: 2, wisdom: 1 } },
    "Astral Elf": { stats: { intelligence: 2, dexterity: 1 } },
    "Autognome": { stats: { constitution: 2, intelligence: 1 } },
    "Bugbear": { stats: { strength: 2, dexterity: 1 } },
    "Centaur": { stats: { strength: 2, wisdom: 1 } },
    "Changeling": { stats: { charisma: 2, dexterity: 1 } },
    "Deep Gnome": { stats: { intelligence: 2, dexterity: 1 } },
    "Dhampir": { stats: { dexterity: 2, constitution: 1 } },
    "Duergar": { stats: { constitution: 2, strength: 1 } },
    "Eladrin": { stats: { dexterity: 2, charisma: 1 } },
    "Fairy": { stats: { dexterity: 2, charisma: 1 } },
    "Firbolg": { stats: { wisdom: 2, strength: 1 } },
    "Genasi": { stats: { constitution: 2, intelligence: 1 } },
    "Giff": { stats: { strength: 2, constitution: 1 } },
    "Githyanki": { stats: { strength: 2, intelligence: 1 } },
    "Githzerai": { stats: { wisdom: 2, dexterity: 1 } },
    "Goblin": { stats: { dexterity: 2, constitution: 1 } },
    "Hadozee": { stats: { dexterity: 2, constitution: 1 } },
    "Harengon": { stats: { dexterity: 2, charisma: 1 } },
    "Hexblood": { stats: { charisma: 2, constitution: 1 } },
    "Hobgoblin": { stats: { constitution: 2, intelligence: 1 } },
    "Kalashtar": { stats: { wisdom: 2, charisma: 1 } },
    "Kender": { stats: { dexterity: 2, wisdom: 1 } },
    "Kenku": { stats: { dexterity: 2, wisdom: 1 } },
    "Kobold": { stats: { dexterity: 2, charisma: 1 } },
    "Leonin": { stats: { constitution: 2, strength: 1 } },
    "Lizardfolk": { stats: { constitution: 2, wisdom: 1 } },
    "Loxodon": { stats: { constitution: 2, wisdom: 1 } },
    "Minotaur": { stats: { strength: 2, constitution: 1 } },
    "Owlin": { stats: { dexterity: 2, intelligence: 1 } },
    "Plasmoid": { stats: { constitution: 2, strength: 1 } },
    "Reborn": { stats: { constitution: 2, charisma: 1 } },
    "Satyr": { stats: { charisma: 2, dexterity: 1 } },
    "Sea Elf": { stats: { dexterity: 2, constitution: 1 } },
    "Shadar-kai": { stats: { dexterity: 2, constitution: 1 } },
    "Shifter": { stats: { dexterity: 2, wisdom: 1 } },
    "Simic Hybrid": { stats: { constitution: 2, intelligence: 1 } },
    "Tabaxi": { stats: { dexterity: 2, charisma: 1 } },
    "Thri-kreen": { stats: { dexterity: 2, wisdom: 1 } },
    "Tortle": { stats: { strength: 2, wisdom: 1 } },
    "Triton": { stats: { strength: 1, constitution: 1, charisma: 1 } },
    "Vedalken": { stats: { intelligence: 2, wisdom: 1 } },
    "Verdan": { stats: { charisma: 2, constitution: 1 } },
    "Warforged": { stats: { constitution: 2, strength: 1 } },
    "Yuan-ti": { stats: { charisma: 2, intelligence: 1 } }
};

const classesData = {
    Artificer: { baseStats: { intellect: 15, vitality: 14, agility: 12, power: 10 }, skills: { active: [{ name: "Magical Tinkering", description: "Create a minor magical effect on a tiny object." }], passive: [] }, inventory: [{ name: "Light Hammer", type: "Weapon" }, { name: "Tinker's Tools", type: "Tools" }] },
    Barbarian: { baseStats: { power: 15, vitality: 14, agility: 12, intellect: 10 }, skills: { active: [{ name: "Rage", description: "Enter a rage to gain advantage on Strength checks and saves." }], passive: [] }, inventory: [{ name: "Greataxe", type: "Weapon" }] },
    Bard: { baseStats: { charisma: 15, agility: 14, intellect: 12, power: 10 }, skills: { active: [{ name: "Bardic Inspiration", description: "Inspire an ally, adding a d6 to their roll." }], passive: [] }, inventory: [{ name: "Rapier", type: "Weapon" }, { name: "Lute", type: "Instrument" }] },
    Cleric: { baseStats: { wisdom: 15, vitality: 14, power: 12, agility: 10 }, skills: { active: [{ name: "Cure Wounds", description: "Heal a creature you touch." }], passive: [] }, inventory: [{ name: "Mace", type: "Weapon" }, { name: "Shield", type: "Armor" }] },
    Druid: { baseStats: { wisdom: 15, vitality: 14, intellect: 12, agility: 10 }, skills: { active: [{ name: "Shillelagh", description: "Imbue a club or staff with nature's power." }], passive: [] }, inventory: [{ name: "Scimitar", type: "Weapon" }, { name: "Druidic Focus", type: "Focus" }] },
    Fighter: { baseStats: { power: 15, agility: 14, vitality: 12, intellect: 10 }, skills: { active: [{ name: "Second Wind", description: "Regain a small amount of hit points as a bonus action." }], passive: [] }, inventory: [{ name: "Longsword", type: "Weapon" }, { name: "Shield", type: "Armor" }] },
    Monk: { baseStats: { agility: 15, wisdom: 14, vitality: 12, power: 10 }, skills: { active: [{ name: "Flurry of Blows", description: "Make two unarmed strikes as a bonus action." }], passive: [] }, inventory: [{ name: "Shortsword", type: "Weapon" }] },
    Paladin: { baseStats: { power: 15, charisma: 14, vitality: 12, wisdom: 10 }, skills: { active: [{ name: "Divine Smite", description: "Expend a spell slot to deal extra radiant damage on a melee attack." }], passive: [] }, inventory: [{ name: "Warhammer", type: "Weapon" }, { name: "Holy Symbol", type: "Focus" }] },
    Ranger: { baseStats: { agility: 15, wisdom: 14, power: 12, vitality: 10 }, skills: { active: [{ name: "Hunter's Mark", description: "Mark a creature to deal extra damage to it." }], passive: [] }, inventory: [{ name: "Longbow", type: "Weapon" }, { name: "Shortsword", type: "Weapon" }] },
    Rogue: { baseStats: { agility: 15, charisma: 14, intellect: 12, power: 10 }, skills: { active: [{ name: "Sneak Attack", description: "Deal extra damage to a creature you have advantage against." }], passive: [] }, inventory: [{ name: "Dagger", type: "Weapon" }, { name: "Thieves' Tools", type: "Tools" }] },
    Sorcerer: { baseStats: { charisma: 15, vitality: 14, intellect: 12, agility: 10 }, skills: { active: [{ name: "Magic Missile", description: "Fire three magical darts that automatically hit." }], passive: [] }, inventory: [{ name: "Dagger", type: "Weapon" }, { name: "Arcane Focus", type: "Focus" }] },
    Warlock: { baseStats: { charisma: 15, vitality: 14, intellect: 12, power: 10 }, skills: { active: [{ name: "Eldritch Blast", description: "A beam of crackling energy streaks toward a creature." }], passive: [] }, inventory: [{ name: "Light Crossbow", type: "Weapon" }, { name: "Pact Boon", type: "Focus" }] },
    Wizard: { baseStats: { intellect: 15, vitality: 14, wisdom: 12, agility: 10 }, skills: { active: [{ name: "Fire Bolt", description: "Hurl a mote of fire." }], passive: [] }, inventory: [{ name: "Quarterstaff", type: "Weapon" }, { name: "Spellbook", type: "Focus" }] },
};

const translations = {
    en: {
        createYourHero: "Create Your Hero",
        characterName: "Character Name",
        namePlaceholder: "E.g., Eldrin",
        class: "Class",
        race: "Race",
        warrior: "Warrior",
        mage: "Mage",
        rogue: "Rogue",
        cleric: "Cleric",
        // Races
        Aasimar: "Aasimar", Dragonborn: "Dragonborn", Dwarf: "Dwarf", Elf: "Elf", Gnome: "Gnome", Goliath: "Goliath", Halfling: "Halfling", "Half-Elf": "Half-Elf", "Half-Orc": "Half-Orc", Human: "Human", Orc: "Orc", Tiefling: "Tiefling", Aarakocra: "Aarakocra", "Astral Elf": "Astral Elf", Autognome: "Autognome", Bugbear: "Bugbear", Centaur: "Centaur", Changeling: "Changeling", "Deep Gnome": "Deep Gnome", Dhampir: "Dhampir", Duergar: "Duergar", Eladrin: "Eladrin", Fairy: "Fairy", Firbolg: "Firbolg", Genasi: "Genasi", Giff: "Giff", Githyanki: "Githyanki", Githzerai: "Githzerai", Goblin: "Goblin", Hadozee: "Hadozee", Harengon: "Harengon", Hexblood: "Hexblood", Hobgoblin: "Hobgoblin", Kalashtar: "Kalashtar", Kender: "Kender", Kenku: "Kenku", Kobold: "Kobold", Leonin: "Leonin", Lizardfolk: "Lizardfolk", Loxodon: "Loxodon", Minotaur: "Minotaur", Owlin: "Owlin", Plasmoid: "Plasmoid", Reborn: "Reborn", Satyr: "Satyr", "Sea Elf": "Sea Elf", "Shadar-kai": "Shadar-kai", Shifter: "Shifter", "Simic Hybrid": "Simic Hybrid", Tabaxi: "Tabaxi", "Thri-kreen": "Thri-kreen", Tortle: "Tortle", Triton: "Triton", Vedalken: "Vedalken", Verdan: "Verdan", Warforged: "Warforged", "Yuan-ti": "Yuan-ti",
        // Classes
        Artificer: "Artificer", Barbarian: "Barbarian", Bard: "Bard", Druid: "Druid", Fighter: "Fighter", Monk: "Monk", Paladin: "Paladin", Ranger: "Ranger", Sorcerer: "Sorcerer", Warlock: "Warlock", Wizard: "Wizard",
        // End Races & Classes
        beginAdventure: "Begin Adventure",
        characterSheet: "Character Sheet",
        map: "Map",
        worldMap: "World Map",
        areaMap: "Area Map",
        generateAreaMap: "Generate Area Map",
        stats: "Stats",
        power: "Power",
        agility: "Agility",
        intellect: "Intellect",
        vitality: "Vitality",
        masteries: "Masteries",
        skills: "Skills",
        active: "Active",
        passive: "Passive",
        inventory: "Inventory",
        bestiary: "Bestiary",
        noItems: "Inventory is empty.",
        noCreatures: "No creatures encountered yet.",
        whatToDo: "What do you do?",
        act: "Act",
        getSuggestion: "✨ Suggest",
        dmIsWeaving: "The Dungeon Master is weaving the threads of fate...",
        actionPrevented: "A mysterious force prevents your action. Please try something else.",
        suggestionError: "Could not get suggestions at this time.",
        thinkingOfSuggestions: "Thinking of suggestions...",
        worldLore: "The Lore of the World",
        generatingLore: "Generating the history and sights of a forgotten world...",
        continueToAdventure: "Continue to the Adventure",
        chooseLanguage: "Choose Your Language",
        mainMenu: "Main Menu",
        newGame: "New Game",
        playAsBeast: "Play as a Beast",
        generatingBeast: "Conjuring a creature from the abyss...",
        evolution: "Evolution",
        chooseEvolution: "Choose Your Evolution Path",
        loadGame: "Load Game",
        saveGame: "Save Game",
        gameSaved: "Game Saved!",
        gameLoaded: "Game Loaded!",
        noSave: "No saved game found.",
        loading: "Loading...",
        levelUp: "Level Up!",
        newSkill: "New Skill Acquired:",
        talkTo: "Talk to",
        close: "Close",
        send: "Send",
        visualize: "✨ Visualize",
        visualizing: "Visualizing...",
        gameOver: "Game Over",
        adventureEnded: "Your adventure has come to an end.",
        startNewLegend: "Start a New Legend",
    },
    he: {
        createYourHero: "צרו את הגיבור שלכם",
        characterName: "שם הדמות",
        namePlaceholder: "לדוגמה, אלדרין",
        class: "מקצוע",
        race: "גזע",
        warrior: "לוחם",
        mage: "קוסם",
        rogue: "נוכל",
        cleric: "כהן",
        Aasimar: "אסימאר", Dragonborn: "בן-דרקון", Dwarf: "גמד", Elf: "אלף", Gnome: "גנום", Goliath: "גוליית", Halfling: "זוטון", "Half-Elf": "חצי-אלף", "Half-Orc": "חצי-אורק", Human: "אנושי", Orc: "אורק", Tiefling: "טיפלינג", Aarakocra: "אאראקוקרה", "Astral Elf": "אלף אסטרלי", Autognome: "אוטוגנום", Bugbear: "באגבר", Centaur: "קנטאור", Changeling: "צ'יינג'לינג", "Deep Gnome": "גנום מעמקים", Dhampir: "דאמפיר", Duergar: "דוארגאר", Eladrin: "אלדרין", Fairy: "פיה", Firbolg: "פירבולג", Genasi: "ג'נאסי", Giff: "גיף", Githyanki: "גית'יאנקי", Githzerai: "גית'זראי", Goblin: "גובלין", Hadozee: "האדוזי", Harengon: "הארנגון", Hexblood: "הקסבלאד", Hobgoblin: "הובגובלין", Kalashtar: "קאלאשתר", Kender: "קנדר", Kenku: "קנקו", Kobold: "קובולד", Leonin: "לאונין", Lizardfolk: "לטאני", Loxodon: "לוקסודון", Minotaur: "מינוטאור", Owlin: "ינשופאי", Plasmoid: "פלסמואיד", Reborn: "ריבורן", Satyr: "סאטיר", "Sea Elf": "אלף ים", "Shadar-kai": "שאדאר-קאי", Shifter: "שיפטר", "Simic Hybrid": "היבריד סימיק", Tabaxi: "טאבאקסי", "Thri-kreen": "ת'רי-קרין", Tortle: "טורטל", Triton: "טריטון", Vedalken: "ודאלקן", Verdan: "ורדאן", Warforged: "וורפורג'ד", "Yuan-ti": "יואן-טי",
        Artificer: "אומן", Barbarian: "ברברי", Bard: "פייטן", Druid: "דרואיד", Fighter: "לוחם", Monk: "נזיר", Paladin: "פלאדין", Ranger: "סייר", Sorcerer: "מכשף", Warlock: "מכשף", Wizard: "אשף",
        beginAdventure: "התחילו בהרפתקה",
        characterSheet: "דף דמות",
        map: "מפה",
        worldMap: "מפת עולם",
        areaMap: "מפת אזור",
        generateAreaMap: "צור מפת אזור",
        stats: "נתונים",
        power: "כוח",
        agility: "זריזות",
        intellect: "אינטלקט",
        vitality: "חיוניות",
        masteries: "התמחויות",
        skills: "מיומנויות",
        active: "אקטיביות",
        passive: "פאסיביות",
        inventory: "ציוד",
        bestiary: "ספר מפלצות",
        noItems: "הציוד ריק.",
        noCreatures: "עדיין לא נתקלתם ביצורים.",
        whatToDo: "מה תעשו?",
        act: "בצעו",
        getSuggestion: "✨ הצע",
        dmIsWeaving: "שליט המבוך טווה את חוטי הגורל...",
        actionPrevented: "כוח מסתורי מונע את פעולתכם. אנא נסו משהו אחר.",
        suggestionError: "לא ניתן היה לקבל הצעות כרגע.",
        thinkingOfSuggestions: "חושב על הצעות...",
        worldLore: "סיפורו של העולם",
        generatingLore: "יוצר את ההיסטוריה והמראות של עולם נשכח...",
        continueToAdventure: "המשך להרפתקה",
        chooseLanguage: "בחרו שפה",
        mainMenu: "Main Menu",
        newGame: "משחק חדש",
        playAsBeast: "שחק כמפלצת",
        generatingBeast: "מזמן יצור מהתהום...",
        evolution: "התפתחות",
        chooseEvolution: "בחר נתיב התפתחות",
        loadGame: "טען משחק",
        saveGame: "שמור משחק",
        gameSaved: "המשחק נשמר!",
        gameLoaded: "המשחק נטען!",
        noSave: "לא נמצא משחק שמור.",
        loading: "טוען...",
        levelUp: "עליית רמה!",
        newSkill: "מיומנות חדשה נרכשה:",
        talkTo: "שוחח עם",
        close: "סגור",
        send: "שלח",
        visualize: "✨ הצג תמונה",
        visualizing: "יוצר תמונה...",
        gameOver: "המשחק נגמר",
        adventureEnded: "ההרפתקה שלכם הגיעה לסיומה.",
        startNewLegend: "התחילו אגדה חדשה",
    },
    ru: {
        createYourHero: "Создайте своего героя",
        characterName: "Имя персонажа",
        namePlaceholder: "Например, Элдрин",
        class: "Класс",
        race: "Раса",
        warrior: "Воин",
        mage: "Маг",
        rogue: "Разбойник",
        cleric: "Клирик",
        Aasimar: "Аасимар", Dragonborn: "Драконорожденный", Dwarf: "Дварф", Elf: "Эльф", Gnome: "Гном", Goliath: "Голиаф", Halfling: "Халфлинг", "Half-Elf": "Полуэльф", "Half-Orc": "Полуорк", Human: "Человек", Orc: "Орк", Tiefling: "Тифлинг", Aarakocra: "Ааракокра", "Astral Elf": "Астральный эльф", Autognome: "Автогном", Bugbear: "Багбер", Centaur: "Кентавр", Changeling: "Перевёртыш", "Deep Gnome": "Глубинный гном", Dhampir: "Дампир", Duergar: "Дуэргар", Eladrin: "Эладрин", Fairy: "Фея", Firbolg: "Фирболг", Genasi: "Генаси", Giff: "Гифф", Githyanki: "Гитьянки", Githzerai: "Гитзерай", Goblin: "Гоблин", Hadozee: "Хадози", Harengon: "Харенгон", Hexblood: "Хексблад", Hobgoblin: "Хобгоблин", Kalashtar: "Калаштар", Kender: "Кендер", Kenku: "Кенку", Kobold: "Кобольд", Leonin: "Леонин", Lizardfolk: "Ящеролюд", Loxodon: "Локсодон", Minotaur: "Минотавр", Owlin: "Совочел", Plasmoid: "Плазмоид", Reborn: "Возрожденный", Satyr: "Сатир", "Sea Elf": "Морской эльф", "Shadar-kai": "Шадар-кай", Shifter: "Перевёртыш", "Simic Hybrid": "Гибрид Симик", Tabaxi: "Табакси", "Thri-kreen": "Три-крин", Tortle: "Тортл", Triton: "Тритон", Vedalken: "Ведалкен", Verdan: "Вердан", Warforged: "Кованый", "Yuan-ti": "Юань-ти",
        Artificer: "Изобретатель", Barbarian: "Варвар", Bard: "Бард", Druid: "Друид", Fighter: "Воин", Monk: "Монах", Paladin: "Паладин", Ranger: "Следопыт", Sorcerer: "Чародей", Warlock: "Колдун", Wizard: "Волшебник",
        beginAdventure: "Начать приключение",
        characterSheet: "Лист персонажа",
        map: "Карта",
        worldMap: "Карта мира",
        areaMap: "Карта области",
        generateAreaMap: "Создать карту области",
        stats: "Характеристики",
        power: "Сила",
        agility: "Ловкость",
        intellect: "Интеллект",
        vitality: "Живучесть",
        masteries: "Мастерство",
        skills: "Навыки",
        active: "Активные",
        passive: "Пассивные",
        inventory: "Инвентарь",
        bestiary: "Бестиарий",
        noItems: "Инвентарь пуст.",
        noCreatures: "Существ пока не встречали.",
        whatToDo: "Что вы делаете?",
        act: "Действовать",
        getSuggestion: "✨ Предложить",
        dmIsWeaving: "Мастер подземелий плетет нити судьбы...",
        actionPrevented: "Таинственная сила мешает вашему действию. Пожалуйста, попробуйте что-то другое.",
        suggestionError: "В данный момент невозможно получить подсказки.",
        thinkingOfSuggestions: "Обдумывание предложений...",
        worldLore: "История мира",
        generatingLore: "Создание истории и видов забытого мира...",
        continueToAdventure: "Продолжить приключение",
        chooseLanguage: "Выберите ваш язык",
        mainMenu: "Главное меню",
        newGame: "Новая игра",
        playAsBeast: "Играть за монстра",
        generatingBeast: "Создание существа из бездны...",
        evolution: "Эволюция",
        chooseEvolution: "Выберите путь эволюции",
        loadGame: "Загрузить игру",
        saveGame: "Сохранить игру",
        gameSaved: "Игра сохранена!",
        gameLoaded: "Игра загружена!",
        noSave: "Сохраненная игра не найдена.",
        loading: "Загрузка...",
        levelUp: "Уровень повышен!",
        newSkill: "Получен новый навык:",
        talkTo: "Поговорить с",
        close: "Закрыть",
        send: "Отправить",
        visualize: "✨ Визуализировать",
        visualizing: "Визуализация...",
        gameOver: "Игра окончена",
        adventureEnded: "Ваше приключение подошло к концу.",
        startNewLegend: "Начать новую легенду",
    },
};

const useTranslation = (lang) => (key) => translations[lang][key] || key;

const apiHelper = {
    generate: async (prompt, lang = 'en', jsonSchema = null) => {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, lang, jsonSchema, type: 'text' }),
        });
        if (!response.ok) {
            const error = await response.json();
            console.error("API Helper Error:", error);
            throw new Error(`API request failed: ${error.error}`);
        }
        return response.json();
    },
    generateImage: async (prompt) => {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, type: 'image' }),
        });
        if (!response.ok) {
            const error = await response.json();
            console.error("API Helper Error:", error);
            throw new Error(`API request failed: ${error.error}`);
        }
        const { imageUrl } = await response.json();
        return imageUrl;
    }
};

const firebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG 
    ? JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG) 
    : {};
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (e) {
    console.error("Firebase initialization failed:", e);
}
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
    const [gameState, setGameState] = useState('language_selection');
    const [language, setLanguage] = useState('en');
    const [character, setCharacter] = useState(null);
    const [story, setStory] = useState([]);
    const [worldLore, setWorldLore] = useState({ text: '', images: [], worldMap: '' });
    const [bestiary, setBestiary] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState('');
    const [evolutionOptions, setEvolutionOptions] = useState([]);
    const t = useTranslation(language);

    useEffect(() => {
        onAuthStateChanged(auth, user => {
            if (user) {
                setUserId(user.uid);
            } else {
                signInAnonymously(auth).catch(error => console.error("Anon sign-in failed:", error));
            }
        });
    }, []);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const saveGame = async () => {
        if (!userId || !character) return;
        setIsSaving(true);
        const appId = 'dnd-ai-game-v1';
        
        const saveState = {
            language,
            character: JSON.stringify(character),
            story: JSON.stringify(story),
            worldLore: JSON.stringify({ ...worldLore, images: [], worldMap: '' }), 
            bestiary: JSON.stringify(bestiary.map(b => ({...b, image: ''}))),
            gameState: 'playing'
        };

        try {
            const saveDocRef = doc(db, 'artifacts', appId, 'users', userId, 'saves', 'dnd-save-slot-1');
            await setDoc(saveDocRef, { data: JSON.stringify(saveState) }); 
            setNotification(t('gameSaved'));
        } catch (error) {
            console.error("Error saving game:", error);
            setNotification('Error saving game.');
        } finally {
            setIsSaving(false);
        }
    };

    const loadGame = async () => {
        if (!userId) return;
        setIsSaving(true);
        const appId = 'dnd-ai-game-v1';
        try {
            const saveDocRef = doc(db, 'artifacts', appId, 'users', userId, 'saves', 'dnd-save-slot-1');
            const docSnap = await getDoc(saveDocRef);

            if (docSnap.exists()) {
                const loadedData = JSON.parse(docSnap.data().data);
                setLanguage(loadedData.language || 'en');
                setCharacter(loadedData.character || null);
                setStory(loadedData.story || []);
                setWorldLore(loadedData.worldLore || { text: '', images: [], worldMap: '' });
                setBestiary(loadedData.bestiary || []);
                setGameState(loadedData.gameState || 'main_menu');
                setNotification(t('gameLoaded'));
            } else {
                setNotification(t('noSave'));
            }
        } catch (error) {
            console.error("Error loading game:", error);
            setNotification('Error loading game.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCharacterCreated = (char) => {
        setCharacter(char);
        setWorldLore({ text: '', images: [], worldMap: '' });
        setStory([]);
        setBestiary([]);
        setGameState('world_intro');
    };
    
    const resetGame = () => {
        setGameState('language_selection');
        setCharacter(null);
        setStory([]);
        setWorldLore({ text: '', images: [], worldMap: '' });
        setBestiary([]);
    };

    const componentMap = {
        language_selection: <LanguageSelectionScreen setLanguage={setLanguage} setGameState={setGameState} />,
        main_menu: <MainMenuScreen t={t} setGameState={setGameState} loadGame={loadGame} isLoading={isSaving} />,
        character_creation: <CharacterCreationScreen lang={language} t={t} onCharacterCreated={handleCharacterCreated} />,
        beast_generation: <BeastGenerationScreen lang={language} t={t} onCharacterCreated={handleCharacterCreated} />,
        world_intro: <WorldIntroScreen lang={language} t={t} character={character} worldLore={worldLore} setWorldLore={setWorldLore} setGameState={setGameState} />,
        playing: <GameScreen lang={language} t={t} character={character} setCharacter={setCharacter} story={story} setStory={setStory} bestiary={bestiary} setBestiary={setBestiary} saveGame={saveGame} isSaving={isSaving} setNotification={setNotification} worldMapUrl={worldLore.worldMap} setGameState={setGameState} setEvolutionOptions={setEvolutionOptions} />,
        evolution_pending: <EvolutionScreen lang={language} t={t} options={evolutionOptions} currentCharacter={character} setCharacter={setCharacter} setGameState={setGameState} />,
        game_over: <GameOverScreen t={t} onRestart={resetGame} />,
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-serif" dir={language === 'he' ? 'rtl' : 'ltr'}>
           {notification && <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg z-50">{notification}</div>}
           {componentMap[gameState] || <MainMenuScreen t={t} setGameState={setGameState} loadGame={loadGame} isLoading={isSaving} />}
        </div>
    );
}

function LanguageSelectionScreen({ setLanguage, setGameState }) {
    const selectLang = (lang) => {
        setLanguage(lang);
        setGameState('main_menu');
    };
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-red-500 mb-8 text-center">{useTranslation('en')('chooseLanguage')}</h1>
            <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => selectLang('en')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg sm:text-xl transition">English</button>
                <button onClick={() => selectLang('he')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg sm:text-xl transition">עברית</button>
                <button onClick={() => selectLang('ru')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg sm:text-xl transition">Русский</button>
            </div>
        </div>
    );
}

function MainMenuScreen({ t, setGameState, loadGame, isLoading }) {
    const [logoUrl, setLogoUrl] = useState('');
    const [isLogoLoading, setIsLogoLoading] = useState(true);

    useEffect(() => {
        setIsLogoLoading(true);
        apiHelper.generateImage("an epic logo for a fantasy RPG game called 'AI Dungeons', with a stylized dragon and a glowing die, digital art")
            .then(url => {
                if(url && !url.includes('placehold.co')) {
                    setLogoUrl(url);
                }
            })
            .finally(() => {
                setIsLogoLoading(false);
            });
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-64 h-64 md:w-80 md:h-80 mb-8 flex items-center justify-center">
                {isLogoLoading ? (
                    <div className="w-24 h-24 border-4 border-dashed rounded-full animate-spin border-red-500"></div>
                ) : logoUrl ? (
                    <img src={logoUrl} alt="AI Dungeons Logo" className="w-full h-full object-contain" />
                ) : (
                    <h1 className="text-4xl sm:text-5xl font-bold text-red-500 text-center">AI Dungeons</h1>
                )}
            </div>
            <div className="flex flex-col gap-4">
                <button onClick={() => setGameState('character_creation')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-12 rounded-lg text-lg sm:text-xl transition">{t('newGame')}</button>
                <button onClick={() => setGameState('beast_generation')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-12 rounded-lg text-lg sm:text-xl transition">{t('playAsBeast')}</button>
                <button onClick={loadGame} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-12 rounded-lg text-lg sm:text-xl transition disabled:bg-gray-500">{isLoading ? t('loading') : t('loadGame')}</button>
            </div>
        </div>
    );
}


function WorldIntroScreen({ lang, t, character, worldLore, setWorldLore, setGameState }) {
    useEffect(() => {
        const generateLore = async () => {
            if (!character) return;
            try {
                const schema = {type: "OBJECT", properties: { lore: {type: "STRING"}, prompts: {type: "ARRAY", items: {type: "STRING"} } }};
                const prompt = `For a new adventurer named ${character.name} the ${character.race} ${character.class}, generate a deep, epic high fantasy introduction to a world of magic and legends. Describe the world's creation, an ancient tale of heroes, and the current state of the realm, hinting at a great destiny. Keep the tone wondrous and adventurous. Also, provide two distinct, epic fantasy prompts for an image generator that match the lore. The prompts must be in English.`;
                const result = await apiHelper.generate(prompt, lang, schema);
                
                setWorldLore(prev => ({ ...prev, text: result.lore }));

                const imagePromises = (result.prompts || []).slice(0, 2).map(p => apiHelper.generateImage(p));
                const worldMapPromise = apiHelper.generateImage("A detailed fantasy world map, parchment style, with continents, oceans, and mountains.");
                
                const [img1, img2, mapUrl] = await Promise.all([...imagePromises, worldMapPromise]);
                
                setWorldLore({ text: result.lore, images: [img1, img2].filter(Boolean), worldMap: mapUrl });
            } catch (error) {
                console.error("Failed to generate world lore:", error);
                setWorldLore({ text: 'Error generating world. Please try again or start a new game.', images: [], worldMap: '' });
            }
        };
        if (!worldLore.text && character) {
             generateLore();
        }
    }, [lang, character, setWorldLore]);

    if (!worldLore.text) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <p className="text-xl italic text-gray-400">{t('generatingLore')}</p>
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-red-500 mt-4"></div>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto p-4 md:p-8 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-red-500">{t('worldLore')}</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{worldLore.text}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-6">
                    {worldLore.images.map((imgSrc, i) => (
                        <img key={i} src={imgSrc} alt={`Lore image ${i+1}`} className="rounded-lg w-full h-auto object-cover aspect-video bg-gray-700"/>
                    ))}
                </div>
            </div>
            <div className="text-center mt-8">
                 <button onClick={() => setGameState('playing')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg text-lg transition">
                    {t('continueToAdventure')}
                </button>
            </div>
        </div>
    );
}

function CharacterCreationScreen({ lang, t, onCharacterCreated }) {
    const [name, setName] = useState('');
    const [characterClass, setCharacterClass] = useState('Fighter');
    const [race, setRace] = useState('Human');
    const [isLoading, setIsLoading] = useState(false);

    const races = Object.keys(racesData);
    const classes = Object.keys(classesData);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setIsLoading(true);

        const classInfo = classesData[characterClass];
        const raceInfo = racesData[race];
        
        let finalStats = { ...classInfo.baseStats };
        for (const [stat, bonus] of Object.entries(raceInfo.stats)) {
            finalStats[stat] = (finalStats[stat] || 10) + bonus;
        }

        const portraitPrompt = `A detailed fantasy portrait of a ${race} ${characterClass} named ${name}.`;
        const portraitUrl = await apiHelper.generateImage(portraitPrompt);

        const newCharacter = { 
            name, 
            class: characterClass, 
            race, 
            portraitUrl, 
            stats: finalStats,
            skills: classInfo.skills,
            inventory: classInfo.inventory,
            masteries: [{ name: "General", level: 1, xp: 0 }]
        };
        
        onCharacterCreated(newCharacter);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8">
                <h1 className="text-4xl font-bold text-center mb-6 text-red-500">{t('createYourHero')}</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">{t('characterName')}</label>
                        <input type="text" name="name" value={name} onChange={e => setName(e.target.value)} className={`shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline border-gray-600 ${lang === 'he' ? 'text-right' : ''}`} placeholder={t('namePlaceholder')} required disabled={isLoading}/>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="race" className="block text-gray-300 text-sm font-bold mb-2">{t('race')}</label>
                        <select name="race" value={race} onChange={e => setRace(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline border-gray-600" disabled={isLoading}>
                           {races.map(r => <option key={r} value={r}>{t(r)}</option>)}
                        </select>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="class" className="block text-gray-300 text-sm font-bold mb-2">{t('class')}</label>
                        <select name="class" value={characterClass} onChange={e => setCharacterClass(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline border-gray-600" disabled={isLoading}>
                           {classes.map(c => <option key={c} value={c}>{t(c)}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center justify-center">
                        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-500" disabled={isLoading}>
                           {isLoading ? t('loading') : t('beginAdventure')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function BeastGenerationScreen({ lang, t, onCharacterCreated }) {
    useEffect(() => {
        const generateBeast = async () => {
            const schema = {
                type: "OBJECT",
                properties: {
                    name: { type: "STRING" },
                    class: { type: "STRING" }, // 'class' here means species
                    stats: { type: "OBJECT", properties: { power: { type: "NUMBER" }, agility: { type: "NUMBER" }, intellect: { type: "NUMBER" }, vitality: { type: "NUMBER" } } },
                    skills: { type: "OBJECT", properties: { active: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, description: { type: "STRING" } } } }, passive: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, description: { type: "STRING" } } } } } },
                    inventory: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, type: { type: "STRING" }, description: { type: "STRING" } } } },
                }
            };
            const prompt = `Invent a completely unique and imaginative fantasy monster that could be a player character. Avoid common monster types like 'Glimmer', 'Slime', or simple elementals. Give it a creative name, species (as 'class'), balanced stats (totaling around 30), one active and one passive skill representing its natural abilities, and its natural weapons (claws, fangs, etc.) as its inventory.`;
            try {
                const beastCharacter = await apiHelper.generate(prompt, lang, schema);
                const portraitPrompt = `A detailed fantasy portrait of a ${beastCharacter.class} named ${beastCharacter.name}.`;
                const portraitUrl = await apiHelper.generateImage(portraitPrompt);
                
                onCharacterCreated({ ...beastCharacter, race: beastCharacter.class, portraitUrl, masteries: [] });
            } catch (e) {
                alert("Failed to generate a beast. Please try again.");
                window.location.reload(); // A simple way to go back to the main menu
            }
        };
        generateBeast();
    }, [lang, onCharacterCreated]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <p className="text-xl italic text-gray-400">{t('generatingBeast')}</p>
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500 mt-4"></div>
        </div>
    );
}


function GameScreen({ lang, t, character, setCharacter, story, setStory, bestiary, setBestiary, saveGame, isSaving, setNotification, worldMapUrl, setGameState, setEvolutionOptions }) {
    const [isLoading, setIsLoading] = useState(false);
    const [action, setAction] = useState('');
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [activeNPC, setActiveNPC] = useState(null);
    const [currentNPCs, setCurrentNPCs] = useState([]);
    
    const handlePlayerAction = useCallback(async (playerAction) => {
        if(!playerAction.trim()) return;
        setIsLoading(true);
        setStory(prev => [...prev, {type: 'player', text: playerAction}]);
        setAction('');
        
        const history = [...story, {type: 'player', text: playerAction}].slice(-10).map(s => `${s.type === 'dm' ? 'DM' : character.name}: ${s.text}`).join('\n');
        const schema = {type: "OBJECT", properties: { narrative: {type: "STRING"}, npcs_present: {type: "ARRAY", items: {type: "STRING"}}, xp_gained: {type: "NUMBER"} }};
        const prompt = `You are a Dungeon Master. The player character is a ${character.race} ${character.class}. Continue the adventure. History:\n${history}\n. Respond with narrative, any NPCs present, and XP gained (0-10).`;
        
        try {
            const result = await apiHelper.generate(prompt, lang, schema);
            setStory(prev => [...prev, { type: 'dm', text: result.narrative }]);
            setCurrentNPCs(result.npcs_present || []);

            if (result.xp_gained > 0) {
                 const newMasteries = character.masteries.map(m => ({...m, xp: m.xp + result.xp_gained}));
                 let leveledUp = false;
                 for(let m of newMasteries) {
                     const xpToLevel = m.level * 100;
                     if (m.xp >= xpToLevel) {
                         m.level += 1;
                         m.xp -= xpToLevel;
                         leveledUp = true;
                         
                         if(character.race === character.class){ // It's a monster
                            if(m.level === 5 || m.level === 10 || m.level === 15) { // Evolution levels
                                const evoSchema = { type: "OBJECT", properties: { options: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, description: { type: "STRING" } } } } } };
                                const evoPrompt = `The player's monster, a ${character.class}, has reached a point of evolution. Generate 2-3 distinct, cooler, and more powerful evolution options. For each option, provide a new 'class' (species name) and a brief, exciting description of its new form and powers.`;
                                const evoResult = await apiHelper.generate(evoPrompt, lang, evoSchema);
                                setEvolutionOptions(evoResult.options);
                                setGameState('evolution_pending');
                                return; // Stop further processing until evolution is chosen
                            }
                         }

                         const skillSchema = {type: "OBJECT", properties: { name: {type: "STRING"}, description: {type: "STRING"}, type: {type: "STRING", enum: ["active", "passive"]} }};
                         const skillPrompt = `A character proficient in ${m.name} has reached level ${m.level}. Grant them a new skill.`;
                         const newSkill = await apiHelper.generate(skillPrompt, lang, skillSchema);
                         const newCharacterSkills = {...character.skills};
                         newCharacterSkills[newSkill.type].push(newSkill);
                         setNotification(`${t('levelUp')} ${t('newSkill')} ${newSkill.name}`);
                         setCharacter(c => ({...c, skills: newCharacterSkills}));
                     }
                 }
                 setCharacter(c => ({...c, masteries: newMasteries}));
            }

        } catch(e) {
            setStory(prev => [...prev, { type: 'dm', text: t('actionPrevented') }]);
        }
        setIsLoading(false);
    }, [story, character, lang, setStory, setCurrentNPCs, setCharacter, setNotification, t, setGameState, setEvolutionOptions]);
    
    useEffect(() => {
        if (story.length === 0 && character) {
            const initialPrompts = {
                en: "The adventure begins. Tell me where I am.",
                he: "ההרפתקה מתחילה. ספר לי היכן אני נמצא.",
                ru: "Приключение начинается. Скажи мне, где я."
            };
            handlePlayerAction(initialPrompts[lang] || initialPrompts['en']);
        }
    }, [character, story.length, handlePlayerAction, lang]);

    return (
        <div className="flex flex-col h-screen p-2 sm:p-4 gap-4">
             <header className="flex-shrink-0 bg-gray-800 rounded-lg shadow-md p-3 flex flex-col sm:flex-row justify-between items-center flex-wrap gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-red-500 text-center sm:text-left">{character?.name} - {t(character?.race)} {t(character?.class)}</h1>
                <div className="flex items-center gap-2 sm:gap-4">
                    <button onClick={() => setIsMapOpen(true)} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base">{t('map')}</button>
                    <button onClick={saveGame} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base disabled:bg-gray-500">{isSaving ? t('loading') : t('saveGame')}</button>
                    <button onClick={() => setIsSheetOpen(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base">{t('characterSheet')}</button>
                </div>
            </header>
            <main className="flex-grow bg-gray-800 rounded-lg p-2 sm:p-4 overflow-y-auto">
                 {story.map((entry, index) => (
                    <div key={index} className={`flex items-start gap-3 p-3 rounded-lg mb-3 ${entry.type === 'dm' ? 'bg-gray-700' : `bg-red-900/50 ${lang === 'he' ? 'text-left' : 'text-right'}`}`}>
                        <p className="whitespace-pre-wrap flex-grow text-sm sm:text-base">{entry.text}</p>
                    </div>
                 ))}
                 {isLoading && <p className="text-center italic text-gray-400">{t('dmIsWeaving')}</p>}
            </main>
             <div className="flex-shrink-0 flex flex-wrap gap-2 justify-center">
                {currentNPCs.map(npc => <button key={npc} onClick={() => setActiveNPC(npc)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">{t('talkTo')} {npc}</button>)}
             </div>
             <footer className="flex-shrink-0">
                 <form onSubmit={e => {e.preventDefault(); handlePlayerAction(action)}} className="flex gap-2">
                     <input type="text" value={action} onChange={e => setAction(e.target.value)} className="flex-grow bg-gray-700 text-white p-3 rounded-lg" placeholder={t('whatToDo')} />
                     <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 sm:px-6 rounded-lg">{t('act')}</button>
                 </form>
             </footer>
             {isSheetOpen && character && <CharacterSheet t={t} character={character} bestiary={bestiary} onClose={() => setIsSheetOpen(false)} />}
             {activeNPC && <NpcDialogueModal t={t} lang={lang} character={character} npcName={activeNPC} story={story} onClose={() => setActiveNPC(null)} />}
             {isMapOpen && <MapModal t={t} story={story} worldMapUrl={worldMapUrl} onClose={() => setIsMapOpen(false)} />}
        </div>
    );
}

function NpcDialogueModal({ t, lang, character, npcName, story, onClose }) {
    const [dialogue, setDialogue] = useState([]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        const newDialogue = [...dialogue, {speaker: 'player', text: message}];
        setDialogue(newDialogue);
        setMessage('');
        setIsLoading(true);

        const history = newDialogue.map(d => `${d.speaker === 'player' ? character.name : npcName}: ${d.text}`).join('\n');
        const prompt = `You are the NPC "${npcName}". The player, "${character.name}", is talking to you. Maintain your character. The main story context is: ${story.slice(-3).map(s=>s.text).join(' ')}. The conversation so far:\n${history}\n\nRespond to the player.`;
        
        try {
            const response = await apiHelper.generate(prompt, lang);
            setDialogue(d => [...d, {speaker: 'npc', text: response}]);
        } catch(e) {
            console.error(e);
            setDialogue(d => [...d, {speaker: 'npc', text: `(${t('actionPrevented')})`}]);
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg h-full max-h-[80vh] flex flex-col">
                 <header className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-purple-400">{t('talkTo')} {npcName}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                </header>
                <main className="p-4 overflow-y-auto flex-grow">
                    {dialogue.map((d, i) => (
                        <div key={i} className={`mb-2 p-2 rounded-lg ${d.speaker === 'player' ? 'bg-red-900/50 text-right' : 'bg-gray-700'}`}>
                            {d.text}
                        </div>
                    ))}
                    {isLoading && <p className="italic text-center">{t('dmIsWeaving')}</p>}
                </main>
                <footer className="p-4 border-t border-gray-700">
                     <form onSubmit={e => {e.preventDefault(); handleSend();}} className="flex gap-2">
                        <input type="text" value={message} onChange={e => setMessage(e.target.value)} className="flex-grow bg-gray-600 text-white p-2 rounded-lg" placeholder="..." />
                        <button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 rounded-lg">{t('send')}</button>
                    </form>
                </footer>
            </div>
        </div>
    );
}


function CharacterSheet({ t, character, bestiary, onClose }) {
     const [activeTab, setActiveTab] = useState('stats');
     const [isPortraitModalOpen, setIsPortraitModalOpen] = useState(false);
     const [selectedMonster, setSelectedMonster] = useState(null);

     const TabButton = ({ tabName, label }) => <button onClick={() => setActiveTab(tabName)} className={`py-2 px-4 font-bold rounded-t-lg ${activeTab === tabName ? 'bg-gray-700 text-red-400' : 'bg-gray-800 text-gray-400'}`}>{label}</button>;
    
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl h-full max-h-[90vh] flex flex-col">
                    <header className="flex justify-between items-center p-4 border-b border-gray-700">
                        <div className="flex items-center gap-4">
                            {character.portraitUrl && (
                                <button onClick={() => setIsPortraitModalOpen(true)} className="p-0 border-0 bg-transparent rounded-full">
                                    <img src={character.portraitUrl} alt="Character Portrait" className="w-16 h-16 rounded-full border-2 border-red-500 cursor-pointer hover:opacity-80 transition-opacity" />
                                </button>
                            )}
                            <h2 className="text-2xl font-bold text-red-500">{character.name}</h2>
                        </div>
                        <button onClick={onClose} className="text-3xl">&times;</button>
                    </header>
                    <nav className="flex-shrink-0 border-b border-gray-700"><TabButton tabName="stats" label={t('stats')} /><TabButton tabName="inventory" label={t('inventory')} /><TabButton tabName="bestiary" label={t('bestiary')} /></nav>
                    <main className="p-6 overflow-y-auto">{activeTab === 'stats' && <div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {character.stats && Object.entries(character.stats).map(([stat, value]) => (
                                    <div key={stat} className="bg-gray-700 p-4 rounded-lg text-center">
                                        <p className="text-sm uppercase text-gray-400">{t(stat)}</p>
                                        <p className="text-3xl font-bold text-white">{Math.round(value)}</p>
                                    </div>
                                ))}
                            </div>
                            <h3 className="text-xl font-bold text-red-400 mb-2">{t('masteries')}</h3>
                            {character.masteries?.map(m => <p key={m.name}>{m.name}: Level {m.level}</p>)}
                            <hr className="my-4 border-gray-700" />
                            <h3 className="text-xl font-bold text-red-400 mb-2">{t('active')} {t('skills')}</h3>
                            {character.skills?.active.map(s => <div key={s.name}><p className="font-bold">{s.name}</p><p className="text-sm text-gray-400">{s.description}</p></div>)}
                            <hr className="my-4 border-gray-700" />
                            <h3 className="text-xl font-bold text-red-400 mb-2">{t('passive')} {t('skills')}</h3>
                            {character.skills?.passive.map(s => <div key={s.name}><p className="font-bold">{s.name}</p><p className="text-sm text-gray-400">{s.description}</p></div>)}
                        </div>}
                        {activeTab === 'inventory' && (
                            <div>
                                {character.inventory?.length > 0 ? (
                                    character.inventory.map((item, index) => (
                                        <div key={index} className="mb-4 p-3 bg-gray-700 rounded">
                                            <p className="font-bold text-lg text-white">{item.name}</p>
                                            <p className="text-sm text-gray-400">{item.description}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">{t('noItems')}</p>
                                )}
                            </div>
                        )}
                        {activeTab === 'bestiary' && (
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {bestiary.length > 0 ? (
                                    bestiary.map((monster, index) => (
                                        <button key={index} onClick={() => setSelectedMonster(monster)} className="bg-gray-700 rounded-lg p-2 text-center hover:bg-gray-600 transition">
                                            {monster.icon ? <img src={monster.icon} alt={monster.name} className="w-24 h-24 mx-auto rounded-full mb-2 object-cover" /> : <div className="w-24 h-24 mx-auto rounded-full mb-2 bg-gray-600 flex items-center justify-center">?</div>}
                                            <p className="font-bold">{monster.name}</p>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-gray-500 col-span-full">{t('noCreatures')}</p>
                                )}
                            </div>
                        )}</main>
                </div>
            </div>
            {isPortraitModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setIsPortraitModalOpen(false)}>
                    <img src={character.portraitUrl} alt="Character Portrait" className="max-w-[90vw] max-h-[90vh] rounded-lg" />
                </div>
            )}
            {selectedMonster && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMonster(null)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                         <header className="flex justify-between items-center p-4 border-b border-gray-700">
                             <h2 className="text-2xl font-bold text-red-500">{selectedMonster.name}</h2>
                             <button onClick={() => setSelectedMonster(null)} className="text-3xl">&times;</button>
                         </header>
                         <main className="p-6">
                            <img src={selectedMonster.image} alt={selectedMonster.name} className="w-full rounded-lg mb-4" />
                            <p>{selectedMonster.description}</p>
                         </main>
                    </div>
                 </div>
            )}
        </>
    );
}

function MapModal({ t, story, worldMapUrl, onClose }) {
    const [areaMapUrl, setAreaMapUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('world');

    const generateAreaMap = async () => {
        setIsGenerating(true);
        setAreaMapUrl('');
        const context = story.slice(-3).map(s => s.text).join(' ');
        const prompt = `A top-down tactical battle map of this scene: ${context}`;
        const url = await apiHelper.generateImage(prompt);
        setAreaMapUrl(url);
        setIsGenerating(false);
    };

    const TabButton = ({ tabName, label }) => (
        <button onClick={() => setActiveTab(tabName)} className={`py-2 px-4 font-bold rounded-t-lg ${activeTab === tabName ? 'bg-gray-700 text-red-400' : 'bg-gray-800 text-gray-400'}`}>{label}</button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-yellow-400">{t('map')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </header>
                <nav className="flex-shrink-0 border-b border-gray-700">
                    <TabButton tabName="world" label={t('worldMap')} />
                    <TabButton tabName="area" label={t('areaMap')} />
                </nav>
                <main className="p-6 overflow-y-auto flex-grow flex flex-col items-center justify-center">
                    {activeTab === 'world' && (
                        worldMapUrl ? <img src={worldMapUrl} alt="World Map" className="w-full h-full object-contain" /> : <p>{t('loading')}...</p>
                    )}
                    {activeTab === 'area' && (
                        <div className="text-center">
                            <button onClick={generateAreaMap} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mb-4 disabled:bg-gray-500">{isGenerating ? t('visualizing') : t('generateAreaMap')}</button>
                            {areaMapUrl && <img src={areaMapUrl} alt="Area Map" className="w-full h-full object-contain" />}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

function EvolutionScreen({ lang, t, options, currentCharacter, setCharacter, setGameState }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleEvolve = async (choice) => {
        setIsLoading(true);
        const schema = {
            type: "OBJECT",
            properties: {
                name: { type: "STRING" },
                class: { type: "STRING" },
                stats: { type: "OBJECT", properties: { power: { type: "NUMBER" }, agility: { type: "NUMBER" }, intellect: { type: "NUMBER" }, vitality: { type: "NUMBER" } } },
                skills: { type: "OBJECT", properties: { active: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, description: { type: "STRING" } } } }, passive: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, description: { type: "STRING" } } } } } },
                inventory: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, type: { type: "STRING" }, description: { type: "STRING" } } } },
            }
        };
        const prompt = `The player's monster, a ${currentCharacter.class}, has chosen to evolve into a '${choice.name}'. Generate a new, complete character sheet for this new form. It should have the new class '${choice.name}', more powerful stats than before, a new set of active and passive skills reflecting its new form, and updated inventory (natural weapons). Keep the original name '${currentCharacter.name}'.`;
        
        try {
            const evolvedCharacter = await apiHelper.generate(prompt, lang, schema);
            
            for (const stat in evolvedCharacter.stats) {
                evolvedCharacter.stats[stat] = Math.round(evolvedCharacter.stats[stat]);
            }

            const portraitPrompt = `A detailed fantasy portrait of a ${evolvedCharacter.class} named ${evolvedCharacter.name}.`;
            const portraitUrl = await apiHelper.generateImage(portraitPrompt);
            
            setCharacter({ ...evolvedCharacter, race: evolvedCharacter.class, portraitUrl, masteries: currentCharacter.masteries });
            setGameState('playing');
        } catch (e) {
            alert("Failed to evolve. Please try again.");
            setGameState('playing'); // Return to game
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
            <h1 className="text-4xl font-bold text-purple-400 mb-8">{t('evolution')}</h1>
            <p className="text-lg mb-6">{t('chooseEvolution')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {options.map(option => (
                    <div key={option.name} className="bg-gray-800 p-6 rounded-lg border border-purple-500">
                        <h2 className="text-2xl font-bold text-purple-300">{option.name}</h2>
                        <p className="text-gray-400 mt-2 mb-4">{option.description}</p>
                        <button onClick={() => handleEvolve(option)} disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-500">
                            {isLoading ? t('loading') : `Evolve into ${option.name}`}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function GameOverScreen({ t, onRestart }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-4xl sm:text-6xl font-bold text-red-600 mb-4">{t('gameOver')}</h1>
                <p className="text-lg sm:text-xl text-gray-400 mb-8">{t('adventureEnded')}</p>
                <button onClick={onRestart} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition transform hover:scale-105">{t('startNewLegend')}</button>
            </div>
        </div>
    );
}
