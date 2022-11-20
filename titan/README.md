# Titan

Our competitors can upload many files that are viewable by other users. For example,
they may upload arbitrary files as their resumes, and these files may be viewed by
authorized representatives from sponsors. In order to keep our stakeholders safe, we
scan these files for malware.

Titan is our antivirus module that performs asynchronous malware scanning on-demand.

## How to request a scan

Titan is configured (by Terraform) to respond to scan requests for the `public` and
`secure` storage buckets. To request a scan, tag the object with the following metadata
after uploading it:

```
Titan-Status: Unverified
```

Titan will detect this and scan the file. Once the file is scanned, the status will be
replaced with either of `Verified` or `Malicious`.

## System architecture

Titan receives file metadata update events via Google EventArc. These events are pushed
to the server and the file is scanned.
