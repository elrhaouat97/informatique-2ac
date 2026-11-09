import { s4t as t, session4Equipment, session4NetworkEquipment, session4OriginalStock, type Session4Activity } from "./session4-data.ts";
import type { Session4Draft } from "./session4-model.ts";

export const expoSSID = "CLUB-EXPO";
export const expoFile = "Affiche.txt";
export const expoMessage = "Rendez-vous au stand 04 à 10 h.";
export const expoFolder = "Club_reseau";
export const expoPath = ["", "", "192.168.10.21", expoFolder].join("\\");

const image = (name: string) => `session4/images/${name}.webp`;
export const expoMedia = [
  { id: "pc", name: t("PC du bureau", "حاسوب المكتب"), image: image("ordinateur-bureau"), link: "wired", clue: t("Le PC fixe dispose d’une prise RJ45 et d’aucun adaptateur Wi-Fi.", "للحاسوب الثابت منفذ RJ45 ولا يتوفر على محول Wi-Fi.") },
  { id: "printer", name: t("Imprimante du club", "طابعة النادي"), image: image("imprimante"), link: "wired", clue: t("L’enseignant a réservé un câble RJ45 pour cette imprimante.", "خصص الأستاذ كابل RJ45 لهذه الطابعة.") },
  { id: "laptop", name: t("Portable du guide", "حاسوب المرشد المحمول"), image: image("portable-windows"), link: "wifi", clue: t("Le guide doit circuler avec son portable connecté, sans câble au sol.", "يجب أن يتنقل المرشد بحاسوبه متصلًا دون كابل على الأرض.") },
  { id: "tv", name: t("Écran du hall", "شاشة الردهة"), image: image("smart-tv"), link: "wifi", clue: t("La TV est trop loin de la prise réseau et peut rejoindre le Wi-Fi.", "التلفاز بعيد عن منفذ الشبكة ويمكنه الاتصال عبر Wi-Fi.") },
];

export type ExpoPoint = { x: number; y: number };
type PlanNode = ExpoPoint & { id: string; name: string; photo?: string };
type PlanEdge = [string, string];
const pc = image("ordinateur-bureau");
const planPCs: PlanNode[] = [
  { id: "p1", name: "PC-1", x: 18, y: 24, photo: pc },
  { id: "p2", name: "PC-2", x: 82, y: 24, photo: pc },
  { id: "p3", name: "PC-3", x: 82, y: 76, photo: pc },
  { id: "p4", name: "PC-4", x: 18, y: 76, photo: pc },
];
export const expoTopologyNames = [
  { id: "star", label: t("Étoile", "نجمية") },
  { id: "bus", label: t("Bus", "خطية") },
  { id: "ring", label: t("Anneau", "حلقية") },
];
export type ExpoTopology = "star" | "bus" | "ring";
type Plan = {
  id: "A" | "B" | "C"; topology: ExpoTopology; nodes: PlanNode[]; existing: PlanEdge[];
  options: { edge: PlanEdge; label: string }[]; missing: number; trunk?: [ExpoPoint, ExpoPoint];
};
const busNodes = planPCs.map((node, i) => ({ ...node, x: 14 + 24 * i, y: 26 }));
const busTaps = busNodes.map(node => ({ id: `bus-${node.id}`, name: "", x: node.x, y: 70 }));
export const expoPlans: Plan[] = [
  {
    id: "A", topology: "star", nodes: [...planPCs, { id: "sw", name: "Commutateur", x: 50, y: 50, photo: image("commutateur") }],
    existing: [["p1", "sw"], ["p2", "sw"], ["p3", "sw"]], missing: 1,
    options: [{ edge: ["p4", "p3"], label: "PC-4 ↔ PC-3" }, { edge: ["p4", "sw"], label: "PC-4 ↔ commutateur" }, { edge: ["p4", "p1"], label: "PC-4 ↔ PC-1" }],
  },
  {
    id: "B", topology: "bus", nodes: [...busNodes, ...busTaps], trunk: [{ x: 6, y: 70 }, { x: 94, y: 70 }],
    existing: [["p1", "bus-p1"], ["p3", "bus-p3"], ["p4", "bus-p4"]], missing: 2,
    options: [{ edge: ["p2", "p3"], label: "PC-2 ↔ PC-3" }, { edge: ["p2", "p1"], label: "PC-2 ↔ PC-1" }, { edge: ["p2", "bus-p2"], label: "PC-2 ↔ câble commun" }],
  },
  {
    id: "C", topology: "ring", nodes: planPCs, existing: [["p1", "p2"], ["p2", "p3"], ["p3", "p4"]], missing: 0,
    options: [{ edge: ["p4", "p1"], label: "PC-4 ↔ PC-1" }, { edge: ["p4", "p2"], label: "PC-4 ↔ PC-2" }, { edge: ["p3", "p1"], label: "PC-3 ↔ PC-1" }],
  },
];

