-- =============================================
-- SolarZ Platform - Initial Database Schema
-- =============================================

-- Multi-tenant: integrators (solar energy companies)
CREATE TABLE integradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18),
  email VARCHAR(255),
  telefone VARCHAR(20),
  logo_url TEXT,
  plano VARCHAR(50) DEFAULT 'basic',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Users/collaborators (extends Supabase auth.users)
CREATE TABLE colaboradores (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  integrador_id UUID NOT NULL REFERENCES integradores(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  grupo VARCHAR(50) DEFAULT 'operador', -- admin, operador
  ultimo_acesso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Clients of the integrator
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integrador_id UUID NOT NULL REFERENCES integradores(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(18),
  telefone VARCHAR(20),
  email VARCHAR(255),
  ultimo_acesso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Solar plants (usinas)
CREATE TABLE usinas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integrador_id UUID NOT NULL REFERENCES integradores(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  nome VARCHAR(255) NOT NULL,
  potencia_kwp DECIMAL(10,2),
  cidade VARCHAR(100),
  uf CHAR(2),
  data_homologacao DATE,
  status VARCHAR(20) DEFAULT 'normal' CHECK (status IN ('normal', 'alerta', 'critico', 'desconhecido')),
  arquivada BOOLEAN DEFAULT false,
  responsavel_id UUID REFERENCES colaboradores(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indicators per plant
CREATE TABLE indicadores_desempenho (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usina_id UUID NOT NULL REFERENCES usinas(id) ON DELETE CASCADE,
  periodo VARCHAR(10) NOT NULL CHECK (periodo IN ('1d', '15d', '30d', '12m')),
  valor DECIMAL(5,2),
  atualizado_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE(usina_id, periodo)
);

-- Monitoring portals/credentials
CREATE TABLE portais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integrador_id UUID NOT NULL REFERENCES integradores(id) ON DELETE CASCADE,
  fabricante VARCHAR(100) NOT NULL,
  descricao VARCHAR(255),
  login VARCHAR(255),
  api_key TEXT,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Portal-plant many-to-many
CREATE TABLE portal_usinas (
  portal_id UUID NOT NULL REFERENCES portais(id) ON DELETE CASCADE,
  usina_id UUID NOT NULL REFERENCES usinas(id) ON DELETE CASCADE,
  PRIMARY KEY (portal_id, usina_id)
);

-- Consumer units (unidades consumidoras)
CREATE TABLE unidades_consumidoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integrador_id UUID NOT NULL REFERENCES integradores(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  usina_id UUID REFERENCES usinas(id) ON DELETE SET NULL,
  denominacao VARCHAR(255),
  contrato VARCHAR(100),
  concessionaria VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Support tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integrador_id UUID NOT NULL REFERENCES integradores(id) ON DELETE CASCADE,
  usina_id UUID REFERENCES usinas(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  status VARCHAR(30) DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'concluido', 'em_espera', 'cancelado')),
  tipo VARCHAR(50),
  responsavel_id UUID REFERENCES colaboradores(id) ON DELETE SET NULL,
  prazo TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_clientes_integrador ON clientes(integrador_id);
CREATE INDEX idx_usinas_integrador ON usinas(integrador_id);
CREATE INDEX idx_usinas_cliente ON usinas(cliente_id);
CREATE INDEX idx_usinas_status ON usinas(status);
CREATE INDEX idx_indicadores_usina ON indicadores_desempenho(usina_id);
CREATE INDEX idx_unidades_integrador ON unidades_consumidoras(integrador_id);
CREATE INDEX idx_tickets_integrador ON tickets(integrador_id);
CREATE INDEX idx_tickets_status ON tickets(status);

-- Row Level Security
ALTER TABLE integradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicadores_desempenho ENABLE ROW LEVEL SECURITY;
ALTER TABLE portais ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_usinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades_consumidoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's integrador_id
CREATE OR REPLACE FUNCTION get_user_integrador_id()
RETURNS UUID AS $$
  SELECT integrador_id FROM colaboradores WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies
CREATE POLICY "tenant_isolation" ON colaboradores
  FOR ALL USING (integrador_id = get_user_integrador_id());

CREATE POLICY "tenant_isolation" ON clientes
  FOR ALL USING (integrador_id = get_user_integrador_id());

CREATE POLICY "tenant_isolation" ON usinas
  FOR ALL USING (integrador_id = get_user_integrador_id());

CREATE POLICY "tenant_isolation" ON indicadores_desempenho
  FOR ALL USING (usina_id IN (SELECT id FROM usinas WHERE integrador_id = get_user_integrador_id()));

CREATE POLICY "tenant_isolation" ON portais
  FOR ALL USING (integrador_id = get_user_integrador_id());

CREATE POLICY "tenant_isolation" ON portal_usinas
  FOR ALL USING (portal_id IN (SELECT id FROM portais WHERE integrador_id = get_user_integrador_id()));

CREATE POLICY "tenant_isolation" ON unidades_consumidoras
  FOR ALL USING (integrador_id = get_user_integrador_id());

CREATE POLICY "tenant_isolation" ON tickets
  FOR ALL USING (integrador_id = get_user_integrador_id());

CREATE POLICY "own_integrador" ON integradores
  FOR ALL USING (id = get_user_integrador_id());
