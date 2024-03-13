'use client';
import NotConnected from "@/components/NotConnected";
import Bank from "@/components/Bank";

import { useAccount } from "wagmi";

export default function Home() {

  const { isConnected } = useAccount();

  return (
    <>
      {isConnected ? (
        <Bank />
      ) : (
        <NotConnected />
      )}
    </>
  );
}
