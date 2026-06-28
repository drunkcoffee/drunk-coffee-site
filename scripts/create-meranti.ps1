$ErrorActionPreference = "Stop"

function Get-EnvValue([string]$name) {
  $line = Get-Content .env | Where-Object { $_ -match "^$name=" } | Select-Object -First 1
  if (-not $line) { throw "Missing $name in .env" }
  $line.Substring($name.Length + 1)
}

$space = Get-EnvValue "VITE_CONTENTFUL_SPACE_ID"
$environment = Get-EnvValue "VITE_CONTENTFUL_ENVIRONMENT"
$token = Get-EnvValue "CONTENTFUL_MANAGEMENT_TOKEN"
$base = "https://api.contentful.com/spaces/$space/environments/$environment"
$auth = @{ Authorization = "Bearer $token" }
$json = @{ Authorization = "Bearer $token"; "Content-Type" = "application/vnd.contentful.management.v1+json" }
$title = "Meranti Liberica G1 flavour visual"
$existing = @((Invoke-RestMethod -Uri "$base/assets?limit=1000" -Headers $auth).items) | Where-Object { $_.fields.title."en-US" -eq $title } | Select-Object -First 1

if (-not $existing) {
  $upload = Invoke-RestMethod -Method Post -Uri "https://upload.contentful.com/spaces/$space/environments/$environment/uploads" -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/octet-stream" } -InFile "public/flavors/meranti-liberica-g1.png"
  $assetBody = @{ fields = @{ title = @{ "en-US" = $title }; file = @{ "en-US" = @{ contentType = "image/png"; fileName = "meranti-liberica-g1.png"; uploadFrom = @{ sys = @{ type = "Link"; linkType = "Upload"; id = $upload.sys.id } } } } } } | ConvertTo-Json -Depth 12
  $existing = Invoke-RestMethod -Method Post -Uri "$base/assets" -Headers $json -Body $assetBody
  Invoke-RestMethod -Method Put -Uri "$base/assets/$($existing.sys.id)/files/en-US/process" -Headers $json | Out-Null
  for ($i = 0; $i -lt 30; $i += 1) { Start-Sleep -Milliseconds 750; $existing = Invoke-RestMethod -Uri "$base/assets/$($existing.sys.id)" -Headers $auth; if ($existing.fields.file."en-US".url) { break } }
}
if (-not $existing.fields.file."en-US".url) { throw "Meranti asset processing timed out" }
if (-not $existing.sys.publishedAt) { $existing = Invoke-RestMethod -Method Put -Uri "$base/assets/$($existing.sys.id)/published" -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/vnd.contentful.management.v1+json"; "X-Contentful-Version" = [string]$existing.sys.version } }

$entryBody = @{ fields = @{
  name = @{ "en-US" = "Meranti Liberica G1" }
  slug = @{ "en-US" = "meranti-liberica-g1" }
  category = @{ "en-US" = "Filter" }
  collection = @{ "en-US" = "Malaysia Liberica" }
  price = @{ "en-US" = 49 }
  size = @{ "en-US" = "100g" }
  variants = @{ "en-US" = @(@{ size = "100g"; price = 49 }, @{ size = "200g"; price = 89 }) }
  notes = @{ "en-US" = "Jackfruit, Green Mango, Almond" }
  description = @{ "en-US" = "A honey-process Liberica from Batu Pahat, Johor: tropical jackfruit sweetness, crisp green mango, and a gentle almond finish." }
  roast = @{ "en-US" = "Light Medium" }
  origin = @{ "en-US" = "Batu Pahat, Johor, Malaysia" }
  process = @{ "en-US" = "Honey" }
  variety = @{ "en-US" = "Liberica G1" }
  featured = @{ "en-US" = $true }
  badge = @{ "en-US" = "New" }
  bestfor = @{ "en-US" = "Filter brewing · daily cup" }
  wholesaleAvailable = @{ "en-US" = $false }
  sortOrder = @{ "en-US" = 10 }
  active = @{ "en-US" = $true }
  image = @{ "en-US" = @{ sys = @{ type = "Link"; linkType = "Asset"; id = $existing.sys.id } } }
} } | ConvertTo-Json -Depth 20
$entryHeaders = @{ Authorization = "Bearer $token"; "Content-Type" = "application/vnd.contentful.management.v1+json"; "X-Contentful-Content-Type" = "drunkCoffeeRoasters" }
$entry = Invoke-RestMethod -Method Post -Uri "$base/entries" -Headers $entryHeaders -Body $entryBody
$published = Invoke-RestMethod -Method Put -Uri "$base/entries/$($entry.sys.id)/published" -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/vnd.contentful.management.v1+json"; "X-Contentful-Version" = [string]$entry.sys.version }
[PSCustomObject]@{ entryId = $published.sys.id; name = $published.fields.name."en-US"; active = $published.fields.active."en-US"; published = [bool]$published.sys.publishedAt; assetId = $existing.sys.id } | ConvertTo-Json
