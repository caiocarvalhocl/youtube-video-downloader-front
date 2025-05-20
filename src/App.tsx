import { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("best");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!url) {
      alert("Por favor, insira uma URL válida.");
      return;
    }

    setIsDownloading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/download`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": navigator.userAgent,
          },
          body: JSON.stringify({ url, quality }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert("Erro: " + (errorData.error || "Erro no download"));
        return;
      }

      const titleRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/title`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        },
      );

      let filename = "video.mp4";

      if (titleRes.ok) {
        const data = await titleRes.json();
        const safeTitle = data.title
          ?.trim()
          .replace(/[^\w\s\-]/gi, "")
          .replace(/\s+/g, "_");
        if (safeTitle) {
          filename = `${safeTitle}.mp4`;
        }
      } else {
        console.warn("Não foi possível obter o título. Usando nome padrão.");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      alert("Erro ao baixar o vídeo.");
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">YouTube Video Downloader</h1>
      <form
        onSubmit={handleDownload}
        className="flex flex-col items-center justify-center w-1/2"
      >
        <input
          type="text"
          placeholder="Cole o link do video aqui"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full max-w-md p-3 rounded border border-gray-300"
        />
        <select
          name="quality"
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          className="mt-4 w-full max-w-md p-3 rounded border border-gray-300"
        >
          <option value="best">Melhor Qualidade</option>
        </select>
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
          disabled={isDownloading}
        >
          {isDownloading ? "Baixando..." : "Download"}
        </button>
      </form>
    </div>
  );
}

export default App;
