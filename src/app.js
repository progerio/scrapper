const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { fetchLancamento } = require('./scrapper');

const app = async() => {
        const directory = path.join(__dirname, '../html');
	const files = fs.readdirSync(directory);
	const browser = await puppeteer.launch();
       for (let file of files) {
		const page = await browser.newPage();
		if( path.extname(file) === '.html' ){
			let pathFile = path.join('file://', __dirname, '../html', file);
			await page.goto(pathFile);
			const lancamento = await fetchLancamento(page);
			console.log(lancamento);
		}
		await page.close();
       }
	await browser.close();

}

app();

