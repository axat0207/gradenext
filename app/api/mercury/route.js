import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      "https://api.mercury.com/api/v1/account/ab121fa4-e084-11ef-b8ff-63bce457912b/transactions?limit=500&offset=0",
      {
        method: "GET",
        headers: {
          Authorization:
            "Bearer secret-token:mercury_production_wma_Fspk1bWKgHx8qyD22P2q1P9hLhSPJNf68gDZETip1pxyW_yrucrem",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch Mercury data' },
      { status: 500 }
    );
  }
}