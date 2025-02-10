import { config } from "./config/serverConfig.js";
import { corsMiddleware } from "./middleware/cors.js";
import { FileController } from "./controllers/fileController.js";
import { logger } from "./utils/logger.js";

const formatDateTime = () => {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace('T', ' ');
};

const EMOJIS = {
  status: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Green%20Circle.png',
  time: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Watch.png',
  user: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Technologist.png',
  docs: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Card%20File%20Box.png',
  example: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Page%20with%20Curl.png',
  heart: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Green%20Heart.png'
};

const startServer = async (port) => {
  try {
    const server = Bun.serve({
      port: process.env.PORT || 6970,
      hostname: process.env.HOST || "0.0.0.0",
      development: process.env.NODE_ENV !== 'production',

      async fetch(req) {
        try {
          // Add request logging
          logger.info(`${req.method} ${new URL(req.url).pathname}`);
          
          const corsResponse = corsMiddleware(req);
          if (corsResponse) return corsResponse;

          const url = new URL(req.url);

          if (req.method === "GET" && url.pathname === "/") {
            return new Response(
              `
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Bun MinIO File Server</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
                  <style>
                    :root {
                      --bg-primary: #000000;
                      --bg-secondary: #121212;
                      --text-primary: #ffffff;
                      --text-secondary: #8b949e;
                      --accent: #58a6ff;
                      --success: #3fb950;
                      --warning: #d29922;
                      --error: #f85149;
                    }

                    * {
                      margin: 0;
                      padding: 0;
                      box-sizing: border-box;
                    }

                    body {
                      font-family: 'Inter', sans-serif;
                      background-color: var(--bg-primary);
                      color: var(--text-primary);
                      line-height: 1.6;
                      padding: 2rem;
                      min-height: 100vh;
                    }

                    .container {
                      max-width: 1000px;
                      margin: 0 auto;
                      position: relative;
                    }

                    header {
                      margin-bottom: 2rem;
                      padding-bottom: 1rem;
                      border-bottom: 1px solid var(--bg-secondary);
                    }

                    h1, h2, h3 {
                      color: var(--text-primary);
                      margin: 1rem 0;
                      font-weight: 600;
                    }

                    h1 {
                      font-size: 2.5rem;
                      display: flex;
                      align-items: center;
                      gap: 1rem;
                    }

                    .logo {
                      font-family: 'Fira Code', monospace;
                      color: var(--accent);
                      font-weight: 500;
                    }

                    .status-card {
                      background: var(--bg-secondary);
                      border-radius: 12px;
                      padding: 1.5rem;
                      margin: 1rem 0;
                      display: grid;
                      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                      gap: 1rem;
                      border: 1px solid #2f2f2f;
                    }

                    .status-item {
                      display: flex;
                      align-items: center;
                      gap: 0.75rem;
                      font-family: 'Fira Code', monospace;
                    }

                    .status-icon {
                      width: 25px;
                      height: 25px;
                      display: inline-block;
                      vertical-align: middle;
                    }

                    .section-icon {
                      width: 30px;
                      height: 30px;
                      display: inline-block;
                      vertical-align: middle;
                      margin-right: 10px;
                    }

                    .endpoint {
                      background: var(--bg-secondary);
                      padding: 1.5rem;
                      margin: 1rem 0;
                      border-radius: 12px;
                      border: 1px solid #2f2f2f;
                    }

                    .method {
                      display: inline-block;
                      padding: 0.25rem 0.75rem;
                      border-radius: 6px;
                      font-weight: 500;
                      margin-right: 0.5rem;
                      font-family: 'Fira Code', monospace;
                    }

                    .method.post {
                      background: var(--success);
                      color: var(--bg-primary);
                    }

                    .method.get {
                      background: var(--accent);
                      color: var(--bg-primary);
                    }

                    .method.delete {
                      background: var(--error);
                      color: var(--bg-primary);
                    }

                    code {
                      font-family: 'Fira Code', monospace;
                      background: rgba(255, 255, 255, 0.1);
                      padding: 0.2rem 0.4rem;
                      border-radius: 4px;
                    }

                    pre {
                      font-family: 'Fira Code', monospace;
                      background: var(--bg-secondary);
                      padding: 1.5rem;
                      border-radius: 12px;
                      overflow-x: auto;
                      white-space: pre-wrap;
                      word-wrap: break-word;
                      border: 1px solid #2f2f2f;
                    }

                    ul {
                      list-style-position: inside;
                      margin: 1rem 0;
                    }

                    li {
                      margin: 0.5rem 0;
                    }

                    .github-link {
                      color: var(--accent);
                      text-decoration: none;
                      transition: opacity 0.2s;
                    }

                    .github-link:hover {
                      opacity: 0.8;
                    }

                    .watermark {
                      position: fixed;
                      bottom: 1rem;
                      right: 1rem;
                      font-family: 'Inter', sans-serif;
                      font-size: 0.875rem;
                      color: var(--text-secondary);
                      display: flex;
                      align-items: center;
                      gap: 0.5rem;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <header>
                      <h1>
                        <span class="logo">[Bun]</span>
                        MinIO File Server
                      </h1>
                    </header>

                    <div class="status-card">
                      <div class="status-item">
                        <img src="${EMOJIS.status}" alt="Status" class="status-icon" />
                        <span>Status: Online</span>
                      </div>
                      <div class="status-item">
                        <img src="${EMOJIS.time}" alt="Time" class="status-icon" />
                        <span>UTC: ${formatDateTime()}</span>
                      </div>
                      <div class="status-item">
                        <img src="${EMOJIS.user}" alt="User" class="status-icon" />
                        <span>User: <a href="https://github.com/Patil5913" class="github-link" target="_blank">Patil5913</a></span>
                      </div>
                    </div>

                    <h2>
                      <img src="${EMOJIS.docs}" alt="Documentation" class="section-icon" />
                      API Documentation
                    </h2>

                    <div class="endpoint">
                      <h3>
                        <span class="method post">POST</span>
                        /upload
                      </h3>
                      <p>Upload a file to MinIO storage</p>
                      <h4>Parameters:</h4>
                      <ul>
                        <li><code>file</code> - File to upload (required)</li>
                        <li><code>bucket</code> - Target bucket name (optional, defaults to "default")</li>
                      </ul>
                    </div>

                    <div class="endpoint">
                      <h3>
                        <span class="method get">GET</span>
                        /file/{bucket}/{filename}
                      </h3>
                      <p>Retrieve a file from storage</p>
                    </div>

                    <div class="endpoint">
                      <h3>
                        <span class="method delete">DELETE</span>
                        /file/{bucket}/{filename}
                      </h3>
                      <p>Remove a file from storage</p>
                    </div>

                    <h2>
                      <img src="${EMOJIS.example}" alt="Examples" class="section-icon" />
                      Example Usage
                    </h2>
                    <pre>
  # Upload file
  curl -X POST \\
    -F "file=@example.jpg" \\
    -F "bucket=mybucket" \\
    http://localhost:${server.port}/upload

  # Get file
  curl http://localhost:${server.port}/file/mybucket/example.jpg

  # Delete file
  curl -X DELETE \\
    http://localhost:${server.port}/file/mybucket/example.jpg</pre>
                  </div>

                  <div class="watermark">
                    made by vrugle with <img src="${EMOJIS.heart}" alt="heart" style="width: 20px; height: 20px; vertical-align: middle;" />
                  </div>
                </body>
              </html>
              `,
              {
                headers: {
                  "Content-Type": "text/html",
                },
              }
            );
          }

          // File upload endpoint
          if (req.method === "POST" && url.pathname === "/upload") {
            // Add request size logging
            const contentLength = req.headers.get('content-length');
            logger.info(`Upload request size: ${contentLength} bytes`);
            return await FileController.handleUpload(req);
          }
          
          // File download endpoint
          if (req.method === "GET" && url.pathname.startsWith("/file/")) {
            const [, , bucket, ...filenameParts] = url.pathname.split("/");
            const filename = filenameParts.join("/");
            return await FileController.handleGet(bucket, filename);
          }
          
          // File deletion endpoint
          if (req.method === "DELETE" && url.pathname.startsWith("/file/")) {
            const [, , bucket, ...filenameParts] = url.pathname.split("/");
            const filename = filenameParts.join("/");
            return await FileController.handleDelete(bucket, filename);
          }

          return new Response("Not Found", { status: 404 });
        } catch (error) {
          logger.error("Server error:", error);
          return new Response(JSON.stringify({
            success: false,
            error: "Internal Server Error",
            details: error.message
          }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    });

    logger.info(`Server running at http://${server.hostname}:${server.port}`);
    return server;
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      logger.info(`Port ${port} is in use, trying ${port + 1}`);
      return startServer(port + 1);
    }
    throw error;
  }
};

// Start server with initial port from config
startServer(config.port);
