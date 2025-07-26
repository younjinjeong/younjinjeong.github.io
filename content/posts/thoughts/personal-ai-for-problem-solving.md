---
title: "Thinking about AI technologies"
date: 2025-07-26T06:20:00+09:00
draft: false
authors:
  - younjinjeong
tags: [rc, hobby, status]
categories: [Thoughts]
layout: "post"
---

최근 AI 사용이 열풍이다. 본 블로그 역시 99% AI의 도움을 받아 만들어졌다. Cursor 에 Claude Code 를 함께 사용하는 방식으로 사용한다. Max 수준의 서비스 사용은 Claude 가 유일하며 나머지는 무료나 기본 플랜을 사용중이다. ChatGPT 기본, Cursor 기본, Claude Max 이렇게 사용하는데, GPT는 보통 문서나 언어와 관련된 영역에서 4o 를 사용하고, Cursor 와 Claude 는 IDE 안에서 수정에 대한 의견을 서로 다르게 제시할때 유의미하게 사용한다.

대부분의 사용자가 경험하듯, AI 는 아무것도 없는 상태에서는 사용자의 입력이 자세할수록 50~80% 수준으로, 때로는 마음에 딱 들게 주어진 문제를 해결한다. 하지만 AI가 정확한 문제 해결을 하지 못하는 경우, 보통 한두가지 해법 사이에서 지속적으로 오답을 제안하며 핑퐁을 치는데 이런 경우 사용자가 해법을 제안하며 직접 개입하지 않으면 GPU만 태우는 상태가 되기도 한다. 그리고 이런 문제는 해결을 위해 쳐다봐야 하는 범위가 크면 클수록 자주 발생하는것으로 생각된다.

예를 들어 간단한 웹 랜딩 페이지를 처음으로 만들어 내는것은 놀라울 정도의 결과를 보여준다. 그런데 이렇게 한번 만들어진 웹페이지에서 폰트를 바꾸고, 레이아웃을 바꾸고 하는 아무튼 특정 작업을 지시해서 결과를 보기 위해서는 웹 페이지의 동작 원리를 이해하지 않고서는 단일 AI 의 도움만으로는 불가능한 경우가 많다.

이런 문제를 마주쳤을때 해결하는 방법에 대해서는 이미 다양한 소개가 있어 찾아보면 좋을것 같고, 이런 방법은 어떨까 해서 떠오른 생각이 있는데 그것은 바로 1. 나의 사고 방식을 주입해서 나 대신 나의 방법으로 문제를 해결하기 의 구조와, 2. 이렇게 만들어진 구조를 바탕으로 여러 사람의 인격을 갖춘 AI 를 구성해서 특정 문제 해결에 마치 다수의 의견을 바탕으로 해법을 제시하고 결정하는 구현이 가능하지 앟을까 하는 생각이 들었다.

사람도 어차피 한순간에 인생 모든 경험의 기억을 불러와서 문제 해결에 사용하지 않는다. 물론 그런 분들도 계신지는 모르겠지만, 적어도 나의 두뇌가 동작하는 방법은 그런식은 아닌것 같다. 오히려 약간 컴퓨터랑 비슷한것 같은데, 컴퓨터나 책과 같은 거대한 외부 저장 공간이 있고, 문제 해결을 위해 검색을 수행하고, 이것을 그 순간의 두뇌 메모리에 적재하고, 또 다른 두뇌의 다른 영역에서 연산을 하는 방식이 아닐까 싶다.

이러한 동작 구조를 최근 다양한 AI 도구들의 생태계를 바탕으로 구성을 생각해 보면 아래와 같다.

1. 거대한 정보의 바다 인터넷을 검색할 수 있는 구성
2. 사용자와 AI 도구가 주고 받은 응답, 그리고 사용자가 선택한 답변의 모든 이벤트 스트림을 기록한 스토리지, 그리고 AI 도구가 이 스토리지를 검색할수 있도록 하는 능력
3. 각 AI 도구에서 사용하는 메모리 사용 방법의 정의를 포함한 프롬프트 엔지니어링 적용 방식
4. 기타 각 업무 분야에서 사용하는 시스템 및 도구와의 데이터 연결