export function expoPlanFor(topology: ExpoTopology) {
  return expoPlans.find(plan => plan.topology === topology)!;
}

export const expoPatchPorts = Array.from({ length: 8 }, (_,i) => String(i+1));
export function expoPatchConnected(draft: Session4Draft) {
  const { pc21, pc22 } = draft.selections;
  return pc21 !== pc22 && expoPatchPorts.includes(pc21) && expoPatchPorts.includes(pc22);
}

export const expoBuildPortKey=(id:string)=>`build-port-${id}`;
export function expoBuildStatus(draft: Pick<Session4Draft,"selections">){
  const s=draft.selections;
  const installed=s["build-switch"]==="switch";
  const accessPoint=s["build-ap"]==="ap";
  const [a,b,uplink]=["pc21","pc22","ap"].map(id=>s[expoBuildPortKey(id)]);
  const pc21=installed&&expoPatchPorts.includes(a);
  const pc22=installed&&expoPatchPorts.includes(b)&&a!==b;
  const uplinkReady=installed&&accessPoint&&expoPatchPorts.includes(uplink)&&uplink!==a&&uplink!==b;
  const broadcast=accessPoint&&s["build-ssid"]===expoSSID;
  const wifi=broadcast&&s["build-laptop"]===s["build-ssid"];
  return {installed,accessPoint,pc21,pc22,uplink:uplinkReady,broadcast,wifi,wired:pc21&&pc22,mixed:pc21&&pc22&&uplinkReady&&wifi};
}
export function expoBuildChecks(draft:Session4Draft){
  const status=expoBuildStatus(draft);
  return [status.installed,status.pc21,status.pc22,status.accessPoint,status.uplink,status.broadcast,status.wifi,
    status.wired&&draft.checks.includes("build-wired-tested"),
    status.mixed&&draft.checks.includes("build-mixed-tested")];
}

export const expoInvitation = "Invitation.txt";
export const expoInviteCode = "STAND-04";
export function expoInvitationOpened(draft: Session4Draft) {
  return expoShareReady(draft) && draft.selections.remote === "PC-21" && draft.opened;
}

export const expoLoan = {
  label: "PORTABLE-23",
  address: "192.168.10.23",
  registered: [
    { name: "PC-21", address: "192.168.10.21" },
    { name: "PC-22", address: "192.168.10.22" },
  ],
};
export function expoLoanResult(draft: Session4Draft) {
  const { loanName, loanAddress, loanWifi } = draft.selections;
  if (!loanName || !loanAddress || !loanWifi) return "missing";
  if (loanWifi !== expoSSID) return "wifi";
  if (loanAddress !== expoLoan.address) return "address";
  if (loanName !== expoLoan.label) return "name";
  return "received";
}

