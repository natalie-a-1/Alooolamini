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

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const money = (value: number) => new Prisma.Decimal(value.toFixed(2));

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
  const addDays = (date: Date, days: number) =>
    new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

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
    update: { passwordUpdatedAt: seedNow },
    create: {
      userId: primaryUser.id,
      passwordHash: "dev_hash_only_do_not_use",
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
      availableBalance: money(45000),
      currentBalance: money(47500),
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
          txnType: TxnType.debit,
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
        txnType: TxnType.credit,
      },
      {
        merchant: "Interest Payment",
        amount: money(12.50),
        txnDate: addDays(seedNow, -14),
        txnType: TxnType.credit,
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
    if (!existingPosition) {
      await prisma.userPortfolioPosition.create({
        data: {
          householdId: household.id,
          userId: primaryUser.id,
          portfolioId: saved.id,
          amountInvested: money(25000),
        },
      });
    }

    // Create historical snapshots for the chart (past 30 days)
    // Only create for the first portfolio to avoid aggregation confusion
    if (portfolioIndex === 0) {
      const baseValue = 125000;
      const currentValue = 134420.5;
      const days = 30;
      
      for (let i = days; i >= 0; i--) {
        const snapshotDate = addDays(seedNow, -i);
        // Simulate gradual growth with some variation
        const progress = (days - i) / days;
        const variation = Math.sin(i * 0.5) * 2000; // Add some wave-like variation
        const snapshotValue = baseValue + (currentValue - baseValue) * progress + variation;
        const snapshotGain = snapshotValue - baseValue;
        
        const existingSnapshot = await prisma.portfolioSnapshot.findFirst({
          where: {
            userId: primaryUser.id,
            householdId: household.id,
            portfolioId: saved.id,
            asOf: snapshotDate,
          },
        });
        
        if (!existingSnapshot) {
          await prisma.portfolioSnapshot.create({
            data: {
              userId: primaryUser.id,
              householdId: household.id,
              portfolioId: saved.id,
              totalValue: money(snapshotValue),
              gainAmount: money(snapshotGain),
              gainPercent: new Prisma.Decimal(((snapshotGain / baseValue) * 100).toFixed(2)),
              asOf: snapshotDate,
            },
          });
        }
      }
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
