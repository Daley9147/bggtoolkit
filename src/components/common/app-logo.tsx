import Image from 'next/image';

const AppLogo = () => (
  <Image
    src="https://zthdbkiwyzearxfxcdfn.supabase.co/storage/v1/object/public/signatures/Business-Global-Growth-logo.png"
    alt="Business Growth Global Logo"
    width={150}
    height={40}
    priority
  />
);

export default AppLogo;
