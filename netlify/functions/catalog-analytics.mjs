import { getStore } from '@netlify/blobs';
import { authorizeAnalytics } from './_supabase-public.mjs';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Content-Type': 'application/json' };
const json = (statusCode, body) => ({ statusCode, headers: cors, body: JSON.stringify(body) });
const cleanId = value => String(value || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 120);

function aggregate(rows, startDate, endDate) {
  const start = startDate ? new Date(`${startDate}T00:00:00`).getTime() : 0;
  const end = endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : Number.MAX_SAFE_INTEGER;
  rows = rows.filter(row => { const t = new Date(row.lastSeen || row.firstSeen || 0).getTime(); return t >= start && t <= end; });
  const visitors = new Set(rows.map(x => x.visitorId).filter(Boolean));
  const clickMap = new Map(), buyMap = new Map();
  let views=0, clicks=0, revenue=0;
  for (const row of rows) {
    views += Number(row.pageViews || 0); revenue += Number(row.orderTotal || 0);
    for (const [id,p] of Object.entries(row.productClicks || {})) { const x=clickMap.get(id)||{id,name:p.name||'Produto',count:0}; x.count+=Number(p.count||0); clickMap.set(id,x); clicks+=Number(p.count||0); }
    for (const [id,p] of Object.entries(row.purchases || {})) { const x=buyMap.get(id)||{id,name:p.name||'Produto',quantity:0,revenue:0}; x.quantity+=Number(p.quantity||0); x.revenue+=Number(p.revenue||0); buyMap.set(id,x); }
  }
  const now=Date.now(); const cartRows=rows.filter(x=>Number(x.stage||0)>=3&&!x.completed);
  const abandonedCarts=cartRows.filter(x=>now-new Date(x.lastSeen||0).getTime()>30*60*1000).length;
  const activeCarts=cartRows.length-abandonedCarts; const orders=rows.filter(x=>x.completed).length;
  return { sessions:rows.length,views,visitors:visitors.size,productClickSessions:rows.filter(x=>x.stage>=2).length,productClicks:clicks,cartSessions:rows.filter(x=>x.stage>=3).length,checkoutSessions:rows.filter(x=>x.stage>=4).length,orders,conversionRate:rows.length?(orders/rows.length)*100:0,activeCarts,abandonedCarts,revenue,topClicked:Array.from(clickMap.values()).sort((a,b)=>b.count-a.count).slice(0,10),topBought:Array.from(buyMap.values()).sort((a,b)=>b.quantity-a.quantity||b.revenue-a.revenue).slice(0,10),funnel:{viewed:rows.length,clicked:rows.filter(x=>x.stage>=2).length,cart:rows.filter(x=>x.stage>=3).length,checkout:rows.filter(x=>x.stage>=4).length,purchased:orders}};
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode:204, headers:cors, body:'' };
  if (event.httpMethod !== 'POST') return json(405,{error:'Método não permitido.'});
  try {
    const body=JSON.parse(event.body||'{}'); const store=getStore({name:'suplementaai-catalog-analytics',consistency:'strong'});
    if (body.action==='record') {
      const state=body.state||{}; const franchiseId=cleanId(state.franchiseId); const sessionId=cleanId(state.sessionId);
      if (!franchiseId||!sessionId) return json(400,{error:'Sessão inválida.'});
      const safe={franchiseId,franchiseName:String(state.franchiseName||'').slice(0,120),visitorId:cleanId(state.visitorId),sessionId,firstSeen:String(state.firstSeen||new Date().toISOString()),lastSeen:String(state.lastSeen||new Date().toISOString()),pageViews:Math.max(0,Number(state.pageViews||0)),stage:Math.max(0,Math.min(5,Number(state.stage||0))),productClicks:state.productClicks&&typeof state.productClicks==='object'?state.productClicks:{},cartItems:Math.max(0,Number(state.cartItems||0)),cartValue:Math.max(0,Number(state.cartValue||0)),checkoutStarted:Boolean(state.checkoutStarted),completed:Boolean(state.completed),orderId:state.orderId?String(state.orderId).slice(0,150):undefined,orderTotal:Math.max(0,Number(state.orderTotal||0)),purchases:state.purchases&&typeof state.purchases==='object'?state.purchases:{}};
      await store.setJSON(`franchise/${franchiseId}/session/${sessionId}`,safe); return json(200,{success:true});
    }
    if (body.action==='report') {
      const franchiseId=cleanId(body.franchise_id); if(!franchiseId) return json(400,{error:'Franquia obrigatória.'});
      const auth = await authorizeAnalytics(event, franchiseId);
      if (!auth.ok) return json(auth.status || 403, { error: auth.error || 'Sem permissão.' });
      const listed=await store.list({prefix:`franchise/${franchiseId}/session/`});
      const blobs=(listed?.blobs||[]).slice(-5000);
      const rows=(await Promise.all(blobs.map(b=>store.get(b.key,{type:'json',consistency:'strong'}).catch(()=>null)))).filter(Boolean);
      return json(200,{success:true,report:aggregate(rows,body.start_date||null,body.end_date||null)});
    }
    return json(400,{error:'Ação desconhecida.'});
  } catch(error) { return json(500,{error:error?.message||'Erro ao processar métricas.'}); }
}
