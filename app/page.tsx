import { SearchView } from "@/components/views/browse/SearchView";
import { getAllVehicles } from "@/lib/data/vehicles";

export const dynamic = "force-dynamic";
const getAuctionNowMs = () => Date.now();

export default function Home() {
  const vehicles = getAllVehicles();
  const auctionNowMs = getAuctionNowMs();
  return <SearchView vehicles={vehicles} auctionNowMs={auctionNowMs} />;
}
