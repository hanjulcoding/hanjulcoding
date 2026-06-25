#!/bin/sh
# Astro Editor로 글 쓴 뒤 더블클릭/실행하면 커밋+배포되는 스크립트 (macOS + Linux).
# git 프로그램이나 명령어 타이핑 없이 실행만 하면 됨.

# git 경로 보장 (GUI에서 실행 시 PATH가 비어있을 수 있음)
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

# 이 스크립트가 있는 폴더(=저장소 루트)로 이동
cd "$(dirname "$0")" || exit 1

# GUI 알림(있으면 GUI, 없으면 터미널 출력)
notify() {
  # $1: 본문, $2: 제목
  if command -v osascript >/dev/null 2>&1; then
    osascript -e "display dialog \"$1\" with title \"$2\" buttons {\"확인\"} default button \"확인\"" >/dev/null 2>&1
  elif command -v zenity >/dev/null 2>&1; then
    zenity --info --title="$2" --text="$1" >/dev/null 2>&1
  elif command -v kdialog >/dev/null 2>&1; then
    kdialog --title "$2" --msgbox "$1" >/dev/null 2>&1
  fi
  echo "[$2] $1"
}

# 저장소인지 확인
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  notify "git 저장소가 아니에요. publish.sh를 프로젝트 폴더 안에 둬야 해요." "오류"
  exit 1
fi

# 변경사항 없으면 종료
if [ -z "$(git status --porcelain)" ]; then
  notify "커밋할 변경 내용이 없어요. Astro Editor에서 글을 저장했는지 확인해줘." "변경사항 없음"
  exit 0
fi

# 기본 커밋 메시지 (수정 가능한 placeholder)
DEFAULT_MSG="docs: update $(date '+%Y-%m-%d %H:%M')"

# 입력창(있으면 GUI, 없으면 터미널). 취소 시 비어있는 값 반환
ask_message() {
  if command -v osascript >/dev/null 2>&1; then
    osascript <<EOF 2>/dev/null
set r to display dialog "커밋 메시지:" default answer "$DEFAULT_MSG" with title "글 배포하기" buttons {"취소", "배포"} default button "배포"
return text returned of r
EOF
  elif command -v zenity >/dev/null 2>&1; then
    zenity --entry --title="글 배포하기" --text="커밋 메시지:" --entry-text="$DEFAULT_MSG" 2>/dev/null
  elif command -v kdialog >/dev/null 2>&1; then
    kdialog --title "글 배포하기" --inputbox "커밋 메시지:" "$DEFAULT_MSG" 2>/dev/null
  else
    # GUI 없으면 터미널 입력 (Enter만 누르면 기본값 사용)
    printf '기본 메시지: %s\n' "$DEFAULT_MSG" > /dev/tty
    printf '커밋 메시지 (Enter=기본값 사용, 또는 새로 입력): ' > /dev/tty
    read reply < /dev/tty
    [ -z "$reply" ] && reply="$DEFAULT_MSG"
    printf '%s' "$reply"
  fi
}

MSG="$(ask_message)"
# 취소하거나 비우면 종료
[ -z "$MSG" ] && exit 0

# 배포 트리거(docs: 접두어)가 없으면 붙여줌
case "$MSG" in
  docs:*) ;;
  *) MSG="docs: $MSG" ;;
esac

# 스테이징 + 커밋 (post-commit 훅이 release로 머지 후 origin push)
git add -A
if git commit -m "$MSG"; then
  if [ -z "$(git status -sb | grep -E '\[ahead')" ]; then
    notify "$MSG

사이트 업데이트가 진행돼요." "배포 완료 ✅"
  else
    notify "인터넷 연결을 확인하고 잠시 후 다시 시도해줘." "커밋은 됐지만 push가 안 됐어요"
  fi
else
  notify "변경사항을 확인해줘." "커밋 실패"
fi
