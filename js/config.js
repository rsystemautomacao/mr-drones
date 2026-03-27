// Configuração de Ambiente - MR Drones
class AppConfig {
    constructor() {
        this.environment = this.detectEnvironment();
        this.config = this.loadConfig();
    }

    detectEnvironment() {
        // Detectar ambiente baseado na URL
        const hostname = window.location.hostname;
        
        if (hostname.includes('vercel.app')) {
            return 'production';
        } else if (hostname.includes('github.io')) {
            return 'staging';
        } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        } else if (hostname.includes('staging') || hostname.includes('test')) {
            return 'staging';
        } else {
            return 'production';
        }
    }

    loadConfig() {
        const configs = {
            development: {
                database: 'firebase',
                firebase: {
                    apiKey: "AIzaSyBzguzTg54A5KgOH_2-UtNMSiLzUwmWlnE",
                    authDomain: "mr-drones.firebaseapp.com",
                    projectId: "mr-drones",
                    storageBucket: "mr-drones.appspot.com",
                    messagingSenderId: "891587224313",
                    appId: "1:891587224313:web:3cad5fc9bdcde4d1293828"
                },
                mongodb: null,
                app: {
                    name: "MR Drones",
                    version: "1.0.0",
                    url: "http://localhost:3000"
                }
            },
            staging: {
                database: 'firebase',
                firebase: {
                    apiKey: "AIzaSyBzguzTg54A5KgOH_2-UtNMSiLzUwmWlnE",
                    authDomain: "mr-drones.firebaseapp.com",
                    projectId: "mr-drones",
                    storageBucket: "mr-drones.appspot.com",
                    messagingSenderId: "891587224313",
                    appId: "1:891587224313:web:3cad5fc9bdcde4d1293828"
                },
                mongodb: null,
                app: {
                    name: "MR Drones - Staging",
                    version: "1.0.0",
                    url: "https://richardspanhol.github.io/mr_drones/"
                }
            },
            production: {
                database: 'mongodb',
                firebase: null,
                mongodb: {
                    // Credenciais MongoDB devem ser configuradas via variáveis de ambiente no servidor (Vercel)
                    // A conexão ao MongoDB é feita pelo backend/API, nunca pelo cliente
                    database: "mr_drones"
                },
                app: {
                    name: "MR Drones",
                    version: "1.0.0",
                    url: "https://richardspanhol.github.io/mr_drones/"
                }
            }
        };

        return configs[this.environment] || configs.development;
    }

    getDatabaseConfig() {
        return this.config.database;
    }

    getFirebaseConfig() {
        return this.config.firebase;
    }

    getMongoDBConfig() {
        return this.config.mongodb;
    }

    getAppConfig() {
        return this.config.app;
    }

    isProduction() {
        return this.environment === 'production';
    }

    isDevelopment() {
        return this.environment === 'development';
    }

    isStaging() {
        return this.environment === 'staging';
    }

    getEnvironment() {
        return this.environment;
    }
}

// Criar instância global
window.AppConfig = new AppConfig();

// Silenciar console.log em produção (manter console.error e console.warn)
if (window.AppConfig.isProduction()) {
    const noop = () => {};
    console.log = noop;
    console.debug = noop;
    console.info = noop;
} else {
    console.log('Configuração carregada:', {
        environment: window.AppConfig.getEnvironment(),
        database: window.AppConfig.getDatabaseConfig(),
        app: window.AppConfig.getAppConfig()
    });
}
