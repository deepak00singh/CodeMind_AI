@echo off
echo ============================================
echo   CodeMind AI - Pushing to GitHub
echo ============================================
echo.

cd /d "c:\Users\NITRO V\OneDrive\Documents\Desktop\CodeMind_AI"

echo [1/4] Checking git status...
git status
echo.

echo [2/4] Staging all files...
git add .
echo.

echo [3/4] Committing changes...
git commit -m "Update CodeMind AI project - %date% %time%"
echo.

echo [4/4] Pushing to GitHub...
git branch -M main
git push -u origin main
echo.

echo ============================================
echo   Done! Check your GitHub repo:
echo   https://github.com/deepak00singh/CodeMind_AI
echo ============================================
pause
