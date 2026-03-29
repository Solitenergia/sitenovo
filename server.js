import { createServer } from "http";
import next from "next";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const api = express.Router();
api.use(express.json());
api.use(cors());

async function authMiddleware(req, res, next) {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: "Supabase nao configurado" });
  }
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token nao fornecido" });
  }
  try {
    const token = authHeader.split(" ")[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: "Token invalido" });
    const { data: colaborador } = await supabaseAdmin
      .from("colaboradores").select("integrador_id").eq("id", user.id).single();
    if (!colaborador) return res.status(403).json({ error: "Usuario nao vinculado" });
    req.userId = user.id;
    req.integradorId = colaborador.integrador_id;
    next();
  } catch {
    return res.status(401).json({ error: "Erro na autenticacao" });
  }
}

api.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

api.get("/dashboard/stats", authMiddleware, async (req, res) => {
  try {
    const [usinasRes, clientesRes, ticketsRes] = await Promise.all([
      supabaseAdmin.from("usinas").select("id, potencia_kwp, status, arquivada").eq("integrador_id", req.integradorId),
      supabaseAdmin.from("clientes").select("id, ultimo_acesso").eq("integrador_id", req.integradorId),
      supabaseAdmin.from("tickets").select("id, status").eq("integrador_id", req.integradorId),
    ]);
    const usinas = usinasRes.data || [];
    const clientes = clientesRes.data || [];
    const tickets = ticketsRes.data || [];
    const usinasAtivas = usinas.filter((u) => !u.arquivada);
    const potenciaTotal = usinas.reduce((sum, u) => sum + (Number(u.potencia_kwp) || 0), 0);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const clientesAtivos = clientes.filter((c) => c.ultimo_acesso && new Date(c.ultimo_acesso) > thirtyDaysAgo).length;
    const ticketsAbertos = tickets.filter((t) => t.status !== "concluido" && t.status !== "cancelado").length;
    res.json({
      totalUsinas: usinas.length, usinasMonitoradas: usinasAtivas.length,
      usinasArquivadas: usinas.filter((u) => u.arquivada).length, potenciaInstalada: potenciaTotal,
      totalClientes: clientes.length, clientesAtivos, ticketsAbertos,
      statusCounts: {
        normal: usinasAtivas.filter((u) => u.status === "normal").length,
        alerta: usinasAtivas.filter((u) => u.status === "alerta").length,
        critico: usinasAtivas.filter((u) => u.status === "critico").length,
        desconhecido: usinasAtivas.filter((u) => u.status === "desconhecido").length,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Erro ao buscar estatisticas" });
  }
});

api.get("/usinas", authMiddleware, async (req, res) => {
  try {
    const { status, search, page = "1", limit = "20", sortBy = "nome", sortOrder = "asc" } = req.query;
    let query = supabaseAdmin.from("usinas")
      .select("*, cliente:clientes(id, nome), responsavel:colaboradores(id, nome), indicadores:indicadores_desempenho(periodo, valor)", { count: "exact" })
      .eq("integrador_id", req.integradorId).eq("arquivada", false);
    if (status && status !== "todos") query = query.eq("status", status);
    if (search) query = query.or(`nome.ilike.%${search}%,cidade.ilike.%${search}%`);
    const pageNum = parseInt(page); const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    query = query.order(sortBy, { ascending: sortOrder === "asc" }).range(from, from + limitNum - 1);
    const { data, count, error } = await query;
    if (error) throw error;
    res.json({ data: data || [], total: count || 0, page: pageNum, totalPages: Math.ceil((count || 0) / limitNum) });
  } catch (error) {
    console.error("List usinas error:", error);
    res.status(500).json({ error: "Erro ao listar usinas" });
  }
});

api.get("/usinas/:id", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from("usinas")
      .select("*, cliente:clientes(id, nome, telefone, email), responsavel:colaboradores(id, nome), indicadores:indicadores_desempenho(periodo, valor), unidades:unidades_consumidoras(id, denominacao, contrato, concessionaria)")
      .eq("id", req.params.id).eq("integrador_id", req.integradorId).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Usina nao encontrada" });
    res.json(data);
  } catch (error) { res.status(500).json({ error: "Erro ao buscar usina" }); }
});

api.post("/usinas", authMiddleware, async (req, res) => {
  try {
    const { nome, potencia_kwp, cidade, uf, data_homologacao, cliente_id, responsavel_id } = req.body;
    const { data, error } = await supabaseAdmin.from("usinas")
      .insert({ integrador_id: req.integradorId, nome, potencia_kwp, cidade, uf, data_homologacao, cliente_id, responsavel_id })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) { res.status(500).json({ error: "Erro ao criar usina" }); }
});

api.get("/clientes", authMiddleware, async (req, res) => {
  try {
    const { filter, search, page = "1", limit = "48" } = req.query;
    let query = supabaseAdmin.from("clientes").select("*", { count: "exact" }).eq("integrador_id", req.integradorId);
    if (search) query = query.or(`nome.ilike.%${search}%,cpf_cnpj.ilike.%${search}%,email.ilike.%${search}%`);
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (filter === "acesso_recente") query = query.gte("ultimo_acesso", thirtyDaysAgo.toISOString());
    else if (filter === "acesso_antigo") query = query.lt("ultimo_acesso", thirtyDaysAgo.toISOString()).not("ultimo_acesso", "is", null);
    else if (filter === "sem_acesso") query = query.is("ultimo_acesso", null);
    const pageNum = parseInt(page); const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    query = query.order("nome", { ascending: true }).range(from, from + limitNum - 1);
    const { data, count, error } = await query;
    if (error) throw error;
    let clientsData = data || [];
    if (filter === "sem_usinas") {
      const clientIds = clientsData.map((c) => c.id);
      const { data: usinas } = await supabaseAdmin.from("usinas").select("cliente_id").in("cliente_id", clientIds);
      const withUsinas = new Set(usinas?.map((u) => u.cliente_id));
      clientsData = clientsData.filter((c) => !withUsinas.has(c.id));
    }
    res.json({ data: clientsData, total: count || 0, page: pageNum, totalPages: Math.ceil((count || 0) / limitNum) });
  } catch (error) { res.status(500).json({ error: "Erro ao listar clientes" }); }
});

api.post("/clientes", authMiddleware, async (req, res) => {
  try {
    const { nome, cpf_cnpj, telefone, email } = req.body;
    const { data, error } = await supabaseAdmin.from("clientes")
      .insert({ integrador_id: req.integradorId, nome, cpf_cnpj, telefone, email }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) { res.status(500).json({ error: "Erro ao criar cliente" }); }
});

api.put("/clientes/:id", authMiddleware, async (req, res) => {
  try {
    const { nome, cpf_cnpj, telefone, email } = req.body;
    const { data, error } = await supabaseAdmin.from("clientes")
      .update({ nome, cpf_cnpj, telefone, email, updated_at: new Date().toISOString() })
      .eq("id", req.params.id).eq("integrador_id", req.integradorId).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(500).json({ error: "Erro ao atualizar cliente" }); }
});

api.delete("/clientes/:id", authMiddleware, async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from("clientes").delete().eq("id", req.params.id).eq("integrador_id", req.integradorId);
    if (error) throw error;
    res.status(204).send();
  } catch (error) { res.status(500).json({ error: "Erro ao excluir cliente" }); }
});

