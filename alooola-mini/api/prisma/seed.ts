/**
 * Project source file.
 */
import "dotenv/config";
import {
  PrismaClient,
  MemberRole,
  MemberStatus,
  InviteStatus,
  RiskTolerance,
  TxnType,
  ReferralEventType,
  AssistantSender,
  Prisma,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { hashPassword } from "../src/lib/crypto";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const money = (value: number) => new Prisma.Decimal(value.toFixed(2));

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

async function upsertUser(email: string, name: string) {
  return prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name },
  });
}

async function main() {
  // Use current date so transactions appear in "This Month" queries
  const seedNow = new Date();
  const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  const addHours = (date: Date, hours: number) => new Date(date.getTime() + hours * 60 * 60 * 1000);
  const addMonths = (date: Date, months: number) => {
    const d = new Date(date.getTime());
    d.setMonth(d.getMonth() + months);
    return d;
  };
  const seedPasswordHash = await hashPassword(process.env.DEMO_ACCOUNT_PASSWORD ?? "");
  if (!seedPasswordHash) {
    throw new Error("DEMO_ACCOUNT_PASSWORD is not set");
  }

  const goals = [
    { key: "retirement", label: "Retirement Planning" },
    { key: "wealth_building", label: "Wealth Building" },
    { key: "education_fund", label: "Education Fund" },
    { key: "property_investment", label: "Property Investment" },
    { key: "emergency_fund", label: "Emergency Fund" },
    { key: "other", label: "Other Goals" },
  ];

  for (const goal of goals) {
    await prisma.goalOption.upsert({
      where: { key: goal.key },
      update: { label: goal.label },
      create: goal,
    });
  }

  const primaryUser = await upsertUser("alex.morgan@alooola.dev", "Alex Morgan");
  const secondaryUser = await upsertUser("jamie.morgan@alooola.dev", "Jamie Morgan");

  await prisma.userAuth.upsert({
    where: { userId: primaryUser.id },
    update: { passwordHash: seedPasswordHash, passwordUpdatedAt: seedNow },
    create: {
      userId: primaryUser.id,
      passwordHash: seedPasswordHash,
      passwordUpdatedAt: seedNow,
      mfaEnabled: false,
    },
  });

  await prisma.refreshToken.upsert({
    where: { tokenHash: "refresh-token-hash-001" },
    update: { revokedAt: null, expiresAt: addDays(seedNow, 30) },
    create: {
      userId: primaryUser.id,
      tokenHash: "refresh-token-hash-001",
      userAgent: "seed",
      expiresAt: addDays(seedNow, 30),
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: primaryUser.id },
    update: {
      profession: "Cardiologist",
      memberTier: "professional",
      memberSince: new Date("2024-01-15"),
      timezone: "America/New_York",
      locale: "en-US",
    },
    create: {
      userId: primaryUser.id,
      profession: "Cardiologist",
      memberTier: "professional",
      memberSince: new Date("2024-01-15"),
      timezone: "America/New_York",
      locale: "en-US",
      avatarUrl:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop",
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: secondaryUser.id },
    update: {
      profession: "Surgeon",
      memberTier: "professional",
      memberSince: new Date("2024-03-01"),
      timezone: "America/New_York",
      locale: "en-US",
    },
    create: {
      userId: secondaryUser.id,
      profession: "Surgeon",
      memberTier: "professional",
      memberSince: new Date("2024-03-01"),
      timezone: "America/New_York",
      locale: "en-US",
      avatarUrl:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop",
    },
  });

  await prisma.rewardAccount.upsert({
    where: { userId: primaryUser.id },
    update: {
      balance: money(1542),
      lifetimeEarned: money(1542),
      rewardRatePct: new Prisma.Decimal("2.0"),
    },
    create: {
      userId: primaryUser.id,
      balance: money(1542),
      lifetimeEarned: money(1542),
      rewardRatePct: new Prisma.Decimal("2.0"),
    },
  });

  await prisma.userInvestmentProfile.upsert({
    where: { userId: primaryUser.id },
    update: {
      riskTolerance: RiskTolerance.moderate,
      starterAmount: money(10000),
      completedAt: seedNow,
    },
    create: {
      userId: primaryUser.id,
      riskTolerance: RiskTolerance.moderate,
      starterAmount: money(10000),
      completedAt: seedNow,
    },
  });

  const goalRows = await prisma.goalOption.findMany();
  await prisma.userGoalSelection.createMany({
    data: goalRows
      .filter((goal) => ["retirement", "wealth_building", "education_fund"].includes(goal.key))
      .map((goal) => ({
        userId: primaryUser.id,
        goalId: goal.id,
        createdAt: seedNow,
      })),
    skipDuplicates: true,
  });

  const household =
    (await prisma.household.findFirst({ where: { name: "Morgan Household" } })) ??
    (await prisma.household.create({ data: { name: "Morgan Household" } }));

  await prisma.householdMember.createMany({
    data: [
      {
        householdId: household.id,
        userId: primaryUser.id,
        role: MemberRole.owner,
        status: MemberStatus.accepted,
        joinedAt: seedNow,
      },
      {
        householdId: household.id,
        userId: secondaryUser.id,
        role: MemberRole.member,
        status: MemberStatus.accepted,
        joinedAt: seedNow,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.invite.upsert({
    where: { token: "INVITE-ALOOLA-001" },
    update: { status: InviteStatus.accepted },
    create: {
      householdId: household.id,
      email: "new.member@alooola.dev",
      token: "INVITE-ALOOLA-001",
      status: InviteStatus.pending,
      expiresAt: addDays(seedNow, 7),
    },
  });

  // Create multiple demo accounts
  const accountsData = [
    {
      name: "Primary Checking",
      type: "checking",
      institution: "Alooola Bank",
      last4: "1234",
      availableBalance: money(32547),
      currentBalance: money(34120),
    },
    {
      name: "Emergency Savings",
      type: "savings",
      institution: "Alooola Bank",
      last4: "5678",
      availableBalance: money(15000),
      currentBalance: money(15250),
    },
    {
      name: "Investment Account",
      type: "investment",
      institution: "Vanguard",
      last4: "9012",
      // This is intentionally tuned to match the seeded holdings + snapshots.
      // Current invested positions total: 97,606.55
      // Investment account balance:      49,300.22
      // Total shown on Home:           146,906.77
      availableBalance: money(49300.22),
      currentBalance: money(49300.22),
    },
    {
      name: "Rewards Credit Card",
      type: "credit",
      institution: "Alooola Card",
      last4: "4455",
      availableBalance: money(0),
      currentBalance: money(2180.55),
    },
  ];

  const createdAccounts: { id: string; name: string }[] = [];
  for (const accountData of accountsData) {
    const existingAccount = await prisma.account.findFirst({
      where: { householdId: household.id, name: accountData.name },
    });

    const savedAccount = existingAccount
      ? await prisma.account.update({
          where: { id: existingAccount.id },
          data: {
            type: accountData.type,
            institution: accountData.institution,
            last4: accountData.last4,
          },
        })
      : await prisma.account.create({
          data: {
            householdId: household.id,
            name: accountData.name,
            type: accountData.type,
            institution: accountData.institution,
            last4: accountData.last4,
          },
        });

    await prisma.accountBalance.upsert({
      where: { accountId: savedAccount.id },
      update: {
        availableBalance: accountData.availableBalance,
        currentBalance: accountData.currentBalance,
        asOf: seedNow,
      },
      create: {
        accountId: savedAccount.id,
        availableBalance: accountData.availableBalance,
        currentBalance: accountData.currentBalance,
        asOf: seedNow,
      },
    });

    createdAccounts.push({ id: savedAccount.id, name: savedAccount.name });
  }

  // Use the primary checking account for transactions
  const account = createdAccounts[0];

  const categoryNames = [
    "Medical Equipment",
    "Continuing Education",
    "Professional Dues",
    "Dining",
    "Transportation",
    "Other",
  ];

  await prisma.category.createMany({
    data: categoryNames.map((name) => ({
      householdId: household.id,
      name,
    })),
    skipDuplicates: true,
  });

  const categories = await prisma.category.findMany({
    where: { householdId: household.id },
  });

  const categoryByName = new Map(categories.map((category) => [category.name, category]));

  const savingsAccount = createdAccounts.find(a => a.name === "Emergency Savings");
  const creditAccount = createdAccounts.find(a => a.name === "Rewards Credit Card");
  const investmentAccount = createdAccounts.find(a => a.name === "Investment Account");

  // Primary checking transactions - use dates relative to seedNow
  const checkingTransactions = [
    {
      merchant: "MedTech Supplies",
      amount: money(1250),
      category: "Medical Equipment",
      txnDate: addDays(seedNow, -5),
      userId: primaryUser.id,
    },
    {
      merchant: "Cardiology Conference",
      amount: money(890),
      category: "Continuing Education",
      txnDate: addDays(seedNow, -8),
      userId: primaryUser.id,
    },
    {
      merchant: "Professional Association",
      amount: money(650),
      category: "Professional Dues",
      txnDate: addDays(seedNow, -10),
      userId: primaryUser.id,
    },
    {
      merchant: "Café Dune",
      amount: money(485.5),
      category: "Dining",
      txnDate: addDays(seedNow, -12),
      userId: primaryUser.id,
    },
    {
      merchant: "Uber",
      amount: money(32.50),
      category: "Transportation",
      txnDate: addDays(seedNow, -13),
      userId: secondaryUser.id,
    },
    {
      merchant: "Whole Foods",
      amount: money(156.23),
      category: "Other",
      txnDate: addDays(seedNow, -14),
      userId: secondaryUser.id,
    },
  ];

  for (const txn of checkingTransactions) {
    const category = categoryByName.get(txn.category);
    if (!category) continue;
    const existingTxn = await prisma.transaction.findFirst({
      where: {
        accountId: account.id,
        merchant: txn.merchant,
        amount: txn.amount,
        txnDate: txn.txnDate,
      },
    });
    if (!existingTxn) {
      await prisma.transaction.create({
        data: {
          householdId: household.id,
          accountId: account.id,
          attributedUserId: txn.userId,
          categoryId: category.id,
          txnType: TxnType.spend,
          amount: txn.amount,
          currency: "USD",
          merchant: txn.merchant,
          txnDate: txn.txnDate,
        },
      });
    }
  }

  // Savings account transactions (deposits) - use dates relative to seedNow
  const otherCategory = categoryByName.get("Other");
  if (savingsAccount && otherCategory) {
    const savingsTransactions = [
      {
        merchant: "Direct Deposit - Salary",
        amount: money(5000),
        txnDate: addDays(seedNow, -3),
        txnType: TxnType.receive,
      },
      {
        merchant: "Interest Payment",
        amount: money(12.50),
        txnDate: addDays(seedNow, -14),
        txnType: TxnType.receive,
      },
    ];

    for (const txn of savingsTransactions) {
      const existingTxn = await prisma.transaction.findFirst({
        where: {
          accountId: savingsAccount.id,
          merchant: txn.merchant,
          amount: txn.amount,
          txnDate: txn.txnDate,
        },
      });
      if (!existingTxn) {
        await prisma.transaction.create({
          data: {
            householdId: household.id,
            accountId: savingsAccount.id,
            attributedUserId: primaryUser.id,
            categoryId: otherCategory.id,
            txnType: txn.txnType,
            amount: txn.amount,
            currency: "USD",
            merchant: txn.merchant,
            txnDate: txn.txnDate,
          },
        });
      }
    }
  }

  // Credit card transactions to make Accounts UI feel real.
  if (creditAccount && otherCategory) {
    const creditTxns = [
      {
        merchant: "Airline Tickets",
        amount: money(842.17),
        txnDate: addDays(seedNow, -18),
        txnType: TxnType.spend,
      },
      {
        merchant: "Hotel Stay",
        amount: money(612.40),
        txnDate: addDays(seedNow, -22),
        txnType: TxnType.spend,
      },
      {
        merchant: "Statement Payment",
        amount: money(500.00),
        txnDate: addDays(seedNow, -10),
        txnType: TxnType.receive,
      },
      {
        merchant: "Coffee + Snacks",
        amount: money(18.58),
        txnDate: addDays(seedNow, -2),
        txnType: TxnType.spend,
      },
    ];

    for (const txn of creditTxns) {
      const existingTxn = await prisma.transaction.findFirst({
        where: {
          accountId: creditAccount.id,
          merchant: txn.merchant,
          amount: txn.amount,
          txnDate: txn.txnDate,
        },
      });
      if (!existingTxn) {
        await prisma.transaction.create({
          data: {
            householdId: household.id,
            accountId: creditAccount.id,
            attributedUserId: primaryUser.id,
            categoryId: otherCategory.id,
            txnType: txn.txnType,
            amount: txn.amount,
            currency: "USD",
            merchant: txn.merchant,
            txnDate: txn.txnDate,
          },
        });
      }
    }
  }

  const existingTransfer = await prisma.transfer.findFirst({
    where: {
      householdId: household.id,
      fromUserId: primaryUser.id,
      toUserId: secondaryUser.id,
      amount: money(80),
      postedAt: seedNow,
    },
  });
  if (!existingTransfer) {
    await prisma.transfer.create({
      data: {
        householdId: household.id,
        fromUserId: primaryUser.id,
        toUserId: secondaryUser.id,
        amount: money(80),
        currency: "USD",
        note: "Here is some cash :)",
        status: "posted",
      postedAt: seedNow,
      },
    });
  }

  const existingFundingSource = await prisma.fundingSource.findFirst({
    where: { userId: primaryUser.id, providerRef: "plaid-item-001" },
  });
  if (!existingFundingSource) {
    await prisma.fundingSource.create({
      data: {
        userId: primaryUser.id,
        provider: "plaid",
        providerRef: "plaid-item-001",
        label: "Chase Checking",
        type: "bank",
        last4: "1234",
      },
    });
  }

  const rewardCount = await prisma.rewardEvent.count({ where: { userId: primaryUser.id } });
  if (rewardCount === 0) {
    await prisma.rewardEvent.createMany({
      data: [
        {
          userId: primaryUser.id,
          amount: money(50),
          eventType: "spend",
          sourceType: "transaction",
          createdAt: seedNow,
        },
        {
          userId: primaryUser.id,
          amount: money(200),
          eventType: "referral",
          sourceType: "referral",
          createdAt: seedNow,
        },
      ],
    });
  }

  const portfolios = [
    {
      name: "Healthcare REIT Portfolio",
      description: "Diversified healthcare REIT exposure.",
      riskTolerance: RiskTolerance.moderate,
      oneYearReturnPct: new Prisma.Decimal("12.4"),
      holdings: [
        { symbol: "MPW", weightPct: new Prisma.Decimal("40.0") },
        { symbol: "WELL", weightPct: new Prisma.Decimal("35.0") },
        { symbol: "DOC", weightPct: new Prisma.Decimal("25.0") },
      ],
    },
    {
      name: "Biotech Innovation Fund",
      description: "High-growth biotech innovators.",
      riskTolerance: RiskTolerance.aggressive,
      oneYearReturnPct: new Prisma.Decimal("18.7"),
      holdings: [{ symbol: "XBI", weightPct: new Prisma.Decimal("100.0") }],
    },
    {
      name: "Medical Technology",
      description: "Medical device leaders.",
      riskTolerance: RiskTolerance.conservative,
      oneYearReturnPct: new Prisma.Decimal("10.2"),
      holdings: [
        { symbol: "MDT", weightPct: new Prisma.Decimal("40.0") },
        { symbol: "ABT", weightPct: new Prisma.Decimal("35.0") },
        { symbol: "SYK", weightPct: new Prisma.Decimal("25.0") },
      ],
    },
  ];

  for (let portfolioIndex = 0; portfolioIndex < portfolios.length; portfolioIndex++) {
    const portfolio = portfolios[portfolioIndex];
    const existing = await prisma.curatedPortfolio.findFirst({
      where: { name: portfolio.name },
    });

    const saved = existing
      ? await prisma.curatedPortfolio.update({
          where: { id: existing.id },
          data: {
            description: portfolio.description,
            riskTolerance: portfolio.riskTolerance,
            oneYearReturnPct: portfolio.oneYearReturnPct,
          },
        })
      : await prisma.curatedPortfolio.create({
          data: {
            name: portfolio.name,
            description: portfolio.description,
            riskTolerance: portfolio.riskTolerance,
            oneYearReturnPct: portfolio.oneYearReturnPct,
          },
        });

    await prisma.portfolioHolding.deleteMany({ where: { portfolioId: saved.id } });
    await prisma.portfolioHolding.createMany({
      data: portfolio.holdings.map((holding) => ({
        portfolioId: saved.id,
        symbol: holding.symbol,
        weightPct: holding.weightPct,
      })),
    });

    const existingPosition = await prisma.userPortfolioPosition.findFirst({
      where: {
        householdId: household.id,
        userId: primaryUser.id,
        portfolioId: saved.id,
      },
    });
    // Seed realistic holdings amounts so Home "Your Holdings" looks good.
    // These values also correlate to the household-level investment snapshots we seed below.
    const seededAmountByPortfolioName: Record<string, number> = {
      "Medical Technology": 45020.0,
      "Biotech Innovation Fund": 25000.0,
      "Healthcare REIT Portfolio": 27586.55,
    };
    const desiredAmount = seededAmountByPortfolioName[portfolio.name] ?? 25000;

    if (!existingPosition) {
      await prisma.userPortfolioPosition.create({
        data: {
          householdId: household.id,
          userId: primaryUser.id,
          portfolioId: saved.id,
          amountInvested: money(desiredAmount),
        },
      });
    } else {
      await prisma.userPortfolioPosition.update({
        where: { id: existingPosition.id },
        data: { amountInvested: money(desiredAmount) },
      });
    }

    await prisma.portfolioPosition.createMany({
      data: portfolio.holdings.map((holding) => ({
        userId: primaryUser.id,
        portfolioId: saved.id,
        symbol: holding.symbol,
        quantity: new Prisma.Decimal("12.345"),
        costBasis: money(1000),
        marketValue: money(1200),
        asOf: seedNow,
      })),
      skipDuplicates: true,
    });
  }

  // Seed Watchlist so Home watchlist has rows immediately.
  const seededWatchlistNames = ["Medical Technology", "Biotech Innovation Fund"];
  const watchlistPortfolios = await prisma.curatedPortfolio.findMany({
    where: { name: { in: seededWatchlistNames } },
  });
  await prisma.watchlistItem.createMany({
    data: watchlistPortfolios.map((p) => ({ userId: primaryUser.id, portfolioId: p.id })),
    skipDuplicates: true,
  });

  // ---------------------------------------------------------------------------
  // Seed HOUSEHOLD-LEVEL investment snapshots used by the Home chart.
  // Home calls getInvestmentSummary() which queries portfolio_snapshots with portfolioId = null.
  // We seed:
  // - Monthly points for older history (good for ALL / 1Y)
  // - Daily points for last ~30 days (good for 1M)
  // - Intraday points for last 24 hours (good for Today)
  // ---------------------------------------------------------------------------

  // Clear existing household-level snapshots for this demo user so rerunning seed is stable.
  await prisma.portfolioSnapshot.deleteMany({
    where: { userId: primaryUser.id, householdId: household.id, portfolioId: null },
  });

  const endTotal = 146_906.77; // matches Investment Account + seeded positions
  const startTotal = 92_500.0; // ~2 years ago baseline

  // Simple deterministic "noise" so values aren't flat but are repeatable.
  const noise = (x: number) => Math.sin(x * 0.7) * 1200 + Math.cos(x * 0.17) * 450;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  type SnapshotPoint = { asOf: Date; totalValue: number };
  const points: SnapshotPoint[] = [];

  // Monthly snapshots: from 24 months ago up to 2 months ago (inclusive)
  const monthsBackStart = 24;
  const monthsBackEnd = 2;
  for (let m = monthsBackStart; m >= monthsBackEnd; m--) {
    const asOf = new Date(addMonths(seedNow, -m));
    asOf.setHours(12, 0, 0, 0);
    const t = (monthsBackStart - m) / (monthsBackStart - monthsBackEnd);
    const value = clamp(lerp(startTotal, endTotal * 0.93, t) + noise(m), 10_000, 1_000_000);
    points.push({ asOf, totalValue: value });
  }

  // Daily snapshots: last 30 days (excluding last 1 day because we add intraday below)
  const days = 30;
  const dailyStart = endTotal * 0.90;
  for (let d = days; d >= 2; d--) {
    const asOf = new Date(addDays(seedNow, -d));
    asOf.setHours(12, 0, 0, 0);
    const t = (days - d) / (days - 2);
    const value = clamp(lerp(dailyStart, endTotal * 0.995, t) + noise(d * 1.3), 10_000, 1_000_000);
    points.push({ asOf, totalValue: value });
  }

  // Intraday snapshots: last 24 hours every 2 hours, ending at endTotal.
  const steps = 12; // 0..12 => 13 points
  for (let i = steps; i >= 0; i--) {
    const hoursBack = i * 2;
    const asOf = new Date(addHours(seedNow, -hoursBack));
    // Stagger within the hour so ordering is stable but not identical times.
    asOf.setMinutes(i % 2 === 0 ? 10 : 40, 0, 0);
    const t = (steps - i) / steps;
    const value = i === 0 ? endTotal : clamp(lerp(endTotal * 0.985, endTotal, t) + noise(i * 2.1) * 0.15, 10_000, 1_000_000);
    points.push({ asOf, totalValue: value });
  }

  // Sort and insert.
  points.sort((a, b) => a.asOf.getTime() - b.asOf.getTime());
  const baseline = points[0]?.totalValue ?? endTotal;

  await prisma.portfolioSnapshot.createMany({
    data: points.map((p) => {
      const gainAmount = p.totalValue - baseline;
      const gainPercent = baseline > 0 ? (gainAmount / baseline) * 100 : 0;
      return {
        userId: primaryUser.id,
        householdId: household.id,
        portfolioId: null,
        totalValue: money(p.totalValue),
        gainAmount: money(gainAmount),
        gainPercent: new Prisma.Decimal(gainPercent.toFixed(2)),
        asOf: p.asOf,
      };
    }),
  });

  // Ensure the investment account balance aligns to the demo totals.
  // (Some apps display this account and it should feel consistent with the chart.)
  if (investmentAccount) {
    await prisma.accountBalance.upsert({
      where: { accountId: investmentAccount.id },
      update: { availableBalance: money(49300.22), currentBalance: money(49300.22), asOf: seedNow },
      create: { accountId: investmentAccount.id, availableBalance: money(49300.22), currentBalance: money(49300.22), asOf: seedNow },
    });
  }

  const assistantThread =
    (await prisma.assistantThread.findFirst({
      where: { userId: primaryUser.id, title: "Investment Guidance" },
    })) ??
    (await prisma.assistantThread.create({
      data: {
        userId: primaryUser.id,
        householdId: household.id,
        title: "Investment Guidance",
      },
    }));

  const messageCount = await prisma.assistantMessage.count({
    where: { threadId: assistantThread.id },
  });
  if (messageCount === 0) {
    await prisma.assistantMessage.createMany({
      data: [
        {
          threadId: assistantThread.id,
          sender: AssistantSender.assistant,
          content: "Hi Dr. Morgan! How can I help you today?",
        },
        {
          threadId: assistantThread.id,
          sender: AssistantSender.user,
          content: "Portfolio recommendations",
        },
        {
          threadId: assistantThread.id,
          sender: AssistantSender.assistant,
          content:
            "Based on your profile, consider diversifying into healthcare REITs and biotech ETFs.",
        },
      ],
    });
  }

  const advisor =
    (await prisma.advisor.findFirst({ where: { name: "Dr. Riley Chen" } })) ??
    (await prisma.advisor.create({
      data: {
        name: "Dr. Riley Chen",
        bio: "Certified financial advisor specializing in healthcare professionals.",
        timezone: "America/New_York",
        specialties: ["investing", "tax-strategy", "retirement"],
      },
    }));

  const slotStart = addDays(seedNow, 3);
  const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
  const slot =
    (await prisma.advisorSlot.findFirst({
      where: { advisorId: advisor.id, startAt: slotStart },
    })) ??
    (await prisma.advisorSlot.create({
      data: {
        advisorId: advisor.id,
        startAt: slotStart,
        endAt: slotEnd,
        status: "booked",
        heldByUserId: primaryUser.id,
      },
    }));

  const existingAppointment = await prisma.advisorAppointment.findFirst({
    where: { slotId: slot.id },
  });
  if (!existingAppointment) {
    await prisma.advisorAppointment.create({
      data: {
        advisorId: advisor.id,
        userId: primaryUser.id,
        slotId: slot.id,
        status: "scheduled",
        notes: "Discuss diversification strategy.",
      },
    });
  }

  const referral =
    (await prisma.referral.findFirst({ where: { code: "ALOOLA2024" } })) ??
    (await prisma.referral.create({
      data: {
        ownerUserId: primaryUser.id,
        code: "ALOOLA2024",
      },
    }));

  const referralEventCount = await prisma.referralEvent.count({
    where: { referralId: referral.id },
  });
  if (referralEventCount === 0) {
    await prisma.referralEvent.createMany({
      data: [
        {
          referralId: referral.id,
          eventType: ReferralEventType.click,
        },
        {
          referralId: referral.id,
          eventType: ReferralEventType.signup,
        },
        {
          referralId: referral.id,
          eventType: ReferralEventType.complete,
        },
      ],
    });
  }

  await prisma.userDevice.upsert({
    where: { pushToken: "device-token-001" },
    update: { lastSeenAt: seedNow },
    create: {
      userId: primaryUser.id,
      platform: "ios",
      pushToken: "device-token-001",
      lastSeenAt: seedNow,
    },
  });

  const notificationCount = await prisma.notification.count({
    where: { userId: primaryUser.id },
  });
  if (notificationCount === 0) {
    await prisma.notification.createMany({
      data: [
        {
          userId: primaryUser.id,
          type: "reward",
          title: "New Reward Earned",
          body: "You earned $50 in stock rewards.",
        },
        {
          userId: primaryUser.id,
          type: "advisor",
          title: "Advisor Session Confirmed",
          body: "Your session with Dr. Riley Chen is scheduled.",
        },
      ],
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
