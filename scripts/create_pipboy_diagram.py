#!/usr/bin/env python3
"""
AWS AI Architecture Diagram - Fallout Pip-Boy Terminal Style
Generates a retro terminal-styled architecture diagram matching the blog theme
"""

import graphviz
from PIL import Image, ImageFilter, ImageEnhance
import os

# Pip-Boy Terminal Theme Colors (from pipboy.css)
PIPBOY_GREEN = "#41ff00"
PIPBOY_DARK_GREEN = "#29a000"
PIPBOY_LIGHT_GREEN = "#5fff1f"
PIPBOY_BLACK = "#000000"
PIPBOY_BG_ALT = "#0a1a0a"
PIPBOY_GLOW = "#2d5a2d"


def create_pipboy_aws_diagram():
    """Create AWS AI Architecture diagram in Pip-Boy terminal style"""

    dot = graphviz.Digraph(
        "AWS_AI_Architecture",
        comment="AWS AI Knowledge + Event Streaming Architecture - Pip-Boy Style",
        format="png",
        engine="dot"
    )

    # Global graph attributes for dark terminal look
    dot.attr(
        bgcolor=PIPBOY_BLACK,
        fontcolor=PIPBOY_GREEN,
        fontname="Monospace",
        fontsize="18",
        label="[ AWS AI KNOWLEDGE + EVENT STREAMING ARCHITECTURE ]",
        labelloc="t",
        labeljust="c",
        pad="0.5",
        splines="ortho",
        nodesep="0.6",
        ranksep="0.8",
        dpi="150",
        compound="true",
        newrank="true",
    )

    # Default node styling - terminal boxes
    dot.attr(
        "node",
        shape="box",
        style="filled,bold",
        fillcolor=PIPBOY_BG_ALT,
        color=PIPBOY_GREEN,
        fontcolor=PIPBOY_GREEN,
        fontname="Monospace",
        fontsize="9",
        penwidth="2",
        margin="0.2,0.1",
    )

    # Default edge styling - glowing green lines
    dot.attr(
        "edge",
        color=PIPBOY_GREEN,
        fontcolor=PIPBOY_GREEN,
        fontname="Monospace",
        fontsize="8",
        penwidth="1.5",
        arrowsize="0.7",
        arrowhead="vee",
    )

    # ============= CLIENTS =============
    with dot.subgraph(name="cluster_clients") as c:
        c.attr(
            label="[ CLIENTS ]",
            style="dashed,bold",
            color=PIPBOY_DARK_GREEN,
            bgcolor=PIPBOY_BG_ALT,
            fontcolor=PIPBOY_GREEN,
            fontname="Monospace",
            fontsize="10",
            penwidth="2",
        )
        c.node("mobile", "> Mobile / Tools")
        c.node("web", "> Web / Admin")

    # ============= PERSONA & FEATURE FLAGS =============
    with dot.subgraph(name="cluster_persona") as c:
        c.attr(
            label="[ PERSONA & FEATURE FLAGS ]",
            style="dashed,bold",
            color=PIPBOY_DARK_GREEN,
            bgcolor=PIPBOY_BG_ALT,
            fontcolor=PIPBOY_GREEN,
            penwidth="2",
        )
        c.node("dynamodb", "DynamoDB\nPersona/Preferences")
        c.node("appconfig", "AppConfig\n(Learning/Expert)")

    # ============= ENTRY & ORCHESTRATION =============
    with dot.subgraph(name="cluster_entry") as c:
        c.attr(
            label="[ ENTRY & ORCHESTRATION ]",
            style="dashed,bold",
            color=PIPBOY_DARK_GREEN,
            bgcolor=PIPBOY_BG_ALT,
            fontcolor=PIPBOY_GREEN,
            penwidth="2",
        )
        c.node("api_gateway", "Amazon API Gateway\n(OIDC/Cognito)")
        c.node("orchestrator", "Orchestrator Lambda")
        c.node("step_functions", "Flow Control\nStep Functions")

    # ============= AI CORE (AMAZON BEDROCK) =============
    with dot.subgraph(name="cluster_ai_core") as c:
        c.attr(
            label="[ AI CORE - AMAZON BEDROCK ]",
            style="filled,dashed,bold",
            color=PIPBOY_LIGHT_GREEN,
            bgcolor="#0d2a0d",
            fontcolor=PIPBOY_LIGHT_GREEN,
            penwidth="3",
        )
        c.node("guardrails", "Guardrails / Policy", color=PIPBOY_LIGHT_GREEN)
        c.node("bedrock", "Amazon Bedrock\n(Converse API)", color=PIPBOY_LIGHT_GREEN)
        c.node("bedrock_agents", "Bedrock Agents", color=PIPBOY_LIGHT_GREEN)

    # ============= KNOWLEDGE & SEARCH =============
    with dot.subgraph(name="cluster_knowledge") as c:
        c.attr(
            label="[ KNOWLEDGE & SEARCH ]",
            style="dashed,bold",
            color=PIPBOY_DARK_GREEN,
            bgcolor=PIPBOY_BG_ALT,
            fontcolor=PIPBOY_GREEN,
            penwidth="2",
        )
        c.node("kendra", "Amazon Kendra")
        c.node("knowledge_bases", "Bedrock\nKnowledge Bases")
        c.node("opensearch", "OpenSearch Serverless\n(Vector + Keyword)")

    # ============= CONNECTORS (MCP SERVER) =============
    with dot.subgraph(name="cluster_connectors") as c:
        c.attr(
            label="[ CONNECTORS - MCP SERVER ON ECS FARGATE ]",
            style="dashed,bold",
            color=PIPBOY_DARK_GREEN,
            bgcolor=PIPBOY_BG_ALT,
            fontcolor=PIPBOY_GREEN,
            penwidth="2",
        )
        c.node("ecs_cluster", "ECS Cluster")
        c.node("mcp_server", "MCP Server")

    # External services (ellipse shape for external)
    dot.node("cicd", "CI/CD", shape="ellipse", style="filled,bold")
    dot.node("github", "GitHub/GitLab", shape="ellipse", style="filled,bold")
    dot.node("jira", "Jira/Issues", shape="ellipse", style="filled,bold")
    dot.node("erp", "ERP", shape="ellipse", style="filled,bold")
    dot.node("internet", "Internet Search", shape="ellipse", style="filled,bold")

    # ============= EVENT STREAMING & STORAGE =============
    with dot.subgraph(name="cluster_streaming") as c:
        c.attr(
            label="[ EVENT STREAMING & STORAGE ]",
            style="dashed,bold",
            color=PIPBOY_DARK_GREEN,
            bgcolor=PIPBOY_BG_ALT,
            fontcolor=PIPBOY_GREEN,
            penwidth="2",
        )
        c.node("kinesis", "Kinesis\nData Streams")
        c.node("s3_lake", "S3 Data Lake\n(events, docs)")
        c.node("glue", "Glue\nData Catalog")
        c.node("athena", "Athena\nAd-hoc Analytics")

    # ============= SECURITY & OBSERVABILITY =============
    with dot.subgraph(name="cluster_security") as c:
        c.attr(
            label="[ SECURITY & OBSERVABILITY ]",
            style="dashed,bold",
            color=PIPBOY_DARK_GREEN,
            bgcolor=PIPBOY_BG_ALT,
            fontcolor=PIPBOY_GREEN,
            penwidth="2",
        )
        c.node("iam", "IAM")
        c.node("kms", "KMS")
        c.node("cloudwatch", "CloudWatch\nX-Ray")
        c.node("cloudtrail", "CloudTrail")
        c.node("lake_formation", "Lake Formation")

    # ============= DEFINE CONNECTIONS =============

    # Clients to API Gateway
    dot.edge("mobile", "api_gateway")
    dot.edge("web", "api_gateway")

    # Entry & Orchestration flow
    dot.edge("api_gateway", "orchestrator")
    dot.edge("orchestrator", "step_functions")

    # Persona to Entry
    dot.edge("dynamodb", "appconfig")
    dot.edge("appconfig", "api_gateway", style="dashed")

    # Entry to AI Core
    dot.edge("step_functions", "guardrails")
    dot.edge("guardrails", "bedrock")
    dot.edge("bedrock", "bedrock_agents")

    # AI Core to Knowledge & Search
    dot.edge("bedrock_agents", "kendra")
    dot.edge("bedrock_agents", "knowledge_bases")
    dot.edge("knowledge_bases", "opensearch")

    # AI Core to Connectors
    dot.edge("bedrock_agents", "mcp_server")
    dot.edge("ecs_cluster", "mcp_server")

    # MCP Server to External Services
    dot.edge("mcp_server", "cicd")
    dot.edge("mcp_server", "github")
    dot.edge("mcp_server", "jira")
    dot.edge("mcp_server", "erp")
    dot.edge("mcp_server", "internet")

    # AI Core to Event Streaming
    dot.edge("bedrock_agents", "kinesis")

    # Event Streaming flow
    dot.edge("kinesis", "s3_lake")
    dot.edge("s3_lake", "glue")
    dot.edge("glue", "athena")

    # Security connections (dotted lines to main components)
    dot.edge("iam", "api_gateway", style="dotted", constraint="false", penwidth="1")
    dot.edge("iam", "bedrock", style="dotted", constraint="false", penwidth="1")
    dot.edge("kms", "s3_lake", style="dotted", constraint="false", penwidth="1")
    dot.edge("cloudwatch", "orchestrator", style="dotted", constraint="false", penwidth="1")
    dot.edge("cloudtrail", "api_gateway", style="dotted", constraint="false", penwidth="1")
    dot.edge("lake_formation", "s3_lake", style="dotted", constraint="false", penwidth="1")

    return dot


