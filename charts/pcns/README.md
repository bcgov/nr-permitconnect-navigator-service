# nr-permitconnect-navigator-service

![Version: 0.0.21](https://img.shields.io/badge/Version-0.0.21-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.5.0](https://img.shields.io/badge/AppVersion-0.5.0-informational?style=flat-square)

PermitConnect Navigator Service

**Homepage:** <https://bcgov.github.io/nr-permitconnect-navigator-service>

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| NRM Permitting and Data Solutions | <NRM.PermittingAndData@gov.bc.ca> | <https://github.com/bcgov/nr-permitconnect-navigator-service> |

## Source Code

* <https://github.com/bcgov/nr-permitconnect-navigator-service>

## Requirements

Kubernetes: `>= 1.13.0`

| Repository | Name | Version |
|------------|------|---------|
| https://bcgov.github.io/nr-patroni-chart | patroni | 0.0.4 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| atsSecretOverride.password | string | `nil` |  |
| atsSecretOverride.username | string | `nil` |  |
| autoscaling.behavior | object | `{"scaleDown":{"policies":[{"periodSeconds":120,"type":"Pods","value":1}],"selectPolicy":"Max","stabilizationWindowSeconds":120},"scaleUp":{"policies":[{"periodSeconds":30,"type":"Pods","value":2}],"selectPolicy":"Max","stabilizationWindowSeconds":0}}` | Behavior configures the scaling behavior of the target in both Up and Down directions (scaleUp and scaleDown fields respectively). |
| autoscaling.enabled | bool | `false` | Specifies whether the Horizontal Pod Autoscaler should be created |
| autoscaling.maxReplicas | int | `16` |  |
| autoscaling.minReplicas | int | `2` |  |
| autoscaling.targetCPUUtilizationPercentage | int | `80` |  |
| chesSecretOverride.password | string | `nil` |  |
| chesSecretOverride.username | string | `nil` |  |
| config.configMap | object | `{"FRONTEND_APIPATH":"api/v1","FRONTEND_CHES_ROADMAP_BCC":null,"FRONTEND_CHES_SUBMISSION_CC":null,"FRONTEND_COMS_APIPATH":null,"FRONTEND_COMS_BUCKETID":null,"FRONTEND_GEOCODER_APIPATH":null,"FRONTEND_OIDC_AUTHORITY":null,"FRONTEND_OIDC_CLIENTID":null,"FRONTEND_OPENSTREETMAP_APIPATH":null,"FRONTEND_ORGBOOK_APIPATH":null,"SERVER_APIPATH":"/api/v1","SERVER_ATS_APIPATH":null,"SERVER_ATS_TOKENURL":null,"SERVER_BODYLIMIT":"30mb","SERVER_CHEFS_APIPATH":null,"SERVER_CHES_APIPATH":null,"SERVER_CHES_TOKENURL":null,"SERVER_DB_HOST":null,"SERVER_DB_POOL_MAX":"10","SERVER_DB_POOL_MIN":"2","SERVER_DB_PORT":"5432","SERVER_ENV":null,"SERVER_LOGLEVEL":"http","SERVER_OBJECTSTORAGE_BUCKET":null,"SERVER_OBJECTSTORAGE_ENDPOINT":null,"SERVER_OBJECTSTORAGE_KEY":null,"SERVER_OIDC_AUTHORITY":null,"SERVER_OIDC_PUBLICKEY":null,"SERVER_PORT":"8080","SERVER_SSO_APIPATH":null,"SERVER_SSO_INTEGRATION":null,"SERVER_SSO_TOKENURL":null}` | These values will be wholesale added to the configmap as is; refer to the pcns documentation for what each of these values mean and whether you need them defined. Ensure that all values are represented explicitly as strings, as non-string values will not translate over as expected into container environment variables. For configuration keys named `*_ENABLED`, either leave them commented/undefined, or set them to string value "true". |
| config.enabled | bool | `false` | Set to true if you want to let Helm manage and overwrite your configmaps. |
| config.releaseScoped | bool | `false` | This should be set to true if and only if you require configmaps and secrets to be release scoped. In the event you want all instances in the same namespace to share a similar configuration, this should be set to false |
| dbSecretOverride.password | string | `nil` |  |
| dbSecretOverride.username | string | `nil` |  |
| failurePolicy | string | `"Retry"` | DeploymentConfig pre-hook failure behavior |
| form1SecretOverride.password | string | `nil` |  |
| form1SecretOverride.username | string | `nil` |  |
| form2SecretOverride.password | string | `nil` |  |
| form2SecretOverride.username | string | `nil` |  |
| fullnameOverride | string | `nil` | String to fully override fullname |
| image.pullPolicy | string | `"IfNotPresent"` | Default image pull policy |
| image.repository | string | `"ghcr.io/bcgov"` | Default image repository |
| image.tag | string | `nil` | Overrides the image tag whose default is the chart appVersion. |
| imagePullSecrets | list | `[]` | Specify docker-registry secret names as an array |
| nameOverride | string | `nil` | String to partially override fullname |
| networkPolicy.enabled | bool | `true` | Specifies whether a network policy should be created |
| objectStorageSecretOverride.password | string | `nil` |  |
| objectStorageSecretOverride.username | string | `nil` |  |
| oidcSecretOverride.password | string | `nil` |  |
| oidcSecretOverride.username | string | `nil` |  |
| patroni.enabled | bool | `false` |  |
| podAnnotations | object | `{}` | Annotations for app pods |
| podSecurityContext | object | `{}` | Privilege and access control settings |
| replicaCount | int | `2` | Number of pod replicas running in the deployment |
| resources.requests | object | `{"cpu":"10m","memory":"128Mi"}` | Limit Peak Memory (in gigabytes Gi or megabytes Mi ex. 2Gi) memory: 256Mi |
| resources.requests.cpu | string | `"10m"` | Requested CPU (in millicores ex. 500m) |
| resources.requests.memory | string | `"128Mi"` | Requested Memory (in gigabytes Gi or megabytes Mi ex. 500Mi) |
| route.annotations | object | `{}` | Annotations to add to the route |
| route.enabled | bool | `true` | Specifies whether a route should be created |
| route.host | string | `"chart-example.local"` |  |
| route.tls.insecureEdgeTerminationPolicy | string | `"Redirect"` |  |
| route.tls.termination | string | `"edge"` |  |
| route.wildcardPolicy | string | `"None"` |  |
| securityContext | object | `{}` | Privilege and access control settings |
| service.port | int | `8080` | Service port |
| service.portName | string | `"http"` | Service port name |
| service.type | string | `"ClusterIP"` | Service type |
| serviceAccount.annotations | object | `{}` | Annotations to add to the service account |
| serviceAccount.enabled | bool | `false` | Specifies whether a service account should be created |
| serviceAccount.name | string | `nil` | The name of the service account to use. If not set and create is true, a name is generated using the fullname template |
| ssoSecretOverride.password | string | `nil` |  |
| ssoSecretOverride.username | string | `nil` |  |

----------------------------------------------
Autogenerated from chart metadata using [helm-docs v1.11.3](https://github.com/norwoodj/helm-docs/releases/v1.11.3)
