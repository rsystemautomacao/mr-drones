@echo off
cls
color 0A

echo ===================================
echo    SETUP COMPLETO - MR Drones
echo ===================================
echo.

:: Muda para o diretório do projeto
cd /d "%~dp0"

echo 🚀 Iniciando setup completo do projeto...
echo.

:: 1. Verificar se o Git está instalado
echo 📋 Verificando Git...
where git >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo ❌ ERRO: Git não encontrado!
    echo Por favor, instale o Git primeiro.
    pause
    exit /b
)
echo ✅ Git encontrado!

:: 2. Verificar se é um repositório Git
if not exist .git (
    echo 📋 Inicializando repositório Git...
    git init
    git remote add origin https://github.com/rsystemautomacao/mr-drones.git
    echo ✅ Repositório Git inicializado!
) else (
    echo ✅ Repositório Git já existe!
)

:: 3. Configurar remote
echo 📋 Configurando remote do GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/rsystemautomacao/mr-drones.git
echo ✅ Remote configurado!

:: 4. Adicionar todos os arquivos
echo 📋 Adicionando arquivos ao Git...
git add .
echo ✅ Arquivos adicionados!

:: 5. Commit
echo 📋 Fazendo commit...
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set datetime=%datetime:~0,8%-%datetime:~8,6%
git commit -m "Setup completo - PWA + MongoDB Atlas + Vercel - %datetime%"
echo ✅ Commit realizado!

:: 6. Push para GitHub
echo 📋 Enviando para GitHub...
git push -u origin main
echo ✅ Push realizado!

:: 7. Verificar se o push foi bem-sucedido
if %errorlevel% equ 0 (
    color 0A
    echo.
    echo ===================================
    echo    SETUP CONCLUÍDO COM SUCESSO!
    echo ===================================
    echo.
    echo 🎉 Todos os arquivos foram enviados para o GitHub!
    echo.
    echo 📋 PRÓXIMOS PASSOS:
    echo.
    echo 1. 🗄️  MONGODB ATLAS:
    echo    - Abra o MongoDB Compass
    echo    - Conecte ao seu cluster
    echo    - Execute o script: mongodb-setup.js
    echo    - Execute o teste: test-connection.js
    echo.
    echo 2. ⚡ VERCEL:
    echo    - Acesse: https://vercel.com
    echo    - Importe o projeto: rsystemautomacao/mr-drones
    echo    - Configure as variáveis: vercel-env-setup.md
    echo    - Faça o deploy
    echo.
    echo 3. 🧪 TESTE:
    echo    - Acesse: https://mr-drones.vercel.app
    echo    - Teste o PWA no celular
    echo    - Verifique se funciona offline
    echo.
    echo 📁 ARQUIVOS CRIADOS:
    echo    ✅ mongodb-setup.js - Script de configuração do MongoDB
    echo    ✅ test-connection.js - Teste de conexão
    echo    ✅ vercel-env-setup.md - Configuração do Vercel
    echo    ✅ vercel.json - Configuração do Vercel
    echo    ✅ deploy-vercel.bat - Script de deploy
    echo.
    echo 🔗 LINKS ÚTEIS:
    echo    - GitHub: https://github.com/rsystemautomacao/mr-drones
    echo    - Vercel: https://vercel.com/dashboard
    echo    - MongoDB: https://cloud.mongodb.com/
    echo.
) else (
    color 0C
    echo.
    echo ===================================
    echo    ERRO NO SETUP!
    echo ===================================
    echo.
    echo ❌ Verifique sua conexão com a internet
    echo ❌ Confirme suas credenciais do GitHub
    echo ❌ Certifique-se de que o repositório existe
    echo.
)

echo.
echo Pressione qualquer tecla para sair...
pause > nul
