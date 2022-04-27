const { expect } = require("chai");
const { ethers } = require("hardhat");

const VOID_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("Playerself NFTs", function () {
  it("Should deploy the Playerself NFT contract", async function () {
    const [owner, notOwner] = await ethers.getSigners();
    const Playerself = await ethers.getContractFactory("Playerself");
    const playerself = await Playerself.connect(owner).deploy("https://a.b/{id}");
    await playerself.deployed();

    expect(await playerself.connect(owner).uri(0)).to.equal("https://a.b/{id}");
  });
  it("Should allow the owner to pause the contract", async function () {
    const [owner, notOwner] = await ethers.getSigners();
    const Playerself = await ethers.getContractFactory("Playerself");
    const playerself = await Playerself.connect(owner).deploy("https://a.b/{id}");
    await playerself.deployed();

    expect(await playerself.connect(owner).paused()).to.equal(false);

    const pauseTx = await playerself.connect(owner).pause();
    await pauseTx.wait();

    expect(await playerself.connect(owner).paused()).to.equal(true);
  });
  it("Should allow the owner to unpause the contract", async function () {
    const [owner, notOwner] = await ethers.getSigners();
    const Playerself = await ethers.getContractFactory("Playerself");
    const playerself = await Playerself.connect(owner).deploy("https://a.b/{id}");
    await playerself.deployed();

    expect(await playerself.connect(owner).paused()).to.equal(false);

    const pauseTx = await playerself.connect(owner).pause();
    await pauseTx.wait();

    expect(await playerself.connect(owner).paused()).to.equal(true);

    const unpauseTx = await playerself.connect(owner).unpause();
    await unpauseTx.wait();

    expect(await playerself.connect(owner).paused()).to.equal(false);
  });  
  it("Should not allow another address to pause the contract", async function () {
    const [owner, notOwner] = await ethers.getSigners();
    const Playerself = await ethers.getContractFactory("Playerself");
    const playerself = await Playerself.connect(owner).deploy("https://a.b/{id}");
    await playerself.deployed();

    expect(await playerself.connect(notOwner).paused()).to.equal(false);

    await expect(playerself.connect(notOwner).pause()).to.be.revertedWith("Playerself: must have pauser role to pause");
  });
  it("Should not allow another address to unpause the contract", async function () {
    const [owner, notOwner] = await ethers.getSigners();
    const Playerself = await ethers.getContractFactory("Playerself");
    const playerself = await Playerself.connect(owner).deploy("https://a.b/{id}");
    await playerself.deployed();

    expect(await playerself.connect(notOwner).paused()).to.equal(false);

    const pauseTx = await playerself.connect(owner).pause();
    await pauseTx.wait();

    expect(await playerself.connect(owner).paused()).to.equal(true);

    await expect(playerself.connect(notOwner).unpause()).to.be.revertedWith("Playerself: must have pauser role to unpause");
  });
  it("Should allow the owner to update the token uri", async function () {
    const [owner, notOwner] = await ethers.getSigners();
    const Playerself = await ethers.getContractFactory("Playerself");
    const playerself = await Playerself.connect(owner).deploy("https://a.b/{id}");
    await playerself.deployed();

    expect(await playerself.connect(owner).uri(0)).to.equal("https://a.b/{id}");

    const setUriTx = await playerself.connect(owner).setUri("https://c.d/{id}");
    await setUriTx.wait();

    expect(await playerself.connect(owner).uri(0)).to.equal("https://c.d/{id}");

  });
  it("Should not allow another address to update the token uri", async function () {
    const [owner, notOwner] = await ethers.getSigners();
    const Playerself = await ethers.getContractFactory("Playerself");
    const playerself = await Playerself.connect(owner).deploy("https://a.b/{id}");
    await playerself.deployed();

    expect(await playerself.connect(owner).uri(0)).to.equal("https://a.b/{id}");

    await expect(playerself.connect(notOwner).setUri("https://c.d/{id}")).to.be.revertedWith("Playerself: unauthorized.");
  });
  it("Should allow the owner to mint some NFTs", async function() {
    const [owner, notOwner] = await ethers.getSigners();
    const Playerself = await ethers.getContractFactory("Playerself");
    const playerself = await Playerself.connect(owner).deploy("https://a.b/{id}");
    await playerself.deployed();

    // Self single mint
    expect(await playerself.connect(owner).balanceOf(owner.address, 1)).to.equal(0);

    const singleOwnMintTx = await playerself.connect(owner).mint(owner.address, 0, 1, []);
    await singleOwnMintTx.wait();

    expect(await playerself.connect(owner).balanceOf(owner.address, 1)).to.equal(1);

    // Single mint to another address
    expect(await playerself.connect(notOwner).balanceOf(notOwner.address, 2)).to.equal(0);

    const singleNotOwnMintTx = await playerself.connect(owner).mint(notOwner.address, 0, 1, []);
    await singleNotOwnMintTx.wait();

    expect(await playerself.connect(notOwner).balanceOf(notOwner.address, 2)).to.equal(1);

    // Self batch mint
    const balanceBatchOwn = await playerself.connect(owner).balanceOfBatch([owner.address, owner.address], [3, 4]);
    expect([parseInt(balanceBatchOwn[0]), parseInt(balanceBatchOwn[1])]).to.eql([0, 0]);

    const batchOwnMint = await playerself.connect(owner).mintBatch(owner.address, [], [1, 1], []);
    await batchOwnMint.wait();

    const balanceBatchOwnRes = await playerself.connect(owner).balanceOfBatch([owner.address, owner.address], [3, 4]);
    expect([parseInt(balanceBatchOwnRes[0]), parseInt(balanceBatchOwnRes[1])]).to.eql([1, 1]);

    // Batch mint to another address
    const balanceBatchNotOwn = await playerself.connect(notOwner).balanceOfBatch([notOwner.address, notOwner.address], [5, 6]);
    expect([parseInt(balanceBatchNotOwn[0]), parseInt(balanceBatchNotOwn[1])]).to.eql([0, 0]);

    const batchNotOwnMint = await playerself.connect(owner).mintBatch(notOwner.address, [], [1, 1], []);
    await batchNotOwnMint.wait();

    const balanceBatchNotOwnRes = await playerself.connect(notOwner).balanceOfBatch([notOwner.address, notOwner.address], [5, 6])
    expect([parseInt(balanceBatchNotOwnRes[0]), parseInt(balanceBatchNotOwnRes[1])]).to.eql([1, 1]);
  });
  it("Should not allow another address to mint 1 NFT", async function () {
    const [owner, notOwner] = await ethers.getSigners();
    const Playerself = await ethers.getContractFactory("Playerself");
    const playerself = await Playerself.connect(owner).deploy("https://a.b/{id}");
    await playerself.deployed();

    await expect(playerself.connect(notOwner).mint(notOwner.address, 0, 1, [])).to.be.revertedWith("Playerself: must have minter role to mint");
  });
  it("Should not allow another address to mint multiple NFTs", async function () {
    const [owner, notOwner] = await ethers.getSigners();
    const Playerself = await ethers.getContractFactory("Playerself");
    const playerself = await Playerself.connect(owner).deploy("https://a.b/{id}");
    await playerself.deployed();

    await expect(playerself.connect(notOwner).mintBatch(notOwner.address, [], [1, 1], [])).to.be.revertedWith("Playerself: must have minter role to mint");
  });
});

describe("Playerself Registry", function () {
  it("Should deploy the Playerself Registry contract", async function () {
    const [owner, notOwner] = await ethers.getSigners();
    const PlayerselfRegistry = await ethers.getContractFactory("PlayerselfRegistry");
    const registry = await PlayerselfRegistry.connect(owner).deploy();
    await registry.deployed();
  });
  it("Should allow the owner add a contract to the registry", async function () {
    const [owner, notOwner] = await ethers.getSigners();
    const PlayerselfRegistry = await ethers.getContractFactory("PlayerselfRegistry");
    const registry = await PlayerselfRegistry.connect(owner).deploy();
    await registry.deployed();

    const Playerself = await ethers.getContractFactory("Playerself");
    const playerself = await Playerself.connect(owner).deploy("https://a.b/{id}");
    await playerself.deployed();

    expect(await registry.connect(owner).isSupported(playerself.address)).to.equal(false);
    
    const setContractTx = await registry.connect(owner).setContract(playerself.address, true);
    await setContractTx.wait();

    expect(await registry.connect(owner).isSupported(playerself.address)).to.equal(true);
  });
  it("Should not allow another address add a contract to the registry", async function () {
    const [owner, notOwner] = await ethers.getSigners();
    const PlayerselfRegistry = await ethers.getContractFactory("PlayerselfRegistry");
    const registry = await PlayerselfRegistry.connect(owner).deploy();
    await registry.deployed();

    const Playerself = await ethers.getContractFactory("Playerself");
    const playerself = await Playerself.connect(owner).deploy("https://a.b/{id}");
    await playerself.deployed();

    expect(await registry.connect(owner).isSupported(playerself.address)).to.equal(false);
    
    await expect(registry.connect(notOwner).setContract(playerself.address, true)).to.be.revertedWith("Unauthorized.");
  });
  it("Should allow the owner add a contract to the registry and then update it", async function () {
    const [owner, notOwner] = await ethers.getSigners();
    const PlayerselfRegistry = await ethers.getContractFactory("PlayerselfRegistry");
    const registry = await PlayerselfRegistry.connect(owner).deploy();
    await registry.deployed();

    const Playerself = await ethers.getContractFactory("Playerself");
    const playerself = await Playerself.connect(owner).deploy("https://a.b/{id}");
    await playerself.deployed();

    expect(await registry.connect(owner).isSupported(playerself.address)).to.equal(false);
    
    const setContractTx = await registry.connect(owner).setContract(playerself.address, true);
    await setContractTx.wait();

    expect(await registry.connect(owner).isSupported(playerself.address)).to.equal(true);
    
    const updateContractTx = await registry.connect(owner).setContract(playerself.address, true)
    await updateContractTx.wait();

    expect((await registry.connect(owner).getNFT(playerself.address)).enabled).to.equal(false);
  });
});

