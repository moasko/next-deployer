@echo off
REM Universal Next.js Deployment CLI for Windows

setlocal

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    exit /b 1
)

REM Get the command
set COMMAND=%1

REM If no command provided, show help
if "%COMMAND%"=="" (
    node %~dp0\cli.js help
    exit /b 0
)

REM Execute the command
if "%COMMAND%"=="init" (
    node %~dp0\cli.js init %2
) else if "%COMMAND%"=="generate" (
    if "%2"=="" (
        echo [ERROR] Please specify a configuration file
        exit /b 1
    )
    node %~dp0\cli.js generate %2
) else if "%COMMAND%"=="deploy" (
    if "%2"=="" (
        echo [ERROR] Please specify a configuration file
        exit /b 1
    )
    node %~dp0\cli.js deploy %2
) else if "%COMMAND%"=="help" (
    node %~dp0\cli.js help
) else (
    echo [ERROR] Unknown command: %COMMAND%
    echo.
    node %~dp0\cli.js help
    exit /b 1
)

endlocal