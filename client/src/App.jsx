import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams
} from "react-router-dom";
import { api, authConfig, SERVER_URL } from "./api";

function Header() {
  return (
    <header className="topbar">
      <Link className="brand" to="/">
        {/* <span className="brand-mark">U</span> */}
        <img
  src="/logo.png"
  alt="Unseen Class"
  className="brand-logo"
/>
        <span>
          <strong>UNSEEN CLASS</strong>
          <small>Maharashtra SSC Study Hub</small>
        </span>
      </Link>
      <nav>
  <Link to="/">Home</Link>
  <Link to="/subjects">Subjects</Link>
  <Link to="/pyqs" className="pyq-nav">PYQs</Link>

  <a
    href="https://youtube.com/@unseenclass"
    target="_blank"
    rel="noopener noreferrer"
    className="youtube-link"
  >
    ▶ Subscribe
  </a>

  <Link to="/admin/login" className="admin-link">Admin</Link>
</nav>
    </header>
  );
}

function Footer() {
  return <footer>© {new Date().getFullYear()} Unseen Class · Learn • Practice • Revise • Score</footer>;
}

function Home() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    api.get("/public/subjects").then(r => setSubjects(r.data));
  }, []);

  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">MAHARASHTRA SSC BOARD</span>
          <h1>Study smarter.<br /><span>Score better.</span></h1>
          <p>Chapter-wise notes, important questions, MCQs and previous-year resources — made for Class 10 SSC students.</p>
          <Link className="primary-btn" to="/subjects">Explore Study Material →</Link>
           <a
        href="https://youtube.com/@unseenclass"
        target="_blank"
        rel="noopener noreferrer"
        className="youtube-subscribe-btn"
      >
        ▶ Subscribe on YouTube
      </a>
        </div>
        <div className="hero-card">
          <div className="hero-orbit">📚</div>
          <strong>Everything in one place</strong>
          <span>Notes · PYQs · MCQs · Revision</span>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">START LEARNING</span>
            <h2>Choose your subject</h2>
          </div>
          <Link to="/subjects">View all →</Link>
        </div>

        <div className="subject-grid">
          {subjects.map(s => (
            <Link className="subject-card" key={s._id} to={`/subject/${s.slug}`}>
              <span className="subject-icon">{s.icon}</span>
              <div>
                <h3>{s.name}</h3>
                <p>{s.description || "Chapter-wise study material"}</p>
              </div>
              <span className="arrow">→</span>
            </Link>
          ))}
        </div>

        {!subjects.length && <Empty text="Subjects will appear here once the admin adds them." />}

        <Link className="pyq-banner" to="/pyqs">
          <span className="pyq-icon">📄</span>
          <div>
            <strong>Previous Year Questions</strong>
            <span>Download PYQ PDFs for every subject in one place.</span>
          </div>
          <b>View PYQs →</b>
        </Link>
      </section>
    </>
  );
}

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  useEffect(() => { api.get("/public/subjects").then(r => setSubjects(r.data)); }, []);

  return (
    <section className="section page">
      <span className="eyebrow">STUDY MATERIAL</span>
      <h1>All Subjects</h1>
      <p className="muted">Pick a subject and start with any chapter.</p>
      <div className="subject-grid">
        {subjects.map(s => (
          <Link className="subject-card" key={s._id} to={`/subject/${s.slug}`}>
            <span className="subject-icon">{s.icon}</span>
            <div><h3>{s.name}</h3><p>{s.description || "View chapters →"}</p></div>
            <span className="arrow">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SubjectPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/public/subjects/${slug}`)
      .then(r => setData(r.data))
      .catch(() => setError("Subject not found"));
  }, [slug]);

  if (error) return <section className="section page"><Empty text={error} /></section>;
  if (!data) return <Loader />;

  return (
    <section className="section page">
      <Link className="back" to="/subjects">← All subjects</Link>
      <span className="eyebrow">{data.subject.icon} {data.subject.name}</span>
      <h1>{data.subject.name}</h1>
      <p className="muted">{data.subject.description}</p>

      <div className="chapter-list">
        {data.chapters.map((chapter, i) => (
          <Link className="chapter-row" key={chapter._id} to={`/chapter/${chapter._id}`}>
            <span className="chapter-no">{String(i + 1).padStart(2, "0")}</span>
            <div><strong>{chapter.name}</strong><small>{chapter.description || "Notes & resources"}</small></div>
            <span>→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ChapterPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  const load = () => api.get(`/public/chapters/${id}`).then(r => setData(r.data));
  useEffect(() => { load(); }, [id]);

  const download = async (resource) => {
    const r = await api.post(`/public/resources/${resource._id}/download`);
    window.open(r.data.fileUrl, "_blank");
  };

  if (!data) return <Loader />;

  return (
    <section className="section page">
      <Link className="back" to={`/subject/${data.chapter.subject.slug}`}>← Back to {data.chapter.subject.name}</Link>
      <span className="eyebrow">CHAPTER</span>
      <h1>{data.chapter.name}</h1>
      <p className="muted">{data.chapter.description}</p>

      <div className="resource-grid">
        {data.resources.map(r => (
          <article className="resource-card" key={r._id}>
            <span className="resource-type">{r.type}</span>
            <h3>{r.title}</h3>
            <p>{r.description || "Study resource for this chapter."}</p>
            <div className="resource-actions">
              {r.fileUrl && <button onClick={() => download(r)}>📄 View / Download PDF</button>}
              {r.youtubeUrl && <a href={r.youtubeUrl} target="_blank" rel="noreferrer">▶ Watch video</a>}
            </div>
          </article>
        ))}
      </div>

      {!data.resources.length && <Empty text="Resources are coming soon for this chapter." />}
    </section>
  );
}

function PYQs() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/public/pyqs")
      .then(r => setSubjects(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <section className="section page">
      <span className="eyebrow">PREVIOUS YEAR QUESTIONS</span>
      <h1>PYQs</h1>
      <p className="muted">Choose a subject to find all uploaded previous-year question paper PDFs.</p>

      <div className="subject-grid pyq-subject-grid">
        {subjects.map(s => (
          <Link className="subject-card" key={s._id} to={`/pyqs/${s.slug}`}>
            <span className="subject-icon">{s.icon}</span>
            <div><h3>{s.name}</h3><p>View all PYQ PDFs →</p></div>
            <span className="arrow">→</span>
          </Link>
        ))}
      </div>

      {!subjects.length && <Empty text="Subjects will appear here once the admin adds them." />}
    </section>
  );
}

function PYQSubjectPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/public/pyqs/${slug}`)
      .then(r => setData(r.data))
      .catch(() => setError("Subject not found"));
  }, [slug]);

  const download = async (resource) => {
    const r = await api.post(`/public/resources/${resource._id}/download`);
    window.open(r.data.fileUrl, "_blank");
  };

  if (error) return <section className="section page"><Empty text={error} /></section>;
  if (!data) return <Loader />;

  return (
    <section className="section page">
      <Link className="back" to="/pyqs">← All subjects</Link>
      <span className="eyebrow">{data.subject.icon} {data.subject.name} · PYQs</span>
      <h1>{data.subject.name} PYQs</h1>
      <p className="muted">All previous-year question paper PDFs uploaded for {data.subject.name}.</p>

      <div className="pyq-list">
        {data.resources.map((r, i) => (
          <article className="pyq-row" key={r._id}>
            <span className="pyq-number">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <strong>{r.title}</strong>
              <small>Previous Year Question Paper</small>
              {r.description && <p>{r.description}</p>}
            </div>
            <button onClick={() => download(r)}>📄 Download PDF</button>
          </article>
        ))}
      </div>

      {!data.resources.length && <Empty text={`No PYQ PDFs have been uploaded for ${data.subject.name} yet.`} />}
    </section>
  );
}

