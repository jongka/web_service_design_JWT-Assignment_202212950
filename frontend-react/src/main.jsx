import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { api, login, getSession, clearSession, canEdit } from "./api";
import "./style.css";
function App() {
  const [posts, setPosts] = useState([]),
    [selected, setSelected] = useState(null);
  const [title, setTitle] = useState(""),
    [content, setContent] = useState(""),
    [editing, setEditing] = useState(null);
  const [email, setEmail] = useState("alice@class.test"),
    [password, setPassword] = useState("Classroom!2026");
  const [user, setUser] = useState(null),
    [profile, setProfile] = useState(null),
    [messageType, setMessageType] = useState("info"),
    [message, setMessage] = useState("게시판을 불러오는 중입니다."),
    [busy, setBusy] = useState(false);
  const refresh = async () => setPosts(await api.list());
  async function refreshAfterChange(success) {
    try {
      await refresh();
      return success;
    } catch {
      return `${success} 목록 갱신에 실패했습니다. 목록 새로고침을 눌러 주세요.`;
    }
  }
  async function run(action, success) {
    setBusy(true);
    try {
      const result = await action();
      setMessage(typeof result === "string" ? result : success);
      setMessageType("info");
    } catch (e) {
      if (e.status === 401) {
        setEditing(null);
        setProfile(null);
      }
      if (e.status === 404) {
        setSelected(null);
        setEditing(null);
        try {
          await refresh();
        } catch {
          // 원래 요청의 오류 안내를 유지합니다.
        }
      }
      setMessage(e.message);
      setMessageType("error");
    } finally {
      setUser(getSession().user);
      setBusy(false);
    }
  }
  useEffect(() => {
    run(refresh, "게시판이 준비되었습니다.");
  }, []);
  function reset() {
    setTitle("");
    setContent("");
    setEditing(null);
  }
  async function save(e) {
    e.preventDefault();
    if (!getSession().user) {
      setMessage("글을 작성하려면 먼저 로그인하세요.");
      setMessageType("error");
      return;
    }
    if (editing && !canEdit(editing)) {
      setMessage("본인이 작성한 글만 수정할 수 있습니다.");
      setMessageType("error");
      return;
    }
    if (!title.trim() || !content.trim()) {
      setMessage("제목과 내용을 공백이 아닌 문자로 입력하세요.");
      setMessageType("error");
      return;
    }
    await run(async () => {
      const p = editing
        ? await api.update(editing.id, { title, content })
        : await api.create({ title, content });
      setSelected(p);
      reset();
      return refreshAfterChange("게시글을 저장했습니다.");
    }, "게시글을 저장했습니다.");
  }
  return (
    <main>
      <header>
        <span className="eyebrow">혼자 살아도, 정보는 함께</span>
        <h1>자취생 전용 정보공유방</h1>
        <p className="muted">
          간단한 집밥부터 생활비 절약, 청소와 집 관리까지.
          자취하며 알게 된 유용한 정보와 경험을 나눠 보세요.
        </p>
      </header>
      <p className="banner">
        누구나 글을 읽을 수 있습니다. 글 작성은 로그인 후 가능하며, 수정과
        삭제는 작성자만 할 수 있습니다. 새로고침하면 로그인 상태가 해제됩니다.
      </p>
      <div role={messageType === "error" ? "alert" : "status"}
        className={`message ${messageType}`}>
        {message}
      </div>
      <div className="grid">
        <aside>
          <section className="card">
            <h2>로그인</h2>
            <p>{user ? `${user.name}님 로그인 중` : "로그아웃 상태"}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                run(async () => {
                  await login(email, password);
                  reset();
                  setProfile(null);
                  setPassword("");
                }, "로그인했습니다.");
              }}
            >
              <label>
                이메일
                <input
                  type="email"
                  autoComplete="username"
                  maxLength={254}
                  disabled={busy}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label>
                비밀번호
                <input
                  type="password"
                  autoComplete="current-password"
                  maxLength={128}
                  disabled={busy}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <div className="actions">
                <button disabled={busy}>로그인</button>
                <button
                  type="button"
                  className="secondary"
                  disabled={busy || !user}
                  onClick={() => {
                    clearSession();
                    setUser(null);
                    reset();
                    setProfile(null);
                    setPassword("");
                    setMessage("이 탭의 로그인 상태를 해제했습니다.");
                    setMessageType("info");
                  }}
                >
                  로그아웃
                </button>
              </div>
            </form>
            <p>
              <small>
                테스트 계정: alice@class.test / bob@class.test
                <br />
                공통 비밀번호: Classroom!2026
              </small>
            </p>
            <button
              className="secondary"
              disabled={busy || !user}
              onClick={() =>
                run(async () => {
                  const me = await api.me();
                  setProfile(me);
                }, "내 정보 조회를 완료했습니다.")
              }
            >
              내 정보 조회
            </button>
            {profile && user && (
              <p>이름: {profile.name}<br />이메일: {profile.email}</p>
            )}
          </section>
          <section className="card">
            <h2>{editing ? "공유 정보 수정" : "자취 정보 공유하기"}</h2>
            <p className="muted">요리·식비, 생활비 절약, 청소·정리, 자취방 관리 등 자유롭게 공유하세요.</p>
            {editing && <p>수정 중인 글: {editing.title}</p>}
            {!user && <p>글을 작성하려면 먼저 로그인하세요.</p>}
            <form onSubmit={save}>
              <label>
                제목
                <input
                  maxLength={100}
                  placeholder="예: 만 원으로 준비하는 일주일 자취 반찬"
                  disabled={busy}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>
              <label>
                내용
                <textarea
                  maxLength={5000}
                  placeholder="직접 해본 방법, 준비물, 비용과 주의할 점을 함께 알려 주세요."
                  disabled={busy}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </label>
              <div className="actions">
                <button disabled={busy || !user}>
                  {editing ? "수정 저장" : "정보 공유"}
                </button>
                <button type="button" className="secondary" disabled={busy} onClick={reset}>
                  {editing ? "수정 취소" : "입력 초기화"}
                </button>
              </div>
            </form>
          </section>
        </aside>
        <div>
          <section className="card">
            <h2>
              자취 정보 모아보기 <small>{posts.length}개</small>
            </h2>
            <button className="secondary" disabled={busy}
              onClick={() => run(refresh, "게시글 목록을 갱신했습니다.")}>
              목록 새로고침
            </button>
            {posts.length === 0 ? (
              <p>아직 공유된 정보가 없습니다. 나만의 자취 꿀팁을 처음으로 나눠 보세요.</p>
            ) : (
              posts.map((p) => (
                <article className="post" key={p.id}>
                  <button
                    className="post-title"
                    disabled={busy}
                    onClick={() =>
                      run(
                        async () => setSelected(await api.detail(p.id)),
                        "게시글을 불러왔습니다.",
                      )
                    }
                  >
                    {p.title}
                  </button>
                  <p>
                    <small>
                      {p.authorName} · {new Date(p.createdAt).toLocaleString()}
                    </small>
                  </p>
                </article>
              ))
            )}
          </section>
          <section className="card">
            <h2>공유 정보 상세</h2>
            {selected ? (
              <>
                <h3>{selected.title}</h3>
                <p className="content">{selected.content}</p>
                <p>
                  <small>작성자 {selected.authorName}</small>
                </p>
                {canEdit(selected) && (
                  <div className="actions">
                    <button
                      className="secondary"
                      disabled={busy}
                      onClick={() => {
                        setEditing(selected);
                        setTitle(selected.title);
                        setContent(selected.content);
                      }}
                    >
                      수정
                    </button>
                    <button
                      className="danger"
                      disabled={busy}
                      onClick={() => {
                        if (confirm("게시글을 삭제할까요?"))
                          run(async () => {
                            await api.remove(selected.id);
                            setSelected(null);
                            if (editing?.id === selected.id) reset();
                            return refreshAfterChange("게시글을 삭제했습니다.");
                          }, "게시글을 삭제했습니다.");
                      }}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="muted">목록에서 제목을 선택하세요.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
createRoot(document.getElementById("root")).render(<App />);
