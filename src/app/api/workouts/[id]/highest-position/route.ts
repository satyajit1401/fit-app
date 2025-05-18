import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workoutId = params.id;
    
    if (!workoutId) {
      return NextResponse.json({ error: 'Missing workout ID' }, { status: 400 });
    }
    
    // Get the highest position value
    const { data, error } = await supabase
      .from('workout_exercises')
      .select('position')
      .eq('workout_id', workoutId)
      .order('position', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error getting highest position:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    const position = data && data.length > 0 ? data[0].position : 0;
    
    return NextResponse.json({ position });
  } catch (error) {
    console.error('Error in highest-position API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 