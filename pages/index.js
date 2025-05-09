import { useEffect, useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({});
  const [inputText, setInputText] = useState("");
  const [groupedResults, setGroupedResults] = useState({});
  const [searchForm, setSearchForm] = useState("");
  const [searchResult, setSearchResult] = useState("");

  useEffect(() => {
    fetch("/form-data.json")
      .then((res) => res.json())
      .then((data) => setFormData(data))
      .catch((err) => console.error("form-data.json okunamadı", err));
  }, []);

  const extractTimeInfo = (text, form) => {
    const line = text.split("\n").find((l) => l.includes(form));
    if (!line) return "";
    const hourMatch = line.match(/\b\d{1,2}:\d{2}\b/);
    const relativeMatch = line.match(/\b(dün|bugün|yarın)\b/i);
    return hourMatch?.[0] || relativeMatch?.[0] || "";
  };

  const handleCheck = () => {
    const matches = inputText.match(/\b1\d{5}\b/g); // sadece 1 ile başlayanlar
    if (!matches) {
      setGroupedResults({ "❌ Hiçbir form numarası bulunamadı": [] });
      return;
    }

    const uniqueForms = [...new Set(matches)];
    const groups = {};

    uniqueForms.forEach((form) => {
      const operator = formData[form] || "Uğur / Merve / Risk Onayı Bekleyen Cihaz / Ankara Cihazı";
      const timeInfo = extractTimeInfo(inputText, form);
      if (!groups[operator]) groups[operator] = [];
      groups[operator].push({ form, timeInfo });
    });

    setGroupedResults(groups);
  };

  const handleClear = () => {
    setInputText("");
    setGroupedResults({});
  };

  const handleSearch = () => {
    const clean = searchForm.trim();
    if (!/^1\d{5}$/.test(clean)) {
      setSearchResult("❌ Lütfen 1 ile başlayan 6 haneli geçerli bir form numarası girin.");
      return;
    }
    const owner = formData[clean];
    setSearchResult(owner ? `✅ ${clean} → ${owner.toUpperCase()}` : `⚠️ ${clean} sistemde bulunamadı.`);
  };

  const operatorOrder = [
    "onur",
    "yunus",
    "kübra",
    "görkay",
    "Uğur / Merve / Risk Onayı Bekleyen Cihaz / Ankara Cihazı",
  ];

  const sortedGroupedResults = operatorOrder.reduce((acc, operator) => {
    const foundKey = Object.keys(groupedResults).find(
      (key) => key.toLowerCase() === operator.toLowerCase()
    );
    if (foundKey) acc[foundKey] = groupedResults[foundKey];
    return acc;
  }, {});

  return (
    <div
      style={{
        background: "#2471A3",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 800,
          background: "#2471A3",
          padding: 30,
          borderRadius: 16,
          boxSizing: "border-box",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <img
          src="https://fpprotr.com/wp-content/uploads/2023/04/fppro-logo-symbol-white-nosubtitle.png"
          alt="Logo"
          style={{ maxWidth: 180, display: "block", margin: "0 auto 20px" }}
        />
        <h2 style={{ textAlign: "center", marginBottom: 30, fontSize: 26 }}>
          Form Numarası Sorgulama
        </h2>

        {/* Tekli form arama */}
        <div style={{ marginBottom: 40 }}>
          <input
            type="text"
            value={searchForm}
            onChange={(e) => setSearchForm(e.target.value)}
            placeholder="Form numarası gir (örn: 123456)"
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 10,
              fontSize: 16,
              borderRadius: 6,
              border: "1px solid #ccc",
              backgroundColor: "#1e5d8f",
              color: "#fff",
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: "10px 24px",
              fontSize: 16,
              background: "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: 6,
            }}
          >
            Sorgula
          </button>
          {searchResult && <p style={{ marginTop: 12, fontWeight: 500 }}>{searchResult}</p>}
        </div>

        <hr style={{ margin: "30px 0", borderColor: "#fff" }} />

        {/* Çoklu form sorgulama */}
        <div style={{ marginBottom: 30 }}>
          <textarea
            style={{
              width: "100%",
              height: 140,
              padding: 12,
              fontSize: 15,
              borderRadius: 6,
              border: "1px solid #ccc",
              backgroundColor: "#1e5d8f",
              color: "#fff",
            }}
            placeholder="Toplu metni buraya yapıştırın..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button
              onClick={handleCheck}
              style={{
                flex: 1,
                padding: "10px 24px",
                fontSize: 16,
                background: "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: 6,
              }}
            >
              Toplu Sorgula
            </button>
            <button
              onClick={handleClear}
              style={{
                flex: 1,
                padding: "10px 24px",
                fontSize: 16,
                background: "#a94442",
                color: "#fff",
                border: "none",
                borderRadius: 6,
              }}
            >
              Temizle
            </button>
          </div>
        </div>

        {/* Gruplanmış sonuçlar */}
        {Object.keys(sortedGroupedResults).length > 0 && (
          <div style={{ marginTop: 40 }}>
            {Object.entries(sortedGroupedResults).map(([operator, forms], idx) => (
              <div key={idx} style={{ marginBottom: 30 }}>
                <h3 style={{ borderBottom: "1px solid #fff", paddingBottom: 6, marginBottom: 10, fontSize: 18 }}>
                  {operator.toUpperCase()}
                </h3>
                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                  {forms.map((item, i) => (
                    <li key={i} style={{ marginBottom: 6, fontSize: 16 }}>
                      • {item.form}{" "}
                      {item.timeInfo && (
                        <span style={{ color: "#ddd", fontStyle: "italic" }}>
                          ({item.timeInfo})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
