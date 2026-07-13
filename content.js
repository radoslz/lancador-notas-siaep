(() => {
  const CONTENT_VERSION = "1.2.0";

  if (window.__DIARIO_NOTAS_CONTENT_VERSION__ === CONTENT_VERSION) return;
  window.__DIARIO_NOTAS_CONTENT_VERSION__ = CONTENT_VERSION;
  window.__DIARIO_NOTAS_CONTENT_LOADED__ = true;

  function normalizar(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9\s]/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  }

  function palavrasFortes(nome) {
    return normalizar(nome)
      .split(" ")
      .filter(p => !["DE", "DA", "DO", "DAS", "DOS", "E"].includes(p));
  }

  function detectarBloqueio(tr, campo) {
    if (campo.disabled) return "campo desativado";
    if (campo.readOnly) return "campo somente leitura";
    if (campo.classList.contains("aspNetDisabled")) return "campo desativado";

    const elementos = [tr, ...tr.querySelectorAll("*")];
    const riscado = elementos.some(el => {
      const estilo = getComputedStyle(el);
      const decoracao = `${estilo.textDecorationLine} ${estilo.textDecoration}`.toLowerCase();
      return decoracao.includes("line-through");
    });

    if (riscado) return "linha riscada";

    return "";
  }

  function localizarLinhasDeNota() {
    return [...document.querySelectorAll("tr")]
      .map(tr => {
        const campo = tr.querySelector(
          'input[type="text"][id*="grdNota"][id$="txtNotas"], input[type="text"][name*="grdNota"][name$="$txtNotas"]'
        );

        if (!campo) return null;

        tr.style.backgroundColor = "";

        const motivoBloqueio = detectarBloqueio(tr, campo);

        return {
          tr,
          campo,
          textoOriginal: tr.innerText.replace(/\s+/g, " ").trim(),
          textoNormal: normalizar(tr.innerText),
          preenchida: false,
          ignorada: false,
          bloqueada: Boolean(motivoBloqueio),
          motivoBloqueio
        };
      })
      .filter(Boolean);
  }

  function preencherCampo(campo, valor) {
    campo.focus();
    campo.value = valor;
    campo.dispatchEvent(new Event("input", { bubbles: true }));
    campo.dispatchEvent(new Event("change", { bubbles: true }));
    campo.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  function preencherNotas(dados) {
    const linhas = localizarLinhasDeNota();

    if (!linhas.length) {
      return {
        ok: false,
        erro: "Não encontrei linhas com campos de nota nesta página. Confira se a tela correta está aberta."
      };
    }

    const notas = dados.map(item => ({
      nomeOriginal: item.nome,
      nomeNormal: normalizar(item.nome),
      palavras: palavrasFortes(item.nome),
      nota: String(item.nota || "").trim().replace(".", ",")
    }));

    const resultado = [];

    for (const aluno of notas) {
      let encontradas = linhas.filter(l => l.textoNormal.includes(aluno.nomeNormal));

      if (encontradas.length === 0) {
        encontradas = linhas.filter(l =>
          aluno.palavras.length > 0 && aluno.palavras.every(p => l.textoNormal.includes(p))
        );
      }

      const ativas = encontradas.filter(l => !l.bloqueada);

      if (ativas.length === 1) {
        const linha = ativas[0];
        preencherCampo(linha.campo, aluno.nota);
        linha.tr.style.backgroundColor = "#d9ffd9";
        linha.preenchida = true;

        resultado.push({
          status: "PREENCHIDO",
          aluno: aluno.nomeOriginal,
          nota: aluno.nota,
          linhaEncontrada: linha.textoOriginal
        });
      } else if (encontradas.length > 0 && ativas.length === 0) {
        encontradas.forEach(l => {
          l.tr.style.backgroundColor = "#e8edf2";
          l.ignorada = true;
        });

        resultado.push({
          status: "IGNORADO/RISCADO",
          aluno: aluno.nomeOriginal,
          nota: aluno.nota,
          motivo: encontradas.map(l => l.motivoBloqueio).filter(Boolean).join(", "),
          linhas: encontradas.map(l => l.textoOriginal)
        });
      } else if (encontradas.length === 0) {
        resultado.push({
          status: "NAO ENCONTRADO",
          aluno: aluno.nomeOriginal,
          nota: aluno.nota
        });
      } else {
        ativas.forEach(l => {
          l.tr.style.backgroundColor = "#ffd6d6";
        });

        resultado.push({
          status: "DUPLICADO/DUVIDOSO",
          aluno: aluno.nomeOriginal,
          nota: aluno.nota,
          linhas: encontradas.map(l => l.textoOriginal)
        });
      }
    }

    linhas
      .filter(l => !l.preenchida && !l.ignorada)
      .forEach(l => {
        if (l.bloqueada) {
          l.tr.style.backgroundColor = "#e8edf2";
          return;
        }

        if (!l.tr.style.backgroundColor) {
          l.tr.style.backgroundColor = "#fff3cd";
        }
      });

    const resumo = {
      preenchidos: resultado.filter(r => r.status === "PREENCHIDO").length,
      naoEncontrados: resultado.filter(r => r.status === "NAO ENCONTRADO").length,
      duvidosos: resultado.filter(r => r.status === "DUPLICADO/DUVIDOSO").length,
      ignorados: resultado.filter(r => r.status === "IGNORADO/RISCADO").length,
      bloqueadosNaTela: linhas.filter(l => l.bloqueada).length,
      semNota: linhas.filter(l => !l.preenchida && !l.bloqueada).length
    };

    console.table(resultado);

    return {
      ok: true,
      resumo,
      resultado
    };
  }

  chrome.runtime.onMessage.addListener((mensagem, _sender, sendResponse) => {
    if (mensagem?.tipo === "PING_DIARIO_NOTAS") {
      sendResponse({ ok: true, version: CONTENT_VERSION });
      return true;
    }

    if (mensagem?.tipo === "PREENCHER_NOTAS_DIARIO_V120") {
      try {
        sendResponse(preencherNotas(mensagem.dados || []));
      } catch (erro) {
        sendResponse({
          ok: false,
          erro: erro.message
        });
      }
      return true;
    }

    return false;
  });
})();
