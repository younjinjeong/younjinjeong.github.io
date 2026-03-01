---
title: "MicroFoundry: Reinventing the PaaS for the Kubernetes Era"
url: "/2026/03/microfoundry/"
date: 2026-03-01T10:00:00+09:00
draft: false
comments: true
authors:
  - younjinjeong
tags: [kubernetes, paas, cloudfoundry, go, platform-engineering, mcp, ai]
categories: [Tech]
layout: "post"
translations:
  ko: "/2026/03/microfoundry-ko/"
---

*How a human-AI collaboration built a lightweight CloudFoundry alternative — and why it matters for the future of web application management*

---

There is a quiet crisis in the world of web application deployment.

On one side, you have the old guard: platforms like CloudFoundry that once promised "here is your code, we will run it." They delivered on that promise — beautifully — but at a staggering operational cost. Twenty or more virtual machines, a dedicated orchestration layer called BOSH, a proprietary container runtime named Diego, a custom router, a custom auth system, and a team of platform engineers just to keep the lights on. For enterprises that could afford it, the developer experience was magical. For everyone else, it was a wall.

On the other side, you have Kubernetes. Raw, powerful, infinitely flexible — and infinitely complex. Kubernetes solved the infrastructure problem but created an experience problem. Developers who once typed `cf push` and went to lunch now find themselves writing YAML manifests, debugging Ingress controllers, configuring Prometheus scrape targets, and wondering why their pod is stuck in `CrashLoopBackOff`. The infrastructure democratized, but the experience regressed.

MicroFoundry exists in the space between these two worlds. It asks a simple question: **what if we could keep the developer experience of CloudFoundry, but run it on the infrastructure everyone already has?**

## The Problem We Set Out to Solve

The journey began with a firsthand observation. Having spent years working with CloudFoundry — both as a user and as someone who helped organizations adopt cloud platforms — one pattern kept repeating:

Teams loved `cf push`. They loved service binding. They loved that logging just worked. But they could not justify 40 to 80 VMs to run the platform itself. When management asked "can we do this on Kubernetes instead?" the answer was always "yes, but you will lose the experience."

This is the core tension. Kubernetes gives you everything, but asks you to assemble it yourself. CloudFoundry assembles it for you, but demands an enormous footprint to do so. There was no middle ground.

We also observed a second problem that rarely gets discussed: **observability requires intent**. In most Kubernetes setups, if you want metrics, you have to instrument your code. If you want distributed tracing, you have to add libraries. If you want dashboards, you have to configure Grafana. Every layer of visibility requires a corresponding layer of effort. For a single application, this is manageable. For a platform team managing dozens of services, it becomes a full-time job.

## What MicroFoundry Actually Is

MicroFoundry is a single Go binary — roughly 15 megabytes — that turns any Kubernetes cluster into a developer-friendly PaaS. It runs on Docker Desktop, Amazon EKS, Google GKE, Azure AKS, or any conformant Kubernetes distribution. The entire platform is one process.

When you type `mf push hello-world`, the following happens in sequence:

1. MicroFoundry detects whether your project has a Dockerfile or should use Cloud Native Buildpacks.
2. It builds a container image and pushes it to your configured registry.
3. It creates (or updates) a Kubernetes Deployment, Service, and Ingress.
4. It configures routing so your application is accessible at a human-readable URL.
5. It begins collecting metrics automatically via eBPF — no code changes required.

That last point deserves emphasis. MicroFoundry integrates Grafana Beyla, an eBPF-based auto-instrumentation tool that observes your application's HTTP traffic at the kernel level. The moment your application starts receiving requests, you get rate, error, and duration metrics. No SDK. No sidecar. No code changes. This is inspired by the Netflix Atlas approach to metrics — observe everything by default, ask questions later.

## How It Solves Old Problems in New Ways

Let me walk through the specific design decisions and why they matter.

### Kubernetes as the Database

One of the most surprising decisions in MicroFoundry is that it has no external database. There is no PostgreSQL. There is no etcd instance beyond what Kubernetes itself provides. All state — application metadata, service bindings, platform settings, secrets — lives in Kubernetes objects: Deployments, ConfigMaps, and Secrets.

This sounds radical, but it is actually the natural conclusion of a simple principle: if your platform runs on Kubernetes, why maintain a separate source of truth? The Kubernetes API server already provides strongly consistent reads, watch-based notifications, RBAC, and audit logging. MicroFoundry simply uses what is already there.

