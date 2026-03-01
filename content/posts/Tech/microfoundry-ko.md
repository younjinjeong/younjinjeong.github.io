---
title: "MicroFoundry: Kubernetes 시대를 위한 PaaS의 재발명"
url: "/2026/03/microfoundry-ko/"
date: 2026-03-01T10:00:00+09:00
draft: false
comments: true
authors:
  - younjinjeong
tags: [kubernetes, paas, cloudfoundry, go, platform-engineering, mcp, ai]
categories: [Tech]
layout: "post"
content_lang: ko
translations:
  en: "/2026/03/microfoundry/"
---

*Human-AI 협업으로 만든 경량 CloudFoundry 대안 — Web Application 관리의 미래는 어떤 모습이어야 하는가*

---

Web Application 배포 분야에는 오래된 딜레마가 하나 있습니다.

CloudFoundry 같은 전통적인 PaaS는 개발자에게 정말 편한 경험을 선사했습니다. 코드만 넘기면 플랫폼이 알아서 빌드하고, 배포하고, 라우팅까지 잡아줬으니까요. 문제는 그 편리함을 뒷받침하는 데 드는 비용이었습니다. VM 20대 이상, BOSH라는 전용 오케스트레이션, Diego라는 독자 컨테이너 런타임, 전용 라우터, 전용 인증 시스템 — 여기에 이 모든 걸 운영할 플랫폼 엔지니어 팀까지. 이만한 투자를 감당할 수 있는 기업에게 개발자 경험은 환상적이었지만, 그 외의 조직에게는 그림의 떡이었습니다.

반대편에는 Kubernetes가 있습니다. 인프라 추상화의 표준이 되었고, 확장성과 유연성 면에서는 타의 추종을 불허합니다. 하지만 개발자 경험은 오히려 뒷걸음질 쳤습니다. 예전에는 `cf push` 한 번이면 끝났던 일이, 이제는 YAML 매니페스트 작성, Ingress 컨트롤러 디버깅, Prometheus 스크레이프 타겟 설정, `CrashLoopBackOff` 원인 추적으로 바뀌었습니다. 인프라는 누구나 쓸 수 있게 되었지만, 쓰기가 쉬워진 건 아닙니다.

MicroFoundry는 바로 이 간극에서 출발합니다. **CloudFoundry의 개발자 경험을 살리면서, 이미 모두가 갖고 있는 Kubernetes 위에서 돌릴 수는 없을까?**

## 풀고 싶었던 문제

수년간 CloudFoundry를 직접 사용하고, 여러 조직의 클라우드 플랫폼 도입을 도우면서 같은 패턴을 반복적으로 목격했습니다.

개발팀은 `cf push`를 좋아했습니다. Service Binding을 좋아했고, 로깅이 별도 설정 없이 바로 되는 것을 좋아했습니다. 하지만 플랫폼 하나 띄우는 데 VM 40~80대가 필요하다는 건 경영진을 설득하기 어려운 구조였습니다. "Kubernetes에서 같은 걸 할 수 있나요?"라는 질문에 대한 답은 항상 같았습니다. "할 수는 있는데, 그 편한 경험은 포기해야 합니다."

딜레마의 본질은 이겁니다. Kubernetes는 모든 부품을 제공하지만 조립은 직접 해야 합니다. CloudFoundry는 조립된 완성품을 주지만 운영 부담이 큽니다. 그 사이에 적당한 선택지가 없었습니다.

잘 드러나지 않는 또 다른 문제도 있었습니다. **Observability는 저절로 생기지 않는다**는 점입니다. 대부분의 Kubernetes 환경에서 메트릭이 필요하면 코드에 계측을 넣어야 하고, 분산 추적을 원하면 라이브러리를 붙여야 하고, 대시보드를 보려면 Grafana를 따로 설정해야 합니다. 시스템을 들여다보기 위한 모든 단계마다 그에 상응하는 설정 작업이 따라붙습니다. 애플리케이션 하나라면 어렵지 않지만, 수십 개의 서비스를 관리하는 팀에게는 그 자체가 하나의 업무가 됩니다.

