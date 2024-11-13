async function adicionarUsuarios() {
    const usuarios = [
        {
            nome: "João Silva",
            status: true,
            marmitas_consumidas: 0,
            cpf: "123.456.789-00",
            programa: "Programa A",
            data_inicio: new Date("2024-01-10")
        },
        {
            nome: "Maria Oliveira",
            status: true,
            marmitas_consumidas: 0,
            cpf: "987.654.321-00",
            programa: "Programa B",
            data_inicio: new Date("2024-02-15")
        },
        {
            nome: "Carlos Souza",
            status: false,
            marmitas_consumidas: 0,
            cpf: "111.222.333-44",
            programa: "Programa C",
            data_inicio: new Date("2024-03-20")
        },
        {
            nome: "Ana Costa",
            status: true,
            marmitas_consumidas: 0,
            cpf: "555.666.777-88",
            programa: "Programa D",
            data_inicio: new Date("2024-04-25")
        },
        {
            nome: "Pedro Lima",
            status: false,
            marmitas_consumidas: 0,
            cpf: "999.888.777-66",
            programa: "Programa E",
            data_inicio: new Date("2024-05-30")
        }
    ];

    for (const usuario of usuarios) {
        try {
            const response = await fetch('http://localhost:3000/cadastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(usuario)
            });

            const resultado = await response.json();
            if (response.ok) {
                console.log(`Usuário ${usuario.nome} salvo com sucesso:`, resultado);
            } else {
                console.error(`Erro ao salvar o usuário ${usuario.nome}:`, resultado);
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
        }
    }
}

// Chama a função para adicionar os usuários
adicionarUsuarios();