The practical consequence is profound. If MicroFoundry itself goes down, your applications keep running. There is no database to back up, no state to migrate, no split-brain scenario to worry about. The platform is genuinely stateless.

### 56 Backing Services, One Interface

CloudFoundry's marketplace was one of its most powerful features — a unified catalog of databases, message queues, and storage that developers could provision with a single command. MicroFoundry reproduces this with 56 services across four providers: 10 local Kubernetes services, 21 AWS services, 12 GCP services, and 13 Azure services.

Each service supports three plans (small, medium, large) and follows the same lifecycle:

```bash
mf create-service postgresql small my-db
mf bind-service hello-world my-db
```

After binding, your application receives credentials through the `VCAP_SERVICES` environment variable — the same pattern CloudFoundry developers have relied on for years. Local services are provisioned as Kubernetes StatefulSets. Cloud services are provisioned through Terraform templates.

The important insight here is that **the abstraction layer is the value**. Developers should not need to know whether their PostgreSQL is running in a Kubernetes pod or in Amazon RDS. The binding interface should be identical. MicroFoundry achieves this by separating the catalog (what services exist) from the provisioner (how they are created) from the binder (how credentials are delivered to applications).

### Server-Rendered UI Without the Complexity

The admin dashboard is built with Go templates, HTMX, and Tailwind CSS served via CDN. There is no JavaScript build step. No webpack. No npm. No node_modules.

This is a deliberate architectural choice. The dashboard provides 48 HTML templates covering application lifecycle, service catalog, multi-cluster management, observability, secrets, IAM with five-tier RBAC, and platform configuration. It is a complete operations interface, and it ships inside the same binary as everything else.

The use of HTMX is particularly noteworthy. HTMX allows the dashboard to provide dynamic, SPA-like interactions — partial page updates, real-time log streaming via SSE, inline editing — without a client-side JavaScript framework. Every interaction is a standard HTTP request that returns an HTML fragment. The server remains the source of truth, and the client is thin.

For a platform tool, this is exactly the right trade-off. Platform dashboards do not need the interactivity of a consumer application. They need reliability, speed, and the ability to work in restricted environments where complex JavaScript bundles may be blocked by security policies.

### Identity Without the Headache

Authentication and authorization in MicroFoundry are handled by Keycloak (OIDC), Open Policy Agent (OPA with Rego policies), and SCIM v2. But what makes this interesting is the OIDC federation layer.

MicroFoundry can broker temporary credentials for AWS, GCP, and Azure through Keycloak. When a developer needs to provision an AWS RDS instance, MicroFoundry does not store AWS access keys. Instead, it uses Keycloak as an OIDC identity provider to obtain temporary STS tokens through federation. The same pattern applies to GCP Workload Identity Federation and Azure Federated Identity Credentials.

This means no static cloud credentials are stored in the platform. Every cloud operation uses short-lived, scoped tokens obtained through standards-based federation. For organizations with strict security requirements, this is not just a nice-to-have — it is a prerequisite.

## Why This Approach Matters for Web Applications

There is a broader argument here that goes beyond MicroFoundry itself.

Most web applications follow a predictable pattern: they need a runtime, a database, a way to handle HTTP traffic, a way to see what is happening, and a way to control who can do what. These five concerns — compute, data, networking, observability, and identity — are universal. And yet, on Kubernetes, each one requires a separate tool, a separate configuration, and a separate mental model.

The PaaS approach — where a platform provides opinionated defaults for all five concerns — is not a relic of the pre-Kubernetes era. It is a recognition that **most applications are not special**. They do not need custom Ingress controllers or hand-tuned Prometheus configurations. They need sane defaults that work out of the box, with the ability to customize when necessary.

MicroFoundry embodies this philosophy. It is opinionated where opinions help (Beyla for metrics, Loki for logs, Keycloak for auth) and flexible where flexibility matters (pluggable gateway supporting nginx, Kong, Traefik, or AWS API Gateway; multi-cluster support; configurable service catalog visibility).

The result is that a single developer can set up a production-grade application platform in minutes, not weeks. And a platform team can manage it without dedicating three engineers to the care and feeding of the platform itself.

## The AI Dimension: How MicroFoundry Was Built