## MicroFoundry가 하는 일

MicroFoundry는 약 15MB짜리 Go 바이너리 하나입니다. 이걸 아무 Kubernetes 클러스터에 올리면, 그 클러스터가 개발자 친화적인 PaaS로 바뀝니다. Docker Desktop이든 Amazon EKS든, Google GKE든, Azure AKS든 상관없습니다. 플랫폼 전체가 프로세스 하나입니다.

`mf push hello-world`를 실행하면 이런 일이 벌어집니다:

1. 프로젝트에 Dockerfile이 있으면 그걸 쓰고, 없으면 Cloud Native Buildpacks로 빌드합니다.
2. 컨테이너 이미지를 만들어 설정된 레지스트리에 올립니다.
3. Kubernetes Deployment, Service, Ingress를 자동으로 생성하거나 업데이트합니다.
4. 읽기 쉬운 URL로 바로 접근할 수 있도록 라우팅을 잡아줍니다.
5. eBPF 기반으로 메트릭 수집이 자동 시작됩니다 — 코드를 한 줄도 고칠 필요 없이.

다섯 번째 항목이 특히 중요합니다. MicroFoundry는 Grafana Beyla를 내장하고 있는데, Beyla는 eBPF를 활용해 커널 수준에서 애플리케이션의 HTTP 트래픽을 관찰하는 자동 계측 도구입니다. 애플리케이션이 요청을 받기 시작하는 순간부터 Rate, Error, Duration(RED) 메트릭이 쌓입니다. SDK도, 사이드카도, 코드 수정도 필요 없습니다. Netflix가 Atlas에서 추구했던 철학 — 일단 모든 것을 관찰하고, 질문은 나중에 하자 — 과 같은 접근입니다.

## 설계 철학: 오래된 문제에 대한 새로운 답

각 설계 결정의 배경과 그 의미를 짚어보겠습니다.

### Kubernetes 자체가 데이터베이스

MicroFoundry에서 가장 파격적인 결정은 외부 데이터베이스를 두지 않았다는 점입니다. PostgreSQL도 없고, Kubernetes가 기본 제공하는 것 외에 별도 etcd도 없습니다. 애플리케이션 메타데이터, 서비스 바인딩, 플랫폼 설정, 시크릿 — 모든 상태가 Kubernetes 오브젝트(Deployment, ConfigMap, Secret)에 담깁니다.

얼핏 급진적으로 들리지만, 따져보면 당연한 귀결입니다. 플랫폼이 Kubernetes 위에서 돌아간다면, 왜 별도의 데이터 저장소를 또 운영해야 할까요? Kubernetes API 서버는 이미 강한 일관성, Watch 기반 이벤트 알림, RBAC, 감사 로깅을 갖추고 있습니다. MicroFoundry는 이미 있는 것을 그대로 활용할 뿐입니다.

이 결정이 가져오는 실질적인 이점은 큽니다. MicroFoundry 프로세스가 죽더라도 배포된 애플리케이션은 멀쩡히 돌아갑니다. 백업할 데이터베이스도, 마이그레이션할 상태도, Split-brain을 걱정할 이유도 없습니다. 플랫폼 자체가 Stateless입니다.

### 56개 백킹 서비스, 단일 인터페이스

CloudFoundry의 마켓플레이스는 핵심 강점 중 하나였습니다. 명령어 하나로 데이터베이스, 메시지 큐, 스토리지를 프로비저닝할 수 있는 통합 카탈로그 말입니다. MicroFoundry는 이것을 4개 클라우드 프로바이더에 걸친 56개 서비스로 재현합니다: 로컬 Kubernetes 10개, AWS 21개, GCP 12개, Azure 13개.

각 서비스마다 세 가지 플랜(small, medium, large)을 지원하고, 사용법은 모두 동일합니다:

```bash
mf create-service postgresql small my-db
mf bind-service hello-world my-db
```

