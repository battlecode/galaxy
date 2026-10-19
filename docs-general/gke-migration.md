# Migrating Saturn compute from GCE MIGs to GKE

## 1. Why this needs doing

**Nothing is currently broken.** Saturn works. This is scheduled maintenance against a
deprecation with a hard deadline, not an incident.

Google has deprecated the **container startup agent** (`konlet`), which starts a VM's container
from the `gce-container-declaration` instance metadata key. Two dates are published:

| Date | Stated effect |
| --- | --- |
| **2026-07-31** | Workflows relying on the agent or the metadata key "no longer work" |
| **2027-07-31** | Support discontinued entirely; running VMs are on their own |

`deploy/saturn/main.tf` is built entirely on that mechanism:

- [`deploy/saturn/main.tf:78`](../deploy/saturn/main.tf) — `terraform-google-modules/container-vm`
- [`deploy/saturn/main.tf:124`](../deploy/saturn/main.tf) — `gce-container-declaration = module.container.metadata_value`

### Observed state as of 2026-10-19

The first date has **not** been enforced on `mitbattlecode`. Saturn is running normally:

- `cos_containers` logs show `Monitor listening…`, `Starting server.`, `Starting task.` and
  `Task finished.` with status `OK!` on 2026-10-01, 10-08, 10-11 and 10-12 — full compile runs
  including Gradle build, binary upload and report back to Siarnaq.
