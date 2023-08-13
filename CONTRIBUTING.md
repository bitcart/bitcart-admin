# Contributing to Bitcart Admin Panel

Welcome, and thank you for your interest in contributing to Bitcart Admin Panel!

Our [central contributing guidelines](https://github.com/bitcart/bitcart/blob/master/CONTRIBUTING.md) apply to all Bitcart repositories.

Below are the instructions for setting up development environment with Bitcart Admin Panel.

## Setting up development environment

Some general advice can be found in our [central contributing guidelines](https://github.com/bitcart/bitcart/blob/master/CONTRIBUTING.md#setting-up-development-environment).

Installation instructions:

```bash
git clone https://github.com/<<<your-github-account>>>/bitcart-admin.git
cd bitcart-admin
yarn
```

To launch:

```bash
# serve with hot reload at localhost:3000
yarn dev

# build for production and launch server
yarn build
yarn start
```

From now on, development environment is ready.

**Note**: we use pre-commit hooks for development, you can install pre-commit and it's hooks like so:

```bash
curl https://pre-commit.com/install-local.py | python3 -
pre-commit install
```

## Merchants API

In order to develop the admin panel you need our [Merchants API](https://github.com/bitcart/bitcart) instance running.

There are two possible ways:

1. Use our demo (recommended for quick setup to try it out or small fixes, won't work when adding new features with api changes)

```bash
export BITCART_ADMIN_API_URL=https://api.bitcart.ai
yarn dev
```

2. Run merchants API locally (recommended to not depend on demo api, when adding new api features and for faster local development in the future). See [this guide](https://github.com/bitcart/bitcart/blob/master/CONTRIBUTING.md#setting-up-python-development-environment)

Make sure to follow [our coding guidelines](https://github.com/bitcart/bitcart/blob/master/CODING_STANDARDS.md) when developing.

# Thank You!

Your contributions to open source, large or small, make great projects like this possible. Thank you for taking the time to contribute.
