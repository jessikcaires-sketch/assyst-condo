import { Pool } from "pg";
import type { Condominium, User } from "./types";
import { seedCondominiums, users as seedUsers } from "./mock-data";
import { SERVICE_CATALOG } from "./domain";

/* ============================================================
   Camada de banco (Postgres) — conexão única, criação automática
   das tabelas e repositórios. É a fonte de dados real que
   substitui o localStorage. DATABASE_URL vem do Railway.
   ============================================================ */

const g = globalThis as unknown as { _assystPool?: Pool; _assystReady?: Promise<void> };

function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurada — conecte o Postgres do Railway.");
  }
  if (!g._assystPool) {
    const url = process.env.DATABASE_URL;
    // SSL só no acesso público (proxy do Railway); local e rede interna dispensam.
    const needSsl = !/localhost|127\.0\.0\.1|\.railway\.internal/.test(url);
    g._assystPool = new Pool({
      connectionString: url,
      ssl: needSsl ? { rejectUnauthorized: false } : undefined,
      max: 5,
    });
  }
  return g._assystPool;
}

/** Cria as tabelas (idempotente) e semeia os dados iniciais uma vez. */
export function ensureReady(): Promise<void> {
  if (!g._assystReady) g._assystReady = init();
  return g._assystReady;
}

async function init(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS condos (
      seq             bigserial PRIMARY KEY,
      id              text UNIQUE NOT NULL,
      name            text NOT NULL,
      cnpj            text,
      photo_url       text,
      address         text NOT NULL DEFAULT '',
      administrator   text,
      responsible_id  text NOT NULL DEFAULT '',
      contract_start  text,
      contract_end    text,
      notes           text,
      status          text NOT NULL DEFAULT 'ativo',
      services        jsonb NOT NULL DEFAULT '[]',
      contacts        jsonb NOT NULL DEFAULT '[]',
      value_metrics   jsonb NOT NULL DEFAULT '{}',
      updated_at      timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS responsibles (
      id        text PRIMARY KEY,
      name      text NOT NULL,
      email     text NOT NULL DEFAULT '',
      role      text NOT NULL DEFAULT 'engenheiro',
      initials  text NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS catalog_services (
      name text PRIMARY KEY,
      seq  bigserial
    );
    CREATE TABLE IF NOT EXISTS catalog_administrators (
      name text PRIMARY KEY,
      seq  bigserial
    );
  `);


  // Seeds — só quando a tabela estiver vazia (preserva edições do usuário).
  const { rows: condoCount } = await pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM condos`);
  if (condoCount[0].n === "0") {
    for (const c of seedCondominiums) await insertCondoRow(c);
  }
  const { rows: respCount } = await pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM responsibles`);
  if (respCount[0].n === "0") {
    for (const u of seedUsers) {
      await pool.query(
        `INSERT INTO responsibles (id, name, email, role, initials) VALUES ($1,$2,$3,$4,$5)`,
        [u.id, u.name, u.email, u.role, u.initials],
      );
    }
  }
  const { rows: svcCount } = await pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM catalog_services`);
  if (svcCount[0].n === "0") {
    for (const s of SERVICE_CATALOG) {
      await pool.query(`INSERT INTO catalog_services (name) VALUES ($1) ON CONFLICT DO NOTHING`, [s]);
    }
  }
}

/* ---------- mapeamento linha <-> Condominium ---------- */

interface CondoRowDB {
  id: string;
  name: string;
  cnpj: string | null;
  photo_url: string | null;
  address: string;
  administrator: string | null;
  responsible_id: string;
  contract_start: string | null;
  contract_end: string | null;
  notes: string | null;
  status: string;
  services: Condominium["services"];
  contacts: Condominium["contacts"];
  value_metrics: Condominium["valueMetrics"];
}

function rowToCondo(r: CondoRowDB): Condominium {
  return {
    id: r.id,
    name: r.name,
    cnpj: r.cnpj ?? undefined,
    photoUrl: r.photo_url ?? undefined,
    address: r.address,
    contacts: r.contacts ?? [],
    administrator: r.administrator ?? undefined,
    responsibleId: r.responsible_id,
    contractStart: r.contract_start ?? undefined,
    contractEnd: r.contract_end ?? undefined,
    notes: r.notes ?? undefined,
    status: r.status as Condominium["status"],
    services: r.services ?? [],
    valueMetrics: r.value_metrics,
  };
}

async function insertCondoRow(c: Condominium): Promise<void> {
  await getPool().query(
    `INSERT INTO condos
      (id, name, cnpj, photo_url, address, administrator, responsible_id,
       contract_start, contract_end, notes, status, services, contacts, value_metrics)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     ON CONFLICT (id) DO UPDATE SET
       name=EXCLUDED.name, cnpj=EXCLUDED.cnpj, photo_url=EXCLUDED.photo_url,
       address=EXCLUDED.address, administrator=EXCLUDED.administrator,
       responsible_id=EXCLUDED.responsible_id, contract_start=EXCLUDED.contract_start,
       contract_end=EXCLUDED.contract_end, notes=EXCLUDED.notes, status=EXCLUDED.status,
       services=EXCLUDED.services, contacts=EXCLUDED.contacts,
       value_metrics=EXCLUDED.value_metrics, updated_at=now()`,
    [
      c.id, c.name, c.cnpj ?? null, c.photoUrl ?? null, c.address, c.administrator ?? null,
      c.responsibleId, c.contractStart ?? null, c.contractEnd ?? null, c.notes ?? null,
      c.status, JSON.stringify(c.services), JSON.stringify(c.contacts), JSON.stringify(c.valueMetrics),
    ],
  );
}

