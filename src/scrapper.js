
async function fetchRazaoSocial(page) {
	return await page.$eval('div.txtTopo', el => el.innerText);
}

async function fetchCnpj(page) {
	const dados = await fetchDados(page);
	return dados[0].replace(/[^\d]+/g, '');
}

async function fetchDados(page) {
	return await page.$$eval('div.text', el => el.map(e => e.textContent));
}

async function fetchEndereco(page) {
	const dados = await fetchDados(page);
	const vetor = dados[1].split(',');
	return {
		rua: vetor[0].trim() || null,
		numero: vetor[1].trim() || null,
		complemento: vetor[2].trim() || null,
		bairro: vetor[3].trim() || null,
		cidade: vetor[4].trim() || null,
		estado: vetor[5].trim() || null
	}
}

async function fetchEmpresa(page) {
	const razaoSocial = await fetchRazaoSocial(page);
	const cnpj = await fetchCnpj(page);
	const endereco = await fetchEndereco(page);
	return {
		razaoSocial,
		cnpj,
		endereco
	}
}

async function fetchItems(page) {
	const items = await page.evaluate(() => {
		const lista = [];
		document.querySelectorAll('table#tabResult>tbody>tr').forEach(td => {
			let valor = td.querySelector('td.txtTit > span.valor').innerText.replace(',', ".");
			let codigo = td.querySelector('td>span.RCod').innerText.replace(/[^\d]+/g, '');
			let quantidade = td.querySelector('td>span.Rqtd').innerText.replace('Qtde.:', '').replace(",", ".");
			const item = {
				descricao: td.querySelector('td>span.txtTit').innerText,
				codigo: Number(codigo),
				quantidade: Number(quantidade),
				valor: Number(valor),
			}

			lista.push(item);
		});
		return lista;
	});
	return items;
}

async function fetchTotal(page) {
	return await page.$eval('div.linhaShade>span.totalNumb', e => Number(e.innerText.replace(',', '.')));
}

async function fetchFormaPagamento(page) {
	return await page.$eval('div#linhaTotal>label.tx', e => e.innerText.trim());
}


async function fetchDataEmissao(page) {
	return await page.evaluate(() => {
		const lista = [];
		document.querySelectorAll('div#infos').forEach(el => {
			const lis = [];
			el.querySelectorAll("li.ui-li-static").forEach(li => {
				lis.push(li.innerText)
			});
			const newLis = [];
			el.querySelectorAll('[data-role=\'listview\']').forEach(li => {

				newLis.push(li.innerText);
			});

			if (lis.length > 0) {
				lis.forEach(li => lista.push(li));
			} else {
				newLis.forEach(li => lista.push(li));
			}
		})
		const novaLista = lista[0].split("\n");
		const data = novaLista[2].split(" ");
		return data[5] + " " + data[6];
		// return new Date(data[5].replace('/','-') + " " + data[6]).toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo'})

	});
}

async function fetchIdentificador(page) {
	return await page.$eval('span.chave', e => e.innerText.split(" ").join(""));
}

async function fetchDataCadastro() {
	return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

async function fetchLancamento(page) {
	const identificador = await fetchIdentificador(page);
	const empresa = await fetchEmpresa(page);
	const dataEmissao = await fetchDataEmissao(page);
	const formaPagamento = await fetchFormaPagamento(page);
	const items = await fetchItems(page);
	const total = await fetchTotal(page);
	const dataCadastro = await fetchDataCadastro(page);
	return {
		identificador,
		empresa,
		dataEmissao,
		formaPagamento,
		items,
		total,
		dataCadastro
	}
}

exports.fetchLancamento = fetchLancamento;

