// Seleciona os elementos do DOM
const sidebar = document.getElementById('sidebar');
const menuIcon = document.getElementById('menuIcon');
const closeBtn = document.getElementById('closeBtn');
const attendanceTableBody = document.querySelector('.attendance-table tbody');

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

// Função para atualizar a cor e o total de presenças
function updateTotalAndColors(row) {
    const checkboxes = row.querySelectorAll('input[type="checkbox"]');
    let totalPresences = 0; // Reinicia o total de presenças

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            totalPresences++; // Conta as presenças
        }
    });

    // Atualiza a célula "Total"
    const totalCell = row.querySelector('.total-cell');
    totalCell.textContent = totalPresences;

    // Aplica as cores conforme o número de presenças
    row.style.color = totalPresences < 3 ? 'red' : 'green'; // Verifica a cor
}

// Adiciona eventos para abrir e fechar a barra lateral
menuIcon.addEventListener('click', openSidebar);
closeBtn.addEventListener('click', closeSidebar);
window.addEventListener('beforeunload', closeSidebar);
window.addEventListener('load', () => {
    loadUsers(true, 'Refeições Subsidiadas'); // Carrega usuários com status verdadeiro e programa específico
});
window.addEventListener('load', () => {
    updateTableHeaders();
});

// Função para adicionar a linha na tabela após salvar o usuário

function addRowToTable(usuario) {
    const row = document.createElement('tr');
    console.log(usuario)
    // Criação dos checkboxes para cada dia da semana
    const diasDaSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];

    // Prepara as células com checkboxes
    const checkboxes = diasDaSemana.map(dia => {
        console.log(dia)
        const checked = usuario.datas[dia] ? 'checked' : ''; // Verifica se o dia está marcado
        return `
            <td>
                <label>
                    <input type="checkbox" ${checked} data-dia="${dia}" data-id="${usuario._id}">
                </label>
            </td>
        `;
    }).join(''); // Junta todos os checkboxes em colunas

    // Monta a linha com o nome do usuário e os checkboxes
    row.innerHTML = `
        <td>${usuario.nome}</td>
        ${checkboxes}
        <td class="total-cell">0</td> <!-- Adiciona a célula total -->
    `;

    // Adiciona a linha à tabela
    attendanceTableBody.appendChild(row);

    // Adiciona o evento change aos checkboxes
    const checkboxesInputs = row.querySelectorAll('input[type="checkbox"]');
    checkboxesInputs.forEach(input => {
        input.addEventListener('change', async (event) => {
            const dia = event.target.getAttribute('data-dia'); // Dia do checkbox
            const usuarioId = event.target.getAttribute('data-id'); // ID do usuário
            const novoStatus = event.target.checked; // Novo estado do checkbox

            // Atualiza o campo data no servidor
            try {
                const response = await fetch(`http://localhost:3000/usuarios/data/${usuarioId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        [dia]: novoStatus,
                    }),
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Usuário atualizado:', result);
                } else {
                    console.error('Erro ao atualizar usuário:', response.statusText);
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
            }

            // Atualiza total e cores
            updateTotalAndColors(row);
        });
    });

    // Atualiza total e cores inicialmente
    updateTotalAndColors(row);
}

async function loadUsers(status, programa) {
    try {
        // Monta a URL com parâmetros de consulta, se fornecidos
        const url = new URL('http://localhost:3000/usuarios/filtrar');
        if (status !== undefined) url.searchParams.append('status', status);
        if (programa) url.searchParams.append('programa', programa);

        const response = await fetch(url);
        if (response.ok) {
            let usuarios = await response.json();
            // Limpa a tabela antes de preencher
            attendanceTableBody.innerHTML = '';
            usuarios = usuarios.sort((a, b) => {
                // Primeiro, compara os nomes
                const nomeA = a.nome.toLowerCase(); // Ignora maiúsculas/minúsculas
                const nomeB = b.nome.toLowerCase();
            
                if (nomeA < nomeB) return -1; // a vem antes de b
                if (nomeA > nomeB) return 1;  // a vem depois de b
            });
            // Preenche a tabela com os dados dos usuários
            usuarios.forEach(usuario => {
                addRowToTable(usuario);
            });
            console.log(usuarios)
        } else {
            console.error('Erro ao recuperar usuários:', response.statusText);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

// Função para calcular e atualizar os cabeçalhos da tabela
function updateTableHeaders() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

    // Calcula a diferença de dias até a próxima segunda-feira
    const daysUntilMonday = (dayOfWeek === 0) ? 1 : (1 - dayOfWeek + 7) % 7; // Se for domingo, deve ser 1 dia até segunda

    // Data da próxima segunda-feira
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);

    // Preenche os cabeçalhos com as datas
    const dayHeaders = document.querySelectorAll('.attendance-table th[id^="day"]');

    dayHeaders.forEach((header, index) => {
        const date = new Date(nextMonday);
        date.setDate(nextMonday.getDate() + index); // Adiciona o índice (0, 1, 2, 3, 4) para cada dia
        header.textContent = ` ${date.toLocaleDateString('pt-BR')}`; // Formato brasileiro
    });
}

document.getElementById('clearBtn').addEventListener('click', async () => {
    const rows = document.querySelectorAll('.attendance-table tbody tr');

    rows.forEach(async (row) => {
        const checkboxes = row.querySelectorAll('input[type="checkbox"]');
        const usuarioId = checkboxes[0]?.getAttribute('data-id'); // Assume que o ID é igual para todos os checkboxes da linha

        // Percorre todos os checkboxes e desmarca
        checkboxes.forEach(checkbox => {
            checkbox.checked = false; // Desmarca o checkbox
        });

        // Envia a requisição para atualizar os dados no MongoDB
        if (usuarioId) {
            try {
                const response = await fetch(`http://localhost:3000/usuarios/data/${usuarioId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        segunda: false,
                        terca: false,
                        quarta: false,
                        quinta: false,
                        sexta: false,
                    }),
                });

                if (response.ok) {
                    console.log(`Presenças do usuário ${usuarioId} foram limpas.`);
                } else {
                    console.error('Erro ao limpar presenças:', response.statusText);
                }
            } catch (error) {
                console.error('Erro na requisição de limpeza:', error);
            }
        }

        // Atualiza total e cores após a limpeza
        updateTotalAndColors(row);
    });
});
