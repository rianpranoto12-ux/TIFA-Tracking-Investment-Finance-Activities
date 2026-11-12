// Modul monitoring progres per pekerjaan; data tersimpan bersama backup TIFA.
const rup = n => 'Rp '+Number(n||0).toLocaleString('id-ID',{maximumFractionDigits:0});
const percent = n => Number(n||0).toFixed(2)+'%';
let activeJobId = '';
function jobItems(id){return db.workItems.filter(x=>x.jobId===id)}
function jobSeries(id){return db.scurve.filter(x=>x.jobId===id).sort((a,b)=>a.period.localeCompare(b.period))}
function calcPhysical(id){
 const items=jobItems(id),den=items.reduce((t,x)=>t+Number(x.qtyPlan||0)*Number(x.unitPrice||0),0);
 const num=items.reduce((t,x)=>t+Math.min(Math.max(0,Number(x.qtyActual||0)),Number(x.qtyPlan||0))*Number(x.unitPrice||0),0);
 return {items,den,num,pct:den>0?num/den*100:null};
}
function curveSvg(series){
 if(!series.length)return '<div class="empty">Belum ada periode Kurva S untuk pekerjaan ini.</div>';
 const w=850,h=310,l=52,r=22,t=22,b=55,px=i=>l+(series.length===1?(w-l-r)/2:i*(w-l-r)/(series.length-1)),py=v=>t+(100-Math.max(0,Math.min(100,Number(v)||0)))*(h-t-b)/100;
 const lines=[0,25,50,75,100].map(v=>`<line x1="${l}" x2="${w-r}" y1="${py(v)}" y2="${py(v)}" stroke="#e5edf5"/><text x="${l-10}" y="${py(v)+4}" text-anchor="end" fill="#627c91" font-size="12">${v}%</text>`).join('');
 const poly=(k,color)=>`<polyline fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" points="${series.map((s,i)=>`${px(i)},${py(s[k])}`).join(' ')}"/>`+series.map((s,i)=>`<circle cx="${px(i)}" cy="${py(s[k])}" r="4" fill="${color}"><title>${s.period}: ${percent(s[k])}</title></circle>`).join('');
 const labels=series.map((s,i)=>`<text x="${px(i)}" y="${h-b+22}" text-anchor="middle" font-size="11" fill="#627c91">${esc(s.period)}</text>`).join('');
 return `<div class="curvelegend"><span><i style="background:#087e9b"></i>Rencana kumulatif</span><span><i style="background:#e4a500"></i>Realisasi kumulatif</span></div><div class="chartwrap"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Kurva S rencana dan realisasi kumulatif per periode">${lines}${poly('planned','#087e9b')}${poly('actual','#e4a500')}${labels}</svg></div>`;
}
function renderProgress(){
 document.getElementById('title').textContent='Progres Fisik & Kurva S';
 document.getElementById('subtitle').textContent='Monitoring volume, bobot RAB, rencana dan realisasi kumulatif setiap pekerjaan';
 const rows=current(),selected=rows.some(r=>r.id===activeJobId)?activeJobId:(rows[0]?.id||'');activeJobId=selected;
 const opts=rows.map(r=>`<option value="${esc(r.id)}" ${r.id===selected?'selected':''}>${esc(`${r.type} ${r.year} · ${r.prk||'Tanpa PRK'} · ${r.name}`)}</option>`).join('');
 const phy=calcPhysical(selected),series=jobSeries(selected),latest=series.at(-1);
 const physical=phy.pct===null?'Belum ada RAB':percent(phy.pct);
 document.getElementById('metrics').innerHTML=metric('Jumlah pekerjaan (filter)',rows.length)+metric('Progres fisik berbobot',physical)+metric('Rencana kumulatif',latest?percent(latest.planned):'—')+metric('Deviasi Kurva S',latest?percent(latest.actual-latest.planned):'—');
 if(!selected){document.getElementById('content').innerHTML='<div class="empty">Belum ada pekerjaan sesuai filter. Tambahkan pekerjaan pada menu AI/AO terlebih dahulu.</div>';return}
 const job=rows.find(r=>r.id===selected);
 const detail=phy.items.map((x,i)=>{
 const val=Number(x.qtyPlan||0)*Number(x.unitPrice||0),weight=phy.den?val/phy.den*100:0,contrib=weight*Math.min(1,Math.max(0,Number(x.qtyActual||0))/Math.max(Number(x.qtyPlan||0),1e-12));
 return `<tr><td>${i+1}</td><td class="long">${esc(x.description)}</td><td>${esc(x.unit)}</td><td>${Number(x.qtyPlan).toLocaleString('id-ID')}</td><td>${Number(x.qtyActual).toLocaleString('id-ID')}</td><td>${rup(x.unitPrice)}</td><td>${rup(val)}</td><td>${percent(weight)}</td><td>${percent(contrib)}</td><td><button data-edit-item="${esc(x.id)}" class="outline">Ubah</button> <button data-delete-item="${esc(x.id)}" class="outline">Hapus</button></td></tr>`;
 }).join('');
 const srows=series.map(x=>`<tr><td>${esc(x.period)}</td><td>${percent(x.planned)}</td><td>${percent(x.actual)}</td><td>${percent(x.actual-x.planned)}</td><td>${esc(x.notes||'—')}</td><td><button data-edit-period="${esc(x.id)}" class="outline">Ubah</button> <button data-delete-period="${esc(x.id)}" class="outline">Hapus</button></td></tr>`).join('');
 document.getElementById('content').innerHTML=`<div class="jobselector"><label>Pilih pekerjaan<select id="jobPick">${opts}</select></label><div><b>${esc(job.name)}</b><p>${esc(job.ulp||'—')} · ${esc(job.vendor||'—')} · ${esc(job.contract||'—')}</p></div></div>
 <div class="progressHead"><h2>Rincian RAB & Bobot Fisik</h2><button id="addItem">+ Item pekerjaan</button></div><p class="explain">Bobot = nilai item ÷ total nilai RAB × 100%. Kontribusi progres = bobot × min(realisasi volume ÷ rencana volume, 100%).</p>
 <div class="tablewrap"><table><thead><tr><th>No.</th><th>Uraian</th><th>Satuan</th><th>Volume Rencana</th><th>Volume Aktual</th><th>Harga Satuan</th><th>Nilai RAB</th><th>Bobot</th><th>Kontribusi</th><th>Aksi</th></tr></thead><tbody>${detail||'<tr><td colspan="10" class="empty">Belum ada item RAB.</td></tr>'}</tbody></table></div>
 <div class="progressHead"><h2>Kurva S per Pekerjaan</h2><button id="addPeriod">+ Periode</button></div><p class="explain">Rencana dan realisasi merupakan persentase kumulatif yang dicatat per bulan. Angka realisasi Kurva S tidak otomatis disamakan dengan bobot fisik RAB.</p>
 ${curveSvg(series)}
 <div class="tablewrap"><table><thead><tr><th>Periode</th><th>Rencana</th><th>Realisasi</th><th>Deviasi</th><th>Catatan</th><th>Aksi</th></tr></thead><tbody>${srows||'<tr><td colspan="6" class="empty">Belum ada data bulanan.</td></tr>'}</tbody></table></div>`;
 document.getElementById('jobPick').onchange=e=>{activeJobId=e.target.value;renderProgress()};
 document.getElementById('addItem').onclick=()=>editItem();
 document.getElementById('addPeriod').onclick=()=>editPeriod();
 document.querySelectorAll('[data-edit-item]').forEach(b=>b.onclick=()=>editItem(b.dataset.editItem));
 document.querySelectorAll('[data-edit-period]').forEach(b=>b.onclick=()=>editPeriod(b.dataset.editPeriod));
 document.querySelectorAll('[data-delete-item]').forEach(b=>b.onclick=()=>{if(confirm('Hapus item RAB ini?')){db.workItems=db.workItems.filter(x=>x.id!==b.dataset.deleteItem);save();renderProgress()}});
 document.querySelectorAll('[data-delete-period]').forEach(b=>b.onclick=()=>{if(confirm('Hapus periode ini?')){db.scurve=db.scurve.filter(x=>x.id!==b.dataset.deletePeriod);save();renderProgress()}});
}
function editItem(id){
 const x=db.workItems.find(v=>v.id===id)||{description:'',unit:'unit',qtyPlan:0,qtyActual:0,unitPrice:0};
 const desc=prompt('Uraian item pekerjaan:',x.description);if(desc===null)return;if(!desc.trim())return alert('Uraian wajib diisi');
 const unit=prompt('Satuan:',x.unit);if(unit===null)return;
 const plan=prompt('Volume rencana:',x.qtyPlan);if(plan===null)return;
 const actual=prompt('Volume realisasi:',x.qtyActual);if(actual===null)return;
 const price=prompt('Harga satuan (Rp):',x.unitPrice);if(price===null)return;
 const vals=[plan,actual,price].map(Number);if(vals.some(v=>!Number.isFinite(v)||v<0)||vals[0]===0)return alert('Volume rencana harus > 0 dan angka tidak boleh negatif.');
 if(id)Object.assign(x,{description:desc.trim(),unit,qtyPlan:vals[0],qtyActual:vals[1],unitPrice:vals[2]});
 else db.workItems.push({id:crypto.randomUUID(),jobId:activeJobId,description:desc.trim(),unit,qtyPlan:vals[0],qtyActual:vals[1],unitPrice:vals[2]});
 save();renderProgress();
}
function editPeriod(id){
 const x=db.scurve.find(v=>v.id===id)||{period:new Date().toISOString().slice(0,7),planned:0,actual:0,notes:''};
 const period=prompt('Periode YYYY-MM:',x.period);if(period===null)return;
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(period))return alert('Periode harus YYYY-MM.');
 if(db.scurve.some(v=>v.jobId===activeJobId&&v.period===period&&v.id!==id))return alert('Periode sudah ada.');
 const plan=prompt('Rencana kumulatif (%) 0–100:',x.planned);if(plan===null)return;
 const actual=prompt('Realisasi kumulatif (%) 0–100:',x.actual);if(actual===null)return;
 const vals=[plan,actual].map(Number);if(vals.some(v=>!Number.isFinite(v)||v<0||v>100))return alert('Persentase harus 0–100.');
 const notes=prompt('Catatan periode (opsional):',x.notes);if(notes===null)return;
 if(id)Object.assign(x,{period,planned:vals[0],actual:vals[1],notes});
 else db.scurve.push({id:crypto.randomUUID(),jobId:activeJobId,period,planned:vals[0],actual:vals[1],notes});
 save();renderProgress();
}
