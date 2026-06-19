export const dynamic = "force-dynamic";

/**
 * Consulta dados públicos de um CNPJ (BrasilAPI, com fallback ReceitaWS) e
 * devolve o endereço já formatado + razão social. Usado para auto-preencher
 * o endereço no cadastro do condomínio.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cnpj: string }> },
) {
  const { cnpj } = await params;
  const digits = (cnpj || "").replace(/\D/g, "");
  if (digits.length !== 14) {
    return Response.json({ error: "CNPJ deve ter 14 dígitos." }, { status: 400 });
  }

  // 1) BrasilAPI
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      const d = await res.json();
      return Response.json(normalize({
        logradouro: withStreetType(d.descricao_tipo_de_logradouro, d.logradouro),
        numero: d.numero,
        complemento: d.complemento,
        bairro: d.bairro,
        municipio: d.municipio,
        uf: d.uf,
        cep: d.cep,
        razao: d.razao_social,
        fantasia: d.nome_fantasia,
      }));
    }
  } catch {
    /* tenta o fallback */
  }

  // 2) ReceitaWS (fallback)
  try {
    const res = await fetch(`https://receitaws.com.br/v1/cnpj/${digits}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      const d = await res.json();
      if (d.status !== "ERROR") {
        return Response.json(normalize({
          logradouro: d.logradouro,
          numero: d.numero,
          complemento: d.complemento,
          bairro: d.bairro,
          municipio: d.municipio,
          uf: d.uf,
          cep: d.cep,
          razao: d.nome,
          fantasia: d.fantasia,
        }));
      }
    }
  } catch {
    /* cai no erro abaixo */
  }

  return Response.json({ error: "Não foi possível consultar este CNPJ agora." }, { status: 502 });
}

const STREET_TYPE = /^(RUA|R\.|AV|AV\.|AVENIDA|AL|AL\.|ALAMEDA|TV|TRAVESSA|PCA|PRACA|PRAÇA|ROD|RODOVIA|EST|ESTRADA|LARGO|LGO|VIELA|VILA|QUADRA|VIA|MARGINAL|PASSAGEM|PARQUE|PRC)\b/i;

/** Prefixa o tipo (RUA/AVENIDA…) quando o logradouro não já vem com ele. */
function withStreetType(tipo?: string, logradouro?: string): string {
  const log = (logradouro || "").trim();
  const t = (tipo || "").trim();
  if (!log) return "";
  if (!t || STREET_TYPE.test(log)) return log;
  return `${t} ${log}`;
}

function normalize(d: {
  logradouro?: string; numero?: string; complemento?: string; bairro?: string;
  municipio?: string; uf?: string; cep?: string; razao?: string; fantasia?: string;
}) {
  const rua = [d.logradouro, d.numero].filter(Boolean).join(", ");
  const cidadeUf = [d.municipio, d.uf].filter(Boolean).join("/");
  const address = [rua, d.complemento, d.bairro, cidadeUf]
    .map((p) => (p || "").trim())
    .filter(Boolean)
    .join(" — ");
  return {
    address,
    cep: d.cep ?? "",
    razaoSocial: d.razao ?? "",
    nomeFantasia: d.fantasia ?? "",
  };
}
