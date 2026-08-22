# Download the CPQ Onboarding KT folder (run this YOURSELF — uses YOUR SAP login)

## Option A — m365 CLI (you already have Node)
```powershell
npm install -g @pnp/cli-microsoft365
m365 login                     # opens browser -> sign in with your SAP account (MFA ok)

# list everything in the KT folder (confirm it sees the files)
m365 file list `
  --webUrl "https://sap.sharepoint.com/teams/DLIES_NG_SPM_TCS_L2C_CPQ_Quote_DA" `
  --folderUrl "Shared Documents/CPQ Onboarding KT" `
  --recursive --output json > C:\kt\filelist.json

# download loop -> C:\kt\CPQ-Onboarding\
$SiteUrl="https://sap.sharepoint.com/teams/DLIES_NG_SPM_TCS_L2C_CPQ_Quote_DA"
$Dest="C:\kt\CPQ-Onboarding"
New-Item -ItemType Directory -Force $Dest | Out-Null
$files = Get-Content C:\kt\filelist.json | ConvertFrom-Json
foreach ($f in $files) {
  $rel = $f.serverRelativeUrl
  $out = Join-Path $Dest ($rel -replace '.*/CPQ Onboarding KT/','')
  New-Item -ItemType Directory -Force (Split-Path $out) | Out-Null
  Write-Host "↓ $($f.name)"
  m365 spo file get --webUrl $SiteUrl --url $rel --asFile --path $out
}
```

## Option B — PnP PowerShell (Windows-native)
```powershell
Install-Module PnP.PowerShell -Scope CurrentUser
Connect-PnPOnline -Url "https://sap.sharepoint.com/teams/DLIES_NG_SPM_TCS_L2C_CPQ_Quote_DA" -Interactive
Get-PnPFolderItem -FolderSiteRelativeUrl "Shared Documents/CPQ Onboarding KT" -ItemType File -Recursive |
  ForEach-Object {
    Get-PnPFile -Url $_.ServerRelativeUrl -AsFile -Path "C:\kt\CPQ-Onboarding" -FileName $_.Name -Force
  }
```

When done, tell me the local path (e.g. C:\kt\CPQ-Onboarding) and I run oriz-kt-search over it.
