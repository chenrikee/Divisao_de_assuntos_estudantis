// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Configurações do servidor
const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb+srv://chenrikee08:yuupygy4QOXHlmsu@serverlessinstance0.gvbn2uf.mongodb.net/db?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Modelo de Dados
const CadastroSchema = new mongoose.Schema({
    name: String,
    status: String,
    marmitas: Number,
});

const Cadastro = mongoose.model('Cadastro', CadastroSchema);

// Rota para adicionar um novo cadastro
app.post('/cadastro', async (req, res) => {
    try {
        const { name, status, marmitas } = req.body;
        const novoCadastro = new Cadastro({ name, status, marmitas: marmitas || 0 });
        await novoCadastro.save();
        res.status(201).json({ message: 'Cadastro adicionado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar o cadastro.' });
    }
});

// Rota para carregar os cadastros
app.get('/cadastros', async (req, res) => {
    try {
        const cadastros = await Cadastro.find();
        res.json(cadastros);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar os cadastros.' });
    }
});

// Rota para excluir um cadastro
app.delete('/cadastro/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Cadastro.findByIdAndDelete(id);
        res.json({ message: 'Cadastro excluído com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir o cadastro.' });
    }
});

// Inicia o servidor
const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

