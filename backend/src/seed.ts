import { supabaseAdmin } from './lib/supabase'

const INTEGRADOR_ID = '00000000-0000-0000-0000-000000000001'

async function seed() {
  console.log('🌱 Iniciando seed...')

  // 1. Create integrador
  await supabaseAdmin.from('integradores').upsert({
    id: INTEGRADOR_ID,
    nome: 'Solar Tech Energia',
    cnpj: '12.345.678/0001-90',
    email: 'contato@solartech.com.br',
    telefone: '(11) 99999-0000',
    plano: 'pro',
  })
  console.log('✅ Integrador criado')

  // 2. Create clients
  const clientes = [
    { nome: 'Carlos Alberto Silva', cpf_cnpj: '123.456.789-00', telefone: '(11) 98765-4321', email: 'carlos.silva@email.com', ultimo_acesso: new Date(Date.now() - 2 * 86400000).toISOString() },
    { nome: 'Maria Fernanda Oliveira', cpf_cnpj: '234.567.890-11', telefone: '(21) 97654-3210', email: 'maria.oliveira@email.com', ultimo_acesso: new Date(Date.now() - 5 * 86400000).toISOString() },
    { nome: 'João Pedro Santos', cpf_cnpj: '345.678.901-22', telefone: '(31) 96543-2109', email: 'joao.santos@email.com', ultimo_acesso: null },
    { nome: 'Ana Carolina Souza', cpf_cnpj: '456.789.012-33', telefone: '(41) 95432-1098', email: 'ana.souza@email.com', ultimo_acesso: new Date(Date.now() - 45 * 86400000).toISOString() },
    { nome: 'Roberto Martins', cpf_cnpj: '567.890.123-44', telefone: '(51) 94321-0987', email: 'roberto.martins@email.com', ultimo_acesso: new Date(Date.now() - 1 * 86400000).toISOString() },
    { nome: 'Fernanda Lima Costa', cpf_cnpj: '678.901.234-55', telefone: '(61) 93210-9876', email: 'fernanda.costa@email.com', ultimo_acesso: new Date(Date.now() - 10 * 86400000).toISOString() },
    { nome: 'Lucas Mendes Pereira', cpf_cnpj: '789.012.345-66', telefone: '(71) 92109-8765', email: 'lucas.pereira@email.com', ultimo_acesso: new Date(Date.now() - 60 * 86400000).toISOString() },
    { nome: 'Patrícia Rocha Almeida', cpf_cnpj: '890.123.456-77', telefone: '(81) 91098-7654', email: 'patricia.almeida@email.com', ultimo_acesso: new Date(Date.now() - 3 * 86400000).toISOString() },
    { nome: 'Empresa Sol Nascente LTDA', cpf_cnpj: '98.765.432/0001-10', telefone: '(85) 90987-6543', email: 'contato@solnascente.com.br', ultimo_acesso: new Date(Date.now() - 7 * 86400000).toISOString() },
    { nome: 'Marcos Vinícius Barbosa', cpf_cnpj: '901.234.567-88', telefone: '(91) 89876-5432', email: 'marcos.barbosa@email.com', ultimo_acesso: null },
    { nome: 'Juliana Ferreira Dias', cpf_cnpj: '012.345.678-99', telefone: '(47) 88765-4321', email: 'juliana.dias@email.com', ultimo_acesso: new Date(Date.now() - 15 * 86400000).toISOString() },
    { nome: 'Condomínio Residencial Aurora', cpf_cnpj: '11.222.333/0001-44', telefone: '(19) 87654-3210', email: 'admin@condaurora.com.br', ultimo_acesso: new Date(Date.now() - 20 * 86400000).toISOString() },
    { nome: 'Pedro Henrique Gomes', cpf_cnpj: '111.222.333-44', telefone: '(27) 86543-2109', email: 'pedro.gomes@email.com', ultimo_acesso: new Date(Date.now() - 4 * 86400000).toISOString() },
    { nome: 'Supermercado Bom Preço LTDA', cpf_cnpj: '22.333.444/0001-55', telefone: '(62) 85432-1098', email: 'energia@bompreco.com.br', ultimo_acesso: new Date(Date.now() - 12 * 86400000).toISOString() },
    { nome: 'Renata Campos Vieira', cpf_cnpj: '222.333.444-55', telefone: '(48) 84321-0987', email: 'renata.vieira@email.com', ultimo_acesso: null },
    { nome: 'Antônio José Ribeiro', cpf_cnpj: '333.444.555-66', telefone: '(65) 83210-9876', email: 'antonio.ribeiro@email.com', ultimo_acesso: new Date(Date.now() - 25 * 86400000).toISOString() },
    { nome: 'Fazenda Santa Clara', cpf_cnpj: '33.444.555/0001-66', telefone: '(67) 82109-8765', email: 'admin@fazendasantaclara.com.br', ultimo_acesso: new Date(Date.now() - 8 * 86400000).toISOString() },
    { nome: 'Gabriela Nascimento', cpf_cnpj: '444.555.666-77', telefone: '(82) 81098-7654', email: 'gabriela.nascimento@email.com', ultimo_acesso: new Date(Date.now() - 1 * 86400000).toISOString() },
    { nome: 'Hotel Praia Dourada', cpf_cnpj: '44.555.666/0001-77', telefone: '(84) 80987-6543', email: 'gerencia@praiadourada.com.br', ultimo_acesso: new Date(Date.now() - 35 * 86400000).toISOString() },
    { nome: 'Ricardo de Souza Lima', cpf_cnpj: '555.666.777-88', telefone: '(98) 79876-5432', email: 'ricardo.lima@email.com', ultimo_acesso: new Date(Date.now() - 6 * 86400000).toISOString() },
  ].map(c => ({ ...c, integrador_id: INTEGRADOR_ID }))

  const { data: clientesData } = await supabaseAdmin
    .from('clientes')
    .upsert(clientes, { onConflict: 'id' })
    .select('id, nome')

  console.log(`✅ ${clientes.length} clientes criados`)

  // Get client IDs
  const { data: allClientes } = await supabaseAdmin
    .from('clientes')
    .select('id, nome')
    .eq('integrador_id', INTEGRADOR_ID)
    .order('nome')

  const clienteIds = allClientes?.map(c => c.id) || []

  // 3. Create solar plants (usinas)
  const usinasData = [
    { nome: 'Residência Silva', potencia_kwp: 8.5, cidade: 'São Paulo', uf: 'SP', status: 'normal', data_homologacao: '2023-03-15' },
    { nome: 'Residência Oliveira', potencia_kwp: 12.0, cidade: 'Rio de Janeiro', uf: 'RJ', status: 'normal', data_homologacao: '2023-06-20' },
    { nome: 'Casa Santos', potencia_kwp: 5.4, cidade: 'Belo Horizonte', uf: 'MG', status: 'alerta', data_homologacao: '2023-01-10' },
    { nome: 'Residência Souza', potencia_kwp: 15.6, cidade: 'Curitiba', uf: 'PR', status: 'normal', data_homologacao: '2022-11-05' },
    { nome: 'Casa Martins', potencia_kwp: 7.2, cidade: 'Porto Alegre', uf: 'RS', status: 'normal', data_homologacao: '2023-08-12' },
    { nome: 'Residência Costa', potencia_kwp: 10.8, cidade: 'Brasília', uf: 'DF', status: 'critico', data_homologacao: '2022-09-01' },
    { nome: 'Comércio Pereira', potencia_kwp: 45.0, cidade: 'Salvador', uf: 'BA', status: 'normal', data_homologacao: '2023-04-18' },
    { nome: 'Residência Almeida', potencia_kwp: 6.3, cidade: 'Recife', uf: 'PE', status: 'desconhecido', data_homologacao: '2023-07-22' },
    { nome: 'Sol Nascente Matriz', potencia_kwp: 120.0, cidade: 'Fortaleza', uf: 'CE', status: 'normal', data_homologacao: '2022-05-30' },
    { nome: 'Residência Barbosa', potencia_kwp: 9.0, cidade: 'Belém', uf: 'PA', status: 'alerta', data_homologacao: '2023-10-03' },
    { nome: 'Casa Ferreira', potencia_kwp: 11.4, cidade: 'Joinville', uf: 'SC', status: 'normal', data_homologacao: '2023-02-14' },
    { nome: 'Cond. Aurora Solar', potencia_kwp: 75.0, cidade: 'Campinas', uf: 'SP', status: 'normal', data_homologacao: '2022-08-20' },
    { nome: 'Residência Gomes', potencia_kwp: 8.1, cidade: 'Vitória', uf: 'ES', status: 'normal', data_homologacao: '2023-05-11' },
    { nome: 'Supermercado Solar', potencia_kwp: 200.0, cidade: 'Goiânia', uf: 'GO', status: 'alerta', data_homologacao: '2022-12-01' },
    { nome: 'Residência Vieira', potencia_kwp: 6.6, cidade: 'Florianópolis', uf: 'SC', status: 'desconhecido', data_homologacao: '2023-09-25' },
    { nome: 'Casa Ribeiro', potencia_kwp: 13.5, cidade: 'Cuiabá', uf: 'MT', status: 'normal', data_homologacao: '2023-03-07' },
    { nome: 'Fazenda Solar Clara', potencia_kwp: 350.0, cidade: 'Campo Grande', uf: 'MS', status: 'normal', data_homologacao: '2022-04-15' },
    { nome: 'Residência Nascimento', potencia_kwp: 7.8, cidade: 'Maceió', uf: 'AL', status: 'normal', data_homologacao: '2023-11-18' },
    { nome: 'Hotel Praia Solar', potencia_kwp: 85.0, cidade: 'Natal', uf: 'RN', status: 'critico', data_homologacao: '2022-07-10' },
    { nome: 'Residência Lima', potencia_kwp: 10.2, cidade: 'São Luís', uf: 'MA', status: 'normal', data_homologacao: '2023-06-05' },
    { nome: 'Galpão Industrial Sol', potencia_kwp: 500.0, cidade: 'Manaus', uf: 'AM', status: 'normal', data_homologacao: '2022-10-20' },
    { nome: 'Residência Campos', potencia_kwp: 4.5, cidade: 'Teresina', uf: 'PI', status: 'alerta', data_homologacao: '2023-12-01' },
    { nome: 'Escritório Central', potencia_kwp: 25.0, cidade: 'Ribeirão Preto', uf: 'SP', status: 'normal', data_homologacao: '2023-01-25' },
    { nome: 'Casa Vieira Norte', potencia_kwp: 9.9, cidade: 'Londrina', uf: 'PR', status: 'normal', data_homologacao: '2023-04-30' },
    { nome: 'Posto Solar Energy', potencia_kwp: 55.0, cidade: 'Uberlândia', uf: 'MG', status: 'normal', data_homologacao: '2022-06-18' },
    { nome: 'Residência Oliveira II', potencia_kwp: 14.4, cidade: 'Niterói', uf: 'RJ', status: 'desconhecido', data_homologacao: '2023-08-01' },
    { nome: 'Clínica Saúde Solar', potencia_kwp: 30.0, cidade: 'Sorocaba', uf: 'SP', status: 'normal', data_homologacao: '2023-02-28' },
    { nome: 'Residência Santos II', potencia_kwp: 6.0, cidade: 'Juiz de Fora', uf: 'MG', status: 'normal', data_homologacao: '2023-07-15' },
    { nome: 'Escola Solar Kids', potencia_kwp: 40.0, cidade: 'Santos', uf: 'SP', status: 'alerta', data_homologacao: '2022-03-22' },
    { nome: 'Residência Martins II', potencia_kwp: 11.0, cidade: 'Caxias do Sul', uf: 'RS', status: 'normal', data_homologacao: '2023-10-10' },
  ].map((u, i) => ({
    ...u,
    integrador_id: INTEGRADOR_ID,
    cliente_id: clienteIds[i % clienteIds.length],
  }))

  const { data: usinas } = await supabaseAdmin
    .from('usinas')
    .upsert(usinasData, { onConflict: 'id' })
    .select('id')

  console.log(`✅ ${usinasData.length} usinas criadas`)

  // 4. Create performance indicators
  const { data: allUsinas } = await supabaseAdmin
    .from('usinas')
    .select('id, status')
    .eq('integrador_id', INTEGRADOR_ID)

  const indicadores = (allUsinas || []).flatMap(usina => {
    const basePerf = usina.status === 'normal' ? 85 :
                     usina.status === 'alerta' ? 65 :
                     usina.status === 'critico' ? 40 : null

    return ['1d', '15d', '30d', '12m'].map(periodo => ({
      usina_id: usina.id,
      periodo,
      valor: basePerf !== null ? Math.min(100, Math.max(0, basePerf + (Math.random() * 20 - 10))) : null,
    }))
  })

  // Insert in batches
  for (let i = 0; i < indicadores.length; i += 50) {
    await supabaseAdmin
      .from('indicadores_desempenho')
      .upsert(indicadores.slice(i, i + 50), { onConflict: 'usina_id,periodo' })
  }
  console.log(`✅ ${indicadores.length} indicadores criados`)

  // 5. Create portals
  const portais = [
    { fabricante: 'Growatt', descricao: 'Growatt ShineServer - Conta Principal', login: 'solartech@growatt.com', status: 'ativo' },
    { fabricante: 'SolarMan Business', descricao: 'SolarMan - Todos os inversores', login: 'admin@solartech.com.br', status: 'ativo' },
    { fabricante: 'Elekeeper', descricao: 'Elekeeper - Monitoramento geral', login: 'solartech_ek', status: 'ativo' },
    { fabricante: 'Sungrow API', descricao: 'iSolarCloud - Sungrow', login: 'sungrow@solartech.com.br', status: 'ativo' },
    { fabricante: 'FusionSolar API', descricao: 'Huawei FusionSolar', login: 'huawei@solartech.com.br', status: 'inativo' },
  ].map(p => ({ ...p, integrador_id: INTEGRADOR_ID }))

  await supabaseAdmin.from('portais').upsert(portais, { onConflict: 'id' })
  console.log('✅ Portais criados')

  // 6. Create consumer units
  const unidades = [
    { denominacao: 'Carlos Alberto Silva', contrato: 'UC-001234567', concessionaria: 'CPFL Paulista' },
    { denominacao: 'Maria Fernanda Oliveira', contrato: 'UC-002345678', concessionaria: 'Light' },
    { denominacao: 'João Pedro Santos', contrato: 'UC-003456789', concessionaria: 'CEMIG' },
    { denominacao: 'Ana Carolina Souza', contrato: 'UC-004567890', concessionaria: 'COPEL' },
    { denominacao: 'Roberto Martins', contrato: 'UC-005678901', concessionaria: 'CEEE' },
    { denominacao: 'Fernanda Lima Costa', contrato: 'UC-006789012', concessionaria: 'CEB' },
    { denominacao: 'Lucas Mendes Pereira', contrato: 'UC-007890123', concessionaria: 'COELBA' },
    { denominacao: 'Patrícia Rocha Almeida', contrato: 'UC-008901234', concessionaria: null },
    { denominacao: 'Empresa Sol Nascente', contrato: 'UC-009012345', concessionaria: 'ENEL CE' },
    { denominacao: 'Marcos Vinícius Barbosa', contrato: 'UC-010123456', concessionaria: null },
  ].map((u, i) => ({
    ...u,
    integrador_id: INTEGRADOR_ID,
    cliente_id: clienteIds[i % clienteIds.length],
  }))

  await supabaseAdmin.from('unidades_consumidoras').upsert(unidades, { onConflict: 'id' })
  console.log('✅ Unidades consumidoras criadas')

  // 7. Create tickets
  const usinaIds = allUsinas?.map(u => u.id) || []
  const ticketsData = [
    { titulo: 'Inversor offline há 3 dias', status: 'em_andamento', tipo: 'Monitoramento', prazo: new Date(Date.now() - 86400000).toISOString() },
    { titulo: 'Queda de geração acima de 30%', status: 'em_andamento', tipo: 'Desempenho', prazo: new Date(Date.now() + 2 * 86400000).toISOString() },
    { titulo: 'Atualização de firmware necessária', status: 'em_andamento', tipo: 'Manutenção', prazo: new Date(Date.now() - 2 * 86400000).toISOString() },
    { titulo: 'Limpeza de painéis programada', status: 'concluido', tipo: 'Manutenção', prazo: null },
    { titulo: 'Reclamação sobre fatura', status: 'cancelado', tipo: 'Financeiro', prazo: null },
    { titulo: 'Instalação de medidor bidirecional', status: 'cancelado', tipo: 'Instalação', prazo: null },
  ].map((t, i) => ({
    ...t,
    integrador_id: INTEGRADOR_ID,
    usina_id: usinaIds[i % usinaIds.length],
    cliente_id: clienteIds[i % clienteIds.length],
  }))

  await supabaseAdmin.from('tickets').upsert(ticketsData, { onConflict: 'id' })
  console.log('✅ Tickets criados')

  console.log('\n🎉 Seed concluído com sucesso!')
}

seed().catch(console.error)
