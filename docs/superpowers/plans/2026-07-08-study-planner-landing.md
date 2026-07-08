# 스터디 플래너 PDF 랜딩페이지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 스터디 플래너 PDF를 무료로 다운로드할 수 있는 정적 랜딩페이지를 만들고, 애드센스 승인을 받을 수 있을 만큼의 콘텐츠(소개/개인정보처리방침)를 갖춰 GitHub Pages에 배포한다.

**Architecture:** 순수 정적 HTML/CSS/JS 사이트. 빌드 도구 없음. 플래너 PDF는 인쇄 전용 HTML(`planner/planner.html`)을 브라우저 인쇄 기능으로 PDF 저장하여 만든다. 광고는 빈 `ad-slot` 컨테이너만 마련하고 실제 스크립트는 애드센스 승인 후 별도로 삽입한다.

**Tech Stack:** HTML5, CSS3(변수/flexbox/grid), 바닐라 JavaScript, GitHub Pages.

## Global Constraints

- 별도 도메인 구매 없음 — `https://<username>.github.io/study-planner-site/` 형태로 배포한다.
- 다운로드는 이메일 입력 없이 버튼 클릭 즉시 이루어진다 (spec 범위: 리드 수집 기능 없음).
- 플래너는 1종(단일 디자인)만 만든다.
- 애드센스 스크립트/`ads.txt`는 이번 구현에 실제 코드로 넣지 않는다 — 빈 슬롯과 안내 주석만 남긴다.
- 커스텀 도메인 연결, 방문자 분석 도구(GA 등) 연동은 범위 밖이다.
- 모든 페이지는 모바일/데스크톱 반응형이어야 한다.

---

### Task 1: 프로젝트 골격 및 공통 스타일

**Files:**
- Create: `style.css`
- Create: `assets/` (빈 폴더, `.gitkeep`으로 유지)

**Interfaces:**
- Produces: `style.css`의 CSS 변수(`--color-primary`, `--color-bg`, `--color-text`, `--max-width`, `--radius`)와 공통 클래스(`.container`, `.btn-primary`, `.ad-slot`, `.site-header`, `.site-footer`)를 이후 모든 HTML 페이지(Task 3~5)가 그대로 사용한다.

- [ ] **Step 1: 폴더 구조 생성**

```bash
mkdir -p downloads planner assets
touch assets/.gitkeep
```

- [ ] **Step 2: `style.css` 작성**

```css
:root {
  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;
  --max-width: 960px;
  --radius: 12px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
}

.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 20px;
}

.site-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 16px 0;
}

.site-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.site-header .logo {
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  color: var(--color-text);
}

.site-header nav a {
  margin-left: 20px;
  text-decoration: none;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.site-header nav a:hover,
.site-header nav a.active {
  color: var(--color-primary);
}

.btn-primary {
  display: inline-block;
  background: var(--color-primary);
  color: #fff;
  padding: 14px 32px;
  border-radius: var(--radius);
  text-decoration: none;
  font-weight: 600;
  font-size: 1.05rem;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
}

.ad-slot {
  max-width: var(--max-width);
  margin: 32px auto;
  padding: 20px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius);
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 24px;
}

.site-footer {
  border-top: 1px solid var(--color-border);
  margin-top: 60px;
  padding: 24px 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.site-footer a {
  color: var(--color-text-muted);
  margin: 0 8px;
}

.prose h1,
.prose h2 {
  color: var(--color-text);
}

.prose p {
  color: var(--color-text-muted);
}

@media (max-width: 600px) {
  .site-header .container {
    flex-direction: column;
    gap: 8px;
  }

  .btn-primary {
    width: 100%;
    text-align: center;
  }
}
```

- [ ] **Step 3: 브라우저로 확인**

`style.css`는 아직 참조하는 HTML이 없으므로 문법 오류만 확인한다.

Run: `node -e "require('fs').readFileSync('style.css','utf8')"` (파일이 존재하고 읽히는지만 확인 — CSS 파서는 아니지만 오탈자로 인한 파일 누락을 잡아준다)
Expected: 에러 없이 종료

