import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

const API_PERFIL = "https://vdnpheivy2.execute-api.us-east-1.amazonaws.com/Prod/profile";
const LIMITE_FOTO = 2 * 1024 * 1024; // 2 MB

interface PerfilProps {
  obterToken: () => Promise<string | null>;
  nomeInicial: string;
  emailInicial: string;
}

interface RespostaPerfil {
  nome?: string;
  telefone?: string;
  bio?: string;
  fotoUrl?: string | null;
  atualizadoEm?: number | string;
  erro?: string;
}

const arquivoParaBase64 = (arquivo: File) =>
  new Promise<string>((ok, erro) => {
    const leitor = new FileReader();
    leitor.onload = () => ok(String(leitor.result).split(",")[1]);
    leitor.onerror = () => erro(new Error("Não foi possível ler a imagem."));
    leitor.readAsDataURL(arquivo);
  });

export default function Perfil({ obterToken, nomeInicial, emailInicial }: PerfilProps) {
  const [nome, setNome] = useState(nomeInicial);
  const [telefone, setTelefone] = useState("");
  const [bio, setBio] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [novaFoto, setNovaFoto] = useState<File | null>(null);
  const [atualizadoEm, setAtualizadoEm] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const previa = useMemo(() => (novaFoto ? URL.createObjectURL(novaFoto) : null), [novaFoto]);
  useEffect(() => {
    return () => {
      if (previa) URL.revokeObjectURL(previa);
    };
  }, [previa]);

  // Carrega o perfil salvo ao abrir a tela.
  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const token = await obterToken();
        const r = await fetch(API_PERFIL, { headers: { Authorization: token ?? "" } });
        if (!r.ok) throw new Error();
        const d: RespostaPerfil = await r.json();
        if (!ativo) return;
        if (d.nome) setNome(d.nome);
        setTelefone(d.telefone ?? "");
        setBio(d.bio ?? "");
        setFotoUrl(d.fotoUrl ?? null);
        setAtualizadoEm(d.atualizadoEm ? Number(d.atualizadoEm) : null);
      } catch {
        if (ativo) setMensagem({ tipo: "erro", texto: "Não foi possível carregar o perfil." });
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [obterToken]);

  function escolherFoto(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    if (!["image/jpeg", "image/png"].includes(arquivo.type)) {
      setMensagem({ tipo: "erro", texto: "Use uma imagem JPEG ou PNG." });
      return;
    }
    if (arquivo.size > LIMITE_FOTO) {
      setMensagem({ tipo: "erro", texto: "A foto deve ter no máximo 2 MB." });
      return;
    }
    setMensagem(null);
    setNovaFoto(arquivo);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setMensagem(null);
    if (nome.trim().length < 3) {
      setMensagem({ tipo: "erro", texto: "Informe um nome com pelo menos 3 caracteres." });
      return;
    }
    setSalvando(true);
    try {
      const token = await obterToken();
      const corpo: Record<string, string> = {
        nome: nome.trim(),
        telefone: telefone.trim(),
        bio: bio.trim(),
      };
      if (novaFoto) {
        corpo.fotoBase64 = await arquivoParaBase64(novaFoto);
        corpo.fotoTipo = novaFoto.type;
      }
      const r = await fetch(API_PERFIL, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token ?? "" },
        body: JSON.stringify(corpo),
      });
      const dados: RespostaPerfil = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(dados.erro ?? "Não foi possível salvar o perfil.");
      setFotoUrl(dados.fotoUrl ?? null);
      setNovaFoto(null);
      setAtualizadoEm(dados.atualizadoEm ? Number(dados.atualizadoEm) : null);
      setMensagem({ tipo: "ok", texto: "Perfil atualizado com sucesso." });
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err instanceof Error ? err.message : "Erro ao salvar o perfil." });
    } finally {
      setSalvando(false);
    }
  }

  const imagem = previa ?? fotoUrl;
  const campo =
    "mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  if (carregando) {
    return <p className="text-slate-500">Carregando perfil...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-extrabold text-blue-950">Meu perfil</h1>
      <p className="mt-2 text-slate-500">Atualize seus dados e sua foto de perfil.</p>

      <form onSubmit={salvar} className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-5">
          {imagem ? (
            <img src={imagem} alt="Foto de perfil" className="h-24 w-24 rounded-full object-cover ring-2 ring-blue-100" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700">
              {nome.trim().charAt(0).toUpperCase() || "?"}
            </div>
          )}
          <div>
            <label className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Escolher foto
              <input type="file" accept="image/jpeg,image/png" onChange={escolherFoto} className="hidden" />
            </label>
            <p className="mt-2 text-xs text-slate-500">JPEG ou PNG, até 2 MB.</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} className={campo} />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">E-mail</label>
          <input value={emailInicial} disabled className={`${campo} bg-slate-50 text-slate-500`} />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Telefone</label>
          <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(84) 90000-0000" className={campo} />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Sobre você</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className={campo} />
        </div>

        {mensagem && (
          <p className={`text-sm font-semibold ${mensagem.tipo === "ok" ? "text-green-600" : "text-red-600"}`}>{mensagem.texto}</p>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {atualizadoEm ? `Última atualização: ${new Date(atualizadoEm * 1000).toLocaleString("pt-BR")}` : ""}
          </p>
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar perfil"}
          </button>
        </div>
      </form>
    </div>
  );
}