export type ExpoNetworkKind = "wired" | "wireless" | "mixed" | "diagnostic";
export type ExpoDevice = ExpoPoint & { id: string; name: string; photo?: string; port?: boolean; wifi?: boolean; slot?: "switch" | "ap" };
type Network = {
  nodes: ExpoDevice[]; wires: string[]; clients: string[]; from: string; to: string;
};
export const expoWire = (a: string, b: string) => [a,b].sort().join("|");
const switchSlot: ExpoDevice = { id: "switch", name: "Emplacement central", slot: "switch", x: 51, y: 49 };
const wifiSlot: ExpoDevice = { id: "ap", name: "Emplacement Wi-Fi", slot: "ap", x: 50, y: 32 };
const wiredPC: ExpoDevice = { id: "pc21", name: "PC-21", photo: pc, port: true, x: 16, y: 25 };
const printer: ExpoDevice = { id: "printer", name: "Imprimante", photo: image("imprimante"), port: true, x: 83, y: 49 };
const portable: ExpoDevice = { id: "laptop", name: "Portable-31", photo: image("portable-windows"), wifi: true, x: 19, y: 58 };
const tv: ExpoDevice = { id: "tv", name: "TV du hall", photo: image("smart-tv"), wifi: true, x: 88, y: 24 };
const mixed: Network = {
  nodes: [{ ...wiredPC, x: 13 }, { ...printer, x: 13, y: 75 }, { ...switchSlot, x: 38 }, { ...wifiSlot, x: 63, y: 49 }, tv, { ...portable, x: 88, y: 76 }],
  wires: ["pc21", "printer", "ap"].map(id => expoWire(id, "switch")),
  clients: ["laptop", "tv"], from: "pc21", to: "tv",
};
export const expoNetworks: Record<ExpoNetworkKind, Network> = {
  wired: {
    nodes: [wiredPC, { id: "pc22", name: "PC-22", photo: pc, port: true, x: 16, y: 74 }, switchSlot, printer],
    wires: ["pc21","pc22","printer"].map(id => expoWire(id, "switch")), clients: [],
    from: "pc21", to: "printer",
  },
  wireless: {
    nodes: [portable, wifiSlot, { id: "laptop2", name: "Portable-32", photo: image("portable-mac"), wifi: true, x: 81, y: 58 }],
    wires: [], clients: ["laptop","laptop2"], from: "laptop", to: "laptop2",
  },
  mixed,
  diagnostic: mixed,
};
export const expoUplink = expoWire("switch","ap");
export const expoKit = session4Equipment.filter(e => e.id === "switch" || e.id === "ap" || e.id === "router");

type NetworkDraft = Pick<Session4Draft, "selections" | "links">;
export function expoDeviceType(kind: ExpoNetworkKind, draft: NetworkDraft, slot: "switch" | "ap") {
  return kind === "diagnostic" ? slot : draft.selections[slot] || "";
}
export function expoNetworkWires(kind: ExpoNetworkKind, draft: NetworkDraft) {
  return kind === "diagnostic" && draft.selections.rewired !== "yes"
    ? mixed.wires.filter(wire => wire !== expoUplink)
    : draft.links;
}
export function expoSSIDAt(kind: ExpoNetworkKind, draft: NetworkDraft, device: string) {
  return kind === "diagnostic" ? expoSSID : draft.selections[device] || "";
}
export function expoHasPort(kind: ExpoNetworkKind, draft: NetworkDraft, id: string) {
  const node = expoNetworks[kind].nodes.find(n => n.id === id);
  const slot = node?.slot;
  return !!(node?.port || (slot && expoKit.some(e => e.id === expoDeviceType(kind, draft, slot))));
}

export function expoLinks(kind: ExpoNetworkKind, draft: NetworkDraft) {
  const network = expoNetworks[kind];
  const wired = expoNetworkWires(kind, draft).flatMap(wire => {
    const [a, b] = wire.split("|");
    return a !== b && expoHasPort(kind, draft, a) && expoHasPort(kind, draft, b) ? [{ a, b, wireless: false }] : [];
  });
  const ssid = expoSSIDAt(kind, draft, "ssid");
  const canBroadcast = expoDeviceType(kind, draft, "ap") === "ap" && network.clients.length && ssid;
  const wireless = canBroadcast ? network.clients.filter(id => expoSSIDAt(kind,draft,id) === ssid)
    .map(id => ({ a: "ap", b: id, wireless: true })) : [];
  return [...wired, ...wireless];
}

export function expoRoute(kind: ExpoNetworkKind, draft: NetworkDraft): string[] | null {
  const { from, to } = expoNetworks[kind];
  const links = expoLinks(kind,draft);
  const queue = [[from]], visited = new Set([from]);
  while (queue.length) {
    const path = queue.shift()!;
    const last = path[path.length - 1];
    if (last === to) return path;
    // An end device consumes a frame. Only a switch or an access point relays it.
    const slot = expoNetworks[kind].nodes.find(node => node.id === last)?.slot;
    if (last !== from && (!slot || !["switch","ap"].includes(expoDeviceType(kind,draft,slot)))) continue;
    for (const {a,b} of links) {
      const neighbour = a === last ? b : b === last ? a : null;
      if (neighbour && !visited.has(neighbour)) { visited.add(neighbour); queue.push([...path,neighbour]); }
    }
  }
  return null;
}

