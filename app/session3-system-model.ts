export type LabFile = { id: string; parent: string; name: string; kind: "folder" | "text" | "image"; deleted?: boolean };
export type SystemLabState = {
  flags: string[];
  apps: { calculator: boolean; explorer: boolean };
  active: "calculator" | "explorer" | null;
  minimized: boolean;
  position: { x: number; y: number };
  files: LabFile[];
  folder: string;
  selection: string | null;
  clipboard: { id: string; cut: boolean } | null;
  search: string;
};

export function initialSystemLabState(): SystemLabState {
  return {
    flags: [], apps: { calculator: false, explorer: false }, active: null, minimized: false,
    position: { x: 40, y: 35 }, folder: "root", selection: null, clipboard: null, search: "",
    files: [
      { id: "photo", parent: "root", name: "image001.jpg", kind: "image" },
      { id: "text", parent: "root", name: "texte001.txt", kind: "text" },
      { id: "draft", parent: "root", name: "brouillon.txt", kind: "text" },
    ],
  };
}

function folderByPath(files: LabFile[], names: string[]) {
  let parent = "root";
  for (const name of names) {
    const next = files.find((f) => !f.deleted && f.kind === "folder" && f.parent === parent && f.name === name);
    if (!next) return null;
    parent = next.id;
  }
  return parent;
}

export function systemLabChecks(mode: "windows" | "files", state: SystemLabState): boolean[] {
  const flags = new Set(state.flags);
  if (mode === "windows") return ["opened-calculator", "moved", "minimized", "restored", "opened-explorer", "switched"].map((f) => flags.has(f));
  const work = folderByPath(state.files, ["2AC_G01", "Informatique", "Travaux"]);
  const images = folderByPath(state.files, ["2AC_G01", "Informatique", "Travaux", "Images"]);
  const documents = folderByPath(state.files, ["2AC_G01", "Informatique", "Travaux", "Documents"]);
  const photo = state.files.find((f) => f.id === "photo" && !f.deleted);
  const text = state.files.find((f) => f.id === "text" && !f.deleted);
  return [
    Boolean(work && images && documents),
    Boolean(images && photo?.parent === images && photo.name === "Photo_club.jpg"),
    Boolean(documents && text?.parent === documents && text.name === "Compte_rendu.txt"),
    Boolean(work && documents && text?.parent === documents && state.files.some((f) => !f.deleted && f.id !== "text" && f.kind === "text" && f.parent === work && f.name === "Compte_rendu.txt")),
    flags.has("searched-photo"),
    flags.has("deleted-draft") && flags.has("restored-draft") && state.files.some((f) => f.id === "draft" && !f.deleted && f.parent === "root"),
  ];
}

export function guidedFileChecks(state: SystemLabState): boolean[] {
  const folder = state.files.find((file) => file.id === "photos" && file.kind === "folder" && file.name === "Photos" && !file.deleted);
  const flags = new Set(state.flags);
  return [
    flags.has("guided-create"),
    Boolean(folder),
    flags.has("guided-select"),
    flags.has("guided-cut"),
    flags.has("guided-open"),
    Boolean(folder && state.files.some((file) => file.id === "photo" && file.parent === folder.id && !file.deleted)),
  ];
}

