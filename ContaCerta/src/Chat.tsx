import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

const WS_URL = import.meta.env.VITE_WS_URL as string | undefined;

interface Mensagem {
    id: number;
    autor: "usuario" | "assistente" | "erro";
    texto: string;
}

type Status = "conectando" | "conectado" | "desconectado";

interface ChatProps {
    /** Devolve o access token do Cognito do usuário logado. */
    obterToken: () => Promise<string | null>;
}

export default function Chat({ obterToken }: ChatProps) {
    const [mensagens, setMensagens] = useState<Mensagem[]>([]);
    const [texto, setTexto] = useState("");
    const [status, setStatus] = useState<Status>("conectando");
    const [aguardando, setAguardando] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const fimRef = useRef<HTMLDivElement | null>(null);
    const contador = useRef(0);

    const adicionar = useCallback((autor: Mensagem["autor"], t: string) => {
        contador.current += 1;
        setMensagens((atual) => [...atual, { id: contador.current, autor, texto: t }]);
    }, []);

    const conectar = useCallback(async () => {
        if (!WS_URL) {
            setStatus("desconectado");
            adicionar("erro", "VITE_WS_URL não configurada.");
            return;
        }
        setStatus("conectando");
        const token = await obterToken();
        if (!token) {
            setStatus("desconectado");
            adicionar("erro", "Sessão expirada. Entre novamente.");
            return;
        }

        // O navegador não permite headers no WebSocket: o token vai na query string.
        const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
        wsRef.current = ws;

        ws.onopen = () => setStatus("conectado");
        ws.onclose = () => {
            if (wsRef.current === ws) {
                setStatus("desconectado");
                setAguardando(false);
            }
        };
        ws.onerror = () => {
            if (wsRef.current === ws) setStatus("desconectado");
        };
        ws.onmessage = (ev) => {
            try {
                const dados = JSON.parse(ev.data);
                adicionar(dados.type === "erro" ? "erro" : "assistente", String(dados.message ?? ""));
            } catch {
                adicionar("assistente", String(ev.data));
            }
            setAguardando(false);
        };
    }, [obterToken, adicionar]);

    useEffect(() => {
        conectar();
        return () => {
            const ws = wsRef.current;
            wsRef.current = null;
            ws?.close();
        };
    }, [conectar]);

    useEffect(() => {
        fimRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensagens, aguardando]);

    function enviar(e: FormEvent) {
        e.preventDefault();
        const pergunta = texto.trim();
        const ws = wsRef.current;
        if (!pergunta || !ws || ws.readyState !== WebSocket.OPEN || aguardando) return;

        // "action" é usado pela route selection expression; sem rota correspondente cai em $default.
        ws.send(JSON.stringify({ action: "sendMessage", message: pergunta }));
        adicionar("usuario", pergunta);
        setTexto("");
        setAguardando(true);
    }

    const cor = {
        conectado: "bg-emerald-500",
        conectando: "bg-amber-400",
        desconectado: "bg-red-500",
    }[status];

    return (
        <section className="mx-auto flex h-[70vh] max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                    <h1 className="text-lg font-extrabold text-blue-950">Assistente ContaCerta</h1>
                    <p className="text-xs text-slate-500">Tire dúvidas sobre suas despesas e economia.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${cor}`} />
                    {status}
                    {status === "desconectado" && (
                        <button onClick={conectar} className="ml-2 rounded-md border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50">
                            Reconectar
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
                {mensagens.length === 0 && (
                    <p className="text-center text-sm text-slate-400">Faça uma pergunta para começar.</p>
                )}
                {mensagens.map((m) => (
                    <div key={m.id} className={`flex ${m.autor === "usuario" ? "justify-end" : "justify-start"}`}>
                        <div
                            className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${m.autor === "usuario"
                                ? "bg-blue-600 text-white"
                                : m.autor === "erro"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-slate-100 text-slate-800"
                                }`}
                        >
                            {m.texto}
                        </div>
                    </div>
                ))}
                {aguardando && <p className="text-sm text-slate-400">Assistente está respondendo…</p>}
                <div ref={fimRef} />
            </div>

            <form onSubmit={enviar} className="flex gap-2 border-t border-slate-200 p-4">
                <input
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Digite sua pergunta…"
                    maxLength={2000}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
                <button
                    type="submit"
                    disabled={status !== "conectado" || aguardando || !texto.trim()}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Enviar
                </button>
            </form>
        </section>
    );
}