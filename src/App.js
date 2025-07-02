import React, { useState, useEffect, useCallback, useRef } from 'react';
// Firebase Imports (ensure these are available in your setup)
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";


// --- TRANSLATION DATA ---
const translations = {
    en: {
        createYourHero: "Create Your Hero",
        characterName: "Character Name",
        namePlaceholder: "E.g., Eldrin",
        class: "Class",
        warrior: "Warrior",
        mage: "Mage",
        rogue: "Rogue",
        cleric: "Cleric",
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
        warrior: "לוחם",
        mage: "קוסם",
        rogue: "נוכל",
        cleric: "כהן",
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
        mainMenu: "Main Menu", // Will be replaced by logo
        newGame: "משחק חדש",
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
        warrior: "Воин",
        mage: "Маг",
        rogue: "Разбойник",
        cleric: "Клирик",
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
        mainMenu: "Главное меню", // Will be replaced by logo
        newGame: "Новая игра",
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

// --- HELPER HOOK for translations ---
const useTranslation = (lang) => (key) => translations[lang][key] || key;

// --- API HELPER MODULE ---
const apiHelper = {
    generate: async (prompt, lang = 'en', jsonSchema = null) => {
        const fullPrompt = `${prompt}. Respond in the ${lang} language.`;
        let chatHistory = [{ role: "user", parts: [{ text: fullPrompt }] }];
        const payload = { contents: chatHistory };
        if (jsonSchema) {
            payload.generationConfig = {
                responseMimeType: "application/json",
                responseSchema: jsonSchema,
            };
        }
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Gemini API key is missing. Please set REACT_APP_GEMINI_API_KEY environment variable.");
            throw new Error("API key not configured");
        }
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
        const result = await response.json();

        if (result.candidates?.[0]?.content?.parts?.[0]) {
            const text = result.candidates[0].content.parts[0].text;
            return jsonSchema ? JSON.parse(text) : text;
        } else {
            console.error("Unexpected API response structure:", result);
            throw new Error("Failed to generate content.");
        }
    },
    generateImage: async (prompt) => {
        try {
            const payload = { instances: [{ prompt }], parameters: { sampleCount: 1 } };
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
            if (!apiKey) {
                console.error("Gemini API key is missing for image generation.");
                return `https://placehold.co/600x400/1a202c/edf2f7?text=API+Key+Missing`;
            }
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
    
            if (!response.ok) {
                console.warn(`Image generation failed with status ${response.status}.`);
                return `https://placehold.co/600x400/1a202c/edf2f7?text=Image+Generation+Failed`;
            }
    
            const result = await response.json();
            if (result.predictions?.[0]?.bytesBase64Encoded) {
                return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
            }
             return `https://placehold.co/600x400/1a202c/edf2f7?text=Image+Not+Available`;
        } catch (error) {
            console.error("Image generation fetch error:", error);
            return `https://placehold.co/600x400/1a202c/edf2f7?text=Image+Error`;
        }
    }
};

// --- Firebase Config and Initialization ---
const firebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG 
    ? JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG) 
    : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// --- MAIN APP COMPONENT ---
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
    const t = useTranslation(language);

    useEffect(() => {
        onAuthStateChanged(auth, user => {
            if (user) {
                setUserId(user.uid);
            } else {
                signInAnonymously(auth).catch(error => console.error("Anonymous sign-in failed:", error));
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
            await setDoc(saveDocRef, saveState); 
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
                const loadedData = docSnap.data();
                setLanguage(loadedData.language || 'en');
                setCharacter(loadedData.character ? JSON.parse(loadedData.character) : null);
                setStory(loadedData.story ? JSON.parse(loadedData.story) : []);
                setWorldLore(loadedData.worldLore ? JSON.parse(loadedData.worldLore) : { text: '', images: [], worldMap: '' });
                setBestiary(loadedData.bestiary ? JSON.parse(loadedData.bestiary) : []);
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
        world_intro: <WorldIntroScreen lang={language} t={t} character={character} worldLore={worldLore} setWorldLore={setWorldLore} setGameState={setGameState} />,
        playing: <GameScreen lang={language} t={t} character={character} setCharacter={setCharacter} story={story} setStory={setStory} bestiary={bestiary} setBestiary={setBestiary} saveGame={saveGame} isSaving={isSaving} setNotification={setNotification} worldMapUrl={worldLore.worldMap} />,
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
    
    useEffect(() => {
        apiHelper.generateImage("an epic logo for a fantasy RPG game called 'AI Dungeons', with a stylized dragon and a glowing die, digital art")
            .then(url => {
                if(url && !url.includes('placehold.co')) {
                    setLogoUrl(url);
                }
            });
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            {logoUrl ? (
                 <img src={logoUrl} alt="AI Dungeons Logo" className="w-64 h-64 md:w-80 md:h-80 object-contain mb-8" />
            ) : (
                <h1 className="text-4xl sm:text-5xl font-bold text-red-500 mb-8 text-center">AI Dungeons</h1>
            )}
            <div className="flex flex-col gap-4">
                <button onClick={() => setGameState('character_creation')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-12 rounded-lg text-lg sm:text-xl transition">{t('newGame')}</button>
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
                const prompt = `For a new adventurer named ${character.name} the ${character.class}, generate a deep, epic high fantasy introduction to a world of magic and legends. Describe the world's creation, an ancient tale of heroes, and the current state of the realm, hinting at a great destiny. Keep the tone wondrous and adventurous. Also, provide two distinct, epic fantasy prompts for an image generator that match the lore. The prompts must be in English.`;
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
    const [characterClass, setCharacterClass] = useState(t('warrior'));
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setIsLoading(true);

        const mockData = {
            stats: { power: 10, agility: 7, intellect: 4, vitality: 9 },
            skills: { active: [{ name: "Power Attack", description: "A heavy, powerful swing." }], passive: [{ name: "Iron Will", description: "Resists fear and intimidation." }] },
            inventory: [{ name: "Longsword", type: "Weapon", description: "A reliable and sharp longsword." }],
            masteries: [{ name: "Swords", level: 1, xp: 0 }]
        };

        const newCharacter = { name, class: characterClass, ...mockData };
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
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
                    <div className="mb-6">
                        <label htmlFor="class" className="block text-gray-300 text-sm font-bold mb-2">{t('class')}</label>
                        <select name="class" value={characterClass} onChange={e => setCharacterClass(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline border-gray-600" disabled={isLoading}>
                           {['warrior', 'mage', 'rogue', 'cleric'].map(c => <option key={c} value={t(c)}>{t(c)}</option>)}
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

function GameScreen({ lang, t, character, setCharacter, story, setStory, bestiary, setBestiary, saveGame, isSaving, setNotification, worldMapUrl }) {
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
        const prompt = `You are a Dungeon Master. Continue the adventure. History:\n${history}\n. Respond with narrative, any NPCs present, and XP gained (0-10).`;
        
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
    }, [story, character, lang, setStory, setCurrentNPCs, setCharacter, setNotification, t]);
    
    useEffect(() => {
        if (story.length === 0 && character) {
            handlePlayerAction("The adventure begins. Tell me where I am.");
        }
    }, [character, story.length, handlePlayerAction]);

    return (
        <div className="flex flex-col h-screen p-2 sm:p-4 gap-4">
             <header className="flex-shrink-0 bg-gray-800 rounded-lg shadow-md p-3 flex flex-col sm:flex-row justify-between items-center flex-wrap gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-red-500 text-center sm:text-left">{character?.name} - {character?.class}</h1>
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
     const TabButton = ({ tabName, label }) => <button onClick={() => setActiveTab(tabName)} className={`py-2 px-4 font-bold rounded-t-lg ${activeTab === tabName ? 'bg-gray-700 text-red-400' : 'bg-gray-800 text-gray-400'}`}>{label}</button>;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl h-full max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-4 border-b border-gray-700"><h2 className="text-2xl font-bold text-red-500">{t('characterSheet')}</h2><button onClick={onClose} className="text-3xl">&times;</button></header>
                <nav className="flex-shrink-0 border-b border-gray-700"><TabButton tabName="stats" label={t('stats')} /><TabButton tabName="inventory" label={t('inventory')} /><TabButton tabName="bestiary" label={t('bestiary')} /></nav>
                <main className="p-6 overflow-y-auto">{activeTab === 'stats' && <div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {character.stats && Object.entries(character.stats).map(([stat, value]) => (
                                <div key={stat} className="bg-gray-700 p-4 rounded-lg text-center">
                                    <p className="text-sm uppercase text-gray-400">{t(stat)}</p>
                                    <p className="text-3xl font-bold text-white">{value}</p>
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
                         <div>
                            {bestiary.length > 0 ? (
                                bestiary.map((monster, index) => (
                                    <div key={index} className="mb-6 p-4 bg-gray-700 rounded">
                                        <h4 className="text-xl font-bold text-red-400">{monster.name}</h4>
                                        <img src={monster.image} alt={monster.name} className="my-2 rounded-lg w-full" />
                                        <p className="text-gray-300">{monster.description}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">{t('noCreatures')}</p>
                            )}
                        </div>
                    )}</main>
            </div>
        </div>
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