- [ ] **Step 4: Commit**

```bash
git add style.css assets/.gitkeep
git commit -m "chore: add project skeleton and shared styles"
```

---

### Task 2: 플래너 인쇄용 HTML (`planner/planner.html`)

**Files:**
- Create: `planner/planner.html`

**Interfaces:**
- Produces: 브라우저 인쇄로 `downloads/study-planner.pdf`를 만들 원본 파일. Task 3에서 이 파일을 열어 PDF로 저장한다.
- 이 파일은 독립적으로 완결되어야 하므로 `style.css`를 참조하지 않고 내부 `<style>`에 전체 스타일을 포함한다.

- [ ] **Step 1: `planner/planner.html` 작성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>스터디 플래너</title>
<style>
  @page {
    size: A4;
    margin: 14mm;
  }
  * { box-sizing: border-box; }
  body {
    font-family: "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
    color: #1e293b;
    margin: 0;
  }
  .sheet {
    width: 100%;
  }
  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 3px solid #1e293b;
    padding-bottom: 10px;
    margin-bottom: 16px;
  }
  .top-row h1 {
    font-size: 22px;
    margin: 0;
  }
  .week-field {
    font-size: 13px;
    color: #475569;
  }
  .goal-line {
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 8px 12px;
    margin-bottom: 16px;
    font-size: 13px;
  }
  table.timetable {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  table.timetable th,
  table.timetable td {
    border: 1px solid #cbd5e1;
    height: 26px;
    font-size: 11px;
    text-align: center;
  }
  table.timetable th {
    background: #f1f5f9;
  }
  .bottom-row {
    display: flex;
    gap: 20px;
  }
  .checklist, .memo {
    flex: 1;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 12px;
  }
  .checklist h2, .memo h2 {
    font-size: 14px;
    margin: 0 0 8px;
  }
  .checklist ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .checklist li {
    font-size: 12px;
    border-bottom: 1px dotted #cbd5e1;
    padding: 6px 0;
  }
  .checklist li::before {
    content: "☐ ";
  }
  .memo .lines div {
    border-bottom: 1px dotted #cbd5e1;
    height: 20px;
  }
</style>
</head>
<body>
  <div class="sheet">
    <div class="top-row">
      <h1>WEEKLY STUDY PLANNER</h1>
      <div class="week-field">월 ____ 일 ~ ____ 일 (____주차)</div>
    </div>

    <div class="goal-line">이번 주 목표: ______________________________________________</div>

    <table class="timetable">
      <thead>
        <tr>
          <th style="width:8%">시간</th>
          <th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th><th>일</th>
        </tr>
      </thead>
      <tbody>
        <script>
          document.write(
            Array.from({length: 12}, (_, i) => {
              const hour = 8 + i;
              return `<tr><td>${hour}시</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
            }).join("")
          );
        </script>
      </tbody>
    </table>

    <div class="bottom-row">
      <div class="checklist">
        <h2>과목별 체크리스트</h2>
        <ul>
          <li>______________________________</li>
          <li>______________________________</li>
          <li>______________________________</li>
          <li>______________________________</li>
          <li>______________________________</li>
          <li>______________________________</li>
        </ul>
      </div>
      <div class="memo">
        <h2>오늘의 한마디 / 메모</h2>
        <div class="lines">
          <div></div><div></div><div></div><div></div><div></div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 2: 파일 존재 및 기본 구조 확인**

Run: `node -e "const fs=require('fs'); const html=fs.readFileSync('planner/planner.html','utf8'); if(!html.includes('WEEKLY STUDY PLANNER')) throw new Error('missing title'); console.log('ok')"`
Expected: `ok` 출력

- [ ] **Step 3: Commit**

```bash
git add planner/planner.html
git commit -m "feat: add printable weekly study planner"
```

---

### Task 3: PDF 생성 (`downloads/study-planner.pdf`)

**Files:**
- Create: `downloads/study-planner.pdf`

**Interfaces:**
- Consumes: Task 2에서 만든 `planner/planner.html`
- Produces: `downloads/study-planner.pdf` — Task 4의 다운로드 버튼이 이 경로를 가리킨다.

- [ ] **Step 1: `planner/planner.html`을 기본 브라우저로 연다**

Run: `start planner/planner.html` (Windows에서 기본 브라우저로 열림)

- [ ] **Step 2: 브라우저 인쇄(Ctrl+P) → "PDF로 저장" 선택**

용지: A4, 여백: 기본, 배경 그래픽: 켜기(체크된 테두리가 그대로 보이도록)로 설정한 뒤 저장 위치를 `downloads/study-planner.pdf`로 지정한다.

- [ ] **Step 3: 생성된 PDF 확인**

Run: `node -e "const fs=require('fs'); const stat=fs.statSync('downloads/study-planner.pdf'); if(stat.size < 1000) throw new Error('file too small, likely broken'); console.log('size:', stat.size)"`
Expected: 파일 크기(bytes)가 출력되고 에러 없음

- [ ] **Step 4: Commit**

```bash
git add downloads/study-planner.pdf
git commit -m "feat: add generated study planner PDF"
```

---

### Task 4: 메인 랜딩페이지 (`index.html`)

**Files:**
- Create: `index.html`

**Interfaces:**
- Consumes: `style.css`(Task 1)의 `.container`, `.btn-primary`, `.ad-slot`, `.card`, `.site-header`, `.site-footer` 클래스. `downloads/study-planner.pdf`(Task 3) 경로.
- Produces: `about.html`, `privacy.html`(Task 5, 6)에서 재사용할 헤더/푸터 마크업 패턴.

- [ ] **Step 1: `index.html` 작성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>무료 스터디 플래너 PDF 다운로드</title>
<meta name="description" content="주간 시간표, 과목별 체크리스트가 담긴 스터디 플래너 PDF를 무료로 다운로드하세요.">
<link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <a href="index.html" class="logo">스터디 플래너</a>
      <nav>
        <a href="index.html" class="active">홈</a>
        <a href="about.html">사용법</a>
        <a href="privacy.html">개인정보처리방침</a>
      </nav>
    </div>
  </header>

  <div class="ad-slot">광고 영역 (승인 후 게재 예정)</div>

  <main class="container">
    <section style="text-align:center; padding: 40px 0;">
      <h1 style="font-size:2rem; margin-bottom:12px;">무료 스터디 플래너 PDF</h1>
      <p style="color:var(--color-text-muted); margin-bottom:24px;">
        주간 시간표부터 과목별 체크리스트까지, 인쇄해서 바로 쓰는 스터디 플래너를 무료로 받아보세요.
      </p>
      <a class="btn-primary" href="downloads/study-planner.pdf" download>PDF 무료 다운로드</a>
    </section>

    <section style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; margin: 40px 0;">
      <div class="card">
        <h3>주간 시간표</h3>
        <p style="color:var(--color-text-muted); font-size:0.9rem;">월요일부터 일요일까지 시간대별로 계획을 채워 넣을 수 있는 표를 제공합니다.</p>
      </div>
      <div class="card">
        <h3>과목별 체크리스트</h3>
        <p style="color:var(--color-text-muted); font-size:0.9rem;">이번 주에 끝내야 할 과목별 할 일을 체크박스로 관리할 수 있습니다.</p>
      </div>
      <div class="card">
        <h3>목표 &amp; 메모란</h3>
        <p style="color:var(--color-text-muted); font-size:0.9rem;">이번 주 목표를 적어두고, 매일 한 줄 메모를 남길 수 있는 공간이 있습니다.</p>
      </div>
    </section>
  </main>

  <div class="ad-slot">광고 영역 (승인 후 게재 예정)</div>

  <footer class="site-footer">
    <div class="container">
      <a href="about.html">사용법</a> · <a href="privacy.html">개인정보처리방침</a>
      <p style="margin-top:8px;">© <span id="year"></span> 스터디 플래너</p>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: `script.js` 작성 (연도 표시 + 활성 네비 표시)**

```javascript
document.getElementById("year").textContent = new Date().getFullYear();

const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".site-header nav a").forEach((link) => {
  const linkPage = link.getAttribute("href");
  link.classList.toggle("active", linkPage === currentPage);
});
```

- [ ] **Step 3: 브라우저로 열어 확인**

Run: `start index.html`
Expected: 제목/설명/다운로드 버튼이 보이고, 버튼 클릭 시 `downloads/study-planner.pdf`가 다운로드된다. 하단 연도가 현재 연도로 표시된다.

- [ ] **Step 4: Commit**

```bash
git add index.html script.js
git commit -m "feat: add main landing page with download button"
```

---

### Task 5: 소개/활용법 페이지 (`about.html`)

**Files:**
- Create: `about.html`

**Interfaces:**
- Consumes: `style.css`, `script.js`(Task 4)의 연도/네비 로직 — `index.html`과 동일한 `<header>`/`<footer>` 마크업을 재사용한다.

- [ ] **Step 1: `about.html` 작성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>스터디 플래너 사용법 | 스터디 플래너</title>
<meta name="description" content="스터디 플래너 PDF를 효과적으로 활용하는 방법과 추천 대상을 안내합니다.">
<link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <a href="index.html" class="logo">스터디 플래너</a>
      <nav>
        <a href="index.html">홈</a>
        <a href="about.html" class="active">사용법</a>
        <a href="privacy.html">개인정보처리방침</a>
      </nav>
    </div>
  </header>

  <main class="container prose" style="padding: 40px 0; max-width: 720px;">
    <h1>스터디 플래너, 이렇게 활용하세요</h1>

    <p>
      스터디 플래너는 한 주 단위로 학습 계획을 세우고 실천 여부를 눈으로 확인할 수 있도록 만든 인쇄용 양식입니다.
      매주 첫날, 플래너를 새로 인쇄해서 그 주의 목표와 시간표를 채워보세요. 계획을 세우는 시간 자체가 학습 습관을
      만드는 첫걸음이 됩니다.
    </p>

    <h2>이런 분들께 추천합니다</h2>
    <ul>
      <li>정기적으로 시험을 준비하는 수험생 — 과목별 진도를 한눈에 관리하고 싶은 분</li>
      <li>여러 과제와 시험이 겹치는 대학생 — 주간 단위로 우선순위를 정리하고 싶은 분</li>
      <li>자격증 공부를 병행하는 직장인 — 짧은 시간을 효율적으로 배분하고 싶은 분</li>
    </ul>

    <h2>단계별 활용법</h2>
    <ol>
      <li><strong>목표 적기</strong> — 상단 목표란에 이번 주 반드시 끝내야 할 한 가지를 적습니다. 목표를 하나로 좁히면 실천율이 올라갑니다.</li>
      <li><strong>시간표 채우기</strong> — 요일별 시간표에 공부할 과목과 시간대를 미리 배치합니다. 빈 시간을 억지로 채우기보다, 실제로 지킬 수 있는 만큼만 계획하세요.</li>
      <li><strong>체크리스트 활용</strong> — 과목별 체크리스트에 세부 할 일을 적고, 끝낼 때마다 체크합니다. 하루가 끝날 때 체크된 항목을 보면 성취감을 확인할 수 있습니다.</li>
      <li><strong>메모란 활용</strong> — 하루를 마치며 잘된 점이나 아쉬운 점을 한 줄로 남깁니다. 다음 주 계획을 세울 때 좋은 참고가 됩니다.</li>
    </ol>

    <h2>인쇄 팁</h2>
    <p>
      PDF는 A4 용지에 맞춰 제작되었습니다. 인쇄 시 "배경 그래픽" 옵션을 켜면 표의 테두리가 선명하게 인쇄됩니다.
      매주 여러 장을 한 번에 인쇄해두면 새로 다운로드할 필요 없이 바로 사용할 수 있습니다.
    </p>
  </main>

  <div class="ad-slot">광고 영역 (승인 후 게재 예정)</div>

  <footer class="site-footer">
    <div class="container">
      <a href="about.html">사용법</a> · <a href="privacy.html">개인정보처리방침</a>
      <p style="margin-top:8px;">© <span id="year"></span> 스터디 플래너</p>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: 브라우저로 열어 확인**

Run: `start about.html`
Expected: "사용법" 네비 항목이 활성 상태로 표시되고, 본문 텍스트가 정상적으로 렌더링된다.

- [ ] **Step 3: Commit**

```bash
git add about.html
git commit -m "feat: add about/usage page for AdSense content requirements"
```

---

### Task 6: 개인정보처리방침 페이지 (`privacy.html`)

**Files:**
- Create: `privacy.html`

**Interfaces:**
- Consumes: `style.css`, `script.js`(Task 4) — `index.html`과 동일한 헤더/푸터 마크업.

- [ ] **Step 1: `privacy.html` 작성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>개인정보처리방침 | 스터디 플래너</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <a href="index.html" class="logo">스터디 플래너</a>
      <nav>
        <a href="index.html">홈</a>
        <a href="about.html">사용법</a>
        <a href="privacy.html" class="active">개인정보처리방침</a>
      </nav>
    </div>
  </header>

  <main class="container prose" style="padding: 40px 0; max-width: 720px;">
    <h1>개인정보처리방침</h1>
    <p>본 사이트("스터디 플래너")는 방문자의 개인정보를 직접 수집하지 않습니다. PDF 다운로드는 별도의 회원가입이나 이메일 입력 없이 제공됩니다.</p>

    <h2>쿠키 및 광고에 대한 안내</h2>
    <p>
      본 사이트는 Google AdSense를 통해 광고를 게재할 수 있습니다. Google을 비롯한 제3자 광고 공급업체는 쿠키를 사용하여
      사용자가 본 사이트 및 다른 사이트를 방문한 기록을 바탕으로 광고를 게재할 수 있습니다. Google의 광고 쿠키 사용으로
      인해 Google과 그 파트너는 사용자가 본 사이트 또는 다른 사이트를 방문한 정보를 기반으로 광고를 게재할 수 있습니다.
    </p>
    <p>
      사용자는 Google 광고 설정 페이지(<a href="https://adssettings.google.com" target="_blank" rel="noopener">adssettings.google.com</a>)를
      방문하여 맞춤 광고를 위한 쿠키 사용을 거부할 수 있습니다.
    </p>

    <h2>수집하지 않는 정보</h2>
    <p>본 사이트는 회원가입, 로그인, 결제 기능이 없으며, 이름, 이메일, 전화번호 등 개인 식별 정보를 직접 수집하지 않습니다.</p>

    <h2>문의</h2>
    <p>본 방침 또는 사이트 운영과 관련한 문의는 아래 이메일로 연락해 주세요.</p>
    <p>이메일: yjs893355@gmail.com</p>

    <h2>방침의 변경</h2>
    <p>본 개인정보처리방침은 관련 법령 또는 서비스 변경에 따라 수정될 수 있으며, 변경 시 본 페이지를 통해 공지합니다.</p>
    <p style="color:var(--color-text-muted); font-size:0.85rem;">최종 수정일: 2026-07-08</p>
  </main>

  <footer class="site-footer">
    <div class="container">
      <a href="about.html">사용법</a> · <a href="privacy.html">개인정보처리방침</a>
      <p style="margin-top:8px;">© <span id="year"></span> 스터디 플래너</p>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: 브라우저로 열어 확인**

Run: `start privacy.html`
Expected: "개인정보처리방침" 네비 항목이 활성 상태로 표시되고, 광고/쿠키 안내 문구가 보인다.

- [ ] **Step 3: Commit**

```bash
git add privacy.html
git commit -m "feat: add privacy policy page required for AdSense review"
```

---

### Task 7: 반응형 확인 및 전체 통합 점검

**Files:**
- Modify: 없음 (검증 전용 태스크). 문제 발견 시 `style.css`, `index.html`, `about.html`, `privacy.html` 수정.

**Interfaces:**
- Consumes: Task 1~6에서 만든 모든 파일.

- [ ] **Step 1: 데스크톱 폭에서 각 페이지 확인**

Run: `start index.html` 후 브라우저 창을 1280px 이상으로 넓혀 확인
Expected: 3개 카드가 한 줄에 정렬되고, 광고 슬롯이 중앙 정렬되어 보인다.

- [ ] **Step 2: 모바일 폭(375px)에서 확인**

브라우저 개발자 도구(F12) → 기기 툴바 → 375x812(iPhone 계열)로 전환 후 `index.html`, `about.html`, `privacy.html` 순서로 확인
Expected: 헤더 nav가 세로로 쌓이고, 다운로드 버튼이 화면 폭에 맞게 늘어나며, 카드 3개가 세로로 쌓인다. 텍스트 잘림이나 가로 스크롤이 없어야 한다.

- [ ] **Step 3: 전체 링크 동작 확인**

각 페이지의 nav 링크(홈/사용법/개인정보처리방침)를 모두 클릭하여 3개 페이지 간 이동이 정상 동작하는지, 다운로드 버튼이 `downloads/study-planner.pdf`를 여전히 내려받는지 확인한다.

Expected: 깨진 링크 없음, PDF 다운로드 정상 동작.

- [ ] **Step 4: 문제 발견 시 수정 후 재확인, 문제 없으면 이 태스크는 커밋 없이 종료**

---

### Task 8: GitHub 저장소 생성 및 GitHub Pages 배포

**Files:**
- Create: `.gitignore` (OS 임시파일 제외용)

**Interfaces:**
- Consumes: 로컬 git 저장소(이미 `git init` 완료된 상태, 브레인스토밍 단계에서 생성됨)에 쌓인 모든 커밋.
- Produces: 공개 URL `https://<username>.github.io/study-planner-site/` — 이후 애드센스 신청 시 이 URL을 사용한다.

- [ ] **Step 1: `.gitignore` 작성**

```
.DS_Store
Thumbs.db
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add gitignore for OS temp files"
```

- [ ] **Step 3: GitHub에 새 저장소 생성**

GitHub 웹사이트에서 `study-planner-site`라는 이름으로 새 **public** 저장소를 만든다 (README 등 초기 파일 없이 빈 저장소로 생성). 애드센스는 공개적으로 접근 가능한 사이트만 심사하므로 반드시 public이어야 한다.

- [ ] **Step 4: 원격 저장소 연결 및 push**

```bash
git remote add origin https://github.com/<username>/study-planner-site.git
git branch -M main
git push -u origin main
```

Expected: push 성공, GitHub 저장소 페이지에서 파일 목록이 보임.

- [ ] **Step 5: GitHub Pages 활성화**

저장소 → Settings → Pages → Source를 "Deploy from a branch"로 설정, Branch를 `main` / `/(root)`로 선택 후 저장.

- [ ] **Step 6: 배포 확인**

몇 분 후 `https://<username>.github.io/study-planner-site/` 접속.
Expected: index.html이 정상적으로 표시되고, 다운로드 버튼과 nav 링크가 실제 배포 환경에서도 동작한다.

- [ ] **Step 7: 최종 커밋 (배포 URL 기록용, 필요 시)**

배포가 정상 확인되면 별도 커밋은 필요 없다. 배포 URL은 애드센스 신청 시 사용자가 직접 사용한다.

---

## 완료 후 남은 수동 작업 (사용자 진행)

- Google AdSense 사이트 추가 및 심사 신청 (배포된 URL 사용)
- 심사 통과 후 발급되는 광고 코드로 `index.html`, `about.html`의 `.ad-slot` 부분 교체
- 발급되는 퍼블리셔 ID로 `ads.txt` 생성 및 저장소 루트에 추가
