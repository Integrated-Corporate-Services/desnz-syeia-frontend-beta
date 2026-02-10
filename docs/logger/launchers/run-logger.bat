@echo off
REM Command Wrapper Logger
REM Wraps a single command and logs its output
REM Usage: run-logger <command> [args...]

node "%~dp0..\src\terminal-logger.js" %*
