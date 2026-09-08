# crunchydb

![Version: 0.0.1](https://img.shields.io/badge/Version-0.0.1-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 18](https://img.shields.io/badge/AppVersion-18-informational?style=flat-square)

Standalone Crunchy PostgreSQL cluster for PCNS (wraps bcgov/crunchy-postgres)

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| https://bcgov.github.io/crunchy-postgres/ | crunchy-postgres | 0.6.6 |
| https://bcgov.github.io/crunchy-postgres/ | crunchy-postgres-tools | 0.3.0 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| crunchy-postgres-tools.deployer.serviceAccount.enabled | bool | `false` | Service accounts are namespace/CI infra you don't manage from this release. |
| crunchy-postgres-tools.deploymentName | string | `"pcns"` | Target deployment name. |
| crunchy-postgres-tools.fullnameOverride | string | `"crunchydb-tools"` | Subchart release name override. |
| crunchy-postgres-tools.linter.serviceAccount.enabled | bool | `false` | Service accounts are namespace/CI infra you don't manage from this release. |
| crunchy-postgres-tools.networking.networkPolicy.enabled | bool | `false` | pcns chart owns the app ingress network policy. |
| crunchy-postgres-tools.networking.podNetworkPolicy.enabled | bool | `false` | Keep disabled: subchart renders an unconstrained permit-all policy. |
| crunchy-postgres-tools.networking.route.enabled | bool | `false` | pcns chart owns its OpenShift route. |
| crunchy-postgres-tools.provisioner.serviceAccount.enabled | bool | `false` | Service accounts are namespace/CI infra you don't manage from this release. |
| crunchy-postgres.crunchyImage | string | `"artifacts.developer.gov.bc.ca/bcgov-docker-local/crunchy-postgres:ubi9-18.1-2547"` | CrunchyDB image used for PostgreSQL instance pods. |
| crunchy-postgres.dataSource.enabled | bool | `false` | Restore-from-backup source; enable only for a DR/prod cutover. |
| crunchy-postgres.fullnameOverride | string | `"crunchy"` | Sets the cluster name; charts/pcns hardcodes crunchy-primary/-pgbouncer/-pguser-crunchy to match. |
| crunchy-postgres.imagePullPolicy | string | `"IfNotPresent"` | Image pull policy for database containers. |
| crunchy-postgres.instances.dataVolumeClaimSpec.storage | string | `"2Gi"` | Persistent storage size for PostgreSQL data and WAL. |
| crunchy-postgres.instances.dataVolumeClaimSpec.storageClassName | string | `"netapp-block-standard"` | Storage class name for PostgreSQL data volume. |
| crunchy-postgres.instances.limits.cpu | string | `"500m"` | CPU limit for PostgreSQL instance pod. |
| crunchy-postgres.instances.limits.memory | string | `"512Mi"` | Memory limit for PostgreSQL instance pod. |
| crunchy-postgres.instances.name | string | `"ha"` | Instance set name. |
| crunchy-postgres.instances.replicaCertCopy.requests.cpu | string | `"10m"` | CPU request for TLS certificate copy init container. |
| crunchy-postgres.instances.replicaCertCopy.requests.memory | string | `"32Mi"` | Memory request for TLS certificate copy init container. |
| crunchy-postgres.instances.replicas | int | `2` | Number of PostgreSQL high-availability replicas. |
| crunchy-postgres.instances.requests.cpu | string | `"50m"` | CPU request for PostgreSQL instance pod (scheduler floor is 10m). |
| crunchy-postgres.instances.requests.memory | string | `"256Mi"` | Memory request for PostgreSQL instance pod. |
| crunchy-postgres.openshift | bool | `true` | Enables OpenShift-specific security contexts and configurations. |
| crunchy-postgres.patroni.postgresql.parameters.max_slot_wal_keep_size | string | `"128MB"` | Maximum replication slot WAL retention size. |
| crunchy-postgres.patroni.postgresql.parameters.max_wal_size | string | `"64MB"` | Maximum WAL size threshold triggering checkpoints. |
| crunchy-postgres.patroni.postgresql.parameters.min_wal_size | string | `"32MB"` | Minimum WAL size retention on disk. |
| crunchy-postgres.patroni.postgresql.parameters.shared_buffers | string | `"16MB"` | Shared buffer memory for PostgreSQL engine. |
| crunchy-postgres.patroni.postgresql.parameters.wal_buffers | string | `"64kB"` | Write-ahead log buffer size. |
| crunchy-postgres.patroni.postgresql.pg_hba | string | `"host all all 0.0.0.0/0 scram-sha-256"` | Host-based authentication rules for PostgreSQL. |
| crunchy-postgres.pgBackRest.repo1.enabled | bool | `true` | Enable local PVC backup repository (repo1). |
| crunchy-postgres.pgBackRest.repoHost.requests.cpu | string | `"10m"` | CPU request for pgBackRest dedicated repo host pod. |
| crunchy-postgres.pgBackRest.repoHost.requests.memory | string | `"64Mi"` | Memory request for pgBackRest dedicated repo host pod. |
| crunchy-postgres.pgBackRest.repos.schedules.full | string | `"0 8 * * *"` | Cron schedule for automated full backups. |
| crunchy-postgres.pgBackRest.repos.schedules.incremental | string | `"0 0,12,20 * * *"` | Cron schedule for automated incremental backups. |
| crunchy-postgres.pgBackRest.repos.volume.accessModes | string | `"ReadWriteOnce"` | PVC access mode for local backup volume. |
| crunchy-postgres.pgBackRest.repos.volume.storage | string | `"2Gi"` | Storage size for local backup volume. |
| crunchy-postgres.pgBackRest.repos.volume.storageClassName | string | `"netapp-file-backup"` | Storage class for local backup volume. |
| crunchy-postgres.pgBackRest.retention | string | `"7"` | Backup retention count; the Database workflow patches repo2 (S3) to 365 in prod. |
| crunchy-postgres.pgBackRest.retentionFullType | string | `"count"` | Type of full backup retention tracking (count or time). |
| crunchy-postgres.pgBackRest.s3.enabled | bool | `false` | Prod S3 backup repository (repo2); requires the s3-pgbackrest secret in the namespace. |
| crunchy-postgres.pgBackRest.sidecars.requests.cpu | string | `"10m"` | CPU request for pgBackRest sidecar containers. |
| crunchy-postgres.pgBackRest.sidecars.requests.memory | string | `"64Mi"` | Memory request for pgBackRest sidecar containers. |
| crunchy-postgres.pgmonitor.enabled | bool | `false` | Enable pgMonitor metric exporter sidecars. |
| crunchy-postgres.postgresVersion | int | `18` | PostgreSQL major version. |
| crunchy-postgres.proxy.pgBouncer.limits.cpu | string | `"100m"` | CPU limit for pgBouncer proxy container. |
| crunchy-postgres.proxy.pgBouncer.limits.memory | string | `"128Mi"` | Memory limit for pgBouncer proxy container. |
| crunchy-postgres.proxy.pgBouncer.replicas | int | `2` | Number of pgBouncer connection pooler replicas. |
| crunchy-postgres.proxy.pgBouncer.requests.cpu | string | `"10m"` | CPU request for pgBouncer proxy container. |
| crunchy-postgres.proxy.pgBouncer.requests.memory | string | `"64Mi"` | Memory request for pgBouncer proxy container. |
| crunchy-postgres.standby.enabled | bool | `false` | Enable standby cluster configuration for DR replication. |

----------------------------------------------
Autogenerated from chart metadata using [helm-docs v1.14.2](https://github.com/norwoodj/helm-docs/releases/v1.14.2)