export function expoFolderReady(d: Session4Draft) {
  return d.selections.folder?.trim().toLowerCase() === expoFolder.toLowerCase();
}
export function expoShareReady(d: Session4Draft) {
  return expoFolderReady(d) && d.selections.file === "placed" && d.shared && (d.permission === "read" || d.permission === "write");
}
export function expoPathCorrect(path: string) {
  return path.trim().toLowerCase() === expoPath.toLowerCase();
}

export function expoActivityChecks(activity: Session4Activity, d: Session4Draft): boolean[] {
  const s = d.selections;
  switch (activity.kind) {
    case "build":
      return expoBuildChecks(d);
    case "video":
      return activity.video.questions.map(question => s[question.id] === question.answer);
    case "names":
    case "roles": {
      const prefix = activity.kind === "names" ? "name" : "role";
      const equipment = activity.previousId ? session4NetworkEquipment : session4OriginalStock;
      return equipment.map(e => s[`${prefix}-${e.id}`] === e.id);
    }
    case "star":
    case "bus":
    case "ring": {
      const plan = expoPlanFor(activity.kind);
      return [s[`wire-${plan.id}`] === String(plan.missing), s[`topo-${plan.id}`] === plan.topology];
    }
    case "patch":
      return [
        expoPatchPorts.includes(s.pc21),
        expoPatchPorts.includes(s.pc22) && s.pc21 !== s.pc22,
        d.tested && d.delivered && expoPatchConnected(d),
      ];
    case "exchange":
      return [
        expoFolderReady(d),
        s.file === "placed" && expoFolderReady(d),
        expoShareReady(d) && d.permission === "read",
        expoInvitationOpened(d),
        expoInvitationOpened(d) && s.read === "yes" && s.code?.trim().toUpperCase() === expoInviteCode,
      ];
    case "loan":
      return [
        s.loanName === expoLoan.label,
        s.loanAddress === expoLoan.address,
        s.loanWifi === expoSSID,
        d.tested && d.delivered && expoLoanResult(d) === "received",
      ];
    case "inventory":
      return session4Equipment.flatMap(e => [s[`name-${e.id}`] === e.id, s[`role-${e.id}`] === e.id]);
    case "media":
      return expoMedia.map(device => s[device.id] === device.link);
    case "plans":
      return expoPlans.flatMap(plan => [s[`wire-${plan.id}`] === String(plan.missing), s[`topo-${plan.id}`] === plan.topology]);
    case "folder":
      return [
        expoFolderReady(d), s.file === "placed",
        expoShareReady(d) && d.permission === "read", d.opened && expoPathCorrect(d.path) && expoShareReady(d),
        s.copied === "yes" && s.read === "yes" && d.opened && expoPathCorrect(d.path) && expoShareReady(d),
      ];
    case "identity":
      return [
        d.commands.includes("ipconfig"), d.ip.trim() === "192.168.10.21",
        d.commands.includes("hostname"), d.host.trim().toUpperCase() === "PC-21",
        d.commands.includes("ping 192.168.10.22"),
      ];
    case "diagnostic": {
      const wires = expoNetworkWires("diagnostic", d);
      return [
        s.failed === "yes",
        wires.length === mixed.wires.length && mixed.wires.every(wire => wires.includes(wire)),
        d.tested && !!expoRoute("diagnostic", d),
        s.cause === "uplink",
      ];
    }
    case "wired":
    case "wireless":
    case "mixed": {
      const kind = activity.kind;
      const network = expoNetworks[kind];
      const slots = network.nodes.flatMap(node => node.slot ? [node.slot] : []);
      const devices = slots.map(slot => expoDeviceType(kind,d,slot) === slot);
      const wires = expoNetworkWires(kind,d);
      const correctWires = network.wires.map(wire => wires.includes(wire));
      const wifi = network.clients.length ? [
        expoSSIDAt(kind,d,"ssid") === expoSSID,
        ...network.clients.map(id => expoSSIDAt(kind,d,id) === expoSSID),
      ] : [];
      return [...devices, ...correctWires, ...wifi,
        d.tested && wires.length === network.wires.length && !!expoRoute(kind,d)];
    }
    case "practice":
      return [];
  }
}
