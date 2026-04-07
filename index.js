#!/usr/bin/env node
import enquirer from 'enquirer';
const { Select, Input, Form } = enquirer;
import chalk from 'chalk';
import boxen from 'boxen';

import clipboardy from 'clipboardy';
import fs from 'fs/promises';
import path from 'path';
import pm from './src/peopleManager.js';
import ui from './src/ui.js';
import { config } from './src/config.js';
import * as actions from './src/actions.js';

async function loadStaticTips() {
    try {
        const data = await fs.readFile(path.join(config.ROOT_DIR, 'data', 'tips.json'), 'utf-8');
        return JSON.parse(data);
    } catch {
        return null;
    }
}

let activePerson = null;

async function manageProfiles() {
    ui.showHeader();
    const people = await pm.getPeople();
    
    const mainChoices = [
        { name: 'list_people', message: chalk.blue(`1. Kayıtlı Kişiler (${people.length})`) },
        { name: 'add', message: chalk.green('2. Yeni Kişi Ekle') }
    ];

    if (people.length > 0) {
        mainChoices.push({ name: 'edit_profile', message: chalk.cyan('2. [/] Kişi Güncelle') });
        mainChoices.push({ name: 'delete', message: chalk.red('3. [-] Kişi Sil') });
    }
    mainChoices.push({ name: 'library', message: chalk.yellow('5. Bilgi Kütüphanesi') });
    mainChoices.push({ name: 'exit', message: '6. Çıkış' });

    const choice = await new Select({ name: 'choice', message: 'Ana Menü:', choices: mainChoices }).run();
    if (choice === 'exit') process.exit();
    
    if (choice === 'list_people') {
        if (people.length === 0) {
            console.log(chalk.yellow('\nHenüz kimse kayıtlı değil! Önce kişi ekleyin.'));
            await new Input({ message: 'Devam etmek için ENTER...' }).run();
            return manageProfiles();
        }

        const selectedId = await new Select({
            name: 'id',
            message: 'İşlem yapmak istediğiniz kişiyi seçin:',
            choices: [
                ...people.map(p => ({ name: p.id, message: `${p.name} (${p.relation})` })),
                { name: 'back', message: chalk.gray('0. [Geri Dön]') }
            ]
        }).run();

        if (selectedId === 'back') return manageProfiles();
        activePerson = people.find(p => p.id === selectedId);
        return activePerson ? personActionsMenu() : manageProfiles();
    }

    if (choice === 'library') {
        const tips = await loadStaticTips();
        if (!tips) return manageProfiles();

        const cat = await new Select({
            name: 'cat',
            message: 'Hangi konuda yardım istersiniz?',
            choices: [
                { name: 'apology', message: '1. Özür Mesajı Taslakları & Gönül Alma' },
                { name: 'support', message: '2. Destek & Moral Verme Taktikleri' },
                { name: 'happy', message: '3. Tebrik & Birlikte Sevinme Mesajları' },
                { name: 'gifts', message: '4. Yaratıcı Hediye Önerileri' },
                { name: 'date_ideas', message: '5. Unutulmaz Buluşma (Date) Fikirleri' },
                { name: 'rules', message: '6. İlişkide Altın Kurallar (İletişim)' },
                { name: 'personality_tips', message: '7. Kişilik Bazlı Taktikler' },
                { name: 'back', message: '0. Geri Dön' }
            ]
        }).run();

        if (cat !== 'back') {
            ui.showHeader();
            const titles = { apology:"Gönül Alma", support:"Destek & Moral", happy:"Tebrik", gifts:"Hediye", date_ideas:"Buluşma", rules:"Altın Kurallar", personality_tips:"Kişilik Taktikleri" };
            console.log(boxen(tips[cat].join('\n\n'), { title: titles[cat], padding: 1, borderColor: 'yellow', borderStyle: 'round' }));
            await new Input({ message: '\nENTER...' }).run();
        }
        return manageProfiles();
    }
    
    if (choice === 'add') {
        try {
            const newPerson = await new Form({
                name: 'user',
                message: 'Yeni kişi bilgilerini giriniz:',
                choices: [
                    { name: 'name', message: 'İsim' }, { name: 'relation', message: 'İlişki' },
                    { name: 'traits', message: 'Kişilik' }, { name: 'interests', message: 'İlgi Alanları' },
                    { name: 'dislikes', message: 'Neleri Sevmez?' }, { name: 'ageGroup', message: 'Yaş Grubu' },
                    { name: 'communicationStyle', message: 'Dil Üslubu' }
                ]
            }).run();
            await pm.savePerson(newPerson);
        } catch (e) {}
        return manageProfiles();
    }

    if (choice === 'edit_profile') {
        const targetId = await new Select({
            name: 'id',
            message: 'Güncellemek istediğiniz kişi:',
            choices: [...people.map(p => ({ name: p.id, message: p.name })), { name: 'back', message: 'Geri Dön' }]
        }).run();

        if (targetId !== 'back') {
            const p = people.find(p => p.id === targetId);
            try {
                const upd = await new Form({
                    name: 'user',
                    message: 'Bilgileri Güncelleyin:',
                    choices: [
                        { name: 'name', message: 'İsim', initial: p.name }, { name: 'relation', message: 'İlişki', initial: p.relation },
                        { name: 'traits', message: 'Kişilik', initial: p.traits }, { name: 'interests', message: 'İlgi Alanları', initial: p.interests },
                        { name: 'dislikes', message: 'Neleri Sevmez?', initial: p.dislikes }, { name: 'ageGroup', message: 'Yaş Grubu', initial: p.ageGroup },
                        { name: 'communicationStyle', message: 'Dil Üslubu', initial: p.communicationStyle }
                    ]
                }).run();
                await pm.savePerson({ ...upd, id: targetId });
            } catch (e) {}
        }
        return manageProfiles();
    }

    if (choice === 'delete') {
        const id = await new Select({
            name: 'id', message: 'Silmek istediğiniz kişi:',
            choices: [...people.map(p => ({ name: p.id, message: p.name })), { name: 'back', message: 'Geri Dön' }]
        }).run();
        if (id !== 'back') await pm.removePerson(id);
        return manageProfiles();
    }

    return manageProfiles();
}

