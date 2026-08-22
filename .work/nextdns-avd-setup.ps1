# ============================================================================
# NextDNS system-wide setup for the SAP AVD — WITHOUT breaking SAP internal DNS
# ----------------------------------------------------------------------------
# Run in an ELEVATED PowerShell (Run as Administrator).
#
# What it does:
#   1. Sets system DNS -> NextDNS DoH (profile cd1a6b) for public domains.
#   2. Adds NRPT conditional-forwarding rules so SAP-internal zones
#      (.net.sap / .tools.sap / .wdf.sap.corp / .hec.net.sap etc.) STAY on the
#      SAP/GlobalProtect resolvers (10.4.202.200, 10.4.12.200) so
#      ict.hec.net.sap and other internal hosts KEEP resolving.
#
# Reversible: run the ROLLBACK block at the bottom to undo.
# NOTE: replace the profile ID if yours differs. Do NOT paste your API key here
#       — DoH uses only the public profile URL, no key needed.
# ============================================================================

$ErrorActionPreference = 'Stop'

# --- config ---
$NextDnsProfile = 'cd1a6b'
$DohTemplate    = "https://dns.nextdns.io/$NextDnsProfile"
$NextDnsV4      = @('45.90.28.252','45.90.30.252')      # NextDNS anycast (linked-IP)
$SapResolvers   = @('10.4.202.200','10.4.12.200')       # SAP internal (via GlobalProtect)
$SapZones       = @('net.sap','tools.sap','wdf.sap.corp','hec.net.sap','int.sap','one.int.sap')

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Error 'Run this in an ELEVATED PowerShell (Run as Administrator).'; return
}

# 1) Protect SAP internal zones FIRST (so they never touch NextDNS)
foreach ($z in $SapZones) {
  # remove any existing rule for the zone, then add ours
  Get-DnsClientNrptRule | Where-Object { $_.Namespace -contains ".$z" } | Remove-DnsClientNrptRule -Force -ErrorAction SilentlyContinue
  Add-DnsClientNrptRule -Namespace ".$z" -NameServers $SapResolvers
  Write-Host "NRPT: .$z -> $($SapResolvers -join ', ')"
}

# 2) Register the NextDNS DoH template (so Windows uses encrypted DNS to NextDNS)
foreach ($ip in $NextDnsV4) {
  netsh dns add encryption server=$ip dohtemplate=$DohTemplate autoupgrade=yes udpfallback=no | Out-Null
  Write-Host "DoH template registered for $ip -> $DohTemplate"
}

# 3) Point the ACTIVE non-GlobalProtect adapter at NextDNS.
#    (Leave the GlobalProtect 'Ethernet 4' adapter — 10.4.x — ALONE; NRPT covers .sap.)
$gpAdapter = 'Ethernet 4'   # the GlobalProtect/SAP adapter — do NOT change its DNS
Get-DnsClientServerAddress -AddressFamily IPv4 |
  Where-Object { $_.InterfaceAlias -ne $gpAdapter -and $_.ServerAddresses } |
  ForEach-Object {
    Set-DnsClientServerAddress -InterfaceIndex $_.InterfaceIndex -ServerAddresses $NextDnsV4
    Write-Host "DNS on '$($_.InterfaceAlias)' -> NextDNS ($($NextDnsV4 -join ', '))"
  }

Clear-DnsClientCache
Write-Host "`nDone. Verify:"
Write-Host "  nslookup ict.hec.net.sap   (should return 10.4.x  = SAP zone protected)"
Write-Host "  nslookup example.com       (resolves via NextDNS)"
Write-Host "  Then check https://my.nextdns.io shows this device using the profile."

# ============================================================================
# ROLLBACK (run this block to undo everything):
# ----------------------------------------------------------------------------
# foreach ($z in @('net.sap','tools.sap','wdf.sap.corp','hec.net.sap','int.sap','one.int.sap')) {
#   Get-DnsClientNrptRule | ? { $_.Namespace -contains ".$z" } | Remove-DnsClientNrptRule -Force
# }
# foreach ($ip in @('45.90.28.252','45.90.30.252')) { netsh dns delete encryption server=$ip }
# Get-DnsClientServerAddress -AddressFamily IPv4 | ? { $_.ServerAddresses -contains '45.90.28.252' } |
#   ForEach-Object { Set-DnsClientServerAddress -InterfaceIndex $_.InterfaceIndex -ResetServerAddresses }
# Clear-DnsClientCache
# ============================================================================
