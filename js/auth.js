// Auth.js Corrigido - MR Drones
console.log('Inicializando sistema de autenticação...');

// Aguardar inicialização do Database
document.addEventListener('DOMContentLoaded', async () => {
    // Aguardar um pouco para garantir que o Database foi inicializado
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('Auth.js carregado');
    
    // Verificar estado da autenticação
    if (window.AppConfig && window.AppConfig.getDatabaseConfig() === 'firebase') {
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
            if (window.Database) {
                const user = await window.Database.getCurrentUser();
                const currentPath = window.location.pathname;
                const isLoginPage = currentPath.includes('login.html');
                
                if (!user && !isLoginPage) {
                    window.location.href = 'login.html';
                } else if (user && isLoginPage) {
                    window.location.href = 'home.html';
                }
            }
        };
        
        checkAuth();
    }

    // Formulário de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('Formulário de login encontrado');
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('error-message');
            const submitButton = loginForm.querySelector('button[type="submit"]');
            
            console.log('Tentando login com:', email);
            
            try {
                // Desabilitar botão e mostrar loading
                submitButton.disabled = true;
                submitButton.textContent = 'Conectando...';
                
                // Limpar mensagem de erro anterior
                if (errorMessage) {
                    errorMessage.textContent = '';
                }
                
                // Tentar login direto com Firebase se Database não estiver disponível
                let result;
                if (window.Database) {
                    result = await window.Database.signIn(email, password);
                } else {
                    // Fallback para Firebase direto
                    result = await firebase.auth().signInWithEmailAndPassword(email, password);
                }
                
                console.log('Login realizado com sucesso:', result);
                
                // Mostrar sucesso
                submitButton.textContent = 'Sucesso!';
                submitButton.style.background = '#28a745';
                
                // Redirecionar após um pequeno delay
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1000);
                
            } catch (error) {
                console.error('Erro no login:', error);
                
                // Reabilitar botão
                submitButton.disabled = false;
                submitButton.textContent = 'Entrar';
                submitButton.style.background = '';
                
                // Mostrar erro
                let errorText = 'Email ou senha inválidos';
                
                if (error.code === 'auth/user-not-found') {
                    errorText = 'Usuário não encontrado';
                } else if (error.code === 'auth/wrong-password') {
                    errorText = 'Senha incorreta';
                } else if (error.code === 'auth/invalid-email') {
                    errorText = 'Email inválido';
                } else if (error.code === 'auth/too-many-requests') {
                    errorText = 'Muitas tentativas. Tente novamente mais tarde';
                }
                
                if (errorMessage) {
                    errorMessage.textContent = errorText;
                }
                
                console.log('Erro exibido:', errorText);
            }
        });
    } else {
        console.log('Formulário de login não encontrado');
    }
});

// Função de logout
window.logout = async () => {
    // Mostrar confirmação antes de sair
    if (confirm('Tem certeza que deseja sair do sistema?')) {
        try {
            // Mostrar toast de loading
            const loadingToast = showToast('Finalizando sessão...', 'loading');
            
            if (window.Database) {
                await window.Database.signOut();
            } else {
                await firebase.auth().signOut();
            }
            
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

// showToast é carregado via utils.js (window.showToast)
