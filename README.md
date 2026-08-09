# KFCMan Hugo replica

Pixel-close Hugo reconstruction of <https://kunfucutsman.neocities.org/>.

## Local preview

```powershell
hugo server --disableFastRender
```

The current milestone contains the Hugo project skeleton and the homepage with
the original site's HTML, CSS, JavaScript, icons, and locally hosted images.
External widgets (webrings, BibleGateway, and CBox) intentionally keep their
original URLs and therefore require an internet connection.

## EVORA AI chat

The browser never receives the API key. The frontend calls only
`http://127.0.0.1:8787/v1/evora/chat`.

Start the local proxy in a separate PowerShell window before testing `/robot/`:

```powershell
.\server\start-evora-proxy.ps1
```

The launcher reads `OPENAI_API_KEY` from the current environment first, then
falls back to `~/.codex/auth.json`. If both are empty, it securely prompts for
the key without echoing it or writing it to project files.

Alternatively, set the key for the current PowerShell session and start the
proxy directly:

```powershell
$env:OPENAI_API_KEY = "YOUR_NEW_KEY"
node .\server\evora-proxy.mjs
```

Optional launcher parameters are `-Port`, `-ApiBaseUrl`, and `-Model`.
