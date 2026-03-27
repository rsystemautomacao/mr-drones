// Criar namespace para nossas funções utilitárias
window.MRDrones = window.MRDrones || {};

// Função para expandir/colapsar
window.MRDrones.toggleExpansivel = function(header) {
    if (!header) {
        console.error('Header element não encontrado');
        return;
    }
    
    const content = header.nextElementSibling;
    const icon = header.querySelector('i.fas');
    
    if (!content || !icon) {
        console.error('Elementos necessários não encontrados', { content, icon });
        return;
    }
    
    const isHidden = content.style.display === 'none' || !content.style.display;
    content.style.display = isHidden ? 'block' : 'none';
    icon.classList.toggle('fa-chevron-down', !isHidden);
    icon.classList.toggle('fa-chevron-up', isHidden);
};

// Outras funções utilitárias
window.MRDrones.formatarData = function(data) {
    if (!data) return 'Não definida';
    try {
        if (data.toDate) { // Timestamp do Firestore
            data = data.toDate();
        } else if (typeof data === 'string') {
            data = new Date(data);
        }
        return data.toLocaleDateString('pt-BR');
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return 'Data inválida';
    }
};

window.MRDrones.formatarMoeda = function(valor) {
    if (!valor) return '0,00';
    try {
        return new Intl.NumberFormat('pt-BR', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(valor);
    } catch (error) {
        console.error('Erro ao formatar moeda:', error);
        return '0,00';
    }
};

// Função para sanitizar strings antes de inserir no DOM (previne XSS)
window.MRDrones.escapeHtml = function(str) {
    if (str === null || str === undefined) return '';
    const text = String(str);
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
};

// Toast notification global
window.MRDrones.showToast = function(message, type = 'default') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = 'background:#2ecc71;color:white;padding:15px 20px;border-radius:5px;margin:5px 0;box-shadow:0 2px 10px rgba(0,0,0,0.2);animation:slideIn 0.3s ease-out;';

    if (type === 'loading') {
        toast.innerHTML = `<div style="display:flex;align-items:center;gap:10px;"><div style="width:20px;height:20px;border:2px solid #fff;border-top:2px solid transparent;border-radius:50%;animation:spin 1s linear infinite;"></div><span>${escapeHtml(message)}</span></div>`;
    } else if (type === 'success') {
        toast.innerHTML = `<div style="display:flex;align-items:center;gap:10px;"><span>\u2705</span><span>${escapeHtml(message)}</span></div>`;
    } else if (type === 'error') {
        toast.style.background = '#f44336';
        toast.innerHTML = `<div style="display:flex;align-items:center;gap:10px;"><span>\u274C</span><span>${escapeHtml(message)}</span></div>`;
    } else {
        toast.textContent = message;
    }

    container.appendChild(toast);

    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = '@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
        document.head.appendChild(style);
    }

    if (type !== 'loading') {
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (container.contains(toast)) container.removeChild(toast);
                if (container.children.length === 0 && document.body.contains(container)) document.body.removeChild(container);
            }, 300);
        }, 2000);
    }

    return toast;
};

// Criar aliases para compatibilidade
window.toggleExpansivel = window.MRDrones.toggleExpansivel;
window.formatarData = window.MRDrones.formatarData;
window.formatarMoeda = window.MRDrones.formatarMoeda;
window.escapeHtml = window.MRDrones.escapeHtml;
window.showToast = window.MRDrones.showToast;

// Verificar se as funções foram carregadas corretamente
console.log('Utils carregado:', {
    toggleExpansivel: !!window.toggleExpansivel,
    formatarData: !!window.formatarData,
    formatarMoeda: !!window.formatarMoeda
}); 