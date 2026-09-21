import { useState, type FormEvent } from "react";

/* =========================================================
   TIPOS E ROTEAMENTO
========================================================= */

type Tela = "inicio" | "login" | "cadastro" | "dashboard" | "despesas" | "metas" | "alertas";

interface Usuario {
  nome: string;
  email: string;
}

type Categoria = "Água" | "Energia" | "Internet" | "Telefone" | "Gás" | "Condomínio" | "Outros";

interface Despesa {
  id: string;
  categoria: Categoria;
  descricao: string;
  valor: number;
  periodo: string; // formato "AAAA-MM"
}

const CATEGORIAS: Categoria[] = ["Água", "Energia", "Internet", "Telefone", "Gás", "Condomínio", "Outros"];

function App() {
  const [tela, setTela] = useState<Tela>("inicio");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [despesas, setDespesas] = useState<Despesa[]>([]); // RN01: nenhuma despesa até o usuário cadastrar

  const irPara = (destino: Tela) => setTela(destino);

  const fazerLogin = (dados: Usuario) => {
    setUsuario(dados);
    setTela("dashboard");
  };

  const fazerLogout = () => {
    setUsuario(null);
    setTela("inicio");
  };

  const adicionarDespesa = (despesa: Omit<Despesa, "id">) => {
    setDespesas((atual) => [...atual, { ...despesa, id: crypto.randomUUID() }]);
  };

  const removerDespesa = (id: string) => {
    setDespesas((atual) => atual.filter((d) => d.id !== id)); // RN12: excluídas somem dos cálculos
  };

  if (tela === "login") {
    return <Login voltar={() => irPara("inicio")} cadastro={() => irPara("cadastro")} aoLogar={fazerLogin} />;
  }

  if (tela === "cadastro") {
    return <Cadastro voltar={() => irPara("inicio")} login={() => irPara("login")} aoCadastrar={fazerLogin} />;
  }

  if (usuario && (tela === "dashboard" || tela === "despesas" || tela === "metas" || tela === "alertas")) {
    return (
      <AreaLogada
        telaAtiva={tela}
        usuario={usuario}
        despesas={despesas}
        adicionarDespesa={adicionarDespesa}
        removerDespesa={removerDespesa}
        navegar={irPara}
        sair={fazerLogout}
      />
    );
  }

  return <Inicio login={() => irPara("login")} cadastro={() => irPara("cadastro")} />;
}

/* =========================================================
   VALIDAÇÃO DE FORMULÁRIOS
========================================================= */

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarEmail(valor: string): string {
  if (!valor.trim()) return "Informe o e-mail.";
  if (!REGEX_EMAIL.test(valor)) return "Informe um e-mail válido.";
  return "";
}

function validarSenha(valor: string): string {
  if (!valor) return "Informe a senha.";
  if (valor.length < 8) return "A senha deve ter mais de 8 caracteres.";
  if (!/[A-Z]/.test(valor)) return "A senha deve ter pelo menos uma letra maiúscula.";
  if (!/[0-9]/.test(valor)) return "A senha deve ter pelo menos um número.";
  if (!/[^A-Za-z0-9]/.test(valor)) return "A senha deve ter pelo menos um caractere especial.";
  return "";
}

