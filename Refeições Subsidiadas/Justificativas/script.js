// Seleciona os elementos do DOM
const insertBtn = document.getElementById('insertBtn');
const cadastroList = document.getElementById('cadastroList');
const menuIcon = document.getElementById('menuIcon');
const sidebar = document.getElementById('sidebar');
const closeBtn = document.getElementById('closeBtn');
window.addEventListener('load', () => {
    loadJustificativas(); // Carrega as justificativas
});

// Função para abrir a barra lateral
function openSidebar() {
    sidebar.style.width = '250px'; // Abre a barra lateral
    menuIcon.style.display = 'none'; // Esconde o ícone de menu
}

// Função para fechar a barra lateral
function closeSidebar() {
    sidebar.style.width = '0'; // Inicia o fechamento da barra lateral
    setTimeout(() => {
        menuIcon.style.display = 'block'; // Mostra o ícone de menu após o fechamento
    }, 500);
}

// Função para formatar a data
function formatDate(dateString) {
    console.log('Data recebida em formatDate:', dateString); // Para depuração

    // Verifica se a data está no formato "AAAA-MM-DD" e converte para "DD/MM/AAAA"
    if (dateString && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    // Verifica se a data já está no formato "DD/MM/AAAA"
    if (dateString && /^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
    }

    return 'Data inválida'; // Retorna uma mensagem padrão em caso de formato inesperado
}

insertBtn.addEventListener('click', async () => {
    // Coleta os dados do formulário
    const name = document.getElementById('name').value;
    const date = new Date(document.getElementById('date').value);
    const justificativa = document.getElementById('motivo').value;
    const adjustedDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));

    // Monta o objeto de dados da justificativa
    const newJustificativa = {
        nome: name,
        justificativa: justificativa,
        data: adjustedDate, // A data que será armazenada
    };

    try {
        const response = await fetch('http://localhost:3000/justificativa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newJustificativa)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Justificativa salva:', result);
            // Aqui você pode adicionar a nova justificativa à tabela se necessário
            addRowToTable(result.justificativa);
        } else {
            const errorResult = await response.text(); // Obtém a resposta do erro como texto
            console.error('Erro ao salvar justificativa:', errorResult);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
});

// Função para adicionar a linha na tabela após salvar a justificativa
function addRowToTable(justificativa) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${justificativa.nome}</td>
        <td>${new Date(justificativa.data).toLocaleDateString()}</td>
        <td>${justificativa.justificativa}</td>
    `;
    cadastroList.appendChild(row);
}

// Adiciona eventos aos botões de menu
closeBtn.addEventListener('click', closeSidebar);
menuIcon.addEventListener('click', openSidebar);

async function loadJustificativas() {
    try {
        const response = await fetch('http://localhost:3000/justificativas');
        if (response.ok) {
            const justificativas = await response.json();
            // Ordena a lista de justificativas em ordem crescente pela data
            justificativas.sort((a, b) => {
                const dataA = new Date(a.data);
                const dataB = new Date(b.data);
                return dataA - dataB; // Ordenação crescente
            });
            // Preenche a tabela com os dados das justificativas
            justificativas.forEach(justificativa => {
                addRowToTable(justificativa);
            });
        } else {
            console.error('Erro ao recuperar justificativas:', response.statusText);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}
document.getElementById('clearBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/justificativas', {
            method: 'DELETE'
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Justificativas removidas:', result);
            // Aqui você pode atualizar a UI para refletir a remoção
            // Por exemplo, limpar a tabela onde as justificativas são mostradas
            cadastroList.innerHTML = ''; // Limpa todas as linhas da tabela
        } else {
            const errorResult = await response.json();
            console.error('Erro ao remover justificativas:', errorResult);
        }
    } catch (error) {
        console.error('Erro na requisição de remoção:', error);
    }
});

