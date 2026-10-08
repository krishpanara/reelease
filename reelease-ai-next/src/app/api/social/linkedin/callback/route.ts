import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  const html = `
    <html>
      <body>
        <script>
          const data = {
            type: 'LINKEDIN_AUTH_CALLBACK',
            code: ${JSON.stringify(code)},
            state: ${JSON.stringify(state)},
            error: ${JSON.stringify(error)},
            error_description: ${JSON.stringify(error_description)}
          };
          window.opener.postMessage(data, window.location.origin);
          window.close();
        </script>
        <p>Authentication complete. This window should close automatically.</p>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