- The MIG autoscaler creates workers on demand and they do their jobs; the preemption path works
  (`shutdown-script exit status 0`, because Saturn's monitor really is listening on 8005).
- The public web tier is up: `battlecode.org`, `play.battlecode.org` and
  `api.battlecode.org/api/episode/e/` all return 200.

Caveat on that evidence: Cloud Logging's default retention is 30 days, so this confirms healthy
operation from roughly 2026-09-19 onward only. Whether anything broke in August is not
recoverable without a log sink.

So the deprecation is real but unenforced here. The risk is that enforcement arrives without
warning, and both Saturn pools run `min_instances = 0` (see `deploy/galaxy/main.tf`) — every
worker is created on demand, so when it does land, compile and execute stop together and
immediately. That is the reason to migrate off it on a calm schedule rather than wait.

`deploy/cpw/` is **unaffected**: it is a plain Ubuntu VM with no container declaration.

Sources: [Prepare for the shutdown of the container startup agent](https://docs.cloud.google.com/compute/docs/containers/prepare-for-container-agent-shutdown),
[Migrate containers deployed on VMs](https://docs.cloud.google.com/compute/docs/containers/migrate-containers).

---

## 2. The cloud-init fix (~1 hour)

Google's first recommended replacement for `gce-container-declaration` is **cloud-init or a
startup script running `docker run`**. This is a fully supported, non-deprecated path — not a
hack and not a stopgap. It moves Saturn off the deprecated key with a ~40-line diff and leaves
the MIG, the autoscaler, the preemption handling, the subnets, and the Cloud Build trigger
**completely untouched**.

Read §2.2 before deciding whether you need anything beyond this.

### 2.1 The change

In `deploy/saturn/main.tf`, delete the `module "container"` block and change the instance
template. Use cloud-init with a systemd unit rather than a bare startup script, so the container
gets a restart policy — that's the one thing konlet did for you that a plain `docker run` in a
startup script would not.

```hcl
locals {
  saturn_args = join(" ", [
    "-project=${var.gcp_project}",
    "-secret=${var.secret_id}",
    "-subscription=${google_pubsub_subscription.queue.name}",
    "-parallel=${var.parallelism}",
  ])

  cloud_init = <<-EOT
    #cloud-config

    write_files:
    - path: /etc/systemd/system/saturn.service
      permissions: "0644"
      owner: root
      content: |
        [Unit]
        Description=Saturn worker
        Wants=gcr-online.target
        After=gcr-online.target

        [Service]
        Environment="HOME=/home/saturn"
        ExecStartPre=/usr/bin/docker-credential-gcr configure-docker --registries=${var.gcp_region}-docker.pkg.dev
        ExecStart=/usr/bin/docker run --rm --name=saturn --network=host \
          --log-driver=gcplogs ${var.image} ${local.saturn_args}
        ExecStop=/usr/bin/docker stop saturn
        Restart=on-failure
        RestartSec=10

        [Install]
        WantedBy=multi-user.target

    runcmd:
    - systemctl daemon-reload
    - systemctl start saturn.service
  EOT
}

resource "google_compute_instance_template" "this" {
  # ... everything else unchanged ...

  disk {
    boot         = true
    disk_size_gb = 10
    source_image = "projects/cos-cloud/global/images/family/cos-stable"
    auto_delete  = true
  }

  metadata = {
    user-data                 = local.cloud_init
    google-logging-enabled    = true
    google-monitoring-enabled = true
    shutdown-script           = file("${path.module}/shutdown-script.sh")
  }
}
```

Notes:

- `--network=host` is required so the existing `shutdown-script.sh` (`nc localhost 8005`) still
  reaches the Monitor on preemption. Preemption handling is byte-for-byte unchanged.
- `Restart=on-failure`, not `always`. Saturn exits 0 on graceful context cancellation, so a
  preempted worker stays down for the ~30 s the VM has left instead of grabbing one more message
  it can't finish. A genuine crash (`log.Fatal`, exit 1) does restart. This is slightly better
  behaviour than konlet gave you.
- COS ships `docker` and `docker-credential-gcr`; no install step.
- COS reads cloud-init from the `user-data` metadata key.
- After `terraform apply`:
  `gcloud compute instance-groups managed rolling-action replace <mig> --zone us-east1-b`.

### 2.2 Is GKE actually worth doing after this?

Worth being honest, because the answer is not obviously yes.

**What GKE would buy you over the cloud-init fix:**

| Claimed benefit | Reality for Saturn |
| --- | --- |
| Container lifecycle / restart | The systemd unit above already does this |
| Faster scale-up | No. One pod per node means you boot a VM either way |
| Bin-packing many workloads per node | You deliberately don't want this — one Saturn per machine is the isolation model |
| Better deploys | `kubectl set image` vs `rolling-action replace`. Marginal |
| Rollback, health checks, ecosystem | Real, but you aren't using any of it today |

**What GKE would cost you:**

- ~$73/mo of control plane (see §10)
- KEDA as a new runtime dependency, because plain HPA can't scale to zero on GKE
- Workload Identity, kustomize, and `kubectl` in Cloud Build
- Node auto-upgrade windows that must be excluded around every tournament (§9.5)
- An unverified assumption about OIDC token minting that, if wrong, fails silently (§9.1)
- A second orchestration system for a volunteer team whose ops runbook is a markdown checklist

For this specific workload — one stateless container per VM, queue-driven, Spot, scale-to-zero,
one container per machine by design — GKE is close to a lateral move with meaningfully more
operational surface. **My recommendation is to ship §2.1 and stop**, unless you have a reason
beyond the konlet shutdown: wanting to co-locate other services, wanting per-job sandboxing
(§9.6), or wanting to standardise on Kubernetes for reasons outside this repo.

The rest of this document is the full GKE migration, ready to execute if you decide those
reasons apply.

---

## 3. Target architecture

```
Pub/Sub subscription (unchanged)
        │  num_undelivered_messages  (Cloud Monitoring)
        ▼
   KEDA ScaledObject ──▶ HPA ──▶ Deployment (replicas 0..N)
                                      │ 1 pod per node (hard anti-affinity)
                                      ▼
                          GKE node pool, Spot, autoscale 0..N
```

Mapping from today:

| Today (GCE) | Tomorrow (GKE) |
| --- | --- |
| `google_compute_instance_template` + container-vm | `Deployment` + container image (unchanged image) |
| `google_compute_instance_group_manager` | `Deployment` + `google_container_node_pool` |
| `google_compute_autoscaler` on `num_undelivered_messages` | KEDA `ScaledObject`, `gcp-pubsub` trigger |
| `single_instance_assignment = 10 / 50` | trigger `value: "10" / "50"` (identical semantics) |
| `min_instances = 0` | `minReplicaCount: 0` (KEDA; plain HPA cannot scale to zero on GKE) |
| `preemptible = true` | node pool `spot = true` |
| GCE service account on instance template | Workload Identity Federation (KSA → GSA) |
| `shutdown-script` → `nc localhost 8005` | SIGTERM (already handled — see §5) |
| MIG `rolling-action replace` in Cloud Build | `kubectl set image` in Cloud Build |
| One container per VM | Hard pod anti-affinity → one pod per node |

Why GKE Standard and not Autopilot: Saturn runs untrusted competitor bots under wall-clock limits,
so consistent CPU matters for match fairness. Standard lets you pin `t2d-standard-*` exactly as
today and guarantee one workload per node. Autopilot's `Scale-Out` class is also T2D and would
work, but you'd be billed per pod-request for a pod that already requests a whole node — no
saving, less control.

Why KEDA and not plain HPA: HPA's `minReplicas: 0` needs the `HPAScaleToZero` feature gate, which
GKE does not enable. Google publishes a first-party tutorial for exactly this shape:
[Scale to zero using KEDA](https://docs.cloud.google.com/kubernetes-engine/docs/tutorials/scale-to-zero-using-keda).

Why not Cloud Run Jobs / Batch: `ScaffoldMultiplexer` caches cloned scaffold repos in-process per
episode (`saturn/pkg/run/scaffold.go`). A per-message job would re-clone the scaffold on every
task. A long-lived subscriber is the right shape, so `Deployment` + `ScaledObject`, not
`ScaledJob`.

### Cluster topology

These are two independent axes. Conflating them was a mistake in an earlier draft of this doc.

**Axis 1 — how many clusters (this is the network-isolation question).**
Production and staging sit in separate VPCs (`galaxy-production`, `galaxy-staging`). One cluster
per environment, each in its own existing VPC, preserves that boundary and mirrors the existing
`module "galaxy"` shape. A single shared cluster with two namespaces saves a control-plane fee
but crosses the VPC boundary the current design maintains.

**Decision: one cluster per environment.**

**Axis 2 — zonal vs regional (this is purely cost vs. Spot resilience; it has nothing to do with
VPC isolation).** A regional cluster's node pools span three zones, which helps when
`t2d-standard-16` Spot capacity is tight in a single zone. But the GKE free-tier credit only
applies to a zonal cluster, so regional means paying full freight on both clusters.

**Decision: zonal, both in `us-east1-b`.** Net control-plane cost ~$73/mo (see §10). If Spot
capacity in `us-east1-b` actually bites, the cheap mitigation is to add `node_locations` to the
cluster — that makes it multi-zonal (node pools across zones, control plane still zonal) and is a
one-line change, not a rebuild. Reach for a regional control plane only if you want control-plane
HA, which this workload does not need.

---

## 4. New Terraform

### 4.1 `deploy/gke/` — cluster module (new)

```hcl
resource "google_compute_subnetwork" "this" {
  name          = var.name
  ip_cidr_range = var.subnetwork_ip_cidr        # e.g. 10.8.0.0/20
  region        = var.gcp_region
  network       = var.network_vpc_id
  stack_type    = "IPV4_ONLY"

  private_ip_google_access = true

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = var.pods_ip_cidr            # e.g. 10.16.0.0/14
  }
  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = var.services_ip_cidr        # e.g. 10.20.0.0/20
  }
}

# Private nodes need egress for GitHub scaffold clones and Gradle/pip downloads.
resource "google_compute_router" "this" {
  name    = "${var.name}-router"
  region  = var.gcp_region
  network = var.network_vpc_id
}

resource "google_compute_router_nat" "this" {
  name                               = "${var.name}-nat"
  router                             = google_compute_router.this.name
  region                             = var.gcp_region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "LIST_OF_SUBNETWORKS"

  subnetwork {
    name                    = google_compute_subnetwork.this.id
    source_ip_ranges_to_nat = ["ALL_IP_RANGES"]
  }
}

resource "google_container_cluster" "this" {
  name     = var.name
  location = var.gcp_zone      # zonal; see "Cluster topology" above

  network    = var.network_vpc_id
  subnetwork = google_compute_subnetwork.this.name

  remove_default_node_pool = true
  initial_node_count       = 1
  deletion_protection      = true

  networking_mode = "VPC_NATIVE"
  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  workload_identity_config {
    workload_pool = "${var.gcp_project}.svc.id.goog"
  }

  release_channel { channel = "REGULAR" }

  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = var.master_ipv4_cidr   # e.g. 172.20.0.0/28
  }

  addons_config {
    http_load_balancing { disabled = true }
  }

  # Do not let a node auto-upgrade evict a pod in the middle of a tournament.
  maintenance_policy {
    recurring_window {
      start_time = "2026-01-01T09:00:00Z"   # 04:00 US/Eastern
      end_time   = "2026-01-01T13:00:00Z"
      recurrence = "FREQ=WEEKLY;BYDAY=TU,WE"
    }
  }
}

resource "google_service_account" "node" {
  account_id   = "${var.name}-node"
  display_name = "GKE node service account for ${var.name}"
}

# Minimum node-level roles; workload permissions come from Workload Identity, not from this SA.
resource "google_project_iam_member" "node" {
  for_each = toset([
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/monitoring.viewer",
    "roles/stackdriver.resourceMetadata.writer",
    "roles/artifactregistry.reader",
  ])
  project = var.gcp_project
  role    = each.value
  member  = "serviceAccount:${google_service_account.node.email}"
}

resource "google_container_node_pool" "this" {
  for_each = var.node_pools

  name     = each.key
  cluster  = google_container_cluster.this.id
  location = var.gcp_zone

  autoscaling {
    min_node_count  = 0
    max_node_count  = each.value.max_nodes
    location_policy = "ANY"        # take Spot capacity wherever it exists
  }

  node_config {
    machine_type = each.value.machine_type
    spot         = true
    disk_type    = "pd-balanced"
    disk_size_gb = each.value.disk_size_gb
    image_type   = "COS_CONTAINERD"

    service_account = google_service_account.node.email
    oauth_scopes    = ["https://www.googleapis.com/auth/cloud-platform"]

    workload_metadata_config { mode = "GKE_METADATA" }

    # Saturn's image carries JDK 8 + JDK 21 + Python 3.12 (~2 GB). Image streaming
    # cuts cold-start pull time on every new Spot node.
    gcfs_config { enabled = true }

    labels = { "galaxy.battlecode.org/pool" = each.key }

    taint {
      key    = "galaxy.battlecode.org/pool"
      value  = each.key
      effect = "NO_SCHEDULE"
    }
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }
}
```

Suggested `node_pools`:

| pool | machine_type | disk | max_nodes (prod / staging) |
| --- | --- | --- | --- |
| `compile` | `t2d-standard-2` | 50 GB | 5 / 1 |
| `execute` | `t2d-standard-16` | 200 GB | 10 / 1 |

(`disk_size_gb` is up from the current 10 GB. The container writable layer, the ~2 GB image, and
12 parallel Gradle scaffolds all live on the node boot disk.)

### 4.2 `deploy/saturn/` — rewritten

Keep everything above the compute resources unchanged: the service account, the Pub/Sub
subscription and its IAM, the bucket/registry/secret IAM bindings, logging and monitoring roles.
Those all still apply.

Delete: `module "container"`, `google_compute_instance_template`,
`google_compute_instance_group_manager`, `google_compute_autoscaler`,
`google_compute_subnetwork` (the cluster module owns networking now), and `shutdown-script.sh`.

Add the Workload Identity binding:

```hcl
resource "google_service_account_iam_member" "workload_identity" {
  service_account_id = google_service_account.this.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.gcp_project}.svc.id.goog[${var.k8s_namespace}/${var.name}]"
}
```

Replace `output "compute_group_name"` with outputs the Cloud Build trigger and the manifests can
consume (`k8s_deployment_name`, `service_account_email`, `subscription_name`).

---

## 5. Kubernetes manifests

Keep these as kustomize under `deploy/k8s/`, applied by Cloud Build — **not** in Terraform.
`kubernetes_manifest` needs a CRD to exist at plan time, which makes bootstrapping a cluster with
KEDA CRDs in the same apply painful. Terraform owns cluster/IAM/Pub/Sub; kustomize owns
Deployment/ServiceAccount/ScaledObject. Clean seam.

### 5.1 KEDA

```bash
helm repo add kedacore https://kedacore.github.io/charts && helm repo update
helm install keda kedacore/keda --create-namespace --namespace keda
```

The operator reads `num_undelivered_messages` from Cloud Monitoring, so grant it
`roles/monitoring.viewer` via Workload Identity:

```bash
gcloud projects add-iam-policy-binding projects/mitbattlecode \
  --role roles/monitoring.viewer \
  --member="principal://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/mitbattlecode.svc.id.goog/subject/ns/keda/sa/keda-operator"
```

### 5.2 Workload service account

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: production-saturn-execute
  namespace: production
  annotations:
    iam.gke.io/gcp-service-account: production-saturn-execute@mitbattlecode.iam.gserviceaccount.com
```

### 5.3 Deployment (execute shown; compile is the same with different numbers)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: production-saturn-execute
  namespace: production
spec:
  replicas: 0                     # KEDA owns this from here on
  selector:
    matchLabels: { app: production-saturn-execute }
  template:
    metadata:
      labels: { app: production-saturn-execute }
    spec:
      serviceAccountName: production-saturn-execute
      terminationGracePeriodSeconds: 25    # Spot gives 30s notice
      nodeSelector:
        galaxy.battlecode.org/pool: execute
      tolerations:
        - key: galaxy.battlecode.org/pool
          value: execute
          effect: NoSchedule
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            - labelSelector:
                matchLabels: { app: production-saturn-execute }
              topologyKey: kubernetes.io/hostname   # one Saturn per node, as today
      containers:
        - name: saturn
          image: us-east1-docker.pkg.dev/mitbattlecode/galaxy/saturn:REPLACED_BY_CLOUD_BUILD
          args:
            - -project=mitbattlecode
            - -secret=production-saturn
            - -subscription=production-saturn-execute
            - -parallel=12
          resources:
            requests:
              cpu: "15"                 # t2d-standard-16 allocatable is ~15.89
              memory: "50Gi"
              ephemeral-storage: "120Gi"
            limits:
              memory: "56Gi"
              ephemeral-storage: "150Gi"
          # Deliberately no CPU limit: CFS throttling would distort match timing.
          volumeMounts:
            - { name: scaffolds, mountPath: /scaffolds }
      volumes:
        - name: scaffolds
          emptyDir: { sizeLimit: 120Gi }
```

Compile pool: `-parallel=1`, `cpu: "1500m"`, `memory: "4Gi"`,
`nodeSelector`/`toleration` on `compile`.

### 5.4 ScaledObject

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: production-saturn-execute
  namespace: production
spec:
  scaleTargetRef:
    name: production-saturn-execute
  minReplicaCount: 0
  maxReplicaCount: 10
  pollingInterval: 15
  cooldownPeriod: 300
  advanced:
    horizontalPodAutoscalerConfig:
      behavior:
        scaleDown:
          # Matches run for minutes. Don't yank pods the instant the queue drains.
          stabilizationWindowSeconds: 600
          policies:
            - { type: Pods, value: 1, periodSeconds: 120 }
  triggers:
    - type: gcp-pubsub
      metadata:
        subscriptionName: "projects/mitbattlecode/subscriptions/production-saturn-execute"
        mode: SubscriptionSize
        value: "50"          # == single_instance_assignment today
```

Compile: `value: "10"`, `maxReplicaCount: 5`.

---

## 6. Application changes

Saturn's Go code needs **no functional changes**. Specifically:

- `signal.NotifyContext(ctx, SIGINT, SIGTERM)` in `saturn/cmd/saturn/main.go` already cancels the
  context on SIGTERM, which is exactly what kubelet sends on Spot preemption and on scale-down.
  The GCE `shutdown-script` → `nc localhost 8005` → `Monitor` path becomes redundant. In-flight
  tasks are still reported as `TaskInterrupted` and the Pub/Sub message is still nacked and
  redelivered (`saturn/pkg/saturn/task.go`, `saturn/pkg/saturn/queue.go`) — unchanged behaviour.
- `pubsub.NewClient`, `secretmanager.NewClient`, and `idtoken.NewClient` all use ADC, which
  Workload Identity satisfies.

Optional cleanup once GKE is live: delete `saturn/pkg/saturn/monitor.go`, the `-port` flag, and
`EXPOSE 8005` from the Dockerfile. Low priority — harmless if left.

---

## 7. CD changes

`deploy/galaxy/main.tf`, `google_cloudbuild_trigger.saturn`: replace the two
`rolling-action replace` steps.

```hcl
step {
  name       = "gcr.io/google.com/cloudsdktool/cloud-sdk"
  entrypoint = "bash"
  args = ["-c", <<-EOT
    gcloud container clusters get-credentials ${module.gke.cluster_name} --region ${var.gcp_region}
    kubectl -n ${var.name} set image deployment/${var.name}-saturn-compile saturn=${var.saturn_image}:$TAG_NAME
    kubectl -n ${var.name} set image deployment/${var.name}-saturn-execute saturn=${var.saturn_image}:$TAG_NAME
  EOT
  ]
}
```

Two supporting changes:

1. Tag images per build. The docker steps currently push `${var.saturn_image}` with no tag
   (i.e. `:latest`) and rely on the MIG replace to pick up the new image. Push
   `${var.saturn_image}:$TAG_NAME` as well and reference that tag in `kubectl set image`.
2. Grant the Cloud Build service account `roles/container.developer`.

---

## 8. Execution plan

| # | Step | Verify |
| --- | --- | --- |
| 0 | (Optional) Phase-0 startup-script bridge, apply to prod | A submission compiles end to end |
| 1 | Write `deploy/gke/`, apply for **staging only** | Cluster + two node pools exist, 0 nodes |
| 2 | Install KEDA, grant `monitoring.viewer` | `kubectl get scaledobject` API responds |
| 3 | Rewrite `deploy/saturn/` for staging; apply | GSA, subscription, WI binding present |
| 4 | Apply staging manifests | `kubectl get deploy -n staging` shows 0/0 |
| 5 | **Verify Workload Identity end to end** — biggest risk, see §9.1 | Staging compile job succeeds |
| 6 | Publish ~50 messages to the staging execute topic | Nodes appear, pods run, queue drains, scales back to 0 |
| 7 | Kill a node (`gcloud compute instances delete`) mid-match | Task reported `TRY`, message redelivered, retried |
| 8 | Update Cloud Build trigger; tag and push a staging build | New image lands via `kubectl set image` |
| 9 | Repeat 1–8 for production during a low-traffic window | Real submission compiles and plays |
| 10 | `terraform destroy` the old MIGs/templates/autoscalers/subnets | No orphaned Compute resources |

Do **not** attempt this during a tournament week. If a tournament is imminent, ship the §2
cloud-init change only and schedule the GKE work after.

---

## 9. Risks

### 9.1 OIDC token minting under Workload Identity — highest risk

`saturn/pkg/saturn/report.go` calls `idtoken.NewClient(ctx, "siarnaq")` to mint an OIDC ID token
for reporting back to Siarnaq. On GCE this hits the metadata server's `identity` endpoint. The GKE
metadata server (`GKE_METADATA` mode) also serves that endpoint, so it should work — but if it
doesn't, *every* task silently fails to report and the failure looks like a Saturn bug, not an
auth bug. Test this explicitly at step 5 before touching production. Fallback if it misbehaves:
`iam.serviceAccounts.getOpenIdToken` via impersonation.

### 9.2 Spot capacity for `t2d-standard-16`

Zonal node pools in `us-east1-b` can simply have no Spot capacity. Note this risk exists
identically today with the MIG, so it is not a regression. Mitigations, cheapest first: add
`node_locations` to make the cluster multi-zonal, keep `location_policy = "ANY"`, and add a small
non-Spot fallback node pool tainted identically for tournament days.

### 9.3 Cold-start latency

Spot node provisioning (~60–90 s) plus a ~2 GB image pull is worse than the current MIG cold
start. Image streaming (`gcfs_config`) is the main lever. If it's still too slow around
tournaments, temporarily set `minReplicaCount: 1`.

### 9.4 Autoscaler metric lag

KEDA's `SubscriptionSize` mode reads Cloud Monitoring, which lags 1–3 minutes — the same source
and the same lag as `google_compute_autoscaler` today. No regression, but don't expect the
migration to make scale-up snappier.

### 9.5 Node auto-upgrade during tournaments

A `REGULAR`-channel auto-upgrade will drain nodes and interrupt matches. The
`maintenance_policy` above helps; add a **maintenance exclusion** covering each tournament window
as part of the tournament runbook in `docs-general/operations.md`.

### 9.6 Untrusted code isolation

One pod per node via hard anti-affinity preserves exactly today's blast radius. GKE Sandbox
(gVisor) would improve it, but gVisor's syscall interception measurably slows JVM workloads and
Saturn enforces wall-clock limits on bots — enabling it would change match outcomes. Treat as
future work, and only with re-benchmarking.

---

## 10. Cost

GKE bills a flat **$0.10/hr per cluster** management fee regardless of topology — zonal,
multi-zonal, regional, or Autopilot are all the same rate. Each billing account gets **$74.40/mo
in credits**, and those credits apply to a zonal or Autopilot cluster, not a regional one.
([GKE pricing](https://cloud.google.com/kubernetes-engine/pricing))

So, incremental cost over the cloud-init fix in §2:

| Option | Control plane |
| --- | --- |
| Two **zonal** clusters, one per env (recommended) | ~$73/mo — credit covers the first |
| Two **regional** clusters | ~$146/mo — credit covers neither |
| One shared zonal cluster, two namespaces | $0 — fully covered by the credit |

Everything else:

- **Node compute**: roughly unchanged. Same machine types, still Spot, still scale-to-zero.
- **Cloud NAT**: ~$45/mo per gateway plus egress, if you adopt private nodes. Keeping public
  nodes with external IPs — which is what the MIGs do today — avoids this entirely.
- **Larger boot disks**: 200 GB pd-balanced ≈ $20/mo per running execute node, only while running.

Realistic all-in delta for the recommended shape: **~$75–120/mo**, against a cloud-init fix that
costs nothing and changes nothing else.
