import React from "react";
import { useEthers } from "@usedapp/core";

interface ButtonConfig {
  onClick: () => void;
  label: string;
}

const WalletConnector = () => {
  const { account, activateBrowserWallet, deactivate } = useEthers();
  const button: ButtonConfig = account
    ? { label: "Disconnect", onClick: deactivate }
    : {
        label: "Connect Wallet",
        onClick: activateBrowserWallet,
      };

  return (
    <div className="text-slate-800 flex items-center">
      {account && <div className="pr-1 text-sm">{account.slice(0, 6)}...</div>}
      <div className="text-xl self-center px-5 py-3 border border-slate-400 rounded-full">
        <button onClick={() => button.onClick()}>{button.label}</button>
      </div>
    </div>
  );
};

export default WalletConnector;
