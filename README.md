# 자취생 전용 정보공유방

혼자 사는 사람들이 집밥과 식비 절약, 청소·정리, 생활비 관리와 자취방 관리 경험을 공유하는 게시판입니다. 누구나 글을 읽을 수 있고, 로그인한 사용자는 글을 작성할 수 있습니다. 수정·삭제는 작성자 본인만 가능하며 서버에서도 JWT 인증과 권한 검사를 수행합니다. ‘자취생 전용’은 대상 사용자를 뜻하며 실제 자취 여부를 인증하는 기능은 없습니다.

- 학번 / 이름: **202212950 / 백종학**
- 선택 기술: **React + FastAPI + SQLite**
- GitHub: [jongka/web_service_design_JWT-Assignment_202212950](https://github.com/jongka/web_service_design_JWT-Assignment_202212950)
- 실행 방식: Windows PC에서 백엔드와 프론트 빌드본을 함께 실행합니다. 외부 배포 서버는 필요하지 않습니다.

## 보고서와 테스트 증거

- [테스트 증거와 파일별 안내](docs/evidence)
- [보고서 PDF](docs/report.pdf)

## 프로젝트 구조

```text
.
├── README.md
├── .gitignore
├── frontend-react/
│   ├── src/main.jsx       # 화면·로그인·오류·작성자별 버튼
│   ├── src/api.js         # 메모리 세션·Bearer 전송·응답 처리
│   ├── vite.config.js     # /api 프록시
│   ├── package.json
│   └── package-lock.json
├── backend-fastapi/
│   ├── app.py             # 라우트·입력·HTTP 응답
│   ├── auth.py            # JWT 발급·검증·작성자 검사
│   ├── users.py           # 과제 계정·scrypt 비밀번호 검증
│   ├── store.py           # SQLite 게시글 CRUD
│   ├── errors.py
│   ├── requirements.txt
│   └── .env.example       # 실제 키를 포함하지 않는 설정 예시
├── tools/check_api.py     # 실행 중인 서버의 API 자동 검사
└── docs/                  # 과제 자료·보고서 양식·테스트 증거
```

`.venv`, `node_modules`, `dist`, `.env`, `data/board.sqlite`는 설치·실행 시 준비하며 Git 제출 대상에서 제외합니다. Vue·Express·Spring 템플릿은 사용하지 않아 삭제했습니다.

## 실행 환경

2026-10-28 바탕화면의 새 소스 복사본에서 다음 환경으로 설치·실행을 검증했습니다.

| 항목 | 확인 버전 |
|---|---|
| 운영체제 | Windows, PowerShell |
| Node.js / npm | 24.21.0 / 11.19.0 |
| Python | 3.10.2 |
| React / React DOM | 19.3.0 |
| Vite / React 플러그인 | 8.3.4 / 6.1.2 |
| FastAPI / Uvicorn | 0.143.0 / 0.54.0 |
| PyJWT / python-dotenv | 2.15.1 / 1.2.4 |
| SQLite | 3.35.5 (Python 표준 라이브러리) |

Node.js는 20.19 이상, Python은 3.10 이상이 필요합니다. 아래 명령은 검증한 `python` 실행 파일을 사용합니다. 먼저 `python --version`, `node --version`, `npm.cmd --version`으로 설치 상태를 확인하세요. `py` 런처에 Python이 등록되지 않은 환경에서도 `python`이 정상 실행되면 아래 절차를 사용할 수 있습니다.

## 설치와 실행

### 1. 저장소 복제

```powershell
git clone https://github.com/jongka/web_service_design_JWT-Assignment_202212950.git
cd web_service_design_JWT-Assignment_202212950
```

이 폴더가 이후 명령의 프로젝트 루트입니다. 최초 패키지 설치에는 인터넷이 필요합니다.

### 2. 백엔드 의존성 설치

```powershell
cd backend-fastapi
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m pip check
```

가상환경 활성화 없이도 실행할 수 있도록 모든 백엔드 명령에서 가상환경 Python을 직접 지정합니다.

### 3. 서버 환경설정

최초 설정 때만 실행합니다. 기존 `.env`가 있다면 덮어쓰지 말고 필요한 항목을 수정하세요.

```powershell
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -c "from pathlib import Path; import secrets; p=Path('.env'); p.write_text(p.read_text(encoding='utf-8').replace('REPLACE_WITH_RANDOM_64_HEX_CHARACTERS', secrets.token_hex(32)), encoding='utf-8')"
```

두 번째 명령은 예시 키를 새 난수로 바꾸고 파일에 저장하며 키를 출력하지 않습니다. `.env`에는 다음 설정이 필요합니다. 아래 JWT_SECRET 설명 문자열을 그대로 사용하지 마세요.

```dotenv
JWT_SECRET=<위 명령으로 생성되는 64자리 16진수 난수>
JWT_ISSUER=webservice-class
JWT_AUDIENCE=board-api
TOKEN_TTL=90
DB_FILE=data/board.sqlite
PORT=8000
```

`load_dotenv()`는 이미 터미널에 설정된 환경변수를 덮어쓰지 않습니다. `.env`를 사용하려는데 이전 실습 값이 남아 있다면 **백엔드를 실행할 같은 터미널에서** 해당 환경변수를 제거하세요.

```powershell
Remove-Item Env:TOKEN_TTL -ErrorAction SilentlyContinue
```

JWT_SECRET·DB_FILE 등도 터미널 환경변수가 있으면 파일 값보다 우선합니다. 실제 키·토큰·`.env`는 GitHub나 보고서에 포함하지 않습니다.

### 4. 백엔드 실행

`backend-fastapi`에서 실행하고 터미널을 켜 둡니다.

```powershell
.\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000
```

- 상태 확인: http://127.0.0.1:8000/api/health → HTTP 200, `{"status":"ok","stack":"fastapi"}`
- API 문서: http://127.0.0.1:8000/docs
- 실제 포트는 `--port`로 정합니다. `.env`의 PORT 값만 바꾸면 실행 포트가 바뀌지 않습니다.

### 5. 프론트 설치·빌드·최종 실행

백엔드를 켜 두고 **새 PowerShell 터미널에서 저장소 루트로 이동한 뒤** 실행합니다.

```powershell
cd frontend-react
npm.cmd ci
npm.cmd run build
npm.cmd run preview
```

- 최종 확인 주소: **http://127.0.0.1:4173**
- 개발 실행: `npm.cmd run dev` → http://127.0.0.1:5173
- Windows PowerShell의 `npm.ps1` 실행 정책 오류를 피하기 위해 `npm.cmd`를 사용합니다.
- 개발·preview의 `/api` 요청은 8000번 FastAPI로 전달됩니다. 포트 변경 시 `vite.config.js`의 `server.proxy`와 `preview.proxy`를 함께 수정합니다.
- `dist/index.html`을 직접 더블클릭하지 말고 preview 서버로 접속하세요.
- 종료: 프론트·백엔드 터미널에서 각각 Ctrl+C
- 프론트 코드 변경: preview 종료 → `npm.cmd run build` → preview 재실행
- 백엔드 코드·환경설정 변경: 백엔드 종료 → 같은 폴더에서 재실행

### 6. 테스트 계정과 DB

| 사용자 | 이메일 | 과제용 비밀번호 |
|---|---|---|
| Alice (ID 1) | alice@class.test | Classroom!2026 |
| Bob (ID 2) | bob@class.test | Classroom!2026 |

계정은 `users.py`에서 서버 시작 시 준비되고 게시글은 SQLite 파일에 저장됩니다. 기본 DB는 **backend-fastapi/data/board.sqlite**이며 폴더·테이블은 자동 생성됩니다. 기존 키·DB가 없어도 새 키 설정 후 실행할 수 있습니다.

DB 경로는 서버의 실행 폴더 기준이므로 항상 `backend-fastapi`에서 실행합니다. 일반 재시작에는 파일을 지우지 않습니다. 초기화하려면 먼저 서버를 종료하고 `backend-fastapi` 폴더에서 다음 명령을 실행합니다. **기존 게시글이 모두 삭제됩니다.**

```powershell
Remove-Item -LiteralPath .\data\board.sqlite
```

## 구현 완료 범위

| 기능 | 상태 | 주요 위치 |
|---|---|---|
| 공개 목록·상세 | 구현·API 검사 통과 | app.py, store.py |
| 로그인·JWT 발급 | 구현·API 검사 통과 | users.py, auth.py: issue_token |
| JWT 검증·내 정보 | 구현·API 검사 통과 | auth.py: current_user_id, app.py: me |
| 글 작성·작성자 결정 | 구현·API 검사 통과 | app.py: create, store.py |
| 본인 수정·삭제 | 구현·API 검사 통과 | auth.py: assert_owner, app.py: update/delete |
| 토큰 만료 | 구현·만료 검사 통과 | auth.py, api.js |
| 메모리 로그인·로그아웃·버튼 | 구현·사용자 화면 캡처 확보 | api.js, main.jsx |
| 입력·권한·인증 오류 | 구현·API 검사 통과 | app.py, auth.py, api.js, main.jsx |
| 실제 서버 재시작 후 데이터 유지 | 새 폴더에서 재검증 통과 | store.py |

토큰은 localStorage·sessionStorage에 저장하지 않습니다. 새로고침하면 로그인이 해제되고 게시글은 유지됩니다. 401은 세션 제거·재로그인 안내, 403은 로그인 유지·권한 안내, 400은 입력 수정 안내, 404는 상세 정리·목록 갱신으로 처리합니다. 삭제 204는 JSON을 파싱하지 않습니다.

주요 제한: 회원가입·Refresh Token·검색·카테고리·댓글·이미지 업로드·실제 자취 인증은 없습니다. 만료는 보호 API 요청에서 확인하며 타이머에 의한 자동 로그아웃은 없습니다. 로그아웃 전에 복사한 토큰은 만료 전까지 사용할 수 있습니다. 현재 자동·재현 검사에서 실패한 항목은 없으며, 제출 문서·캡처 정리는 별도 확인이 필요합니다.

## 테스트 방법과 실제 결과

백엔드를 켜 두고 **프로젝트 루트**에서 실행합니다. 검사는 임시 글을 만들고 정상 완료 시 삭제합니다.

```powershell
.\backend-fastapi\.venv\Scripts\python.exe tools/check_api.py --mode final
```

만료 검사는 백엔드를 종료한 뒤 **백엔드 실행 터미널에서** TTL을 명시하여 재시작합니다.

```powershell
# backend-fastapi 폴더에서 실행
$env:TOKEN_TTL = "3"
.\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000
```

다른 터미널의 프로젝트 루트에서:

```powershell
.\backend-fastapi\.venv\Scripts\python.exe tools/check_api.py --mode final --expiry
```

만료 검사 전 로그인 응답의 expiresIn이 3인지 확인합니다. 검사 후 백엔드를 종료하고 `$env:TOKEN_TTL = "90"`으로 바꿔 재실행합니다. 또는 해당 환경변수를 제거하고 `.env`의 90을 사용합니다.

2026-10-28, 기존 `.venv`·node_modules·dist·`.env`·DB를 제외하고 바탕화면 `JWT-Assignment-Reproduction`에 소스를 새로 복사하여 다음을 확인했습니다.

| 검사 | 실제 결과 | 로그 |
|---|---|---|
| 새 Python 가상환경·의존성 설치 | 성공, pip check 충돌 없음 | [설치](docs/evidence/reproduction/02-pip-install.txt), [pip check](docs/evidence/reproduction/03-pip-check.txt) |
| 프론트 npm ci·빌드 | 성공 | [설치](docs/evidence/reproduction/04-npm-ci.txt), [빌드](docs/evidence/reproduction/07-frontend-build.txt) |
| 8000번 API final | **40개 통과** | [API 결과](docs/evidence/reproduction/06-api-final.txt) |
| 4173번 preview 프록시 API final | **40개 통과** | [프록시 결과](docs/evidence/reproduction/09-preview-proxy-final.txt) |
| TTL 3초, preview 경유 expiry | **48개 통과** | [만료 결과](docs/evidence/reproduction/13-api-expiry.txt) |
| 실제 프로세스 재시작 | 글·작성자·생성·수정 시각 동일 | [추가 검사](docs/evidence/reproduction/11-additional-results.json) |
| 인증·권한 검사 순서 | 무토큰 없는 글 401, 정상 토큰 없는 글 404, Bob의 잘못된 입력도 타인 글이면 403 | [추가 검사](docs/evidence/reproduction/11-additional-results.json) |

일반 검사에는 Alice/Bob 본인 작업·타인 변경 거부, 위조 작성자 필드·잘못된 입력 거부, 토큰 없음·변조, 201 Location·보호 API 401 WWW-Authenticate·204 빈 본문 확인이 포함됩니다. 사용자 화면 증거는 T01~T17 캡처와 결과 이미지로 보관합니다. 새 폴더 검사는 실제 HTTP·빌드·재시작을 확인했고, 새 폴더 브라우저에서 모든 버튼을 다시 클릭한 검사는 아닙니다. **복사본 재현이며 GitHub clone 검사는 아직 수행하지 않았습니다.**

## 핵심 구현 흐름

1. 로그인 폼 → api.js의 login() → app.py의 입력 검사 → users.py의 scrypt 검증 → auth.py의 HS256 JWT 발급
2. api.js 메모리에 토큰·사용자 저장 → 요청에 Bearer 헤더 첨부
3. current_user_id()가 서명·알고리즘·필수 클레임·실제 계정 검증 후 만료 비교 → 검증된 ID 전달
4. 등록은 검증된 ID를 작성자로 저장, 수정·삭제는 DB authorId와 비교 후 허용

현재 코드는 PyJWT 자동 만료 검사를 끄고 다른 검사를 통과한 뒤 exp와 현재 시각을 직접 비교합니다. 단순 payload 해석만으로 인증하지 않습니다.

## AI 활용과 출처

AI를 사용했습니다. Codex로 auth.py 구현, React 인증·오류 화면 연결, 자취생 주제 반영, 실행 문제 해결 안내, 문서 초안 및 새 복사본 재현 검사를 수행했습니다. 주요 반영 파일은 auth.py, api.js, main.jsx, style.css, index.html, app.py의 제목과 README입니다. 제공된 users.py·store.py 및 기본 라우트는 수업 템플릿을 유지했습니다. 사용자 수행과 AI 도구 검증은 증거·보고서에서 구분합니다. 모델명은 실제 확인 가능한 값만 보고서에 기재합니다.

참고한 수업 자료: [과제 공지](docs/01_과제공지.md), [API 명세](docs/02_API명세.md), [체크리스트](docs/03_구현체크리스트.md), [보고서 양식](docs/04_보고서양식.md), [테스트 시나리오](docs/05_테스트시나리오.md). 상세 AI 활용 사례·본인 이해도와 회고는 최종 보고서에 작성합니다.

## 제출 전 남은 확인
- [ ] 최종 보고서를 `docs/report.pdf`로 추가하고 README 링크 연결

- [ ] GitHub 업로드 후 새 폴더 clone으로 README 절차 재검증
- [ ] GitHub에서 보고서·증거 링크와 교수자 접근 권한 확인
- [ ] 최종 저장소 URL과 제출 기준 커밋 SHA를 LMS에 제출

실제 `.env`, DB, `.venv`, node_modules, dist는 .gitignore로 제외합니다. Git 추가 전 제외 상태와 캡처의 토큰 마스킹을 확인하세요.
