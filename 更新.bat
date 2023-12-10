@echo off
setlocal enabledelayedexpansion
chcp 65001
echo 正在提交修改...
set /P COMMIT_MSG=请输入提交信息：
chcp 65001 >nul
git add .
git commit -m "%COMMIT_MSG%"

echo 正在推送到Gitee...
git push origin master --progress > push.tmp

echo.
echo 推送进度：
for /F "tokens=1,2,3,4" %%a in ('type push.tmp ^| findstr /i "objects") do (
    set percentage=%%b
    set transferred=%%c
    set total=%%d
)

set /A progress=percentage * 50 / 100

echo [                                              ]
echo [**************************************************]

for /L %%i in (1,1,%progress%) do (
    call :print_char
)

echo.

del push.tmp
echo 完成
endlocal
exit /b

:print_char
set /p "=" < nul
exit /b