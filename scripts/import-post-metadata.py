from html import unescape
from pathlib import Path
import re
r=Path(__file__).resolve().parents[1]; s=(r/'_reference/posts.html').read_text(encoding='utf-8')
for a in re.findall(r'<article class="article-card">(.*?)</article>',s,re.S):
 l=re.search(r'<a href="(/posts/(\d{4})/(\d{2})/([^/]+)/)">(.*?)</a>',a,re.S); t=re.search(r'<time datetime="([^"]+)">',a)
 if not l or not t: continue
 url,y,m,slug,title=l.groups(); p=r/'content/posts'/y/m/slug/'index.md'
 if p.exists(): continue
 clean=lambda x:unescape(re.sub(r'<[^>]+>','',x)).strip()
 sm=re.search(r'</header>\s*<p>(.*?)</p>',a,re.S); desc=clean(sm.group(1)) if sm else ''
 dm=re.match(r'(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}:\d{2}))?',t.group(1)); date=dm.group(1)+'T'+(dm.group(2) or '00:00:00')+'-06:00'
 def vals(kind):
  b=re.search(r'<b>'+kind+r':</b>(.*?)(?:</div>|$)',a,re.S)
  return [clean(x) for x in re.findall(r'<li>\s*<a[^>]*>(.*?)</a>',b.group(1),re.S)] if b else []
 q=lambda x:'"'+x.replace('"','\\"')+'"'; p.parent.mkdir(parents=True,exist_ok=True)
 p.write_text('---\n'+'title: '+q(clean(title))+'\n'+'date: '+date+'\n'+'description: '+q(desc)+'\n'+'tags: ['+', '.join(map(q,vals('Tags')))+']\n'+'series: ['+', '.join(map(q,vals('Series')))+']\n---\n',encoding='utf-8')
