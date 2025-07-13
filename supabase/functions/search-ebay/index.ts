import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EbaySearchRequest {
  title: string;
  maxPrice?: number;
  category?: string;
}

interface EbayItem {
  title: string;
  price: number;
  url: string;
  image: string;
  condition: string;
  seller: string;
  shipping: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, maxPrice, category }: EbaySearchRequest = await req.json()

    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Title is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const ebayAppId = Deno.env.get('EBAY_APP_ID')
    if (!ebayAppId) {
      return new Response(
        JSON.stringify({ error: 'eBay App ID not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build eBay API request
    const params = new URLSearchParams({
      'OPERATION-NAME': 'findItemsByKeywords',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': ebayAppId,
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': '',
      'keywords': title,
      'paginationInput.entriesPerPage': '20',
      'sortOrder': 'PricePlusShippingLowest'
    })

    if (maxPrice) {
      params.append('itemFilter(0).name', 'MaxPrice')
      params.append('itemFilter(0).value', maxPrice.toString())
      params.append('itemFilter(0).paramName', 'Currency')
      params.append('itemFilter(0).paramValue', 'USD')
    }

    const ebayUrl = `https://svcs.ebay.com/services/search/FindingService/v1?${params.toString()}`

    console.log('Searching eBay for:', title)
    
    const response = await fetch(ebayUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`eBay API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Parse eBay response
    const searchResult = data.findItemsByKeywordsResponse?.[0]
    const items = searchResult?.searchResult?.[0]?.item || []

    const results: EbayItem[] = items.slice(0, 10).map((item: any) => ({
      title: item.title?.[0] || 'Unknown Title',
      price: parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || '0'),
      url: item.viewItemURL?.[0] || '',
      image: item.galleryURL?.[0] || '/placeholder.svg',
      condition: item.condition?.[0]?.conditionDisplayName?.[0] || 'Unknown',
      seller: item.sellerInfo?.[0]?.sellerUserName?.[0] || 'Unknown Seller',
      shipping: item.shippingInfo?.[0]?.shippingServiceCost?.[0]?.__value__ || 'Unknown'
    }))

    console.log(`Found ${results.length} items on eBay`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        items: results,
        totalResults: parseInt(searchResult?.paginationOutput?.[0]?.totalEntries?.[0] || '0')
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('eBay search error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to search eBay', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})