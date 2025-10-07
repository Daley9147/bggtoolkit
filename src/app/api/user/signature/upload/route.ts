import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('files[]') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      const filePath = `public/${session.user.id}/${uuidv4()}-${file.name}`;
      const { error } = await supabase.storage
        .from('signatures')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading to Supabase Storage:', error);
        throw new Error(`Failed to upload ${file.name}`);
      }

      const { data } = supabase.storage
        .from('signatures')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    });

    const urls = await Promise.all(uploadPromises);

    // Jodit expects a specific JSON structure
    return NextResponse.json({
      success: true,
      files: urls.map(url => ({ url })),
    });

  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
