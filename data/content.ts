import type { PhishingScenario, RoadmapStep, Strategy } from "@/types";

export const roadmapSteps: RoadmapStep[] = [
  {
    id: "risk",
    title: "Understand risk and volatility",
    summary:
      "Before anything else, internalize that major crypto assets routinely fall 50–80% and smaller ones can go to zero. Decide what losing your entire position would mean for your life.",
    checklist: [
      "Look up the largest historical drawdown of any asset you're curious about",
      "Write down the maximum amount you could lose without changing your life",
      "Read about one exchange collapse and one token that went to zero",
    ],
    mistakes: [
      "Sizing positions based on best-case scenarios",
      "Confusing a rising market with personal skill",
    ],
  },
  {
    id: "coins-tokens",
    title: "Learn the difference between coins and tokens",
    summary:
      "Coins (BTC, ETH, SOL) are native to their own blockchains. Tokens are created by anyone on top of those chains. Anyone can launch a token in minutes — existence proves nothing.",
    checklist: [
      "Name three layer-1 coins and three tokens built on Ethereum",
      "Find out what a token's contract address is and why it matters",
      "Learn what 'circulating supply' vs 'max supply' means",
    ],
    mistakes: [
      "Assuming a low price per token means an asset is 'cheap'",
      "Buying a token because its name resembles a famous project",
    ],
  },
  {
    id: "platform",
    title: "Choose a reputable, regulated platform in your region",
    summary:
      "Research which exchanges are licensed where you live, how long they've operated, how they hold customer assets, and what happened to their users during past market stress.",
    checklist: [
      "Check your local regulator's register of licensed providers",
      "Compare fees: deposit, trading, withdrawal — all three",
      "Verify the platform publishes proof-of-reserves or audits",
    ],
    mistakes: [
      "Choosing a platform because of a referral bonus",
      "Using an unregulated offshore exchange for convenience",
    ],
  },
  {
    id: "account",
    title: "Create and secure your account",
    summary:
      "Your exchange account is a target from day one. Set it up like it already holds money: unique password, app-based two-factor authentication, withdrawal allow-lists.",
    checklist: [
      "Generate a unique password in a password manager",
      "Enable authenticator-app 2FA (not SMS)",
      "Turn on withdrawal address allow-listing if available",
    ],
    mistakes: [
      "Reusing an email/password pair from another site",
      "Using SMS codes as the only second factor",
    ],
  },
  {
    id: "wallets",
    title: "Learn how wallets and seed phrases work",
    summary:
      "Understand self-custody before you need it: what a seed phrase is, why it can never be typed into a website, and what a hardware wallet actually protects against.",
    checklist: [
      "Install a reputable wallet and create a throwaway test wallet",
      "Write its seed phrase on paper; restore the wallet from it",
      "Delete the test wallet once you understand the flow",
    ],
    mistakes: [
      "Photographing or cloud-saving a seed phrase",
      "Sharing a phrase with 'support' — no legitimate support ever asks",
    ],
  },
  {
    id: "small",
    title: "Start with a small amount you can afford to lose",
    summary:
      "Your first purchase is tuition, not investment. Keep it small enough that a total loss stings but changes nothing. The goal is learning the mechanics, not returns.",
    checklist: [
      "Make one small purchase and note every fee you paid",
      "Send a small test amount to your own wallet and back",
      "Record the experience: what confused you, what surprised you",
    ],
    mistakes: [
      "Deploying savings before completing a single test transaction",
      "Increasing size to 'win back' an early loss",
    ],
  },
  {
    id: "simple-strategy",
    title: "Use a simple strategy before advanced products",
    summary:
      "Buying and holding, or a fixed recurring purchase, teaches you about volatility and your own psychology. Leverage, derivatives, and yield products can wait — they punish inexperience severely.",
    checklist: [
      "Pick one simple approach and write down its rules",
      "Define in advance what would make you stop or change it",
      "Avoid leverage and lending products entirely for now",
    ],
    mistakes: [
      "Trading derivatives within the first months",
      "Changing strategy every time the market moves",
    ],
  },
  {
    id: "journal",
    title: "Track decisions and review mistakes",
    summary:
      "Keep a plain journal: what you did, why, what you expected, what happened. Reviewing it monthly is the cheapest education in finance — your own errors, documented.",
    checklist: [
      "Log every buy/sell with the reason at the time",
      "Review the journal monthly and mark decisions good/bad on process, not outcome",
      "Note emotional decisions separately — they cluster around volatility",
    ],
    mistakes: [
      "Judging decisions only by whether the price went up",
      "Keeping no records and trusting memory",
    ],
  },
  {
    id: "tax",
    title: "Learn tax and reporting obligations in your jurisdiction",
    summary:
      "In most countries, selling, swapping, and sometimes even spending crypto are taxable events. Rules differ enormously by jurisdiction — find yours before you owe surprises.",
    checklist: [
      "Read your tax authority's official crypto guidance",
      "Learn whether crypto-to-crypto swaps are taxable where you live",
      "Export transaction history from every platform you use",
    ],
    mistakes: [
      "Assuming small amounts are exempt without checking",
      "Discovering reporting duties after the filing deadline",
    ],
  },
  {
    id: "research",
    title: "Never stop researching",
    summary:
      "The landscape shifts every year: regulation, technology, scams. Treat everything — including this site — as a starting point for your own verification, never a final answer.",
    checklist: [
      "Follow primary sources: official docs, regulator publications",
      "Verify any claim from social media against at least two sources",
      "Revisit your risk assumptions every few months",
    ],
    mistakes: [
      "Outsourcing decisions to influencers",
      "Treating one good year as proof a strategy is safe",
    ],
  },
];

