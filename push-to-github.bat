@echo off
echo ========================================================
echo Pushing Leeana Admin Dashboard to GitHub Pages
echo Remote: https://github.com/tanishch25/leeana-admin.git
echo ========================================================
cd /d "%~dp0"
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [NOTE] If the repository does not exist yet on GitHub:
    echo 1. Open https://github.com/new
    echo 2. Repository name: leeana-admin
    echo 3. Keep it Public and click "Create repository" (leave it empty)
    echo 4. Run this script again!
    echo.
) else (
    echo.
    echo [SUCCESS] Leeana Admin has been pushed to GitHub!
    echo Enable GitHub Pages in repo Settings -> Pages -> Build and deployment -> Source: GitHub Actions.
    echo Your dashboard will be live at: https://tanishch25.github.io/leeana-admin/
    echo.
)
pause
