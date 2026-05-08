@echo off
echo ==============================================
echo Pushing CodeMind AI to GitHub...
echo ==============================================

echo [1/4] Fixing backend internal git repo...
if exist "backend\.git" (
    rmdir /S /Q "backend\.git"
)

echo [2/4] Adding all files...
git add .

echo [3/4] Committing code...
git commit -m "feat(ui): complete futuristic SaaS UI overhaul with 3D tilt feature cards, AI static analysis, and glassmorphism"

echo [4/4] Pushing to deepak00singh/CodeMind_AI...
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/deepak00singh/CodeMind_AI.git
git push -u origin main

echo ==============================================
echo DONE! Check your GitHub repository.
echo ==============================================
pause
