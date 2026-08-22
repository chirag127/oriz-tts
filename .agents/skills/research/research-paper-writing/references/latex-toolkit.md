# LaTeX Toolkit — Preamble, Tables, Figures, Diagrams

Professional LaTeX patterns for ML papers. Add to any conference template.

---

## Professional Preamble

Compatible with all major conference style files. Load after the conference style file:

```latex
% Typography
\usepackage{microtype}              % Sub-pixel character spacing; highest-impact visual polish

% Tables
\usepackage{booktabs}               % \toprule, \midrule, \bottomrule
\usepackage{siunitx}                % Decimal-aligned numbers; \num{12345}, \SI{3.5}{GHz}

% Figures
\usepackage{graphicx}
\usepackage{subcaption}             % (a),(b),(c) subfigures

% Diagrams and Algorithms
\usepackage{tikz}
\usetikzlibrary{arrows.meta, positioning, shapes.geometric, calc, fit, backgrounds}
\usepackage[ruled,vlined]{algorithm2e}

% Cross-references — MUST load AFTER hyperref
\usepackage{cleveref}

% Math
\usepackage{amsmath,amssymb}
\usepackage{mathtools}              % dcases, coloneqq, etc.

% Colors — Okabe-Ito colorblind-safe palette
\usepackage{xcolor}
\definecolor{okblue}{HTML}{0072B2}
\definecolor{okorange}{HTML}{E69F00}
\definecolor{okgreen}{HTML}{009E73}
\definecolor{okred}{HTML}{D55E00}
\definecolor{okpurple}{HTML}{CC79A7}
\definecolor{okcyan}{HTML}{56B4E9}
\definecolor{okyellow}{HTML}{F0E442}
```

**Notes:**
- `microtype` = single highest-impact package for visual quality. Always include.
- `siunitx` handles decimal alignment via `S` column type — eliminates manual spacing.
- `cleveref` must load **after** `hyperref` (usually loaded by conference .sty).
- Check if template already loads `algorithm`, `amsmath`, `graphicx` — don't double-load.

---

## Tables

### Booktabs Basics

```latex
\usepackage{booktabs}
\begin{tabular}{lcc}
\toprule
Method & Accuracy $\uparrow$ & Latency $\downarrow$ \\
\midrule
Baseline & 85.2 & 45ms \\
\textbf{Ours} & \textbf{92.1} & 38ms \\
\bottomrule
\end{tabular}
```

Rules: bold best value per metric; direction symbols ($\uparrow$ higher better, $\downarrow$ lower better); right-align numerical columns; consistent decimal precision.

### siunitx Decimal Alignment

```latex
\begin{tabular}{l S[table-format=2.1] S[table-format=2.1] S[table-format=2.1]}
\toprule
Method & {Accuracy $\uparrow$} & {F1 $\uparrow$} & {Latency (ms) $\downarrow$} \\
\midrule
Baseline         & 85.2  & 83.7  & 45.3 \\
Ablation (no X)  & 87.1  & 85.4  & 42.1 \\
\textbf{Ours}    & \textbf{92.1} & \textbf{90.8} & \textbf{38.7} \\
\bottomrule
\end{tabular}
```

`S` column type auto-aligns on decimal. Headers in `{}` escape alignment.

---

## Figures

### Subfigures

```latex
\begin{figure}[t]
  \centering
  \begin{subfigure}[b]{0.48\textwidth}
    \centering
    \includegraphics[width=\textwidth]{fig_results_a.pdf}
    \caption{Results on Dataset A.}
    \label{fig:results-a}
  \end{subfigure}
  \hfill
  \begin{subfigure}[b]{0.48\textwidth}
    \centering
    \includegraphics[width=\textwidth]{fig_results_b.pdf}
    \caption{Results on Dataset B.}
    \label{fig:results-b}
  \end{subfigure}
  \caption{Comparison across datasets. (a) shows scaling, (b) ablation. 5 seeds.}
  \label{fig:results}
\end{figure}
```

`\cref{fig:results}` → "Figure 1"; `\cref{fig:results-a}` → "Figure 1a".

### Figure Rules

- **Vector graphics** (PDF, EPS) for plots/diagrams — `plt.savefig('fig.pdf')`
- **Raster** (PNG 600 DPI) only for photographs
- **Colorblind-safe palettes** (Okabe-Ito or Paul Tol)
- Verify **grayscale readability** (~8% of men have CVD)
- **No title inside figure** — caption serves this function
- **Self-contained captions** — reader understands without main text

