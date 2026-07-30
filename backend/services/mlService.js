const { spawn } = require("child_process");
const path = require("path");

const getMLRecommendations = (userData = {}) => {
  return new Promise((resolve, reject) => {

    const pythonPath =
      process.platform === "win32"
        ? path.join(__dirname, "../venv/Scripts/python.exe")
        : path.join(__dirname, "../venv/bin/python");

    const scriptPath = path.join(
      __dirname,
      "../ml/recommend.py"
    );

    console.log("Python Path:", pythonPath);
    console.log("Script Path:", scriptPath);

    const python = spawn(pythonPath, [
      scriptPath,
      JSON.stringify(userData),
    ]);

    let data = "";
    let error = "";

    python.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });

    python.stderr.on("data", (chunk) => {
      error += chunk.toString();
    });

    python.on("error", (err) => {
      console.error("Spawn Error:", err);
      reject(err);
    });

    python.on("close", (code) => {
      console.log("Exit Code:", code);

      if (code !== 0) {
        console.error(error);
        return reject(error);
      }

      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
  });
};

module.exports = {
  getMLRecommendations,
};