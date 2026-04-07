import chalk from 'chalk';
import figlet from 'figlet';

function showHeader(personName = "") {
    process.stdout.write('\x1Bc');
    console.log(
        chalk.red(
            figlet.textSync('MoodMate', { horizontalLayout: 'full' })
        )
    );
    if (personName) {
        console.log(chalk.yellow(`Aktif Profil: ${personName}`));
    } else {
        console.log(chalk.gray('Sevdiğinin Gönlünü Alman İçin Yanındayız.'));
    }
    const slogans = [
        "Küçük jestler, büyük yaraları iyileştirir.",
        "İletişim, ilişkinin nefesidir.",
        "Empati, köprü kurmanın en kısa yoludur.",
        "Bir özür, bin hatayı örtebilir.",
        "Sevgi, gösterilmedikçe tam sayılmaz."
    ];
    console.log(chalk.italic.cyan(`\n"${slogans[Math.floor(Math.random() * slogans.length)]}"`));
    console.log('\n');
}

export default {
    showHeader
};