MicroFoundry was not just built *for* AI integration — it was built *with* AI.

The entire codebase was developed through a structured human-AI pair programming workflow using Claude Code. Each feature went through a seven-agent review process: Security Architect, Platform Engineer, API Designer, Frontend Engineer, DevOps Engineer, QA Engineer, and Product Manager. The human (the project creator) provided the vision, made architectural decisions, and validated the results. The AI handled the implementation, wrote tests, and performed code reviews.

This workflow produced 28 merged epics, over 18,000 lines of Go code, 48 HTML templates, a comprehensive OpenAPI specification with more than 50 endpoints, and 82 end-to-end test cases — all in a matter of weeks rather than months.

The lesson here is not that AI replaced the developer. It is that AI amplified a single developer's ability to build something that would normally require a team. The human brought domain expertise (years of experience with CloudFoundry and Kubernetes platforms), taste (knowing which abstractions matter and which are unnecessary), and judgment (deciding when to follow convention and when to innovate). The AI brought speed, consistency, and the ability to hold the entire codebase in context simultaneously.

## The MCP Future: AI as a First-Class Platform Citizen

Perhaps the most forward-looking aspect of MicroFoundry is its MCP (Model Context Protocol) server design. MCP is a protocol that allows AI tools — Claude, Cursor, and other AI-powered development environments — to interact with external systems through a standardized interface.

MicroFoundry's MCP server exposes nine tools: `mf_push`, `mf_apps`, `mf_logs`, `mf_scale`, `mf_delete`, `mf_create_service`, `mf_bind_service`, `mf_routes`, and `mf_env`. Through these tools, an AI assistant can deploy applications, check their status, read logs, scale instances, provision databases, and manage environment variables — all through natural language conversation.

Imagine this workflow:

> "Deploy the latest version of our API service, scale it to three instances, bind it to the production PostgreSQL database, and show me the error rate from the last hour."

With MCP integration, this is a single conversation turn. The AI understands the intent, translates it into the appropriate sequence of platform operations, executes them, and reports the results — including pulling real-time metrics.

This is not science fiction. It is the natural extension of what happens when you design a platform with a clean API and a protocol that AI tools can speak natively. The MCP integration transforms MicroFoundry from a tool you operate into a platform you converse with.

The implications extend beyond convenience. When AI can manage platform operations, it becomes possible to implement intelligent automation: auto-scaling based on natural language policies ("keep the error rate below 1% and latency under 200ms"), anomaly detection that triggers human-readable alerts, and deployment strategies that adapt to observed behavior. The platform becomes a partner in operations, not just a substrate.

## Where We Are and Where We're Going

MicroFoundry is at version 0.2.0 as of this writing. The core platform — CLI, admin dashboard, service catalog, multi-cluster management, observability, and IAM — is functional and tested. There are areas where the design concept extends beyond the current implementation:

The MCP server is designed and documented but awaits its dedicated implementation phase. Auto-scaling through Kubernetes HPA integration is a natural next step. Cloud service provisioning currently generates Terraform templates but does not yet execute the full lifecycle automatically. And while the platform supports multi-cluster management through a single control plane, cross-cluster service mesh capabilities remain a future goal.

These are not gaps in vision — they are the natural roadmap of a project that prioritizes working software over comprehensive paper designs. Each feature that exists today has been implemented, tested, and validated against real Kubernetes clusters.

## Closing Thoughts

MicroFoundry started with a belief: that the developer experience of CloudFoundry was too valuable to lose, and that the infrastructure of Kubernetes was too powerful to ignore. The result is something that feels familiar to CloudFoundry veterans and accessible to Kubernetes newcomers — a platform that reduces a thousand decisions into sensible defaults while preserving the escape hatches that experienced operators need.

It is also an artifact of a new way of building software. The human-AI collaboration that produced MicroFoundry is itself a proof of concept — a demonstration that domain expertise combined with AI-assisted development can produce production-quality systems at a pace that was previously impossible.

If you are running web applications on Kubernetes and wish you had a simpler way to manage them, MicroFoundry might be what you have been looking for. And if you are curious about what happens when you give an experienced platform engineer an AI pair programmer with infinite patience, the codebase tells that story too.

---

*MicroFoundry is open source under the MIT license. You can find it at [github.com/younjinjeong/microfoundry](https://github.com/younjinjeong/microfoundry).*