export const strategies: Strategy[] = [
  {
    id: "hold",
    name: "Long-term holding",
    risk: "Medium to high",
    tagline: "Buy established assets and hold through cycles, measured in years.",
    points: [
      { label: "What it is", text: "Purchasing assets like BTC or ETH and holding them for years, ignoring short-term price movement." },
      { label: "Why people use it", text: "It requires no trading skill, minimizes fees and taxes from frequent trades, and avoids emotional in-and-out decisions." },
      { label: "Volatility risk", text: "Holders must sit through drawdowns of 50–80% that can last years — many sell at the bottom instead." },
      { label: "Concentration risk", text: "A portfolio dominated by one asset lives and dies with it. Diversification across a few majors softens single-asset failure." },
      { label: "Custody risk", text: "Long-term holdings on an exchange carry platform-failure risk; self-custody shifts the risk to your own key management." },
      { label: "Time horizon", text: "Realistic holders think in 4+ year windows spanning at least one full market cycle." },
    ],
    scores: { complexity: 2, timeCommitment: 1, volatility: 5, technicalRisk: 2, custodyBurden: 4, potentialLoss: 4, beginnerFit: 4 },
  },
  {
    id: "dca",
    name: "Dollar-cost averaging",
    risk: "Medium to high",
    tagline: "Invest a fixed amount on a fixed schedule, regardless of price.",
    points: [
      { label: "What it is", text: "Buying, say, $50 every week automatically — the same amount whether the market is euphoric or crashing." },
      { label: "How it helps", text: "It removes the impossible task of timing the market and averages your entry across highs and lows." },
      { label: "What it doesn't do", text: "DCA does not eliminate losses. If the asset declines for years, you accumulate a losing position on schedule." },
    ],
    scores: { complexity: 1, timeCommitment: 1, volatility: 4, technicalRisk: 2, custodyBurden: 3, potentialLoss: 4, beginnerFit: 5 },
  },
  {
    id: "staking",
    name: "Staking",
    risk: "Medium to high",
    tagline: "Lock coins to secure a proof-of-stake network and earn rewards.",
    points: [
      { label: "Proof of stake", text: "Networks like Ethereum select validators based on locked collateral instead of mining power." },
      { label: "Rewards", text: "Validators earn issuance and fees, typically a few percent per year, paid in the same volatile asset." },
      { label: "Lock-ups", text: "Unstaking can take days or weeks. During a crash, your coins may be locked while the price falls." },
      { label: "Slashing", text: "Misbehaving or misconfigured validators lose part of their stake. Delegating shifts, not removes, this risk." },
      { label: "Inflation", text: "If a network issues many new tokens, a 5% yield in a token inflating 8% is a real-terms loss." },
      { label: "Platform risk", text: "Staking through exchanges or liquid-staking contracts adds counterparty and smart-contract risk on top." },
    ],
    scores: { complexity: 3, timeCommitment: 2, volatility: 4, technicalRisk: 3, custodyBurden: 4, potentialLoss: 4, beginnerFit: 3 },
  },
  {
    id: "trading",
    name: "Active trading",
    risk: "Very high",
    tagline: "Attempting to profit from short-term price movements.",
    points: [
      { label: "Why it's hard", text: "You compete against professional firms with better data, speed, and discipline. Most retail traders lose money over time." },
      { label: "Fees", text: "Frequent trading compounds fees and spreads; a strategy can be right about direction and still lose after costs." },
      { label: "Leverage", text: "Borrowed exposure turns routine volatility into account-ending liquidations. At 10x, a 10% move erases everything." },
      { label: "Emotions", text: "Fear and greed drive buying tops and selling bottoms. A written plan helps; most beginners don't have one." },
      { label: "Liquidity & stop-losses", text: "Stops don't guarantee your exit price — gaps and thin books mean fills far below your trigger." },
      { label: "Start simulated", text: "If you must explore trading, do it with simulated money first — like the simulator on this page — for months, not days." },
    ],
    scores: { complexity: 5, timeCommitment: 5, volatility: 5, technicalRisk: 3, custodyBurden: 2, potentialLoss: 5, beginnerFit: 1 },
  },
  {
    id: "defi",
    name: "DeFi lending & liquidity pools",
    risk: "Very high",
    tagline: "Earning yield by lending assets or providing trading liquidity.",
    points: [
      { label: "Lending", text: "Deposit assets into a protocol; borrowers pay interest against over-collateralized loans." },
      { label: "Liquidity pools", text: "Pair two assets in a pool that powers a DEX; earn a share of trading fees." },
      { label: "Impermanent loss", text: "When pooled assets diverge in price, you end up with more of the loser — pool value can trail simply holding." },
      { label: "Smart-contract exploits", text: "Billions have been drained from audited protocols. Code risk is the dominant risk, and you carry it." },
      { label: "Depegs", text: "Stablecoin pools look calm until the stablecoin isn't stable; depegs convert 'safe' yield into deep losses." },
      { label: "Yield reality", text: "Unusually high yield is compensation for risk you may not see yet — or an outright scam." },
    ],
    scores: { complexity: 5, timeCommitment: 3, volatility: 4, technicalRisk: 5, custodyBurden: 5, potentialLoss: 5, beginnerFit: 1 },
  },
  {
    id: "airdrops",
    name: "Airdrops & crypto tasks",
    risk: "High",
    tagline: "Using new protocols hoping to receive token distributions.",
    points: [
      { label: "Eligibility", text: "Projects reward early users with tokens, but criteria are unknown in advance and often exclude most participants." },
      { label: "Costs", text: "Chasing airdrops means paying real network fees for months with no promised reward." },
      { label: "Fake airdrops", text: "Scammers announce fake claims for real projects; the 'claim' site drains your wallet instead." },
      { label: "Malicious approvals", text: "Claim pages often request token approvals or signatures that hand over assets — read every prompt." },
      { label: "Phishing", text: "Airdrop hunters are prime phishing targets: urgency + greed is the scammer's favorite combination." },
      { label: "Uncertain rewards", text: "Even legitimate airdrops may be worth little by the time tokens unlock and everyone sells." },
    ],
    scores: { complexity: 4, timeCommitment: 4, volatility: 4, technicalRisk: 5, custodyBurden: 5, potentialLoss: 3, beginnerFit: 2 },
  },
];

