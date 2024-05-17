# opengamedata-monitor
A simple web tool to monitor incoming OpenGameData events on a database server.

## Debugging

The monitor app is set up to run as a service.
On Apache servers, the most straightforward way to review debug logs is with the `journalctl` utility to review logs for a specific service.
Further, to avoid overwhelming amounts of old data, you should use the switch `--since` to narrow the output to recent logs.

Suppose your instance of the `opengamedata-monitor` service is named `opengamedata-monitor.service`.
Then the recommended command to review debug outputs would be e.g.
```
journalctl -u opengamedata-monitor.service --since "1 hour ago"
```