const REGEX_NOME = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?: [A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;

function validarNome(valor: string): string {
  if (!valor.trim()) return "Informe o nome completo.";
  if (valor.trim().length < 3) return "O nome deve ter pelo menos 3 caracteres.";
  if (!REGEX_NOME.test(valor.trim())) return "O nome deve conter apenas letras.";
  return "";
}

function validarConfirmacaoSenha(senha: string, confirmacao: string): string {
  if (!confirmacao) return "Confirme a senha.";
  if (senha !== confirmacao) return "As senhas não coincidem.";
  return "";
}

// RN03 - Toda despesa deverá estar associada a uma categoria.
function validarCategoria(valor: string): string {
  if (!valor) return "Selecione uma categoria.";
  return "";
}

// RN02 - O valor de uma despesa deverá ser maior que zero.
function validarValorDespesa(valor: string): string {
  if (!valor.trim()) return "Informe o valor.";
  const numero = Number(valor.replace(",", "."));
  if (Number.isNaN(numero)) return "Informe um valor numérico.";
  if (numero <= 0) return "O valor deve ser maior que zero.";
  return "";
}

// RN04 - Toda despesa deverá possuir um período de referência.
function validarPeriodo(valor: string): string {
  if (!valor) return "Informe o período de referência.";
  return "";
}

/* =========================================================
   TELA INICIAL
========================================================= */

interface InicioProps {
  login: () => void;
  cadastro: () => void;
}

function Inicio({ login, cadastro }: InicioProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={login} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-blue-50">
              Entrar
            </button>
            <button onClick={cadastro} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              Criar conta
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section className="overflow-hidden bg-white">
          <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-16 px-6 py-16 lg:grid-cols-2 lg:px-10 lg:py-20">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
                <span>✦</span>
                Controle financeiro inteligente
              </div>

              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-blue-950 sm:text-5xl lg:text-6xl">
                Suas contas no lugar.
                <br />
                <span className="text-blue-600">Suas finanças sob controle.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-500 sm:text-lg">
                Organize suas despesas recorrentes, acompanhe seus gastos e entenda melhor para onde está indo o seu dinheiro.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={cadastro} className="flex items-center gap-3 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                  Começar agora
                  <span className="text-xl">→</span>
                </button>
                <button onClick={login} className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-bold text-blue-900 transition hover:bg-slate-50">
                  Já tenho uma conta
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-6 text-sm font-semibold text-slate-500">
                <div className="flex items-center gap-2"><span className="text-green-600">✓</span>Organização</div>
                <div className="flex items-center gap-2"><span className="text-green-600">✓</span>Análise</div>
                <div className="flex items-center gap-2"><span className="text-green-600">✓</span>Controle</div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
              <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-blue-900/10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Gastos do mês</p>
                    <h2 className="mt-2 text-3xl font-extrabold text-blue-950">R$ 850,40</h2>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl font-bold text-green-600">↗</div>
                </div>

                <div className="mt-8 flex h-52 items-end justify-between gap-3 border-b border-slate-200 px-2">
                  <div className="h-[35%] w-full rounded-t-md bg-blue-200" />
                  <div className="h-[50%] w-full rounded-t-md bg-blue-300" />
                  <div className="h-[42%] w-full rounded-t-md bg-blue-300" />
                  <div className="h-[67%] w-full rounded-t-md bg-blue-400" />
                  <div className="h-[55%] w-full rounded-t-md bg-blue-400" />
                  <div className="h-[76%] w-full rounded-t-md bg-blue-500" />
                  <div className="h-[88%] w-full rounded-t-md bg-green-500" />
                </div>

                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-slate-500">Este mês</span>
                  <strong className="text-green-600">↓ 8,4%</strong>
                </div>
              </div>

              <div className="absolute -bottom-7 -right-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 font-bold text-green-600">✓</div>
                <div>
                  <p className="text-xs text-slate-500">Economia</p>
                  <p className="font-bold text-blue-950">R$ 120,00</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-6 py-20 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-bold text-blue-600">CONTA CERTA</p>
              <h2 className="mt-3 text-3xl font-extrabold text-blue-950 sm:text-4xl">Tudo para acompanhar suas despesas</h2>
              <p className="mt-4 leading-7 text-slate-500">Centralize suas contas e tenha uma visão mais clara dos seus gastos.</p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <Feature icon="▣" title="Organize suas despesas" text="Registre suas contas e mantenha suas informações organizadas em um único lugar." color="blue" />
              <Feature icon="↗" title="Acompanhe seus gastos" text="Visualize a evolução das suas despesas ao longo dos meses." color="green" />
              <Feature icon="⌁" title="Entenda seus gastos" text="Compare períodos, identifique variações e acompanhe seu histórico." color="purple" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-7 text-center text-sm text-slate-500">
        © 2026 ContaCerta — Controle suas contas de forma simples.
      </footer>
    </div>
  );
}

/* =========================================================
   LOGIN
========================================================= */

interface LoginProps {
  voltar: () => void;
  cadastro: () => void;
  aoLogar: (usuario: Usuario) => void;
}

