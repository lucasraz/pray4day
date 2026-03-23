import { getPredefinedPrayers } from '../../../../../execution/prayer_chains_repository';
import CreateChainForm from './CreateChainForm';

export default async function CreatePrayerChainPage() {
  const prayers = await getPredefinedPrayers();
  return <CreateChainForm prayers={prayers} />;
}