이런 구성을 통해 동작 방식을 구성하면 아래와 같다.

1. AI 는 Learning phase 가 존재하고, 이 시점에는 대부분의 일반 사용자들이 사용하는 방식으로 AI 를 사용한다. Leaning phase 라고 해도 위에 언급한 모든 구성은 동작해야 한다. 이 모드에서 AI 도구는 모든 사용자와 AI 도구간의 커뮤니케이션을 타임시리즈 기반의 이벤트로 기록하고, 향후 검색을 위해 그 대화가 무엇에 대한 주제였는지 키워드등으로 타입 구분을 한다.

2. Learning phase 에서도 업무 또는 문제 해결을 위한 다양한 도구에 MCP 또는 이후에 등장할 더 좋은 방법으로 인터페이스를 구성해 둔다. 인터넷, 인트라넷, ERP, 다양한 저작 도구등 모든 연결 가능한 도구가 대상이다. 사용자는 AI 를 활용해 다양한 저작 활동 또는 문제 해결 활동을 AI와 함께 한다. 대부분 지금 사용하는 방식을 떠올려보면 된다.

3. 이런 방식으로 사용 기간이 오래될 수록 사용자의 문제 해결 방법이 이벤트 스트림의 저장을 통해 누적된다. 하지만 모두 알다시피, 이런 누적된 정보를 매번 AI 에게 참고하도록 강요할 수 없다. 강요한다 하더라도 AI 는 비용 절감을 위해 가볍게 무시할 것이다.

4. Expert phase 의 사용을 위해, 사용자는 해결하고자 하는 문제에 다양한 검색 소스를 통해 제공된 해법 중 어떤 것을 선택하고, 어떻게 변형 또는 적용하고, 어떻게 확인할수 있을지에 대한 일종의 '성격' 또는 '성향' 의 영역을 가급적 간단하게 시스템 프롬프트의 방법으로 제공하여 모든 판단의 영역에서 사용할수 있도록 한다. 이것을 수행하는 방식은 아주 다양한데, Claude Code 에서는 xml 의 방식을 사용하거나, 시스템 프롬프트에서 문제 해결에 단계를 적용하고, 단계별로 참조해야 하는 영역을 재귀적으로 명확히 명시함으로서 강화할수 있다.

5. Expert phase 에서 문제가 유입되면, AI 에 직접 문제를 묻기 전에 기존 문제 해결 경험이 누적된 이벤트 스트림이 저장된 스토리지에서 문제와 관련된 영역을 검색한다. 검색된 결과의 질문과 답변을 example 로서, AI 에 제공할 추가 Rule 또는 프롬프트로 제공한다. 이것은 AI 가 가진 기본 능력 + 사용자의 유사한 문제 해결 경험 + 사용자의 해결 방식에 대한 제어 성향 세가지를 복합적으로 조합하여 AI 에 공급한다.

6. 이런 식으로 특정 문제 또는 특정 인격에 강화된 방식을 지속적으로 누적하고, 사용자가 선택한 해결 방법 또는 입력된 수정 방식을 지속적으로 누적 학습하며, 이 기록에서 적절한 영역 범위만을 검색하여 매번 문제 해결에 사용하는 방식을 취하는 것이 핵심이다.

이런 방식이 실제 동작하는지 구현을 위해서 다양한 도구가 있을텐데, AWS 에서는 아래와 같은 방식으로 구현할수 있지 않을까 한다.

{{< figure src="/images/posts/thoughts/aws_ai_architecture.png" alt="AWS AI Knowledge + Event Streaming Architecture" caption="AWS AI Knowledge + Event Streaming Architecture" >}}

이런 구현을 위해, 아래는 ChatGPT 를 사용해서 제공받은 구현 방식이다. Python Diagram 을 사용했다.

