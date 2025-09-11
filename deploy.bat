@echo off
cls
color 0A

:: Muda para o diretório do projeto (onde o .bat está)
cd /d "%~dp0"

echo ===================================
echo    Deploy Automatico - MR Drones
echo ===================================
echo.

:: Verifica se o Git está instalado
echo Verificando instalacao do Git...
where git >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo ERRO: Git nao encontrado! Por favor, instale o Git primeiro.
    pause
    exit /b
)

:: Verifica se é um repositório Git e inicializa se necessário
if not exist .git (
    echo Inicializando repositorio Git...
    git init
    git remote add origin https://github.com/richardspanhol/mr_drones.git
)

:: Configura diretório como seguro
echo.
echo Configurando diretorio como seguro...
git config --global --add safe.directory "%CD%"

:: Verificar se existe arquivo de configuração
if not exist config.env (
    echo.
    echo AVISO: Arquivo config.env nao encontrado!
    echo Criando config.env baseado no exemplo...
    copy config.env.example config.env
    echo.
    echo IMPORTANTE: Configure as variaveis no arquivo config.env antes do proximo deploy!
    echo Especialmente a MONGODB_URI para producao.
    echo.
    pause
)

:: Verifica e mostra alterações
echo.
echo Verificando alteracoes...
git status

:: Adiciona todas as alterações ao Git
git add .

:: Commit com data/hora
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set datetime=%datetime:~0,8%-%datetime:~8,6%
git commit -m "Deploy automatico %datetime% - PWA + MongoDB Atlas"

:: Push para o GitHub
echo.
echo Enviando para o GitHub...
git push origin main

:: Verificar se o push foi bem-sucedido
if %errorlevel% equ 0 (
    color 0A
    echo.
    echo ===================================
    echo    Deploy concluido com sucesso!
    echo ===================================
    echo.
    echo O site sera atualizado em alguns minutos.
    echo GitHub Pages: https://richardspanhol.github.io/mr_drones/
    echo.
    echo RECURSOS IMPLEMENTADOS:
    echo - PWA com prompt de instalacao
    echo - Configuracao de ambiente (Firebase/MongoDB)
    echo - Service Worker melhorado
    echo - Manifest.json otimizado
    echo.
    echo PROXIMOS PASSOS:
    echo 1. Configure MongoDB Atlas para producao
    echo 2. Teste a instalacao PWA no Android
    echo 3. Verifique o funcionamento offline
    echo.
) else (
    color 0C
    echo.
    echo ===================================
    echo    ERRO no Deploy!
    echo ===================================
    echo.
    echo Verifique sua conexao com a internet
    echo e suas credenciais do GitHub.
    echo.
)

echo Pressione qualquer tecla para sair...
pause > nul 