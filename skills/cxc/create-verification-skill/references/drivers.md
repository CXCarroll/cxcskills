# Driver recipes

Use a recipe only when the repo has no harness of its own. Each one covers launch, isolation, driving, evidence and cleanup; adapt the names to the repo.

## Web app (SvelteKit, Bun, PostgreSQL, BetterAuth)

- **Isolate the database.** Create a database per run (`createdb verify_<run-id>`, or a schema in the dev Postgres from `docker compose`), point `DATABASE_URL` at it, then run the repo's migrate and seed scripts against it. Never seed the user's dev database.
- **Isolate the server.** Pick a free port and start the dev server pinned to it (`bunx vite dev --port <port> --strictPort`). Write the PID to the run folder. Ready means the home page renders the app's name, polled with a timeout, not just an open port.
- **Sign in for real.** Seed one user per role the map needs. `login --as <role>` signs in through the real sign-in form once, then saves Playwright's `storageState` in the run folder for later drives. If sign-in sends an email, read it from the dev mail sink the repo already uses; if there is none, say so in `Gotchas`.
- **Drive with Playwright as a library.** A Bun script using the `playwright` package (not the test runner), so each subcommand is one short call. Locate with `page.getByRole(role, { name })` and `getByTestId`. Capture `locator.ariaSnapshot()` beside each screenshot.
- **Sizes.** Screenshot at 390 wide (phone) and 1440 wide (desktop), and in dark mode if the app has one, matching `ui-hill-climb`.
- **Doctor.** The PID in the run folder is alive and owns the port, the page renders the app, `DATABASE_URL` names the run's database, and a seeded user can sign in.
- **Cleanup.** Kill the recorded PID, drop the run database, delete the saved sessions. Keep the evidence folder.

## iOS app (Simulator, on the Mac)

- **Isolate the simulator.** Create one for the run (`xcrun simctl create verify-<app>-<run-id> "<device type>" <runtime>`), boot it, and record its UDID. Never drive the simulator the user has open.
- **Build and launch.** `xcodebuild -scheme <scheme> -destination "platform=iOS Simulator,id=<udid>" -derivedDataPath <run>/build build`, then `xcrun simctl install <udid> <path to .app>` and `xcrun simctl launch <udid> <bundle id>`. Pass launch arguments or environment for test accounts and seed data if the app reads them.
- **Drive.** Deep links with `xcrun simctl openurl <udid> <url>`. Taps and typing go through the repo's UI test target (`xcodebuild test -only-testing:<UITests>/<test>`), finding elements by accessibility identifier. If the app has no UI test target, the driver reaches only deep links and launch arguments: record that as a harness gap and offer to add a UI test target.
- **Evidence.** `xcrun simctl io <udid> screenshot <path>` and `xcrun simctl io <udid> recordVideo <path>`. App logs with `xcrun simctl spawn <udid> log stream --predicate 'subsystem == "<bundle id>"'`.
- **Doctor.** The UDID is booted, the installed build matches the current checkout, and the app launches to its first screen.
- **Cleanup.** `xcrun simctl shutdown <udid>` and `xcrun simctl delete <udid>`. Keep the evidence folder.

## Service or API

Start it on a free port with its own database as above, drive it with `curl` or a small script, and keep the request, response body, status code and any rows written as evidence.
