# Block This

Extensão de navegador para bloquear funcionalidades viciantes em redes sociais.

## Objetivo

Block This bloqueia conteúdos de alto consumo compulsivo — como YouTube Shorts, Instagram Reels e TikTok — diretamente no navegador. As configurações podem ser travadas com senha implícita (desinstalar a extensão é a única forma de remover as regras), tornando o bloqueio resistente à impulsividade.

## Tecnologias

- React 19
- Vite 8
- Chrome Extensions API (Manifest V3)
- JavaScript (ESModules)

## Download

Acesse a página de [Releases](https://github.com/Andreicsantana/Block-This/releases) do repositório e baixe o arquivo `.zip` da versão desejada.

O arquivo `.zip` contém a pasta `dist` pronta para instalação, sem necessidade de build.

## Instalação

1. Baixar o `.zip` da versão desejada na [página de Releases](https://github.com/Andreicsantana/Block-This/releases).
2. Extrair o arquivo `.zip`.
3. Abrir o gerenciador de extensões do navegador (`chrome://extensions` ou equivalente).
4. Ativar o **Modo do desenvolvedor**.
5. Clicar em **Carregar sem compactação**.
6. Selecionar a pasta `dist` extraída.

> O navegador deve receber a **pasta `dist`**, não o arquivo `.zip`.

## Desenvolvimento

Instalar dependências:

```bash
npm install
```

Executar em modo de desenvolvimento:

```bash
npm run dev
```

Gerar build de produção:

```bash
npm run build
```

A build gera a pasta `dist`, que é a versão pronta para ser carregada no navegador como extensão.

## Estrutura do projeto

```
block-this/
├── public/
│   ├── manifest.json     # Manifest da extensão (MV3)
│   ├── background.js     # Service worker da extensão
│   ├── content.js        # Script injetado nas páginas para aplicar as regras
│   └── icons/            # Ícones da extensão
├── src/
│   ├── App.jsx           # Interface do popup da extensão
│   └── main.jsx          # Ponto de entrada React
├── dist/                 # Build gerada pelo Vite (usada na instalação)
└── vite.config.js
```

## Release

As versões distribuídas aos usuários são publicadas via [GitHub Releases](https://github.com/Andreicsantana/Block-This/releases). Cada release disponibiliza um arquivo `.zip` contendo a pasta `dist` pronta para instalação manual no navegador.