export const scoreLabels: Record<keyof Strategy["scores"], string> = {
  complexity: "Complexity",
  timeCommitment: "Time commitment",
  volatility: "Volatility exposure",
  technicalRisk: "Technical risk",
  custodyBurden: "Custody requirements",
  potentialLoss: "Potential loss",
  beginnerFit: "Beginner suitability",
};

export const phishingScenarios: PhishingScenario[] = [
  {
    id: "support",
    channel: "Direct message",
    from: "Ledgér Support Team ✓",
    body: "URGENT: We detected unauthorized access to your wallet. To protect your funds, verify ownership within 2 hours by entering your 24-word recovery phrase at ledger-secure-verify.net. Failure to act will result in permanent loss.",
    isScam: true,
    flags: ["Urgent countdown language", "Asks for your seed phrase", "Lookalike domain, not the official site", "Threatens permanent loss"],
    explanation: "No legitimate company ever asks for a recovery phrase — the phrase IS the wallet. The urgency, the fake checkmark, and the lookalike domain are a classic combination designed to short-circuit your judgment.",
  },
  {
    id: "exchange-mail",
    channel: "Email",
    from: "no-reply@notifications.kraken.com",
    body: "You added a new withdrawal address ending in 8f2A on May 12 at 14:03 UTC. If this was you, no action is needed. If you don't recognize this activity, sign in directly at kraken.com (do not use links in this email) and review your security settings.",
    isScam: false,
    flags: [],
    explanation: "This is what a legitimate security notice looks like: it states facts, creates no artificial deadline, asks for no secrets, and tells you to navigate to the site yourself rather than clicking a link.",
  },
  {
    id: "airdrop",
    channel: "Social media post",
    from: "@SolanaFoundatiоn (note the character)",
    body: "🎁 RETROACTIVE AIRDROP LIVE! All early Solana users can claim up to 500 SOL. Connect your wallet at claim-solana-rewards.io and approve the eligibility check to receive tokens instantly. Only 4,000 spots left!",
    isScam: true,
    flags: ["Unrealistic reward (500 SOL)", "Unexpected wallet connection request", "Approval request that can drain assets", "Artificial scarcity ('4,000 spots')", "Spoofed account name with a lookalike character"],
    explanation: "The 'eligibility check' is a malicious token approval. Signing it gives the contract permission to transfer your assets. Real distributions are announced through official channels and never require open-ended approvals.",
  },
  {
    id: "wallet-update",
    channel: "In-app notification",
    from: "MetaMask",
    body: "A new version of MetaMask is available. Update through your browser's official extension store. Never download wallet software from links sent to you — always use the official store listing you originally installed from.",
    isScam: false,
    flags: [],
    explanation: "Legitimate wallet software directs you to official distribution channels and explicitly warns against sideloaded links. No secrets requested, no urgency, no external claim site.",
  },
  {
    id: "giveaway",
    channel: "Video stream",
    from: "\"Live: Crypto Foundation Event\"",
    body: "To celebrate our anniversary, we are giving back to the community! Send between 0.1 and 5 BTC to the address below and receive DOUBLE back instantly. This is a limited event — participate now, wallet address on screen.",
    isScam: true,
    flags: ["Send-to-receive 'doubling' mechanic", "Guaranteed instant returns", "Time-limited pressure", "No legitimate reason for the payment"],
    explanation: "Nobody doubles money. These streams hijack real channels and replay old footage next to a scam address. Every coin sent is gone permanently — this scam has run continuously for years because it keeps working.",
  },
];
