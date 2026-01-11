const contractAddress = "0xC7de0a29E7F21b7Fd8b23f99C603E2172a66c762";

const abi = [
  "function client() view returns(address)",
  "function freelancer() view returns(address)",
  "function state() view returns(uint)",
  "function fund() payable",
  "function submitWork()",
  "function approve()"
];

let provider, signer, contract;

const wallet = document.getElementById("wallet");
const roleEl = document.getElementById("role");
const status = document.getElementById("status");
const clientUI = document.getElementById("clientUI");
const freelancerUI = document.getElementById("freelancerUI");

document.getElementById("connect").onclick = connect;
document.getElementById("fund").onclick = fund;
document.getElementById("submit").onclick = submit;
document.getElementById("approve").onclick = approve;

async function connect() {
  await ethereum.request({ method: "eth_requestAccounts" });
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  contract = new ethers.Contract(contractAddress, abi, signer);
  wallet.innerText = "Connected: " + await signer.getAddress();
  load();
}

async function load() {
  await provider.send("eth_chainId", []); // force fresh read

  const c = await contract.client();
  const f = await contract.freelancer();
  const s = Number(await contract.state());
  const bal = await provider.getBalance(contractAddress);
  const user = await signer.getAddress();

  const states = ["Created","Funded","Submitted","Approved","Disputed"];

  status.innerText =
    "Client: " + c +
    "\nFreelancer: " + f +
    "\nLocked ETH: " + ethers.formatEther(bal) +
    "\nState: " + states[s];

  clientUI.classList.add("hidden");
  freelancerUI.classList.add("hidden");

  if (user.toLowerCase() === c.toLowerCase()) {
    roleEl.innerText = "You are: Client";
    clientUI.classList.remove("hidden");
  } else if (user.toLowerCase() === f.toLowerCase()) {
    roleEl.innerText = "You are: Freelancer";
    freelancerUI.classList.remove("hidden");
  } else {
    roleEl.innerText = "Viewer";
  }
}

async function fund() {
  const eth = document.getElementById("eth").value;
  status.innerText = "Waiting for MetaMask...";
  const tx = await contract.fund({ value: ethers.parseEther(eth) });
  status.innerText = "Funding...";
  await tx.wait();
  status.innerText = "Escrow funded!";
  load();
}

async function submit() {
  status.innerText = "Submitting work...";
  const tx = await contract.submitWork();
  await tx.wait();
  status.innerText = "Work submitted!";
  load();
}

async function approve() {
  status.innerText = "Approving & paying...";
  const tx = await contract.approve();
  await tx.wait();
  status.innerText = "Freelancer paid!";
  load();
}
