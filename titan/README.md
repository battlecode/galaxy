# Titan

Our competitors can upload many files that are viewable by other users. For example,
they may upload arbitrary files as their resumes, and these files may be viewed by
authorized representatives from sponsors. In order to keep our stakeholders safe, we
scan these files for malware.

Titan is our antivirus module that performs asynchronous malware scanning on-demand.

## Development

### Running Tests

#### Unit Tests (Fast, No Dependencies)

Run the fast unit tests with mocked dependencies:

```bash
cd titan
go test -v -short ./pkg/...
```

#### Integration Tests (Requires ClamAV)

The integration tests require ClamAV to be installed and running. These tests verify the actual scanning functionality with a real clamd daemon.

**Install ClamAV:**

```bash
# Ubuntu/Debian
sudo apt-get install clamav clamav-daemon

# macOS
brew install clamav
```

**Start ClamAV daemon:**

```bash
# Ubuntu/Debian
sudo systemctl start clamav-daemon

# macOS
# Edit /opt/homebrew/etc/clamav/clamd.conf if needed
clamd
```

**Run integration tests:**

```bash
cd titan
go test -v ./pkg/...
```

**Run all tests with coverage:**

```bash
go test -v -coverprofile=coverage.out ./pkg/...
go tool cover -html=coverage.out  # View coverage in browser
```

**Run tests with race detection:**

```bash
go test -v -race ./pkg/...
```

The tests are automatically run as part of CI on every pull request. The CI pipeline uses a minimal custom test database (only EICAR signature) rather than downloading the full ~8GB ClamAV database set. This keeps CI execution fast while still validating real scanning functionality.

## How to request a scan

To request a scan from Siarnaq, use the `titan.request_scan()` function with a blob:

```python
from siarnaq.gcloud import titan

# After uploading a file to GCS
titan.request_scan(blob)
```

This function:
1. Sets the blob's metadata to `Titan-Status: Unverified`
2. Publishes a scan request message to the Pub/Sub topic

Once the file is scanned, Titan updates the metadata status to either `Verified` or
`Malicious`. The status can be checked using `titan.get_object()`.

## System architecture

Titan receives scan requests via Google Cloud Pub/Sub:

1. **Siarnaq** publishes scan request messages to the `{environment}-siarnaq-scan` topic
2. **Pub/Sub** pushes these messages to Titan's Cloud Run service via OIDC-authenticated HTTP POST
3. **Titan** processes the message, retrieves the file from GCS, scans it with ClamAV, and updates the file's metadata

The message payload is a simple JSON object:
```json
{
  "bucket": "bucket-name",
  "name": "path/to/file"
}
```

Titan runs on Cloud Run and scales automatically based on incoming Pub/Sub push requests.
