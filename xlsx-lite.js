(() => {
  const decoder = new TextDecoder("utf-8");

  function readU16(bytes, offset) {
    return bytes[offset] | (bytes[offset + 1] << 8);
  }

  function readU32(bytes, offset) {
    return (
      bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)
    ) >>> 0;
  }

  function decode(bytes) {
    return decoder.decode(bytes);
  }

  function normalizePath(path) {
    const parts = [];
    for (const part of path.replace(/\\/g, "/").split("/")) {
      if (!part || part === ".") continue;
      if (part === "..") parts.pop();
      else parts.push(part);
    }
    return parts.join("/");
  }

  function resolveTarget(baseFile, target) {
    if (target.startsWith("/")) return normalizePath(target.slice(1));
    const baseDir = baseFile.split("/").slice(0, -1).join("/");
    return normalizePath(`${baseDir}/${target}`);
  }

  async function inflateRaw(data) {
    if (typeof DecompressionStream === "undefined") {
      throw new Error("Este navegador nao consegue descompactar arquivos .xlsx.");
    }

    const formats = ["deflate-raw", "deflate"];
    let lastError;

    for (const format of formats) {
      try {
        const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream(format));
        return new Uint8Array(await new Response(stream).arrayBuffer());
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  }

  function findEndOfCentralDirectory(bytes) {
    for (let i = bytes.length - 22; i >= 0; i--) {
      if (readU32(bytes, i) === 0x06054b50) return i;
    }

    throw new Error("Arquivo .xlsx invalido ou corrompido.");
  }

  function createZipReader(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    const eocd = findEndOfCentralDirectory(bytes);
    const entryCount = readU16(bytes, eocd + 10);
    let offset = readU32(bytes, eocd + 16);
    const entries = new Map();

    for (let i = 0; i < entryCount; i++) {
      if (readU32(bytes, offset) !== 0x02014b50) {
        throw new Error("Indice do .xlsx invalido.");
      }

      const method = readU16(bytes, offset + 10);
      const compressedSize = readU32(bytes, offset + 20);
      const fileNameLength = readU16(bytes, offset + 28);
      const extraLength = readU16(bytes, offset + 30);
      const commentLength = readU16(bytes, offset + 32);
      const localHeaderOffset = readU32(bytes, offset + 42);
      const fileName = decode(bytes.slice(offset + 46, offset + 46 + fileNameLength));

      const localFileNameLength = readU16(bytes, localHeaderOffset + 26);
      const localExtraLength = readU16(bytes, localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + localFileNameLength + localExtraLength;

      entries.set(normalizePath(fileName), {
        method,
        compressedSize,
        dataStart
      });

      offset += 46 + fileNameLength + extraLength + commentLength;
    }

    async function read(name) {
      const entry = entries.get(normalizePath(name));
      if (!entry) throw new Error(`Arquivo interno nao encontrado: ${name}`);

      const compressed = bytes.slice(entry.dataStart, entry.dataStart + entry.compressedSize);

      if (entry.method === 0) return compressed;
      if (entry.method === 8) return inflateRaw(compressed);

      throw new Error(`Metodo de compactacao nao suportado: ${entry.method}`);
    }

    async function text(name) {
      return decode(await read(name));
    }

    async function xml(name) {
      const doc = new DOMParser().parseFromString(await text(name), "application/xml");
      if (doc.getElementsByTagName("parsererror").length) {
        throw new Error(`XML invalido no arquivo interno: ${name}`);
      }
      return doc;
    }

    return {
      has: name => entries.has(normalizePath(name)),
      text,
      xml
    };
  }

  function getElements(parent, tagName) {
    return [...parent.getElementsByTagName(tagName)];
  }

  function getText(parent, tagName) {
    const node = parent.getElementsByTagName(tagName)[0];
    return node ? node.textContent : "";
  }

  function parseRelationships(doc) {
    const map = new Map();
    for (const rel of getElements(doc, "Relationship")) {
      map.set(rel.getAttribute("Id"), rel.getAttribute("Target"));
    }
    return map;
  }

  function parseSharedStrings(doc) {
    return getElements(doc, "si").map(si =>
      getElements(si, "t").map(t => t.textContent).join("")
    );
  }

  function columnIndexFromRef(ref) {
    const letters = String(ref || "").match(/[A-Z]+/i)?.[0] || "";
    let index = 0;

    for (const letter of letters.toUpperCase()) {
      index = index * 26 + letter.charCodeAt(0) - 64;
    }

    return Math.max(0, index - 1);
  }

  function valueFromCell(cell, sharedStrings) {
    const type = cell.getAttribute("t");

    if (type === "inlineStr") {
      return getElements(cell, "t").map(t => t.textContent).join("");
    }

    const value = getText(cell, "v");

    if (type === "s") return sharedStrings[Number(value)] || "";
    if (type === "b") return value === "1" ? "TRUE" : "FALSE";

    return value || "";
  }

  function parseWorksheet(doc, sharedStrings) {
    const rows = [];

    for (const row of getElements(doc, "row")) {
      const rowNumber = Number(row.getAttribute("r")) || rows.length + 1;
      const rowIndex = rowNumber - 1;
      const values = rows[rowIndex] || [];

      getElements(row, "c").forEach((cell, fallbackIndex) => {
        const colIndex = cell.getAttribute("r")
          ? columnIndexFromRef(cell.getAttribute("r"))
          : fallbackIndex;
        values[colIndex] = valueFromCell(cell, sharedStrings);
      });

      rows[rowIndex] = values;
    }

    return rows
      .filter(row => row && row.some(value => String(value || "").trim()))
      .map(row => row.map(value => String(value || "").trim()));
  }

  async function parseXlsx(file) {
    const zip = createZipReader(await file.arrayBuffer());
    const workbookDoc = await zip.xml("xl/workbook.xml");
    const relsDoc = await zip.xml("xl/_rels/workbook.xml.rels");
    const relationships = parseRelationships(relsDoc);
    const sharedStrings = zip.has("xl/sharedStrings.xml")
      ? parseSharedStrings(await zip.xml("xl/sharedStrings.xml"))
      : [];

    const sheets = [];

    for (const sheet of getElements(workbookDoc, "sheet")) {
      const id =
        sheet.getAttribute("r:id") ||
        sheet.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id");
      const target = relationships.get(id);

      if (!target) continue;

      const sheetPath = resolveTarget("xl/workbook.xml", target);
      const sheetDoc = await zip.xml(sheetPath);

      sheets.push({
        name: sheet.getAttribute("name") || `Aba ${sheets.length + 1}`,
        rows: parseWorksheet(sheetDoc, sharedStrings)
      });
    }

    if (!sheets.length) throw new Error("Nenhuma aba encontrada na planilha.");

    return {
      fileName: file.name,
      sheets
    };
  }

  function parseDelimited(text, delimiter) {
    const rows = [];
    let row = [];
    let value = "";
    let quoted = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (quoted) {
        if (char === '"' && next === '"') {
          value += '"';
          i++;
        } else if (char === '"') {
          quoted = false;
        } else {
          value += char;
        }
      } else if (char === '"') {
        quoted = true;
      } else if (char === delimiter) {
        row.push(value.trim());
        value = "";
      } else if (char === "\n") {
        row.push(value.trim());
        rows.push(row);
        row = [];
        value = "";
      } else if (char !== "\r") {
        value += char;
      }
    }

    row.push(value.trim());
    rows.push(row);

    return rows.filter(line => line.some(cell => cell));
  }

  async function parseDelimitedFile(file) {
    const text = await file.text();
    const delimiter = /\.tsv$/i.test(file.name)
      ? "\t"
      : text.includes("\t")
        ? "\t"
        : text.includes(";")
          ? ";"
          : ",";

    return {
      fileName: file.name,
      sheets: [
        {
          name: file.name.replace(/\.(csv|tsv)$/i, ""),
          rows: parseDelimited(text, delimiter)
        }
      ]
    };
  }

  async function parseWorkbook(file) {
    if (/\.xlsx$/i.test(file.name)) return parseXlsx(file);
    if (/\.(csv|tsv)$/i.test(file.name)) return parseDelimitedFile(file);

    throw new Error("Use arquivo .xlsx, .csv ou .tsv. Se estiver em .xls, salve como .xlsx.");
  }

  window.DiarioPlanilha = {
    parseWorkbook
  };
})();
