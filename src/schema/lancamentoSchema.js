import { Schema as _Schema, model } from 'mongoose';

const Schema = _Schema;

const LancamentoSchema = new Schema({
	identificador: String,
	empresa: {
		razaoSocial: String,
		cnpj: String,
		endereco: {
			rua: String,
			numero: String,
			complemento: String,
			bairro: String,
			cidade: String,
			estado: String
		}
	},
	data: String,
	formaPagamento: String,
	items: [
		{
			descricao: String,
			codigo: Number,
			quantidade: Number,
			vaor: Number
		}
	],
	total: Number,
	dataCadastro: { type: Date, default: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) }
});

export default model('Lancamento', LancamentoSchema);