바인딩이 끝나면 애플리케이션은 `VCAP_SERVICES` 환경 변수로 접속 정보를 받습니다 — CloudFoundry에서 수년간 검증된 패턴 그대로입니다. 로컬 서비스는 Kubernetes StatefulSet으로 띄우고, 클라우드 서비스는 Terraform 템플릿으로 프로비저닝합니다.

핵심은 **추상화 레이어 자체가 가치**라는 점입니다. 개발자 입장에서 PostgreSQL이 Kubernetes Pod에서 도는지, Amazon RDS에서 도는지는 중요하지 않습니다. 바인딩 인터페이스만 같으면 됩니다.

### 빌드 파이프라인 없는 관리 대시보드

관리 대시보드는 Go 템플릿, HTMX, Tailwind CSS(CDN)로 만들었습니다. JavaScript 빌드 과정이 없습니다. webpack도, npm도, node_modules도 없습니다.

의도적인 선택입니다. 대시보드는 48개 HTML 템플릿으로 애플리케이션 관리, 서비스 카탈로그, 멀티 클러스터, Observability, 시크릿, 5단계 RBAC 기반 IAM, 플랫폼 설정을 모두 다룹니다. 완전한 운영 콘솔이면서, 나머지 기능과 함께 하나의 바이너리에 들어갑니다.

여기서 HTMX의 역할이 돋보입니다. HTMX 덕분에 부분 페이지 갱신, SSE 기반 실시간 로그 스트리밍, 인라인 편집 같은 동적 인터랙션을 클라이언트 측 JavaScript 프레임워크 없이 구현할 수 있었습니다. 모든 인터랙션은 HTML 조각을 반환하는 표준 HTTP 요청입니다. 서버가 항상 상태의 주인이고, 클라이언트는 가볍게 유지됩니다.

플랫폼 운영 도구에서는 이게 맞는 방향입니다. 관리 대시보드에 소비자 앱 수준의 화려한 인터랙션은 필요 없습니다. 오히려 안정성, 빠른 응답, 그리고 보안 정책이 까다로운 환경에서도 문제 없이 동작하는 것이 훨씬 중요합니다.

### 자격 증명 걱정 없는 Identity

인증과 인가는 Keycloak(OIDC), Open Policy Agent(Rego 정책), SCIM v2가 담당합니다. 그런데 여기서 눈여겨볼 부분은 OIDC Federation 레이어입니다.

MicroFoundry는 Keycloak을 통해 AWS, GCP, Azure에 대한 임시 자격 증명을 중개할 수 있습니다. 예를 들어 AWS RDS를 프로비저닝할 때, MicroFoundry는 AWS 액세스 키를 저장하지 않습니다. 대신 Keycloak을 OIDC Identity Provider로 삼아 Federation 방식으로 임시 STS 토큰을 발급받습니다. GCP Workload Identity Federation, Azure Federated Identity Credentials도 같은 방식입니다.

결과적으로 플랫폼 어디에도 장기 유효한 클라우드 자격 증명이 남지 않습니다. 모든 클라우드 작업은 수명이 짧고 권한 범위가 제한된 토큰으로 처리됩니다. 보안 기준이 높은 조직에서 이건 있으면 좋은 기능이 아니라 필수 조건입니다.

## 이런 접근이 Web Application 관리에 왜 의미가 있는가

MicroFoundry라는 개별 프로젝트를 넘어서, 좀 더 넓은 맥락에서 이야기해볼 부분이 있습니다.

Web Application 대부분은 비슷한 패턴을 따릅니다. 코드를 실행할 런타임, 데이터를 담을 데이터베이스, HTTP 트래픽을 처리할 네트워킹, 시스템 상태를 볼 수 있는 Observability, 그리고 접근 권한을 관리할 Identity. 이 다섯 가지 — 컴퓨트, 데이터, 네트워킹, Observability, Identity — 는 거의 모든 서비스에 공통입니다. 그런데 Kubernetes에서는 이 하나하나가 각각 다른 도구, 다른 설정, 다른 사고방식을 요구합니다.

