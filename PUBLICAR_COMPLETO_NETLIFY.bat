@echo off
setlocal
cd /d "%~dp0"
title SuplementaAI - Publicar site completo

echo ============================================================
echo   SUPLEMENTAAI - PUBLICAR DIST + NETLIFY FUNCTIONS
echo ============================================================
echo.

if not exist "dist\index.html" (
  echo ERRO: a pasta dist ainda nao existe.
  echo Rode primeiro npm run build e tente novamente.
  echo.
  pause
  exit /b 1
)

where netlify >nul 2>nul
if errorlevel 1 (
  echo Netlify CLI ainda nao esta instalada neste computador.
  echo Instalando automaticamente. Isso acontece somente na primeira vez...
  echo.
  call npm install -g netlify-cli
  if errorlevel 1 goto :erro
)

echo.
echo Verificando login do Netlify...
call netlify status
if errorlevel 1 (
  echo.
  echo Abrindo login do Netlify no navegador...
  call netlify login
  if errorlevel 1 goto :erro
)

if not exist ".netlify\state.json" (
  echo.
  echo Esta pasta ainda nao esta vinculada a um site.
  echo Quando abrir a lista, escolha o site suplementaisistema.
  call netlify link
  if errorlevel 1 goto :erro
)

echo.
echo Publicando o site e as Functions. Nao feche esta janela...
call netlify deploy --prod --dir=dist --functions=netlify/functions
if errorlevel 1 goto :erro

echo.
echo ============================================================
echo   PUBLICACAO CONCLUIDA
echo ============================================================
echo.
echo Frenet: https://suplementaisistema.netlify.app/.netlify/functions/frenet
echo.
pause
exit /b 0

:erro
echo.
echo A PUBLICACAO NAO FOI CONCLUIDA.
echo A mensagem logo acima informa o motivo.
echo.
pause
exit /b 1