function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setError("");
    try {
      const r = await api.post("/auth/login", form);
      localStorage.setItem("unseen_admin_token", r.data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <span className="brand-mark large">U</span>
        <span className="eyebrow">ADMIN ACCESS</span>
        <h1>Welcome back</h1>
        <p className="muted">Only the site administrator can access this area.</p>
        {error && <div className="error">{error}</div>}
        <label>Email<input type="email" required value={form.email} onChange={e => setForm({...form, email:e.target.value})} /></label>
        <label>Password<input type="password" required value={form.password} onChange={e => setForm({...form, password:e.target.value})} /></label>
        <button className="primary-btn full">Login securely</button>
      </form>
    </section>
  );
}

function Protected({ children }) {
  return localStorage.getItem("unseen_admin_token") ? children : <Navigate to="/admin/login" replace />;
}

function Admin() {
  const [stats, setStats] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [resources, setResources] = useState([]);
  const [tab, setTab] = useState("resources");
  const [message, setMessage] = useState("");

  const [subjectForm, setSubjectForm] = useState({ name:"", description:"", icon:"📚", order:0 });
  const [chapterForm, setChapterForm] = useState({ subject:"", name:"", description:"", order:0 });
  const [resourceForm, setResourceForm] = useState({
    subject:"", chapter:"", title:"", type:"Notes", description:"", youtubeUrl:"", published:true, file:null
  });
  const [pyqForm, setPyqForm] = useState({
    subject:"", title:"", description:"", published:true, file:null
  });

  const headers = useMemo(() => authConfig(), []);

  const loadAll = async () => {
    try {
      const [s, c, r, st] = await Promise.all([
        api.get("/admin/subjects", headers),
        api.get("/admin/chapters", headers),
        api.get("/admin/resources", headers),
        api.get("/admin/stats", headers)
      ]);
      setSubjects(s.data); setChapters(c.data); setResources(r.data); setStats(st.data);
      if (!chapterForm.subject && s.data[0]) setChapterForm(f => ({...f, subject:s.data[0]._id}));
      if (!resourceForm.subject && s.data[0]) setResourceForm(f => ({...f, subject:s.data[0]._id}));
      if (!pyqForm.subject && s.data[0]) setPyqForm(f => ({...f, subject:s.data[0]._id}));
    } catch (e) {
      if (e.response?.status === 401) logout();
    }
  };

  useEffect(() => { loadAll(); }, []);

  const logout = () => {
    localStorage.removeItem("unseen_admin_token");
    location.href = "/admin/login";
  };

  const addSubject = async e => {
    e.preventDefault();
    await api.post("/admin/subjects", subjectForm, headers);
    setSubjectForm({name:"",description:"",icon:"📚",order:0});
    setMessage("Subject added."); loadAll();
  };

  const addChapter = async e => {
    e.preventDefault();
    await api.post("/admin/chapters", chapterForm, headers);
    setChapterForm(f => ({...f,name:"",description:"",order:0}));
    setMessage("Chapter added."); loadAll();
  };

  const addResource = async e => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(resourceForm).forEach(([k,v]) => {
      if (k === "file") { if (v) fd.append("file", v); }
      else fd.append(k, v);
    });
    await api.post("/admin/resources", fd, {
      headers: { ...headers.headers, "Content-Type": "multipart/form-data" }
    });
    setResourceForm(f => ({...f,title:"",description:"",youtubeUrl:"",file:null}));
    document.getElementById("pdf-input").value = "";
    setMessage("Resource uploaded."); loadAll();
  };

  const addPYQ = async e => {
    e.preventDefault();

    if (!pyqForm.file) {
      setMessage("Please select a PDF file.");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("subject", pyqForm.subject);
      fd.append("title", pyqForm.title);
      fd.append("description", pyqForm.description);
      fd.append("published", pyqForm.published);
      fd.append("file", pyqForm.file);

      await api.post("/admin/pyqs", fd, {
        headers: { ...headers.headers, "Content-Type": "multipart/form-data" }
      });

      setPyqForm(f => ({...f, title:"", description:"", file:null}));
      const input = document.getElementById("pyq-pdf-input");
      if (input) input.value = "";
      setMessage("PYQ uploaded successfully.");
      loadAll();
    } catch (e) {
      setMessage(e.response?.data?.message || "Failed to upload PYQ.");
    }
  };

  const remove = async (kind, id) => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    await api.delete(`/admin/${kind}/${id}`, headers);
    setMessage("Deleted."); loadAll();
  };

  const selectedChapters = chapters.filter(c => c.subject?._id === resourceForm.subject);

  return (
    <section className="admin-shell">
      <aside className="sidebar">
        <Link className="brand" to="/"><span className="brand-mark">U</span><strong>UNSEEN CLASS</strong></Link>
        <button className={tab==="resources"?"active":""} onClick={()=>setTab("resources")}>📄 Resources</button>
        <button className={tab==="pyqs"?"active":""} onClick={()=>setTab("pyqs")}>📑 PYQs</button>
        <button className={tab==="chapters"?"active":""} onClick={()=>setTab("chapters")}>📚 Chapters</button>
        <button className={tab==="subjects"?"active":""} onClick={()=>setTab("subjects")}>📘 Subjects</button>
        <div className="sidebar-bottom"><Link to="/" target="_blank">View website ↗</Link><button onClick={logout}>Logout</button></div>
      </aside>

      <main className="admin-main">
        <div className="admin-top">
          <div><span className="eyebrow">ADMIN PANEL</span><h1>Dashboard</h1></div>
          <span className="admin-badge">🔒 Admin</span>
        </div>

        {message && <div className="success">{message}</div>}

        <div className="stats">
          {[
            ["Subjects", stats?.subjects ?? "—", "📘"],
            ["Chapters", stats?.chapters ?? "—", "📚"],
            ["Resources", stats?.resources ?? "—", "📄"],
            ["Downloads", stats?.downloads ?? "—", "⬇️"]
          ].map(([label,value,icon]) => <div className="stat" key={label}><span>{icon}</span><div><strong>{value}</strong><small>{label}</small></div></div>)}
        </div>

        {tab === "resources" && (
          <>
            <div className="panel">
              <div className="panel-title"><div><h2>Upload resource</h2><p>Add a PDF, video link or both.</p></div></div>
              <form className="form-grid" onSubmit={addResource}>
                <label>Subject<select required value={resourceForm.subject} onChange={e=>setResourceForm({...resourceForm,subject:e.target.value,chapter:""})}><option value="">Select subject</option>{subjects.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}</select></label>
                <label>Chapter<select required value={resourceForm.chapter} onChange={e=>setResourceForm({...resourceForm,chapter:e.target.value})}><option value="">Select chapter</option>{selectedChapters.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select></label>
                <label>Title<input required value={resourceForm.title} onChange={e=>setResourceForm({...resourceForm,title:e.target.value})} placeholder="e.g. Gravitation Complete Notes" /></label>
                <label>Type<select value={resourceForm.type} onChange={e=>setResourceForm({...resourceForm,type:e.target.value})}>{["Notes","Important Questions","MCQ","PYQ","Formula Sheet","Other"].map(x=><option key={x}>{x}</option>)}</select></label>
                <label className="full-field">Description<textarea value={resourceForm.description} onChange={e=>setResourceForm({...resourceForm,description:e.target.value})} /></label>
                <label>PDF file<input id="pdf-input" type="file" accept="application/pdf" onChange={e=>setResourceForm({...resourceForm,file:e.target.files[0]})} /></label>
                <label>YouTube URL<input value={resourceForm.youtubeUrl} onChange={e=>setResourceForm({...resourceForm,youtubeUrl:e.target.value})} placeholder="https://youtube.com/..." /></label>
                <label className="check"><input type="checkbox" checked={resourceForm.published} onChange={e=>setResourceForm({...resourceForm,published:e.target.checked})} /> Publish immediately</label>
                <button className="primary-btn full-field">Upload resource</button>
              </form>
            </div>

            <div className="panel">
              <div className="panel-title"><h2>All resources</h2><span>{resources.length} total</span></div>
              <div className="table-wrap"><table><thead><tr><th>Title</th><th>Subject</th><th>Chapter</th><th>Type</th><th>Downloads</th><th></th></tr></thead><tbody>
                {resources.map(r=><tr key={r._id}><td><strong>{r.title}</strong><small>{r.published?"Published":"Draft"}</small></td><td>{r.subject?.name}</td><td>{r.chapter?.name}</td><td>{r.type}</td><td>{r.downloads}</td><td><button className="danger-btn" onClick={()=>remove("resources",r._id)}>Delete</button></td></tr>)}
              </tbody></table></div>
            </div>
          </>
        )}

        {tab === "pyqs" && (
          <>
            <div className="panel">
              <div className="panel-title">
                <div>
                  <h2>Upload subject-wise PYQ</h2>
                  <p>Upload a previous-year question paper directly under a subject. No chapter is required.</p>
                </div>
              </div>

              <form className="form-grid" onSubmit={addPYQ}>
                <label>
                  Subject
                  <select
                    required
                    value={pyqForm.subject}
                    onChange={e=>setPyqForm({...pyqForm,subject:e.target.value})}
                  >
                    <option value="">Select subject</option>
                    {subjects.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </label>

                <label>
                  Title
                  <input
                    required
                    value={pyqForm.title}
                    onChange={e=>setPyqForm({...pyqForm,title:e.target.value})}
                    placeholder="e.g. Science 1 March 2025"
                  />
                </label>

                <label className="full-field">
                  Description
                  <textarea
                    value={pyqForm.description}
                    onChange={e=>setPyqForm({...pyqForm,description:e.target.value})}
                    placeholder="e.g. Maharashtra SSC Board March 2025 Question Paper"
                  />
                </label>

                <label>
                  PDF file
                  <input
                    id="pyq-pdf-input"
                    type="file"
                    accept="application/pdf"
                    required
                    onChange={e=>setPyqForm({...pyqForm,file:e.target.files[0]})}
                  />
                </label>

                <label className="check">
                  <input
                    type="checkbox"
                    checked={pyqForm.published}
                    onChange={e=>setPyqForm({...pyqForm,published:e.target.checked})}
                  />
                  Publish immediately
                </label>

                <button className="primary-btn full-field">Upload PYQ</button>
              </form>
            </div>

            <div className="panel">
              <div className="panel-title">
                <div>
                  <h2>Subject-wise PYQs</h2>
                  <p>These PYQs are independent of chapters.</p>
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Title</th><th>Subject</th><th>Downloads</th><th></th></tr>
                  </thead>
                  <tbody>
                    {resources.filter(r=>r.type === "PYQ" && r.scope === "subject").map(r=>(
                      <tr key={r._id}>
                        <td><strong>{r.title}</strong><small>{r.published ? "Published" : "Draft"}</small></td>
                        <td>{r.subject?.name}</td>
                        <td>{r.downloads}</td>
                        <td><button className="danger-btn" onClick={()=>remove("resources",r._id)}>Delete</button></td>
                      </tr>
                    ))}
                    {!resources.some(r=>r.type === "PYQ" && r.scope === "subject") && (
                      <tr><td colSpan="4">No subject-wise PYQs uploaded yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "subjects" && (
          <>
            <div className="panel"><div className="panel-title"><h2>Add subject</h2></div>
              <form className="form-grid" onSubmit={addSubject}>
                <label>Name<input required value={subjectForm.name} onChange={e=>setSubjectForm({...subjectForm,name:e.target.value})} placeholder="Science 1" /></label>
                <label>Icon<input value={subjectForm.icon} onChange={e=>setSubjectForm({...subjectForm,icon:e.target.value})} /></label>
                <label>Description<input value={subjectForm.description} onChange={e=>setSubjectForm({...subjectForm,description:e.target.value})} /></label>
                <label>Order<input type="number" value={subjectForm.order} onChange={e=>setSubjectForm({...subjectForm,order:e.target.value})} /></label>
                <button className="primary-btn">Add subject</button>
              </form>
            </div>
            <div className="panel"><div className="panel-title"><h2>Subjects</h2></div>
              <div className="manage-list">{subjects.map(s=><div className="manage-row" key={s._id}><span>{s.icon}</span><div><strong>{s.name}</strong><small>{s.description}</small></div><button className="danger-btn" onClick={()=>remove("subjects",s._id)}>Delete</button></div>)}</div>
            </div>
          </>
        )}

        {tab === "chapters" && (
          <>
            <div className="panel"><div className="panel-title"><h2>Add chapter</h2></div>
              <form className="form-grid" onSubmit={addChapter}>
                <label>Subject<select required value={chapterForm.subject} onChange={e=>setChapterForm({...chapterForm,subject:e.target.value})}><option value="">Select</option>{subjects.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}</select></label>
                <label>Chapter name<input required value={chapterForm.name} onChange={e=>setChapterForm({...chapterForm,name:e.target.value})} placeholder="Gravitation" /></label>
                <label>Description<input value={chapterForm.description} onChange={e=>setChapterForm({...chapterForm,description:e.target.value})} /></label>
                <label>Order<input type="number" value={chapterForm.order} onChange={e=>setChapterForm({...chapterForm,order:e.target.value})} /></label>
                <button className="primary-btn">Add chapter</button>
              </form>
            </div>
            <div className="panel"><div className="panel-title"><h2>Chapters</h2></div>
              <div className="manage-list">{chapters.map(c=><div className="manage-row" key={c._id}><span>📖</span><div><strong>{c.name}</strong><small>{c.subject?.name}</small></div><button className="danger-btn" onClick={()=>remove("chapters",c._id)}>Delete</button></div>)}</div>
            </div>
          </>
        )}
      </main>
    </section>
  );
}

function Loader(){ return <div className="loader">Loading…</div>; }
function Empty({text}){ return <div className="empty">{text}</div>; }

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subject/:slug" element={<SubjectPage />} />
          <Route path="/chapter/:id" element={<ChapterPage />} />
          <Route path="/pyqs" element={<PYQs />} />
          <Route path="/pyqs/:slug" element={<PYQSubjectPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Protected><Admin /></Protected>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
