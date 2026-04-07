import enquirer from 'enquirer';
const { Select, Input } = enquirer;
import chalk from 'chalk';
import boxen from 'boxen';
import clipboardy from 'clipboardy';
import ai from './ai.js';
import pm from './peopleManager.js';
import stra from './strategies.js';
import ui from './ui.js';

export async function handleAnalyze(activePerson) {
    const sourcePrompt = new Select({
        name: 'source',
        message: 'Mesajı nasıl sağlamak istersiniz?',
        choices: [
            { name: 'clipboard', message: '1. Panodan Yapıştır (En Son Kopyalanan)' },
            { name: 'manual', message: '2. Kendim Yazacağım / Yapıştıracağım' },
            { name: 'cancel', message: '0. Vazgeç' }
        ]
    });

    const source = await sourcePrompt.run();
    if (source === 'cancel') return;

    let finalMsg = '';
    if (source === 'clipboard') {
        try {
            finalMsg = await clipboardy.read();
            console.log(chalk.gray('\nPanodan okunan mesaj:'));
            console.log(boxen(finalMsg || 'Pano boş!', { padding: 0.5, borderColor: 'gray' }));
            
            if (!finalMsg) {
                console.log(chalk.red('Pano boş!'));
                await new Input({ message: 'Devam etmek için ENTER...' }).run();
                return;
            }

            const confirm = await new Select({
                name: 'confirm',
                message: 'Bu metni analiz edelim mi?',
                choices: [
                    { name: 'yes', message: 'Evet, Analiz Et' },
                    { name: 'cancel', message: 'Hayır, Vazgeç' }
                ]
            }).run();
            if (confirm === 'cancel') return;
        } catch (e) {
            console.log(chalk.red('Pano okunamadı!'));
            return;
        }
    } else {
        finalMsg = await new Input({ message: 'Mesajı buraya yazın veya sağ tık ile yapıştırın:' }).run();
    }

    if (!finalMsg) {
        console.log(chalk.red('Mesaj bulunamadı!'));
        await new Input({ message: 'Devam etmek için ENTER...' }).run();
        return;
    }

    const response = await ai.generateResponse(`ANALIZ: ${finalMsg}`, activePerson);
    console.log(boxen(response, { 
        title: 'Mesaj Analizi & Öneriler', 
        padding: 1, 
        width: Math.min(process.stdout.columns - 4, 100),
        borderColor: 'magenta',
        borderStyle: 'double'
    }));
    
    await pm.addHistoryToPerson(activePerson.id, `ANALİZ EDİLEN MESAJ: ${finalMsg}\n\nCEVAP ÖNERİSİ:\n${response}`);
    await new Input({ message: '\nDevam etmek için ENTER...' }).run();
}

export async function handleDates(activePerson) {
    ui.showHeader(activePerson.name);
    const dates = await pm.getDatesForPerson(activePerson.id);
    console.log(chalk.cyan('--- Önemli Tarihler ---'));
    if (dates.length === 0) console.log(chalk.gray('Henüz tarih eklenmemiş.'));
    dates.forEach((d, i) => console.log(`${i+1}. ${d.label}: ${d.date}`));
    
    const dateChoices = [
        { name: 'add', message: '1. Yeni Tarih Ekle' }
    ];
    if (dates.length > 0) {
        dateChoices.push({ name: 'remove', message: '2. Tarih Sil' });
    }
    dateChoices.push({ name: 'back', message: '0. Geri' });

    const dateAction = await new Select({
        name: 'da',
        message: 'Ne yapmak istersiniz?',
        choices: dateChoices
    }).run();

    if (dateAction === 'add') {
        const label = await new Input({ message: 'Tarih Başlığı (örn: Doğum Günü):' }).run();
        const dateVal = await new Input({ message: 'Tarih (örn: 15.08):' }).run();
        await pm.addDateToPerson(activePerson.id, label, dateVal);
    } else if (dateAction === 'remove') {
        const deleteIdx = await new Select({
            name: 'idx',
            message: 'Silmek istediğiniz tarihi seçin:',
            choices: dates.map((d, i) => ({ name: i, message: `${d.label} (${d.date})` }))
        }).run();
        await pm.removeDateFromPerson(activePerson.id, deleteIdx);
    }
}

