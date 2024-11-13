const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());



//Cconst mongo_uri_local = "mongodb+srv://chenrikee08:yuupygy4QOXHlmsu@cluster0.mzcht.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conectado ao MongoDB');
}).catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error);
});


// mongoose.connect(mongo_uri_local, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).then(() => {
//     console.log('Conectado ao MongoDB');
// }).catch((error) => {
//     console.error('Erro ao conectar ao MongoDB:', error);
// });


// Definindo o esquema para o documento
const UsuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    status: { type: Boolean, required: true },
    marmitas_consumidas: { type: Number, default: 0 },
    datas: {
        segunda: { type: Boolean, default: false },
        terca: { type: Boolean, default: false },
        quarta: { type: Boolean, default: false },
        quinta: { type: Boolean, default: false },
        sexta: { type: Boolean, default: false }
    },
    cpf: { type: String, required: true },
    programa: { type: String, required: true },
    data_inicio: { type: Date, required: true },
    data_saida: { type: Date, required: false },
}, { collection: 'users' }); // Especifica a collection "users"

// Criando o modelo
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// Rota para salvar um novo usuário
app.post('/cadastro', async (req, res) => {
    try {
        const dados = req.body;
        dados.datas = {
            segunda: false,
            terca: false,
            quarta: false,
            quinta: false,
            sexta: false
        };

        const usuario = new Usuario(dados);
        await usuario.save();
        res.status(201).send({ message: 'Usuário salvo com sucesso', usuario });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao salvar usuário', error });
    }
});

// Definindo o esquema para a nova coleção "justificativas"
const JustificativaSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    justificativa: { type: String, required: true },
    data: { type: Date, required: true }
}, { collection: 'justificativas' }); // Nome da coleção

// Criando o modelo
const Justificativa = mongoose.model('Justificativa', JustificativaSchema);

// Rota para recuperar todos os usuários
app.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.status(200).send(usuarios);
    } catch (error) {
        res.status(500).send({ message: 'Erro ao recuperar usuários', error });
    }
});

// Iniciando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Rota para filtrar usuários pelo status e programa
app.get('/usuarios/filtrar', async (req, res) => {
    try {
        const { status, programa } = req.query;

        // Converte o status para booleano
        const statusBoolean = status === 'true'; 

        const query = {};
        
        // Adiciona o filtro de status se for fornecido
        if (status !== undefined) {
            query.status = statusBoolean;
        }

        // Adiciona o filtro de programa se for fornecido
        if (programa) {
            query.programa = { $regex: programa, $options: 'i' }; // Usando regex para busca case-insensitive
        }

        console.log('Query:', query); // Log da consulta

        const usuarios = await Usuario.find(query);
        res.status(200).send(usuarios);
    } catch (error) {
        console.error('Erro ao filtrar usuários:', error); // Log do erro
        res.status(500).send({ message: 'Erro ao filtrar usuários', error });
    }
});

// Rota para excluir logicamente um usuário
app.patch('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Atualiza o status do usuário e define data_saida como a data atual
        const usuario = await Usuario.findByIdAndUpdate(
            id,
            { 
                status: status, 
                data_saida: status ? null : new Date() // Se status for true, mantém data_saida como null; caso contrário, define como data atual
            },
            { new: true }
        );

        if (!usuario) {
            return res.status(404).send({ message: 'Usuário não encontrado' });
        }

        res.status(200).send({ message: 'Usuário excluído logicamente', usuario });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao atualizar usuário', error });
    }
});

// Rota para atualizar o status das presenças de um usuário
app.patch('/usuarios/data/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { segunda, terca, quarta, quinta, sexta, data_saida } = req.body;

        // Cria um objeto para armazenar as atualizações
        const updates = {};

        // Adiciona as atualizações apenas se os campos estiverem definidos
        if (segunda !== undefined) updates['datas.segunda'] = segunda;
        if (terca !== undefined) updates['datas.terca'] = terca;
        if (quarta !== undefined) updates['datas.quarta'] = quarta;
        if (quinta !== undefined) updates['datas.quinta'] = quinta;
        if (sexta !== undefined) updates['datas.sexta'] = sexta;

        // Atualiza a data_saida se fornecida
        if (data_saida !== undefined) updates['data_saida'] = data_saida;

        // Atualiza o usuário no banco de dados
        const usuario = await Usuario.findByIdAndUpdate(id, updates, { new: true });

        if (!usuario) {
            return res.status(404).send({ message: 'Usuário não encontrado' });
        }

        res.status(200).send({ message: 'Usuário atualizado com sucesso', usuario });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao atualizar usuário', error });
    }
});

// Rota para salvar uma nova justificativa
app.post('/justificativa', async (req, res) => {
    try {
        const justificativa = new Justificativa(req.body);
        await justificativa.save();
        res.status(201).send({ message: 'Justificativa salva com sucesso', justificativa });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao salvar justificativa', error });
    }
});

// Rota para recuperar todas as justificativas
app.get('/justificativas', async (req, res) => {
    try {
        const justificativas = await Justificativa.find();
        res.status(200).send(justificativas);
    } catch (error) {
        res.status(500).send({ message: 'Erro ao recuperar justificativas', error });
    }
});

// Rota para remover todas as justificativas
app.delete('/justificativas', async (req, res) => {
    try {
        await Justificativa.deleteMany({});
        res.status(200).send({ message: 'Todas as justificativas foram removidas com sucesso' });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao remover justificativas', error });
    }
});

app.use(cors({
  origin: 'https://divisao-de-assuntos-estudantis.vercel.app/', // Substitua pelo domínio do seu site
  methods: 'GET,POST,PUT,DELETE',
}));
