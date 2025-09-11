// No início do arquivo
console.log('Inicializando sistema de autenticação...');

// Aguardar inicialização do Database
document.addEventListener('DOMContentLoaded', async () => {
    // Aguardar um pouco para garantir que o Database foi inicializado
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!window.Database) {
        console.error('Database não foi inicializado');
        return;
    }

    console.log('Auth.js carregado');
    
    // Verificar estado da autenticação
    if (window.AppConfig.getDatabaseConfig() === 'firebase') {
        firebase.auth().onAuthStateChanged((user) => {
            console.log('Estado de autenticação:', user ? 'Logado' : 'Não logado');
            
            const currentPath = window.location.pathname;
            const isLoginPage = currentPath.includes('login.html');
            
            if (!user && !isLoginPage) {
                window.location.href = 'login.html';
            } else if (user && isLoginPage) {
                window.location.href = 'home.html';
            }
        });
    } else {
        // Para MongoDB, verificar token local
        const checkAuth = async () => {
            const user = await window.Database.getCurrentUser();
            const currentPath = window.location.pathname;
            const isLoginPage = currentPath.includes('login.html');
            
            if (!user && !isLoginPage) {
                window.location.href = 'login.html';
            } else if (user && isLoginPage) {
                window.location.href = 'home.html';
            }
        };
        
        checkAuth();
    }

    // Formulário de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('error-message');
            const submitButton = loginForm.querySelector('button[type="submit"]');
            
            try {
                // Desabilitar botão e mostrar loading
                submitButton.disabled = true;
                const loadingToast = showToast('Conectando...', 'loading');
                
                await window.Database.signIn(email, password);
                
                // Remover toast de loading e mostrar sucesso
                loadingToast.remove();
                showToast('Login realizado com sucesso!', 'success');
                
                // Redirecionar após um pequeno delay
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1000);
                
            } catch (error) {
                console.error('Erro no login:', error);
                errorMessage.textContent = 'Email ou senha inválidos';
                submitButton.disabled = false;
                
                // Remover loading e mostrar erro
                document.querySelector('.toast')?.remove();
            }
        });
    }
});

// Função de logout
window.logout = async () => {
    // Mostrar confirmação antes de sair
    if (confirm('Tem certeza que deseja sair do sistema?')) {
        try {
            // Mostrar toast de loading
            const loadingToast = showToast('Finalizando sessão...', 'loading');
            
            await window.Database.signOut();
            
            // Remover toast de loading e mostrar sucesso
            loadingToast.remove();
            showToast('Sessão finalizada com sucesso!', 'success');
            
            // Redirecionar após um pequeno delay
            setTimeout(() => {
                // Verificar se estamos em uma subpasta
                const currentPath = window.location.pathname;
                const loginPath = currentPath.includes('/pages/') ? '../login.html' : 'login.html';
                window.location.href = loginPath;
            }, 1000);
            
        } catch (error) {
            console.error('Erro no logout:', error);
            // Remover loading e mostrar erro
            document.querySelector('.toast')?.remove();
            showToast('Erro ao finalizar sessão', 'error');
        }
    }
};

// Fechar o DOMContentLoaded
});

// Adicionar função para mostrar toast
function showToast(message, type = 'default') {
    // Criar container se não existir
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Criar toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Conteúdo baseado no tipo
    if (type === 'loading') {
        toast.innerHTML = `
            <div class="spinner"></div>
            <span>${message}</span>
        `;
    } else if (type === 'success') {
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
    } else if (type === 'error') {
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        toast.style.background = '#f44336'; // Vermelho para erro
        toast.style.color = 'white';
    }

    // Adicionar ao container
    container.appendChild(toast);

    // Remover após delay (exceto se for loading)
    if (type !== 'loading') {
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                container.removeChild(toast);
                if (container.children.length === 0) {
                    document.body.removeChild(container);
                }
            }, 300);
        }, 2000);
    }

    return toast; // Retornar para poder remover depois
} 