api.get("/unidades", authMiddleware, async (req, res) => {
  try {
    const { filter, search, page = "1", limit = "20" } = req.query;
    let query = supabaseAdmin.from("unidades_consumidoras")
      .select("*, cliente:clientes(id, nome), usina:usinas(id, nome, arquivada)", { count: "exact" })
      .eq("integrador_id", req.integradorId);
    if (search) query = query.or(`denominacao.ilike.%${search}%,contrato.ilike.%${search}%`);
    if (filter === "sem_concessionaria") query = query.is("concessionaria", null);
    const pageNum = parseInt(page); const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    query = query.order("denominacao", { ascending: true }).range(from, from + limitNum - 1);
    const { data, count, error } = await query;
    if (error) throw error;
    let result = data || [];
    if (filter === "arquivadas") result = result.filter((u) => u.usina?.arquivada === true);
    res.json({ data: result, total: count || 0, page: pageNum, totalPages: Math.ceil((count || 0) / limitNum) });
  } catch (error) { res.status(500).json({ error: "Erro ao listar unidades" }); }
});

api.post("/unidades", authMiddleware, async (req, res) => {
  try {
    const { denominacao, contrato, concessionaria, cliente_id, usina_id } = req.body;
    const { data, error } = await supabaseAdmin.from("unidades_consumidoras")
      .insert({ integrador_id: req.integradorId, denominacao, contrato, concessionaria, cliente_id, usina_id }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) { res.status(500).json({ error: "Erro ao criar unidade" }); }
});

api.get("/portais", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from("portais")
      .select("*, usinas:portal_usinas(usina_id)").eq("integrador_id", req.integradorId)
      .order("fabricante", { ascending: true });
    if (error) throw error;
    res.json({ data: (data || []).map((p) => ({ ...p, totalUsinas: p.usinas?.length || 0, usinas: undefined })) });
  } catch (error) { res.status(500).json({ error: "Erro ao listar portais" }); }
});

api.get("/tickets", authMiddleware, async (req, res) => {
  try {
    const { status, page = "1", limit = "20" } = req.query;
    let query = supabaseAdmin.from("tickets")
      .select("*, usina:usinas(id, nome), cliente:clientes(id, nome), responsavel:colaboradores(id, nome)", { count: "exact" })
      .eq("integrador_id", req.integradorId);
    if (status && status !== "todos") query = query.eq("status", status);
    const pageNum = parseInt(page); const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    query = query.order("created_at", { ascending: false }).range(from, from + limitNum - 1);
    const { data, count, error } = await query;
    if (error) throw error;
    res.json({ data: data || [], total: count || 0, page: pageNum, totalPages: Math.ceil((count || 0) / limitNum) });
  } catch (error) { res.status(500).json({ error: "Erro ao listar tickets" }); }
});

const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const server = express();
  server.use("/api", api);
  server.use((req, res) => handle(req, res));
  server.listen(port, () => {
    console.log(`> Server listening at http://localhost:${port} [${dev ? "dev" : "production"}]`);
  });
});