PaaS가 하는 일은 이 다섯 가지에 대해 합리적인 기본값을 제공하는 것입니다. 이건 Kubernetes 이전 시대의 낡은 발상이 아닙니다. **대부분의 애플리케이션은 특별한 인프라 구성을 필요로 하지 않는다**는 현실적 인식에 기반한 접근입니다. 커스텀 Ingress 설정이나 수동 튜닝된 Prometheus가 필요한 서비스보다, 기본값만으로 충분한 서비스가 압도적으로 많습니다.

MicroFoundry는 이 철학을 따릅니다. 기본값이 도움이 되는 곳에서는 분명한 선택을 내리고(Beyla로 메트릭, Loki로 로그, Keycloak으로 인증), 선택의 여지가 필요한 곳에서는 열어둡니다(nginx, Kong, Traefik, AWS API Gateway를 지원하는 플러그형 게이트웨이; 멀티 클러스터; 서비스 카탈로그 가시성 설정).

한 명의 개발자가 몇 주가 아닌 몇 분 안에 프로덕션급 애플리케이션 플랫폼을 구성할 수 있고, 플랫폼 팀이 플랫폼 자체 운영에 엔지니어 서넛을 매달리게 하지 않아도 되는 것. 그것이 이 접근이 지향하는 바입니다.

## AI로 만들고, AI와 함께 쓰는 플랫폼

MicroFoundry는 AI 연동을 *염두에 두고* 만들어졌을 뿐 아니라, 개발 과정 자체가 AI와의 *협업*으로 이루어졌습니다.

전체 코드베이스는 Claude Code를 활용한 구조화된 Human-AI Pair Programming으로 개발되었습니다. 각 기능은 7개의 Agent 리뷰를 거쳤습니다: Security Architect, Platform Engineer, API Designer, Frontend Engineer, DevOps Engineer, QA Engineer, Product Manager. 사람은 비전을 제시하고, 아키텍처를 결정하고, 결과를 검증하는 역할을 맡았습니다. AI는 구현과 테스트 작성, 코드 리뷰를 담당했습니다.

이 방식으로 28개 Epic을 머지하고, 18,000줄 이상의 Go 코드, 48개 HTML 템플릿, 50개 이상의 API 엔드포인트를 포함한 OpenAPI 스펙, 82개의 E2E 테스트 케이스를 만들어냈습니다. 몇 달이 걸릴 분량을 몇 주 만에요.

여기서 중요한 건 AI가 개발자를 대체한 게 아니라는 점입니다. AI가 한 명의 개발자를 팀 규모로 증폭시킨 겁니다. 사람 쪽에서는 도메인 전문성(CloudFoundry와 Kubernetes 플랫폼 분야에서 쌓은 경험), 설계 감각(어떤 추상화가 진짜 필요하고 어떤 건 과잉인지 구별하는 눈), 그리고 판단력(언제 관례를 따르고 언제 다른 길을 갈지 결정하는 능력)이 나왔습니다. AI 쪽에서는 빠른 구현 속도, 일관성, 그리고 코드베이스 전체를 한꺼번에 파악하는 능력이 나왔습니다.

## MCP가 여는 미래: 대화로 운영하는 플랫폼

MicroFoundry에서 가장 미래지향적인 부분은 MCP(Model Context Protocol) 서버 설계입니다. MCP는 Claude, Cursor 같은 AI 도구가 표준화된 인터페이스로 외부 시스템을 제어할 수 있게 해주는 프로토콜입니다.

MicroFoundry의 MCP 서버는 9개 도구를 제공합니다: `mf_push`, `mf_apps`, `mf_logs`, `mf_scale`, `mf_delete`, `mf_create_service`, `mf_bind_service`, `mf_routes`, `mf_env`. 이 도구들을 통해 AI가 애플리케이션 배포, 상태 확인, 로그 조회, 스케일링, 데이터베이스 프로비저닝, 환경 변수 관리를 자연어 대화만으로 수행할 수 있습니다.

이런 시나리오를 생각해 보세요:

> "API 서비스 최신 버전 배포하고, 인스턴스 3개로 늘리고, 프로덕션 PostgreSQL에 바인딩해줘. 그리고 지난 1시간 에러율 좀 보여줘."

