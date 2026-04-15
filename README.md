<div align="center">

<img src="./docs/readme-banner.svg" alt="Banner do portfolio — estilo janela macOS retro" width="100%" />

# Portfolio — Arthur Viana

**Site pessoal** com visual **pixel art + janelas estilo macOS**, tema creme e integração com a **API pública do GitHub** para listar repositórios.

[![Abrir o site — Meu portfólio](docs/badge-meu-portfolio.svg)](https://arthur-dv.github.io/Portfolio/)

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[![Licença](https://img.shields.io/badge/licença-ISC-informational)](./package.json)
[![Issues](https://img.shields.io/github/issues/Arthur-dv/Portfolio)](https://github.com/Arthur-dv/Portfolio/issues)

[Ver no GitHub](https://github.com/Arthur-dv/Portfolio) · [Reportar problema](https://github.com/Arthur-dv/Portfolio/issues)

</div>

---

## Pré-visualização

| Intro “PRESS START” | Projetos com filtros |
| :---: | :---: |
| Tela inicial com animação e botão para entrar | Cards com busca, **Todos / Destaques / Recentes** e dados da API |

> Dica: depois do primeiro deploy, podes substituir esta secção por capturas reais: guarda imagens em `docs/` (por exemplo `docs/preview-home.png`) e usa `![Legenda](./docs/preview-home.png)`.

---

## Funcionalidades

- **Intro fullscreen** com animação e transição para o conteúdo principal
- **Navegação por secções** (Sobre, Projetos, Experiência, Contacto) com estado ativo
- **Repositórios GitHub** do utilizador `Arthur-dv`, com pesquisa e filtros
- **Experiência profissional** e **contacto** com detalhes em painéis estilo “janela”
- **Tipografia pixel** (Press Start 2P) + **Inter** para texto corrido
- **Layout responsivo** e scroll reveal nas secções

---

## Stack

| Tecnologia | Uso |
|------------|-----|
| **React 19** | UI e estado |
| **TypeScript** | Tipagem |
| **Vite 8** | Build e dev server |
| **Tailwind CSS 4** | Estilos e tema (`@theme`) |
| **GitHub REST API** | Lista de repositórios públicos |

---

## Como executar localmente

Requisitos: **Node.js** 20+ (recomendado) e **npm**.

```bash
git clone https://github.com/Arthur-dv/Portfolio.git
cd Portfolio
npm install
npm run dev
```

Abre o endereço que o Vite indicar (normalmente `http://localhost:5173`).

### Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com hot reload |
| `npm run build` | Compilação TypeScript + bundle de produção em `dist/` |
| `npm run preview` | Servir o build localmente para testar antes do deploy |

---

## Estrutura do repositório (resumo)

```
Portfolio/
├── public/          # Ficheiros estáticos (ex.: imagem de perfil)
├── src/
│   ├── App.tsx      # Página principal e lógica
│   ├── index.css    # Tema Tailwind + estilos pixel
│   └── main.tsx     # Entrada React
├── docs/            # Recursos do README (banner, futuras screenshots)
├── index.html
└── vite.config.ts
```

---

## Licença

Licença **ISC** (campo `license` em `package.json`).

---

<div align="center">

Feito com dedicação · Belo Horizonte, Brasil

</div>
