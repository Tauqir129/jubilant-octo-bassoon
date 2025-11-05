// server.ts — Bun HTTP server providing /api/transform and serving frontend static files
import { serve } from "bun";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const STATIC_DIR = path.join(process.cwd(), "frontend");

async function handleTransform(req: Request) {
  const form = formidable({ multiples: false });

  return new Promise<Response>((resolve) => {
    form.parse(req as any, async (err, fields, files) => {
      if (err) {
        resolve(new Response(JSON.stringify({ error: err.message }), { status: 400 }));
        return;
      }

      const width = fields.width ? parseInt(String(fields.width)) : null;
      const height = fields.height ? parseInt(String(fields.height)) : null;
      const enhance = fields.enhance === "true" || fields.enhance === true;
      const file = files.image || files.file;
      if (!file) {
        resolve(new Response(JSON.stringify({ error: "No image uploaded" }), { status: 400 }));
        return;
      }

      const filepath = file.filepath || file.path || file.file;
      try {
        let pipeline = sharp(filepath);

        if (width || height) pipeline = pipeline.resize(width || null, height || null, { fit: "inside" });

        if (enhance) {
          pipeline = pipeline.sharpen().normalize().modulate({ brightness: 1.02, saturation: 1.05 });
        }

        const buffer = await pipeline.webp({ quality: 84 }).toBuffer();

        resolve(
          new Response(buffer, {
            status: 200,
            headers: {
              "Content-Type": "image/webp",
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          })
        );
      } catch (e) {
        resolve(new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 }));
      }
    });
  });
}

function serveStatic(req: Request) {
  const url = new URL(req.url);
  let pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.join(STATIC_DIR, pathname.replace(/^\//, ""));

  try {
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1);
    const type =
      {
        html: "text/html",
        js: "application/javascript",
        css: "text/css",
        svg: "image/svg+xml",
        png: "image/png",
        webp: "image/webp",
        json: "application/json",
      }[ext] || "application/octet-stream";

    return new Response(data, { headers: { "Content-Type": type } });
  } catch (err) {
    return new Response("Not found", { status: 404 });
  }
}

serve({
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/api/transform" && req.method === "POST") {
      return handleTransform(req);
    }
    return serveStatic(req);
  },
  port: 3000,
});

console.log("Bun image-enhance server running on http://localhost:3000");
