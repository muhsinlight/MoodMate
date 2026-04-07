import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.join(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });

export const config = {
    API_KEY: process.env.GEMINI_API_KEY,
    MODEL_NAME: "gemini-2.5-flash",
    PEOPLE_FILE: path.join(rootDir, 'data', 'people.json'),
    DATES_FILE: path.join(rootDir, 'data', 'dates.json'),
    SETTINGS_FILE: path.join(rootDir, 'data', 'settings.json'),
    ROOT_DIR: rootDir
};