describe("Playerself Auction", function () {
  let Playerself;
  let PlayerselfAuction;
  let PlayerselfRegistry;
  let playerself;
  let sampleERC721;
  let auction;
  let registry;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let feeRecipient;
  let customFeeRecipient;
  let auctionFeeRecipient;
  let addrs;
  let nftStartingBalances = {};

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, feeRecipient, customFeeRecipient, auctionFeeRecipient, ...addrs] = await ethers.getSigners();

    PlayerselfRegistry = await ethers.getContractFactory("PlayerselfRegistry");
    registry = await PlayerselfRegistry.connect(owner).deploy();
    await registry.deployed();

    Playerself = await ethers.getContractFactory("Playerself");
    playerself = await Playerself.connect(owner).deploy("https://a.b/{id}");
    await playerself.deployed();

    SampleERC721 = await ethers.getContractFactory("SampleERC721");
    sampleERC721 = await SampleERC721.connect(owner).deploy([owner.address, addr1.address, addr2.address, addr3.address]);
    await sampleERC721.deployed();

    const setContractTx = await registry.connect(owner).setContract(playerself.address, true);
    await setContractTx.wait();

    const setContract2Tx = await registry.connect(owner).setContract(sampleERC721.address, false);
    await setContract2Tx.wait();

    PlayerselfAuction = await ethers.getContractFactory("PlayerselfAuction");
    auction = await PlayerselfAuction.connect(owner).deploy(registry.address, feeRecipient.address, ethers.utils.parseEther("0.05"));

    let batchMint = await playerself.connect(owner).mintBatch(owner.address, [], [1, 1, 1, 1, 1], []);
    await batchMint.wait();

    nftStartingBalances[owner.address] = [1, 2, 3, 4, 5];

    batchMint = await playerself.connect(owner).mintBatch(addr1.address, [], [1, 1, 1, 1, 1], []);
    await batchMint.wait();

    nftStartingBalances[addr1.address] = [6, 7, 8, 9, 10];

    batchMint = await playerself.connect(owner).mintBatch(addr2.address, [], [1, 1, 1, 1, 1], []);
    await batchMint.wait();

    nftStartingBalances[addr2.address] = [11, 12, 13, 14, 15];

    batchMint = await playerself.connect(owner).mintBatch(addr3.address, [], [1, 1, 1, 1, 1], []);
    await batchMint.wait();

    nftStartingBalances[addr3.address] = [16, 17, 18, 19, 20];


    await (await sampleERC721.connect(owner).setApprovalForAll(auction.address, true)).wait();
    await (await sampleERC721.connect(addr1).setApprovalForAll(auction.address, true)).wait();
    await (await sampleERC721.connect(addr2).setApprovalForAll(auction.address, true)).wait();
    await (await sampleERC721.connect(addr3).setApprovalForAll(auction.address, true)).wait();
    await (await playerself.connect(owner).setApprovalForAll(auction.address, true)).wait();
    await (await playerself.connect(addr1).setApprovalForAll(auction.address, true)).wait();
    await (await playerself.connect(addr2).setApprovalForAll(auction.address, true)).wait();
    await (await playerself.connect(addr3).setApprovalForAll(auction.address, true)).wait();
  });
  it("Should allow an address to create a new auction with 1 NFT", async function () {
    const createAuctionTx = await auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createAuctionTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;
    const newAuction = await auction.connect(owner).nftAuctions(auctionHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(auctionHash);

    expect(newAuction.nftAddress).to.equal(playerself.address);
    expect(parseInt(newAuction.minPrice)).to.equal(1000000000);
    expect(parseInt(newAuction.buyNowPrice)).to.equal(0);
    expect(newAuction.nftSeller).to.equal(owner.address);
    expect(parseInt(newAuction.auctionBidPeriod)).to.equal(24 * 60 * 60);
    expect(parseInt(newAuction.bidIncreasePercentage)).to.equal(parseInt(ethers.utils.parseEther("0.01")));
    expect([parseInt(tokensAndFees[0][0])]).to.eql([nftStartingBalances[owner.address][0]]);
  });
  it("Should allow an address to create a new auction with multiple NFTs", async function () {
    const createAuctionTx = await auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0], nftStartingBalances[owner.address][1]],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createAuctionTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;
    const newAuction = await auction.connect(owner).nftAuctions(auctionHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(auctionHash);

    expect(newAuction.nftAddress).to.equal(playerself.address);
    expect(parseInt(newAuction.minPrice)).to.equal(1000000000);
    expect(parseInt(newAuction.buyNowPrice)).to.equal(0);
    expect(newAuction.nftSeller).to.equal(owner.address);
    expect(parseInt(newAuction.auctionBidPeriod)).to.equal(24 * 60 * 60);
    expect(parseInt(newAuction.bidIncreasePercentage)).to.equal(parseInt(ethers.utils.parseEther("0.01")));
    expect([parseInt(tokensAndFees[0][0]), parseInt(tokensAndFees[0][1])]).to.eql([nftStartingBalances[owner.address][0], nftStartingBalances[owner.address][1]]);
  });
  it("Should allow an address to create a new sale with 1 NFT", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      VOID_ADDRESS,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;
    const newSale = await auction.connect(owner).nftAuctions(saleHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(saleHash);

    expect(newSale.nftAddress).to.equal(playerself.address);
    expect(newSale.nftSeller).to.equal(owner.address);
    expect(newSale.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(newSale.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(parseInt(newSale.auctionBidPeriod)).to.equal(0);
    expect(parseInt(newSale.bidIncreasePercentage)).to.equal(0);
    expect(parseInt(newSale.minPrice)).to.equal(0);
    expect(parseInt(newSale.buyNowPrice)).to.equal(1000000000);
    expect([parseInt(tokensAndFees[0][0])]).to.eql([nftStartingBalances[owner.address][0]]);
  });
  it("Should allow an address to create a new sale with multiple NFTs", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      playerself.address,
      [nftStartingBalances[owner.address][0], nftStartingBalances[owner.address][1]],
      1000000000,
      VOID_ADDRESS,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;
    const newSale = await auction.connect(owner).nftAuctions(saleHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(saleHash);

    expect(newSale.nftAddress).to.equal(playerself.address);
    expect(newSale.nftSeller).to.equal(owner.address);
    expect(newSale.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(newSale.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(parseInt(newSale.auctionBidPeriod)).to.equal(0);
    expect(parseInt(newSale.bidIncreasePercentage)).to.equal(0);
    expect(parseInt(newSale.minPrice)).to.equal(0);
    expect(parseInt(newSale.buyNowPrice)).to.equal(1000000000);
    expect([parseInt(tokensAndFees[0][0]), parseInt(tokensAndFees[0][1])]).to.eql([nftStartingBalances[owner.address][0], nftStartingBalances[owner.address][1]]);
  });
  it("Should allow an auction owner to withdraw its auction", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;
    
    const withdrawAuctionTx = await auction.connect(owner).withdrawAuction(auctionHash);
    await withdrawAuctionTx.wait();
    
    const newAuction = await auction.connect(owner).nftAuctions(auctionHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(auctionHash);

    expect(newAuction.nftAddress).to.equal(VOID_ADDRESS);
    expect(newAuction.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(newAuction.nftSeller).to.equal(VOID_ADDRESS);
    expect(newAuction.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(newAuction.auctionBidPeriod).to.equal(0);
    expect(newAuction.auctionEnd).to.equal(0);
    expect(parseInt(newAuction.minPrice)).to.equal(0);
    expect(parseInt(newAuction.buyNowPrice)).to.equal(0);
    expect(parseInt(newAuction.nftHighestBid)).to.equal(0);
    expect(tokensAndFees[0].length).to.equal(0);
    expect(tokensAndFees[1].length).to.equal(0);
    expect(tokensAndFees[2].length).to.equal(0);
  });
  it("Should allow a sale owner to withdraw its sale", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      VOID_ADDRESS,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;
    const withdrawSaleTx = await auction.connect(owner).withdrawAuction(saleHash);
    await withdrawSaleTx.wait();
    
    const newSale = await auction.connect(owner).nftAuctions(saleHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(saleHash);

    expect(newSale.nftAddress).to.equal(VOID_ADDRESS);
    expect(newSale.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(newSale.nftSeller).to.equal(VOID_ADDRESS);
    expect(newSale.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(newSale.auctionBidPeriod).to.equal(0);
    expect(newSale.auctionEnd).to.equal(0);
    expect(parseInt(newSale.minPrice)).to.equal(0);
    expect(parseInt(newSale.buyNowPrice)).to.equal(0);
    expect(parseInt(newSale.nftHighestBid)).to.equal(0);
    expect(tokensAndFees[0].length).to.equal(0);
    expect(tokensAndFees[1].length).to.equal(0);
    expect(tokensAndFees[2].length).to.equal(0);
  });
  it("Should not allow an address to withdraw a non-owned auction", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;
    
    await expect(auction.connect(addr1).withdrawAuction(auctionHash)).to.be.revertedWith("Unauthorized.");
  });
  it("Should not allow an address to withdraw a non-owned sale", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      VOID_ADDRESS,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    await expect(auction.connect(addr1).withdrawAuction(saleHash)).to.be.revertedWith("Unauthorized.");
  });
  it("Should not allow an address to create an auction with an invalid NFT contract address", async function () {
    await expect(auction.connect(owner).createNftAuction(
      VOID_ADDRESS,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )).to.be.revertedWith("Invalid NFT address.");
  });
  it("Should not allow an address to create an sale with an invalid NFT contract address", async function () {
    await expect(auction.connect(owner).createSale(
      VOID_ADDRESS,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      VOID_ADDRESS,
      [],
      [],
    )).to.be.revertedWith("Invalid NFT address.");
  });
  it("Should not allow an address to create an auction with a non-whitelisted NFT contract", async function () {
    await expect(auction.connect(owner).createNftAuction(
      addr1.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )).to.be.revertedWith("Token not supported.");
  });
  it("Should not allow an address to create a sale with a non-whitelisted NFT contract", async function () {
    await expect(auction.connect(owner).createSale(
      addr1.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      VOID_ADDRESS,
      [],
      [],
    )).to.be.revertedWith("Token not supported.");
  });
  it("Should not allow an address to create an auction with an invalid auction duration", async function () {
    await expect(auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      0,
      0,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )).to.be.revertedWith("Invalid auction bid period.");
  });
  it("Should not allow an address to create an auction without tokens", async function () {
    await expect(auction.connect(owner).createNftAuction(
      playerself.address,
      [],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )).to.be.revertedWith("No tokens provided.");
  });
  it("Should not allow an address to create a sale without tokens", async function () {
    await expect(auction.connect(owner).createSale(
      playerself.address,
      [],
      1000000000,
      VOID_ADDRESS,
      [],
      [],
    )).to.be.revertedWith("No tokens provided.");
  });
  it("Should not allow an address to create an auction with tokens he does not own", async function () {
    await expect(auction.connect(owner).createNftAuction(
      playerself.address,
      [6, 7],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )).to.be.revertedWith("Sender does not own the NFT.");
  });
  it("Should not allow an address to create a sale with tokens he does not own", async function () {
    await expect(auction.connect(owner).createSale(
      playerself.address,
      [6, 7],
      1000000000,
      VOID_ADDRESS,
      [],
      [],
    )).to.be.revertedWith("Sender does not own the NFT.");
  });
  it("Should not allow an address to create a sale without buy now price", async function () {
    await expect(auction.connect(owner).createSale(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      0,
      VOID_ADDRESS,
      [],
      [],
    )).to.be.revertedWith("Buy now price must be greater than 0.");
  });
  it("Should not allow an address to create an auction without matching fee recipients/percentages (1)", async function () {
    await expect(auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [addr1.address],
      [],
    )).to.be.revertedWith("Invalid fees.");
  });
  it("Should not allow an address to create an auction without matching fee recipients/percentages (2)", async function () {
    await expect(auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [100],
    )).to.be.revertedWith("Invalid fees.");
  });
  it("Should not allow an address to create a sale without matching fee recipients/percentages (1)", async function () {
    await expect(auction.connect(owner).createSale(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      VOID_ADDRESS,
      [addr1.address],
      [],
    )).to.be.revertedWith("Invalid fees.");
  });
  it("Should not allow an address to create a sale without matching fee recipients/percentages (2)", async function () {
    await expect(auction.connect(owner).createSale(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      VOID_ADDRESS,
      [],
      [100],
    )).to.be.revertedWith("Invalid fees.");
  });
  it("Should not allow an address to create a sale with the whitelisted buyer matching the seller", async function () {
    await expect(auction.connect(owner).createSale(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      owner.address,
      [],
      [],
    )).to.be.revertedWith("Whitelisted buyer matches the seller.");
  });
  it("Should not allow an address to bid a non existing auction or sale", async function () {
    await expect(auction.connect(owner).makeBid(
      "0x4825c9979530a5687aeb9a6ed2d82e5456d0a852308494a5c4a4d87fc117930f", 
      { value: ethers.utils.parseEther("0.3") }))
    .to.be.revertedWith("Auction does not exist.");
  });
  it("Should not allow an address to bid an auction with no MATIC", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;

    await expect(auction.connect(addr1).makeBid(
      auctionHash, 
      { value: ethers.utils.parseEther("0") }
    )).to.be.revertedWith("Invalid payment.");
  });
  it("Should not allow an address to bid an auction with a value lower than the minimum price", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;

    await expect(auction.connect(addr1).makeBid(
      auctionHash, 
      { value: ethers.utils.parseEther("0.5") }
    )).to.be.revertedWith("Invalid payment.");
  });
  it("Should not allow an address to bid its own auction", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;

    await expect(auction.connect(owner).makeBid(
      auctionHash, 
      { value: ethers.utils.parseEther("1") }
    )).to.be.revertedWith("Bidding own auction?");
  });
  it("Should not allow an address to bid its own sale", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      VOID_ADDRESS,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    await expect(auction.connect(owner).makeBid(
      saleHash, 
      { value: ethers.utils.parseEther("1") }
    )).to.be.revertedWith("Bidding own auction?");
  });
  it("Should allow an address to bid a sale where he's the whitelisted buyer", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("0.3"),
      addr1.address,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    const bidTx = await auction.connect(addr1).makeBid(
      saleHash, 
      { value: ethers.utils.parseEther("0.3") }
    );
    await bidTx.wait();

    const soldSale = await auction.connect(owner).nftAuctions(saleHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(saleHash);

    expect(soldSale.nftAddress).to.equal(VOID_ADDRESS);
    expect(soldSale.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(soldSale.nftSeller).to.equal(VOID_ADDRESS);
    expect(soldSale.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(soldSale.auctionBidPeriod).to.equal(0);
    expect(soldSale.auctionEnd).to.equal(0);
    expect(parseInt(soldSale.minPrice)).to.equal(0);
    expect(parseInt(soldSale.buyNowPrice)).to.equal(0);
    expect(parseInt(soldSale.nftHighestBid)).to.equal(0);
    expect(tokensAndFees[0].length).to.equal(0);
    expect(tokensAndFees[1].length).to.equal(0);
    expect(tokensAndFees[2].length).to.equal(0);
  });
  it("Should not allow an address to bid a sale where he's not the whitelisted buyer", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("0.3"),
      addr1.address,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    await expect(auction.connect(addr2).makeBid(
      saleHash, 
      { value: ethers.utils.parseEther("0.3") }))
    .to.be.revertedWith("Only whitelisted buyer.");
  });
  it("Should allow the auction owner to take the current highest bid", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;
    const startingBalance = await ethers.provider.getBalance(owner.address);
    const newAuction = await auction.connect(owner).nftAuctions(auctionHash);

    const bidTx = await auction.connect(addr1).makeBid(
      auctionHash, 
      { value: ethers.utils.parseEther("1") }
    );
    await bidTx.wait();

    const updatedAuction = await auction.connect(owner).nftAuctions(auctionHash);

    expect(newAuction.nftHighestBidder).to.not.equal(updatedAuction.nftHighestBidder);
    expect(newAuction.nftHighestBid).to.not.equal(updatedAuction.nftHighestBid);
    expect(updatedAuction.nftHighestBidder).to.equal(addr1.address);
    expect(updatedAuction.nftHighestBid).to.equal(ethers.utils.parseEther("1"));

    const takeHighestBidTx = await auction.connect(owner).takeHighestBid(auctionHash);
    await takeHighestBidTx.wait();
  
    const takenAuction = await auction.connect(owner).nftAuctions(auctionHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(auctionHash);

    expect(takenAuction.nftAddress).to.equal(VOID_ADDRESS);
    expect(takenAuction.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(takenAuction.nftSeller).to.equal(VOID_ADDRESS);
    expect(takenAuction.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(takenAuction.auctionBidPeriod).to.equal(0);
    expect(takenAuction.auctionEnd).to.equal(0);
    expect(parseInt(takenAuction.minPrice)).to.equal(0);
    expect(parseInt(takenAuction.buyNowPrice)).to.equal(0);
    expect(parseInt(takenAuction.nftHighestBid)).to.equal(0);
    expect(tokensAndFees[0].length).to.equal(0);
    expect(tokensAndFees[1].length).to.equal(0);
    expect(tokensAndFees[2].length).to.equal(0);

    expect(await playerself.connect(owner).balanceOf(owner.address, nftStartingBalances[owner.address][0])).to.equal(0);
    expect(await playerself.connect(addr1).balanceOf(addr1.address, nftStartingBalances[owner.address][0])).to.equal(1);

    const endBalance = await ethers.provider.getBalance(owner.address);
    expect(parseInt(endBalance.toString())).to.greaterThan(parseInt(startingBalance.toString()));
  });
  it("Should not allow the auction owner to settle the auction while it's still going", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;
    
    await expect(auction.connect(owner).settleAuction(auctionHash)).to.be.revertedWith("Auction is still going.");
  });
  it("Should not allow an address to settle an auction while it's still going", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;
    
    await expect(auction.connect(addr1).settleAuction(auctionHash)).to.be.revertedWith("Auction is still going.");
  });
  it("Should allow more addresses to bid and then the auction owner to take the current highest bid", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;
    const startingBalance = await ethers.provider.getBalance(owner.address);
    const newAuction = await auction.connect(owner).nftAuctions(auctionHash);

    const bidTx = await auction.connect(addr1).makeBid(
      auctionHash, 
      { value: ethers.utils.parseEther("1") }
    );
    await bidTx.wait();

    const updatedAuction = await auction.connect(owner).nftAuctions(auctionHash);

    expect(newAuction.nftHighestBidder).to.not.equal(updatedAuction.nftHighestBidder);
    expect(newAuction.nftHighestBid).to.not.equal(updatedAuction.nftHighestBid);
    expect(updatedAuction.nftHighestBidder).to.equal(addr1.address);
    expect(updatedAuction.nftHighestBid).to.equal(ethers.utils.parseEther("1"));

    const bid2Tx = await auction.connect(addr2).makeBid(
      auctionHash, 
      { value: ethers.utils.parseEther("2") }
    );
    await bid2Tx.wait();

    const updatedAuction2 = await auction.connect(owner).nftAuctions(auctionHash);

    expect(updatedAuction2.nftHighestBidder).to.not.equal(updatedAuction.nftHighestBidder);
    expect(updatedAuction2.nftHighestBid).to.not.equal(updatedAuction.nftHighestBid);
    expect(updatedAuction2.nftHighestBidder).to.equal(addr2.address);
    expect(updatedAuction2.nftHighestBid).to.equal(ethers.utils.parseEther("2"));

    const takeHighestBidTx = await auction.connect(owner).takeHighestBid(auctionHash);
    await takeHighestBidTx.wait();
  
    const takenAuction = await auction.connect(owner).nftAuctions(auctionHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(auctionHash);

    expect(takenAuction.nftAddress).to.equal(VOID_ADDRESS);
    expect(takenAuction.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(takenAuction.nftSeller).to.equal(VOID_ADDRESS);
    expect(takenAuction.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(takenAuction.auctionBidPeriod).to.equal(0);
    expect(takenAuction.auctionEnd).to.equal(0);
    expect(parseInt(takenAuction.minPrice)).to.equal(0);
    expect(parseInt(takenAuction.buyNowPrice)).to.equal(0);
    expect(parseInt(takenAuction.nftHighestBid)).to.equal(0);
    expect(tokensAndFees[0].length).to.equal(0);
    expect(tokensAndFees[1].length).to.equal(0);
    expect(tokensAndFees[2].length).to.equal(0);

    expect(await playerself.connect(owner).balanceOf(owner.address, nftStartingBalances[owner.address][0])).to.equal(0);
    expect(await playerself.connect(addr1).balanceOf(addr1.address, nftStartingBalances[owner.address][0])).to.equal(0);
    expect(await playerself.connect(addr2).balanceOf(addr2.address, nftStartingBalances[owner.address][0])).to.equal(1);

    const endBalance = await ethers.provider.getBalance(owner.address);
    expect(parseInt(endBalance.toString())).to.greaterThan(parseInt(startingBalance.toString()));
  });
  it("Should allow the auction owner to update the minimum price", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;

    const updateMinPriceTx = await auction.connect(owner).updateMinimumPrice(auctionHash, ethers.utils.parseEther("2"));
    await updateMinPriceTx.wait();

    const updatedAuction = await auction.connect(owner).nftAuctions(auctionHash);
    expect(parseInt(updatedAuction.minPrice)).to.equal(parseInt(ethers.utils.parseEther("2")));
  });
  it("Should not allow a address to update the minimum price of a non-owned auction", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;

    await expect(auction.connect(addr1).updateMinimumPrice(auctionHash, ethers.utils.parseEther("2"))).to.be.revertedWith("Unauthorized.");
  });
  it("Should allow the auction owner to update the buy now price", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;

    const updateBuyNowPriceTx = await auction.connect(owner).updateBuyNowPrice(auctionHash, ethers.utils.parseEther("2"));
    await updateBuyNowPriceTx.wait();

    const updatedAuction = await auction.connect(owner).nftAuctions(auctionHash);
    expect(parseInt(updatedAuction.buyNowPrice)).to.equal(parseInt(ethers.utils.parseEther("2")));
  });
  it("Should not allow a address to update the buy now price of a non-owned auction", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;

    await expect(auction.connect(addr1).updateBuyNowPrice(auctionHash, ethers.utils.parseEther("2"))).to.be.revertedWith("Unauthorized.");
  });
  it("Should allow a sale owner to update the buy now price", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("0.3"),
      addr1.address,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    const updateBuyNowPriceTx = await auction.connect(owner).updateBuyNowPrice(saleHash, ethers.utils.parseEther("2"));
    await updateBuyNowPriceTx.wait();

    const updatedSale = await auction.connect(owner).nftAuctions(saleHash);
    expect(parseInt(updatedSale.buyNowPrice)).to.equal(parseInt(ethers.utils.parseEther("2")));
  });
  it("Should not allow an address to update the buy now price of a non owned sale", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("0.3"),
      addr1.address,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    await expect(auction.connect(addr1).updateBuyNowPrice(saleHash, ethers.utils.parseEther("2"))).to.be.revertedWith("Unauthorized.");
  });
  it("Should allow a sale owner to update the whitelisted buyer", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("0.3"),
      addr1.address,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    const updateBuyerTx = await auction.connect(owner).updateWhitelistedBuyer(saleHash, addr2.address);
    await updateBuyerTx.wait();

    const updatedSale = await auction.connect(owner).nftAuctions(saleHash);
    expect(updatedSale.whitelistedBuyer).to.equal(addr2.address);
  });
  it("Should not allow an address to update the whitelisted buyer of a non owned sale", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("0.3"),
      addr1.address,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    await expect(auction.connect(addr1).updateWhitelistedBuyer(saleHash, addr2.address)).to.be.revertedWith("Unauthorized.");
  });
  it("Should not allow a address to update the min price of a sale", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("0.3"),
      addr1.address,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    await expect(auction.connect(owner).updateMinimumPrice(saleHash, ethers.utils.parseEther("2"))).to.be.revertedWith("Not an auction.");
  });
  it("Should allow the owner to set a fee recipient", async function () {
    const setFeeRecipientTx = await auction.connect(owner).setFeeRecipient(
      playerself.address,
      customFeeRecipient.address,
    );
    await setFeeRecipientTx.wait();
  });
  it("Should not allow an address to set a fee recipient", async function () {
    await expect(auction.connect(addr1).setFeeRecipient(
      playerself.address,
      customFeeRecipient.address,
    )).to.be.revertedWith("Unauthorized.");
  });
  it("Should not allow an owner to set a fee recipient with invalid address", async function () {
    await expect(auction.connect(owner).setFeeRecipient(
      playerself.address,
      VOID_ADDRESS,
    )).to.be.revertedWith("Invalid address.");
  });
  it("Should not allow an owner to set a fee recipient for an nft with an invalid address", async function () {
    await expect(auction.connect(owner).setFeeRecipient(
      VOID_ADDRESS,
      customFeeRecipient.address,
    )).to.be.revertedWith("Invalid address.");
  });
  it("Should allow the fee to be split between the default fee recipient and the newly set NFT fee recipient", async function () {
    const setFeeRecipientTx = await auction.connect(owner).setFeeRecipient(
      playerself.address,
      customFeeRecipient.address,
    );
    await setFeeRecipientTx.wait();

    const startingBalance = await ethers.provider.getBalance(customFeeRecipient.address);

    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("0.5"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;
    const startingOwnerBalance = await ethers.provider.getBalance(owner.address);
    const startingFeeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);
    const newAuction = await auction.connect(owner).nftAuctions(auctionHash);

    const bidTx = await auction.connect(addr1).makeBid(
      auctionHash, 
      { value: ethers.utils.parseEther("0.5") }
    );
    await bidTx.wait();

    const updatedAuction = await auction.connect(owner).nftAuctions(auctionHash);

    expect(newAuction.nftHighestBidder).to.not.equal(updatedAuction.nftHighestBidder);
    expect(newAuction.nftHighestBid).to.not.equal(updatedAuction.nftHighestBid);
    expect(updatedAuction.nftHighestBidder).to.equal(addr1.address);
    expect(updatedAuction.nftHighestBid).to.equal(ethers.utils.parseEther("0.5"));

    const bid2Tx = await auction.connect(addr2).makeBid(
      auctionHash, 
      { value: ethers.utils.parseEther("1") }
    );
    await bid2Tx.wait();

    const updatedAuction2 = await auction.connect(owner).nftAuctions(auctionHash);

    expect(updatedAuction2.nftHighestBidder).to.not.equal(updatedAuction.nftHighestBidder);
    expect(updatedAuction2.nftHighestBid).to.not.equal(updatedAuction.nftHighestBid);
    expect(updatedAuction2.nftHighestBidder).to.equal(addr2.address);
    expect(updatedAuction2.nftHighestBid).to.equal(ethers.utils.parseEther("1"));

    const takeHighestBidTx = await auction.connect(owner).takeHighestBid(auctionHash);
    await takeHighestBidTx.wait();
  
    const takenAuction = await auction.connect(owner).nftAuctions(auctionHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(auctionHash);

    expect(takenAuction.nftAddress).to.equal(VOID_ADDRESS);
    expect(takenAuction.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(takenAuction.nftSeller).to.equal(VOID_ADDRESS);
    expect(takenAuction.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(takenAuction.auctionBidPeriod).to.equal(0);
    expect(takenAuction.auctionEnd).to.equal(0);
    expect(parseInt(takenAuction.minPrice)).to.equal(0);
    expect(parseInt(takenAuction.buyNowPrice)).to.equal(0);
    expect(parseInt(takenAuction.nftHighestBid)).to.equal(0);
    expect(tokensAndFees[0].length).to.equal(0);
    expect(tokensAndFees[1].length).to.equal(0);
    expect(tokensAndFees[2].length).to.equal(0);

    expect(await playerself.connect(owner).balanceOf(owner.address, nftStartingBalances[owner.address][0])).to.equal(0);
    expect(await playerself.connect(addr1).balanceOf(addr1.address, nftStartingBalances[owner.address][0])).to.equal(0);
    expect(await playerself.connect(addr2).balanceOf(addr2.address, nftStartingBalances[owner.address][0])).to.equal(1);

    const endOwnerBalance = await ethers.provider.getBalance(owner.address);
    expect(parseInt(endOwnerBalance.toString())).to.greaterThan(parseInt(startingOwnerBalance.toString()));

    const endFeeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);
    expect(parseInt(endFeeRecipientBalance.toString())).to.greaterThan(parseInt(startingFeeRecipientBalance.toString()));

    const endBalance = await ethers.provider.getBalance(customFeeRecipient.address);
    expect(parseInt(endBalance.toString())).to.greaterThan(parseInt(startingBalance.toString()));
  });
  it("Should allow the fee to be split between the default fee recipient and the newly set NFT fee recipient in a sale", async function () {
    const setFeeRecipientTx = await auction.connect(owner).setFeeRecipient(
      playerself.address,
      customFeeRecipient.address,
    );
    await setFeeRecipientTx.wait();

    const startingBalance = await ethers.provider.getBalance(customFeeRecipient.address);
    const startingFeeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);
    const startingOwnerBalance = await ethers.provider.getBalance(owner.address);

    const createSaleTx = await auction.connect(owner).createSale(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      addr1.address,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    const bidTx = await auction.connect(addr1).makeBid(
      saleHash, 
      { value: ethers.utils.parseEther("1") }
    );
    await bidTx.wait();

    const soldSale = await auction.connect(owner).nftAuctions(saleHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(saleHash);

    expect(soldSale.nftAddress).to.equal(VOID_ADDRESS);
    expect(soldSale.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(soldSale.nftSeller).to.equal(VOID_ADDRESS);
    expect(soldSale.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(soldSale.auctionBidPeriod).to.equal(0);
    expect(soldSale.auctionEnd).to.equal(0);
    expect(parseInt(soldSale.minPrice)).to.equal(0);
    expect(parseInt(soldSale.buyNowPrice)).to.equal(0);
    expect(parseInt(soldSale.nftHighestBid)).to.equal(0);
    expect(tokensAndFees[0].length).to.equal(0);
    expect(tokensAndFees[1].length).to.equal(0);
    expect(tokensAndFees[2].length).to.equal(0);

    const endOwnerBalance = await ethers.provider.getBalance(owner.address);

    const endFeeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);

    const endBalance = await ethers.provider.getBalance(customFeeRecipient.address);

    expect(parseInt(endOwnerBalance.toString())).to.greaterThan(parseInt(startingOwnerBalance.toString()));
    expect(parseInt(endFeeRecipientBalance.toString())).to.greaterThan(parseInt(startingFeeRecipientBalance.toString()));
    expect(parseInt(endBalance.toString())).to.greaterThan(parseInt(startingBalance.toString()));
  });
  it("Should allow extra fee recipients on sales", async function () {
    const setFeeRecipientTx = await auction.connect(owner).setFeeRecipient(
      playerself.address,
      customFeeRecipient.address,
    );
    await setFeeRecipientTx.wait();

    const startingBalance = await ethers.provider.getBalance(customFeeRecipient.address);
    const startingFeeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);
    const startingExtraFeeRecipientBalance = await ethers.provider.getBalance(auctionFeeRecipient.address);
    const startingOwnerBalance = await ethers.provider.getBalance(owner.address);

    const createSaleTx = await auction.connect(owner).createSale(
      playerself.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      addr1.address,
      [auctionFeeRecipient.address],
      [ethers.utils.parseEther("0.05")],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    const bidTx = await auction.connect(addr1).makeBid(
      saleHash, 
      { value: ethers.utils.parseEther("1") }
    );
    await bidTx.wait();

    const soldSale = await auction.connect(owner).nftAuctions(saleHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(saleHash);

    expect(soldSale.nftAddress).to.equal(VOID_ADDRESS);
    expect(soldSale.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(soldSale.nftSeller).to.equal(VOID_ADDRESS);
    expect(soldSale.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(soldSale.auctionBidPeriod).to.equal(0);
    expect(soldSale.auctionEnd).to.equal(0);
    expect(parseInt(soldSale.minPrice)).to.equal(0);
    expect(parseInt(soldSale.buyNowPrice)).to.equal(0);
    expect(parseInt(soldSale.nftHighestBid)).to.equal(0);
    expect(tokensAndFees[0].length).to.equal(0);
    expect(tokensAndFees[1].length).to.equal(0);
    expect(tokensAndFees[2].length).to.equal(0);

    const endOwnerBalance = await ethers.provider.getBalance(owner.address);

    const endFeeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);

    const endBalance = await ethers.provider.getBalance(customFeeRecipient.address);

    const endExtraFeeRecipientBalance = await ethers.provider.getBalance(auctionFeeRecipient.address)

    expect(parseInt(endOwnerBalance.toString())).to.greaterThan(parseInt(startingOwnerBalance.toString()));
    expect(parseInt(endFeeRecipientBalance.toString())).to.greaterThan(parseInt(startingFeeRecipientBalance.toString()));
    expect(parseInt(endBalance.toString())).to.greaterThan(parseInt(startingBalance.toString()));
    expect(parseInt(endExtraFeeRecipientBalance.toString())).to.greaterThan(parseInt(startingExtraFeeRecipientBalance.toString()));
  });
  it("[ERC-721] Should allow an address to create a new auction with 1 NFT", async function () {
    const createAuctionTx = await auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createAuctionTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;
    const newAuction = await auction.connect(owner).nftAuctions(auctionHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(auctionHash);

    expect(newAuction.nftAddress).to.equal(sampleERC721.address);
    expect(parseInt(newAuction.minPrice)).to.equal(1000000000);
    expect(parseInt(newAuction.buyNowPrice)).to.equal(0);
    expect(newAuction.nftSeller).to.equal(owner.address);
    expect(parseInt(newAuction.auctionBidPeriod)).to.equal(24 * 60 * 60);
    expect(parseInt(newAuction.bidIncreasePercentage)).to.equal(parseInt(ethers.utils.parseEther("0.01")));
    expect([parseInt(tokensAndFees[0][0])]).to.eql([nftStartingBalances[owner.address][0]]);
  });
  it("[ERC-721] Should allow an address to create a new auction with multiple NFTs", async function () {
    const createAuctionTx = await auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0], nftStartingBalances[owner.address][1]],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createAuctionTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;
    const newAuction = await auction.connect(owner).nftAuctions(auctionHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(auctionHash);

    expect(newAuction.nftAddress).to.equal(sampleERC721.address);
    expect(parseInt(newAuction.minPrice)).to.equal(1000000000);
    expect(parseInt(newAuction.buyNowPrice)).to.equal(0);
    expect(newAuction.nftSeller).to.equal(owner.address);
    expect(parseInt(newAuction.auctionBidPeriod)).to.equal(24 * 60 * 60);
    expect(parseInt(newAuction.bidIncreasePercentage)).to.equal(parseInt(ethers.utils.parseEther("0.01")));
    expect([parseInt(tokensAndFees[0][0]), parseInt(tokensAndFees[0][1])]).to.eql([nftStartingBalances[owner.address][0], nftStartingBalances[owner.address][1]]);
  });
  it("[ERC-721] Should allow an address to create a new sale with 1 NFT", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      VOID_ADDRESS,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;
    const newSale = await auction.connect(owner).nftAuctions(saleHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(saleHash);

    expect(newSale.nftAddress).to.equal(sampleERC721.address);
    expect(newSale.nftSeller).to.equal(owner.address);
    expect(newSale.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(newSale.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(parseInt(newSale.auctionBidPeriod)).to.equal(0);
    expect(parseInt(newSale.bidIncreasePercentage)).to.equal(0);
    expect(parseInt(newSale.minPrice)).to.equal(0);
    expect(parseInt(newSale.buyNowPrice)).to.equal(1000000000);
    expect([parseInt(tokensAndFees[0][0])]).to.eql([nftStartingBalances[owner.address][0]]);
  });
  it("[ERC-721] Should allow an address to create a new sale with multiple NFTs", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0], nftStartingBalances[owner.address][1]],
      1000000000,
      VOID_ADDRESS,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;
    const newSale = await auction.connect(owner).nftAuctions(saleHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(saleHash);

    expect(newSale.nftAddress).to.equal(sampleERC721.address);
    expect(newSale.nftSeller).to.equal(owner.address);
    expect(newSale.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(newSale.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(parseInt(newSale.auctionBidPeriod)).to.equal(0);
    expect(parseInt(newSale.bidIncreasePercentage)).to.equal(0);
    expect(parseInt(newSale.minPrice)).to.equal(0);
    expect(parseInt(newSale.buyNowPrice)).to.equal(1000000000);
    expect([parseInt(tokensAndFees[0][0]), parseInt(tokensAndFees[0][1])]).to.eql([nftStartingBalances[owner.address][0], nftStartingBalances[owner.address][1]]);
  });
  it("[ERC-721] Should allow an auction owner to withdraw its auction", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;
    
    const withdrawAuctionTx = await auction.connect(owner).withdrawAuction(auctionHash);
    await withdrawAuctionTx.wait();
    
    const newAuction = await auction.connect(owner).nftAuctions(auctionHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(auctionHash);

    expect(newAuction.nftAddress).to.equal(VOID_ADDRESS);
    expect(newAuction.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(newAuction.nftSeller).to.equal(VOID_ADDRESS);
    expect(newAuction.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(newAuction.auctionBidPeriod).to.equal(0);
    expect(newAuction.auctionEnd).to.equal(0);
    expect(parseInt(newAuction.minPrice)).to.equal(0);
    expect(parseInt(newAuction.buyNowPrice)).to.equal(0);
    expect(parseInt(newAuction.nftHighestBid)).to.equal(0);
    expect(tokensAndFees[0].length).to.equal(0);
    expect(tokensAndFees[1].length).to.equal(0);
    expect(tokensAndFees[2].length).to.equal(0);
  });
  it("[ERC-721] Should allow a sale owner to withdraw its sale", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      VOID_ADDRESS,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;
    const withdrawSaleTx = await auction.connect(owner).withdrawAuction(saleHash);
    await withdrawSaleTx.wait();
    
    const newSale = await auction.connect(owner).nftAuctions(saleHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(saleHash);

    expect(newSale.nftAddress).to.equal(VOID_ADDRESS);
    expect(newSale.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(newSale.nftSeller).to.equal(VOID_ADDRESS);
    expect(newSale.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(newSale.auctionBidPeriod).to.equal(0);
    expect(newSale.auctionEnd).to.equal(0);
    expect(parseInt(newSale.minPrice)).to.equal(0);
    expect(parseInt(newSale.buyNowPrice)).to.equal(0);
    expect(parseInt(newSale.nftHighestBid)).to.equal(0);
    expect(tokensAndFees[0].length).to.equal(0);
    expect(tokensAndFees[1].length).to.equal(0);
    expect(tokensAndFees[2].length).to.equal(0);
  });
  it("[ERC-721] Should not allow an address to withdraw a non-owned auction", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;
    
    await expect(auction.connect(addr1).withdrawAuction(auctionHash)).to.be.revertedWith("Unauthorized.");
  });
  it("[ERC-721] Should not allow an address to withdraw a non-owned sale", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      VOID_ADDRESS,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    await expect(auction.connect(addr1).withdrawAuction(saleHash)).to.be.revertedWith("Unauthorized.");
  });
  it("[ERC-721] Should not allow an address to create an auction with an invalid NFT contract address", async function () {
    await expect(auction.connect(owner).createNftAuction(
      VOID_ADDRESS,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )).to.be.revertedWith("Invalid NFT address.");
  });
  it("[ERC-721] Should not allow an address to create an sale with an invalid NFT contract address", async function () {
    await expect(auction.connect(owner).createSale(
      VOID_ADDRESS,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      VOID_ADDRESS,
      [],
      [],
    )).to.be.revertedWith("Invalid NFT address.");
  });
  it("[ERC-721] Should not allow an address to create an auction with a non-whitelisted NFT contract", async function () {
    await expect(auction.connect(owner).createNftAuction(
      addr1.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )).to.be.revertedWith("Token not supported.");
  });
  it("[ERC-721] Should not allow an address to create a sale with a non-whitelisted NFT contract", async function () {
    await expect(auction.connect(owner).createSale(
      addr1.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      VOID_ADDRESS,
      [],
      [],
    )).to.be.revertedWith("Token not supported.");
  });
  it("[ERC-721] Should not allow an address to create an auction with an invalid auction duration", async function () {
    await expect(auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      0,
      0,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )).to.be.revertedWith("Invalid auction bid period.");
  });
  it("[ERC-721] Should not allow an address to create an auction without tokens", async function () {
    await expect(auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )).to.be.revertedWith("No tokens provided.");
  });
  it("[ERC-721] Should not allow an address to create a sale without tokens", async function () {
    await expect(auction.connect(owner).createSale(
      sampleERC721.address,
      [],
      1000000000,
      VOID_ADDRESS,
      [],
      [],
    )).to.be.revertedWith("No tokens provided.");
  });
  it("[ERC-721] Should not allow an address to create an auction with tokens he does not own", async function () {
    await expect(auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [6, 7],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )).to.be.revertedWith("Sender does not own the NFT.");
  });
  it("[ERC-721] Should not allow an address to create a sale with tokens he does not own", async function () {
    await expect(auction.connect(owner).createSale(
      sampleERC721.address,
      [6, 7],
      1000000000,
      VOID_ADDRESS,
      [],
      [],
    )).to.be.revertedWith("Sender does not own the NFT.");
  });
  it("[ERC-721] Should not allow an address to create a sale without buy now price", async function () {
    await expect(auction.connect(owner).createSale(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      0,
      VOID_ADDRESS,
      [],
      [],
    )).to.be.revertedWith("Buy now price must be greater than 0.");
  });
  it("[ERC-721] Should not allow an address to create an auction without matching fee recipients/percentages (1)", async function () {
    await expect(auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [addr1.address],
      [],
    )).to.be.revertedWith("Invalid fees.");
  });
  it("[ERC-721] Should not allow an address to create an auction without matching fee recipients/percentages (2)", async function () {
    await expect(auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [100],
    )).to.be.revertedWith("Invalid fees.");
  });
  it("[ERC-721] Should not allow an address to create a sale without matching fee recipients/percentages (1)", async function () {
    await expect(auction.connect(owner).createSale(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      VOID_ADDRESS,
      [addr1.address],
      [],
    )).to.be.revertedWith("Invalid fees.");
  });
  it("[ERC-721] Should not allow an address to create a sale without matching fee recipients/percentages (2)", async function () {
    await expect(auction.connect(owner).createSale(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      VOID_ADDRESS,
      [],
      [100],
    )).to.be.revertedWith("Invalid fees.");
  });
  it("[ERC-721] Should not allow an address to create a sale with the whitelisted buyer matching the seller", async function () {
    await expect(auction.connect(owner).createSale(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      1000000000,
      owner.address,
      [],
      [],
    )).to.be.revertedWith("Whitelisted buyer matches the seller.");
  });
  it("[ERC-721] Should not allow an address to bid a non existing auction or sale", async function () {
    await expect(auction.connect(owner).makeBid(
      "0x4825c9979530a5687aeb9a6ed2d82e5456d0a852308494a5c4a4d87fc117930f", 
      { value: ethers.utils.parseEther("0.3") }))
    .to.be.revertedWith("Auction does not exist.");
  });
  it("[ERC-721] Should not allow an address to bid an auction with no MATIC", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;

    await expect(auction.connect(addr1).makeBid(
      auctionHash, 
      { value: ethers.utils.parseEther("0") }
    )).to.be.revertedWith("Invalid payment.");
  });
  it("[ERC-721] Should not allow an address to bid an auction with a value lower than the minimum price", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;

    await expect(auction.connect(addr1).makeBid(
      auctionHash, 
      { value: ethers.utils.parseEther("0.5") }
    )).to.be.revertedWith("Invalid payment.");
  });
  it("[ERC-721] Should not allow an address to bid its own auction", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;

    await expect(auction.connect(owner).makeBid(
      auctionHash, 
      { value: ethers.utils.parseEther("1") }
    )).to.be.revertedWith("Bidding own auction?");
  });
  it("[ERC-721] Should not allow an address to bid its own sale", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      VOID_ADDRESS,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    await expect(auction.connect(owner).makeBid(
      saleHash, 
      { value: ethers.utils.parseEther("1") }
    )).to.be.revertedWith("Bidding own auction?");
  });
  it("[ERC-721] Should allow an address to bid a sale where he's the whitelisted buyer", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("0.3"),
      addr1.address,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    const bidTx = await auction.connect(addr1).makeBid(
      saleHash, 
      { value: ethers.utils.parseEther("0.3") }
    );
    await bidTx.wait();

    const soldSale = await auction.connect(owner).nftAuctions(saleHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(saleHash);

    expect(soldSale.nftAddress).to.equal(VOID_ADDRESS);
    expect(soldSale.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(soldSale.nftSeller).to.equal(VOID_ADDRESS);
    expect(soldSale.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(soldSale.auctionBidPeriod).to.equal(0);
    expect(soldSale.auctionEnd).to.equal(0);
    expect(parseInt(soldSale.minPrice)).to.equal(0);
    expect(parseInt(soldSale.buyNowPrice)).to.equal(0);
    expect(parseInt(soldSale.nftHighestBid)).to.equal(0);
    expect(tokensAndFees[0].length).to.equal(0);
    expect(tokensAndFees[1].length).to.equal(0);
    expect(tokensAndFees[2].length).to.equal(0);
  });
  it("[ERC-721] Should not allow an address to bid a sale where he's not the whitelisted buyer", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("0.3"),
      addr1.address,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    await expect(auction.connect(addr2).makeBid(
      saleHash, 
      { value: ethers.utils.parseEther("0.3") }))
    .to.be.revertedWith("Only whitelisted buyer.");
  });
  it("[ERC-721] Should allow the auction owner to take the current highest bid", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;
    const startingBalance = await ethers.provider.getBalance(owner.address);
    const newAuction = await auction.connect(owner).nftAuctions(auctionHash);

    const bidTx = await auction.connect(addr1).makeBid(
      auctionHash, 
      { value: ethers.utils.parseEther("1") }
    );
    await bidTx.wait();

    const updatedAuction = await auction.connect(owner).nftAuctions(auctionHash);

    expect(newAuction.nftHighestBidder).to.not.equal(updatedAuction.nftHighestBidder);
    expect(newAuction.nftHighestBid).to.not.equal(updatedAuction.nftHighestBid);
    expect(updatedAuction.nftHighestBidder).to.equal(addr1.address);
    expect(updatedAuction.nftHighestBid).to.equal(ethers.utils.parseEther("1"));

    const takeHighestBidTx = await auction.connect(owner).takeHighestBid(auctionHash);
    await takeHighestBidTx.wait();
  
    const takenAuction = await auction.connect(owner).nftAuctions(auctionHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(auctionHash);

    expect(takenAuction.nftAddress).to.equal(VOID_ADDRESS);
    expect(takenAuction.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(takenAuction.nftSeller).to.equal(VOID_ADDRESS);
    expect(takenAuction.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(takenAuction.auctionBidPeriod).to.equal(0);
    expect(takenAuction.auctionEnd).to.equal(0);
    expect(parseInt(takenAuction.minPrice)).to.equal(0);
    expect(parseInt(takenAuction.buyNowPrice)).to.equal(0);
    expect(parseInt(takenAuction.nftHighestBid)).to.equal(0);
    expect(tokensAndFees[0].length).to.equal(0);
    expect(tokensAndFees[1].length).to.equal(0);
    expect(tokensAndFees[2].length).to.equal(0);

    expect(await sampleERC721.connect(owner).ownerOf(nftStartingBalances[owner.address][0])).to.equal(addr1.address);

    const endBalance = await ethers.provider.getBalance(owner.address);
    expect(parseInt(endBalance.toString())).to.greaterThan(parseInt(startingBalance.toString()));
  });
  it("[ERC-721] Should not allow the auction owner to settle the auction while it's still going", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;
    
    await expect(auction.connect(owner).settleAuction(auctionHash)).to.be.revertedWith("Auction is still going.");
  });
  it("[ERC-721] Should not allow an address to settle an auction while it's still going", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;
    
    await expect(auction.connect(addr1).settleAuction(auctionHash)).to.be.revertedWith("Auction is still going.");
  });
  it("[ERC-721] Should allow more addresses to bid and then the auction owner to take the current highest bid", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;
    const startingBalance = await ethers.provider.getBalance(owner.address);
    const newAuction = await auction.connect(owner).nftAuctions(auctionHash);

    const bidTx = await auction.connect(addr1).makeBid(
      auctionHash, 
      { value: ethers.utils.parseEther("1") }
    );
    await bidTx.wait();

    const updatedAuction = await auction.connect(owner).nftAuctions(auctionHash);

    expect(newAuction.nftHighestBidder).to.not.equal(updatedAuction.nftHighestBidder);
    expect(newAuction.nftHighestBid).to.not.equal(updatedAuction.nftHighestBid);
    expect(updatedAuction.nftHighestBidder).to.equal(addr1.address);
    expect(updatedAuction.nftHighestBid).to.equal(ethers.utils.parseEther("1"));

    const bid2Tx = await auction.connect(addr2).makeBid(
      auctionHash, 
      { value: ethers.utils.parseEther("2") }
    );
    await bid2Tx.wait();

    const updatedAuction2 = await auction.connect(owner).nftAuctions(auctionHash);

    expect(updatedAuction2.nftHighestBidder).to.not.equal(updatedAuction.nftHighestBidder);
    expect(updatedAuction2.nftHighestBid).to.not.equal(updatedAuction.nftHighestBid);
    expect(updatedAuction2.nftHighestBidder).to.equal(addr2.address);
    expect(updatedAuction2.nftHighestBid).to.equal(ethers.utils.parseEther("2"));

    const takeHighestBidTx = await auction.connect(owner).takeHighestBid(auctionHash);
    await takeHighestBidTx.wait();
  
    const takenAuction = await auction.connect(owner).nftAuctions(auctionHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(auctionHash);

    expect(takenAuction.nftAddress).to.equal(VOID_ADDRESS);
    expect(takenAuction.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(takenAuction.nftSeller).to.equal(VOID_ADDRESS);
    expect(takenAuction.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(takenAuction.auctionBidPeriod).to.equal(0);
    expect(takenAuction.auctionEnd).to.equal(0);
    expect(parseInt(takenAuction.minPrice)).to.equal(0);
    expect(parseInt(takenAuction.buyNowPrice)).to.equal(0);
    expect(parseInt(takenAuction.nftHighestBid)).to.equal(0);
    expect(tokensAndFees[0].length).to.equal(0);
    expect(tokensAndFees[1].length).to.equal(0);
    expect(tokensAndFees[2].length).to.equal(0);

    expect(await sampleERC721.connect(owner).ownerOf(nftStartingBalances[owner.address][0])).to.equal(addr2.address);

    const endBalance = await ethers.provider.getBalance(owner.address);
    expect(parseInt(endBalance.toString())).to.greaterThan(parseInt(startingBalance.toString()));
  });
  it("[ERC-721] Should allow the auction owner to update the minimum price", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;

    const updateMinPriceTx = await auction.connect(owner).updateMinimumPrice(auctionHash, ethers.utils.parseEther("2"));
    await updateMinPriceTx.wait();

    const updatedAuction = await auction.connect(owner).nftAuctions(auctionHash);
    expect(parseInt(updatedAuction.minPrice)).to.equal(parseInt(ethers.utils.parseEther("2")));
  });
  it("[ERC-721] Should not allow a address to update the minimum price of a non-owned auction", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;

    await expect(auction.connect(addr1).updateMinimumPrice(auctionHash, ethers.utils.parseEther("2"))).to.be.revertedWith("Unauthorized.");
  });
  it("[ERC-721] Should allow the auction owner to update the buy now price", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;

    const updateBuyNowPriceTx = await auction.connect(owner).updateBuyNowPrice(auctionHash, ethers.utils.parseEther("2"));
    await updateBuyNowPriceTx.wait();

    const updatedAuction = await auction.connect(owner).nftAuctions(auctionHash);
    expect(parseInt(updatedAuction.buyNowPrice)).to.equal(parseInt(ethers.utils.parseEther("2")));
  });
  it("[ERC-721] Should not allow a address to update the buy now price of a non-owned auction", async function () {
    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;

    await expect(auction.connect(addr1).updateBuyNowPrice(auctionHash, ethers.utils.parseEther("2"))).to.be.revertedWith("Unauthorized.");
  });
  it("[ERC-721] Should allow a sale owner to update the buy now price", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("0.3"),
      addr1.address,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    const updateBuyNowPriceTx = await auction.connect(owner).updateBuyNowPrice(saleHash, ethers.utils.parseEther("2"));
    await updateBuyNowPriceTx.wait();

    const updatedSale = await auction.connect(owner).nftAuctions(saleHash);
    expect(parseInt(updatedSale.buyNowPrice)).to.equal(parseInt(ethers.utils.parseEther("2")));
  });
  it("[ERC-721] Should not allow an address to update the buy now price of a non owned sale", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("0.3"),
      addr1.address,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    await expect(auction.connect(addr1).updateBuyNowPrice(saleHash, ethers.utils.parseEther("2"))).to.be.revertedWith("Unauthorized.");
  });
  it("[ERC-721] Should allow a sale owner to update the whitelisted buyer", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("0.3"),
      addr1.address,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    const updateBuyerTx = await auction.connect(owner).updateWhitelistedBuyer(saleHash, addr2.address);
    await updateBuyerTx.wait();

    const updatedSale = await auction.connect(owner).nftAuctions(saleHash);
    expect(updatedSale.whitelistedBuyer).to.equal(addr2.address);
  });
  it("[ERC-721] Should not allow an address to update the whitelisted buyer of a non owned sale", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("0.3"),
      addr1.address,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    await expect(auction.connect(addr1).updateWhitelistedBuyer(saleHash, addr2.address)).to.be.revertedWith("Unauthorized.");
  });
  it("[ERC-721] Should not allow a address to update the min price of a sale", async function () {
    const createSaleTx = await auction.connect(owner).createSale(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("0.3"),
      addr1.address,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    await expect(auction.connect(owner).updateMinimumPrice(saleHash, ethers.utils.parseEther("2"))).to.be.revertedWith("Not an auction.");
  });
  it("[ERC-721] Should allow the owner to set a fee recipient", async function () {
    const setFeeRecipientTx = await auction.connect(owner).setFeeRecipient(
      sampleERC721.address,
      customFeeRecipient.address,
    );
    await setFeeRecipientTx.wait();
  });
  it("[ERC-721] Should not allow an address to set a fee recipient", async function () {
    await expect(auction.connect(addr1).setFeeRecipient(
      sampleERC721.address,
      customFeeRecipient.address,
    )).to.be.revertedWith("Unauthorized.");
  });
  it("[ERC-721] Should not allow an owner to set a fee recipient with invalid address", async function () {
    await expect(auction.connect(owner).setFeeRecipient(
      sampleERC721.address,
      VOID_ADDRESS,
    )).to.be.revertedWith("Invalid address.");
  });
  it("[ERC-721] Should not allow an owner to set a fee recipient for an nft with an invalid address", async function () {
    await expect(auction.connect(owner).setFeeRecipient(
      VOID_ADDRESS,
      customFeeRecipient.address,
    )).to.be.revertedWith("Invalid address.");
  });
  it("[ERC-721] Should allow the fee to be split between the default fee recipient and the newly set NFT fee recipient", async function () {
    const setFeeRecipientTx = await auction.connect(owner).setFeeRecipient(
      sampleERC721.address,
      customFeeRecipient.address,
    );
    await setFeeRecipientTx.wait();

    const startingBalance = await ethers.provider.getBalance(customFeeRecipient.address);

    const createDefaultNftTx = await auction.connect(owner).createNftAuction(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("0.5"),
      0,
      1 * 24 * 60 * 60,
      24 * 60 * 60,
      ethers.utils.parseEther("0.01"),
      [],
      [],
    )
    const receipt = await createDefaultNftTx.wait();
    const auctionHash = receipt.events?.filter((x) => x.event === 'NftAuctionCreated')[0].args.auctionHash;
    const startingOwnerBalance = await ethers.provider.getBalance(owner.address);
    const startingFeeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);
    const newAuction = await auction.connect(owner).nftAuctions(auctionHash);

    const bidTx = await auction.connect(addr1).makeBid(
      auctionHash, 
      { value: ethers.utils.parseEther("0.5") }
    );
    await bidTx.wait();

    const updatedAuction = await auction.connect(owner).nftAuctions(auctionHash);

    expect(newAuction.nftHighestBidder).to.not.equal(updatedAuction.nftHighestBidder);
    expect(newAuction.nftHighestBid).to.not.equal(updatedAuction.nftHighestBid);
    expect(updatedAuction.nftHighestBidder).to.equal(addr1.address);
    expect(updatedAuction.nftHighestBid).to.equal(ethers.utils.parseEther("0.5"));

    const bid2Tx = await auction.connect(addr2).makeBid(
      auctionHash, 
      { value: ethers.utils.parseEther("1") }
    );
    await bid2Tx.wait();

    const updatedAuction2 = await auction.connect(owner).nftAuctions(auctionHash);

    expect(updatedAuction2.nftHighestBidder).to.not.equal(updatedAuction.nftHighestBidder);
    expect(updatedAuction2.nftHighestBid).to.not.equal(updatedAuction.nftHighestBid);
    expect(updatedAuction2.nftHighestBidder).to.equal(addr2.address);
    expect(updatedAuction2.nftHighestBid).to.equal(ethers.utils.parseEther("1"));

    const takeHighestBidTx = await auction.connect(owner).takeHighestBid(auctionHash);
    await takeHighestBidTx.wait();
  
    const takenAuction = await auction.connect(owner).nftAuctions(auctionHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(auctionHash);

    expect(takenAuction.nftAddress).to.equal(VOID_ADDRESS);
    expect(takenAuction.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(takenAuction.nftSeller).to.equal(VOID_ADDRESS);
    expect(takenAuction.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(takenAuction.auctionBidPeriod).to.equal(0);
    expect(takenAuction.auctionEnd).to.equal(0);
    expect(parseInt(takenAuction.minPrice)).to.equal(0);
    expect(parseInt(takenAuction.buyNowPrice)).to.equal(0);
    expect(parseInt(takenAuction.nftHighestBid)).to.equal(0);
    expect(tokensAndFees[0].length).to.equal(0);
    expect(tokensAndFees[1].length).to.equal(0);
    expect(tokensAndFees[2].length).to.equal(0);

    expect(await sampleERC721.connect(owner).ownerOf(nftStartingBalances[owner.address][0])).to.equal(addr2.address);

    const endOwnerBalance = await ethers.provider.getBalance(owner.address);
    expect(parseInt(endOwnerBalance.toString())).to.greaterThan(parseInt(startingOwnerBalance.toString()));

    const endFeeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);
    expect(parseInt(endFeeRecipientBalance.toString())).to.greaterThan(parseInt(startingFeeRecipientBalance.toString()));

    const endBalance = await ethers.provider.getBalance(customFeeRecipient.address);
    expect(parseInt(endBalance.toString())).to.greaterThan(parseInt(startingBalance.toString()));
  });
  it("[ERC-721] Should allow the fee to be split between the default fee recipient and the newly set NFT fee recipient in a sale", async function () {
    const setFeeRecipientTx = await auction.connect(owner).setFeeRecipient(
      sampleERC721.address,
      customFeeRecipient.address,
    );
    await setFeeRecipientTx.wait();

    const startingBalance = await ethers.provider.getBalance(customFeeRecipient.address);
    const startingFeeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);
    const startingOwnerBalance = await ethers.provider.getBalance(owner.address);

    const createSaleTx = await auction.connect(owner).createSale(
      sampleERC721.address,
      [nftStartingBalances[owner.address][0]],
      ethers.utils.parseEther("1"),
      addr1.address,
      [],
      [],
    )
    const receipt = await createSaleTx.wait();
    const saleHash = receipt.events?.filter((x) => x.event === 'NftSaleCreated')[0].args.saleHash;

    const bidTx = await auction.connect(addr1).makeBid(
      saleHash, 
      { value: ethers.utils.parseEther("1") }
    );
    await bidTx.wait();

    const soldSale = await auction.connect(owner).nftAuctions(saleHash);
    const tokensAndFees = await auction.connect(owner).getTokensAndFees(saleHash);

    expect(soldSale.nftAddress).to.equal(VOID_ADDRESS);
    expect(soldSale.nftHighestBidder).to.equal(VOID_ADDRESS);
    expect(soldSale.nftSeller).to.equal(VOID_ADDRESS);
    expect(soldSale.whitelistedBuyer).to.equal(VOID_ADDRESS);
    expect(soldSale.auctionBidPeriod).to.equal(0);
    expect(soldSale.auctionEnd).to.equal(0);
    expect(parseInt(soldSale.minPrice)).to.equal(0);
    expect(parseInt(soldSale.buyNowPrice)).to.equal(0);
    expect(parseInt(soldSale.nftHighestBid)).to.equal(0);
    expect(tokensAndFees[0].length).to.equal(0);
    expect(tokensAndFees[1].length).to.equal(0);
    expect(tokensAndFees[2].length).to.equal(0);

    const endOwnerBalance = await ethers.provider.getBalance(owner.address);

    const endFeeRecipientBalance = await ethers.provider.getBalance(feeRecipient.address);

    const endBalance = await ethers.provider.getBalance(customFeeRecipient.address);

    expect(parseInt(endOwnerBalance.toString())).to.greaterThan(parseInt(startingOwnerBalance.toString()));
    expect(parseInt(endFeeRecipientBalance.toString())).to.greaterThan(parseInt(startingFeeRecipientBalance.toString()));
    expect(parseInt(endBalance.toString())).to.greaterThan(parseInt(startingBalance.toString()));
  });
});