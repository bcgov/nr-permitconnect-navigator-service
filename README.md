# NR PermitConnect Navigator Service

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Lifecycle:Experimental](https://img.shields.io/badge/Lifecycle-Experimental-339999)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

![Tests](https://github.com/bcgov/nr-permitconnect-navigator-service/workflows/Tests/badge.svg)
[![Maintainability](https://api.codeclimate.com/v1/badges/77078c9bd93bd99d5840/maintainability)](https://codeclimate.com/github/bcgov/nr-permitconnect-navigator-service/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/77078c9bd93bd99d5840/test_coverage)](https://codeclimate.com/github/bcgov/nr-permitconnect-navigator-service/test_coverage)

NR PermitConnect Navigator Service

To learn more about the **Common Services** available visit the [Common Services Showcase](https://bcgov.github.io/common-service-showcase/) page.

## Directory Structure

```txt
.github/                   - PR, Issue templates
.vscode/                   - VSCode environment configurations
app/                       - Application Root
├── config/                - configuration exposed as environment variables
├── src/                   - Node.js web application
│   ├── components/        - Components Layer
│   ├── db/                - Database Layer
│   ├── controllers/       - Controller Layer
│   ├── db/                - Database Layer
│   ├── interfaces/        - Typescript interface definitions
│   ├── middleware/        - Middleware Layer
│   ├── routes/            - Routes Layer
│   ├── services/          - Services Layer
│   └── types/             - Typescript type definitions
└── tests/                 - Node.js web application tests
frontend/                  - Frontend Root
├── src/                   - Node.js web application
│   ├── assets/            - Static File Assets
│   ├── components/        - Components Layer
│   ├── composables/       - Common composition elements
│   ├── interfaces/        - Typescript interface definitions
│   ├── lib/               - Repackaged external libraries
│   ├── router/            - Router Layer
│   ├── services/          - Services Layer
│   ├── store/             - Store Layer
│   ├── types/             - Typescript type definitions
│   ├── utils/             - Utility components
│   └── views/             - View Layer
└── tests/                 - Vitest web application tests
CODE-OF-CONDUCT.md         - Code of Conduct
COMPLIANCE.yaml            - BCGov PIA/STRA compliance status
CONTRIBUTING.md            - Contributing Guidelines
Dockerfile                 - Dockerfile Image definition
LICENSE                    - License
SECURITY.md                - Security Policy and Reporting
```

## Documentation

- [Application Readme](app/README.md)
- [Frontend Readme](frontend/README.md)
- [Product Roadmap](https://github.com/bcgov/nr-permitconnect-navigator-service/wiki/Product-Roadmap)
- [Product Wiki](https://github.com/bcgov/nr-permitconnect-navigator-service/wiki)
- [Security Reporting](SECURITY.md)

## Quick Start Dev Guide

You can quickly run this application in development mode after cloning by opening two terminal windows and running the following commands (assuming you have already set up local configuration as well). Refer to the [Application Readme](app/README.md) and [Frontend Readme](/frontend/README.md) for more details.

- Create `.env` in the root directory with the following
  - `DATABASE_URL="your_connection_string"`

```
cd app
npm i
npm run prisma:migrate
npm run serve
```

```
cd frontend
npm i
npm run serve
```

## Getting Help or Reporting an Issue

To report bugs/issues/features requests, please file an [issue](https://github.com/bcgov/nr-permitconnect-navigator-service/issues).

## How to Contribute

If you would like to contribute, please see our [contributing](CONTRIBUTING.md) guidelines.

Please note that this project is released with a [Contributor Code of Conduct](CODE-OF-CONDUCT.md). By participating in this project you agree to abide by its terms.

## License

```txt
Copyright 2023 Province of British Columbia

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
