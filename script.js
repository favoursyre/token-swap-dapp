//I want to create a simple token swap dapp

//Useful libraries that I would be working with -->
const BigNumber = require('bignumber.js');
const qs = require('qs');
const web3 = require('web3');

//Declaring the neccessary variables
let currentTrade = {}
class TokenSwap {
    constructor () {
        this.currentSelectSide;
        this.tokens;
    }

    //This handles the initialization
    async init() {
        await this.listAvailableTokens();
    }

    //This function handles the listing of available tokens
    async listAvailableTokens() {
        console.log("Initializing...");
        let response = await fetch('https://tokens.coingecko.com/uniswap/all.json');
        let tokenListJSON = await response.json();
        console.log("Listing available tokens: ", tokenListJSON);
        this.tokens = tokenListJSON.tokens;
        console.log("Tokens: ", this.tokens);

        // Create token list for modal
        let parent = document.getElementById("token_list");
        for (const i in this.tokens){
            // Token row in the modal token list
            let div = document.createElement("div");
            div.className = "token_row";
            let html = `
            <img class="token_list_img" src="${this.tokens[i].logoURI}">
            <span class="token_list_text">${this.tokens[i].symbol}</span>
            `;
            div.innerHTML = html;
            div.onclick = () => {
                //token_ = this.tokens[i]
                this.selectToken(this.tokens[i]);
            };
            parent.appendChild(div);
        };
    }

    //This function allows us to select token
    async selectToken(token){
        this.closeModal();
        currentTrade[this.currentSelectSide] = token;
        console.log("currentTrade: ", currentTrade);
        //current = currentTrade
        // this.currentdata.push(currentTrade)
        // console.log("current data: ", this.currentdata)
        this.renderInterface();
    }

    //This handles rendering of the interface
    renderInterface(){
        if (currentTrade.from){
            console.log(currentTrade.from)
            document.getElementById("from_token_img").src = currentTrade.from.logoURI;
            document.getElementById("from_token_text").innerHTML = currentTrade.from.symbol;
        }
        if (currentTrade.to){
            console.log(currentTrade.to)
            document.getElementById("to_token_img").src = currentTrade.to.logoURI;
            document.getElementById("to_token_text").innerHTML = currentTrade.to.symbol;
        }
        // await this.getPrice()
        // console.log("test2")
    }

    //This handles the connect function
    async connect() {
        if (typeof window.ethereum !== "undefined") {
            try {
                console.log("connecting");
                await ethereum.request({ method: "eth_requestAccounts" });
            } catch (error) {
                console.log(error);
            }
            document.getElementById("login_button").innerHTML = "Connected";
            // const accounts = await ethereum.request({ method: "eth_accounts" });
            document.getElementById("swap_button").disabled = false;
        } else {
            document.getElementById("login_button").innerHTML = "Please install MetaMask";
        }
    }

    //This handles the function of opening of modal
    openModal(side){
        this.currentSelectSide = side;
        document.getElementById("token_modal").style.display = "block";
    }
    
    //This handles the function of closing of modal
    closeModal(){
        document.getElementById("token_modal").style.display = "none";
    }

    //This function gets price
    async getPrice(){
        //const data = await currentTrade
        //console.log("test", current)
        console.log("Getting Price");
        
      
        if (!currentTrade.from || !currentTrade.to || !document.getElementById("from_amount").value) return;
        let amount = Number(document.getElementById("from_amount").value * 10 ** currentTrade.from.decimals);
      
        const params = {
            sellToken: currentTrade.from.address,
            buyToken: currentTrade.to.address,
            sellAmount: amount,
        }
      
        // Fetch the swap price.
        console.log(`https://api.0x.org/swap/v1/price?${qs.stringify(params)}`)
        const response = await fetch(`https://api.0x.org/swap/v1/price?${qs.stringify(params)}`);
        
        let swapPriceJSON = await response.json();
        console.log("Price: ", swapPriceJSON);
        
        document.getElementById("to_amount").value = swapPriceJSON.buyAmount / (10 ** currentTrade.to.decimals);
        document.getElementById("gas_estimate").innerHTML = swapPriceJSON.estimatedGas;
    }

    //This function gets quote
    async getQuote(account){
        console.log("test2", this.currentdata)
        console.log("Getting Quote");
      
        if (!currentTrade.from || !currentTrade.to || !document.getElementById("from_amount").value) return;
        let amount = Number(document.getElementById("from_amount").value * 10 ** currentTrade.from.decimals);
      
        const params = {
            sellToken: currentTrade.from.address,
            buyToken: currentTrade.to.address,
            sellAmount: amount,
            takerAddress: account,
        }
      
        // Fetch the swap quote.
        const response = await fetch(`https://api.0x.org/swap/v1/quote?${qs.stringify(params)}`);
        
        swapQuoteJSON = await response.json();
        console.log("Quote: ", swapQuoteJSON);
        
        document.getElementById("to_amount").value = swapQuoteJSON.buyAmount / (10 ** currentTrade.to.decimals);
        document.getElementById("gas_estimate").innerHTML = swapQuoteJSON.estimatedGas;
      
        return swapQuoteJSON;
    }
    
    //This function handles the swapping of tokens
    async trySwap(){
        const erc20abi= [{ "inputs": [ { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "uint256", "name": "max_supply", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "burnFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" } ], "name": "decreaseAllowance", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" } ], "name": "increaseAllowance", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }]
        console.log("Trying swap");
      
        // Only work if MetaMask is connect
        // Connecting to Ethereum: Metamask
        const web3 = new Web3(Web3.givenProvider);
      
        // The address, if any, of the most recently used account that the caller is permitted to access
        let accounts = await ethereum.request({ method: "eth_accounts" });
        let takerAddress = accounts[0];
        console.log("takerAddress: ", takerAddress);
      
        const swapQuoteJSON = await this.getQuote(takerAddress);
      
        // Set Token Allowance
        // Set up approval amount
        const fromTokenAddress = currentTrade.from.address;
        const maxApproval = new BigNumber(2).pow(256).minus(1);
        console.log("approval amount: ", maxApproval);
        const ERC20TokenContract = new web3.eth.Contract(erc20abi, fromTokenAddress);
        console.log("setup ERC20TokenContract: ", ERC20TokenContract);
      
        // Grant the allowance target an allowance to spend our tokens.
        const tx = await ERC20TokenContract.methods.approve(
            swapQuoteJSON.allowanceTarget,
            maxApproval,
        )
        .send({ from: takerAddress })
        .then(tx => {
            console.log("tx: ", tx)
        });
    
        // Perform the swap
        const receipt = await web3.eth.sendTransaction(swapQuoteJSON);
        console.log("receipt: ", receipt);
    }

    //This performs the main dapp functions
    async dapp_actions () {
        document.getElementById("login_button").onclick = this.connect;
        document.getElementById("from_token_select").onclick = () => {
            this.openModal("from");
        };
        document.getElementById("to_token_select").onclick = () => {
            this.openModal("to");
        };
        document.getElementById("modal_close").onclick = this.closeModal;
        document.getElementById("from_amount").onblur = await this.getPrice;
        document.getElementById("swap_button").onclick = this.trySwap;
    }

}

//Commencing the codes
dapp = new TokenSwap()
dapp.init()
dapp.dapp_actions()

