import type { Vehicle } from "@/lib/contracts/vehicle";

/** A complete, valid Vehicle for component/route tests. Override per case. */
export function makeVehicle(over: Partial<Vehicle> = {}): Vehicle {
  return {
    id: "v1",
    vin: "M93TZBXW8FMZYM3KR",
    year: 2025,
    make: "Toyota",
    model: "Tacoma",
    trim: "TRD Sport",
    body_style: "truck",
    exterior_color: "white",
    interior_color: "black",
    engine: "2.4L turbo I4",
    transmission: "automatic",
    drivetrain: "4WD",
    odometer_km: 23495,
    fuel_type: "gasoline",
    condition_grade: 3.0,
    condition_report: "Moderate wear throughout.",
    damage_notes: [],
    title_status: "rebuilt",
    province: "Ontario",
    city: "Hamilton",
    auction_start: "2024-01-01T00:00:00Z",
    starting_bid: 14500,
    reserve_price: 20000,
    buy_now_price: 24500,
    images: ["https://placehold.co/800x600"],
    selling_dealership: "Golden Horseshoe Motors",
    lot: "A-0009",
    current_bid: 26300,
    bid_count: 26,
    ...over,
  };
}
