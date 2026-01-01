
const GEOREF_BASE = "https://apis.datos.gob.ar/georef/api";

export async function fetchProvincias() {
  const res = await fetch(`${GEOREF_BASE}/provincias?campos=id,nombre&max=100`);
  if (!res.ok) throw new Error("Error al obtener provincias");
  const json = await res.json();
  return json.provincias; // [{ id, nombre }, ...]
}

export async function fetchLocalidadesByProvincia(provinciaId, q = "", max = 500) {
  const params = new URLSearchParams();
  params.set("provincia", provinciaId);
  if (q) params.set("nombre", q);
  params.set("max", String(max));
  const res = await fetch(`${GEOREF_BASE}/localidades?${params.toString()}`);
  if (!res.ok) throw new Error("Error al obtener localidades");
  const json = await res.json();
  return json.localidades; // [{ id, nombre, provincia: { id, nombre }, ... }]
}
