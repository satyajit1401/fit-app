import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workoutId = params.id;
    
    if (!workoutId) {
      return NextResponse.json({ error: 'Missing workout ID' }, { status: 400 });
    }
    
    const requestData = await request.json();
    console.log('Received exercise update request:', requestData);
    
    if (!requestData || !Array.isArray(requestData.exercises)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    const exercises = requestData.exercises;
    
    // Process each exercise update individually
    const results = [];
    let anyFailed = false;
    
    for (const exercise of exercises) {
      if (!exercise.id) {
        results.push({ error: 'Missing exercise ID', exercise });
        anyFailed = true;
        continue;
      }
      
      const { data, error } = await supabase
        .from('workout_exercises')
        .update({
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          sets_data: exercise.sets_data
        })
        .eq('id', exercise.id)
        .eq('workout_id', workoutId) // Extra safety check
        .select();
      
      if (error) {
        console.error(`Error updating exercise ${exercise.id}:`, error);
        results.push({ error: error.message, exerciseId: exercise.id });
        anyFailed = true;
      } else {
        results.push({ success: true, exerciseId: exercise.id, data });
      }
    }
    
    if (anyFailed) {
      return NextResponse.json({ 
        status: 'partial', 
        message: 'Some updates failed', 
        results 
      }, { status: 207 });
    }
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'All exercises updated successfully',
      results
    });
  } catch (error) {
    console.error('Error in update-exercise API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 