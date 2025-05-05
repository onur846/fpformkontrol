import { useEffect, useState } from "react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState([]);

  const handleCheck = async () => {
    const matches = inputText.match(/\b\d{6}\b/g); // 6 haneli form numaraları
    if (!matches) {
      setResults([{ form: "Hiçbir form numarası bulunamadı.", operator: null }]);
      return;
    }

    const uniqueForms = [...new Set(matches)];

    try {
      const res = await fetch("/form-data.json");
      const data = await res.json();

      const output = uniqueForms.map((form) => ({
        form,
        operator: data[form] || "⚠️ Sistemde yok",
      }));

      setResults(output);
    } catch (err) {
      setResults([{ form: "form-data.json okunamadı", operator: null }]);
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20, fontFamily: "Arial" }}>
      <h2>Form Sorgulama</h2>
      <textarea
        style={{ width: "100%", height: 150 }}
        placeholder="Metni buraya yapıştırın..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button onClick={handleCheck} style={{ padding: "10px 20px", marginTop: 10 }}>
        Sorgula
      </button>

      <ul style={{ paddingTop: 20 }}>
        {results.map((item, idx) => (
          <li key={idx}>
            {item.form} {item.operator && `→ ${item.operator.toUpperCase()}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
