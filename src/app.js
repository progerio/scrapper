import { readdirSync, existsSync, mkdirSync, rename } from 'fs';
import { join, extname } from 'path';
import { launch } from 'puppeteer';
import { fetchLancamento } from './scrapper';
import { connect, Promise, connection } from 'mongoose';

const stringConnection = 'mongodb://localhost:27017/test';

connect(stringConnection, { useNewUrlParser: true, useUnifiedTopology: true }, (error) => { if (error) return console.log(error) });
Promise = global.Promise;

const database = connection;

import LancamentoModel, { findOne } from './schema/lancamentoSchema.js';

const app = async () => {
	const directory = join(__dirname, '../html');
	const files = readdirSync(directory);
	const browser = await launch();
	for (let file of files) {
		const page = await browser.newPage();
		if (extname(file) === '.html') {
			let pathFile = join('file://', __dirname, '../html', file);
			await page.goto(pathFile);
			const lancamento = await fetchLancamento(page);
			let resultado = await findOne({ identificador: lancamento.identificador });

			if (!resultado) {
				const document = new LancamentoModel(lancamento);
				document.save((err, doc) => {
					if (err) return console.error(err);
					console.log(lancamento.identificador);
				});
				if (!existsSync('./importados')) {
					mkdirSync('./importados');
				}
				let pathAtual = join(__dirname, '../html', file);
				let newPath = join(__dirname, '../importados', file);

				rename(pathAtual, newPath, err => { if (err) return console.log(err); });
			}

		}
		await page.close();
	}
	await browser.close();
	database.close();
}

app();
