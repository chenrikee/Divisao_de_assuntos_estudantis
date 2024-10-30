// Seleciona os elementos do DOM
const insertBtn = document.getElementById('insertBtn');
const cadastroList = document.getElementById('cadastroList');
const menuIcon = document.getElementById('menuIcon');
const sidebar = document.getElementById('sidebar');
const closeBtn = document.getElementById('closeBtn');
const searchBtn = document.getElementById('searchBtn');
const cpfInput = document.getElementById('cpf');
window.addEventListener('load', loadUsers);

// Função para abrir a barra lateral
function openSidebar() {
    sidebar.style.width = '250px';
    menuIcon.style.display = 'none';
}

// Função para fechar a barra lateral
function closeSidebar() {
    sidebar.style.width = '0';
    setTimeout(() => {
        menuIcon.style.display = 'block';
    }, 500);
}

const programaOptions = document.querySelectorAll('.programa-option');
const selectedProgramsInput = document.getElementById('selectedPrograms');

programaOptions.forEach(option => {
    option.addEventListener('click', () => {
        option.classList.toggle('selected');
        updateSelectedPrograms();
    });
});

function updateSelectedPrograms() {
    const selectedValues = Array.from(document.querySelectorAll('.programa-option.selected'))
        .map(option => option.getAttribute('data-value'));
    selectedProgramsInput.value = selectedValues.join(', ');
}


menuIcon.addEventListener('click', openSidebar);
closeBtn.addEventListener('click', closeSidebar);
window.addEventListener('beforeunload', closeSidebar);

// Seleciona os campos de pesquisa
const searchName = document.getElementById('searchName');
const searchDate = document.getElementById('searchDate');
const searchProgram = document.getElementById('searchProgram');

// Função para filtrar a tabela
function filterTable() {
    const nameFilter = searchName.value.toLowerCase();
    const dateFilter = searchDate.value.toLowerCase();
    const programFilter = searchProgram.value.toLowerCase();

    const rows = cadastroList.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const nameCell = row.cells[0]?.textContent.toLowerCase() || '';
        const dateCell = row.cells[1]?.textContent.toLowerCase() || '';
        const programCell = row.cells[2]?.textContent.toLowerCase() || '';

        const matchesName = nameCell.includes(nameFilter);
        const matchesDate = dateCell.includes(dateFilter);
        const matchesProgram = programCell.includes(programFilter);

        if (matchesName && matchesDate && matchesProgram) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Adiciona evento de clique ao botão de inserção
insertBtn.addEventListener('click', async () => {
    // Coleta os dados do formulário
    const name = document.getElementById('name').value;
    const cpf = document.getElementById('cpf').value; // Corrigido para usar o ID correto
    const date = new Date(document.getElementById('date').value);
    const selectedPrograms = selectedProgramsInput.value; // Programas selecionados
    const adjustedDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));

    // Monta o objeto de dados do usuário
    const newUser = {
        nome: name,
        cpf: cpf,
        data_inicio: adjustedDate,
        status: true, // Você pode modificar essa lógica conforme necessário
        marmitas_consumidas: 0,
        programa: selectedPrograms,
        datas: {
            segunda: false,
            terca: false,
            quarta: false,
            quinta: false,
            sexta: false
        }
    };

    // Faz a requisição para salvar o usuário
    try {
        const response = await fetch('http://localhost:3000/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Usuário salvo:', result);
            // Aqui você pode adicionar o novo usuário à tabela se necessário
            addRowToTable(result.usuario);
        } else {
            const errorResult = await response.json();
            console.error('Erro ao salvar usuário:', errorResult.message);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
});

// Função para adicionar a linha na tabela após salvar o usuário
function addRowToTable(usuario) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${usuario.nome}</td>
        <td>${usuario.cpf}</td>
        <td>${new Date(usuario.data_inicio).toLocaleDateString()}</td>
        <td>${usuario.programa}</td>
        <td>${usuario.status ? "Sim": "Não"}</td> 
        <td>${usuario.data_saida ? new Date(usuario.data_saida).toLocaleDateString() : "Ativo"}
    `;
    cadastroList.appendChild(row);
}

async function loadUsers() {
    try {
        const response = await fetch('http://localhost:3000/usuarios');
        if (response.ok) {
            let usuarios = await response.json();
            // Ordena a lista de usuários
            usuarios = usuarios.sort((a, b) => {
                // Prioriza status "Sim" sobre "Não"
                if (a.status === b.status) {
                    // Se o status for igual, compara as datas (decrescente)
                    const dataA = new Date(a.data_inicio);
                    const dataB = new Date(b.data_inicio);

                    if (dataA > dataB) return -1; // dataA vem antes de dataB
                    if (dataA < dataB) return 1;  // dataA vem depois de dataB

                    // Se as datas forem iguais, compara os nomes (alfabética crescente)
                    const nomeA = a.nome.toLowerCase();
                    const nomeB = b.nome.toLowerCase();
                    
                    if (nomeA < nomeB) return -1; // nomeA vem antes de nomeB
                    if (nomeA > nomeB) return 1;  // nomeA vem depois de nomeB
                    return 0; // São iguais
                }
                // Se o status for diferente, prioriza "Sim" (true) sobre "Não" (false)
                return a.status === true ? -1 : 1; // Sim (true) vem antes de Não (false)
            });

            // Preenche a tabela com os usuários ordenados
            usuarios.forEach(usuario => {
                addRowToTable(usuario);
            });
        } else {
            console.error('Erro ao recuperar usuários:', response.statusText);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

// Função para filtrar a tabela com base na barra de pesquisa
function filterTable() {
    const searchFilter = searchInput.value.toLowerCase(); // Obtém o valor da pesquisa

    const rows = cadastroList.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const nameCell = row.cells[0]?.textContent.toLowerCase() || '';
        const cpfCell = row.cells[1]?.textContent.toLowerCase() || '';
        const dateCell = row.cells[2]?.textContent.toLowerCase() || '';
        const programCell = row.cells[3]?.textContent.toLowerCase() || '';

        // Verifica se alguma célula corresponde ao filtro
        const matchesSearch = nameCell.includes(searchFilter) || 
                              cpfCell.includes(searchFilter) || 
                              dateCell.includes(searchFilter) || 
                              programCell.includes(searchFilter);

        if (matchesSearch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Adiciona evento de clique ao botão de pesquisa
searchBtn.addEventListener('click', filterTable);

function formatCPF() {
    // Remove caracteres que não são dígitos
    let cpf = cpfInput.value.replace(/\D/g, '');
    
    // Verifica se o CPF tem 11 dígitos
    if (cpf.length > 11) {
        cpf = cpf.substring(0, 11);
    }

    // Aplica a máscara
    if (cpf.length <= 3) {
        cpfInput.value = cpf;
    } else if (cpf.length <= 6) {
        cpfInput.value = `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
    } else if (cpf.length <= 9) {
        cpfInput.value = `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
    } else {
        cpfInput.value = `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
    }
}

// Adiciona o evento de input
cpfInput.addEventListener('input', formatCPF);