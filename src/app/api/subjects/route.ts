// src/app/api/subjects/route.ts
// API route để lấy danh sách môn học

import { NextRequest, NextResponse } from 'next/server';
import { getAllSubjects, getSubjectsByGrade } from '@/lib/db/models/subject';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get('gradeId');
    
    let subjects;
    if (gradeId) {
      subjects = await getSubjectsByGrade(Number(gradeId));
    } else {
      subjects = await getAllSubjects();
    }
    
    // Ensure subjects is always an array
    const subjectsArray = Array.isArray(subjects) ? subjects : (subjects ? [subjects] : []);
    
    return NextResponse.json({
      success: true,
      subjects: subjectsArray
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách môn học' },
      { status: 500 }
    );
  }
}
