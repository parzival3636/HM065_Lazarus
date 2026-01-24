@echo off
echo ========================================
echo Installing OpenCLIP Dependencies
echo ========================================
echo.

echo Installing open-clip-torch...
pip install open-clip-torch

echo.
echo Installing Pillow...
pip install Pillow

echo.
echo Installing torchvision...
pip install torchvision

echo.
echo Installing ftfy...
pip install ftfy

echo.
echo Installing wcwidth...
pip install wcwidth

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo You can now use the Figma verification feature.
echo Restart the Django server if it's running.
echo.
pause
