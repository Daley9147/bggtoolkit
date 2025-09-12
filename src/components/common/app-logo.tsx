import type { SVGProps } from 'react';

const AppLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width={40}
    height={40}
    {...props}
  >
    <rect width={100} height={100} rx={20} fill="hsl(var(--primary))" />
    <text
      x={50}
      y={55}
      fontFamily="Poppins, sans-serif"
      fontSize={38}
      fontWeight="bold"
      fill="hsl(var(--primary-foreground))"
      textAnchor="middle"
      dominantBaseline="middle"
    >
      BGG
    </text>
  </svg>
);

export default AppLogo;
