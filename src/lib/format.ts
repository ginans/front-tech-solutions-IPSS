export function formatFecha(fecha: string | Date): string {
  return new Date(fecha).toLocaleDateString("es-CL");
}

export function formatMoneda(monto: number): string {
  return monto.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
  });
}