export async function handleHistory(activePerson) {
    ui.showHeader(activePerson.name);
    const history = activePerson.history || [];
    if (history.length === 0) {
        console.log(chalk.gray('Bu kişi için henüz bir geçmiş kaydı bulunmamaktadır.'));
    } else {
        history.forEach((h, i) => {
            console.log(chalk.blue(`[${h.date}]`));
            console.log(h.text);
            console.log(chalk.gray('-'.repeat(50)));
        });
    }
    await new Input({ message: '\nDevam etmek için ENTER\'a bas...' }).run();
}

export async function handleSuccessLog(activePerson) {
    ui.showHeader(activePerson.name);
    const logs = activePerson.successLogs || [];
    console.log(chalk.yellow('--- BAŞARI GÜNLÜĞÜ ---'));
    if (logs.length === 0) {
        console.log(chalk.gray('Henüz kayıtlı bir başarı bulunmuyor. Deneyim kazandıkça burası dolacak!'));
    } else {
        logs.forEach((l, i) => {
            console.log(chalk.green(`\n[${l.date}]`));
            console.log(chalk.white(`Hareket: ${l.move}`));
            console.log(chalk.cyan(`Sonuç  : ${l.result}`));
            console.log(chalk.gray('-'.repeat(30)));
        });
    }
    await new Input({ message: '\nDevam etmek için ENTER\'a bas...' }).run();
}

export async function handleStrategyScenario(action, activePerson) {
    let scenario = "";
    if (action === 'apology') {
        const val = await new Input({ message: 'Onu neden üzdün? (Geri dönmek için "iptal" yaz)', initial: 'Ufak bir tartışma...' }).run();
        if (val.toLowerCase() === 'iptal') return;
        scenario = `Üzgün/Kırgın. Durum: ${val}. Gönlünü alacak tavsiyeler ver.`;
    } 
    else if (action === 'support') {
        const val = await new Input({ message: 'Neden üzgün? (Geri dönmek için "iptal" yaz)', initial: 'İşleri kötü gidiyor...' }).run();
        if (val.toLowerCase() === 'iptal') return;
        scenario = `Moral olarak çökmüş. Durum: ${val}. Destek mesajı önerisi ver.`;
    }
    else if (action === 'happy') {
        const val = await new Input({ message: 'Neden mutlu? (Geri dönmek için "iptal" yaz)', initial: 'Güzel bir haber aldı...' }).run();
        if (val.toLowerCase() === 'iptal') return;
        scenario = `Mutlu/Enerjik. Durum: ${val}. Tebrik mesajı önerisi ver.`;
    }

    const strategyChoice = await new Select({
        name: 'sc',
        message: 'Nasıl ilerlemek istersiniz?',
        choices: [
            { name: 'offline', message: `1. Çevrimdışı Strateji Al (AI Değil)` },
            { name: 'ai', message: `2. AI Tavsiyesi Oluştur (Gemini)` },
            { name: 'cancel', message: '3. Vazgeç' }
        ]
    }).run();

    if (strategyChoice === 'cancel') return;

    let finalResponse = "";
    if (strategyChoice === 'offline') {
        const s = stra.getStrategy(action, activePerson);
        finalResponse = chalk.cyan(`[STRATEJİ: ${s.title}]\n\n`) + s.steps.join('\n');
        if (s.warning) finalResponse += `\n\n${chalk.red(s.warning)}`;
    } else {
        finalResponse = await ai.generateResponse(scenario, activePerson);
    }

    console.log(boxen(finalResponse, { 
        title: `${activePerson.name} İçin Tavsiye`, 
        padding: 1, 
        margin: 1,
        width: Math.min(process.stdout.columns - 4, 100),
        borderColor: 'magenta',
        borderStyle: 'double'
    }));
    
    await pm.addHistoryToPerson(activePerson.id, finalResponse);
    
    const wasSuccessful = await new Select({
        name: 'success',
        message: 'Bu tavsiyeyi/mesajı kullandınız mı ve işe yaradı mı?',
        choices: [
            { name: 'yes', message: '1. Evet, Ise Yaradi!' },
            { name: 'no', message: '2. Hayir' }
        ]
    }).run();

    if (wasSuccessful === 'yes') {
        const resultText = await new Input({ message: 'Sonuç ne oldu? (Kısa bir not):' }).run();
        await pm.addSuccessLog(activePerson.id, scenario, resultText);
        console.log(chalk.green('\nBaşarı günlüğüne kaydedildi!'));
    }
    await new Input({ message: '\nDevam etmek için ENTER\'a bas...' }).run();
}
