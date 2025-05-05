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
      // GitHub'dan dosyayı al
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      const file = await res.json();

      // ✅ UTF-8 güvenli base64 decode
      const binary = atob(file.content);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const decodedContent = new TextDecoder("utf-8").decode(bytes);
      const currentData = JSON.parse(decodedContent);

      // Yeni formları ekle
      formArray.forEach((form) => {
        currentData[form] = operator;
      });

      // ✅ UTF-8 güvenli base64 encode
      const encoded = new TextEncoder().encode(JSON.stringify(currentData, null, 2));
      const safeBase64 = btoa(String.fromCharCode(...encoded));

      // Güncelleme isteği gönder
      const updateRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: `Formlar güncellendi: ${operator}`,
          content: safeBase64,
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
