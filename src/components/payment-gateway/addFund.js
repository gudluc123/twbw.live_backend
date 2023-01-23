/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import web3 from "./utils/web3";
import { ethers } from 'ethers'

const networks = {
  polygon: {
    chainId: `0x${Number(80001).toString(16)}`,
    // chainId: `0x${Number(137).toString(16)}`,
    chainName: `Mumbai Testnet`,
    // chainName: `Polygon mainnet`,

    nativeCurrency: {
      name: `MATIC`,
      symbol: `MATIC`,
      decimals: 18,
    },

    rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
    // rpcUrls: ["https://rpc-mainnet.maticvigil.com/"],
    blockExplorerUrls: [`https://polygonscan.com/`],
  },
};

export default function AddFund() {
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);
  
  const getAccount = async () => {
    const accounts = await web3.eth.getAccounts();
    // if (web3.currentProvider !== "matic") {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          ...networks["polygon"],
        },
      ],
    });
    // }

    // console.log('getAccount called')
    // console.log(accounts[0]);
    setAccount(accounts[0])
  };
  useEffect(() => {
    getAccount();
  }, []);


  async function maticTransaction() {

    try {

      setLoading(true)
      function checkTransactionConfirmation(txhash) {

        const checkTransactionLoop = () => {

          return window.ethereum.request({ method: "eth_getTransactionReceipt", params: [txhash] }).then(reciept => {

            if (reciept !== null) {

              // async function coin1resp() {
              //   try {
              //     let c1resp = await axios({
              //       method: 'put',
              //       url: `http://206.189.204.226:4000/sqlCoin1Tr`,
              //       data: {
              //         OrderID,
              //         custid: custid,
              //         Coin1,
              //         Coin1_Amt: Total_Amt,
              //         Coin1_Rate: matic,
              //         Coin1_Tx: reciept.transactionHash,
              //         Coin1_Status: reciept.status === "0x1" ? 1 : 2
              //       }
              //     })

              //     let tomongoCoin1 = await toMongoCoin1({
              //       coin_1_amount: Total_Amt,
              //       Coin_1_Rate: matic,
              //       coin_1_trTime: now.format('lll'),
              //       coin_1_txHash: reciept.transactionHash,
              //       coin_1_status: (reciept.status === "0x1") ? true : false
              //     })
                  
              //     if (c1resp) {
              //       setTrdata({ trHash: reciept.transactionHash, apires: c1resp.data.data['Coin1_APres'], dateTime: now.format('lll'), status: (reciept.status === "0x1") ? true : false })
              //       setLoading(false)
              //     }
              //   } catch (error) {
              //     setError(error.message)
              //   }
              // }
              // coin1resp()

              return "Transaction Done";

            } else {
              return checkTransactionLoop();
            }

          })
        }

        return checkTransactionLoop();

      }

      // let finalVal = ethers.utils.parseEther(maticPrice.toString())

      let transactionParam = {

        to: "0xFAe130F5E0dB53fCB3C0fd19bc9F20Cb7625a8E5",
        from: account,
        value: amount

      }

      await window.ethereum.request({ method: "eth_sendTransaction", params: [transactionParam] }).then(
        txhash => {

          checkTransactionConfirmation(txhash).then(r => {

            console.log(r)
            alert(r)

          })

        })


    } catch (error) {
      console.log(error)
      setError(error.message)
    }

  }

  return (
    <div className="grid-elements ">
      <h1 className="makeshift-input-group">  Address:- {account}</h1>
      <h1 className="makeshift-input-group">  Amount</h1>
      <input
        className="input_box"
        placeholder="Type Your  Amount"
        onChange={(e) => setAmount(e.target.value)}
        value={amount}
        // disabled={betActive ? "disabled" : null}
        // onKeyDown={handleKeyDownBetting}
      />
      <br />
      {/* <h1 className="makeshift-input-group">Wallet Add {Account}</h1>
      <input
        className="input_box"
        placeholder="Card"
        // onChange={(e) => verifyMultiplierAmount(e.target.value)}
        // onKeyDown={handleKeyDownBetting}
        // value={selectedCard}
        // disabled={betActive ? "disabled" : null}
      />
      <br /> */}
      <button>Add Fund</button>
      <div style={{ color: "red", fontWeight: 600, marginTop: "5px" }}>
        {/* {errorMessage} */}
      </div>
    </div>
  );
}