function Login({ voltar, cadastro, aoLogar }: LoginProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const erroEmail = validarEmail(email);
    const erroSenha = validarSenha(senha);

    if (erroEmail || erroSenha) {
      setErros({ email: erroEmail, senha: erroSenha });
      return;
    }

    setErros({});
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      aoLogar({ nome: email.split("@")[0], email });
    }, 400);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 p-10 lg:flex lg:items-center">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-lg">
          <Logo light />
          <h1 className="mt-14 text-5xl font-extrabold leading-tight text-white">
            Controle suas contas.
            <br />
            <span className="text-green-400">Cuide do seu dinheiro.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-blue-100">Tenha uma visão clara das suas despesas e acompanhe sua evolução financeira.</p>
          <div className="mt-10 space-y-4">
            <CheckItem text="Organize suas despesas" />
            <CheckItem text="Acompanhe seus gastos" />
            <CheckItem text="Analise seu histórico" />
          </div>
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
        <div className="w-full max-w-md">
          <button onClick={voltar} className="mb-10 text-sm font-semibold text-slate-500 transition hover:text-blue-600">← Voltar</button>
          <div className="mb-10 lg:hidden"><Logo /></div>
          <h2 className="text-3xl font-extrabold text-blue-950">Bem-vindo de volta!</h2>
          <p className="mt-2 text-slate-500">Entre na sua conta para continuar.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <Campo
              label="E-mail"
              tipo="email"
              placeholder="seu@email.com"
              valor={email}
              erro={erros.email}
              onChange={(v) => {
                setEmail(v);
                if (erros.email) setErros((s) => ({ ...s, email: validarEmail(v) }));
              }}
              onBlur={() => setErros((s) => ({ ...s, email: validarEmail(email) }))}
            />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">Senha</label>
                <button type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Esqueci minha senha</button>
              </div>
              <Campo
                label=""
                tipo="password"
                placeholder="Digite sua senha"
                valor={senha}
                erro={erros.senha}
                onChange={(v) => {
                  setSenha(v);
                  if (erros.senha) setErros((s) => ({ ...s, senha: validarSenha(v) }));
                }}
                onBlur={() => setErros((s) => ({ ...s, senha: validarSenha(senha) }))}
                semLabel
              />
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? "Entrando..." : "Entrar na conta"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Ainda não possui uma conta?{" "}
            <button onClick={cadastro} className="font-bold text-blue-600 hover:text-blue-700">Criar conta</button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CADASTRO
========================================================= */

interface CadastroProps {
  voltar: () => void;
  login: () => void;
  aoCadastrar: (usuario: Usuario) => void;
}

