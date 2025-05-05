module.exports = {
  async headers() {
    return [
      {
        source: "/form-data.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/json; charset=utf-8"
          }
        ]
      }
    ];
  }
};
