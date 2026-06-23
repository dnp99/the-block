import { SearchView } from "@/components/search/SearchView";
import { getAllVehicles } from "@/lib/data/vehicles";

export default function Home() {
  const vehicles = getAllVehicles();
  return <SearchView vehicles={vehicles} />;
}