function Cadastro({ voltar, login, aoCadastrar }: CadastroProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erros, setErros] = useState<{ nome?: string; email?: string; senha?: string; confirmarSenha?: string }>({});
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const novosErros = {
      nome: validarNome(nome),
      email: validarEmail(email),
      senha: validarSenha(senha),
      confirmarSenha: validarConfirmacaoSenha(senha, confirmarSenha),
    };

    if (Object.values(novosErros).some(Boolean)) {
      setErros(novosErros);
      return;
    }

    setErros({});
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      aoCadastrar({ nome, email });
    }, 400);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 p-10 lg:flex lg:items-center">
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-lg">
          <Logo light />
          <h1 className="mt-14 text-5xl font-extrabold leading-tight text-white">
            Comece a cuidar
            <br />
            <span className="text-green-400">melhor do seu dinheiro.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-blue-100">Crie sua conta e tenha suas despesas organizadas em um único lugar.</p>
          <div className="mt-10 space-y-4">
            <CheckItem text="Controle suas despesas" />
            <CheckItem text="Acompanhe seus gastos" />
            <CheckItem text="Analise seu histórico" />
          </div>
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
        <div className="w-full max-w-md">
          <button onClick={voltar} className="mb-8 text-sm font-semibold text-slate-500 transition hover:text-blue-600">← Voltar</button>
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h2 className="text-3xl font-extrabold text-blue-950">Crie sua conta</h2>
          <p className="mt-2 text-slate-500">Preencha seus dados para começar.</p>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
            <Campo
              label="Nome completo"
              tipo="text"
              placeholder="Digite seu nome"
              valor={nome}
              erro={erros.nome}
              onChange={(v) => {
                setNome(v);
                if (erros.nome) setErros((s) => ({ ...s, nome: validarNome(v) }));
              }}
              onBlur={() => setErros((s) => ({ ...s, nome: validarNome(nome) }))}
            />
            <Campo
              label="E-mail"
              tipo="email"
              placeholder="seu@email.com"
              valor={email}
              erro={erros.email}
              onChange={(v) => {
                setEmail(v);
                if (erros.email) setErros((s) => ({ ...s, email: validarEmail(v) }));
              }}
              onBlur={() => setErros((s) => ({ ...s, email: validarEmail(email) }))}
            />
            <div>
              <Campo
                label="Senha"
                tipo="password"
                placeholder="Crie uma senha"
                valor={senha}
                erro={erros.senha}
                onChange={(v) => {
                  setSenha(v);
                  if (erros.senha) setErros((s) => ({ ...s, senha: validarSenha(v) }));
                  if (erros.confirmarSenha) setErros((s) => ({ ...s, confirmarSenha: validarConfirmacaoSenha(v, confirmarSenha) }));
                }}
                onBlur={() => setErros((s) => ({ ...s, senha: validarSenha(senha) }))}
              />
              {!erros.senha && (
                <p className="mt-1.5 text-xs text-slate-400">
                  Mais de 8 caracteres, com letra maiúscula, número e caractere especial.
                </p>
              )}
            </div>
            <Campo
              label="Confirmar senha"
              tipo="password"
              placeholder="Digite a senha novamente"
              valor={confirmarSenha}
              erro={erros.confirmarSenha}
              onChange={(v) => {
                setConfirmarSenha(v);
                if (erros.confirmarSenha) setErros((s) => ({ ...s, confirmarSenha: validarConfirmacaoSenha(senha, v) }));
              }}
              onBlur={() => setErros((s) => ({ ...s, confirmarSenha: validarConfirmacaoSenha(senha, confirmarSenha) }))}
            />

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? "Criando conta..." : "Criar minha conta"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs leading-5 text-slate-400">
            Ao criar uma conta, você concorda com os termos de uso e política de privacidade.
          </p>

          <p className="mt-5 text-center text-sm text-slate-500">
            Já possui uma conta?{" "}
            <button onClick={login} className="font-bold text-blue-600 hover:text-blue-700">Entrar</button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ÁREA LOGADA (dashboard + menu + despesas)
========================================================= */

interface AreaLogadaProps {
  telaAtiva: Tela;
  usuario: Usuario;
  despesas: Despesa[];
  adicionarDespesa: (d: Omit<Despesa, "id">) => void;
  removerDespesa: (id: string) => void;
  navegar: (tela: Tela) => void;
  sair: () => void;
}

const ITENS_MENU: { id: Tela; label: string; icon: string }[] = [
  { id: "dashboard", label: "Início", icon: "▣" },
  { id: "despesas", label: "Despesas", icon: "$" },
  { id: "metas", label: "Metas", icon: "◎" },
  { id: "alertas", label: "Alertas", icon: "!" },
];

