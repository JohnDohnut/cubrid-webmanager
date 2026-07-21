# cwm.conf reference

`conf/cwm.conf` is a plain JSON object. Any key below can be added to it —
values are read as strings. After editing, restart the server.

```json
{
  "PORT": "8080",
  "ENVIRONMENT": "production",
  "STORAGE_PATH": "./data",
  "ALLOWED_ORIGINS": "https://your-domain.example",
  "LISTEN_HOST": "127.0.0.1",
  "SSL_CERT_PATH": "/etc/ssl/certs/your-cert.pem",
  "SSL_KEY_PATH": "/etc/ssl/private/your-key.pem",
  "AUTH_REGISTRATION_ENABLED": "false"
}
```

Do not add `SEED` or `SALT` here — they're ignored on purpose. They're
generated automatically on first run and stored in `cwm-vault/secrets.json`.
Never edit or delete that file: doing so makes all previously stored data
unreadable.

| Key | What it controls | Default |
|---|---|---|
| `PORT` | Server port | `8080` |
| `ENVIRONMENT` | `production` or `development` | `production` |
| `STORAGE_PATH` | Where application data is stored | `./data` |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowlist. Leave unset for same-origin only. | — |
| `LISTEN_HOST` | Network interface to bind to, e.g. `127.0.0.1` to refuse connections from other machines | all interfaces |
| `SSL_CERT_PATH` / `SSL_KEY_PATH` | Path to a real TLS cert/key pair. Both must be set together, or neither. | self-signed cert, auto-generated |
| `AUTH_REGISTRATION_ENABLED` | Whether new accounts can sign up. Set to `false` once your team is registered. | `true` |
| `CMS_REJECT_UNAUTHORIZED` | Verify TLS certificates when connecting to CUBRID CMS hosts | `true` in production |
| `CMS_CA_CERT_PATH` | CA certificate to trust for CMS hosts using a private/self-signed cert | — |
| `CMS_JOB_RETENTION_HOURS` | How long finished background-job records (copy/rename/backup/etc.) are kept | `24` |
| `CMS_JOB_STALE_RUNNING_HOURS` | How long a job can run before it's treated as stalled | `CMS_JOB_LONG_TIMEOUT_HOURS + 1` |
| `CMS_JOB_LONG_TIMEOUT_HOURS` | Max wait for long-running jobs (unload/load) | `12` |
| `CMS_JOB_RECOVER_ON_STARTUP` | Resume tracking jobs that were still running when the server restarted | `true` |
| `SERVER_IP` | IP to include in the auto-generated self-signed certificate (avoids browser warnings when accessed by IP) | detected from network interfaces |
| `CWM_SSL_DIR` | Directory to read/write the self-signed cert from | `ssl/` next to the executable |
