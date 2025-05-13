# MCP Server (Stdio) for Vertex AI Search (Discovery Engine)

## Overview

This is a MCP server (Stdio) for Vertex AI Search (Discovery Engine).

## Usage

For cursor, execute the following command to login to Google Cloud, and add the following to the `mcp.json` file.

```bash
$ gcloud auth login --update-adc
```

```json
{
  "mcpServers": {
    "vertex-ai-search": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "PROJECT",
        "-e", "LOCATION",
        "-e", "ENGINE",
        "-e", "LANGUAGE",
        "-e", "GOOGLE_APPLICATION_CREDENTIALS=/tmp/adc.json",
        "-v",
        "~/.config/gcloud/application_default_credentials.json:/tmp/adc.json:ro",
        "mcp-vertex-ai-search-ts:latest"
      ],
      "env": {
        "PROJECT": "<your-project-number>",
        "LOCATION": "global",
        "ENGINE": "<your-engine-name>",
        "LANGUAGE": "en-US"
      }
    }
  }
}
```
