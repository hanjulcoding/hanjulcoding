@echo off
REM Astro Editor로 글 쓴 뒤 더블클릭하면 커밋+배포되는 스크립트 (Windows).
REM git 프로그램이나 명령어 타이핑 없이 더블클릭만 하면 됨.
chcp 65001 >nul
setlocal
cd /d "%~dp0"

REM git 설치 확인
where git >nul 2>&1
if errorlevel 1 (
  echo git이 설치되어 있지 않아요. Git for Windows를 설치해줘.
  pause
  exit /b 1
)

REM 저장소인지 확인
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo git 저장소가 아니에요. publish.bat을 프로젝트 폴더 안에 둬야 해요.
  pause
  exit /b 1
)

REM 변경사항 없으면 종료
set "CHANGES="
for /f "delims=" %%i in ('git status --porcelain') do set "CHANGES=1"
if not defined CHANGES (
  echo 커밋할 변경 내용이 없어요. Astro Editor에서 글을 저장했는지 확인해줘.
  pause
  exit /b 0
)

REM 기본 커밋 메시지 (날짜/시간). 로케일 무관하게 한 줄 powershell로 생성
for /f "delims=" %%t in ('powershell -NoProfile -Command "Get-Date -Format \"yyyy-MM-dd HH:mm\""') do set "TS=%%t"
set "DEFAULT_MSG=docs: update %TS%"

REM 입력 (Enter만 누르면 기본값 사용, 또는 새로 입력해서 수정)
echo 기본 메시지: %DEFAULT_MSG%
set "MSG="
set /p "MSG=커밋 메시지 (Enter=기본값 사용): "
if not defined MSG set "MSG=%DEFAULT_MSG%"

REM 배포 트리거(docs: 접두어)가 없으면 붙여줌
echo %MSG%| findstr /b /c:"docs:" >nul
if errorlevel 1 set "MSG=docs: %MSG%"

REM 스테이징 + 커밋 (post-commit 훅이 release로 머지 후 origin push)
git add -A
git commit -m "%MSG%"
if errorlevel 1 (
  echo 커밋 실패. 변경사항을 확인해줘.
  pause
  exit /b 1
)

REM push 결과 확인 (훅이 origin push까지 수행)
set "AHEAD="
for /f "delims=" %%a in ('git status -sb ^| findstr /c:"[ahead"') do set "AHEAD=1"
if defined AHEAD (
  echo 커밋은 됐지만 push가 안 됐어요. 인터넷 연결을 확인하고 잠시 후 다시 시도해줘.
) else (
  echo.
  echo 배포 완료! "%MSG%" - 사이트 업데이트가 진행돼요.
)
pause
endlocal
