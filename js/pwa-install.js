// PWA Install Manager - MR Drones
class PWAInstallManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    init() {
        // Verificar se já está instalado
        this.checkIfInstalled();
        
        // Escutar evento de beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('PWA: beforeinstallprompt disparado');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Escutar evento de appinstalled
        window.addEventListener('appinstalled', () => {
            console.log('PWA: App instalado com sucesso');
            this.isInstalled = true;
            this.hideInstallButton();
            this.showInstallSuccessMessage();
        });

        // Verificar se está rodando como PWA
        this.checkDisplayMode();
    }

    checkIfInstalled() {
        // Verificar se está rodando em modo standalone
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('PWA: App já está instalado');
            return;
        }

        // Verificar se está rodando no iOS
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('PWA: App instalado no iOS');
            return;
        }
    }

    checkDisplayMode() {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator.standalone);

        if (isStandalone || (isIOS && isInStandaloneMode)) {
            this.isInstalled = true;
            console.log('PWA: Rodando em modo standalone');
        }
    }

    showInstallButton() {
        if (this.isInstalled) return;

        // Criar botão de instalação
        const installButton = document.createElement('button');
        installButton.id = 'pwa-install-button';
        installButton.className = 'pwa-install-button';
        installButton.innerHTML = `
            <i class="fas fa-download"></i>
            <span>Instalar App</span>
        `;

        // Adicionar estilos
        installButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #2ecc71, #27ae60);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 12px 20px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
            cursor: pointer;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            animation: slideInUp 0.5s ease-out;
        `;

        // Adicionar hover effect
        installButton.addEventListener('mouseenter', () => {
            installButton.style.transform = 'translateY(-2px)';
            installButton.style.boxShadow = '0 6px 20px rgba(46, 204, 113, 0.4)';
        });

        installButton.addEventListener('mouseleave', () => {
            installButton.style.transform = 'translateY(0)';
            installButton.style.boxShadow = '0 4px 15px rgba(46, 204, 113, 0.3)';
        });

        // Adicionar evento de clique
        installButton.addEventListener('click', () => {
            this.installApp();
        });

        // Adicionar ao DOM
        document.body.appendChild(installButton);

        // Adicionar CSS para animação
        this.addInstallButtonStyles();
    }

    addInstallButtonStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInUp {
                from {
                    transform: translateY(100px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            @keyframes slideOutDown {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(100px);
                    opacity: 0;
                }
            }

            .pwa-install-button {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .pwa-install-button i {
                font-size: 16px;
            }

            @media (max-width: 768px) {
                .pwa-install-button {
                    bottom: 80px;
                    right: 15px;
                    padding: 10px 16px;
                    font-size: 13px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    hideInstallButton() {
        const installButton = document.getElementById('pwa-install-button');
        if (installButton) {
            installButton.style.animation = 'slideOutDown 0.3s ease-out forwards';
            setTimeout(() => {
                installButton.remove();
            }, 300);
        }
    }

    async installApp() {
        if (!this.deferredPrompt) {
            // Fallback para iOS
            this.showIOSInstallInstructions();
            return;
        }

        try {
            // Mostrar prompt de instalação
            this.deferredPrompt.prompt();
            
            // Aguardar resposta do usuário
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`PWA: Usuário ${outcome === 'accepted' ? 'aceitou' : 'rejeitou'} a instalação`);
            
            // Limpar o prompt
            this.deferredPrompt = null;
            
            if (outcome === 'accepted') {
                this.hideInstallButton();
            }
        } catch (error) {
            console.error('PWA: Erro ao instalar app:', error);
        }
    }

    showIOSInstallInstructions() {
        // Verificar se é iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (!isIOS) return;

        // Criar modal com instruções
        const modal = document.createElement('div');
        modal.className = 'pwa-install-modal';
        modal.innerHTML = `
            <div class="pwa-install-modal-content">
                <div class="pwa-install-modal-header">
                    <h3>Instalar MR Drones</h3>
                    <button class="pwa-install-modal-close">&times;</button>
                </div>
                <div class="pwa-install-modal-body">
                    <p>Para instalar o app no seu iPhone/iPad:</p>
                    <ol>
                        <li>Toque no botão <strong>Compartilhar</strong> <i class="fas fa-share"></i> na parte inferior da tela</li>
                        <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></li>
                        <li>Toque em <strong>"Adicionar"</strong> no canto superior direito</li>
                    </ol>
                    <div class="pwa-install-modal-icon">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                </div>
            </div>
        `;

        // Adicionar estilos do modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        `;

        const content = modal.querySelector('.pwa-install-modal-content');
        content.style.cssText = `
            background: white;
            border-radius: 15px;
            padding: 0;
            max-width: 400px;
            width: 90%;
            max-height: 80vh;
            overflow: hidden;
            animation: slideInUp 0.3s ease-out;
        `;

        const header = modal.querySelector('.pwa-install-modal-header');
        header.style.cssText = `
            background: linear-gradient(135deg, #2ecc71, #27ae60);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const body = modal.querySelector('.pwa-install-modal-body');
        body.style.cssText = `
            padding: 20px;
            text-align: left;
        `;

        const icon = modal.querySelector('.pwa-install-modal-icon');
        icon.style.cssText = `
            text-align: center;
            margin-top: 20px;
            font-size: 48px;
            color: #2ecc71;
        `;

        const closeButton = modal.querySelector('.pwa-install-modal-close');
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Adicionar eventos
        closeButton.addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Adicionar CSS para animações
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Adicionar ao DOM
        document.body.appendChild(modal);
    }

    showInstallSuccessMessage() {
        // Mostrar toast de sucesso
        if (window.showToast) {
            window.showToast('App instalado com sucesso!', 'success');
        }
    }

    // Método público para verificar se pode instalar
    canInstall() {
        return !this.isInstalled && this.deferredPrompt !== null;
    }

    // Método público para forçar mostrar o botão (útil para testes)
    forceShowInstallButton() {
        this.isInstalled = false;
        this.showInstallButton();
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.PWAInstallManager = new PWAInstallManager();
});

// Exportar para uso global
window.PWAInstallManager = window.PWAInstallManager;