```python

from diagrams import Diagram, Cluster, Edge
from diagrams.custom import Custom

# Best-effort imports of AWS icons. If a specific icon isn't available in your diagrams version,
# we fall back to a generic node to keep the code runnable.
def pick(*candidates):
    for mod, name in candidates:
        try:
            module = __import__(mod, fromlist=[name])
            return getattr(module, name)
        except Exception:
            continue
    # Generic fallback
    from diagrams.generic.blank import Blank
    return Blank

# Core AWS services
APIGateway      = pick(("diagrams.aws.network", "APIGateway"), ("diagrams.aws.network", "APIGateway"))
Lambda          = pick(("diagrams.aws.compute", "Lambda"), ("diagrams.aws.compute", "LambdaFunction"))
StepFunctions   = pick(("diagrams.aws.integration", "StepFunctions"), ("diagrams.aws.integration", "SF"))
BedrockNode     = pick(("diagrams.aws.ml", "Bedrock"), ("diagrams.generic.blank", "Blank"))
Guardduty       = pick(("diagrams.aws.security", "Guardduty"), ("diagrams.generic.blank", "Blank"))
KendraNode      = pick(("diagrams.aws.ml", "Kendra"), ("diagrams.generic.blank", "Blank"))
OpenSearchNode  = pick(("diagrams.aws.analytics", "OpenSearchService"), ("diagrams.aws.analytics", "ElasticsearchService"), ("diagrams.generic.blank", "Blank"))
S3              = pick(("diagrams.aws.storage", "S3"), ("diagrams.aws.storage", "SimpleStorageServiceS3"))
Kinesis         = pick(("diagrams.aws.analytics", "KinesisDataStreams"), ("diagrams.aws.analytics", "Kinesis"))
Glue            = pick(("diagrams.aws.analytics", "Glue"), ("diagrams.generic.blank", "Blank"))
Athena          = pick(("diagrams.aws.analytics", "Athena"), ("diagrams.generic.blank", "Blank"))
DynamoDB        = pick(("diagrams.aws.database", "DynamoDB"), ("diagrams.generic.blank", "Blank"))
AppConfig       = pick(("diagrams.aws.management", "AppConfig"), ("diagrams.aws.management", "SystemsManagerParameterStore"), ("diagrams.generic.blank", "Blank"))
CloudWatch      = pick(("diagrams.aws.management", "Cloudwatch"), ("diagrams.aws.management", "CloudWatch"))
CloudTrail      = pick(("diagrams.aws.management", "Cloudtrail"), ("diagrams.aws.management", "CloudTrail"))
KMS             = pick(("diagrams.aws.security", "KMS"), ("diagrams.aws.security", "KeyManagementService"))
LakeFormation   = pick(("diagrams.aws.analytics", "LakeFormation"), ("diagrams.generic.blank", "Blank"))
IAM             = pick(("diagrams.aws.security", "IAM"), ("diagrams.generic.blank", "Blank"))
ECS             = pick(("diagrams.aws.compute", "ECS"), ("diagrams.aws.compute", "ElasticContainerService"))
Fargate         = pick(("diagrams.aws.compute", "Fargate"), ("diagrams.aws.compute", "ECSFargate"))
OpenSearchSV    = OpenSearchNode  # alias for readability

with Diagram(
    "AWS AI Knowledge + Event Streaming Architecture",
    filename="aws_ai_architecture",
    outformat="png",
    show=False,
    graph_attr={
        "pad": "0.3",
        "splines": "spline",
        "rankdir": "LR",
        "fontsize": "12"
    }
):

    # Clients
    with Cluster("Clients"):
        web = Custom("Web / Admin", "https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/saas/browser/browser.png")
        mobile = Custom("Mobile / Tools", "https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/saas/mobile/mobile-app.png")

    # Entry and Orchestration
    with Cluster("Entry & Orchestration"):
        api_gw = APIGateway("Amazon API Gateway\n(OIDC/Cognito)")
        orch = Lambda("Orchestrator Lambda")
        sfn = StepFunctions("Flow Control\nStep Functions")

        api_gw >> orch >> sfn

    # AI Core
    with Cluster("AI Core (Amazon Bedrock)"):
        bedrock = BedrockNode("Amazon Bedrock\n(Converse API)")
        guard = IAM("Guardrails / Policy")
        agents = BedrockNode("Bedrock Agents")
        bedrock >> agents
        guard >> bedrock

    # Knowledge & Search
    with Cluster("Knowledge & Search"):
        kb = BedrockNode("Bedrock Knowledge Bases")
        ossv = OpenSearchSV("OpenSearch Serverless\n(Vector + Keyword)")
        kendra = KendraNode("Amazon Kendra")

        kb >> ossv

    # Event Streaming & Storage
    with Cluster("Event Streaming & Storage"):
        kds = Kinesis("Kinesis Data Streams")
        s3 = S3("S3 Data Lake\n(events, docs)")
        glue = Glue("Glue Data Catalog")
        athena = Athena("Athena\nAd-hoc Analytics")

        kds >> s3
        s3 >> glue
        glue >> athena

    # Personas & Config
    with Cluster("Persona & Feature Flags"):
        ddb = DynamoDB("DynamoDB\nPersona / Preferences")
        appcfg = AppConfig("AppConfig\n(Learning/Expert mode)")

    # Connectors / Tools via MCP
    with Cluster("Connectors (MCP Server on ECS Fargate)"):
        ecs = ECS("ECS Cluster")
        fargate = Fargate("MCP Server")
        tools = [
            Custom("ERP", "https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/saas/erp/erp.png"),
            Custom("Jira/Issues", "https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/saas/issue/issue.png"),
            Custom("GitHub/GitLab", "https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/saas/gitlab/gitlab.png"),
            Custom("CI/CD", "https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/saas/octopus/octopus.png"),
            Custom("Internet Search", "https://raw.githubusercontent.com/mingrammer/diagrams/master/resources/saas/browser/browser.png"),
        ]
        ecs >> fargate
        for t in tools:
            fargate >> t

    # Security & Observability
    with Cluster("Security & Observability"):
        kms = KMS("KMS")
        cwatch = CloudWatch("CloudWatch / X-Ray")
        ctrail = CloudTrail("CloudTrail")
        lakef = LakeFormation("Lake Formation")
        iam = IAM("IAM")

        kms >> s3
        iam >> [api_gw, orch, bedrock, agents, kendra, ecs, fargate, s3, ossv]

    # Flows
    # Clients -> API -> Orchestrator
    web >> api_gw
    mobile >> api_gw

    # Orchestrator to Bedrock + Guardrails
    sfn >> bedrock
    ddb >> orch
    appcfg >> orch

    # Bedrock Agents -> Knowledge & Search and MCP
    agents >> kb
    agents >> kendra
    agents >> fargate

    # Eventing of all interactions
    orch >> kds
    bedrock >> kds
    agents >> kds
    fargate >> kds

    # Retrieval paths
    kb >> bedrock
    kendra >> bedrock
    ossv >> bedrock

    # Analytics path
    athena << s3

```

다양한 방식의 문제 해결에 대한 접근 방법이 있겠지만, 이런 일종의 문제 해결을 위한 방법을 SDLC 영역에 적용해 보면 좋겠다는 생각이 든다. 개발자의 IDE에 편중되어있다고 생각하지만 (아닐수도 있고), Jira 와 같은 태스크 관리 도구, CI/CD 환경, 코드 베이스, 문서 시스템, 로그 시스템등 각각의 영역에 연결된 상태에 이런 AI 도구를 준비한다면, 마치 전문성이 다른 사람들의 팀이 동작하는 것 같은 효과를 볼 수 있지 않을까.

하는 생각이 들면 바로 테스트 해봐야 하는데...
당장 처리할 일이 많네.

최근 다양한 AI 로 부터 도움을 받지 않고는 살아갈수 없는 상태가 되어 개인적으로 고도화 해보고 싶어서 몇자 끄적거려 봄.

