---
slug: "building-a-development-cas-environment-with-casinoapp-and-casino-test_authenticator"
title: "Building a development CAS environment with CASinoApp and casino-test_authenticator"
description: "A quick guide to setting up a development CAS authentication server using CASinoApp and the casino-test_authenticator gem, allowing easy testing without managing test accounts"
date: 2014-05-15
author: "Andrew Beresford"
tags: ["cas", "ruby", "development"]
featured: false
editable: false
---
Sometimes it's useful to be able to run a development CAS instance which allows you to
authenticate test users easily without createing lots of test accounts. I wrote
[casino-test_authenticator](http://github.com/beezly/casino-test-authenticator) for exactly this purpose and you can get it running 2-3 minutes with [Casino](http://casino.rbcas.com/)

<!--more-->

First get a copy of CASinoApp

    git clone https://github.com/rbCAS/CASinoApp.git
    cd CASinoApp

Add the following to CasinoApp's Gemfile

    gem 'casino-test_authenticator'

Then configure config/cas.yml to include the test authenticator in the development environment

```yaml
development:
  frontend:
    sso_name: 'CASino'
    footer_text: 'Powered by <a href="http://rbcas.com/">CASino</a>'
  authenticators:
    test_authenticator:
      authenticator: "Test"
      options:
```

And configure the database in config/database.yml

```yaml
development:
  adapter: sqlite3
  database: db/development.sqlite3
  pool: 5
  timeout: 5000
```

Get all the prerequisites installed

    bundle

Load the database

    bundle exec rake db:schema:load

And run the application

    rails s

Or use -p <port number> to run it on a different port (the default is 3000)

    rails s -p 9999

You should be able to access http://localhost:3000/ and log in when username==password
