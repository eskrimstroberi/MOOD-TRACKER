import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

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
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setMoods([]);
    setMessage("Logout berhasil");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", fontFamily: "Arial" }}>
      <h1>Mood Tracker</h1>
      <p>Frontend React terhubung ke FastAPI</p>

      {message && (
        <div style={{ marginBottom: "16px", padding: "12px", background: "#eef", borderRadius: "8px" }}>
          {message}
        </div>
      )}

      {!token ? (
        <div style={{ border: "1px solid #ddd", padding: "16px", borderRadius: "10px" }}>
          <h2>Login</h2>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              required
              style={{ padding: "10px" }}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
              style={{ padding: "10px" }}
            />
            <button type="submit" style={{ padding: "10px" }}>Login</button>
          </form>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button onClick={fetchMoods}>Refresh</button>
            <button onClick={handleLogout}>Logout</button>
          </div>

          <div style={{ border: "1px solid #ddd", padding: "16px", borderRadius: "10px", marginBottom: "20px" }}>
            <h2>{form.id ? "Edit Mood" : "Tambah Mood"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                type="text"
                placeholder="Nama"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                required
                style={{ padding: "10px" }}
              />

              <select
                value={form.mood}
                onChange={(e) => setForm({ ...form, mood: e.target.value })}
                required
                style={{ padding: "10px" }}
              >
                <option value="">Pilih mood</option>
                <option value="senang">Senang</option>
                <option value="sedih">Sedih</option>
                <option value="marah">Marah</option>
                <option value="capek">Capek</option>
                <option value="semangat">Semangat</option>
                <option value="santai">Santai</option>
              </select>

              <input
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                required
                style={{ padding: "10px" }}
              />

              <textarea
                placeholder="Catatan"
                value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                style={{ padding: "10px" }}
              />

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit">{form.id ? "Update" : "Tambah"}</button>
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      id: "",
                      nama: "",
                      mood: "",
                      catatan: "",
                      tanggal: "",
                    })
                  }
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div>
            <h2>Daftar Mood</h2>
            {moods.length === 0 ? (
              <p>Belum ada data mood.</p>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {moods.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "10px",
                      padding: "14px",
                      background: "#fafafa",
                    }}
                  >
                    <p><strong>Nama:</strong> {m.nama}</p>
                    <p><strong>Mood:</strong> {m.mood}</p>
                    <p><strong>Catatan:</strong> {m.catatan || "-"}</p>
                    <p><strong>Tanggal:</strong> {m.tanggal}</p>
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                      <button onClick={() => handleEdit(m)}>Edit</button>
                      <button onClick={() => handleDelete(m.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}