---

## Algorithms — algorithm2e

```latex
\begin{algorithm}[t]
\caption{Iterative Refinement with Judge Panel}
\label{alg:method}
\KwIn{Task $T$, model $M$, judges $J_1 \ldots J_n$, convergence threshold $k$}
\KwOut{Final output $A^*$}
$A \gets M(T)$ \tcp*{Initial generation}
$\text{streak} \gets 0$\;
\While{$\text{streak} < k$}{
  $C \gets \text{Critic}(A, T)$ \tcp*{Identify weaknesses}
  $B \gets M(T, C)$ \tcp*{Revised addressing critique}
  $AB \gets \text{Synthesize}(A, B)$\;
  \ForEach{judge $J_i$}{
    $\text{rank}_i \gets J_i(\text{shuffle}(A, B, AB))$\;
  }
  $\text{winner} \gets \text{BordaCount}(\text{ranks})$\;
  \eIf{$\text{winner} = A$}{
    $\text{streak} \gets \text{streak} + 1$\;
  }{
    $A \gets \text{winner}$; $\text{streak} \gets 0$\;
  }
}
\Return{$A$}\;
\end{algorithm}
```

---

## TikZ Diagram Patterns

### Pipeline / Flow

```latex
\begin{figure}[t]
\centering
\begin{tikzpicture}[
  node distance=1.8cm,
  box/.style={rectangle, draw, rounded corners, minimum height=1cm,
              minimum width=2cm, align=center, font=\small},
  arrow/.style={-{Stealth[length=3mm]}, thick},
]
  \node[box, fill=okcyan!20] (input) {Input\\$x$};
  \node[box, fill=okblue!20, right of=input] (encoder) {Encoder\\$f_\theta$};
  \node[box, fill=okgreen!20, right of=encoder] (latent) {Latent\\$z$};
  \node[box, fill=okorange!20, right of=latent] (decoder) {Decoder\\$g_\phi$};
  \node[box, fill=okred!20, right of=decoder] (output) {Output\\$\hat{x}$};

  \draw[arrow] (input) -- (encoder);
  \draw[arrow] (encoder) -- (latent);
  \draw[arrow] (latent) -- (decoder);
  \draw[arrow] (decoder) -- (output);
\end{tikzpicture}
\caption{Architecture. Encoder maps $x$ to latent $z$; decoder reconstructs.}
\label{fig:architecture}
\end{figure}
```

### Comparison Matrix

```latex
\begin{tikzpicture}[
  cell/.style={rectangle, draw, minimum width=2.5cm, minimum height=1cm,
               align=center, font=\small},
  header/.style={cell, fill=gray!20, font=\small\bfseries},
]
  \node[header] at (0, 0) {Method};
  \node[header] at (3, 0) {Converges?};
  \node[header] at (6, 0) {Quality?};
  \node[cell] at (0, -1) {Single Pass};
  \node[cell, fill=okgreen!15] at (3, -1) {N/A};
  \node[cell, fill=okorange!15] at (6, -1) {Baseline};
  \node[cell] at (0, -2) {Critique+Revise};
  \node[cell, fill=okred!15] at (3, -2) {No};
  \node[cell, fill=okred!15] at (6, -2) {Degrades};
  \node[cell] at (0, -3) {Ours};
  \node[cell, fill=okgreen!15] at (3, -3) {Yes ($k$=2)};
  \node[cell, fill=okgreen!15] at (6, -3) {Improves};
\end{tikzpicture}
```

### Iterative Loop

```latex
\begin{tikzpicture}[
  node distance=2cm,
  box/.style={rectangle, draw, rounded corners, minimum height=0.8cm,
              minimum width=1.8cm, align=center, font=\small},
  arrow/.style={-{Stealth[length=3mm]}, thick},
  label/.style={font=\scriptsize, midway, above},
]
  \node[box, fill=okblue!20] (gen) {Generator};
  \node[box, fill=okred!20, right=2.5cm of gen] (critic) {Critic};
  \node[box, fill=okgreen!20, below=1.5cm of $(gen)!0.5!(critic)$] (judge) {Judge Panel};

  \draw[arrow] (gen) -- node[label] {output $A$} (critic);
  \draw[arrow] (critic) -- node[label, right] {critique $C$} (judge);
  \draw[arrow] (judge) -| node[label, left, pos=0.3] {winner} (gen);
\end{tikzpicture}
```

