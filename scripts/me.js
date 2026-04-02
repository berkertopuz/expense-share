const fs = require("fs");
const path = require("path");

const translations = JSON.parse(fs.readFileSync("./translations/tr.json", "utf8"));

// Tüm key'leri düzleştir
function flattenKeys(obj, prefix = "") {
  return Object.keys(obj).reduce((acc, key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      acc.push(...flattenKeys(obj[key], fullKey));
    } else {
      acc.push(fullKey);
    }
    return acc;
  }, []);
}

const allKeys = flattenKeys(translations);

// src klasöründe ara
function searchInFiles(dir) {
  let content = "";
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory() && !file.name.includes("node_modules")) {
      content += searchInFiles(fullPath);
    } else if (file.name.match(/\.(tsx?|jsx?)$/)) {
      content += fs.readFileSync(fullPath, "utf8");
    }
  }
  return content;
}

const srcContent = searchInFiles("./src");

// Kullanılmayanları bul
const unused = allKeys.filter((key) => !srcContent.includes(key));

console.log("Kullanılmayan key'ler:");
unused.forEach((k) => console.log(`  - ${k}`));
console.log(`\nToplam: ${unused.length}/${allKeys.length}`);
