import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VehicleDetail } from "@/components/views/vehicle/VehicleDetail";
import { getVehicleById } from "@/lib/data/vehicles";
import { vehicleTitle } from "@/lib/format";

export const dynamic = "force-dynamic";
const getAuctionNowMs = () => Date.now();

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

  const auctionNowMs = getAuctionNowMs();
  return <VehicleDetail vehicle={vehicle} auctionNowMs={auctionNowMs} />;
}
