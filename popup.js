const arquivoEl = document.getElementById("arquivo");
const arquivoResumoEl = document.getElementById("arquivoResumo");
const excelControlesEl = document.getElementById("excelControles");
const planilhaEl = document.getElementById("planilha");
const colunaNomeEl = document.getElementById("colunaNome");
const colunaNotaEl = document.getElementById("colunaNota");
const dadosEl = document.getElementById("dados");
const preencherEl = document.getElementById("preencher");
const limparEl = document.getElementById("limpar");
const resumoEl = document.getElementById("resumo");
const detalhesEl = document.getElementById("detalhes");

const STORAGE_KEY = "diarioNotasEstadoV2";
const CONTENT_VERSION = "1.2.0";

let estado = {
  workbook: null,
  selectedSheetIndex: 0,
  selectedNameIndex: null,
  selectedNoteIndex: null,
  manualText: ""
};

function setResumo(texto, classe = "") {
  resumoEl.textContent = texto;
  resumoEl.className = `summary ${classe}`.trim();
}

function escapeHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mostrarDetalhes(itens) {
  detalhesEl.innerHTML = itens
    .map(item => {
      const classe =
        item.status === "PREENCHIDO" ? "ok" :
        item.status === "DUPLICADO/DUVIDOSO" ? "bad" :
        item.status === "IGNORADO/RISCADO" ? "skip" :
        item.status === "PREVIA" ? "muted" :
        "warn";

      const nota = item.nota ? ` - ${escapeHtml(item.nota)}` : "";
      const motivo = item.motivo ? ` <span class="muted">(${escapeHtml(item.motivo)})</span>` : "";
      return `<div class="item ${classe}"><strong>${escapeHtml(item.status)}</strong> ${escapeHtml(item.aluno || item.texto || "")}${nota}${motivo}</div>`;
    })
    .join("");
}

