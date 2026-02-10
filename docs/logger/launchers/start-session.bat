@echo off
REM Persistent Session Logger (Windows Batch)
REM Starts a logged shell session that captures everything
REM Usage: start-session.bat

node "%~dp0..\src\session-logger.js"
