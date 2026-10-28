# 자취생 전용 정보공유방 — React

자취생의 요리·식비, 생활비 절약, 청소·정리, 자취방 관리 정보를 공유하는 화면입니다. 로그인과 Bearer 토큰 전송, 본인 글 버튼, 오류별 안내를 구현했습니다.

FastAPI를 127.0.0.1:8000에서 실행한 뒤 이 폴더에서 실행하세요.

```powershell
npm.cmd ci
npm.cmd run dev
```

개발 주소: http://127.0.0.1:5173

최종 빌드 확인:

```powershell
npm.cmd run build
npm.cmd run preview
```

최종 주소: http://127.0.0.1:4173 . `/api`는 Vite가 8000번 백엔드로 전달합니다. 토큰은 메모리에만 저장되며 새로고침하면 로그인 상태가 해제됩니다. preview 화면에 코드 변경을 반영하려면 재빌드하세요. 종료는 Ctrl+C입니다.

전체 환경설정과 검사 방법은 [루트 README](../README.md)를 확인하세요.
