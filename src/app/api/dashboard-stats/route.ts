import { NextResponse } from 'next/server';
import { getAggregatedData } from '@/lib/stats';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        if (!start || !end) {
            return NextResponse.json({ error: "Dates manquantes" }, { status: 400 });
        }

        const data = await getAggregatedData(new Date(start), new Date(end));
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("CRASH API DASHBOARD:", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message 
        }, { status: 500 });
    }
}