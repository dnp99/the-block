import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VehicleDetail } from "@/components/vehicle/VehicleDetail";
import { getVehicleById } from "@/lib/data/vehicles";
import { vehicleTitle } from "@/lib/format";

// Auction phase/countdown is normalized to "now" → render per request.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const vehicle = getVehicleById(id);
  if (!vehicle) return { title: "Vehicle not found — Openlane" };
  return { title: `${vehicleTitle(vehicle)} ${vehicle.trim} — Openlane` };
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = getVehicleById(id);
  if (!vehicle) notFound();

  // Request-time anchor (route is force-dynamic).
  // eslint-disable-next-line react-hooks/purity
  const anchorMs = Date.now();
  return <VehicleDetail vehicle={vehicle} anchorMs={anchorMs} />;
}
