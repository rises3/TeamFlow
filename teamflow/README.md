# Teamflow

## Telepítés, build és tesztek

Az alkalmazás parancsait ebből a `teamflow` könyvtárból kell futtatni. Tiszta
klónozás után Node.js és npm használatával:

```bash
npm ci
npm run build
npm test -- --watch=false
```

Windows PowerShellben, a scriptek futtatását nem engedi a rendszer, így vagy npm.cmd commandot kell használnunk, vagy pedig cmd terminalt.

Az automatikus tesztek a HTTP-hívásokat `HttpTestingController` segítségével
ellenőrzik, ezért a tesztfuttatáshoz nem kell elindítani az API-t. A
feladatkeresés, a validáció és az útvonalak is szerepelnek a tesztekben.

## Feladatok API-ja

A feladatok betöltéséhez és mentéséhez a külön JSON-szervert is el kell
indítani egy másik terminálban:

```bash
cd api
npm ci
npm start
```

Ezután a `teamflow` könyvtárban futtasd az `npm start` parancsot. A feladatok
az API `db.json` fájljában tárolódnak, és frissítés után is megmaradnak.
A többi képernyő adatai, illetve a hozzászólások, az ellenőrzőlista és az
időbejegyzések továbbra is memóriabeli mintaadatok. A dashboard és a
projektrészletek feladatlistái is külön mintaadatokat jelenítenek meg.

Ha a kiszolgáló nem érhető el, a feladatoldalon az **Újrapróbálás** gomb újra
elküldi a betöltési kérést. Az `npm run reset` parancs az `api` könyvtárban
felülírja a `db.json` fájlt a kezdőadatokkal, ezért törli az ottani módosításokat.


This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.8.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
