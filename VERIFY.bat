@echo off
setlocal
cd /d "%~dp0"
echo.
echo ==========================================
echo       Shoply v1.4 Verification
echo ==========================================
echo.

if not exist "node_modules\next\package.json" goto missing
if not exist "node_modules\.bin\next.cmd" goto missing
if not exist "node_modules\typescript\bin\tsc" goto missing
if not exist "node_modules\nodemailer\package.json" goto missing

node scripts\verify.mjs
set RESULT=%ERRORLEVEL%
echo.
if "%RESULT%"=="0" (
  echo Automated checks passed.
  echo Open TESTING-CHECKLIST.md for the browser tests.
) else (
  echo Verification found a problem. Read the FAIL lines above.
)
echo.
pause
exit /b %RESULT%

:missing
echo [Shoply] Complete-package dependencies are missing.
echo Re-extract the v1.4 COMPLETE ZIP into a fresh folder.
echo No npm install should be required.
echo.
pause
exit /b 1
