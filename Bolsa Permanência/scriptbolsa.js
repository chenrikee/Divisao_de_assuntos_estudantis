// Seleciona os elementos do DOM
const insertBtn = document.getElementById('insertBtn');
const cadastroList = document.getElementById('cadastroList');
const menuIcon = document.getElementById('menuIcon');
const sidebar = document.getElementById('sidebar');
const closeBtn = document.getElementById('closeBtn');

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
menuIcon.addEventListener('click', openSidebar);
closeBtn.addEventListener('click', closeSidebar);
window.addEventListener('beforeunload', closeSidebar);
window.addEventListener('load', () => {
    loadUsers(true, 'Bolsa Permanência'); // Carrega usuários com status verdadeiro e programa específico
});

// Função para formatar a data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR'); // Formato brasileiro (dd/mm/yyyy)
}

// Função para adicionar a linha na tabela após salvar o usuário
function addRowToTable(usuario) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${usuario.nome}</td>
        <td>${usuario.cpf}</td>
        <td>${formatDate(usuario.data_inicio)}</td>
          <td>
            <button class="deleteBtn" data-id="${usuario._id}">Excluir</button>
        </td>
    `;
    cadastroList.appendChild(row);
    const deleteBtn = row.querySelector('.deleteBtn');
    deleteBtn.addEventListener('click', async () => {
        const confirmDelete = confirm('Tem certeza que deseja excluir este usuário?');
        if (confirmDelete) {
            await deleteUser(usuario._id);
            row.querySelector('td:last-child').innerHTML = "Excluído"; // Altera o texto da linha
            deleteBtn.disabled = true; // Desabilita o botão de exclusão
        }
    });

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
            // Preenche a tabela com os dados dos usuários
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
        } else {
            console.error('Erro ao recuperar usuários:', response.statusText);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

async function deleteUser(userId) {
    const dataSaida = new Date().toISOString(); // Pega a data atual
    try {
        const response = await fetch(`http://localhost:3000/usuarios/${userId}`, {
            method: 'PATCH', // Use PATCH para atualizar
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: false }) // Define o status como false
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir usuário');
        }

        console.log(`Usuário ${userId} marcado como excluído.`);
    } catch (error) {
        console.error('Erro na requisição de exclusão:', error);
    }
}


