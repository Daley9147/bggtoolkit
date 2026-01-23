import Image from 'next/image';

const AppLogo = () => (
  <Image
    src="https://zthdbkiwyzearxfxcdfn.supabase.co/storage/v1/object/public/signatures/MissionMetrics.png"
    alt="Mission Metrics Logo"
    width={150}
    height={40}
    style={{ height: 'auto' }}
    priority
  />
);

export default AppLogo;
