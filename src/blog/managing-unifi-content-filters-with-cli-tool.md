---
slug: "managing-unifi-content-filters-with-cli-tool"
title: "Managing Unifi Content Filters with sync_unifi_filters - A CLI Tool for DNS Blocklists"
description: "A Python CLI tool for managing Unifi Network Controller DNS blocklists without the web UI. Treat content filters like code - fetch, edit, version control, and sync them back."
date: 2026-01-02
author: "Andrew Beresford"
tags: ["unifi", "network", "python", "dns"]
featured: true
editable: false
---

If you're managing Unifi content filtering rules, you've probably run into the same frustration I did: **the web UI is painful for managing blocklists**. While you can paste in multiple domains, there's no way to export your lists, no version control, and no way to automate updates.

<!--more-->

After getting tired of clicking through the interface every time I needed to update my Samsung TV adblock filter, I built **sync_unifi_filters** - a Python CLI tool that treats content filters like configuration files.

## The Problem

Unifi's content filtering feature is great in concept. You can create named filters and block specific domains network-wide. The UI does support pasting multiple domains at once, but the workflow has serious limitations:

- No export functionality - can't get your lists back out
- No way to see what's changed over time
- Can't use standard text processing tools (grep, diff, etc.)
- Difficult to share blocklists with others
- No automation or scripting capabilities
- Manual copy-paste workflow doesn't scale

When you're maintaining a blocklist with 50+ domains (like I do for Samsung TVs) that needs regular updates, this becomes unbearable.

## The Solution

`sync_unifi_filters` is a simple Python CLI that uses Unifi's APIs to:

- **Fetch** blocklists from your controller to plain text files
- **Sync** text files back to the controller in bulk
- Work with standard Unix tools (grep, diff, git, etc.)
- Enable version control for your filters
- Allow automation via scripts

It follows the Unix philosophy: do one thing well, output to stdout by default, and compose with other tools.

**[Get the tool on GitHub →](https://github.com/beezly/sync_unifi_filters)**

## Basic Usage

Fetch a filter to stdout:

```bash
./sync_unifi_filters.py fetch "Samsung Adblock"
```

Or save it to a file:

```bash
./sync_unifi_filters.py fetch "Samsung Adblock" -o samsung_filters.txt
```

Edit the file with your favorite editor, then sync it back:

```bash
./sync_unifi_filters.py sync "Samsung Adblock" samsung_filters.txt
```

That's it. What used to take 20 minutes of UI clicking now takes 2 seconds.

## Real-World Example: Samsung TV Ad Blocking

Modern Samsung TVs are constantly phoning home - serving ads, collecting telemetry, and generally being nosy. I maintain a blocklist of 71 Samsung domains that gets rid of the ads and tracking.

With this tool, my workflow is:

1. Keep `samsung_filters.txt` in a git repository
2. When Samsung adds new ad servers, edit the file
3. Run `./sync_unifi_filters.py sync "Samsung Adblock" samsung_filters.txt`
4. Commit and push to git

The repository includes this Samsung blocklist as a starting point for anyone with the same problem.

## Other Use Cases

This tool isn't just for Samsung TVs. You can use it for:

- **IoT device telemetry blocking** - Stop smart devices from phoning home
- **Malware/phishing protection** - Import blocklists from threat intelligence feeds
- **Parental controls** - Manage allowed/blocked domains for kids' devices
- **Corporate filtering** - Maintain consistent filtering across multiple sites
- **Network-wide ad blocking** - Alternative to Pi-hole for Unifi users

## Why Not Just Use Pi-hole?

Pi-hole is excellent, but requires a separate device or VM. If you already have Unifi gear, this approach:

- Leverages existing infrastructure
- Integrates with Unifi's per-network filtering
- Requires no additional hardware or VMs
- Works with Unifi's client groups and schedules
- Manages filters alongside your network configuration

## Version Control Your Blocklists

One of the best features is the ability to treat your filters like code:

```bash
# Initialize git repo
git init blocklists
cd blocklists

# Fetch current filters
../sync_unifi_filters.py fetch "Samsung Adblock" -o samsung.txt
../sync_unifi_filters.py fetch "IoT Telemetry" -o iot.txt

# Track changes
git add *.txt
git commit -m "Initial blocklists"

# Make changes, see diffs
vim samsung.txt
git diff samsung.txt

# Sync and commit
../sync_unifi_filters.py sync "Samsung Adblock" samsung.txt
git commit -am "Block new Samsung ad domains"
```

Now you have full history of what changed, when, and why.

## Technical Details

The tool uses **undocumented Unifi APIs**. I reverse-engineered the endpoints by watching the web UI's network traffic:

- `GET /proxy/network/v2/api/site/{site}/content-filtering` - List filters
- `PUT /proxy/network/v2/api/site/{site}/content-filtering/{id}` - Update filter

These aren't in the official API documentation, which means they could potentially change with controller updates. In practice, they've been stable, but it's worth noting.

### Requirements

- Python 3.6 or newer
- Unifi Network Controller with content filtering enabled
- Admin credentials for the controller

No Unifi subscription required - works with the basic content filtering feature.

### Security Considerations

- Store credentials in environment variables, not in scripts
- Consider using a dedicated admin account for automation
- The tool doesn't store or log credentials
- Credentials are only used for API authentication during execution

### Installation

```bash
git clone https://github.com/beezly/sync_unifi_filters.git
cd sync_unifi_filters
chmod +x sync_unifi_filters.py
```

Set environment variables for your controller:

```bash
export UNIFI_HOST="https://your-controller:8443"
export UNIFI_USERNAME="admin"
export UNIFI_PASSWORD="your-password"
export UNIFI_SITE="default"  # Optional
```

Or pass them as command-line arguments.

## Advanced Usage

### Pipe to grep to search for domains

```bash
./sync_unifi_filters.py fetch "Samsung Adblock" | grep analytics
```

### Combine multiple lists

```bash
cat base_blocklist.txt additional_domains.txt | sort -u > combined.txt
./sync_unifi_filters.py sync "My Filter" combined.txt
```

### Automate with cron

Update filters daily from a git repository:

```bash
#!/bin/bash
cd /opt/blocklists
git pull
./sync_unifi_filters.py sync "Malware" malware_domains.txt
./sync_unifi_filters.py sync "Ads" ad_domains.txt
```

## Limitations

There are a few things the tool can't do (yet):

1. **Cannot create new filters** - They must exist in the UI first
2. **No format validation** - Accepts any string as a domain (controller validates)
3. **No dry-run mode** - Can't preview changes before applying
4. **Case-sensitive filter names** - Must match exactly

Most of these would be good candidates for future enhancements.

## License

MIT licensed - use it freely for personal or commercial projects.

## Get the Code

The tool is available on GitHub: [beezly/sync_unifi_filters](https://github.com/beezly/sync_unifi_filters)

If you're managing Unifi content filters, give it a try. It's made my network management workflow significantly better, and I hope it helps you too.

If you've got suggestions for improvements, have found useful blocklists to share, or run into issues, feel free to open an issue or pull request on GitHub.
