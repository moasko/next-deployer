@echo off
REM CI/CD Demo Script for Universal Next.js Deployment System

echo === Universal Next.js Deployment System - CI/CD Demo ===

REM Check if we're in the right directory
if not exist "cli.js" (
  echo Error: This script must be run from the project root directory
  exit /b 1
)

echo 1. Checking CI environment status...
node cli.js ci-status

echo.
echo 2. Validating example configuration...
node cli.js ci-validate example.config.json

echo.
echo 3. Running dry-run deployment...
node cli.js generate example.config.json --dry-run

echo.
echo 4. Checking generated files...
if exist "generated" (
  echo Generated files:
  dir generated\
) else (
  echo No generated directory found
)

echo.
echo 5. Running comprehensive tests...
npm test

echo.
echo === CI/CD Demo Completed ===