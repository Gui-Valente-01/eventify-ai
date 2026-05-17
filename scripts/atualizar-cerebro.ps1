$Projeto = "C:\Users\Win 11\Desktop\eventify\SITE\eventify-ai"
$Obsidian = "C:\Users\Win 11\Desktop\eventify"

$Data = Get-Date -Format "yyyy-MM-dd"
$PastaResumo = "$Obsidian\21 - AUTOMACOES\RESUMOS AUTOMATICOS"

if (!(Test-Path $PastaResumo)) {
    New-Item -ItemType Directory -Path $PastaResumo -Force
}

cd $Projeto

$ArquivosAlterados = git status --short

$ArquivoFinal = "$PastaResumo\Resumo Automatico - $Data.md"

$Linhas = @(
"# RESUMO AUTOMATICO - $Data",
"",
"# Arquivos alterados",
"",
"$ArquivosAlterados",
"",
"---",
"",
"# O que foi feito hoje",
"",
"-",
"",
"---",
"",
"# Bugs encontrados",
"",
"-",
"",
"---",
"",
"# Solucoes aplicadas",
"",
"-",
"",
"---",
"",
"# O que ainda falta",
"",
"-",
"",
"---",
"",
"# Proximo passo recomendado",
"",
"-",
"",
"---",
"",
"# Prompt sugerido para Claude",
"",
"Analise estes arquivos alterados do Eventify AI e diga o proximo passo mais importante."
)

$Linhas | Out-File -FilePath $ArquivoFinal -Encoding UTF8

Write-Host "Cerebro atualizado com sucesso!"
Write-Host "Arquivo criado em:"
Write-Host $ArquivoFinal


# Criar log tecnico
$PastaLogs = "$Obsidian\21 - AUTOMACOES\LOGS"

if (!(Test-Path $PastaLogs)) {
    New-Item -ItemType Directory -Path $PastaLogs -Force
}

$ArquivoLog = "$PastaLogs\Log-$Data.txt"

git log --oneline -5 | Out-File -FilePath $ArquivoLog -Encoding UTF8

Write-Host ""
Write-Host "Log tecnico criado!"
Write-Host $ArquivoLog

# Criar prompt automatico para Claude
$PastaPrompts = "$Obsidian\21 - AUTOMACOES\PROMPTS CLAUDE"

if (!(Test-Path $PastaPrompts)) {
    New-Item -ItemType Directory -Path $PastaPrompts -Force
}

$ArquivoPrompt = "$PastaPrompts\Prompt-Claude-$Data.md"

$PromptClaude = @(
"# PROMPT CLAUDE - $Data",
"",
"Voce esta trabalhando no projeto Eventify AI.",
"",
"# Contexto",
"",
"O Eventify AI e um SaaS em Next.js que cria sites promocionais de eventos com inteligencia artificial.",
"",
"# Arquivos alterados atualmente",
"",
"$ArquivosAlterados",
"",
"# Ultimos commits",
"",
"$(git log --oneline -5)",
"",
"# Tarefa",
"",
"Analise o estado atual do projeto e diga:",
"",
"- o que parece ter mudado",
"- quais riscos existem",
"- qual proximo passo mais importante",
"- quais arquivos devo revisar",
"- se existe algo que pode quebrar build, Stripe, Supabase ou IA",
"",
"# Regras",
"",
"- nao remova funcionalidades existentes",
"- preserve TypeScript",
"- preserve arquitetura atual",
"- nao exponha segredos",
"- se alterar banco, criar migration",
"- ao finalizar, informar arquivos alterados e proximos passos"
)

$PromptClaude | Out-File -FilePath $ArquivoPrompt -Encoding UTF8

Write-Host ""
Write-Host "Prompt Claude criado!"
Write-Host $ArquivoPrompt

# Criar resumo GitHub
$PastaGitHub = "$Obsidian\22 - GITHUB"

if (!(Test-Path $PastaGitHub)) {
    New-Item -ItemType Directory -Path $PastaGitHub -Force
}

$ArquivoGitHub = "$PastaGitHub\Status GitHub - $Data.md"

$BranchAtual = git branch --show-current
$Remote = git remote -v
$UltimosCommits = git log --oneline -5
$StatusGit = git status --short

$ResumoGitHub = @(
"# STATUS GITHUB - $Data",
"",
"# Repositorio",
"",
"https://github.com/Gui-Valente-01/eventify-ai",
"",
"# Branch atual",
"",
"$BranchAtual",
"",
"# Remote",
"",
"$Remote",
"",
"# Arquivos alterados",
"",
"$StatusGit",
"",
"# Ultimos commits",
"",
"$UltimosCommits",
"",
"---",
"",
"# Proximo passo",
"",
"- Revisar mudancas antes de fazer commit.",
"- Rodar build e teste antes de enviar para o GitHub.",
"- Atualizar o cerebro depois do push."
)

$ResumoGitHub | Out-File -FilePath $ArquivoGitHub -Encoding UTF8

Write-Host ""
Write-Host "Status GitHub criado!"
Write-Host $ArquivoGitHub