/* ---------- repositório: condomínios ---------- */

const zeroMetrics = (): Condominium["valueMetrics"] => ({
  visitsDone: 0, worksSupervised: 0, unitsVisited: 0,
  diagnostics: 0, diagnosticsCourtesy: 0, bids: 0, reports: 0,
});

export async function dbListCondos(): Promise<Condominium[]> {
  await ensureReady();
  const { rows } = await getPool().query<CondoRowDB>(`SELECT * FROM condos ORDER BY seq ASC`);
  return rows.map(rowToCondo);
}

export async function dbCreateCondo(input: Omit<Condominium, "id" | "valueMetrics">): Promise<Condominium> {
  await ensureReady();
  const condo: Condominium = {
    ...input,
    id: `condo-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    valueMetrics: zeroMetrics(),
  };
  await insertCondoRow(condo);
  return condo;
}

export async function dbUpdateCondo(id: string, patch: Partial<Condominium>): Promise<Condominium | null> {
  await ensureReady();
  const { rows } = await getPool().query<CondoRowDB>(`SELECT * FROM condos WHERE id=$1`, [id]);
  if (rows.length === 0) return null;
  const merged = { ...rowToCondo(rows[0]), ...patch, id };
  await insertCondoRow(merged);
  return merged;
}

export async function dbDeleteCondo(id: string): Promise<void> {
  await ensureReady();
  await getPool().query(`DELETE FROM condos WHERE id=$1`, [id]);
}

/** Importa/atualiza vários condomínios de uma vez (ex.: migração do navegador). */
export async function dbUpsertCondos(condos: Condominium[]): Promise<void> {
  await ensureReady();
  for (const c of condos) {
    await insertCondoRow({ ...c, valueMetrics: c.valueMetrics ?? zeroMetrics() });
  }
}

/* ---------- repositório: catálogos ---------- */

export interface CatalogsData {
  responsibles: User[];
  services: string[];
  administrators: string[];
}

export async function dbGetCatalogs(): Promise<CatalogsData> {
  await ensureReady();
  const pool = getPool();
  const [resp, svc, adm] = await Promise.all([
    pool.query<User>(`SELECT id, name, email, role, initials FROM responsibles ORDER BY name ASC`),
    pool.query<{ name: string }>(`SELECT name FROM catalog_services ORDER BY seq ASC`),
    pool.query<{ name: string }>(`SELECT name FROM catalog_administrators ORDER BY seq ASC`),
  ]);
  return {
    responsibles: resp.rows,
    services: svc.rows.map((r) => r.name),
    administrators: adm.rows.map((r) => r.name),
  };
}

export async function dbAddResponsible(u: User): Promise<void> {
  await ensureReady();
  await getPool().query(
    `INSERT INTO responsibles (id, name, email, role, initials) VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, email=EXCLUDED.email, role=EXCLUDED.role, initials=EXCLUDED.initials`,
    [u.id, u.name, u.email, u.role, u.initials],
  );
}

export async function dbUpdateResponsible(id: string, patch: Partial<User>): Promise<void> {
  await ensureReady();
  const { rows } = await getPool().query<User>(`SELECT id, name, email, role, initials FROM responsibles WHERE id=$1`, [id]);
  if (rows.length === 0) return;
  const m = { ...rows[0], ...patch };
  await getPool().query(
    `UPDATE responsibles SET name=$2, email=$3, role=$4, initials=$5 WHERE id=$1`,
    [id, m.name, m.email, m.role, m.initials],
  );
}

export async function dbRemoveResponsible(id: string): Promise<void> {
  await ensureReady();
  await getPool().query(`DELETE FROM responsibles WHERE id=$1`, [id]);
}

export async function dbAddService(name: string): Promise<void> {
  await ensureReady();
  await getPool().query(`INSERT INTO catalog_services (name) VALUES ($1) ON CONFLICT DO NOTHING`, [name]);
}

export async function dbRemoveService(name: string): Promise<void> {
  await ensureReady();
  await getPool().query(`DELETE FROM catalog_services WHERE name=$1`, [name]);
}

export async function dbAddAdministrator(name: string): Promise<void> {
  await ensureReady();
  await getPool().query(`INSERT INTO catalog_administrators (name) VALUES ($1) ON CONFLICT DO NOTHING`, [name]);
}

export async function dbRemoveAdministrator(name: string): Promise<void> {
  await ensureReady();
  await getPool().query(`DELETE FROM catalog_administrators WHERE name=$1`, [name]);
}
