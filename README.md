# stock-price-checker
Stock price checking Node.js application

## First steps
* For the installation and application execution, any `Node.js` version of the **20th**
release line (current LTS) and `pnpm` (preferably version `9.12.0`) is necessary. After having these in place, install the dependencies.
* Create a `.env.development` and a `.env.production` files from the included `.env.template`, fill the
the configuration data.

*Note*
* Containerization is also available, which is preconfigured to create a `production` build of the application,
and after startup, will expose the running server on port `8081`.

## Important commands
* `build:prd`: Creates a production build.
* `build:prd:checked`: Creates a production build with typechecking included.
* `dev`: Transpiles the source code with `tsx`, starts the application in development mode with file watching activated.
In development mode, logs are shown in a prettified fashion.
* `start:prd`: Starts the application in production mode.
* `format`: Executes `biome`'s format only checking.
* `lint`: Executes `biome`'s complete checking (format, lint) but not fixes any files
out-of-the box.
* `lint:fix`: Same as `lint` with the addition of automatically rewriting the affected files
in case of linting / formatting error fixing.

## OpenAPI documentation
* It is available under the `/api-docs` route.
