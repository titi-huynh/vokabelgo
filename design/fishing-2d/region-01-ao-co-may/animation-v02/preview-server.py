"""Local static preview with HTTP byte ranges for scrubbing the reference video."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parent
class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def send_head(self):
        self.byte_range=None
        target=Path(self.translate_path(self.path)).resolve()
        if not target.is_relative_to(ROOT):
            self.send_error(403);return None
        if not target.is_file():return super().send_head()
        size=target.stat().st_size
        start,end=0,size-1
        requested=self.headers.get('Range')
        if requested:
            match=re.fullmatch(r'bytes=(\d*)-(\d*)',requested.strip())
            if not match or not any(match.groups()):
                self.send_error(416);return None
            a,z=match.groups()
            if a:
                start=int(a);end=min(int(z),size-1) if z else size-1
            else:
                start=max(0,size-int(z));end=size-1
            if start> end or start>=size:
                self.send_response(416);self.send_header('Content-Range',f'bytes */{size}');self.send_header('Content-Length','0');self.end_headers();return None
            self.byte_range=(start,end)
        stream=target.open('rb')
        self.send_response(206 if requested else 200)
        self.send_header('Content-Type',self.guess_type(str(target)))
        self.send_header('Accept-Ranges','bytes')
        self.send_header('Content-Length',str(end-start+1))
        if requested:self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
        self.send_header('Last-Modified',self.date_time_string(target.stat().st_mtime))
        self.end_headers();stream.seek(start);return stream
    def copyfile(self,source,outputfile):
        if self.byte_range is None:return super().copyfile(source,outputfile)
        remaining=self.byte_range[1]-self.byte_range[0]+1
        while remaining:
            chunk=source.read(min(65536,remaining))
            if not chunk:break
            outputfile.write(chunk);remaining-=len(chunk)
    def log_message(self,*args):pass

if __name__=='__main__':
    ThreadingHTTPServer(('127.0.0.1',3012),PreviewHandler).serve_forever()
