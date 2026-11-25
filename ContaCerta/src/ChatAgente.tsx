import { useEffect, useRef, useState, type FormEvent } from "react";

const API_AGENTE = "https://vdnpheivy2.execute-api.us-east-1.amazonaws.com/Prod/agent";

interface Mensagem {
    id: number;
    autor: "usuario" | "agente" | "erro";
    texto: string;
}

interface ChatAgenteProps {
    /** Devolve o id token do Cognito do usuário logado. */
    obterToken: () => Promise<string | null>;
}

export default function ChatAgente({ obterToken }: ChatAgenteProps) {
    const [mensagens, setMensagens] = useState<Mensagem[]>([]);
    const [texto, setTexto] = useState("");
    const [aguardando, setAguardando] = useState(false);
    const fimRef = useRef<HTMLDivElement | null>(null);
    const contador = useRef(0);

    useEffect(() => {
        fimRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensagens, aguardando]);

    function adicionar(autor: Mensagem["autor"], t: string) {
        contador.current += 1;
        const id = contador.current;
        setMensagens((atual) => [...atual, { id, autor, texto: t }]);
    }

    async function enviar(e: FormEvent) {
        e.preventDefault();
        const pergunta = texto.trim();
        if (!pergunta || aguardando) return;

        adicionar("usuario", pergunta);
        setTexto("");
        setAguardando(true);

        try {
            const token = await obterToken();
            if (!token) {
                adicionar("erro", "Sessão expirada. Entre novamente.");
                return;
            }

            const r = await fetch(API_AGENTE, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: token },
                body: JSON.stringify({ message: pergunta }),
            });
            const dados = await r.json().catch(() => ({}));

            if (r.ok && dados.reply) {
                adicionar("agente", String(dados.reply));
            } else if (r.status === 401) {
                adicionar("erro", "Sessão expirada. Entre novamente.");
            } else {
                adicionar("erro", String(dados.error ?? dados.message ?? "Não foi possível falar com o assistente."));
            }
        } catch {
            adicionar("erro", "Falha de conexão. Tente novamente.");
        } finally {
            setAguardando(false);
        }
    }

    return (
        <section className="mx-auto flex h-[34rem] max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-bold text-slate-900">Assistente</h2>
                <p className="text-sm text-slate-500">
                    Lembra da nossa conversa e informa a hora certa de Brasília.
                </p>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" role="log" aria-live="polite">
                {mensagens.length === 0 && (
                    <p className="text-sm text-slate-500">
                        Pergunte algo ou peça a hora certa. Eu lembro do que já conversamos.
                    </p>
                )}
                {mensagens.map((m) => (
                    <div
                        key={m.id}
                        className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-4 py-2.5 text-sm ${m.autor === "usuario"
                                ? "ml-auto bg-blue-600 text-white"
                                : m.autor === "erro"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-slate-100 text-slate-800"
                            }`}
                    >
                        {m.texto}
                    </div>
                ))}
                {aguardando && <p className="text-sm text-slate-500">Pensando…</p>}
                <div ref={fimRef} />
            </div>

            <form onSubmit={enviar} className="flex gap-2 border-t border-slate-200 p-4">
                <input
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Digite sua mensagem"
                    maxLength={2000}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <button
                    type="submit"
                    disabled={aguardando || !texto.trim()}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                    Enviar
                </button>
            </form>
        </section>
    );
}