async function personActionsMenu() {
    ui.showHeader(activePerson.name);
    const today = new Date().toLocaleDateString('tr-TR').slice(0, 5);
    const dates = await pm.getDatesForPerson(activePerson.id);
    const tDates = dates.filter(d => d.date.includes(today));
    if (tDates.length > 0) console.log(boxen(chalk.red.bold(`BUGÜN ÖNEMLİ: ${tDates.map(d => d.label).join(', ')}`), { padding: 0.5, borderColor: 'red' }));

    const action = await new Select({
        name: 'action',
        message: `${activePerson.name} işlemi:`,
        choices: [
            { name: 'analyze', message: '1. Pano Analizi' },
            { name: 'apology', message: '2. Onu Üzdüm' },
            { name: 'support', message: '3. O Üzgün' },
            { name: 'happy', message: '4. O Çok Mutlu' },
            { name: 'dates', message: '5. Tarihleri Yönet' },
            { name: 'history', message: '6. Geçmiş' },
            { name: 'success_log', message: '7. Başarı Günlüğü' },
            { name: 'back', message: '0. Geri Dön' }
        ]
    }).run();

    if (action === 'back') return manageProfiles();
    if (action === 'analyze') await actions.handleAnalyze(activePerson);
    else if (action === 'dates') await actions.handleDates(activePerson);
    else if (action === 'history') await actions.handleHistory(activePerson);
    else if (action === 'success_log') await actions.handleSuccessLog(activePerson);
    else await actions.handleStrategyScenario(action, activePerson);

    const refreshed = (await pm.getPeople()).find(p => p.id === activePerson.id);
    activePerson = refreshed;
    return personActionsMenu();
}

async function start() {
    try {
        await pm.ensureFileExists();
        await manageProfiles();
    } catch (e) {
        if (e === "" || (e && e.message === "")) return manageProfiles();
        console.log(chalk.yellow('\nUygulamadan çıkıldı.'));
        process.exit();
    }
}

start();
