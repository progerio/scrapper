const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { fetchLancamento } = require('./scrapper');
const mongoose = require('mongoose');

const stringConnection = 'mongodb://localhost:27017/test';

mongoose.connect(stringConnection, { useNewUrlParser: true, useUnifiedTopology: true }, (error) => { if (error) return console.log(error) });
mongoose.Promise = global.Promise;

const database = mongoose.connection;

const LancamentoModel = require('./schema/lancamentoSchema.js');

const app = async () => {
    const directory = path.join(__dirname, '../html');
	const files = fs.readdirSync(directory);
	const browser = await puppeteer.launch();
        for (let file of files) {
		const page = await browser.newPage();
		if( path.extname(file) === '.html' ){
			let pathFile = path.join('file://', __dirname, '../html', file);
			await page.goto(pathFile);
			const lancamento = await fetchLancamento(page);
			let resultado = await LancamentoModel.findOne({identificador: lancamento.identificador});
			
			if(!resultado){
				const document = new LancamentoModel(lancamento);
				 document.save((err, doc) => {
                   			 if (err) return console.error(err);
                    			 console.log(lancamento.identificador);
                		});
				if (!fs.existsSync('./importados')) {
    				    fs.mkdirSync('./importados');
				}	
				let pathAtual = path.join(__dirname, '../html', file);
				let newPath = path.join(__dirname, '../importados', file);
				
				fs.rename(pathAtual, newPath, err => { if (err) return console.log(err); });
			}
			
		}
		await page.close();
       }
	await browser.close();
	database.close();
}

app();
