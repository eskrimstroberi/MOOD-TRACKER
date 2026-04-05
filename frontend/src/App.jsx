import { useEffect, useMemo, useState } from "react";
import "./index.css";

const API = "http://localhost:8001";

const moodEmoji = {
  senang: "😊",
  sedih: "😢",
  marah: "😡",
  capek: "😴",
  semangat: "🔥",
  santai: "😌",
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [moods, setMoods] = useState([]);
  const [message, setMessage] = useState("");

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [form, setForm] = useState({
    id: "",
    nama: "",
    mood: "",
    catatan: "",
    tanggal: "",
  });

  const fetchMoods = async () => {
    try {
      const res = await fetch(`${API}/api/moods`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Gagal ambil data mood");
      }

      setMoods(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMoods();
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login gagal");
      }

      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
      setMessage("Login berhasil");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const isEdit = form.id !== "";
    const url = isEdit ? `${API}/api/moods/${form.id}` : `${API}/api/moods`;
    const method = isEdit ? "PUT" : "POST";

    const payload = {
      nama: form.nama,
      mood: form.mood,
      catatan: form.catatan,
      tanggal: form.tanggal,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Gagal simpan mood");
      }

      setMessage(isEdit ? "Mood berhasil diupdate" : "Mood berhasil ditambahkan");
      setForm({
        id: "",
        nama: "",
        mood: "",
        catatan: "",
        tanggal: "",
      });
      fetchMoods();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/api/moods/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Gagal hapus mood");
      }

      setMessage("Mood berhasil dihapus");
      fetchMoods();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleEdit = (mood) => {
    setForm({
      id: mood.id,
      nama: mood.nama,
      mood: mood.mood,
      catatan: mood.catatan || "",
      tanggal: mood.tanggal,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setMoods([]);
    setMessage("Logout berhasil");
  };

  const resetForm = () => {
    setForm({
      id: "",
      nama: "",
      mood: "",
      catatan: "",
      tanggal: "",
    });
  };

  const stats = useMemo(() => {
    const total = moods.length;
    const uniqueUsers = new Set(moods.map((m) => m.nama)).size;
    const latest = moods.length > 0 ? moods[moods.length - 1].mood : "-";

    return { total, uniqueUsers, latest };
  }, [moods]);

  return (
    <div className="app-shell">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      <div className="container">
        <header className="hero-card">
          <div>
            <p className="eyebrow">DAILY EMOTION DASHBOARD</p>
            <h1>Mood Tracker</h1>
          </div>
          <div className="hero-badge">
            <span className="pulse-dot"></span>
            Active
          </div>
        </header>

        {message && <div className="alert-box">{message}</div>}

        {!token ? (
          <section className="single-panel">
            <div className="glass-card auth-card">
              <div className="card-head">
                <h2>Login</h2>
                <p>Masuk untuk mengakses data mood harian.</p>
              </div>

              <form onSubmit={handleLogin} className="form-grid">
                <div className="field">
                  <label>Username</label>
                  <input
                    type="text"
                    placeholder="Masukkan username"
                    value={loginForm.username}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, username: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="field">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Masukkan password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary full-width">
                  Login
                </button>
              </form>
            </div>
          </section>
        ) : (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Total Entries</span>
                <h3>{stats.total}</h3>
              </div>
              <div className="stat-card">
                <span className="stat-label">Unique Users</span>
                <h3>{stats.uniqueUsers}</h3>
              </div>
              <div className="stat-card">
                <span className="stat-label">Latest Mood</span>
                <h3 className="capitalize">
                  {stats.latest !== "-" ? `${moodEmoji[stats.latest] || ""} ${stats.latest}` : "-"}
                </h3>
              </div>
            </section>

            <section className="toolbar">
              <button onClick={fetchMoods} className="btn btn-secondary">
                Refresh
              </button>
              <button onClick={handleLogout} className="btn btn-danger">
                Logout
              </button>
            </section>

            <section className="content-grid">
              <div className="glass-card form-card">
                <div className="card-head">
                  <h2>{form.id ? "Edit Mood" : "Tambah Mood"}</h2>
                  <p>
                    {form.id
                      ? "Perbarui data mood yang sudah ada."
                      : "Tambahkan entri mood harian baru."}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="form-grid">
                  <div className="field">
                    <label>Nama</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama"
                      value={form.nama}
                      onChange={(e) => setForm({ ...form, nama: e.target.value })}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Mood</label>
                    <select
                      value={form.mood}
                      onChange={(e) => setForm({ ...form, mood: e.target.value })}
                      required
                    >
                      <option value="">Pilih mood</option>
                      <option value="senang">Senang</option>
                      <option value="sedih">Sedih</option>
                      <option value="marah">Marah</option>
                      <option value="capek">Capek</option>
                      <option value="semangat">Semangat</option>
                      <option value="santai">Santai</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Tanggal</label>
                    <input
                      type="date"
                      value={form.tanggal}
                      onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Catatan</label>
                    <textarea
                      placeholder="Tulis catatan singkat..."
                      value={form.catatan}
                      onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                      rows="5"
                    />
                  </div>

                  <div className="button-row">
                    <button type="submit" className="btn btn-primary">
                      {form.id ? "Update Mood" : "Tambah Mood"}
                    </button>
                    <button type="button" onClick={resetForm} className="btn btn-ghost">
                      Reset
                    </button>
                  </div>
                </form>
              </div>

              <div className="glass-card list-card">
                <div className="card-head">
                  <h2>Daftar Mood</h2>
                  <p>Semua entri mood yang sudah tersimpan.</p>
                </div>

                {moods.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🫥</div>
                    <p>Belum ada data mood.</p>
                  </div>
                ) : (
                  <div className="mood-list">
                    {moods.map((m) => (
                      <div className="mood-item" key={m.id}>
                        <div className="mood-item-top">
                          <div>
                            <h3>{m.nama}</h3>
                            <p className="date-text">{m.tanggal}</p>
                          </div>
                          <span className={`mood-badge mood-${m.mood}`}>
                            {moodEmoji[m.mood] || "🙂"} {m.mood}
                          </span>
                        </div>

                        <p className="note-text">{m.catatan || "Tidak ada catatan."}</p>

                        <div className="button-row small">
                          <button onClick={() => handleEdit(m)} className="btn btn-secondary">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(m.id)} className="btn btn-danger">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}