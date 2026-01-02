---
title: Authenticating Azure users with Hashicorp Vault
description: 
pubDate: 2018-07-25
tags: [hashicorp, vault, azure]
---
Hashicorp [released Vault 0.10.4](https://groups.google.com/forum/#!topic/hashicorp-announce/icgKzpswe-s) yesterday and one of the new features is a [plugin to support JWT/OIDC](https://www.vaultproject.io/docs/auth/jwt.html) as an auth method. Azure has an OIDC endpoint that you can use to authenticate against and if you are logged in with the Azure CLI tools you can easily get an access token with `az account get-access-token`. Here's how to get it working.

<!--more-->

First thing is to ensure you are running vault 0.10.4. Then enable the jwt auth method.

```sh
$ vault auth enable jwt
Success! Enabled jwt auth method at: jwt/
```

Then configure the JWT endpoint. Be sure to replace `{tenant_id}` with your Azure tenant ID.

```sh
$ vault write auth/jwt/config oidc_discovery_url='https://sts.windows.net/{tenant_id}/'
Success! Data written to: auth/jwt/config
```

Configure a role to log in as. The "audience" is dictated by what is provided by the Azure CLI. The "upn" claim is used by Vault to calculate an identity and Microsoft claim [it stores the User Principal Name](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-token-and-claims) of the authenticating user.

```sh
$ vault write auth/jwt/role/test-role policies='dev' bound_audiences='https://management.core.windows.net/' user_claim='upn'
Success! Data written to: auth/jwt/role/test-role
```

And that's it! In this example below, I get a vault token using the role created above and extract the token from the Azure CLI's output using [jq](https://stedolan.github.io/jq/).

```sh
$ vault write auth/jwt/login role=test-role jwt="$(az account get-access-token -o json | jq -r .accessToken)"
Key                  Value
---                  -----
token                4fa15547-ae06-ea74-5189-7eff73a06a0c
token_accessor       b7a01c99-3067-cd01-0bc7-cbee75b2aab5
token_duration       768h
token_renewable      true
token_policies       ["default" "dev"]
identity_policies    []
policies             ["default" "dev"]
token_meta_role      test-role
```