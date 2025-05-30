import { useState } from "react";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [forms, setForms] = useState("");
  const [operator, setOperator] = useState("onur");
  const [message, setMessage] = useState("");

  const login = () => {
    if (password === "Fp9097") {
      setAuthenticated(true);
    } else {
      alert("❌ Şifre yanlış.");
    }
  };

  const toBase64 = (str) => {
    const utf8 = new TextEncoder().encode(str);
    let binary = "";
    utf8.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  };

  const fromBase64 = (str) => {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  };

  const guncelle = async () => {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    const owner = "onur846";
    const repo = "fpformkontrol";
    const path = "public/form-data.json";

    const formArray = forms
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => /^\d{6}$/.test(f));

    if (formArray.length === 0) {
      setMessage("❌ Geçerli form numarası bulunamadı.");
      return;
    }

    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      const file = await res.json();
      const currentData = JSON.parse(fromBase64(file.content));

      formArray.forEach((form) => {
        currentData[form] = operator;
      });

      const updatedContent = toBase64(JSON.stringify(currentData, null, 2));

      const updateRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: `Formlar güncellendi: ${operator}`,
          content: updatedContent,
          sha: file.sha,
        }),
      });

      if (updateRes.ok) {
        setMessage("✅ Formlar başarıyla güncellendi.");
        setForms("");
      } else {
        const err = await updateRes.json();
        throw new Error(err.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Hata: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20, fontFamily: "Arial" }}>
      <h2>Admin Paneli</h2>

      {!authenticated ? (
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=""
            style={{ width: "100%", padding: 10 }}
          />
          <button onClick={login} style={{ marginTop: 10, padding: "10px 20px" }}>
            Giriş Yap
          </button>
        </div>
      ) : (
        <div>
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          >
            <option value="onur">Onur</option>
            <option value="yunus">Yunus</option>
            <option value="kübra">Kübra</option>
            <option value="görkay">Görkay</option>
          </select>
          <textarea
            value={forms}
            onChange={(e) => setForms(e.target.value)}
            placeholder="123456&#10;123457"
            style={{ width: "100%", height: 150, marginBottom: 10 }}
          />
          <button onClick={guncelle} style={{ padding: "10px 20px" }}>
            Güncelle
          </button>
          <p style={{ marginTop: 10 }}>{message}</p>
        </div>
      )}
    </div>
  );
}
