$ini = Join-Path $env:USERPROFILE "mysql-local\my.ini"
$base = Join-Path $env:USERPROFILE "mysql-local\mysql-8.4.9-winx64\bin\mysqld.exe"
$ouvindo = Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue
if ($ouvindo) {
  Write-Output "MySQL já está na porta 3306"
  exit 0
}
Start-Process -FilePath $base -ArgumentList "--defaults-file=$ini","--console" -WindowStyle Hidden
Write-Output "MySQL iniciado"
