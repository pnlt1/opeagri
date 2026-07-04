import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Exporte un tableau d'objets vers un fichier CSV et déclenche le téléchargement.
 * @param filename Le nom du fichier cible (sans l'extension .csv)
 * @param data Le tableau de données
 * @param columns Optionnel: un dictionnaire mapping { cleObjet: "Nom de la colonne dans le CSV" }
 */
export function exportToCSV(filename: string, data: any[], columns?: Record<string, string>) {
  if (!data || !data.length) {
    console.warn("Aucune donnée à exporter.");
    return;
  }

  // Déterminer les clés et les en-têtes
  const keys = Object.keys(data[0]);
  const headers = columns ? keys.map(k => columns[k] || k) : keys;

  // Créer le contenu CSV
  const csvRows = [];
  // Ajouter les en-têtes
  csvRows.push(headers.join(','));

  // Ajouter les données
  for (const row of data) {
    const values = keys.map(k => {
      let val = row[k];
      
      // Gérer les valeurs nulles ou undefined
      if (val === null || val === undefined) {
        val = '';
      }
      
      // Convertir en string et gérer les virgules et guillemets pour le CSV
      const stringVal = String(val);
      if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  
  // Créer un Blob et déclencher le téléchargement
  const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=utf-8;' }); // \uFEFF for BOM (Excel utf-8 support)
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Fonction pour télécharger un conteneur SVG (ex: Recharts) sous forme d'image PNG
export function downloadSvgAsPng(containerId: string, filename: string) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Conteneur ${containerId} introuvable`);
    return false;
  }
  
  const svg = container.querySelector("svg");
  if (!svg) {
    console.error("Aucun SVG trouvé dans le conteneur");
    return false;
  }

  // Cloner le SVG pour ne pas modifier l'original
  const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
  
  // Appliquer le style de fond blanc pour le PNG final
  clonedSvg.style.backgroundColor = "white";
  
  // Convertir le SVG en string
  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  const canvas = document.createElement("canvas");
  
  // Taille originale du SVG
  const svgSize = svg.getBoundingClientRect();
  canvas.width = svgSize.width || 800;
  canvas.height = svgSize.height || 400;
  
  const ctx = canvas.getContext("2d");
  const img = new Image();
  
  // Encodage base64 pour que l'image source soit valide
  img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  
  return new Promise((resolve) => {
    img.onload = () => {
      // Fond blanc
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      
      const canvasdata = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = `${filename}.png`;
      a.href = canvasdata;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      resolve(true);
    };
    img.onerror = () => {
      console.error("Erreur lors de la génération de l'image");
      resolve(false);
    };
  });
}