MCP 연동이 되어 있으면, 이건 대화 한 턴으로 끝납니다. AI가 의도를 파악하고, 필요한 플랫폼 작업을 순서대로 실행하고, 실시간 메트릭까지 포함해서 결과를 보고합니다.

먼 미래의 이야기가 아닙니다. 깔끔한 API를 갖춘 플랫폼에 AI가 이해할 수 있는 프로토콜을 연결하면 자연스럽게 도달하는 지점입니다. MCP를 통해 MicroFoundry는 "조작하는 도구"에서 "대화하는 플랫폼"으로 성격이 바뀝니다.

여기서 더 나아가면 단순한 편의를 넘어서는 가능성이 열립니다. 자연어 정책 기반의 오토스케일링("에러율 1% 미만, 지연 시간 200ms 미만 유지"), 이상 징후를 감지해 사람이 읽을 수 있는 알림을 보내는 자동화, 운영 상황에 맞춰 배포 전략을 스스로 조정하는 플랫폼. 인프라가 단순한 기반이 아니라, 운영의 동료가 되는 겁니다.

## 현재 상태와 앞으로의 방향

현재 MicroFoundry는 v0.2.0입니다. 핵심 기능 — CLI, 관리 대시보드, 서비스 카탈로그, 멀티 클러스터 관리, Observability, IAM — 은 구현과 테스트를 마친 상태입니다. 다만 설계 컨셉이 현재 구현보다 앞서 있는 영역들이 있습니다.

MCP 서버는 설계와 문서화까지 마쳤지만 아직 구현 단계에 진입하지 않았습니다. Kubernetes HPA 연동을 통한 오토스케일링은 자연스러운 다음 과제입니다. 클라우드 서비스 프로비저닝은 현재 Terraform 템플릿 생성까지 자동화되어 있지만, apply 실행까지 자동으로 이어지지는 않습니다. 멀티 클러스터 관리는 단일 컨트롤 플레인으로 동작하지만, 클러스터 간 서비스 메시 연동은 아직 남은 과제입니다.

이것들은 비전이 부족해서가 아니라, 동작하는 소프트웨어를 우선하는 프로젝트의 자연스러운 로드맵입니다. 지금 존재하는 모든 기능은 실제 Kubernetes 클러스터 위에서 구현, 테스트, 검증을 거쳤습니다.

## 마치며

MicroFoundry는 하나의 확신에서 출발했습니다. CloudFoundry가 만들어낸 개발자 경험은 너무 아까워서 버릴 수 없고, Kubernetes가 제공하는 인프라는 너무 강력해서 외면할 수 없다는 것. 그 결과물은 CloudFoundry를 써본 사람에게는 익숙하고, Kubernetes를 처음 접하는 사람에게는 친절한 플랫폼입니다. 수많은 인프라 결정을 합리적인 기본값으로 줄이면서도, 필요할 때 깊이 들어갈 수 있는 여지를 남겨둔 설계입니다.

동시에, 이 프로젝트는 소프트웨어를 만드는 새로운 방식에 대한 하나의 실험이기도 합니다. MicroFoundry를 만들어낸 Human-AI 협업 자체가 하나의 증명입니다 — 깊은 도메인 경험과 AI 기반 개발을 결합하면, 이전에는 상상하기 어려웠던 속도로 프로덕션급 시스템을 구축할 수 있다는 것을요.

Kubernetes 위에서 Web Application을 운영하면서 좀 더 단순한 방법을 찾고 있다면, MicroFoundry가 그 답이 될 수 있습니다. 그리고 충분한 경험을 가진 플랫폼 엔지니어에게 지치지 않는 AI Pair Programmer를 붙여주면 어떤 일이 벌어지는지 궁금하다면 — 코드베이스가 그 이야기를 담고 있습니다.

---

*MicroFoundry는 MIT 라이선스의 오픈소스 프로젝트입니다. [github.com/younjinjeong/microfoundry](https://github.com/younjinjeong/microfoundry)*
