$ErrorActionPreference = "Stop"

$commits = @(
    @("0d97268", "Add login page and fix database for vendors"),
    @("501f8b9", "Add notification bell feature"),
    @("82cc936", "Add language translation feature"),
    @("c43847c", "Fix dark mode for dropdowns and translations"),
    @("890e8bf", "Secure the procurement pages and fix profile bugs"),
    @("a036a27", "Add resource categories and update the UI design"),
    @("1cc8029", "Connect resource management to the backend database"),
    @("a633601", "Show real live data on the resource dashboard"),
    @("3af99bd", "Create a new worker dashboard with a better design"),
    @("82b230e", "Fix dark mode text colors and project names"),
    @("5e7b08f", "Fix project creation bug and separate data for clients"),
    @("f6e0ab0", "Add milestone tracking with progress percentages"),
    @("c449639", "Hide new project button for managers and fix progress calculations"),
    @("8ccc199", "Connect resource management dashboard to actual database"),
    @("fba0c74", "Fix search filter for resource categories and add edit button"),
    @("a62345b", "Auto create users when they register and clean up worker dashboard"),
    @("050a216", "Fix shift and attendance bugs on worker dashboard"),
    @("ce1fda0", "Add beautiful charts for analytics dashboard"),
    @("088db75", "Auto fill budget for projects based on actual spending"),
    @("3a21ea2", "Fix error when generating reports"),
    @("9974ca0", "Completely redesign report generation with live PDF preview"),
    @("604a256", "Fix report search bar and remove annoying loading spinners"),
    @("f4a8563", "Fix notification clicks and make them blink automatically"),
    @("ab65f3a", "Fix profile image not showing across the app"),
    @("2cf5393", "Final cleanup of temporary files and dashboard redirects")
)

git reset --hard e496c10

foreach ($c in $commits) {
    $hash = $c[0]
    $msg = $c[1]
    
    Write-Host "Restoring $hash -> $msg"
    git restore --source=$hash .
    git add .
    git commit -m $msg
}

git push origin "Praduam/project-&-workforce-module-&-testing" -f
