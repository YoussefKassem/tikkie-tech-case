# Person Service

Kleine serverless microservice in TypeScript voor het aanmaken van personen.
De service is opgezet volgens DDD-principes, met een duidelijke scheiding tussen domain, application, infrastructure en API.

## Doel

Deze service:

- accepteert `POST /person`
- valideert de input
- slaat een `Person` op in DynamoDB
- publiceert een `PersonCreated` event naar EventBridge

## Tech Stack

- TypeScript
- Node.js 20
- AWS CDK
- AWS Lambda
- API Gateway
- DynamoDB
- EventBridge
- Vitest
- Zod

## Architectuur

De codebase volgt een eenvoudige ports-and-adapters structuur:

- `src/domain`: domeinmodellen, value objects, repository- en event-interfaces
- `src/application`: use cases
- `src/api`: Lambda handler en request logging
- `src/infrastructure`: AWS-adapters voor DynamoDB en EventBridge
- `infrastructure`: CDK stack

## Belangrijkste bestanden

- [bin/app.ts](/Users/youssefkassem/Documents/development/tikkie-tech-case/bin/app.ts)
- [infrastructure/person-service-stack.ts](/Users/youssefkassem/Documents/development/tikkie-tech-case/infrastructure/person-service-stack.ts)
- [src/api/create-person-handler.ts](/Users/youssefkassem/Documents/development/tikkie-tech-case/src/api/create-person-handler.ts)
- [src/application/create-person.ts](/Users/youssefkassem/Documents/development/tikkie-tech-case/src/application/create-person.ts)
- [src/domain/model/person.ts](/Users/youssefkassem/Documents/development/tikkie-tech-case/src/domain/model/person.ts)

## Lokaal valideren

Installeer dependencies:

```bash
npm install
```

Voer kwaliteitschecks uit:

```bash
npm run lint
npm run build
npm run test
```

## Deploy naar AWS

Voorwaarden:

- AWS account
- AWS CLI geconfigureerd
- CDK bootstrap uitgevoerd in de target account/region

Synthese:

```bash
npm run synth
```

Deploy:

```bash
npm run deploy -- --context environment=dev
```

Destroy:

```bash
npx cdk destroy --context environment=dev
```

## Endpoint testen

Na deploy geeft CDK een `ApiUrl` output terug.
Voorbeeld request:

```bash
curl -X POST "$API_URL/person" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+31612345678",
    "address": {
      "street": "Keizersgracht 123",
      "city": "Amsterdam",
      "postalCode": "1015 CJ",
      "country": "NL"
    }
  }'
```

## Tests

De testset focust op:

- domeinvalidatie
- use case gedrag
- handler gedrag
- request logging

Alle tests draaien met:

```bash
npm run test
```

## API Documentatie

De volledige API specificatie staat in [`docs/openapi.yaml`](docs/openapi.yaml) (OpenAPI 3.0).

## Trade-off: Event publicatie is niet atomair

### Probleem

De huidige implementatie voert twee stappen sequentieel uit:

```
1. personRepository.save(person)     ← schrijf naar DynamoDB
2. eventPublisher.publish(event)     ← publiceer naar EventBridge
```

Als stap 1 slaagt maar stap 2 faalt (bijv. door een netwerk timeout of EventBridge outage), is het persoon wel opgeslagen maar wordt het `PersonCreated` event nooit gepubliceerd. Downstream services die afhankelijk zijn van dit event zullen de nieuwe persoon niet kennen. Dit doorbreekt de eventual consistency garantie van het systeem.

### Waarom dit een bewuste keuze is

Voor de scope van deze tech case is gekozen voor eenvoud. De kans dat DynamoDB slaagt en EventBridge direct daarna faalt is klein, en de complexiteit van een volledige oplossing weegt niet op tegen het risico in een demonstratie-context.


## Opmerkingen

- Dit is bewust een kleine service met een smalle scope.
- De nadruk ligt op leesbaarheid, scheiding van verantwoordelijkheden en testbaarheid.
- De infrastructuur gebruikt omgevingsprefixes zoals `dev`.