def add_glow_effect(input_path, output_path, glow_radius=2):
    """Add phosphor glow effect to the diagram for authentic CRT look"""
    img = Image.open(input_path).convert("RGBA")

    # Create a subtle glow by blurring and blending
    glow = img.filter(ImageFilter.GaussianBlur(radius=glow_radius))

    # Enhance the green channel slightly
    enhancer = ImageEnhance.Color(glow)
    glow = enhancer.enhance(1.2)

    # Blend original with glow
    result = Image.blend(glow, img, 0.85)

    # Add slight brightness for phosphor effect
    enhancer = ImageEnhance.Brightness(result)
    result = enhancer.enhance(1.05)

    result.save(output_path)
    print(f"Glow effect applied: {output_path}")


def main():
    # Determine output path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    output_dir = os.path.join(project_root, "static", "images", "posts", "thoughts")

    # Create output directory if needed
    os.makedirs(output_dir, exist_ok=True)

    # Generate diagram
    print("Generating Pip-Boy styled AWS architecture diagram...")
    diagram = create_pipboy_aws_diagram()

    # Render to temp file first
    temp_output = os.path.join(output_dir, "aws_ai_architecture_temp")
    diagram.render(temp_output, cleanup=True)

    temp_png = temp_output + ".png"
    final_output = os.path.join(output_dir, "aws_ai_architecture.png")

    # Apply glow effect
    print("Applying phosphor glow effect...")
    add_glow_effect(temp_png, final_output)

    # Clean up temp file
    if os.path.exists(temp_png):
        os.remove(temp_png)

    print(f"Diagram saved to: {final_output}")
    return final_output


if __name__ == "__main__":
    main()
