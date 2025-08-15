import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface SendQuoteRequest {
  quote_id: string;
  method: 'email' | 'whatsapp';
  email?: string;
  phone?: string;
  client_name?: string;
  company_name?: string;
}

serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request
    const { data } = await req.json();
    const sendRequest = data as SendQuoteRequest;
    
    if (!sendRequest.quote_id || !sendRequest.method) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get quote data
    const { data: quoteData, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', sendRequest.quote_id)
      .single();
      
    if (quoteError || !quoteData) {
      return new Response(
        JSON.stringify({ error: 'Quote not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Update quote with client info if provided
    if (sendRequest.client_name || sendRequest.company_name || sendRequest.email || sendRequest.phone) {
      const updateData: any = {};
      if (sendRequest.client_name) updateData.client_name = sendRequest.client_name;
      if (sendRequest.company_name) updateData.company_name = sendRequest.company_name;
      if (sendRequest.email) updateData.email = sendRequest.email;
      if (sendRequest.phone) updateData.phone = sendRequest.phone;
      
      const { error: updateError } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', sendRequest.quote_id);
        
      if (updateError) {
        console.error('Error updating quote:', updateError);
      }
    }
    
    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-ZA', { 
        style: 'currency', 
        currency: 'ZAR' 
      }).format(amount);
    };
    
    // Send via email
    if (sendRequest.method === 'email' && sendRequest.email) {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (!resendApiKey) {
        return new Response(
          JSON.stringify({ error: 'Email service not configured' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      const emailHtml = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
              <h1 style="color: #2563eb; margin-bottom: 20px;">MLH Transport - Quote</h1>
              
              <p><strong>Date:</strong> ${new Date().toLocaleString('en-ZA')}</p>
              <p><strong>Client:</strong> ${sendRequest.client_name || 'N/A'}</p>
              <p><strong>Company:</strong> ${sendRequest.company_name || 'N/A'}</p>
              
              <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
              
              <h2 style="color: #2563eb; font-size: 18px;">Route Details</h2>
              <p><strong>Pickup:</strong> ${quoteData.pickup_address}</p>
              <p><strong>Drop-off:</strong> ${quoteData.dropoff_address}</p>
              <p><strong>Distance:</strong> ${quoteData.visible_km.toFixed(1)} km</p>
              
              <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
              
              <h2 style="color: #2563eb; font-size: 18px;">Quote Summary</h2>
              <p><strong>Base distance cost:</strong> ${formatCurrency(quoteData.base_km_cost)}</p>
              <p><strong>Driver cost:</strong> ${formatCurrency(quoteData.driver_cost)}</p>
              <p><strong>Extra time cost:</strong> ${formatCurrency(quoteData.extra_time_cost)}</p>
              <p><strong>Subtotal (ex VAT):</strong> ${formatCurrency(quoteData.price_ex_vat)}</p>
              <p><strong>VAT:</strong> ${formatCurrency(quoteData.price_inc_vat - quoteData.price_ex_vat)}</p>
              <p style="font-size: 20px; font-weight: bold; color: #2563eb;">
                <strong>Total (inc VAT):</strong> ${formatCurrency(quoteData.price_inc_vat)}
              </p>
              
              <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
              
              <p style="font-size: 14px; color: #666;">
                Thank you for choosing MLH Transport. For any questions, please contact us.
              </p>
              <p style="font-size: 14px; color: #666;">
                Quote reference: ${quoteData.id}
              </p>
            </div>
          </body>
        </html>
      `;
      
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'MLH Transport <quotes@mlhtransport.co.za>',
          to: sendRequest.email,
          subject: 'Your MLH Transport Quote',
          html: emailHtml,
        })
      });
      
      const emailResult = await emailResponse.json();
      
      if (!emailResponse.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to send email', details: emailResult }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, method: 'email', details: emailResult }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Send via WhatsApp
    if (sendRequest.method === 'whatsapp' && sendRequest.phone) {
      const whatsappToken = Deno.env.get('WHATSAPP_TOKEN');
      const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_ID');
      
      if (!whatsappToken || !whatsappPhoneId) {
        return new Response(
          JSON.stringify({ error: 'WhatsApp service not configured' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Format phone number (remove spaces, ensure it starts with country code)
      let phoneNumber = sendRequest.phone.replace(/\s+/g, '');
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '27' + phoneNumber.substring(1);
      }
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+' + phoneNumber;
      }
      
      const messageText = `
*MLH Transport - Quote*

Date: ${new Date().toLocaleString('en-ZA')}
Client: ${sendRequest.client_name || 'N/A'}
Company: ${sendRequest.company_name || 'N/A'}

*Route Details*
Pickup: ${quoteData.pickup_address}
Drop-off: ${quoteData.dropoff_address}
Distance: ${quoteData.visible_km.toFixed(1)} km

*Quote Summary*
Base distance cost: ${formatCurrency(quoteData.base_km_cost)}
Driver cost: ${formatCurrency(quoteData.driver_cost)}
Extra time cost: ${formatCurrency(quoteData.extra_time_cost)}
Subtotal (ex VAT): ${formatCurrency(quoteData.price_ex_vat)}
VAT: ${formatCurrency(quoteData.price_inc_vat - quoteData.price_ex_vat)}
*Total (inc VAT): ${formatCurrency(quoteData.price_inc_vat)}*

Thank you for choosing MLH Transport. For any questions, please contact us.
Quote reference: ${quoteData.id}
      `;
      
      const whatsappResponse = await fetch(`https://graph.facebook.com/v17.0/${whatsappPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${whatsappToken}`
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: {
            body: messageText
          }
        })
      });
      
      const whatsappResult = await whatsappResponse.json();
      
      if (!whatsappResponse.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to send WhatsApp message', details: whatsappResult }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, method: 'whatsapp', details: whatsappResult }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid send method or missing contact information' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});