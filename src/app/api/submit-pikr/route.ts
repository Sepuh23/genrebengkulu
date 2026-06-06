import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      nama,
      ttl,
      asal_pikr,
      alamat_lengkap,
      tlpn,
      email,
      jabatan_pikr,
      bukti_ss
    } = body

    // Validate required fields
    if (!nama || !asal_pikr || !alamat_lengkap || !jabatan_pikr) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert into database
    const { data, error } = await supabase
      .from('pik_r_submissions')
      .insert({
        nama,
        ttl: ttl || null,
        asal_pikr,
        alamat_lengkap,
        tlpn: tlpn || null,
        email: email || null,
        jabatan_pikr,
        bukti_ss: bukti_ss || null
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to submit form' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Form submitted successfully', data },
      { status: 201 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
