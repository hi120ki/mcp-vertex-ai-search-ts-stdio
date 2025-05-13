# MCP Server for Vertex AI Search

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
        "-v", "~/.config/gcloud/application_default_credentials.json:/tmp/adc.json:ro",
        "ghcr.io/hi120ki/mcp-vertex-ai-search-ts-stdio@sha256:8bc5027cd219cdcd0d6860e2e6a7a4059d566bb3b55dc5fdcbd7a1ebba52aeff"
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

## References

- [Vertex AI Search](https://cloud.google.com/enterprise-search)
- [Introduction to Vertex AI Search](https://cloud.google.com/generative-ai-app-builder/docs/enterprise-search-introduction)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