---

## latexdiff — Revision Tracking

Essential for rebuttals. Produces PDF with deletions in red strikethrough, additions in blue.

```bash
# Install
# macOS: brew install latexdiff (usually with TeX Live)
# Linux: sudo apt install latexdiff

# Generate diff
latexdiff paper_v1.tex paper_v2.tex > paper_diff.tex
pdflatex paper_diff.tex

# Multi-file projects (with \input{} / \include{})
latexdiff --flatten paper_v1.tex paper_v2.tex > paper_diff.tex
```

---

## SciencePlots — Publication Plots

```bash
pip install SciencePlots
```

```python
import matplotlib.pyplot as plt
import scienceplots  # registers styles

with plt.style.context(['science', 'no-latex']):
    fig, ax = plt.subplots(figsize=(3.5, 2.5))  # Single column
    ax.plot(x, y, label='Ours', color='#0072B2')
    ax.plot(x, y2, label='Baseline', color='#D55E00', linestyle='--')
    ax.set_xlabel('Training Steps')
    ax.set_ylabel('Accuracy')
    ax.legend()
    fig.savefig('paper/fig_results.pdf', bbox_inches='tight')

# Styles: 'science', 'ieee', 'nature', 'science+ieee'
# 'no-latex' if LaTeX not installed on plotting machine
```

**Standard sizes (two-column format):**
- Single column: `figsize=(3.5, 2.5)`
- Double column: `figsize=(7.0, 3.0)`
- Square (heatmaps/confusion): `figsize=(3.5, 3.5)`

---

## Templates

### Setup Workflow

```
Template Setup Checklist:
- [ ] Copy entire template directory (not just .tex)
- [ ] Verify template compiles as-is before changes
- [ ] Read example content to understand structure
- [ ] Replace example content section by section
- [ ] Use template macros (check preamble for \newcommand)
- [ ] Clean up template artifacts only at the end
```

```bash
cp -r templates/neurips2025/ ~/papers/my-paper/
cd ~/papers/my-paper/
latexmk -pdf main.tex   # Verify compiles first
```

### Template Macros

```latex
\newcommand{\method}{YourMethodName}
\newcommand{\eg}{e.g.,\xspace}
\newcommand{\ie}{i.e.,\xspace}
```

### Pitfalls

| Pitfall | Fix |
|---------|-----|
| Copying only `.tex` file | Copy entire directory |
| Modifying `.sty` files | Never edit style files |
| Adding random packages | Only if necessary |
| Deleting example content early | Keep as comments until done |
| Not compiling frequently | Compile after each section |
| Raster PNGs for plots | Always vector PDF via `savefig('fig.pdf')` |

### Quick Template Reference

| Conference | Main File | Style File | Page Limit |
|------------|-----------|------------|------------|
| NeurIPS 2025 | `main.tex` | `neurips.sty` | 9 pages |
| ICML 2026 | `example_paper.tex` | `icml2026.sty` | 8 pages |
| ICLR 2026 | `iclr2026_conference.tex` | `iclr2026_conference.sty` | 9 pages |
| ACL 2025 | `acl_latex.tex` | `acl.sty` | 8 pages (long) |
| AAAI 2026 | `aaai2026-unified-template.tex` | `aaai2026.sty` | 7 pages |
| COLM 2025 | `colm2025_conference.tex` | `colm2025_conference.sty` | 9 pages |

**Universal**: Double-blind, references don't count, appendices unlimited, LaTeX required.

---

## LaTeX Error Checklist

Append to every AI refinement prompt:

```
LaTeX Quality Checklist (verify after every edit):
- [ ] No unenclosed math symbols ($ balanced)
- [ ] Only reference figures/tables that exist (\ref matches \label)
- [ ] No fabricated citations (\cite matches entries in .bib)
- [ ] Every \begin{env} has matching \end{env}
- [ ] No HTML contamination (</end{figure}>)
- [ ] No unescaped underscores outside math mode (use \_)
- [ ] No duplicate \label definitions
- [ ] No duplicate section headers
- [ ] Numbers in text match experimental results
- [ ] All figures have captions and labels
- [ ] No overly long lines causing overfull hbox
```
