import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

type SectionId = "about" | "projects" | "exp" | "contact";
type RepoFilter = "all" | "featured" | "recent";

type Repo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  private: boolean;
};

const GH_USER = "Arthur-dv";
const FEATURED = ["portfolio", "site", "despesas", "sql", "python", "react", "typescript"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function isFeatured(repo: Repo) {
  const hay = normalize(`${repo.name} ${repo.description ?? ""}`);
  return FEATURED.some((keyword) => hay.includes(keyword)) || repo.stargazers_count > 0;
}

function MacBar({ title }: { title: string }) {
  return (
    <header className="flex h-11 items-center gap-3 border-b-2 border-ui-border bg-ui-bar px-4">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-teal-400" />
      </div>
      <span className="font-pixel text-[10px] tracking-wide text-white">{title}</span>
    </header>
  );
}

function SectionCard({
  id,
  title,
  children,
  register,
}: {
  id: SectionId;
  title: string;
  children: ReactNode;
  register: (id: SectionId, el: HTMLElement | null) => void;
}) {
  return (
    <section
      id={id}
      ref={(el) => register(id, el)}
      className="section-card section-hidden scroll-mt-24 overflow-hidden rounded-xl border-2 border-ui-border bg-ui-panel shadow-[0_0_0_1px_rgba(0,0,0,.12)]"
      data-id={id}
    >
      <MacBar title={title} />
      <div className="p-4 md:p-6">{children}</div>
    </section>
  );
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [clock, setClock] = useState("--:--");
  const [activeTab, setActiveTab] = useState<SectionId>("about");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RepoFilter>("all");
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [toast, setToast] = useState("");

  const sectionsRef = useRef<Record<SectionId, HTMLElement | null>>({
    about: null,
    projects: null,
    exp: null,
    contact: null,
  });

  useEffect(() => {
    const update = () => {
      setClock(
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };
    update();
    const t = window.setInterval(update, 15000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (!started) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.remove("section-hidden");
            entry.target.classList.add("section-show");
          }
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );

    const nodes = Object.values(sectionsRef.current).filter(Boolean) as HTMLElement[];
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/users/${encodeURIComponent(GH_USER)}/repos?per_page=100&sort=pushed`,
          { headers: { Accept: "application/vnd.github+json" } },
        );
        if (!response.ok) throw new Error(String(response.status));
        const data = (await response.json()) as Repo[];
        if (!active) return;
        setRepos(data.filter((repo) => !repo.fork && !repo.archived && !repo.private));
      } catch {
        if (!active) return;
        setRepos([]);
      } finally {
        if (active) setLoadingRepos(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [started]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const registerSection = (id: SectionId, element: HTMLElement | null) => {
    sectionsRef.current[id] = element;
  };

  const goToSection = (id: SectionId) => {
    setActiveTab(id);
    const node = sectionsRef.current[id];
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
    node.classList.remove("section-hidden");
    node.classList.add("section-show");
  };

  const visibleRepos = useMemo(() => {
    const ordered = [...repos].sort(
      (a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime(),
    );
    let list = ordered;
    if (filter === "featured") list = ordered.filter(isFeatured);
    if (filter === "recent") list = ordered.slice(0, 6);
    if (query.trim()) {
      const q = normalize(query);
      list = list.filter((repo) =>
        normalize(`${repo.name} ${repo.description ?? ""} ${repo.language ?? ""}`).includes(q),
      );
    }
    return list;
  }, [repos, filter, query]);

  const kpiRepos = repos.length;
  const kpiStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const kpiUpdated = repos[0]?.pushed_at ? formatDate(repos[0].pushed_at) : "-";

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("vianaarthur721@gmail.com");
      setToast("E-mail copiado!");
    } catch {
      setToast("Não foi possível copiar.");
    }
  };

  return (
    <div className="min-h-screen bg-ui-cream text-ui-ink">
      {!started && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-ui-cream px-6 text-center">
          <h1 className="font-pixel text-2xl leading-[1.8] text-ui-ink md:text-4xl animate-press-start">
            PRESS START
          </h1>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="btn-pixel btn-pixel-blue cursor-pointer px-8 py-3 text-[10px] tracking-wider text-white"
          >
            START GAME
          </button>
        </div>
      )}

      <div className={`transition-all duration-500 ${started ? "opacity-100" : "opacity-0 blur-sm"}`}>
        <header className="sticky top-0 z-30 border-b-2 border-ui-border bg-ui-bar/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
            <div className="font-pixel text-[10px] text-white md:text-xs">ARTHUR.OS</div>
            <nav className="flex items-center gap-2">
              <button className={`nav-btn ${activeTab === "about" ? "nav-btn-on" : ""}`} onClick={() => goToSection("about")}>
                SOBRE
              </button>
              <button className={`nav-btn ${activeTab === "projects" ? "nav-btn-on" : ""}`} onClick={() => goToSection("projects")}>
                PROJETOS
              </button>
              <button className={`nav-btn ${activeTab === "exp" ? "nav-btn-on" : ""}`} onClick={() => goToSection("exp")}>
                EXP
              </button>
              <button className={`nav-btn ${activeTab === "contact" ? "nav-btn-on" : ""}`} onClick={() => goToSection("contact")}>
                CONTATO
              </button>
            </nav>
            <div className="font-semibold text-white">{clock}</div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 md:px-6">
          <SectionCard id="about" title="sobre.exe" register={registerSection}>
            <div className="grid gap-4 md:grid-cols-[132px_1fr]">
              <img
                src="/arthurviana.jpg"
                alt="Arthur Viana"
                className="h-32 w-32 rounded-lg border-2 border-ui-border object-cover"
              />
              <div>
                <h1 className="font-pixel text-sm leading-5 md:text-base">
                  Arthur Viana
                </h1>
                <p className="mt-2 text-sm font-semibold md:text-base">
                  Software Engineer • Full Stack Developer
                </p>
                <p className="text-sm text-ui-muted font-semibold">Belo Horizonte, Brasil</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["TypeScript", "React", "Node.js", "Python", "PostgreSQL", "Tailwind", "API REST"].map((item) => (
                    <span
                      key={item}
                      className="tag-pill"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="kpi-card">
                <span className="kpi-value">{kpiRepos}</span>
                <span className="kpi-label font-semibold">repositórios</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{kpiStars}</span>
                <span className="kpi-label font-semibold">stars</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{kpiUpdated}</span>
                <span className="kpi-label font-semibold">atualização</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="projects" title="projetos.exe" register={registerSection}>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button className={`filter-btn ${filter === "all" ? "filter-btn-on" : ""}`} onClick={() => setFilter("all")}>
                Todos
              </button>
              <button className={`filter-btn ${filter === "featured" ? "filter-btn-on" : ""}`} onClick={() => setFilter("featured")}>
                Destaques
              </button>
              <button className={`filter-btn ${filter === "recent" ? "filter-btn-on" : ""}`} onClick={() => setFilter("recent")}>
                Recentes
              </button>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="buscar projeto..."
                className="ml-auto w-full rounded border-2 border-ui-border bg-white/80 px-3 py-2 font-semibold text-sm text-ui-ink outline-none placeholder:text-ui-muted focus:border-ui-blue md:w-64"
              />
            </div>

            {loadingRepos && <div className="rounded-lg border border-ui-border bg-white/60 p-4 text-ui-muted font-semibold">Carregando projetos...</div>}
            {!loadingRepos && visibleRepos.length === 0 && (
              <div className="rounded-lg border border-ui-border bg-white/60 p-4 text-ui-muted font-semibold">Nenhum projeto encontrado.</div>
            )}

            {!loadingRepos && visibleRepos.length > 0 && (
              <div className="grid gap-3 md:grid-cols-2">
                {visibleRepos.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-lg border-2 border-ui-border bg-white/70 p-4 transition hover:-translate-y-0.5 hover:border-ui-blue"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-pixel text-[11px] leading-5 text-ui-bar">{repo.name}</h3>
                      <span className="text-sm text-ui-bar">★ {repo.stargazers_count}</span>
                    </div>
                    <p className="line-clamp-2 text-sm font-semibold text-ui-muted">{repo.description || "Sem descrição."}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-ui-muted">
                      <span className="rounded border border-ui-border/60 bg-white/80 px-2 py-1 font-semibold">{repo.language || "-"}</span>
                      <span className="rounded border border-ui-border/60 bg-white/80 px-2 py-1 font-semibold">{formatDate(repo.pushed_at)}</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard id="exp" title="experiencia.exe" register={registerSection}>
            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-lg border border-ui-border bg-white/70 p-4">
                <h3 className="mb-2 font-pixel text-[11px]">FACSS Desenvolvimento de Sistemas</h3>
                <p className="text-[13.5px] leading-6 text-ui-muted font-bold">
                  • Arquitetura de Dados: Atuação na manipulação e persistência de dados em PostgreSQL, além da criação e consumo de APIs REST para integração eficiente entre front-end e back-end.
                  <br />• Sistemas de Missão Crítica: Desenvolvimento e manutenção de módulos especializados para caminhões e plataformas de gestão, focados em rastreabilidade e controle operacional de frotas.
                  <br />• Escalabilidade e Manutenção: Implementação de funcionalidades focadas na organização do código e escalabilidade, aplicando padrões de Clean Code para facilitar a evolução dos sistemas.
                  <br />• Metodologia Ágil: Participação ativa em todas as cerimônias Scrum (Dailies, Plannings e Retrospectivas), colaborando com o time de produto para entregas contínuas de valor.
                  <br />• Eficiência Operacional: Contribuição direta na criação de ferramentas que auxiliam empresas no controle de equipes e processos corporativos, aumentando a transparência e a produtividade.
                  <br />• Versionamento e Qualidade: Gestão de código e colaboração técnica via Git, garantindo a integridade dos projetos e a resolução ágil de problemas técnicos.
                </p>
              </article>
              <article className="rounded-lg border border-ui-border bg-white/70 p-4">
                <h3 className="mb-2 font-pixel text-[11px]">LENARGE</h3>
                <p className="text-[13.5px] leading-6 text-ui-muted font-bold">
                  • Visão Holística do Negócio: Experiência em diferentes frentes operacionais, compreendendo fluxos de trabalho que fundamentam a criação de soluções tecnológicas mais assertivas.
                  <br />• Transição para Tecnologia (TI): Identificação e migração para a área de tecnologia, motivado pela dinâmica de inovação e pela resolução de problemas complexos.
                  <br />• Colaboração e Mentoria: Atuação em um ambiente de troca constante, desenvolvendo habilidades de comunicação técnica e aprendizado colaborativo com profissionais experientes.
                  <br />• Crescimento Técnico-Profissional: Fortalecimento de competências tanto em hard skills quanto em inteligência emocional e trabalho em equipe.
                  <br />• Foco em Impacto: Desenvolvimento de uma mentalidade voltada para criar ferramentas que realmente facilitem o dia a dia e otimizem os processos corporativos.
                </p>
              </article>
            </div>
          </SectionCard>

          <SectionCard id="contact" title="contato.exe" register={registerSection}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-ui-border bg-white/70 p-4">
                <h3 className="mb-2 font-pixel text-[11px]">Vamos conversar</h3>
                <p className="text-sm leading-6 text-ui-muted font-semibold">
                  Aberto a oportunidades e novos desafios como Software Engineer Full Stack.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={copyEmail} className="nav-btn">
                    Copiar e-mail
                  </button>
                  <a href="https://github.com/Arthur-dv" target="_blank" rel="noreferrer" className="nav-btn inline-block">
                    GitHub
                  </a>
                  <a href="https://www.linkedin.com/in/arthur-viana-81a690279" target="_blank" rel="noreferrer" className="nav-btn inline-block">
                    LinkedIn
                  </a>
                </div>
                {toast && <div className="mt-3 text-sm text-ui-blue">{toast}</div>}
              </div>
              <div className="rounded-lg border border-ui-border bg-white/70 p-4">
                <h3 className="mb-2 font-pixel text-[11px]">Detalhes</h3>
                <ul className="space-y-2 text-sm text-ui-muted">
                  <li className="font-semibold">Local: Belo Horizonte, Brasil</li>
                  <li className="font-semibold">E-mail: vianaarthur721@gmail.com</li>
                  <li className="font-semibold">Stack: TypeScript, React, Tailwind, Node.js, Python e PostgreSQL</li>
                </ul>
              </div>
            </div>
          </SectionCard>
        </main>
      </div>
    </div>
  );
}
