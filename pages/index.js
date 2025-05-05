import { useEffect, useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({});
  const [inputText, setInputText] = useState("");
  const [bulkResults, setBulkResults] = useState([]);
  const [searchForm, setSearchForm] = useState("");
  const [searchResult, setSearchResult] = useState("");

  // JSON dosyasını fetch + decode et (UTF-8 güvenli şekilde)
  useEffect(() => {
    fetch("/form-data.json")
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const decoded = new TextDecoder("utf-8").decode(new Uint8Array(buffer));
        const data = JSON.parse(decoded);
        setFormData(data);
      })
      .catch((err) => {
        console.error("form-data.json okunamadı", err);
        setFormData({});
      });
  }, []);

  const handleCheck = () => {
    const matches = inputText.match(/\b\d{6}\b/g);
    if (!matches) {
      setBulkResults([{ form: "Hiçbir form numarası bulunamadı.", operator: null }]);
      return;
    }

    const uniqueForms = [...new Set(matches)];
    const results = uniqueForms.map((form) => ({
      form,
      operator: formData[form] || "⚠️ Sistemde yok",
    }));
    setBulkResults(results);
  };

  const handleSearch = () => {
    const clean = searchForm.trim();
    if (!/^\d{6}$/.test(clean)) {
      setSearchResult("❌ Lütfen 6 haneli geçerli bir form numarası girin.");
      return;
    }
    const owner = formData[clean];
    setSearchResult(owner ? `✅ ${clean} → ${owner.toUpperCase()}` : `⚠️ ${clean} sistemde bulunamadı.`);
  };

  return (
    <div style={{ background: "#f1f3f6", minHeight: "100vh", padding: "20px", fontFamily: "Arial" }}>
      <div style={{ maxWidth: 700, margin: "auto", background: "#fff", padding: 30, borderRadius: 12, boxShadow: "0 0 10px rgba(0,0,0,0.05)" }}>
        <img src="/logo.png" alt="Logo" style={{ maxWidth: 200, display: "block", margin: "0 auto 20px" }} />
        <h2 style={{ textAlign: "center", marginBottom: 30 }}>Form Numarası Sorgulama</h2>

        {/* Tekli form arama */}
        <div style={{ marginBottom: 30 }}>
          <input
            type="text"
            value={searchForm}
            onChange={(e) => setSearchForm(e.target.value)}
            placeholder="Form numarası gir (örn: 123456)"
            style={{ width: "100%", padding: 10, marginBottom: 10, fontSize: 16 }}
          />
          <button onClick={handleSearch} style={{ padding: "10px 20px", fontSize: 16 }}>Sorgula</button>
          {searchResult && <p style={{ marginTop: 10 }}>{searchResult}</p>}
        </div>

        <hr />

        {/* Çoklu metin analizi */}
        <div style={{ marginTop: 30 }}>
          <textarea
            style={{ width: "100%", height: 120, padding: 10, fontSize: 15 }}
            placeholder="Toplu metni buraya yapıştırın..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button onClick={handleCheck} style={{ padding: "10px 20px", marginTop: 10, fontSize: 16 }}>
            Toplu Sorgula
          </button>

          <ul style={{ paddingTop: 20, lineHeight: 1.6 }}>
            {bulkResults.map((item, idx) => (
              <li key={idx}>
                {item.form} {item.operator && `→ ${item.operator.toUpperCase()}`}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
