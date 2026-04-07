import fs from 'fs/promises';
import { config } from './config.js';
import path from 'path';

async function ensureFileExists() {
    try {
        await fs.access(config.PEOPLE_FILE);
    } catch {
        await fs.mkdir(path.join(config.ROOT_DIR, 'data'), { recursive: true });
        await fs.writeFile(config.PEOPLE_FILE, JSON.stringify([], null, 2));
    }
    
    try {
        await fs.access(config.DATES_FILE);
    } catch {
        await fs.writeFile(config.DATES_FILE, JSON.stringify({}, null, 2));
    }
}

async function getPeople() {
    await ensureFileExists();
    const data = await fs.readFile(config.PEOPLE_FILE, 'utf-8');
    return JSON.parse(data);
}

async function savePerson(personData) {
    const people = await getPeople();
    const id = personData.id || personData.name.toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-t0-9_]/g, '');

    let finalId = id;
    if (!personData.id && people.some(p => p.id === finalId)) {
        finalId = `${id}_${Date.now().toString().slice(-4)}`;
    }
    
    const index = people.findIndex(p => p.id === finalId);
    const newPerson = {
        ...personData,
        id: finalId,
        history: index !== -1 ? (people[index].history || []) : []
    };

    if (index !== -1) {
        people[index] = newPerson;
    } else {
        people.push(newPerson);
    }

    await fs.writeFile(config.PEOPLE_FILE, JSON.stringify(people, null, 2));
    return newPerson;
}

async function getDatesForPerson(personId) {
    await ensureFileExists();
    const data = await fs.readFile(config.DATES_FILE, 'utf-8');
    const allDates = JSON.parse(data);
    return allDates[personId] || [];
}

async function addDateToPerson(id, dateLabel, dateValue) {
    await ensureFileExists();
    const data = await fs.readFile(config.DATES_FILE, 'utf-8');
    const allDates = JSON.parse(data);
    
    if (!allDates[id]) allDates[id] = [];
    allDates[id].push({ label: dateLabel, date: dateValue });

    await fs.writeFile(config.DATES_FILE, JSON.stringify(allDates, null, 2));
}

async function removeDateFromPerson(id, dateIdx) {
    await ensureFileExists();
    const data = await fs.readFile(config.DATES_FILE, 'utf-8');
    const allDates = JSON.parse(data);
    
    if (allDates[id] && allDates[id][dateIdx]) {
        allDates[id].splice(dateIdx, 1);
        await fs.writeFile(config.DATES_FILE, JSON.stringify(allDates, null, 2));
    }
}

async function addHistoryToPerson(id, message) {
    const people = await getPeople();
    const index = people.findIndex(p => p.id === id);
    if (index !== -1) {
        if (!people[index].history) people[index].history = [];
        people[index].history.push({
            date: new Date().toLocaleString('tr-TR'),
            text: message
        });
        await fs.writeFile(config.PEOPLE_FILE, JSON.stringify(people, null, 2));
    }
}

async function addSuccessLog(id, move, result) {
    const people = await getPeople();
    const index = people.findIndex(p => p.id === id);
    if (index !== -1) {
        if (!people[index].successLogs) people[index].successLogs = [];
        people[index].successLogs.push({
            date: new Date().toLocaleString('tr-TR'),
            move,
            result
        });
        await fs.writeFile(config.PEOPLE_FILE, JSON.stringify(people, null, 2));
    }
}

async function removePerson(id) {
    const people = await getPeople();
    const filtered = people.filter(p => p.id !== id);
    await fs.writeFile(config.PEOPLE_FILE, JSON.stringify(filtered, null, 2));
}

export default {
    ensureFileExists,
    getPeople,
    savePerson,
    getDatesForPerson,
    addDateToPerson,
    removeDateFromPerson,
    addHistoryToPerson,
    addSuccessLog,
    removePerson
};
