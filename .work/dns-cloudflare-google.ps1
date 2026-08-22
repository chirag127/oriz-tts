$ErrorActionPreference='Stop'
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { Write-Error 'Run elevated.'; return }
# Clean any lingering NRPT (should already be empty)
$r = Get-DnsClientNrptRule; if ($r) { $r | Remove-DnsClientNrptRule -Force; Write-Host "Removed $($r.Count) NRPT" } else { Write-Host "NRPT already empty" }
# Point main adapter at Cloudflare + Google (reliable plain DNS, no anycast-linked-IP)
$gp='Ethernet 4'
Get-DnsClientServerAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -ne $gp -and $_.ServerAddresses } | ForEach-Object {
  Set-DnsClientServerAddress -InterfaceIndex $_.InterfaceIndex -ServerAddresses @('1.1.1.1','8.8.8.8')
  Write-Host "DNS on '$($_.InterfaceAlias)' -> 1.1.1.1, 8.8.8.8"
}
Clear-DnsClientCache
Write-Host "Done."
