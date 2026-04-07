import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from './config.js';
import ora from 'ora';

let genAI;
let model;

if (config.API_KEY) {
    genAI = new GoogleGenerativeAI(config.API_KEY);
    model = genAI.getGenerativeModel({ model: config.MODEL_NAME });
}

async function generateResponse(prompt, person) {
    if (!config.API_KEY) {
        return "Not: Gemini API key bulunamadı. Lütfen .env dosyasına GEMINI_API_KEY ekleyin.";
    }

    const spinner = ora('Düşünüyorum...').start();
    try {
        let enrichedPrompt;
        if (prompt.startsWith('ANALIZ:')) {
            const msg = prompt.replace('ANALIZ:', '').trim();
            enrichedPrompt = `
Kişi Bilgileri:
İsim: ${person.name}
İlişki: ${person.relation}
Yaş Grubu: ${person.ageGroup || 'Belirtilmedi'}
Kişilik Özellikleri: ${person.traits}
İlgi Alanları: ${person.interests}
Sevmediği Şeyler: ${person.dislikes || 'Belirtilmedi'}
İletişim Üslubu: ${person.communicationStyle || 'Belirtilmedi'}

Sana WhatsApp üzerinden şu mesajı gönderdi:
"${msg}"

GÖREVİN:
1. Bu mesajın alt metnini, duygusunu ve niyetini analiz et.
2. Bu kişiye, onun tarzına ve senin arandaki ilişkiye en uygun 3 farklı cevap taslağı hazırla (Biri kısa, biri esprili, biri ciddi/samimi olsun).
3. Analizini ve önerilerini Türkçe olarak, samimi bir dille sun.`;
        } else {
            enrichedPrompt = `
Kişi Bilgileri:
İsim: ${person.name}
İlişki: ${person.relation}
Yaş Grubu: ${person.ageGroup || 'Belirtilmedi'}
Kişilik Özellikleri: ${person.traits}
İlgi Alanları: ${person.interests}
Sevmediği Şeyler: ${person.dislikes || 'Belirtilmedi'}
İletişim Üslubu: ${person.communicationStyle || 'Belirtilmedi'}

Senaryo: ${prompt}

Bu bilgilere, yaş grubuna ve üslubuna dayanarak ona özel, samimi ve etkili bir tavsiye/mesaj ver. Cevabını Türkçe ver.`;
        }

        const result = await model.generateContent(enrichedPrompt);
        const response = await result.response;
        spinner.stop();
        return response.text();
    } catch (error) {
        spinner.stop();
        return `Bir hata oluştu: ${error.message}`;
    }
}

export default {
    generateResponse
};
