# ============================================================================
# Reconfigure DNS: NextDNS DoH only, NO NRPT, NO GlobalProtect dependency.
# Per user directive 2026-08-04: remove ALL NRPT rules (they point *.sap at
# 10.4.x internal resolvers only reachable via GlobalProtect, which is failing),
# and point the active adapter at NextDNS anycast with the DoH template already
# registered (profile cd1a6b). Public + AI resolution works VPN-off.
#
# Run ELEVATED (Run as Administrator).
# Reversible: rollback block at bottom.
# ============================================================================
$ErrorActionPreference = 'Stop'

$NextDnsV4 = @('45.90.28.252','45.90.30.252')   # NextDNS anycast (DoH template already set)
$GpAdapter = 'Ethernet 4'                        # GlobalProtect/SAP adapter — leave alone

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Error 'Run this in an ELEVATED PowerShell (Run as Administrator).'; return
}

# 1) Remove ALL NRPT rules — no conditional *.sap forwarding anymore.
$rules = Get-DnsClientNrptRule
if ($rules) {
  $rules | Remove-DnsClientNrptRule -Force
  Write-Host "Removed $($rules.Count) NRPT rule(s)."
} else {
  Write-Host "No NRPT rules to remove."
}

# 2) Point the active non-GlobalProtect adapter(s) at NextDNS (DoH template
#    for these IPs is already registered, so Windows uses encrypted DNS).
Get-DnsClientServerAddress -AddressFamily IPv4 |
  Where-Object { $_.InterfaceAlias -ne $GpAdapter -and $_.ServerAddresses } |
  ForEach-Object {
    Set-DnsClientServerAddress -InterfaceIndex $_.InterfaceIndex -ServerAddresses $NextDnsV4
    Write-Host "DNS on '$($_.InterfaceAlias)' -> NextDNS ($($NextDnsV4 -join ', ')) [DoH cd1a6b]"
  }

Clear-DnsClientCache
Write-Host "`nDone. Verify:"
Write-Host "  Get-DnsClientNrptRule            (should be EMPTY)"
Write-Host "  nslookup example.com             (resolves via NextDNS)"
Write-Host "  nslookup chatgpt.com             (AI services resolve, VPN off)"

# ---------------------------------------------------------------------------
# ROLLBACK (uncomment + run elevated to restore DHCP/automatic DNS):
#   Get-DnsClientServerAddress -AddressFamily IPv4 |
#     Where-Object { $_.InterfaceAlias -ne 'Ethernet 4' } |
#     ForEach-Object { Set-DnsClientServerAddress -InterfaceIndex $_.InterfaceIndex -ResetServerAddresses }
#   Clear-DnsClientCache
# ---------------------------------------------------------------------------