function AreaLogada({ telaAtiva, usuario, despesas, adicionarDespesa, removerDespesa, navegar, sair }: AreaLogadaProps) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-10">
            <Logo />
            <nav className="hidden items-center gap-1 md:flex">
              {ITENS_MENU.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navegar(item.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${telaAtiva === item.id ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-blue-700"
                    }`}
                >
                  <span aria-hidden>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-blue-950">{usuario.nome}</p>
              <p className="text-xs text-slate-500">{usuario.email}</p>
            </div>
            <button onClick={sair} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Sair
            </button>
            <button onClick={() => setMenuAberto((v) => !v)} className="rounded-lg border border-slate-300 p-2.5 text-slate-600 md:hidden" aria-label="Abrir menu">
              ☰
            </button>
          </div>
        </div>

        {menuAberto && (
          <nav className="flex flex-col border-t border-slate-200 bg-white px-6 py-3 md:hidden">
            {ITENS_MENU.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  navegar(item.id);
                  setMenuAberto(false);
                }}
                className={`flex items-center gap-2 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${telaAtiva === item.id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        {telaAtiva === "dashboard" && <PainelDashboard usuario={usuario} despesas={despesas} irParaDespesas={() => navegar("despesas")} />}
        {telaAtiva === "despesas" && <PaginaDespesas despesas={despesas} adicionarDespesa={adicionarDespesa} removerDespesa={removerDespesa} />}
        {telaAtiva === "metas" && <PaginaSimples titulo="Metas" texto="Defina metas de gasto por categoria e acompanhe se estão sendo cumpridas." />}
        {telaAtiva === "alertas" && <PaginaSimples titulo="Alertas" texto="Veja avisos sobre despesas com variação significativa em relação ao seu histórico." />}
      </main>
    </div>
  );
}

/* --------- DASHBOARD: agora calculado a partir das despesas reais --------- */

function PainelDashboard({ usuario, despesas, irParaDespesas }: { usuario: Usuario; despesas: Despesa[]; irParaDespesas: () => void }) {
  const totalGasto = despesas.reduce((soma, d) => soma + d.valor, 0);
  const quantidade = despesas.length;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-blue-950">Olá, {usuario.nome}!</h1>
      <p className="mt-1 text-slate-500">Aqui está um resumo das suas despesas.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <CardResumo titulo="Total registrado" valor={formatarMoeda(totalGasto)} cor="blue" />
        <CardResumo titulo="Despesas cadastradas" valor={String(quantidade)} cor="green" />
        <CardResumo titulo="Alertas ativos" valor="0" cor="purple" />
      </div>

      {quantidade === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="font-semibold text-slate-600">Nenhuma despesa cadastrada ainda.</p>
          <p className="mt-1 text-sm text-slate-500">Os valores acima aparecem assim que você cadastrar sua primeira despesa.</p>
          <button onClick={irParaDespesas} className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700">
            Cadastrar despesa
          </button>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-bold text-slate-700">Últimas despesas</p>
          <ul className="mt-4 divide-y divide-slate-100">
            {despesas.slice(-5).reverse().map((d) => (
              <li key={d.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-slate-600">{d.categoria} — {d.descricao || "sem descrição"} ({d.periodo})</span>
                <strong className="text-blue-950">{formatarMoeda(d.valor)}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CardResumo({ titulo, valor, cor }: { titulo: string; valor: string; cor: "blue" | "green" | "purple" }) {
  const cores = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    purple: "text-purple-600 bg-purple-50",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-sm font-medium text-slate-500">{titulo}</p>
      <p className={`mt-2 inline-block rounded-lg px-2 py-1 text-2xl font-extrabold ${cores[cor]}`}>{valor}</p>
    </div>
  );
}

/* --------- DESPESAS: formulário real de cadastro (RF04) com validação --------- */

interface PaginaDespesasProps {
  despesas: Despesa[];
  adicionarDespesa: (d: Omit<Despesa, "id">) => void;
  removerDespesa: (id: string) => void;
}

function PaginaDespesas({ despesas, adicionarDespesa, removerDespesa }: PaginaDespesasProps) {
  const [categoria, setCategoria] = useState<Categoria | "">("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [erros, setErros] = useState<{ categoria?: string; valor?: string; periodo?: string }>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const novosErros = {
      categoria: validarCategoria(categoria),
      valor: validarValorDespesa(valor),
      periodo: validarPeriodo(periodo),
    };

    if (Object.values(novosErros).some(Boolean)) {
      setErros(novosErros);
      return;
    }

    setErros({});
    adicionarDespesa({
      categoria: categoria as Categoria,
      descricao: descricao.trim(),
      valor: Number(valor.replace(",", ".")),
      periodo,
    });

    setCategoria("");
    setDescricao("");
    setValor("");
    setPeriodo("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form onSubmit={handleSubmit} noValidate className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-extrabold text-blue-950">Nova despesa</h2>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => {
                const v = e.target.value as Categoria | "";
                setCategoria(v);
                if (erros.categoria) setErros((s) => ({ ...s, categoria: validarCategoria(v) }));
              }}
              onBlur={() => setErros((s) => ({ ...s, categoria: validarCategoria(categoria) }))}
              required
              aria-required
              aria-invalid={!!erros.categoria}
              className={`w-full rounded-xl border bg-white px-4 py-3.5 text-sm outline-none transition focus:ring-4 ${erros.categoria ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                }`}
            >
              <option value="">Selecione...</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {erros.categoria && <p className="mt-1.5 text-xs font-semibold text-red-500">{erros.categoria}</p>}
          </div>

          <Campo
            label="Descrição"
            tipo="text"
            placeholder="Ex: Fatura de fevereiro"
            valor={descricao}
            onChange={setDescricao}
            obrigatorio={false}
          />

          <Campo
            label="Valor (R$)"
            tipo="text"
            placeholder="0,00"
            valor={valor}
            erro={erros.valor}
            onChange={(v) => {
              setValor(v);
              if (erros.valor) setErros((s) => ({ ...s, valor: validarValorDespesa(v) }));
            }}
            onBlur={() => setErros((s) => ({ ...s, valor: validarValorDespesa(valor) }))}
          />

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Período de referência<span className="ml-0.5 text-red-500">*</span>
            </label>
            <input
              type="month"
              value={periodo}
              onChange={(e) => {
                setPeriodo(e.target.value);
                if (erros.periodo) setErros((s) => ({ ...s, periodo: validarPeriodo(e.target.value) }));
              }}
              onBlur={() => setErros((s) => ({ ...s, periodo: validarPeriodo(periodo) }))}
              required
              aria-required
              aria-invalid={!!erros.periodo}
              className={`w-full rounded-xl border bg-white px-4 py-3.5 text-sm outline-none transition focus:ring-4 ${erros.periodo ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                }`}
            />
            {erros.periodo && <p className="mt-1.5 text-xs font-semibold text-red-500">{erros.periodo}</p>}
          </div>

          <button type="submit" className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white transition hover:bg-blue-700">
            Cadastrar despesa
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-extrabold text-blue-950">Histórico</h2>

        {despesas.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Nenhuma despesa cadastrada ainda. Use o formulário ao lado para começar.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {despesas.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-blue-950">{d.categoria} • {d.periodo}</p>
                  <p className="text-xs text-slate-500">{d.descricao || "sem descrição"}</p>
                </div>
                <div className="flex items-center gap-4">
                  <strong className="text-blue-950">{formatarMoeda(d.valor)}</strong>
                  <button onClick={() => removerDespesa(d.id)} className="text-xs font-semibold text-red-500 hover:text-red-600">
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PaginaSimples({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8">
      <h1 className="text-2xl font-extrabold text-blue-950">{titulo}</h1>
      <p className="mt-2 text-slate-500">{texto}</p>
    </div>
  );
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* =========================================================
   COMPONENTES REUTILIZÁVEIS
========================================================= */

interface CampoProps {
  label: string;
  tipo: "text" | "email" | "password";
  placeholder: string;
  valor: string;
  erro?: string;
  onChange: (valor: string) => void;
  onBlur?: () => void;
  semLabel?: boolean;
  obrigatorio?: boolean;
}

function Campo({ label, tipo, placeholder, valor, erro, onChange, onBlur, semLabel, obrigatorio = true }: CampoProps) {
  return (
    <div>
      {!semLabel && (
        <label className="mb-2 block text-sm font-bold text-slate-700">
          {label}
          {obrigatorio && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <input
        type={tipo}
        placeholder={placeholder}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={obrigatorio}
        aria-required={obrigatorio}
        aria-invalid={!!erro}
        className={`w-full rounded-xl border bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${erro ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
          }`}
      />
      {erro && <p className="mt-1.5 text-xs font-semibold text-red-500">{erro}</p>}
    </div>
  );
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl font-extrabold ${light ? "bg-green-500 text-white" : "bg-blue-600 text-white"}`}>✓</div>
      <span className={`text-2xl font-extrabold ${light ? "text-white" : "text-blue-950"}`}>
        Conta<span className="text-green-500">Certa</span>
      </span>
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-blue-100">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">✓</div>
      <span>{text}</span>
    </div>
  );
}

interface FeatureProps {
  icon: string;
  title: string;
  text: string;
  color: "blue" | "green" | "purple";
}

function Feature({ icon, title, text, color }: FeatureProps) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl">
      <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold ${colors[color]}`}>{icon}</div>
      <h3 className="text-lg font-bold text-blue-950">{title}</h3>
      <p className="mt-3 leading-7 text-slate-500">{text}</p>
    </div>
  );
}

export default App;