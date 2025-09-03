const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Route to getPlaidTransactions function
    if (pathname.includes('getPlaidTransactions')) {
      return handleGetPlaidTransactions(req);
    }

    // Route to getMarketData function
    if (pathname.includes('getMarketData')) {
      return handleGetMarketData(req);
    }

    // Default response
    return new Response(
      JSON.stringify({ error: "Function not found" }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  }
});

async function handleGetPlaidTransactions(req: Request) {
  // Mock transaction data that matches the expected format
  const mockTransactions = [
    {
      transaction_id: "mock_1",
      name: "Starbucks Coffee",
      amount: -4.50,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: ["Food and Drink", "Restaurants", "Coffee Shop"]
    },
    {
      transaction_id: "mock_2",
      name: "Salary Deposit",
      amount: 3500.00,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: ["Payroll", "Salary"]
    },
    {
      transaction_id: "mock_3",
      name: "Grocery Store",
      amount: -85.20,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: ["Shops", "Supermarkets and Groceries"]
    },
    {
      transaction_id: "mock_4",
      name: "Gas Station",
      amount: -45.00,
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: ["Transportation", "Gas Stations"]
    },
    {
      transaction_id: "mock_5",
      name: "Netflix Subscription",
      amount: -15.99,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: ["Entertainment", "Subscription"]
    },
    {
      transaction_id: "mock_6",
      name: "Freelance Payment",
      amount: 800.00,
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: ["Deposit", "Freelance"]
    },
    {
      transaction_id: "mock_7",
      name: "Rent Payment",
      amount: -1200.00,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: ["Payment", "Rent"]
    },
    {
      transaction_id: "mock_8",
      name: "Pharmacy",
      amount: -25.50,
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: ["Healthcare", "Pharmacy"]
    }
  ];

  return new Response(
    JSON.stringify(mockTransactions),
    {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      }
    }
  );
}

async function handleGetMarketData(req: Request) {
  const body = await req.json();
  const symbol = body?.symbol || 'AAPL';

  // Mock market data
  const mockData = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    mockData.push({
      date: date.toISOString().split('T')[0],
      value: 150 + Math.random() * 20 - 10,
    });
  }

  return new Response(
    JSON.stringify(mockData),
    {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      }
    }
  );
}