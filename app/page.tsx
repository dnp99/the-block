import { SearchView } from "@/components/search/SearchView";
import { getAllVehicles } from "@/lib/data/vehicles";

// Auction phases are normalized to "now", so render per request (not at build time).
export const dynamic = "force-dynamic";

export default function Home() {
  const vehicles = getAllVehicles();
  // Request-time clock for auction normalization. Intentional here: this route is
  // force-dynamic, so it's evaluated per request (not a render-purity concern).
  // eslint-disable-next-line react-hooks/purity
  const anchorMs = Date.now();
  return <SearchView vehicles={vehicles} anchorMs={anchorMs} />;
}
