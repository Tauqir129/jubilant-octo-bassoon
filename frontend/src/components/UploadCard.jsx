import React, { useState } from "react";

export default function UploadCard() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [enhance, setEnhance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);

  function onFile(e) {
    const f = e.target.files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit(e) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    const form = new FormData();
    form.append("image", file);
    form.append("width", width);
    form.append("height", height);
    form.append("enhance", String(enhance));

    const res = await fetch("/api/transform", { method: "POST", body: form });
    if (!res.ok) {
      alert("Processing failed");
      setLoading(false);
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    setResultUrl(url);
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow">
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Upload</label>
          <input type="file" accept="image/*" onChange={onFile} className="mt-2" />
          {preview && <img src={preview} alt="preview" className="mt-4 w-full h-auto rounded" />}
        </div>
        <div>
          <label className="block text-sm font-medium">Width (px)</label>
          <input type="number" min="0" onChange={(e) => setWidth(Number(e.target.value)||0)} className="mt-2 w-full rounded border p-2" />

          <label className="block text-sm font-medium mt-4">Height (px)</label>
          <input type="number" min="0" onChange={(e) => setHeight(Number(e.target.value)||0)} className="mt-2 w-full rounded border p-2" />

          <label className="flex items-center gap-2 mt-4">
            <input type="checkbox" checked={enhance} onChange={(e) => setEnhance(e.target.checked)} />
            <span className="text-sm">Auto-enhance</span>
          </label>

          <div className="mt-6 flex gap-3">
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-slate-800 text-white">{loading? 'Processing...':'Process'}</button>
            {resultUrl && <a className="px-4 py-2 rounded border" href={resultUrl} download="enhanced.webp">Download</a>}
          </div>

          {resultUrl && (
            <div className="mt-4">
              <img src={resultUrl} alt="result" className="mt-2 w-full rounded" />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
