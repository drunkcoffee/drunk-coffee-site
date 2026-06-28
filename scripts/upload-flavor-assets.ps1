$ErrorActionPreference = "Stop"

function Get-EnvValue([string]$name) {
  $line = Get-Content .env | Where-Object { $_ -match "^$name=" } | Select-Object -First 1
  if (-not $line) { throw "Missing $name in .env" }
  return $line.Substring($name.Length + 1)
}

$space = Get-EnvValue "VITE_CONTENTFUL_SPACE_ID"
$environment = Get-EnvValue "VITE_CONTENTFUL_ENVIRONMENT"
$token = Get-EnvValue "CONTENTFUL_MANAGEMENT_TOKEN"
$baseUrl = "https://api.contentful.com/spaces/$space/environments/$environment"
$authHeaders = @{ Authorization = "Bearer $token" }
$jsonHeaders = @{ Authorization = "Bearer $token"; "Content-Type" = "application/vnd.contentful.management.v1+json" }

$items = @(
  @{ EntryId = "4R0vmFWHJarffTGhHNhdz2"; Title = "ALO Sidama G1 Natural Slow-dry flavour visual"; FileName = "alo-sidama-g1-natural-slow-dry.png" },
  @{ EntryId = "3eUwyjYtbBR2YtsSPqn4Yn"; Title = "ALO Bona Zuria Gute Natural G1 flavour visual"; FileName = "alo-bona-zuria-gute-natural-g1.png" },
  @{ EntryId = "2BR2Sx95V0E1Cp2ASEG6ZV"; Title = "Panama Lamastus Gesha flavour visual"; FileName = "panama-lamastus-gesha-alto-quiel-selecto-natural.png" }
)

$existingAssets = @((Invoke-RestMethod -Uri "$baseUrl/assets?limit=1000" -Headers $authHeaders).items)
$results = foreach ($item in $items) {
  $asset = $existingAssets | Where-Object { $_.fields.title."en-US" -eq $item.Title } | Select-Object -First 1
  $assetCreated = $false

  if (-not $asset) {
    $path = Join-Path "public/flavors" $item.FileName
    $upload = Invoke-RestMethod -Method Post -Uri "https://upload.contentful.com/spaces/$space/environments/$environment/uploads" -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/octet-stream" } -InFile $path
    $assetBody = @{
      fields = @{
        title = @{ "en-US" = $item.Title }
        file = @{ "en-US" = @{ contentType = "image/png"; fileName = $item.FileName; uploadFrom = @{ sys = @{ type = "Link"; linkType = "Upload"; id = $upload.sys.id } } } }
      }
    } | ConvertTo-Json -Depth 12
    $asset = Invoke-RestMethod -Method Post -Uri "$baseUrl/assets" -Headers $jsonHeaders -Body $assetBody
    Invoke-RestMethod -Method Put -Uri "$baseUrl/assets/$($asset.sys.id)/files/en-US/process" -Headers $jsonHeaders | Out-Null

    for ($attempt = 0; $attempt -lt 30; $attempt += 1) {
      Start-Sleep -Milliseconds 750
      $asset = Invoke-RestMethod -Uri "$baseUrl/assets/$($asset.sys.id)" -Headers $authHeaders
      if ($asset.fields.file."en-US".url) { break }
    }
    if (-not $asset.fields.file."en-US".url) { throw "Asset processing timed out for $($item.FileName)" }
    $assetCreated = $true
  }

  if (-not $asset.sys.publishedAt) {
    $publishHeaders = @{ Authorization = "Bearer $token"; "Content-Type" = "application/vnd.contentful.management.v1+json"; "X-Contentful-Version" = [string]$asset.sys.version }
    $asset = Invoke-RestMethod -Method Put -Uri "$baseUrl/assets/$($asset.sys.id)/published" -Headers $publishHeaders
  }

  $entry = Invoke-RestMethod -Uri "$baseUrl/entries/$($item.EntryId)" -Headers $authHeaders
  $entry.fields | Add-Member -NotePropertyName image -NotePropertyValue @{ "en-US" = @{ sys = @{ type = "Link"; linkType = "Asset"; id = $asset.sys.id } } } -Force
  $entryBody = @{ fields = $entry.fields } | ConvertTo-Json -Depth 20
  $entryHeaders = @{ Authorization = "Bearer $token"; "Content-Type" = "application/vnd.contentful.management.v1+json"; "X-Contentful-Version" = [string]$entry.sys.version }
  $savedEntry = Invoke-RestMethod -Method Put -Uri "$baseUrl/entries/$($item.EntryId)" -Headers $entryHeaders -Body $entryBody

  [PSCustomObject]@{
    Name = $savedEntry.fields.name."en-US"
    AssetId = $asset.sys.id
    AssetCreated = $assetCreated
    AssetPublished = [bool]$asset.sys.publishedAt
    EntryPublished = [bool]$savedEntry.sys.publishedAt
  }
}

$results | ConvertTo-Json -Depth 5
