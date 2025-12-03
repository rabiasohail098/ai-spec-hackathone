
# PowerShell script to set up the project structure
# Creates the required folders and empty files for the RAG backend and spec engine

Write-Host "Setting up project structure..." -ForegroundColor Green

# Create rag-backend folder
Write-Host "Creating rag-backend folder..." -ForegroundColor Yellow
New-Item -ItemType Directory -Name "rag-backend" -Force

# Create spec-engine folder
Write-Host "Creating spec-engine folder..." -ForegroundColor Yellow
New-Item -ItemType Directory -Name "spec-engine" -Force

# Create empty files
Write-Host "Creating empty files..." -ForegroundColor Yellow

# Create rag-backend/main.py
$mainPyPath = Join-Path -Path "rag-backend" -ChildPath "main.py"
Write-Host "Creating $mainPyPath..." -ForegroundColor Cyan
New-Item -ItemType File -Path $mainPyPath -Force

# Create rag-backend/requirements.txt
$requirementsPath = Join-Path -Path "rag-backend" -ChildPath "requirements.txt"
Write-Host "Creating $requirementsPath..." -ForegroundColor Cyan
New-Item -ItemType File -Path $requirementsPath -Force

# Create spec-engine/index.ts
$indexPath = Join-Path -Path "spec-engine" -ChildPath "index.ts"
Write-Host "Creating $indexPath..." -ForegroundColor Cyan
New-Item -ItemType File -Path $indexPath -Force

Write-Host "Project structure setup complete!" -ForegroundColor Green
Write-Host "Folders created: rag-backend, spec-engine" -ForegroundColor White
Write-Host "Files created: rag-backend/main.py, rag-backend/requirements.txt, spec-engine/index.ts" -ForegroundColor White
