const express = require("express");
const app = express();
const port = 5001;
const Moralis = require("moralis").default;
const cors = require("cors");

require("dotenv").config({ path: ".env" });

app.use(cors());
app.use(express.json());

const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjI1ZjE2ZTk4LTczZjgtNDFkNS1iYTgxLWI0MDY2ZGJjYmRkYSIsIm9yZ0lkIjoiNDA0NDg2IiwidXNlcklkIjoiNDE1NjI0IiwidHlwZUlkIjoiNzY5YmQ4NzYtOTg0OC00ODEyLWFkNjgtOWExNDY0MzA4MWQ2IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MjM1MjUyMDMsImV4cCI6NDg3OTI4NTIwM30.TbG7DPFyD0zM95YUUn3ShbxnHdon2-iBQ-DEf4UaqUo';

app.get("/getnftdata", async (req, res) => {
  try {
    const { query } = req;

    if (!query.contractAddress) {
      return res.status(400).json({ error: "Missing contractAddress query parameter" });
    }

    const contractAddresses = Array.isArray(query.contractAddress) ? query.contractAddress : [query.contractAddress];
    const nftData = [];

    for (const address of contractAddresses) {
      try {
        const response = await Moralis.EvmApi.nft.getNFTTrades({
          address,
          chain: "0x1",
        });
        nftData.push(response);
      } catch (err) {
        console.error(`Error fetching NFT trades for address ${address}: ${err.message}`);
        nftData.push({ error: `Failed to fetch data for ${address}` });
      }
    }

    return res.status(200).json({ nftData });
  } catch (e) {
    console.error(`Error in /getnftdata: ${e.message}`, e);
    return res.status(400).json({ error: e.message });
  }
});



app.get("/getcontractnft", async (req, res) => {
  try {
    const { query } = req;
    console.log(`Received query: ${JSON.stringify(query)}`);
    const chain = query.chain == "0x5" ? "0x5" : "0x1";

    const response = await Moralis.EvmApi.nft.getContractNFTs({
      chain,
      format: "decimal",
      address: query.contractAddress,
    });

    console.log(`Moralis response: ${JSON.stringify(response)}`);
    return res.status(200).json(response);
  } catch (e) {
    console.error(`Error in /getcontractnft: ${e.message}`);
    return res.status(400).json({ error: e.message });
  }
});


app.get("/getnfts", async (req, res) => {
  try {
    const { query } = req;

    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      address: query.address,
      chain: query.chain,
    });

    return res.status(200).json(response);
  } catch (e) {
    console.log(`Something went wrong ${e}`);
    return res.status(400).json();
  }
});

Moralis.start({
  apiKey: MORALIS_API_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  }).on('error', (err) => {
    console.error(`Server error: ${err.message}`);
  });
});

