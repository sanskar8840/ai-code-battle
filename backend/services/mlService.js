const { spawn } = require("child_process");
const path = require("path");

const getMLRecommendations = (userData = {}) => {
  return new Promise((resolve, reject) => {

    const pythonPath = path.join(
      __dirname,
      "../../ml/venv/Scripts/python.exe"
    );

    const scriptPath = path.join(
      __dirname,
      "../../ml/recommend.py"
    );

    console.log("Python Path:", pythonPath);
    console.log("Script Path:", scriptPath);

    // User data -> JSON
    const jsonInput = JSON.stringify(userData);

    // Python call with JSON argument
    const python = spawn(
      pythonPath,
      [
        scriptPath,
        jsonInput
      ]
    );

    let data = "";
    let error = "";

    python.stdout.on("data", (chunk) => {
      console.log("STDOUT:", chunk.toString());
      data += chunk.toString();
    });

    python.stderr.on("data", (chunk) => {
      console.log("STDERR:", chunk.toString());
      error += chunk.toString();
    });

    python.on("close", (code) => {

      console.log("Exit Code:", code);

      if (code !== 0) {
        return reject(error);
      }

      try {
        const json = JSON.parse(data.trim());
        resolve(json);
      } catch (err) {
        console.error("JSON Parse Error:", err);
        reject(err);
      }

    });

  });
};

module.exports = {
  getMLRecommendations,
};