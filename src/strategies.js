const basicStrategies = {
    apology: {
        title: "Özür Stratejisi (Adım Adım)",
        steps: [
            "1. Savunma yapmadan hatayı kabul et.",
            "2. Duygusunu anladığını belli et ('Seni kırdığım için üzgünüm').",
            "3. Telafi önerisi sun.",
            "4. Ona zaman tanı."
        ]
    },
    support: {
        title: "Destek Stratejisi",
        steps: [
            "1. Sadece dinle, hemen çözüm üretme.",
            "2. Yanında olduğunu hissettir.",
            "3. Küçük bir jest yap (sevdiği bir içecek vb.)."
        ]
    }
};

function getStrategy(type, person) {
    const base = basicStrategies[type] || { title: "Genel Tavsiye", steps: ["Dürüst ve samimi ol."] };
    if (person.traits.toLowerCase().includes('alıngan')) {
        return {
            ...base,
            warning: "⚠️ Bu kişi alıngan biri, kelimelerini ekstra dikkatli seçmelisin!"
        };
    }
    
    return base;
}

export default {
    getStrategy
};
