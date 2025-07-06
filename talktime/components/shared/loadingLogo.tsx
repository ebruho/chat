import Image from "next/image";

type Props = {
  size?: number;
};

const LoadingLogo = ({ size = 100 }: Props) => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <Image
        src="/logo2.png"
        alt="TalkTime logo featuring stylized speech bubbles overlapping in blue and green on a white background, conveying a friendly and welcoming atmosphere"
        width={size}
        height={size}
        className="animate-pulse duration-800"
      />
    </div>
  );
}
export default LoadingLogo;