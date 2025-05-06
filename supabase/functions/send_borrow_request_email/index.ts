import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

function withCorsHeaders(response: Response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  return new Response(response.body, {
    status: response.status,
    headers,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return withCorsHeaders(new Response(null, { status: 200 }));
  }

  try {
    const { owner_id, owner_name, book_title, requester_name, requester_class } = await req.json();
    if (!owner_id || !book_title || !requester_name) {
      return withCorsHeaders(new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 }));
    }

    // Supabase client with Service Role
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Corrected: Use admin auth method
    const { data: user, error } = await supabase.auth.admin.getUserById(owner_id);

    if (error || !user?.user?.email) {
      return withCorsHeaders(new Response(JSON.stringify({ error: 'Owner email not found' }), { status: 404 }));
    }

    // Send email via ReSend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'KnowledgeShareOnline <noreply@knowledgeshare.online>',
        to: user.user.email,
        subject: `New Borrow Request: ${book_title}`,
        html: `
          <p>Hi ${owner_name || ''},</p>
          <p><strong>${requester_name}${requester_class ? ` (Class: ${requester_class})` : ''}</strong> has requested to borrow your book: <strong>${book_title}</strong>.</p>
          <p>Please log in to your account to approve or decline the request.</p>
          <p>Thanks,<br/>KnowledgeShareOnline</p>
        `,
      }),
    });

    const emailData = await emailRes.json();
    if (!emailRes.ok) {
      return withCorsHeaders(new Response(JSON.stringify({ error: 'Failed to send email', details: emailData }), { status: 500 }));
    }

    return withCorsHeaders(new Response(JSON.stringify({ success: true, emailData }), { status: 200 }));
  } catch (err) {
    return withCorsHeaders(new Response(JSON.stringify({ error: err.message }), { status: 500 }));
  }
});