function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function columnLetter(index) {
  let value = index + 1;
  let letter = "";

  while (value > 0) {
    const mod = (value - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    value = Math.floor((value - mod) / 26);
  }

  return letter;
}

function isNomeHeader(header) {
  const h = normalizar(header);
  return ["NOME", "ALUNO", "ALUNOS", "ESTUDANTE", "DISCENTE"].some(term => h.includes(term));
}

function isIgnoredHeader(header) {
  const h = normalizar(header);
  return [
    "TIPO",
    "CODIGO",
    "COD",
    "MATRICULA",
    "ORD",
    "ORDEM",
    "SITUACAO",
    "STATUS",
    "FREQUENCIA",
    "FALTA"
  ].some(term => h === term || h.includes(term));
}

function isNotaHeader(header) {
  const h = normalizar(header);
  if (!h || isNomeHeader(h) || isIgnoredHeader(h)) return false;

  return [
    "NOTA",
    "PROVA",
    "AVALIACAO",
    "AVALIA",
    "ATIVIDADE",
    "TRABALHO",
    "TESTE",
    "RECUPERACAO",
    "SIMULADO"
  ].some(term => h.includes(term));
}

function looksLikeName(value) {
  const text = normalizar(value);
  if (!text || /\d/.test(text)) return false;

  const words = text.split(" ").filter(Boolean);
  return words.length >= 2 && text.length >= 8;
}

function noteNumber(value) {
  const text = String(value || "").trim().replace(/\s+/g, "").replace(",", ".");
  if (!/^\d{1,2}(\.\d+)?$/.test(text)) return null;

  const number = Number(text);
  if (!Number.isFinite(number) || number < 0 || number > 10) return null;

  return number;
}

function formatNota(value) {
  const text = String(value || "").trim();
  const number = noteNumber(text);

  if (number === null) return "";

  return number.toFixed(2).replace(".", ",");
}

function rowHasData(row) {
  return row && row.some(value => String(value || "").trim());
}

function maxCols(rows) {
  return rows.reduce((max, row) => Math.max(max, row?.length || 0), 0);
}

function scoreHeaderRow(row) {
  let score = 0;

  row.forEach(value => {
    if (isNomeHeader(value)) score += 5;
    if (isNotaHeader(value)) score += 3;
    if (isIgnoredHeader(value)) score += 1;
  });

  return score;
}

function analyzeSheet(sheet) {
  const rows = sheet.rows || [];
  const columnCount = maxCols(rows);
  const firstDataRow = rows.findIndex(rowHasData);
  let headerRowIndex = firstDataRow >= 0 ? firstDataRow : 0;
  let bestScore = -1;

  rows.slice(0, 20).forEach((row, index) => {
    const score = scoreHeaderRow(row || []);
    if (score > bestScore) {
      bestScore = score;
      headerRowIndex = index;
    }
  });

  const headerRow = rows[headerRowIndex] || [];
  const headers = Array.from({ length: columnCount }, (_, index) => {
    const value = String(headerRow[index] || "").trim();
    return value || `Coluna ${columnLetter(index)}`;
  });
  const dataRows = rows.slice(headerRowIndex + 1).filter(rowHasData);

  let nameIndex = headers.findIndex(isNomeHeader);

  if (nameIndex < 0) {
    let bestNameScore = -1;

    for (let col = 0; col < columnCount; col++) {
      if (isIgnoredHeader(headers[col])) continue;

      const score = dataRows.filter(row => looksLikeName(row[col])).length;
      if (score > bestNameScore) {
        bestNameScore = score;
        nameIndex = col;
      }
    }
  }

  const noteIndexes = [];

  for (let col = 0; col < columnCount; col++) {
    if (col === nameIndex || isIgnoredHeader(headers[col]) || isNomeHeader(headers[col])) continue;

    const numericCount = dataRows.filter(row => noteNumber(row[col]) !== null).length;
    const threshold = Math.max(2, Math.ceil(dataRows.length * 0.25));

    if (isNotaHeader(headers[col]) || numericCount >= threshold) {
      noteIndexes.push(col);
    }
  }

  return {
    headerRowIndex,
    headers,
    dataRows,
    nameIndex,
    noteIndexes
  };
}

function optionLabel(index, header, tags = []) {
  const suffix = tags.length ? ` [${tags.join(", ")}]` : "";
  return `${columnLetter(index)} - ${header}${suffix}`;
}

function saveState() {
  estado.manualText = dadosEl.value;
  chrome.storage.local.set({ [STORAGE_KEY]: estado });
}

function renderWorkbookControls() {
  const workbook = estado.workbook;

  if (!workbook?.sheets?.length) {
    excelControlesEl.classList.add("hidden");
    arquivoResumoEl.textContent = "Nenhuma planilha carregada.";
    return;
  }

  excelControlesEl.classList.remove("hidden");
  estado.selectedSheetIndex = Math.min(
    Math.max(Number(estado.selectedSheetIndex) || 0, 0),
    workbook.sheets.length - 1
  );

  planilhaEl.innerHTML = workbook.sheets
    .map((sheet, index) =>
      `<option value="${index}"${index === estado.selectedSheetIndex ? " selected" : ""}>${escapeHtml(sheet.name)}</option>`
    )
    .join("");

  const sheet = workbook.sheets[estado.selectedSheetIndex];
  const analysis = analyzeSheet(sheet);
  const columnCount = analysis.headers.length;

  if (estado.selectedNameIndex === null || estado.selectedNameIndex >= columnCount) {
    estado.selectedNameIndex = analysis.nameIndex >= 0 ? analysis.nameIndex : 0;
  }

  if (estado.selectedNoteIndex === null || estado.selectedNoteIndex >= columnCount) {
    estado.selectedNoteIndex = analysis.noteIndexes[0] ?? 0;
  }

  colunaNomeEl.innerHTML = analysis.headers
    .map((header, index) => {
      const tags = [];
      if (index === analysis.nameIndex) tags.push("nome");
      return `<option value="${index}"${index === Number(estado.selectedNameIndex) ? " selected" : ""}>${escapeHtml(optionLabel(index, header, tags))}</option>`;
    })
    .join("");

  colunaNotaEl.innerHTML = analysis.headers
    .map((header, index) => {
      const tags = [];
      if (analysis.noteIndexes.includes(index)) tags.push("nota");
      return `<option value="${index}"${index === Number(estado.selectedNoteIndex) ? " selected" : ""}>${escapeHtml(optionLabel(index, header, tags))}</option>`;
    })
    .join("");

  const dados = buildDadosFromWorkbook();
  arquivoResumoEl.textContent = `${workbook.fileName} | ${workbook.sheets.length} aba(s) | ${dados.length} nota(s) na coluna escolhida.`;

  if (dados.length) {
    setResumo(`Pronto: ${dados.length} notas em "${analysis.headers[estado.selectedNoteIndex]}".`, "ok");
    mostrarDetalhes(dados.slice(0, 6).map(item => ({ status: "PREVIA", aluno: item.nome, nota: item.nota })));
  } else {
    setResumo("Planilha carregada, mas não encontrei notas válidas na coluna escolhida.", "warn");
    detalhesEl.innerHTML = "";
  }
}

function parseDados(texto) {
  const linhas = String(texto || "")
    .split(/\r?\n/)
    .map(linha => linha.trim())
    .filter(Boolean);

  const dados = [];

  for (const linha of linhas) {
    const normal = linha.toUpperCase();
    if (normal.includes("NOME") && normal.includes("NOTA")) continue;

    let partes = linha.split("\t");
    if (partes.length < 2) partes = linha.split(";");
    if (partes.length < 2) partes = linha.split(/ {2,}/);

    if (partes.length < 2) {
      const match = linha.match(/^(.+?)\s+(\d{1,2}(?:[,.]\d{1,2})?)$/);
      if (match) partes = [match[1], match[2]];
    }

    if (partes.length >= 2) {
      const nota = formatNota(partes.pop());
      const nome = partes.join(" ").trim();

      if (nome && nota) dados.push({ nome, nota });
    }
  }

  return dados;
}

function buildDadosFromWorkbook() {
  const workbook = estado.workbook;
  if (!workbook?.sheets?.length) return [];

  const sheet = workbook.sheets[Number(estado.selectedSheetIndex) || 0];
  if (!sheet) return [];

  const analysis = analyzeSheet(sheet);
  const nameIndex = Number(estado.selectedNameIndex);
  const noteIndex = Number(estado.selectedNoteIndex);

  return (sheet.rows || [])
    .slice(analysis.headerRowIndex + 1)
    .map(row => ({
      nome: String(row?.[nameIndex] || "").trim(),
      nota: formatNota(row?.[noteIndex])
    }))
    .filter(item => item.nome && item.nota);
}

function buildDadosParaPreencher() {
  if (estado.workbook?.sheets?.length) return buildDadosFromWorkbook();
  return parseDados(dadosEl.value);
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function ensureContentScript(tabId) {
  try {
    const resposta = await chrome.tabs.sendMessage(tabId, { tipo: "PING_DIARIO_NOTAS" });
    if (resposta?.version === CONTENT_VERSION) return;
  } catch {
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.js"]
  });
}

arquivoEl.addEventListener("change", async () => {
  const file = arquivoEl.files?.[0];
  if (!file) return;

  try {
    setResumo("Lendo planilha...", "warn");
    detalhesEl.innerHTML = "";

    estado.workbook = await window.DiarioPlanilha.parseWorkbook(file);
    estado.selectedSheetIndex = 0;
    estado.selectedNameIndex = null;
    estado.selectedNoteIndex = null;

    renderWorkbookControls();
    saveState();
  } catch (erro) {
    estado.workbook = null;
    renderWorkbookControls();
    saveState();
    setResumo(`Erro ao ler planilha: ${erro.message}`, "bad");
  } finally {
    arquivoEl.value = "";
  }
});

planilhaEl.addEventListener("change", () => {
  estado.selectedSheetIndex = Number(planilhaEl.value);
  estado.selectedNameIndex = null;
  estado.selectedNoteIndex = null;
  renderWorkbookControls();
  saveState();
});

colunaNomeEl.addEventListener("change", () => {
  estado.selectedNameIndex = Number(colunaNomeEl.value);
  renderWorkbookControls();
  saveState();
});

colunaNotaEl.addEventListener("change", () => {
  estado.selectedNoteIndex = Number(colunaNotaEl.value);
  renderWorkbookControls();
  saveState();
});

dadosEl.addEventListener("input", () => {
  if (!estado.workbook?.sheets?.length) {
    const dados = parseDados(dadosEl.value);
    setResumo(dados.length ? `${dados.length} notas no texto manual.` : "Aguardando dados.");
  }

  saveState();
});

preencherEl.addEventListener("click", async () => {
  const dados = buildDadosParaPreencher();
  detalhesEl.innerHTML = "";

  if (!dados.length) {
    setResumo("Não encontrei nomes e notas para preencher.", "bad");
    return;
  }

  saveState();

  try {
    const tab = await getActiveTab();

    if (!tab?.id) {
      setResumo("Não consegui acessar a aba atual.", "bad");
      return;
    }

    await ensureContentScript(tab.id);

    const resposta = await chrome.tabs.sendMessage(tab.id, {
      tipo: "PREENCHER_NOTAS_DIARIO_V120",
      dados
    });

    if (!resposta?.ok) {
      setResumo(resposta?.erro || "Não foi possível preencher a página.", "bad");
      return;
    }

    const r = resposta.resumo;
    setResumo(
      `${r.preenchidos} preenchidos, ${r.ignorados} ignorados/riscados, ${r.naoEncontrados} não encontrados, ${r.duvidosos} duvidosos.`,
      r.duvidosos || r.naoEncontrados ? "warn" : "ok"
    );
    mostrarDetalhes(resposta.resultado);
  } catch (erro) {
    setResumo(`Erro: ${erro.message}`, "bad");
  }
});

limparEl.addEventListener("click", () => {
  estado = {
    workbook: null,
    selectedSheetIndex: 0,
    selectedNameIndex: null,
    selectedNoteIndex: null,
    manualText: ""
  };

  dadosEl.value = "";
  detalhesEl.innerHTML = "";
  chrome.storage.local.remove(STORAGE_KEY);
  renderWorkbookControls();
  setResumo("Memória limpa.");
});

chrome.storage.local.get(STORAGE_KEY, itens => {
  if (itens?.[STORAGE_KEY]) {
    estado = {
      ...estado,
      ...itens[STORAGE_KEY]
    };
  }

  dadosEl.value = estado.manualText || "";
  renderWorkbookControls();

  if (!estado.workbook?.sheets?.length && dadosEl.value) {
    const dados = parseDados(dadosEl.value);
    setResumo(dados.length ? `${dados.length} notas no texto manual.` : "Aguardando dados.");
  }
});
