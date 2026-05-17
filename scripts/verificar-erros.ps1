$Projeto = "C:\Users\Win 11\Desktop\eventify\SITE\eventify-ai"
$Obsidian = "C:\Users\Win 11\Desktop\eventify"

$Data = Get-Date -Format "yyyy-MM-dd-HH-mm"

$PastaErros = "$Obsidian\14 - BUGS\LOGS AUTOMATICOS"

if (!(Test-Path $PastaErros)) {
    New-Item -ItemType Directory -Path $PastaErros -Force
}

cd $Projeto

Write-Host "Verificando build..."

$BuildOutput = npm run build 2>&1

if ($LASTEXITCODE -ne 0) {

    $ArquivoErro = "$PastaErros\Erro-Build-$Data.md"

    $Conteudo = @(
"# ERRO AUTOMATICO BUILD",
"",
"# Data",
"$Data",
"",
"# Saida do erro",
"",
"$BuildOutput"
)

    $Conteudo | Out-File -FilePath $ArquivoErro -Encoding UTF8

    Write-Host ""
    Write-Host "ERRO ENCONTRADO!"
    Write-Host $ArquivoErro

} else {

    Write-Host ""
    Write-Host "Build OK!"
}