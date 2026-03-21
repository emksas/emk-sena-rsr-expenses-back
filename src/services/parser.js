function stripNoise(raw) {
  return (
    String(raw)
      // quita tags tipo [630x187x1] o [icon]
      .replace(/\[[^\]\n]*\]/g, "")
      // quita URLs entre <...>
      .replace(/<https?:\/\/[^>\s]+>/gi, "")
      // normaliza guiones/underscores separadores
      .replace(/[_\-]{5,}/g, "\n")
      // normaliza saltos
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

function normalizeKey(s = "") {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // sin acentos
    .replace(/[^a-z0-9]/g, ""); // sin espacios/símbolos
}

function parseCurrencyToNumber(s = "") {
  // acepta "$30.000", "30,000.50", "COP 30.000,50", etc.
  const only = s.replace(/[^\d.,-]/g, "");
  const lastComma = only.lastIndexOf(",");
  const lastDot = only.lastIndexOf(".");
  const decimalSep = lastComma > lastDot ? "," : ".";

  const normalized = only
    .replace(new RegExp(`\\${decimalSep}(?=\\d{1,2}$)`), ".") // separador decimal a punto
    .replace(/[.,](?=\d{3}(?:\D|$))/g, ""); // quita miles

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function parseDateFlexible(s = "") {
  const txt = s.trim();
  // yyyy-mm-dd hh:mm(:ss)?
  let m = txt.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (m) {
    const [, Y, M, D, h = "00", m2 = "00", s2 = "00"] = m;
    const iso = `${Y}-${M}-${D}T${h}:${m2}:${s2}Z`;
    const d = new Date(iso);
    return isNaN(d) ? null : d.toISOString();
  }
  // dd/mm/yyyy hh:mm(:ss)?
  m = txt.match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (m) {
    const [, d, M, Y, h = "00", m2 = "00", s2 = "00"] = m;
    const iso = `${Y}-${M}-${d}T${h}:${m2}:${s2}Z`;
    const dt = new Date(iso);
    return isNaN(dt) ? null : dt.toISOString();
  }
  return null;
}

/**
 * Parser principal para el formato de RappiCard (texto plano).
 * Devuelve: { amount, paymentMethod, authorizationCode, merchant, transactionDate }
 */
function parseRappiCardText(rawText) {
  const cleaned = stripNoise(rawText);

  const lines = cleaned
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Mapeo de rótulos posibles -> clave destino
  const KEY_MAP = new Map([
    ["monto", "amount"],
    ["metododepago", "paymentMethod"],
    ["no.deautorizacion", "authorizationCode"],
    ["nodeautorizacion", "authorizationCode"],
    ["numerodeautorizacion", "authorizationCode"],
    ["autorizacion", "authorizationCode"],
    ["comercio", "merchant"],
    ["fechadelatransaccion", "transactionDate"],
    ["fechadetransaccion", "transactionDate"],
    ["fechatransaccion", "transactionDate"],
  ]);

  const result = {
    amount: null,
    paymentMethod: null,
    authorizationCode: null,
    merchant: null,
    transactionDate: null,
  };

  // recorre líneas: cuando encuentra un rótulo conocido, toma la siguiente línea útil como valor
  for (let i = 0; i < lines.length; i++) {
    const keyNorm = normalizeKey(lines[i]);
    const dest = KEY_MAP.get(keyNorm);
    if (!dest) continue;

    // tomar la próxima línea no vacía como valor
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === "") j++;
    const value = lines[j] ?? "";

    if (dest === "amount") {
      result.amount = parseCurrencyToNumber(value);
    } else if (dest === "transactionDate") {
      result.transactionDate = parseDateFlexible(value) || value;
    } else {
      result[dest] = value;
    }
  }

  return result;
}

export { parseRappiCardText }